# ============================================================
# app/models/verification.py
# ------------------------------------------------------------
# Defines the shape of a verification record.
# Used by the service to build a record from the Kernaq result.
#
# Why this exists:
# The shape of a verification record is defined in one place.
# If a field needs to change, update it here only.
# The service does not need to know how to build a record —
# it just calls create_verification_record().
# ============================================================

import uuid
from datetime import datetime, timezone


def create_verification_record(result, reference: str) -> dict:
    """
    Builds a verification record from a Kernaq SDK result.
    Maps SDK snake_case fields to the format the frontend expects.

    Args:
        result:    The result object returned by client.verify.run()
        reference: The reference ID for this verification

    Returns:
        A dict representing the verification record
    """
    doc_fields = {}
    if result.document_fields:
        doc_fields = {
            "name":            result.document_fields.name,
            "date_of_birth":   result.document_fields.date_of_birth,
            "document_number": result.document_fields.document_number,
            "expiry_date":     result.document_fields.expiry_date,
        }

    return {
        "id":              str(uuid.uuid4()),
        "verification_id": result.verification_id,
        "reference":       reference,
        "verdict":         result.verdict,
        "score":           result.score,
        "face_match":      result.face_match,
        "is_live":         result.liveness_pass,
        "document_fields": doc_fields,
        "created_at":      datetime.now(timezone.utc).isoformat(),
    }
