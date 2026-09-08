// ============================================================
// src/repositories/verification.repository.js
// ------------------------------------------------------------
// Manages the in-memory store for verification records.
//
// Why a repository even without a database?
// The repository pattern isolates data access from business logic.
// Right now we store in memory (a plain array).
// If we ever switch to a real database, only this file changes.
// The service and handler never need to know how data is stored.
// ============================================================

// The in-memory store — a plain array that lives in RAM.
// Resets to empty every time the server restarts (intentional).
const verifications = []

/**
 * Saves a verification record to the in-memory store.
 * @param {object} record - The verification record to save
 * @returns {object} The saved record
 */
export function save(record) {
  verifications.push(record)
  return record
}

/**
 * Returns all verification records stored in memory.
 * @returns {object[]} Array of all verification records
 */
export function findAll() {
  return verifications
}
