# 🚀 SFHacks Spring 2026

A full-stack web application monorepo — ready to build whatever your team dreams up at the hackathon!

---

## 📁 Project Structure

```
SFHacks-Spring-2026/
├── .github/
│   ├── workflows/         # GitHub Actions CI pipeline
│   ├── ISSUE_TEMPLATE/    # Bug report & feature request templates
│   └── pull_request_template.md
├── client/                # React + TypeScript frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route-level page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── utils/         # Helper utilities
│   └── ...
├── server/                # Node.js + Express + TypeScript backend
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── middleware/    # Express middleware
│   │   └── controllers/   # Business logic
│   └── ...
├── .env.example           # Environment variable template
├── docker-compose.yml     # Local development with Docker
└── package.json           # Root workspace (npm workspaces)
```

---

## 🛠 Tech Stack

| Layer    | Technology                                    |
|----------|-----------------------------------------------|
| Frontend | React 18, TypeScript, Vite, React Router v6   |
| Backend  | Node.js 20, Express 4, TypeScript             |
| Database | PostgreSQL 16 (via Docker)                    |
| Testing  | Vitest, React Testing Library                 |
| Linting  | ESLint, Prettier                              |
| CI/CD    | GitHub Actions                                |
| Dev Env  | Docker Compose                                |

---

## ⚡ Quick Start (Local — No Docker)

### Prerequisites
- **Node.js** ≥ 20 ([download](https://nodejs.org/))
- **npm** ≥ 10 (bundled with Node.js)
- **PostgreSQL** ≥ 14 (optional for DB features)

### 1. Clone & install dependencies

```bash
git clone https://github.com/shokhabbos-mukhammatov/SFHacks-Spring-2026.git
cd SFHacks-Spring-2026

# Install root + workspace dependencies
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Start both servers simultaneously

```bash
npm run dev
```

| Service  | URL                         |
|----------|-----------------------------|
| Frontend | http://localhost:5173       |
| Backend  | http://localhost:3001       |
| API docs | http://localhost:3001/api/health |

---

## 🐳 Quick Start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

| Service    | URL                    |
|------------|------------------------|
| Frontend   | http://localhost:5173  |
| Backend    | http://localhost:3001  |
| PostgreSQL | localhost:5432         |

---

## 🧪 Running Tests

```bash
# All tests
npm test

# Client tests only
cd client && npm test

# Server tests only
cd server && npm test

# With coverage
npm run test:coverage  # in client/ or server/
```

---

## 🔍 Linting & Formatting

```bash
# Lint both workspaces
npm run lint

# Check formatting
npm run format:check

# Auto-fix formatting
npm run format
```

---

## 📦 Building for Production

```bash
npm run build
```

Outputs:
- `client/dist/` — static frontend assets
- `server/dist/` — compiled JavaScript

---

## 🌿 Git Workflow

```
main        ← stable, production-ready
develop     ← integration branch
feature/*   ← new features
fix/*       ← bug fixes
```

1. Branch off `develop`
2. Open a PR to `develop`
3. PR to `main` for production deploys

---

## 🤝 Contributing

1. Fork / branch from `develop`
2. Make your changes
3. Run `npm run lint && npm test` — make sure everything passes
4. Open a PR using the template

---

## 📄 License

MIT
