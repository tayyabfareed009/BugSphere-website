# BugSphere

Track. Manage. Resolve.

BugSphere is a production-style full stack bug tracking website built with React, Vite, Tailwind CSS, Express, MongoDB, JWT authentication, role authorization, Mongoose models, uploads, analytics, and a modern SaaS dashboard UI.

## Features

- JWT register, login, logout, persistent login UI, protected routes, and role-based permissions.
- Admin, Developer, and Tester roles.
- Project CRUD API and project management interface.
- Bug CRUD API with assignment, status, priority, severity, screenshot upload, search, filters, pagination, comments, and activity timeline.
- Dashboard statistics, recent activity, quick actions, responsive tables, empty states, dark mode, CSV export, and Recharts analytics.
- Users, profile, settings, notifications UI, language UI, and report export UI.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Create backend environment:

```bash
cp backend/.env.example backend/.env
```

3. Start MongoDB locally, then run the API:

```bash
npm run server
```

4. In another terminal, run the frontend:

```bash
npm run dev
```

The Vite app runs at `http://localhost:5173` and proxies `/api` to `http://localhost:5000`.

## Structure

- `src/components` reusable UI components.
- `src/pages` landing, auth, dashboard, projects, bugs, reports, profile, settings, users, and not found pages.
- `src/context` authentication and theme providers.
- `src/services` Axios API client.
- `backend/models` Mongoose models for users, projects, bugs, comments, and notifications.
- `backend/controllers` REST API business logic.
- `backend/routes` Express route modules.
