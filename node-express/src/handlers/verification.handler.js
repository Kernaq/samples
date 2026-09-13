// ============================================================
// src/handlers/verification.handler.js
// ------------------------------------------------------------
// HTTP handlers for all verification-related endpoints.
//
// Why does the handler exist?
// The handler deals with HTTP-specific concerns only:
//   - reading files and fields from the request
//   - basic validation (are the required files present?)
//   - calling the service with clean data
//   - sending the HTTP response
//   - handling HTTP errors
//
// The handler does NOT:
//   - call the Kernaq SDK directly
//   - manage the in-memory store
//   - contain business logic
//
// Flow:
//   HTTP Request
//         ↓
//   verification.handler.js   ← you are here
//         ↓
//   verification.service.js
// ============================================================

import multer from 'multer'
import * as verificationService from '../services/verification.service.js'

// multer stores uploaded files in RAM as buffers (not saved to disk)
const upload = multer({ storage: multer.memoryStorage() })

// multer middleware for the /verify endpoint
// Accepts three file fields: document (required), selfie (required), video (optional)
export const uploadMiddleware = upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'selfie',   maxCount: 1 },
  { name: 'video',    maxCount: 1 },
])

/**
 * POST /verify
 * Receives document + selfie + optional video from the frontend,
 * runs KYC verification, returns the result.
 */
export async function handleVerify(req, res) {
  try {
    const files = req.files

    // Basic validation — document and selfie are required
    if (!files?.document || !files?.selfie) {
      return res.status(400).json({ error: 'document and selfie files are required' })
    }

    // Extract file buffers
    const fileBuffers = {
      document: files.document[0].buffer,
      selfie:   files.selfie[0].buffer,
      video:    files.video?.[0]?.buffer ?? null,
    }

    // Extract text fields with sensible defaults
    const fields = {
      documentType: req.body.document_type || 'national_id',
      country:      req.body.country       || 'KEN',
      reference:    req.body.reference     || `demo_${Date.now()}`,
    }

    // Hand off to the service — handler's job ends here
    const record = await verificationService.verify(fileBuffers, fields)

    res.json(record)
  } catch (err) {
    console.error('Verification error:', err)
    res.status(422).json({ error: err.message || 'Verification failed' })
  }
}

/**
 * GET /verifications
 * Returns all verification records stored in memory this session.
 */
export function handleGetVerifications(_req, res) {
  const all = verificationService.getAll()
  res.json({
    verifications: all,
    total:         all.length,
  })
}

/**
 * GET /health
 * Simple health check — confirms the server is running.
 */
export function handleHealth(_req, res) {
  res.json({ status: 'ok', service: 'kernaq-node-express-sample' })
}
