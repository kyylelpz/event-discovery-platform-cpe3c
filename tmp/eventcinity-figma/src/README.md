# Eventcinity - Source Structure

## 📁 Folder Structure

```
src/
├── app.tsx                 # Main application component
├── app.css                 # Main CSS imports
├── main.tsx                # Application entry point
│
├── assets/                 # Static assets (images, icons, etc.)
│
├── components/             # Reusable UI components
│   ├── Button.tsx
│   ├── CategoryHighlight.tsx
│   ├── CategoryTag.tsx
│   ├── EventCard.tsx
│   ├── EventList.tsx
│   ├── FeaturedEvent.tsx
│   ├── FilterTabs.tsx
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   ├── SearchBar.tsx
│   └── UserAvatar.tsx
│
├── hooks/                  # Custom React hooks
│   └── (custom hooks here)
│
├── layouts/                # Layout components
│   └── (layout wrappers here)
│
├── pages/                  # Full page components
│   ├── ConnectPeople.tsx
│   ├── CreateEvent.tsx
│   ├── EventDetail.tsx
│   ├── SignIn.tsx
│   └── UserProfile.tsx
│
├── services/               # API services and external integrations
│   └── (API calls, Eventbrite integration, etc.)
│
├── styles/                 # Global styles
│   ├── fonts.css
│   ├── theme.css
│   ├── index.css
│   └── tailwind.css
│
└── utils/                  # Utility functions and helpers
    └── (helper functions here)
```

## 🎨 Design System

### Colors
- Primary Background: `#FCFCFC`
- Primary Accent/CTA: `#2D3B15` (deep olive green)
- Secondary Neutral: `#C0C0C1`
- Muted Text/UI: `#696258`
- Primary Text/Icons: `#020202`

### Typography
- **Font Family:** Avenir
- Heavy/Bold → Page titles, event names
- Medium → Section headers, buttons, labels
- Book/Light → Body text, metadata

## 🧩 Component Categories

### UI Components (`/components`)
Reusable, presentational components used across the app:
- Navigation (Navbar, Footer)
- Cards (EventCard, FeaturedEvent)
- Forms (Button, FilterTabs, CategoryTag)
- Display (UserAvatar, SearchBar)

### Pages (`/pages`)
Full page views that compose components:
- EventDetail - Event information page
- CreateEvent - Event creation form
- UserProfile - User profile and events
- ConnectPeople - Networking feature (coming soon)
- SignIn - Authentication page

### Layouts (`/layouts`)
Page layout wrappers (to be added as needed)

### Services (`/services`)
API integrations and data fetching:
- Eventbrite API integration (coming soon)
- Event data management
- User authentication

### Hooks (`/hooks`)
Custom React hooks for shared logic

### Utils (`/utils`)
Pure utility functions and helpers

## 🚀 Import Patterns

```javascript
// From components
import { Button } from '@/components/Button';
import { Navbar } from '@/components/Navbar';

// From pages
import { EventDetail } from '@/pages/EventDetail';

// From utils
import { formatDate } from '@/utils/dateUtils';

// From services
import { fetchEvents } from '@/services/eventbriteApi';
```

## 📦 Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS v4 + Custom Theme
- **Icons:** Lucide React
- **Type:** JSX (pure JavaScript, .tsx extensions for Figma Make compatibility)
- **Future:** Eventbrite API integration

## 🔄 State Management

Currently using React's built-in `useState` for local state. As the app grows:
- Add global state management (Context API, Zustand, or Redux)
- Move to `/hooks` for custom state hooks
- Add `/services` for API state management

## 🌐 Routing

Currently using conditional rendering based on view state. Future improvements:
- React Router for proper routing
- URL-based navigation
- Deep linking support
