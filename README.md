# EVENTCINITY – Frontend

Eventcinity is a **React + Vite single-page application (SPA)** that provides the user interface for browsing, interacting with, and managing events in the Eventcinity platform.

---

## Live Links

- Production: https://eventcinity.com  
- Alternative: https://www.eventcinity.com  

---

## Overview

This frontend application allows users to:
- Browse and filter events
- View event details and recommendations
- Create and edit events
- Manage user profiles
- Interact with other users (follow, attend, save)
- Receive notifications

It communicates with the backend via REST APIs.

---

## Tech Stack

- React 19
- Vite 8
- Fetch API
- ESLint
- Custom client-side routing

---

## System Architecture

```
User Browser
   ↓
React SPA
   ↓
Service Layer (Fetch API)
   ↓
Backend API (Express)
```

---

## Project Structure

```
src/
  components/    Reusable UI components
  pages/         Route-level pages
  services/      API calls and helpers
  utils/         Utility functions
  layouts/       Layout wrappers
  assets/        Images and static files
  App.jsx        Route handling
  main.jsx       App entry point
```

---

## Routes

| Route | Description |
|------|------------|
| `/events` | Event discovery |
| `/events/:eventId` | Event details |
| `/events/create` | Create event |
| `/events/:eventId/edit` | Edit event |
| `/people` | User directory |
| `/profile/:username` | Profile page |
| `/signin` | Login page |

---

## Environment Configuration

Create `.env` file:

```
VITE_API_BASE_URL=https://api.eventcinity.com
```

### API Resolution Logic
- Uses `.env` if defined
- Defaults to `localhost:5000` in development
- Uses current origin in production (same-origin deployment)

---

## Getting Started

### 1. Install dependencies
```
npm install
```

### 2. Run development server
```
npm run dev
```

App runs at:
```
http://localhost:5173
```

---

## Backend Integration

Expected backend endpoints:
```
/api/auth
/api/events
/api/profile
/api/users
/api/interactions
/api/notifications
```

---

## Deployment

### Build project
```
npm run build
```

### Deploy
- Upload `/dist` to hosting (Cloudflare Pages / Hostinger)
- Set correct API base URL
- Ensure backend CORS allows frontend domain

---

## Developers

- Reymel Aquino  
- Jana Daniela Bautista  
- Lance Angelo Bernal  
- Euan Francisco  
- Kyle Lemuel E. Lopez  