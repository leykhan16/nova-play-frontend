import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      <Navbar />
      <main style={{ paddingTop: '70px' }}>
        {children}
      </main>
    </div>
  )
}
