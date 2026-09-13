// ============================================================
// src/middleware/cors.js
// ------------------------------------------------------------
// CORS middleware configuration.
//
// CORS (Cross-Origin Resource Sharing) allows the frontend
// running on port 5173 to call this backend on port 4000.
// Without this the browser would block the request.
//
// Keeping this in its own file means if CORS rules ever need
// to change (e.g. restrict to specific origins in production),
// there is one place to update it.
// ============================================================

import cors from 'cors'

// Allow all origins for this sample app.
// In production you would restrict this to your frontend's domain.
export const corsMiddleware = cors()
