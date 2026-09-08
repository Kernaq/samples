// ============================================================
// src/config/config.js
// ------------------------------------------------------------
// Loads environment variables from .env and exports them.
// Every other file that needs config imports from here —
// nothing else calls process.env directly.
//
// Why this exists:
// Centralising configuration means if an env variable name
// changes, or a new one is added, there is one place to update.
// The API key is read here and passed to the SDK in the service.
// It is never hardcoded and never printed/logged.
// ============================================================

import 'dotenv/config'

if (!process.env.KERNAQ_API_KEY) {
  throw new Error('KERNAQ_API_KEY is missing. Add it to your .env file.')
}

export const config = {
  kernaqApiKey: process.env.KERNAQ_API_KEY,
  port: Number(process.env.PORT) || 4000,
}
