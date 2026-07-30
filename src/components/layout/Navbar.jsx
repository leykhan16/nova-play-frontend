import { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { ThemeContext } from "../../context/ThemeContext"
import { Sun, Moon, Wallet, LogOut, Shield, HeadphonesIcon } from "lucide-react"
import toast from "react-hot-toast"
import NotificationBell from "../ui/NotificationBell"

export default function Navbar() {
  const { user, logout } = useContext(AuthContext)
  const { theme, toggleTheme } = useContext(ThemeContext)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success("Logged out")
    navigate("/")
  }

  const linkStyle = {
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontSize: "0.9rem",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  }

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(10,10,26,0.95)", backdropFilter: "blur(10px)",
      borderBottom: "1px solid var(--border)", height: "70px",
      display: "flex", alignItems: "center",
      padding: "0 2rem", justifyContent: "space-between",
    }}>
      {/* Logo */}
      <Link to={user ? "/lobby" : "/"} style={{ textDecoration: "none" }}>
        <span style={{ color: "var(--gold)", fontWeight: 900, fontSize: "1.4rem", letterSpacing: "2px" }}>
          NOVA PLAY
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: "flex", gap: "1.2rem", alignItems: "center" }}>
        {user && (
          <>
            <Link to="/lobby" style={linkStyle}>Games</Link>

            <Link to="/wallet" style={linkStyle}>
              <Wallet size={16} /> Wallet
            </Link>

            <Link to="/support" style={linkStyle}>
              Support
            </Link>

            {/* Admin only */}
            {["admin", "super_admin"].includes(user.role) && (
              <Link to="/admin" style={{ ...linkStyle, color: "var(--gold)" }}>
                <Shield size={16} /> Admin
              </Link>
            )}

            <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Hi, {user.username}
            </span>

            <NotificationBell />
          </>
        )}

        {/* Theme toggle */}
        <button onClick={toggleTheme} style={{
          background: "none", border: "1px solid var(--border)",
          borderRadius: "8px", padding: "6px 10px", cursor: "pointer",
          color: "var(--text-secondary)", display: "flex", alignItems: "center",
        }}>
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Logout */}
        {user && (
          <button onClick={handleLogout} style={{
            background: "none", border: "1px solid var(--border)",
            borderRadius: "8px", padding: "6px 10px", cursor: "pointer",
            color: "#ff4444", display: "flex", alignItems: "center", gap: "4px",
          }}>
            <LogOut size={16} />
          </button>
        )}
      </div>
    </nav>
  )
}
