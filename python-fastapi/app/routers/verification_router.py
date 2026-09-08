# ============================================================
# app/routers/verification_router.py
# ------------------------------------------------------------
# HTTP endpoints for all verification-related routes.
#
# Why does the router exist?
# The router handles HTTP concerns only:
#   - receiving the request
#   - reading files and form fields
#   - basic validation
#   - calling the service
#   - returning the HTTP response
#
# The router does NOT:
#   - call the Kernaq SDK directly
#   - manage the in-memory store
#   - contain business logic
#
# Why APIRouter instead of putting routes in app.py?
# APIRouter lets us group related routes together and mount
# them in app.py cleanly. As the app grows, each feature
# gets its own router file.
#
# Flow:
#   HTTP Request
#         ↓
#   verification_router.py   ← you are here
#         ↓
#   verification_service.py
# ============================================================

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, File, Form, UploadFile, HTTPException

from app.services import verification_service

router = APIRouter()


@router.post("/verify")
async def handle_verify(
    document:      UploadFile = File(...),
    selfie:        UploadFile = File(...),
    video:         Optional[UploadFile] = File(None),
    document_type: str = Form("national_id"),
    country:       str = Form("KEN"),
    reference:     Optional[str] = Form(None),
):
    """
    POST /verify
    Accepts document + selfie + optional video from the frontend.
    Runs KYC verification and returns the result.
    """
    # Generate reference if not provided
    if not reference:
        reference = f"demo_{int(datetime.now().timestamp() * 1000)}"

    # Read file bytes — HTTP concern handled here in the router
    document_bytes = await document.read()
    selfie_bytes   = await selfie.read()
    video_bytes    = await video.read() if video else None

    try:
        # Hand off to the service — router's job ends here
        record = await verification_service.verify(
            document_bytes=document_bytes,
            selfie_bytes=selfie_bytes,
            video_bytes=video_bytes,
            document_type=document_type,
            country=country,
            reference=reference,
        )
        return record
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/verifications")
def handle_get_verifications():
    """
    GET /verifications
    Returns all verification records stored in memory this session.
    """
    all_records = verification_service.get_all()
    return {
        "verifications": all_records,
        "total":         len(all_records),
    }


@router.get("/health")
def handle_health():
    """
    GET /health
    Simple health check — confirms the server is running.
    """
    return {"status": "ok", "service": "kernaq-python-fastapi-sample"}
