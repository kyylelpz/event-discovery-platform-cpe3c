# Event Discovery Platform Frontend

Frontend client for the Event Discovery Platform / Eventcinity. This repository contains the React + Vite single-page app used for browsing events, viewing public profiles, managing interactions, and creating or editing user-hosted events.

## Related Repository

- Backend API: [event-discovery-platform-backend-cpe3c](https://github.com/kyylelpz/event-discovery-platform-backend-cpe3c)

## What This App Does

- Browse events with search, location, category, and date filtering
- View event details, related events, and personalized recommendations
- Sign in, complete onboarding, and manage a public profile
- Explore the `Connect with People` directory and public member profiles
- Save, favorite, and attend events
- Create and edit hosted events
- View notifications and shared-attendance activity

## Tech Stack

- React 19
- Vite 8
- ESLint
- Client-side routing implemented inside the app
- Fetch-based service layer for backend API calls

## Requirements

- Node.js
- npm
- The backend repo running locally or deployed and reachable from the frontend

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the API base URL

Create a local env file such as `.env.local` if you need the frontend to target a specific backend URL:

```env
VITE_API_BASE_URL=http://localhost:5000
```

How API base URL resolution works:

- If `VITE_API_BASE_URL` is set, the app uses it
- If the app is running on `localhost` or `127.0.0.1`, it defaults to `http://localhost:5000`
- Otherwise, it defaults to the current site origin

### 3. Start the development server

```bash
npm run dev
```

Open the local Vite URL shown in the terminal, usually `http://localhost:5173`.

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Builds the production bundle into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs ESLint across the project |

## Project Structure

```text
src/
  assets/        Static images and bundled media
  components/    Reusable UI and event/navigation components
  data/          Static mock data and page metadata
  layouts/       Shared layout shells
  pages/         Route-level screens
  services/      API clients and state persistence helpers
  styles/        Shared style layers
  utils/         Routing, formatting, and helper utilities
  App.jsx        Main application composition and route switching
  main.jsx       App bootstrap
```

## Main Routes

| Route | Purpose |
| --- | --- |
| `/events` | Main event discovery page |
| `/events/:eventId` | Event detail page |
| `/events/:eventId/edit` | Event editing page |
| `/events/create` | Event creation page |
| `/events/date/:dateKey` | Date-filtered event listing |
| `/people` | People directory / connect page |
| `/profile/:username` | Public or current-user profile page |
| `/signin` | Sign-in and auth entry point |
| `/event-planning` | Informational page |
| `/community-hosts` | Informational page |
| `/location-guides` | Informational page |
| `/help-center` | Informational page |
| `/contact-support` | Informational page |
| `/about-the-programmers` | Team/about page |

## Backend Connection

This frontend expects the backend API from the related repository to expose routes under `/api`, including:

- `/api/auth`
- `/api/events`
- `/api/profile`
- `/api/users`
- `/api/interactions`
- `/api/notifications`
- `/api/health`

For local development:

- Run the backend on `http://localhost:5000`
- Make sure backend CORS allows your frontend origin, typically `http://localhost:5173`
- If using cookie-based auth across different origins, keep backend `CLIENT_URL` / `CLIENT_URLS` aligned with the frontend origin

## Local Development Workflow

1. Start the backend repo first
2. Start this frontend with `npm run dev`
3. Open the app in the browser
4. Confirm API connectivity by checking that events and profiles load correctly

## Deployment

This repo builds to static files and can be deployed to any static hosting provider.

### Build for production

```bash
npm run build
```

The production-ready files will be generated in `dist/`.

### Deployment checklist

1. Set `VITE_API_BASE_URL` if the backend is hosted on a different origin
2. Build the app with `npm run build`
3. Deploy the `dist/` directory to your hosting provider
4. Make sure the backend CORS settings include the deployed frontend domain
5. If auth cookies are shared across domains/subdomains, align backend cookie and redirect settings with the deployed frontend URL

### Same-origin deployment

If the frontend and backend are served from the same origin through a reverse proxy, you can usually skip `VITE_API_BASE_URL` and let the app use the current origin automatically.

## Notes

- This repo currently includes custom application code and project-specific routing, not the default Vite starter app
- The backend is responsible for MongoDB Atlas access, authentication, event persistence, file uploads, notifications, and external integrations
- Some frontend service layers include graceful fallbacks for unavailable endpoints during development, but the full experience depends on the backend being available
