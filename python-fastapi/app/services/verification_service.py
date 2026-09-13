# ============================================================
# app/services/verification_service.py
# ------------------------------------------------------------
# Business logic for identity verification.
#
# Why does the service exist?
# The service contains the "what the application does" logic.
# It knows about Kernaq, about building records, about saving them.
# It does NOT know about HTTP — no Request, no Response objects.
# This makes the logic reusable and independently testable.
#
# Flow:
#   verification_router.py
#         ↓
#   verification_service.py   ← you are here
#         ↓
#   Kernaq SDK → Kernaq API
#         ↓
#   verification_repository.py
# ============================================================

from typing import Optional
from datetime import datetime

from kernaq import Kernaq

from app.config.config import KERNAQ_API_KEY
from app.models.verification import create_verification_record
from app.repositories import verification_repository

# Initialize the Kernaq SDK once — reused for all requests
_client = Kernaq(api_key=KERNAQ_API_KEY)


async def verify(
    document_bytes: bytes,
    selfie_bytes:   bytes,
    video_bytes:    Optional[bytes],
    document_type:  str,
    country:        str,
    reference:      str,
) -> dict:
    """
    Runs a KYC verification using the Kernaq SDK.
    Stores the result in the repository and returns it.

    Args:
        document_bytes: Raw bytes of the ID document photo
        selfie_bytes:   Raw bytes of the selfie photo
        video_bytes:    Raw bytes of the liveness video (optional)
        document_type:  Document type e.g. 'national_id'
        country:        Country code e.g. 'KEN'
        reference:      Caller-supplied reference ID

    Returns:
        The verification record dict
    """
    # Call the Kernaq API — this is the core business operation
    result = _client.verify.run(
        document=document_bytes,
        selfie=selfie_bytes,
        video=video_bytes,
        document_type=document_type,
        country=country,
    )

    # Build a structured record from the raw SDK result
    record = create_verification_record(result, reference)

    # Save to the repository (in-memory store)
    verification_repository.save(record)

    return record


def get_all() -> list:
    """
    Returns all verifications stored in memory.

    Returns:
        List of all verification records
    """
    return verification_repository.find_all()
