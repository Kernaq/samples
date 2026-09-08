# ============================================================
# app/middleware/cors.py
# ------------------------------------------------------------
# CORS middleware configuration.
#
# CORS (Cross-Origin Resource Sharing) allows the frontend
# running on port 5173 to call this backend on port 4000.
# Without this the browser blocks the request.
#
# Why separate:
# In production you would restrict origins to your frontend
# domain only. One place to change it.
# ============================================================

from fastapi.middleware.cors import CORSMiddleware


def add_cors_middleware(app):
    """
    Registers CORS middleware on the FastAPI app.
    Call this once during app setup in app.py.
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
