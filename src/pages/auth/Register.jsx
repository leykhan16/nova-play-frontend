import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created! Check your email for your OTP.");
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
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
      {/* Background glow */}
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
        {/* Logo */}
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
            Create your account
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            padding: "2.5rem",
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Email */}
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

            {/* Username */}
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
                Username
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                placeholder="novastar"
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

            {/* Password */}
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
                  placeholder="Min. 8 characters"
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

            {/* Submit */}
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
                "Creating Account..."
              ) : (
                <>
                  Create Account <ArrowRight size={18} />
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
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "var(--gold)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Login
            </Link>
          </p>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            color: "var(--text-secondary)",
            fontSize: "0.75rem",
          }}
        >
          By registering you agree to play responsibly. 18+ only.
        </p>
      </motion.div>
    </div>
  );
}
