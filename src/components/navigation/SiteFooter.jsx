const footerLinks = {
  'Use Eventcinity': [
    { label: 'Create Events', path: '/events/create' },
    { label: 'Upcoming Events', path: '/events', sectionId: 'upcoming-events' },
    { label: 'Connect with People', path: '/people' },
  ],
  'Plan Events': [
    { label: 'Event Planning', path: '/event-planning' },
    { label: 'Community Hosts', path: '/community-hosts' },
    { label: 'Location Guides', path: '/location-guides' },
  ],
  Connect: [
    { label: 'Help Center', path: '/help-center' },
    { label: 'Contact Support', path: '/contact-support' },
    { label: 'About the Programmers', path: '/about-the-programmers' },
  ],
}

function SiteFooter({ onNavigate, onNavigateToDashboardSection }) {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <h2>Eventcinity</h2>
          <p>Explore, discover and create phenomenal events in the vicinity of the Philippines.</p>
        </div>

        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title} className="footer-column">
            <h3>{title}</h3>
            <ul>
              {links.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    className="footer-link"
                    onClick={() => {
                      if (link.sectionId && onNavigateToDashboardSection) {
                        onNavigateToDashboardSection(link.sectionId)
                        return
                      }

                      onNavigate(link.path)
                    }}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <p>
          (c) 2026 Eventcinity. All rights reserved.
          <br />
          Developed by BulSU BS Computer Engineering A.Y. 2025-2026.
        </p>
      </div>
    </footer>
  )
}

export default SiteFooter
