# Kernaq Identity — Vite + React Frontend

Drop-in KYC verification UI built with Vite and React. Uses the `@kernaq/verify` Web Component.

## Setup

```bash
cp .env.example .env    # set VITE_BACKEND_URL to your chosen backend
npm install
npm run dev             # http://localhost:5173
```

Point `VITE_BACKEND_URL` at whichever backend you started:
- Node.js (Express): `http://localhost:4000`
- Python (FastAPI): `http://localhost:4000`
- Go (Gin): `http://localhost:4000`
- Java (Spring): `http://localhost:4000`

All backends expose the same API — just swap the URL.
