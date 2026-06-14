import ast
import json
import os
import sys
import httpx
import asyncio
import logging
from typing import List, Dict, Any, Tuple
from app import models, judge
from app.config import settings

logger = logging.getLogger("executor")

def get_entrypoint_function(starter_code: str) -> str:
    """Parses the starter code to find the first top-level function definition name."""
    try:
        tree = ast.parse(starter_code)
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                return node.name
    except Exception as e:
        logger.error(f"Error parsing starter code: {e}")
    return None

def wrap_code(user_code: str, entrypoint_name: str) -> str:
    """Wraps user code with a driver script that reads JSON from stdin, calls the entrypoint, and prints JSON output."""
    return f"""# --- USER CODE START ---
{user_code}
# --- USER CODE END ---

import json
import sys

class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        try:
            import numpy as np
            if isinstance(obj, np.ndarray):
                return obj.tolist()
            if isinstance(obj, np.generic):
                return obj.item()
        except ImportError:
            pass
        return super().default(obj)

def main():
    try:
        # Read inputs from stdin
        input_str = sys.stdin.read()
        if not input_str.strip():
            print("Error: Stdin is empty.", file=sys.stderr)
            sys.exit(1)
        input_data = json.loads(input_str)
        
        # Invoke the function
        if not hasattr(sys.modules['__main__'], '{entrypoint_name}'):
            print("Error: Function '{entrypoint_name}' not found.", file=sys.stderr)
            sys.exit(1)
            
        res = {entrypoint_name}(**input_data)
        
        # Print output as JSON to stdout
        print(json.dumps(res, cls=NumpyEncoder))
    except Exception as e:
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
"""

def run_local_subprocess(source_code: str, stdin_data: str) -> Dict[str, Any]:
    """Fallback execution runner using a local Python subprocess."""
    import subprocess
    import tempfile
    
    fd, path = tempfile.mkstemp(suffix=".py")
    try:
        with os.fdopen(fd, 'w', encoding='utf-8') as f:
            f.write(source_code)
        
        proc = subprocess.run(
            [sys.executable, path],
            input=stdin_data,
            text=True,
            capture_output=True,
            timeout=40.0  # 40 seconds time limit for heavy ML libraries (torch/sentence_transformers)
        )
        
        if proc.returncode == 0:
            return {"status_id": 3, "stdout": proc.stdout, "stderr": ""}
        else:
            return {"status_id": 11, "stdout": proc.stdout, "stderr": proc.stderr}
    except subprocess.TimeoutExpired:
        return {"status_id": 5, "stdout": "", "stderr": "Time Limit Exceeded (5s)"}
    except Exception as e:
        return {"status_id": 11, "stdout": "", "stderr": str(e)}
    finally:
        try:
            os.remove(path)
        except OSError:
            pass

async def run_judge0(source_code: str, stdin_data: str) -> Dict[str, Any]:
    """Submits code to Judge0 and polls the status until complete."""
    # Ensure correct base URL format
    base_url = settings.JUDGE0_URL.rstrip("/")
    
    headers = {}
    if settings.JUDGE0_API_KEY:
        if "rapidapi" in base_url.lower():
            headers = {
                "X-RapidAPI-Key": settings.JUDGE0_API_KEY,
                "X-RapidAPI-Host": base_url.split("//")[-1].split("/")[0],
                "Content-Type": "application/json"
            }
        else:
            headers = {
                "Authorization": f"Bearer {settings.JUDGE0_API_KEY}",
                "Content-Type": "application/json"
            }
    
    # 71 is the language ID for Python (3.8.1) in Judge0
    payload = {
        "source_code": source_code,
        "language_id": 71,
        "stdin": stdin_data
    }
    
    async with httpx.AsyncClient() as client:
        try:
            # 1. Submit the code
            submit_url = f"{base_url}/submissions?base64_encoded=false&wait=false"
            res = await client.post(submit_url, json=payload, headers=headers, timeout=10.0)
            if res.status_code not in (200, 201):
                logger.error(f"Judge0 submission failed: {res.status_code} - {res.text}")
                return {"status_id": 11, "stdout": "", "stderr": f"Judge0 Error: {res.text}"}
            
            token = res.json().get("token")
            if not token:
                return {"status_id": 11, "stdout": "", "stderr": "Judge0 response missing token"}
            
            # 2. Poll until completion (status IDs: 1 = In Queue, 2 = Processing)
            poll_url = f"{base_url}/submissions/{token}?base64_encoded=false"
            for _ in range(15):  # Max 15 attempts, 15 seconds
                await asyncio.sleep(1.0)
                poll_res = await client.get(poll_url, headers=headers, timeout=5.0)
                if poll_res.status_code != 200:
                    continue
                
                res_data = poll_res.json()
                status_id = res_data.get("status", {}).get("id")
                
                if status_id not in (1, 2):
                    # Done processing
                    stdout = res_data.get("stdout") or ""
                    stderr = res_data.get("stderr") or ""
                    compile_output = res_data.get("compile_output") or ""
                    
                    return {
                        "status_id": status_id,
                        "stdout": stdout,
                        "stderr": stderr if stderr else compile_output
                    }
            
            return {"status_id": 5, "stdout": "", "stderr": "Time Limit Exceeded in polling Judge0"}
            
        except Exception as e:
            logger.error(f"Error calling Judge0: {e}")
            return {"status_id": 11, "stdout": "", "stderr": f"Executor Exception: {str(e)}"}

async def execute_submission(db_session, submission: models.Submission) -> Tuple[str, str]:
    """
    Executes the user's code against all test cases for the problem.
    Updates the submission status and returns (final_status, error_message).
    """
    problem = submission.problem
    entrypoint = get_entrypoint_function(problem.starter_code)
    
    if not entrypoint:
        return "runtime_error", "Internal Error: Could not determine starter code entrypoint function."
    
    wrapped_code = wrap_code(submission.code, entrypoint)
    test_cases = problem.test_cases
    
    if not test_cases:
        return "accepted", ""
    
    use_judge0 = bool(settings.JUDGE0_URL)
    
    for tc in test_cases:
        # Serialize the inputs to JSON format
        stdin_data = json.dumps(tc.input_json)
        
        # Execute code
        if use_judge0:
            result = await run_judge0(wrapped_code, stdin_data)
        else:
            # Fallback to local subprocess execution
            result = run_local_subprocess(wrapped_code, stdin_data)
            
        status_id = result.get("status_id")
        stdout = result.get("stdout") or ""
        stderr = result.get("stderr") or ""
        
        # Parse Status
        if status_id == 3:  # Accepted execution (exit code 0)
            # Compare stdout output against expected_output
            is_correct, comparison_msg = judge.compare_outputs(stdout, tc.expected_output)
            if not is_correct:
                return "wrong_answer", comparison_msg
        elif status_id == 5:  # Time Limit Exceeded
            return "time_limit_exceeded", "Time Limit Exceeded on test case."
        else:  # Runtime error / compiler error / etc.
            return "runtime_error", stderr if stderr else "Runtime error occurred during execution."
            
    return "accepted", ""
