// ============================================================
// server.js — Application entry point
// ------------------------------------------------------------
// Responsibilities:
//   - Import the configured Express app from src/app.js
//   - Start the HTTP server on the configured port
//
// This file does NOT:
//   - Configure middleware
//   - Define routes
//   - Contain business logic
//   - Handle requests
//
// All application setup lives in src/app.js.
// All business logic lives in src/services/.
// ============================================================

import app from './src/app.js'
import { config } from './src/config/config.js'

app.listen(config.port, () => {
  console.log(`Kernaq Identity — Node/Express backend running on http://localhost:${config.port}`)
  console.log(`  POST http://localhost:${config.port}/verify`)
  console.log(`  GET  http://localhost:${config.port}/verifications`)
  console.log(`  GET  http://localhost:${config.port}/health`)
})
