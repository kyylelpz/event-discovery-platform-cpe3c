# Eventcinity - Project Structure

## 🎯 Overview

Eventcinity is a modern event discovery and social media web application for the Philippines, built with React, Vite, and Tailwind CSS. The project is organized following industry best practices with a clear separation of concerns.

## 📂 Project Structure

```
eventcinity/
│
├── public/                      # Static public assets
│
├── src/                         # Source code
│   ├── app.tsx                  # Main application component
│   ├── app.css                  # Main CSS entry (imports all styles)
│   ├── main.tsx                 # Application entry point
│   │
│   ├── assets/                  # Static assets
│   │   ├── images/             # Images, logos, icons
│   │   ├── data/               # JSON/CSV data files
│   │   └── README.md
│   │
│   ├── components/              # Reusable UI components
│   │   ├── Button.tsx          # Unified button component (primary/secondary)
│   │   ├── CategoryHighlight.tsx
│   │   ├── CategoryTag.tsx
│   │   ├── EventCard.tsx       # Event card with like/save/attend
│   │   ├── EventList.tsx       # Grid of event cards
│   │   ├── FeaturedEvent.tsx   # Hero event component
│   │   ├── FilterTabs.tsx      # Category filter tabs
│   │   ├── Footer.tsx          # Site footer
│   │   ├── Navbar.tsx          # Responsive navigation
│   │   ├── SearchBar.tsx       # Event search
│   │   └── UserAvatar.tsx      # User avatar component
│   │
│   ├── hooks/                   # Custom React hooks
│   │   └── useEvents.tsx       # Event management hook
│   │
│   ├── layouts/                 # Layout components
│   │   └── MainLayout.tsx      # Main app layout wrapper
│   │
│   ├── pages/                   # Full page components
│   │   ├── ConnectPeople.tsx   # Networking page (coming soon)
│   │   ├── CreateEvent.tsx     # Event creation form
│   │   ├── EventDetail.tsx     # Event detail page
│   │   ├── SignIn.tsx          # Authentication page
│   │   └── UserProfile.tsx     # User profile & events
│   │
│   ├── services/                # API & external services
│   │   └── eventbriteApi.tsx   # Eventbrite API integration
│   │
│   ├── styles/                  # Global styles
│   │   ├── fonts.css           # Avenir font imports
│   │   ├── theme.css           # Color palette & design tokens
│   │   ├── index.css           # Base styles
│   │   └── tailwind.css        # Tailwind directives
│   │
│   ├── utils/                   # Utility functions
│   │   ├── dateUtils.tsx       # Date formatting helpers
│   │   └── helpers.tsx         # General utilities
│   │
│   └── README.md                # Source code documentation
│
├── package.json                 # Dependencies & scripts
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
└── tsconfig.json               # TypeScript config (JSX syntax)
```

## 🎨 Design System

### Color Palette
```css
--background: #FCFCFC        /* Primary background */
--primary: #2D3B15          /* Deep olive green - CTAs */
--secondary: #C0C0C1        /* Neutral gray */
--muted: #696258            /* Muted text */
--foreground: #020202       /* Primary text */
```

### Typography
- **Font:** Avenir (Heavy, Medium, Book, Light)
- **Responsive:** Mobile (text-xs to text-2xl) → Desktop (text-base to text-5xl)

## 🧩 Component Organization

### Components (`/components`)
**Purpose:** Small, reusable, presentational UI elements

**Examples:**
- Buttons, tags, avatars
- Navigation, footer
- Cards, lists, filters

**Import:**
```javascript
import { Button } from '@/components/Button';
```

### Pages (`/pages`)
**Purpose:** Full page views that compose multiple components

**Examples:**
- Event detail page
- Event creation form
- User profile
- Sign in/auth

**Import:**
```javascript
import { EventDetail } from '@/pages/EventDetail';
```

### Layouts (`/layouts`)
**Purpose:** Reusable page layout wrappers

**Examples:**
- MainLayout (Navbar + content + Footer)
- AuthLayout (for signin/signup)
- DashboardLayout (for admin)

**Import:**
```javascript
import { MainLayout } from '@/layouts/MainLayout';
```

### Hooks (`/hooks`)
**Purpose:** Custom React hooks for shared stateful logic

**Examples:**
- `useEvents()` - Event fetching/filtering
- `useSavedEvents()` - Saved/liked events (localStorage)
- `useAuth()` - Authentication state
- `useDebounce()` - Input debouncing

**Import:**
```javascript
import { useEvents } from '@/hooks/useEvents';
```

### Services (`/services`)
**Purpose:** API calls and external integrations

**Examples:**
- Eventbrite API client
- Authentication service
- Analytics tracking
- Storage utilities

**Import:**
```javascript
import { fetchEvents } from '@/services/eventbriteApi';
```

### Utils (`/utils`)
**Purpose:** Pure utility functions (no React/state)

**Examples:**
- Date formatting
- String manipulation
- Number formatting
- Array/object helpers

**Import:**
```javascript
import { formatDate } from '@/utils/dateUtils';
```

## 🔄 Data Flow

```
User Action
    ↓
Component/Page
    ↓
Custom Hook (optional)
    ↓
Service/API Call
    ↓
Transform Data (utils)
    ↓
Update State
    ↓
Re-render Component
```

## 🚀 Development Workflow

### File Naming
- **Components:** PascalCase (e.g., `EventCard.tsx`)
- **Utils:** camelCase (e.g., `dateUtils.tsx`)
- **Hooks:** camelCase with 'use' prefix (e.g., `useEvents.tsx`)

### Import Order
```javascript
// 1. External libraries
import { useState } from 'react';
import { Calendar } from 'lucide-react';

// 2. Internal - Components
import { Button } from '@/components/Button';

// 3. Internal - Pages
import { EventDetail } from '@/pages/EventDetail';

// 4. Internal - Hooks
import { useEvents } from '@/hooks/useEvents';

// 5. Internal - Services
import { fetchEvents } from '@/services/eventbriteApi';

// 6. Internal - Utils
import { formatDate } from '@/utils/dateUtils';

// 7. Internal - Styles
import './styles.css';
```

### Where to Put New Code

| What | Where | Example |
|------|-------|---------|
| Reusable button/card | `/components` | `Button.tsx` |
| Full page view | `/pages` | `EventList.tsx` |
| Layout wrapper | `/layouts` | `MainLayout.tsx` |
| Fetch data logic | `/hooks` | `useEvents.tsx` |
| API calls | `/services` | `eventbriteApi.tsx` |
| Date formatting | `/utils` | `dateUtils.tsx` |
| Images/icons | `/assets` | `logo.png` |
| Global styles | `/styles` | `theme.css` |

## 🔧 Tech Stack

- **Framework:** React 18.3.1
- **Build Tool:** Vite 6.3.5
- **Styling:** Tailwind CSS 4.1.12
- **Icons:** Lucide React 0.487.0
- **Language:** JavaScript (JSX syntax in .tsx files)
- **Module Type:** ES Modules (`"type": "module"`)

## 📦 Key Dependencies

```json
{
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "vite": "6.3.5",
  "tailwindcss": "4.1.12",
  "lucide-react": "0.487.0"
}
```

## 🎯 Future Enhancements

### Phase 1 - API Integration
- [ ] Integrate Eventbrite API
- [ ] Implement real event search
- [ ] Add event caching

### Phase 2 - Authentication
- [ ] User sign-in/sign-up
- [ ] OAuth integration
- [ ] User profiles

### Phase 3 - Social Features
- [ ] Connect with people
- [ ] Event sharing
- [ ] Social feed

### Phase 4 - Advanced Features
- [ ] Event recommendations
- [ ] Calendar integration
- [ ] Mobile app

## 📝 Notes

- Files use `.tsx` extension but contain pure JSX syntax (no TypeScript)
- This is required by the Figma Make environment
- Vite handles `.tsx` files as JSX without type checking
- `"type": "module"` is set in package.json for ES modules
- Path alias `@` points to `src/` directory (configured in vite.config.ts)

## 🆘 Getting Help

- Check `/src/README.md` for detailed source structure
- Review component examples in `/src/components`
- See hook examples in `/src/hooks`
- Check service patterns in `/src/services`
