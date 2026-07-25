# BugSphere

Track. Manage. Resolve.

BugSphere is a multi-tenant bug tracking SaaS built with React, Vite, Tailwind CSS, Express, MongoDB, Firebase email/password authentication, Cloudinary attachments, and a modern SaaS dashboard UI.

## Features

- Firebase email/password sign-in. The API verifies the signed Firebase ID token against Google certificates before issuing its own HTTP-only JWT session.
- Organization isolation on users, projects, bugs, comments, analytics, invitations, and audit logs.
- Owner, Project Manager, Team Lead, Developer, Tester, and Viewer role model.
- Project CRUD API and project management interface.
- Bug CRUD API with assignment, status, priority, severity, screenshot upload, search, filters, pagination, comments, and activity timeline.
- Dashboard statistics, recent activity, quick actions, responsive tables, empty states, dark mode, CSV export, and Recharts analytics.
- Users, profile, settings, notifications UI, language UI, and report export UI.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Create a root environment file and fill in every value:

```bash
Copy-Item .env.example .env
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
- `src/services` Axios and Firebase REST authentication clients.
- `backend/models` Mongoose models for organizations, users, teams, invitations, projects, bugs, comments, notifications, and audit logs.
- `backend/controllers` REST API business logic.
- `backend/routes` Express route modules.
