export function Footer() {
  const footerLinks = {
    'Use Eventcinity': ['Create Events', 'Discover Events', 'Connect with People', 'Mobile Apps'],
    'Plan Events': ['Event Registration', 'Event Planning', 'Event Marketing', 'Host Resources'],
    'Connect': ['Contact Support', 'Help Center', 'Terms', 'Privacy']
  };

  return (
    <footer className="mt-12 sm:mt-16 lg:mt-20 border-t border-[#C0C0C1] bg-[#FCFCFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-3 sm:space-y-4">
            <h2 className="text-xl sm:text-2xl text-[#020202]">Eventcinity</h2>
            <p className="text-xs sm:text-sm text-[#696258]">
              Discover and create unforgettable experiences across the Philippines.
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-base text-[#020202]">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs sm:text-sm text-[#696258] hover:text-[#2D3B15] transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 border-t border-[#C0C0C1]">
          <p className="text-xs sm:text-sm text-[#696258] text-center">
            © 2026 Eventcinity. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
