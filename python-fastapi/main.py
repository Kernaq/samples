# ============================================================
# main.py — Application entry point
# ------------------------------------------------------------
# Responsibilities:
#   - Import the configured FastAPI app from app/app.py
#   - Serve as the uvicorn entry point
#
# Run with:
#   uvicorn main:app --port 4000 --reload
#
# This file does NOT:
#   - Configure middleware
#   - Define routes
#   - Contain business logic
#   - Handle requests
#
# All application setup lives in app/app.py.
# All business logic lives in app/services/.
# ============================================================

from app.app import app  # noqa: F401 — uvicorn needs this import
