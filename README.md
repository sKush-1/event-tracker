# Mini Event Tracker

A full-stack web application for managing personal events, built with modern technologies as part of a Full-Stack Developer 48-Hour Challenge.

## Tech Stack

| Layer | Technology | Reasoning |
|-------|-----------|-----------|
| **Backend** | Node.js + Express 5 | Mature, minimal-overhead REST framework |
| **ORM / DB** | Prisma 7 + PostgreSQL | Type-safe queries, easy migrations, great DX |
| **Auth** | JWT (jsonwebtoken) | Stateless, header-based — fits the requirement exactly |
| **Validation** | Zod | Schema-first, excellent TypeScript integration |
| **Frontend** | React 19 + Vite + TypeScript | Fast dev server, strong typing, modern component model |
| **Routing** | React Router v6 | Nested routes, code-splitting friendly |
| **HTTP Client** | Axios | Interceptors for auth tokens; simpler than raw fetch |
| **UI** | Vanilla CSS custom design system | No dependency overhead, full control over dark-mode aesthetics |

---

## Project Structure

```
event-tracker/
├── backend/               # Express API
│   ├── prisma/
│   │   └── schema.prisma  # DB schema (User, Event)
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── lib/           # Prisma singleton, helpers
│   │   ├── middleware/    # Auth (JWT), error, validate
│   │   ├── routes/        # Route definitions
│   │   └── schemas/       # Zod validation schemas
│   ├── prisma.config.ts   # Prisma 7 config (DB URL)
│   └── tsconfig.json
└── frontend/              # React + Vite app
    └── src/
        ├── contexts/      # AuthContext
        ├── components/    # Navbar, ProtectedRoute
        ├── lib/           # Axios API client
        └── pages/         # Login, Register, Events, Share
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20.19 (required by Prisma 7)
- **pnpm** — `npm install -g pnpm`
- **PostgreSQL** running locally (or update `DATABASE_URL` to point elsewhere)

---

### 1. Database setup

Create the database:
```bash
psql -U postgres -c "CREATE DATABASE event_tracker;"
```

---

### 2. Backend setup

```bash
cd backend

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL and JWT_SECRET if needed

# Run database migration
npx prisma migrate dev --name init

# Start dev server (http://localhost:5000)
pnpm dev
```

**Backend `.env` variables:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/event_tracker?schema=public"
JWT_SECRET="your_secret_here_min_32_chars"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

---

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
pnpm install

# Start dev server (http://localhost:5173)
pnpm dev
```

**Frontend `.env` variables:**
```env
VITE_API_URL=http://localhost:5000
```

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Log in, get JWT |
| GET | `/api/auth/me` | Bearer | Get current user |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/events?filter=upcoming\|past` | Bearer | List my events |
| POST | `/api/events` | Bearer | Create event |
| GET | `/api/events/:id` | Bearer | Get one event |
| PATCH | `/api/events/:id` | Bearer | Update event |
| DELETE | `/api/events/:id` | Bearer | Delete event |
| GET | `/api/events/share/:shareToken` | **No** | Public share view |

---

## Features

- ✅ Email + password registration and login (bcrypt + JWT)
- ✅ Create, view, edit, and delete events
- ✅ Filter events: **Upcoming** / **Past** / **All**
- ✅ Shareable public link for each event (no login required)
- ✅ Responsive dark-theme UI (mobile + desktop)
- ✅ Zod validation with descriptive error messages
- ✅ Global error handling middleware

---

## Trade-offs & Assumptions

| Decision | Trade-off |
|----------|-----------|
| **JWT stored in localStorage** | Simpler than httpOnly cookies; vulnerable to XSS in theory but sufficient for this scope |
| **Prisma 7 adapter pattern** | Requires `@prisma/adapter-pg` for driver connection; slightly more setup than Prisma 5 |
| **No refresh tokens** | Tokens expire in 7 days; production would add refresh token rotation |
| **Vanilla CSS** | No Tailwind/shadcn to minimize setup; custom design system instead |
| **filter on backend** | Deterministic query (gte/lt now) vs filtering client-side avoids sending all events over wire |

---

## Security Highlights

- Passwords hashed with **bcrypt** (12 rounds)
- JWT signed with secret, verified on every protected request
- All event queries scope to `userId` — users can only see their own data
- Zod validates all input before touching the DB
- CORS restricted to configured origin
