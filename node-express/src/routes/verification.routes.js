// ============================================================
// src/routes/verification.routes.js
// ------------------------------------------------------------
// Defines all verification-related HTTP routes.
//
// Why this exists:
// Routes connect a URL + HTTP method to a handler function.
// Keeping them in a dedicated file means:
//   - app.js stays clean (just mounts the router)
//   - All verification endpoints are visible in one place
//   - Adding a new endpoint means adding one line here
//
// This file does NOT contain handler logic or business logic.
// It only wires URLs to the right handler functions.
//
// Routes defined here:
//   POST /verify         → handleVerify
//   GET  /verifications  → handleGetVerifications
//   GET  /health         → handleHealth
// ============================================================

import { Router } from 'express'
import {
  uploadMiddleware,
  handleVerify,
  handleGetVerifications,
  handleHealth,
} from '../handlers/verification.handler.js'

const router = Router()

// POST /verify
// Accepts: document (file), selfie (file), video (file optional),
//          document_type, country, reference (text fields)
// Returns: verification result JSON
router.post('/verify', uploadMiddleware, handleVerify)

// GET /verifications
// Returns: all verification records stored in memory this session
router.get('/verifications', handleGetVerifications)

// GET /health
// Returns: { status: 'ok', service: '...' }
router.get('/health', handleHealth)

export default router
