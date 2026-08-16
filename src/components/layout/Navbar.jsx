import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { ThemeContext } from '../../context/ThemeContext'
import { Sun, Moon, Wallet, LogOut, Shield, Menu, X } from 'lucide-react'
import toast from 'react-hot-toast'
import NotificationBell from '../ui/NotificationBell'

export default function Navbar() {
  const { user, logout }       = useContext(AuthContext)
  const { theme, toggleTheme } = useContext(ThemeContext)
  const navigate               = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    navigate('/')
    setMenuOpen(false)
  }

  const linkStyle = {
    color: 'var(--text-secondary)', textDecoration: 'none',
    fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px',
  }

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,10,26,0.97)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)', height: '64px',
        display: 'flex', alignItems: 'center',
        padding: '0 1.25rem', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to={user ? '/lobby' : '/'} style={{ textDecoration: 'none' }}>
          <span style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '1.3rem', letterSpacing: '2px' }}>
            NOVA PLAY
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }} className="desktop-nav">
          {user && (
            <>
              <Link to="/lobby"   style={linkStyle}>Games</Link>
              <Link to="/wallet"  style={linkStyle}><Wallet size={15}/> Wallet</Link>
              <Link to="/support" style={linkStyle}>Support</Link>
              {['admin','super_admin'].includes(user.role) && (
                <Link to="/admin" style={{ ...linkStyle, color: 'var(--gold)' }}>
                  <Shield size={15}/> Admin
                </Link>
              )}
              <span style={{ color:'var(--text-secondary)', fontSize:'0.82rem' }}>Hi, {user.username}</span>
              <NotificationBell />
            </>
          )}

          <button onClick={toggleTheme} style={{
            background:'none', border:'1px solid var(--border)',
            borderRadius:'8px', padding:'6px 9px', cursor:'pointer',
            color:'var(--text-secondary)', display:'flex', alignItems:'center'
          }}>
            {theme === 'dark' ? <Sun size={15}/> : <Moon size={15}/>}
          </button>

          {user && (
            <button onClick={handleLogout} style={{
              background:'none', border:'1px solid var(--border)',
              borderRadius:'8px', padding:'6px 9px', cursor:'pointer',
              color:'#ff4444', display:'flex', alignItems:'center'
            }}>
              <LogOut size={15}/>
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        {user && (
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              display:'none', background:'none', border:'1px solid var(--border)',
              borderRadius:'8px', padding:'6px 9px', cursor:'pointer',
              color:'var(--text-secondary)', alignItems:'center'
            }}
            className="mobile-menu-btn"
          >
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        )}
      </nav>

      {/* Mobile menu */}
      {menuOpen && user && (
        <div style={{
          position:'fixed', top:'64px', left:0, right:0, zIndex:99,
          background:'rgba(10,10,26,0.98)', borderBottom:'1px solid var(--border)',
          padding:'1rem 1.25rem', display:'flex', flexDirection:'column', gap:'1rem'
        }}>
          <Link to="/lobby"   style={linkStyle} onClick={() => setMenuOpen(false)}>🎮 Games</Link>
          <Link to="/wallet"  style={linkStyle} onClick={() => setMenuOpen(false)}>💰 Wallet</Link>
          <Link to="/support" style={linkStyle} onClick={() => setMenuOpen(false)}>🎫 Support</Link>
          {['admin','super_admin'].includes(user.role) && (
            <Link to="/admin" style={{ ...linkStyle, color:'var(--gold)' }} onClick={() => setMenuOpen(false)}>
              🛡️ Admin Panel
            </Link>
          )}
          <div style={{ display:'flex', gap:'1rem', alignItems:'center', paddingTop:'0.5rem', borderTop:'1px solid var(--border)' }}>
            <span style={{ color:'var(--text-secondary)', fontSize:'0.85rem', flex:1 }}>Hi, {user.username}</span>
            <NotificationBell />
            <button onClick={toggleTheme} style={{ background:'none', border:'1px solid var(--border)', borderRadius:'8px', padding:'6px 9px', cursor:'pointer', color:'var(--text-secondary)' }}>
              {theme === 'dark' ? <Sun size={15}/> : <Moon size={15}/>}
            </button>
            <button onClick={handleLogout} style={{ background:'none', border:'1px solid var(--border)', borderRadius:'8px', padding:'6px 9px', cursor:'pointer', color:'#ff4444' }}>
              <LogOut size={15}/>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important }
          .mobile-menu-btn { display: flex !important }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important }
        }
      `}</style>
    </>
  )
}
