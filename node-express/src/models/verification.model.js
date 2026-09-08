// ============================================================
// src/models/verification.model.js
// ------------------------------------------------------------
// Defines the shape of a verification record.
// Used by the service to build a record from the Kernaq result.
// Keeping this in one place means if the shape changes,
// we only change it here — nothing else needs updating.
// ============================================================

import { randomUUID } from 'node:crypto'

/**
 * Creates a verification record from a Kernaq SDK result.
 * Maps SDK camelCase field names to the snake_case names
 * the frontend and developer guide expect.
 *
 * @param {object} result   - The raw result from the Kernaq SDK
 * @param {string} reference - The reference ID for this verification
 * @returns {object} A verification record ready to store and return
 */
export function createVerificationRecord(result, reference) {
  return {
    id:              randomUUID(),
    verification_id: result.verificationId ?? null,
    reference,
    verdict:         result.verdict,
    score:           result.score,
    face_match:      result.faceMatch,
    is_live:         result.livenessPass,
    document_fields: result.documentFields
      ? {
          name:            result.documentFields.name            ?? null,
          date_of_birth:   result.documentFields.dateOfBirth     ?? null,
          document_number: result.documentFields.documentNumber  ?? null,
          expiry_date:     result.documentFields.expiryDate      ?? null,
        }
      : {},
    created_at: new Date().toISOString(),
  }
}
