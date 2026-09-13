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

import { Kernaq } from '@kernaq/identity'
import { config } from '../config/config.js'
import { createVerificationRecord } from '../models/verification.model.js'
import * as verificationRepository from '../repositories/verification.repository.js'

// Initialize the Kernaq SDK once — reused for all requests
const kernaq = new Kernaq({ apiKey: config.kernaqApiKey })

/**
 * Runs a KYC verification using the Kernaq SDK.
 * Stores the result in the repository and returns it.
 *
 * @param {object} files   - Uploaded file buffers: { document, selfie, video }
 * @param {object} fields  - Text fields: { documentType, country, reference }
 * @returns {object} The verification record
 */
export async function verify(files, fields) {
  const { documentType, country, reference } = fields

  // Call the Kernaq API — this is the core business operation
  const result = await kernaq.verify.run({
    document:     files.document,
    selfie:       files.selfie,
    video:        files.video ?? undefined,
    documentType,
    country,
  })

  // Build a structured record from the raw SDK result
  const record = createVerificationRecord(result, reference)

  // Save to the repository (in-memory store)
  verificationRepository.save(record)

  return record
}

/**
 * Returns all verifications stored in memory.
 * @returns {object[]} Array of all verification records
 */
export function getAll() {
  return verificationRepository.findAll()
}
