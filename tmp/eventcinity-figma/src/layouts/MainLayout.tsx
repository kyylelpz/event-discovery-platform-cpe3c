import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

/**
 * Main Layout Component
 * Wraps pages with consistent Navbar and Footer
 */
export function MainLayout({ children, ...navbarProps }) {
  return (
    <div className="min-h-screen bg-[#FCFCFC] flex flex-col">
      <Navbar {...navbarProps} />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}

/**
 * Example usage in a page:
 *
 * <MainLayout
 *   onCreateClick={() => navigate('/create')}
 *   onSignInClick={() => navigate('/signin')}
 *   onLocationChange={handleLocationChange}
 * >
 *   <YourPageContent />
 * </MainLayout>
 */
