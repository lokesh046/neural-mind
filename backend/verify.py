import asyncio
import json
from app.database import SessionLocal, Base, engine
from app import models, executor

# A correct implementation of positional encoding
CORRECT_CODE = """import numpy as np

def positional_encoding(seq_len, d_model, base=10000.0):
    PE = np.zeros((seq_len, d_model))
    for pos in range(seq_len):
        for i in range(d_model // 2):
            denom = base ** (2 * i / d_model)
            PE[pos, 2 * i] = np.sin(pos / denom)
            PE[pos, 2 * i + 1] = np.cos(pos / denom)
    return PE.tolist()
"""

# A wrong implementation (returning zeros)
WRONG_CODE = """import numpy as np

def positional_encoding(seq_len, d_model, base=10000.0):
    return np.zeros((seq_len, d_model)).tolist()
"""

# A syntax/runtime error implementation
BUGGY_CODE = """def positional_encoding(seq_len, d_model, base=10000.0):
    # Missing variable or indentation
    return undefined_variable_name
"""

async def run_tests():
    db = SessionLocal()
    
    # 1. Fetch positional encoding problem
    problem = db.query(models.Problem).filter(models.Problem.title.like("%Positional Encoding%")).first()
    if not problem:
        print("Error: Seeding might have failed. Could not find Positional Encoding challenge in DB.")
        return

    print(f"Loaded problem: {problem.title} (ID: {problem.id})")
    print(f"Number of test cases: {len(problem.test_cases)}")
    for tc in problem.test_cases:
        print(f" - Test case (Public={tc.is_public}): Input={tc.input_json}, Expected={tc.expected_output[:60]}...")

    # Create a dummy user
    user = db.query(models.User).filter(models.User.email == "test@example.com").first()
    if not user:
        user = models.User(email="test@example.com", username="testuser", hashed_password="dummy_password")
        db.add(user)
        db.commit()
        db.refresh(user)

    async def test_solution(code_str: str, expected_status: str, label: str):
        submission = models.Submission(
            user_id=user.id,
            problem_id=problem.id,
            code=code_str,
            status="pending"
        )
        db.add(submission)
        db.commit()
        db.refresh(submission)
        
        print(f"\n--- Testing {label} ---")
        status, error_msg = await executor.execute_submission(db, submission)
        print(f"Resulting Status: {status}")
        if error_msg:
            print(f"Error Message: {error_msg}")
            
        if status == expected_status:
            print(f"SUCCESS: {label} returned expected status '{expected_status}'.")
            return True
        else:
            print(f"FAILED: {label} returned '{status}', but expected '{expected_status}'.")
            return False

    success_correct = await test_solution(CORRECT_CODE, "accepted", "CORRECT SOLUTION")
    success_wrong = await test_solution(WRONG_CODE, "wrong_answer", "WRONG SOLUTION")
    success_buggy = await test_solution(BUGGY_CODE, "runtime_error", "BUGGY SOLUTION")

    print("\n=== INTEGRATION TEST SUMMARY ===")
    if success_correct and success_wrong and success_buggy:
        print("ALL TESTS PASSED! Execution engine works perfectly.")
    else:
        print("SOME TESTS FAILED! Check outputs above.")

if __name__ == "__main__":
    asyncio.run(run_tests())
