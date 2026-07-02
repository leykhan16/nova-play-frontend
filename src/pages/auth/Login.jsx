import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.username}!`);
      navigate("/lobby");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--navy)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "fixed",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(240,192,64,0.06) 0%, transparent 70%)",
          borderRadius: "50%",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: "100%",
          maxWidth: "440px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <span
              style={{
                color: "var(--gold)",
                fontWeight: 900,
                fontSize: "1.8rem",
                letterSpacing: "3px",
              }}
            >
              NOVA PLAY
            </span>
          </Link>
          <p
            style={{
              color: "var(--text-secondary)",
              marginTop: "0.5rem",
              fontSize: "0.9rem",
            }}
          >
            Welcome back
          </p>
        </div>

        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            padding: "2.5rem",
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1.2rem" }}>
              <label
                style={{
                  display: "block",
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                  marginBottom: "6px",
                  fontWeight: 600,
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "var(--navy)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "1.8rem" }}>
              <label
                style={{
                  display: "block",
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                  marginBottom: "6px",
                  fontWeight: 600,
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  placeholder="Your password"
                  style={{
                    width: "100%",
                    padding: "12px 44px 12px 16px",
                    background: "var(--navy)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    color: "var(--text-primary)",
                    fontSize: "0.95rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                background: loading
                  ? "rgba(240,192,64,0.5)"
                  : "linear-gradient(135deg, #f0c040, #c9a227)",
                border: "none",
                borderRadius: "10px",
                color: "#000",
                fontWeight: 800,
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {loading ? (
                "Logging in..."
              ) : (
                <>
                  Login <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "1.5rem",
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
            }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "var(--gold)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
