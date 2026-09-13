// ============================================================
// src/app.js — Express application setup
// ------------------------------------------------------------
// Responsibilities:
//   - Create the Express application instance
//   - Register middleware (CORS, JSON parser)
//   - Mount routes
//
// Why separate from server.js?
// app.js configures WHAT the application does.
// server.js controls WHEN and WHERE it runs (port, startup).
//
// This separation means:
//   - Tests can import app.js without starting a real server
//   - server.js stays minimal — just starts the app
//   - Middleware and routing changes go here, not in server.js
// ============================================================

import express from 'express'
import { corsMiddleware } from './middleware/cors.js'
import verificationRouter from './routes/verification.routes.js'

// Create the Express application
const app = express()

// --- Middleware ---
// CORS must be registered before routes so it applies to all requests
app.use(corsMiddleware)

// Parse incoming JSON request bodies
app.use(express.json())

// --- Routes ---
// Mount the verification router at the root path
// All routes defined in verification.routes.js are available directly:
//   POST /verify
//   GET  /verifications
//   GET  /health
app.use('/', verificationRouter)

export default app
