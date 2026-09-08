# ============================================================
# app/repositories/verification_repository.py
# ------------------------------------------------------------
# Manages the in-memory store for verification records.
#
# Why a repository even without a database?
# The repository isolates data access from business logic.
# Right now storage is a plain Python list in RAM.
# If we ever switch to a real database, only this file changes.
# The service and router never need to know how data is stored.
#
# In-memory behavior:
# The list resets to empty every time the server restarts.
# This is intentional — the Kernaq guide requires it.
# ============================================================

from typing import List

# The in-memory store — a plain list that lives in RAM
_verifications: List[dict] = []


def save(record: dict) -> dict:
    """
    Saves a verification record to the in-memory store.

    Args:
        record: The verification record to save

    Returns:
        The saved record
    """
    _verifications.append(record)
    return record


def find_all() -> List[dict]:
    """
    Returns all verification records stored in memory.

    Returns:
        List of all verification records
    """
    return _verifications
