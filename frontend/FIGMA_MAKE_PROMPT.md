# Figma Make Prompt for Eventcinity

Design a modern event discovery and social media web application called **eventcinity** using the current **Vite React** project structure in this repository.

## Product direction

- Use **Eventbrite** as a functional and UX reference for discovery flow, card browsing, filters, and event detail hierarchy.
- Do **not** copy Eventbrite's visuals directly.
- Keep the UI **editorial, minimal, calm, premium, and highly readable**.
- This project supports:
  - discovering events
  - viewing event details
  - hearting, saving, and attending events
  - creating and publishing events
  - finding and connecting with people
  - signing in
- Events are currently mocked but should be visually ready for a future **Eventbrite API/backend integration**.

## Visual constraints

- Only use:
  - `#FCFCFC` for backgrounds and cards
  - `#2D3B15` for CTA buttons and active states
  - `#C0C0C1` for borders and dividers
  - `#696258` for muted copy and metadata
  - `#020202` for primary text and icons
- Typography must use **Avenir**.
- No gradients, no bright accents, no noisy decoration.
- Keep spacing generous and layouts easy to scan.

## Navigation requirements

Top navigation must include:

- website name: **eventcinity**
- search bar
- set location control for **Philippines Luzon provinces**
- find events
- create events
- find/connect to people
- sign in

## Responsive requirement

The design must be flexible and resizable for:

- desktop
- tablet
- mobile phone

Use clean component boundaries and mobile-first behavior that maps directly into React components.

## Screen mapping for this Vite React project

Design screens that map to these files:

- Event discovery page: `frontend/src/pages/events/EventDiscoveryPage.jsx`
- Event detail page: `frontend/src/pages/events/EventDetailPage.jsx`
- Create event page: `frontend/src/pages/events/CreateEventPage.jsx`
- User profile page: `frontend/src/pages/profile/ProfilePage.jsx`
- People discovery page: `frontend/src/pages/people/PeoplePage.jsx`
- Sign-in page: `frontend/src/pages/auth/SignInPage.jsx`

Layout container:

- `frontend/src/layouts/MainLayout.jsx`

Reusable components:

- `frontend/src/components/navigation/Navbar.jsx`
- `frontend/src/components/events/EventCard.jsx`
- `frontend/src/components/events/EventList.jsx`
- `frontend/src/components/ui/SearchBar.jsx`
- `frontend/src/components/ui/FilterTabs.jsx`
- `frontend/src/components/ui/Button.jsx`
- `frontend/src/components/ui/UserAvatar.jsx`
- `frontend/src/components/ui/CategoryTag.jsx`

## Screen details

### 1. Event Discovery

- Editorial hero section
- Eventbrite-inspired feed structure
- Search + category + date filtering
- Location-aware event browsing
- Reusable event cards with image, title, date, time, location, and category tag
- Heart, save, and attend actions on cards

### 2. Event Detail

- Large hero image
- Strong title and metadata hierarchy
- CTA actions for save event, attend, and heart
- Description section
- Simplified map/location section
- Attendees preview
- Related events section

### 3. Create Event

- Minimal form-first layout
- Inputs for title, description, date, time, location, category, image upload
- Strong primary submit button in olive green

### 4. Profile

- Avatar, name, bio
- Tabs for created events and saved events
- Reuse event cards from the feed

### 5. People Discovery

- Cards for nearby or like-minded people
- Clear profile and connect actions
- Social but minimal

### 6. Sign In

- Simple, clean authentication screen
- Consistent with the same editorial system

## Footer requirement

- Do **not** include buying or selling tickets in the footer.
- Footer should focus on community, discovery, and future API readiness instead.

## Developer handoff guidance

- Keep the design easy to implement in a Vite React app using modular components.
- Separate sections cleanly so visuals translate well into foldered React files.
- Avoid complex decorative shapes and heavy animation.
- Prioritize reusable cards, consistent spacing, and clear responsive behavior.

## Final design tone

Eventbrite-inspired in structure, but more restrained and premium in execution: **modern, editorial, minimal, trustworthy, and social without clutter**.
