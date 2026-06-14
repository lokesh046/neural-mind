import json
import math
from typing import Any, Tuple

def recursive_approx_equal(a: Any, b: Any, rel_tol: float = 1e-4, abs_tol: float = 1e-4) -> bool:
    """Recursively check equality with float tolerance support."""
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return math.isclose(float(a), float(b), rel_tol=rel_tol, abs_tol=abs_tol)
    
    if isinstance(a, list) and isinstance(b, list):
        if len(a) != len(b):
            return False
        return all(recursive_approx_equal(x, y, rel_tol, abs_tol) for x, y in zip(a, b))
    
    if isinstance(a, dict) and isinstance(b, dict):
        if set(a.keys()) != set(b.keys()):
            return False
        return all(recursive_approx_equal(a[k], b[k], rel_tol, abs_tol) for k in a)
    
    # Fallback to string comparison for other types
    return str(a).strip() == str(b).strip()

def compare_outputs(actual: str, expected: str) -> Tuple[bool, str]:
    """
    Compares the actual output from code execution with the expected output.
    Attempts to parse as JSON first to support complex structures and float tolerances.
    """
    actual_stripped = actual.strip()
    expected_stripped = expected.strip()

    if actual_stripped == expected_stripped:
        return True, "Outputs match exactly."

    # Try parsing both as JSON
    actual_json = None
    expected_json = None
    
    try:
        expected_json = json.loads(expected_stripped)
    except json.JSONDecodeError:
        pass

    try:
        actual_json = json.loads(actual_stripped)
    except json.JSONDecodeError:
        pass

    # If both parsed as JSON, do a deep compare with tolerance
    if expected_json is not None and actual_json is not None:
        try:
            if recursive_approx_equal(actual_json, expected_json):
                return True, "Outputs match (JSON matched with tolerance)."
            else:
                return False, f"Output mismatch.\nExpected: {expected_stripped}\nGot: {actual_stripped}"
        except Exception as e:
            return False, f"Error comparing structures: {str(e)}"
    
    # If expected was JSON, but actual failed to parse, check if actual matches stripped string
    if expected_json is not None and actual_json is None:
        return False, f"Expected JSON format output.\nExpected: {expected_stripped}\nGot raw: {actual_stripped}"

    # Standard string comparison
    if actual_stripped == expected_stripped:
        return True, "Outputs match."
    
    return False, f"Output mismatch.\nExpected: {expected_stripped}\nGot: {actual_stripped}"
