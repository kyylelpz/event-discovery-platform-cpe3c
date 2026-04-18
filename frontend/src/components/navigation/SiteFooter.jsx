function SiteFooter() {
  const footerLinks = {
    'Use Eventcinity': ['Create Events', 'Discover Events', 'Connect with People'],
    'Plan Events': ['Event Planning', 'Community Hosts', 'Location Guides'],
    Connect: ['Help Center', 'Contact Support', 'Privacy'],
  }

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
                <li key={link}>
                  <a href="#">{link}</a>
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
