const Layout = ({ children, showNav = false, showFooter = false }) => {
  return (
    <div className="min-h-screen bg-accent">
      <main>
        {children}
      </main>
    </div>
  )
}

export default Layout