# AI Hiring Tool – Frontend

React (Vite) frontend for the AI Hiring Tool. Requires the backend to be running.

## Setup

```bash
npm install
cp .env.example .env
```

In `.env`, set:

- **`VITE_API_URL`** – Backend base URL with no trailing slash (e.g. `http://localhost:5000`).  
  If unset, the app defaults to `http://localhost:5000`.

## Run

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm run preview   # optional: preview production build
```

## Tech stack

- React 19, Vite 7, React Router 7
- Tailwind CSS 4, Framer Motion, Lucide React
- Axios (API client; base URL from `VITE_API_URL`)

## Features

- Auth (login / signup), protected routes, session expiry on 401
- Dashboard, job upload, resume upload (PDF or text; LinkedIn coming soon), scoring, scoring jobs list/detail/results
- Interview question generation from candidate scores

See the root [README](../README.md) for full-stack setup and API overview.
