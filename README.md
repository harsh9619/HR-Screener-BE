# Candidate Screener Backend

A high-performance Node.js, Express, and TypeScript backend service for the **HR Candidate Screener** application. This service powers resume ingestion, automated parsing, role requirement evaluation, and an **AI Integrity Check Pipeline** designed to detect resume manipulation (e.g., hidden text, prompt injection, timeline anomalies).

---

## 🚀 Key Features

- **🔐 Authentication & User Management**: Secure JWT-based auth with password hashing using `bcryptjs`.
- **💼 Job Roles & Requirements**: Create and manage job postings with granular "must-have" and "nice-to-have" skill requirements.
- **📄 Resume Parsing**: Support for extracting content from `.pdf` (via `pdf-parse`), `.docx` (via `mammoth`), and raw text resumes.
- **🛡️ AI Integrity Pipeline**: Automated detection of hidden white text, microscopic font exploits, prompt injection attempts, and conflicting career timelines.
- **📊 Dynamic Scoring Engine**: Automated candidate-to-role matching algorithm that computes fit scores, requirement coverage, and candidate summary reports.
- **🗄️ PostgreSQL Persistence**: Relational database architecture using standard SQL schemas, automated table initialization, and database seeding.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (`>= 22.0.0`)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via `pg` client)
- **Security**: JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), CORS
- **Parsing Utilities**: `pdf-parse`, `mammoth`
- **Validation**: Zod schema validation
- **Dev Tooling**: `ts-node-dev`, `typescript`

---

## 📁 Project Structure

```text
backend/
├── src/
│   ├── db/                     # Database connection pool, schema initialization, and seed data
│   │   ├── index.ts            # DB connection & auto-table creation logic
│   │   ├── schema.sql          # PostgreSQL DDL table schemas
│   │   └── seed.ts             # Initial mock data seeding script
│   ├── middleware/             # Express middlewares (Authentication, validation, error handling)
│   ├── modules/                # Feature-based modular architecture
│   │   ├── auth/               # User signup, login, and token validation
│   │   ├── roles/              # Job roles and requirement rules
│   │   ├── candidates/         # Candidate submissions and resume parser integration
│   │   ├── integrity/          # Resume integrity inspection pipeline
│   │   └── scoring/            # Candidate fit score engine
│   └── index.ts                # Express application entry point & CORS configuration
├── .env.example                # Template for required environment variables
├── package.json                # Project dependencies and npm scripts
└── tsconfig.json               # TypeScript compiler configuration
```

---

## ⚙️ Prerequisites

Before running the backend, ensure you have installed:
- [Node.js](https://nodejs.org/) (Version 22.x or higher)
- [PostgreSQL](https://www.postgresql.org/) (Running locally or via a cloud provider like Supabase/Neon)

---

## 💻 Getting Started

### 1. Installation

Navigate to the `backend` directory and install dependencies:

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and update the configuration variables:

```bash
cp .env.example .env
```

Configure the following variables in `.env`:

```env
# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:5173

# PostgreSQL Database Configuration
DATABASE_URL=postgres://postgres:postgres@localhost:5432/candidate_screener
PGHOST=localhost
PGPORT=5432
PGDATABASE=candidate_screener
PGUSER=postgres
PGPASSWORD=admin123

# Authentication
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Database Initialization & Seeding

The application automatically creates required PostgreSQL tables on startup using `src/db/schema.sql`.

To populate the database with mock roles and candidate data for development/testing, run:

```bash
npm run seed
```

### 4. Running the Development Server

Start the development server with live reload:

```bash
npm run dev
```

The server will start at `http://localhost:5000`.

---

## 📜 NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the server in development mode using `ts-node-dev` (auto-reload on code changes). |
| `npm run build` | Compiles TypeScript code to `dist/` and copies database schemas. |
| `npm start` | Runs the compiled production code from `dist/index.js`. |
| `npm run seed` | Executes `src/db/seed.ts` to seed initial roles, candidates, and scores into PostgreSQL. |

---

## 🔗 Key API Endpoints

### 🩺 System Health
- `GET /api/health` - Health check status endpoint.

### 🔑 Authentication (`/api/auth`)
- `POST /api/auth/login` - Authenticate user and receive JWT.

### 💼 Roles Management (`/api/roles`)
- `GET /api/roles` - Get all job roles.
- `POST /api/roles` - Create a new job role with requirement rules.
- `GET /api/roles/:id` - Fetch details for a specific role.
- `PUT /api/roles/:id` - Update job role or requirements.
- `DELETE /api/roles/:id` - Remove a job role.

### 🧑‍💼 Candidates & Screening (`/api`)
- `GET /api/roles/:roleId/candidates` - List all candidates applied for a role.
- `POST /api/roles/:roleId/candidates` - Upload & parse candidate resume for evaluation.
- `GET /api/candidates/:id` - Get candidate analysis breakdown (Scores, Integrity flags).
- `DELETE /api/candidates/:id` - Delete candidate record.

---

## 🛡️ License

This project is licensed under the MIT License.
