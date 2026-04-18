import { routes } from '../../utils/routing.js'

const footerLinks = {
  'Use Eventcinity': [
    { label: 'Create Events', path: routes.createEvent },
    { label: 'Discover Events', path: routes.events },
    { label: 'Connect with People', path: routes.people },
  ],
  'Plan Events': [
    { label: 'Event Planning', path: routes.eventPlanning },
    { label: 'Community Hosts', path: routes.communityHosts },
    { label: 'Location Guides', path: routes.locationGuides },
  ],
  Connect: [
    { label: 'Help Center', path: routes.helpCenter },
    { label: 'Contact Support', path: routes.contactSupport },
    { label: 'About the Programmers', path: routes.aboutProgrammers },
  ],
}

function SiteFooter({ onNavigate }) {

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <h2>Eventcinity</h2>
          <p>
            Discover and create unforgettable experiences across Luzon with a
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
                    onClick={() => onNavigate(link.path)}
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
