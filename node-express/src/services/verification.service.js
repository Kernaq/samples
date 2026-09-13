// ============================================================
// src/services/verification.service.js
// ------------------------------------------------------------
// Business logic for identity verification.
//
// Why does the service exist?
// The service contains the "what the application does" logic.
// It knows about Kernaq, about building records, about saving them.
// It does NOT know about HTTP — no req, no res, no status codes.
// This makes the logic reusable and easy to test independently.
//
// Flow:
//   verification.handler.js
//         ↓
//   verification.service.js   ← you are here
//         ↓
//   Kernaq SDK → Kernaq API
//         ↓
//   verification.repository.js
// ============================================================

import { Kernaq, KernaqError } from '@kernaq/identity'
import { config } from '../config/config.js'
import { createVerificationRecord } from '../models/verification.model.js'
import * as verificationRepository from '../repositories/verification.repository.js'

// Initialize the Kernaq SDK once — reused for all requests
const kernaq = new Kernaq({ apiKey: config.kernaqApiKey })

export async function verify(files, fields) {
  const { documentType, country, reference } = fields

  let result
  try {
    // Call the Kernaq sandbox API — same pipeline as production, no billing
    result = await kernaq.verify.sandbox({
      document:     files.document,
      selfie:       files.selfie,
      video:        files.video ?? undefined,
      documentType,
      country,
    })
  } catch (err) {
    // HTTP 422 = pipeline ran but verification failed (face mismatch, bad doc, etc.)
    // The SDK throws but attaches the full response body — build a real record from it.
    if (!(err instanceof KernaqError) || err.statusCode !== 422) {
      throw err
    }
    const body = err.body ?? {}
    const record = createVerificationRecord(body, reference)
    verificationRepository.save(record)
    return record
  }

  // Build a structured record from the raw SDK result
  const record = createVerificationRecord(result, reference)
  verificationRepository.save(record)
  return record
}

export function getAll() {
  return verificationRepository.findAll()
}
