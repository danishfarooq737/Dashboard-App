# DF DevMetrics — API Analytics & Monitoring Dashboard

A production-grade, zero-trust SaaS telemetry dashboard built with the **MERN** stack (MongoDB, Express, React, Node.js), Tailwind CSS, Framer Motion, and Recharts. Developers can register microservices, generate cryptographically secure API keys, and monitor real-time request counts, response latency, and error rates.

---

## ⚡ Architecture Highlights & Zero-Trust Security

- **Session Security:** JWT session tokens stored strictly in `HttpOnly`, `Secure`, and `SameSite` cookies to prevent XSS exfiltration.
- **API Key Cryptography:** API keys use the `dm_live_` format with 192 bits of cryptographic entropy (`crypto.randomBytes(24)`). Only irreversible **SHA-256 hashes** are persisted in MongoDB. Key verification uses `crypto.timingSafeEqual` against side-channel timing attacks.
- **OWASP Top 10 Protections:** Recursive NoSQL query injection sanitization (stripping `$` and `.` operators), Helmet HTTP security headers, CORS origin whitelisting, and strict payload size limits.
- **Rate Limiting & Resilience:** Differentiated `express-rate-limit` policies for authentication, general API queries, and telemetry ingestion.
- **Global Silent Error Handler:** Detailed errors and stack traces are logged server-side only; client responses are sanitized to prevent information leakage.
- **Live Ingestion Telemetry Simulator:** Built-in interactive simulator right inside the dashboard allowing one-click single or burst telemetry dispatch without external curl scripts.

---

## 📁 Repository Structure

```text
devmetrics/
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── seed.js
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       │   ├── db.js
│       │   └── env.js
│       ├── controllers/
│       │   ├── analyticsController.js
│       │   ├── apiController.js
│       │   ├── authController.js
│       │   └── ingestController.js
│       ├── middlewares/
│       │   ├── apiKeyMiddleware.js
│       │   ├── authMiddleware.js
│       │   ├── errorHandler.js
│       │   ├── rateLimiter.js
│       │   ├── sanitize.js
│       │   └── validator.js
│       ├── models/
│       │   ├── ApiEndpoint.js
│       │   ├── MetricLog.js
│       │   └── User.js
│       ├── routes/
│       │   ├── analyticsRoutes.js
│       │   ├── apiRoutes.js
│       │   ├── authRoutes.js
│       │   └── ingestRoutes.js
│       ├── services/
│       │   ├── analyticsService.js
│       │   ├── apiService.js
│       │   └── authService.js
│       ├── utils/
│       │   ├── cryptoUtils.js
│       │   └── logger.js
│       └── validators/
│           ├── apiValidators.js
│           ├── authValidators.js
│           └── ingestValidators.js
├── frontend/
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vercel.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── api/
│       │   └── client.js
│       ├── components/
│       │   ├── ApiListWidget.jsx
│       │   ├── BentoCard.jsx
│       │   ├── EndpointModal.jsx
│       │   ├── LatencyChart.jsx
│       │   ├── LoadingSkeleton.jsx
│       │   ├── MetricCard.jsx
│       │   ├── Navbar.jsx
│       │   ├── RequestVolumeChart.jsx
│       │   ├── Sidebar.jsx
│       │   ├── StatusBadge.jsx
│       │   └── TestSimulatorModal.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       └── pages/
│           ├── AuthPage.jsx
│           ├── DashboardPage.jsx
│           ├── EndpointsPage.jsx
│           ├── LogsPage.jsx
│           └── SecurityPage.jsx
└── README.md
```

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/devmetrics`) or MongoDB Atlas URI

### 2. Backend Installation & Database Seeding

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Seed the database with demo users, 3 microservices, and 200+ historical metrics
node seed.js

# Start backend server
npm run dev
# Server will run on http://localhost:5000
```

### 3. Frontend Installation & Startup

```bash
# In a separate terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
# Frontend will run on http://localhost:5173
```

### 4. Demo Login Credentials
- **Email:** `alex@devmetrics.io` (or click "Autofill Demo Credentials" on the login screen)
- **Password:** `Password123!`
