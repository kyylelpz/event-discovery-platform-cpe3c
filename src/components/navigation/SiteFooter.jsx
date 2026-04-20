const footerLinks = {
  'Use Eventcinity': [
    { label: 'Create Events', path: '/events/create' },
    { label: 'Discover Events', path: '/events' },
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

function SiteFooter({ onNavigate }) {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <h2>Eventcinity</h2>
          <p>
            Discover and create unforgettable experiences across the Philippines with a
            calmer, more editorial event browsing flow.
          </p>
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
                      console.log('navigating to:', link.path)
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
        <p>© 2026 Eventcinity. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default SiteFooter
