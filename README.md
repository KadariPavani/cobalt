# Cobalt — Project & Task OS

A production-grade, full-stack task and project management application built with the **PERN stack** — PostgreSQL, Express, React (Vite), and Node.js.

![Node](https://img.shields.io/badge/Node-%E2%89%A520.x-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-%E2%89%A514-336791?logo=postgresql&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-22c55e)

---

## 📖 Overview

**Cobalt** is a focused workspace for project planning, task tracking, and team execution — a polished dark UI built on the PERN stack. It's architected for real-world usage: a layered REST API with JWT auth and refresh-token rotation on the backend, and a fast, accessible React app using TanStack Query, React Hook Form + Zod, Geist typography, and a restrained cobalt-blue design system on the frontend.

## ✨ Features

- 🔐 **Auth** — register / login / refresh / logout, JWT access tokens (in-memory) + httpOnly refresh-token cookie with rotation, bcrypt(12) password hashing, server-side validation, rate-limited auth endpoints.
- 👮 **Role-based access control** — users have a `role` of `admin` or `member`. Edit / delete actions on projects and tasks are gated by ownership and role. Backend enforces (returns 403); frontend hides actions the current user can't perform.
- 📂 **Projects** — full CRUD, priorities, statuses, deadlines, grid & table views, sort by date / priority / deadline / name, per-project task counts and completion progress.
- ✅ **Tasks** — full CRUD, three-state Kanban (To-Do · In Progress · Completed) with drag-and-drop status changes, inline complete toggle, sortable list view, assignees, due dates, priorities.
- 🔍 **Search & Filters** — global ⌘K search across projects and tasks, per-page filter chips (status / priority / assignee), URL-synced filter state so views are shareable, debounced search input.
- 📊 **Dashboard** — animated stat cards (projects, tasks, completed, overdue), donut chart of task status, bar chart of tasks by priority, 7-day line chart of completed tasks, recent activity feed, "my tasks" inbox.
- 🎨 **Design system** — deep-navy dark theme, consistent spacing / type / color tokens, skeleton loaders everywhere, empty states with CTAs, toast notifications, confirmation dialogs, smooth micro-animations, fully accessible (ARIA + focus rings + keyboard navigation), responsive from mobile to ultra-wide.
- 🧱 **Production hardening** — Helmet, CORS allow-list, rate limiting, parameterized SQL (zero injection), env validation at boot, structured Winston logging, graceful shutdown.

## 📸 Screenshots

> Add screenshots to `/docs/screenshots/` and reference them here once you've taken them.
>
> Suggested captures: `dashboard.png`, `projects-grid.png`, `project-kanban.png`, `task-form.png`, `login.png`.

```text
docs/
└── screenshots/
    ├── dashboard.png
    ├── projects-grid.png
    └── project-kanban.png
```

## 🛠 Prerequisites

| Tool       | Version   |
|------------|-----------|
| Node.js    | `≥ 20.x`  |
| npm        | `≥ 10.x`  |
| PostgreSQL | `≥ 14.x`  |

Verify with:

```bash
node -v
npm -v
psql --version
```

## 🔑 Environment Variables

### Backend — `backend/.env`

| Variable                | Description                                                            | Default                                       |
|-------------------------|------------------------------------------------------------------------|-----------------------------------------------|
| `NODE_ENV`              | `development`, `production`, or `test`                                 | `development`                                 |
| `PORT`                  | HTTP port the API listens on                                           | `5000`                                        |
| `CLIENT_URL`            | Origin allowed by CORS (the frontend URL)                              | `http://localhost:5173`                       |
| `DATABASE_URL`          | Postgres connection string (preferred)                                 | `postgres://postgres:postgres@localhost:5432/task_manager` |
| `PGHOST` / `PGPORT` / `PGUSER` / `PGPASSWORD` / `PGDATABASE` | Alternative to `DATABASE_URL`                  | —                                             |
| `DATABASE_SSL`          | Set to `true` for managed DBs that require SSL                         | unset                                         |
| `JWT_ACCESS_SECRET`     | **Required.** Secret for signing short-lived access tokens             | —                                             |
| `JWT_REFRESH_SECRET`    | **Required.** Secret for signing refresh tokens (must differ)          | —                                             |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL                                                       | `15m`                                         |
| `JWT_REFRESH_EXPIRES_IN`| Refresh token TTL                                                      | `7d`                                          |
| `BCRYPT_SALT_ROUNDS`    | bcrypt cost factor                                                     | `12`                                          |
| `COOKIE_SECURE`         | Set `true` in production behind HTTPS so refresh cookie is `Secure`    | `false`                                       |
| `LOG_LEVEL`             | `error` / `warn` / `info` / `http` / `debug`                           | `debug` in dev, `info` in prod                |

### Frontend — `frontend/.env`

| Variable        | Description                          | Default                       |
|-----------------|--------------------------------------|-------------------------------|
| `VITE_API_URL`  | Base URL of the backend REST API     | `http://localhost:5000/api`   |

> Copy `.env.example` to `.env` in both `backend/` and `frontend/` before running.

## 🗄 Database Setup

1. **Create the database**

   ```bash
   createdb task_manager
   # or via psql:
   psql -U postgres -c "CREATE DATABASE task_manager;"
   ```

2. **Configure `backend/.env`** — set `DATABASE_URL` (or the individual `PG*` vars).

3. **Run migrations**

   ```bash
   cd backend
   npm install
   npm run migrate
   ```

4. **Seed demo data** (2 users, 4 projects, 20 tasks)

   ```bash
   npm run seed
   ```

   Demo logins:

   | Email             | Password        |
   |-------------------|-----------------|
   | `ada@demo.dev`    | `Password123!`  |
   | `grace@demo.dev`  | `Password123!`  |

   Reset everything at once with `npm run db:reset`.

## 🖥 Backend Setup

```bash
cd backend
cp .env.example .env       # then fill in secrets
npm install
npm run migrate            # apply schema
npm run seed               # optional demo data
npm run dev                # http://localhost:5000
```

Production:

```bash
npm start
```

Health check: `GET http://localhost:5000/health` → `{ "success": true, "data": { "status": "ok", ... } }`.

## 🌐 Frontend Setup

```bash
cd frontend
cp .env.example .env       # adjust VITE_API_URL if needed
npm install
npm run dev                # http://localhost:5173
```

Production:

```bash
npm run build
npm run preview
```

## 🔐 Access control

| Resource          | Action       | Who can do it                                                              |
|-------------------|--------------|----------------------------------------------------------------------------|
| Any project/task  | **View**     | Any authenticated user                                                     |
| Project           | **Create**   | Any authenticated user                                                     |
| Project           | **Edit**     | Project creator · Admin                                                    |
| Project           | **Delete**   | Project creator · Admin                                                    |
| Task              | **Create**   | Any authenticated user (in any project)                                    |
| Task              | **Edit / status change** | Task creator · Task assignee · Owner of the parent project · Admin |
| Task              | **Delete**   | Task creator · Owner of the parent project · Admin (assignees cannot delete) |

Backend authority lives in `backend/src/utils/authz.js` and is enforced in the service layer (`projectService.update/remove`, `taskService.update/updateStatus/remove`). Frontend hides actions via `frontend/src/hooks/usePermissions.js` — the matching mirror of those rules.

## 📚 API Documentation

All endpoints are prefixed with `/api`. Responses follow this envelope:

```jsonc
// Success
{ "success": true,  "data": { ... }, "message": "OK" }

// Error
{ "success": false, "message": "Validation failed", "errors": [{ "field": "email", "message": "..." }] }
```

Authenticated requests must include `Authorization: Bearer <accessToken>` and (for `/auth/refresh` and `/auth/logout`) the httpOnly `rt` refresh cookie.

### Auth

| Method | Path                | Auth | Description                                  | Body                          |
|--------|---------------------|------|----------------------------------------------|-------------------------------|
| POST   | `/api/auth/register`| ❌   | Create account, returns access + refresh     | `{ name, email, password }`   |
| POST   | `/api/auth/login`   | ❌   | Sign in                                      | `{ email, password }`         |
| POST   | `/api/auth/refresh` | 🍪   | Issue new access token, rotates refresh      | —                             |
| POST   | `/api/auth/logout`  | 🍪   | Revoke refresh token and clear cookie        | —                             |
| GET    | `/api/auth/me`      | ✅   | Current user                                 | —                             |

### Projects

| Method | Path                       | Auth | Description                              |
|--------|----------------------------|------|------------------------------------------|
| GET    | `/api/projects`            | ✅   | List projects (filters: `status`, `priority`, `search`, `sort`, `order`) |
| POST   | `/api/projects`            | ✅   | Create project                           |
| GET    | `/api/projects/:id`        | ✅   | Project detail with task summary         |
| PUT    | `/api/projects/:id`        | ✅   | Update project                           |
| DELETE | `/api/projects/:id`        | ✅   | Delete project (cascades tasks)          |

### Tasks

| Method | Path                            | Auth | Description                              |
|--------|---------------------------------|------|------------------------------------------|
| GET    | `/api/tasks`                    | ✅   | Global task list (filters: `status`, `priority`, `assigned_to`, `search`, `overdue`, `project_id`, `sort`, `order`) |
| GET    | `/api/projects/:id/tasks`       | ✅   | Tasks for a project (same filters)       |
| POST   | `/api/projects/:id/tasks`       | ✅   | Create task                              |
| GET    | `/api/tasks/:id`                | ✅   | Task detail                              |
| PUT    | `/api/tasks/:id`                | ✅   | Update task (any field, including status)|
| DELETE | `/api/tasks/:id`                | ✅   | Delete task                              |

### Users

| Method | Path           | Auth | Description                |
|--------|----------------|------|----------------------------|
| GET    | `/api/users`   | ✅   | List users (for assignment)|

### Dashboard

| Method | Path                       | Auth | Description                              |
|--------|----------------------------|------|------------------------------------------|
| GET    | `/api/dashboard/stats`     | ✅   | Aggregated stats, charts, recent activity, current user's tasks |

#### Example payloads

Create a project:

```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Q3 Platform Revamp",
  "description": "Rebuild the dashboard.",
  "priority": "high",
  "status": "active",
  "deadline": "2026-08-15"
}
```

Create a task:

```http
POST /api/projects/<projectId>/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Wire up auth flow",
  "description": "Login + register + refresh + logout",
  "status": "in_progress",
  "priority": "high",
  "dueDate": "2026-06-30",
  "assignedTo": "<userId>"
}
```

## 🗂 Project Structure

```text
.
├── backend/
│   ├── migrations/                 # Numbered SQL migrations (Up / Down sections)
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_projects.sql
│   │   ├── 003_create_tasks.sql
│   │   └── 004_create_refresh_tokens.sql
│   ├── src/
│   │   ├── app.js                  # Express app + middleware chain
│   │   ├── config/                 # DB pool, env validation
│   │   ├── controllers/            # Thin HTTP handlers
│   │   ├── middleware/             # auth, validate, errorHandler, rate-limit
│   │   ├── models/                 # Parameterised SQL query functions
│   │   ├── routes/                 # Express routers
│   │   ├── services/               # Business logic
│   │   └── utils/                  # logger, jwt, response, constants, migrate, seed
│   ├── .env.example
│   ├── package.json
│   └── server.js                   # Boot, graceful shutdown
│
├── frontend/
│   ├── src/
│   │   ├── api/                    # Axios client (interceptors + refresh) + endpoint wrappers
│   │   ├── components/             # Reusable UI (Badge, Modal, Skeleton, Sidebar, …)
│   │   ├── features/               # Feature-scoped components
│   │   │   ├── projects/           # ProjectForm, ProjectCard
│   │   │   └── tasks/              # TaskForm, TaskCard, TaskList, KanbanBoard, TaskFilters
│   │   ├── hooks/                  # useAuth, useProjects, useTasks, useDebounce, useUrlFilters
│   │   ├── layouts/                # AppLayout, AuthLayout
│   │   ├── pages/                  # Route-level pages
│   │   ├── store/                  # Zustand stores (auth, UI)
│   │   ├── utils/                  # cn, format, constants
│   │   ├── App.jsx                 # Router
│   │   ├── main.jsx                # Bootstrap + providers
│   │   └── styles.css              # Tailwind layers + design tokens
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🚀 Deployment Notes

### Backend → Railway / Render / Fly.io

1. Provision a PostgreSQL instance and copy the `DATABASE_URL`.
2. Set required env vars: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, `COOKIE_SECURE=true`, `NODE_ENV=production`.
3. Add a build / start command:
   ```bash
   npm install && npm run migrate
   npm start
   ```
4. Behind a TLS-terminating proxy, `app.set('trust proxy', 1)` is already configured so cookies work.

### Frontend → Vercel

1. Import the `frontend/` directory.
2. Framework preset: **Vite**.
3. Build command: `npm run build` · Output: `dist`.
4. Environment variable: `VITE_API_URL=https://your-api.example.com/api`.
5. Set the API's `CLIENT_URL` env to your Vercel domain so CORS allows it.

Cookies cross the API/frontend boundary on different domains, so production needs:

- API served over HTTPS
- `COOKIE_SECURE=true`
- CORS configured with `credentials: true` (already done)

## 📄 License

[MIT](https://opensource.org/licenses/MIT) © Cobalt contributors
