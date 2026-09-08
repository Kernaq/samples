# ============================================================
# app/app.py — FastAPI application setup
# ------------------------------------------------------------
# Responsibilities:
#   - Create the FastAPI application instance
#   - Register middleware (CORS)
#   - Include routers
#
# Why separate from main.py?
# app.py configures WHAT the application does.
# main.py controls HOW it starts (uvicorn entry point).
#
# This separation means:
#   - Tests can import app.py without starting a real server
#   - main.py stays minimal — just the uvicorn entry point
#   - Middleware and routing changes go here, not in main.py
# ============================================================

from fastapi import FastAPI

from app.middleware.cors import add_cors_middleware
from app.routers.verification_router import router as verification_router

# Create the FastAPI application instance
app = FastAPI(title="Kernaq Identity — Python/FastAPI Sample")

# Register middleware
# CORS must be added before routes so it applies to all requests
add_cors_middleware(app)

# Include routers
# All routes from verification_router are mounted at the root path
app.include_router(verification_router)
