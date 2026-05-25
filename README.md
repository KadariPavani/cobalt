# Cobalt

A full-stack project and task management application built using the PERN Stack.

---

## Tech Stack

- React
- Vite
- Tailwind CSS
- Node.js
- Express.js
- PostgreSQL

---

## Features

- Authentication
- Role-Based Access
- Project Management
- Task Management
- Kanban Board
- Dashboard
- Search & Filters
- Responsive UI

---

## Project Access Control

| Resource | Action | Access |
|----------|--------|--------|
| Project | Edit | Project Creator, Admin |
| Project | Delete | Project Creator, Admin |
| Task | Create | Any Authenticated User |
| Task | Edit / Status Change / Complete | Task Creator, Task Assignee, Admin |
| Task | Delete | Task Creator, Admin |

### Notes

- Project owners cannot automatically edit or delete all tasks inside the project.
- Task assignees can edit and update task status but cannot delete tasks.
- Members can create tasks in any project and manage their own tasks.

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
```

### Backend Setup

```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

### Backend `.env`

```env
PORT=5000
DATABASE_URL=your_database_url
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Demo Credentials

| Role | Email | Password |
|------|------|------|
| Admin | ada@demo.dev | Password123! |
| Member | grace@demo.dev | Password123! |
| Member | linus@demo.dev | Password123! |
| Member | margaret@demo.dev | Password123! |

---

## Folder Structure

```text
backend/
frontend/
README.md
```

---

