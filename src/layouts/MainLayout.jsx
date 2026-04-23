import Navbar from '../components/navigation/Navbar.jsx'
import SiteFooter from '../components/navigation/SiteFooter.jsx'

function MainLayout({ navProps, children }) {
  return (
    <div className="site-shell">
      <Navbar {...navProps} />
      <main className="page-shell">{children}</main>
      <SiteFooter
        onNavigate={navProps.onNavigate}
        onNavigateToDashboardSection={navProps.onNavigateToDashboardSection}
      />
    </div>
  )
}

export default MainLayout
