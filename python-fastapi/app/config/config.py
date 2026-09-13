# ============================================================
# app/config/config.py
# ------------------------------------------------------------
# Loads environment variables from .env and exports them.
# Every other file that needs config imports from here.
# Nothing else reads os.environ directly.
#
# Why this exists:
# Centralising configuration means if an env variable name
# changes, there is one place to update it.
# The API key is never hardcoded and never printed/logged.
# ============================================================

import os
from dotenv import load_dotenv

# Load .env file into os.environ
load_dotenv()

KERNAQ_API_KEY: str = os.environ.get("KERNAQ_API_KEY", "")
PORT: int = int(os.environ.get("PORT", "4000"))

if not KERNAQ_API_KEY:
    raise RuntimeError("KERNAQ_API_KEY is missing. Add it to your .env file.")
