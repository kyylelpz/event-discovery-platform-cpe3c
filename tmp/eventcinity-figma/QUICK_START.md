# 🚀 Eventcinity - Quick Start Guide

## 📋 Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Code editor (VS Code recommended)

## 🏃 Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## 📁 Where to Find Things

### Need a Component?
```
src/components/
├── Button.tsx          # Buttons (primary/secondary)
├── EventCard.tsx       # Event cards with actions
├── Navbar.tsx          # Navigation
└── ...
```

### Need a Page?
```
src/pages/
├── EventDetail.tsx     # Event details
├── CreateEvent.tsx     # Create event form
└── ...
```

### Need to Fetch Data?
```
src/services/
└── eventbriteApi.tsx   # API calls
```

### Need a Helper Function?
```
src/utils/
├── dateUtils.tsx       # Date formatting
└── helpers.tsx         # General helpers
```

## 🎯 Common Tasks

### 1. Add a New Page

```javascript
// 1. Create file in src/pages/MyPage.tsx
import { MainLayout } from '@/layouts/MainLayout';

export function MyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1>My Page</h1>
    </div>
  );
}

// 2. Import and use in src/app.tsx
import { MyPage } from './pages/MyPage';

// 3. Add route logic
if (view === 'mypage') {
  return (
    <>
      <Navbar {...navbarProps} />
      <MyPage />
    </>
  );
}
```

### 2. Add a New Component

```javascript
// src/components/MyComponent.tsx
export function MyComponent({ title, onClick }) {
  return (
    <div className="p-4 border rounded-lg">
      <h2>{title}</h2>
      <button onClick={onClick}>Click Me</button>
    </div>
  );
}

// Use it anywhere
import { MyComponent } from '@/components/MyComponent';

<MyComponent title="Hello" onClick={() => alert('Hi!')} />
```

### 3. Fetch Data from API

```javascript
// Option 1: Use the hook
import { useEvents } from '@/hooks/useEvents';

function MyPage() {
  const { events, loading, error } = useEvents('Metro Manila');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <EventList events={events} />;
}

// Option 2: Use service directly
import { fetchEvents } from '@/services/eventbriteApi';

async function loadEvents() {
  const events = await fetchEvents({ location: 'Metro Manila' });
  console.log(events);
}
```

### 4. Format Dates

```javascript
import { formatDate, formatTime } from '@/utils/dateUtils';

const formattedDate = formatDate('2026-06-15');  // "Jun 15, 2026"
const formattedTime = formatTime('18:00');        // "6:00 PM"
```

### 5. Add Styles

```javascript
// Tailwind classes (preferred)
<div className="bg-[#FCFCFC] text-[#020202] p-4 rounded-lg">
  Content
</div>

// Custom CSS (if needed)
// Add to src/styles/custom.css
// Import in src/app.css
```

## 🎨 Design System

### Colors
```javascript
// Use these exact colors in className
className="bg-[#FCFCFC]"    // Background
className="text-[#020202]"   // Text
className="bg-[#2D3B15]"     // Primary (buttons, accents)
className="border-[#C0C0C1]" // Borders
className="text-[#696258]"   // Muted text
```

### Typography
```javascript
// Headings
className="text-2xl sm:text-3xl lg:text-4xl"

// Body text
className="text-sm sm:text-base"

// Muted text
className="text-[#696258]"
```

### Spacing
```javascript
// Responsive padding
className="p-4 sm:p-6 lg:p-8"

// Responsive gaps
className="gap-4 sm:gap-6 lg:gap-8"
```

### Buttons
```javascript
import { Button } from '@/components/Button';

<Button variant="primary">Click Me</Button>
<Button variant="secondary">Cancel</Button>
```

## 🔧 Useful Snippets

### Event Card
```javascript
import { EventCard } from '@/components/EventCard';

const event = {
  id: '1',
  title: 'Summer Festival',
  date: 'Jun 15, 2026',
  time: '6:00 PM',
  location: 'Metro Manila',
  category: 'Music',
  imageUrl: 'https://...',
  attendees: 1247
};

<EventCard event={event} onClick={() => handleClick(event.id)} />
```

### Responsive Grid
```javascript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <Item key={item.id} {...item} />)}
</div>
```

### Loading State
```javascript
{loading && (
  <div className="flex items-center justify-center py-12">
    <p className="text-[#696258]">Loading events...</p>
  </div>
)}
```

### Error State
```javascript
{error && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-red-600">{error}</p>
  </div>
)}
```

## 🐛 Troubleshooting

### Import not found?
```javascript
// ❌ Wrong
import { Button } from './components/Button';

// ✅ Correct
import { Button } from '@/components/Button';
```

### Component not rendering?
```javascript
// Make sure to export
export function MyComponent() { ... }

// Not: function MyComponent() { ... }
```

### Styles not applying?
```javascript
// Check Tailwind classes are valid
// Check theme.css for custom variables
// Restart dev server if needed
```

## 📚 File Templates

### Component Template
```javascript
export function MyComponent({ prop1, prop2, onClick }) {
  return (
    <div className="p-4 border border-[#C0C0C1] rounded-lg bg-[#FCFCFC]">
      <h3 className="text-xl text-[#020202]">{prop1}</h3>
      <p className="text-sm text-[#696258]">{prop2}</p>
      <button
        onClick={onClick}
        className="mt-4 px-4 py-2 bg-[#2D3B15] text-[#FCFCFC] rounded-lg"
      >
        Click Me
      </button>
    </div>
  );
}
```

### Page Template
```javascript
import { useState } from 'react';
import { Footer } from '@/components/Footer';

export function MyPage({ onBack }) {
  const [data, setData] = useState([]);

  return (
    <div className="min-h-screen bg-[#FCFCFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl text-[#020202] mb-6">Page Title</h1>
        {/* Content here */}
      </div>
      <Footer />
    </div>
  );
}
```

### Hook Template
```javascript
import { useState, useEffect } from 'react';

export function useMyData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await fetch('/api/data');
      setData(await result.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchData };
}
```

## 🎯 Next Steps

1. ✅ Read `PROJECT_STRUCTURE.md` for full overview
2. ✅ Check `src/README.md` for detailed docs
3. ✅ Explore example files in each folder
4. ✅ Start building!

## 💡 Tips

- Use `@/` for absolute imports
- Keep components small and focused
- Use TypeScript syntax checking if needed (files are .tsx)
- Follow existing patterns in the codebase
- Ask questions in the team chat

## 🔗 Resources

- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)
- [Lucide Icons](https://lucide.dev)

---

**Happy coding! 🚀**
