# Kernaq Identity — Sample Applications

Full working sample apps showing how to integrate [Kernaq Identity](https://kernaq.com) into your product. Each backend connects the Vite frontend to the Kernaq Identity API using the official SDK.

## What each sample does

1. User opens the Vite frontend and clicks **Verify Identity**
2. The `<kernaq-verify>` drop-in component handles document capture, selfie, and liveness
3. The frontend posts captures to the **sample backend** at `/verify`
4. The backend calls the Kernaq Identity API using the official SDK
5. The result (verdict, document fields, score) is stored **in memory** and returned to the frontend
6. The frontend shows the verdict and a history table of all verifications in this session

## Structure

```
examples/
  web-vite/          Vite + React frontend — works with any backend below
  node-express/      Express.js backend  (@kernaq/identity)
  python-fastapi/    FastAPI backend      (kernaq-identity)
  go-gin/            Gin backend          (github.com/Kernaq/SDKs/identity/go)
  java-spring/       Spring Boot backend  (com.github.Kernaq:SDKs)
```

## Quick start

### 1. Pick a backend and start it

**Node.js (Express)**
```bash
cd node-express
cp .env.example .env          # add your KERNAQ_API_KEY
npm install
npm start                     # starts on :4000
```

**Python (FastAPI)**
```bash
cd python-fastapi
cp .env.example .env          # add your KERNAQ_API_KEY
pip install -r requirements.txt
uvicorn main:app --port 4000 --reload
```

**Go (Gin)**
```bash
cd go-gin
cp .env.example .env          # add your KERNAQ_API_KEY
go run main.go                # starts on :4000
```

**Java (Spring Boot)**
```bash
cd java-spring
cp .env.example .env          # add your KERNAQ_API_KEY
mvn spring-boot:run           # starts on :4000
```

### 2. Start the Vite frontend

```bash
cd web-vite
cp .env.example .env          # set VITE_BACKEND_URL=http://localhost:4000
npm install
npm run dev                   # opens on :5173
```

### 3. Get a sandbox API key

Sign up at [kernaq.com/dashboard](https://kernaq.com/dashboard). Sandbox keys start with `k_test_` and never charge your account.

## API contract

All backends expose the same two endpoints:

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/verify` | Accepts `multipart/form-data` with `document`, `selfie`, `video`, `document_type`, `country`, `reference`. Returns verification result. |
| `GET`  | `/verifications` | Returns all verifications stored in memory this session. |

## Notes

- Data is stored in memory — it resets when you restart the server. This is intentional to keep the samples dependency-free.
- Use `k_test_` keys for sandbox mode — no billing.
- For production, replace the in-memory store with your database and use `k_live_` keys.

## Links

- [Documentation](https://kernaq.com/docs)
- [API Reference](https://documentation.kernaq.com/identity)
- [Dashboard](https://kernaq.com/dashboard)
