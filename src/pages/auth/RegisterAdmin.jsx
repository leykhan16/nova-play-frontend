import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Eye, EyeOff, ArrowRight, Shield } from "lucide-react";

export default function RegisterAdmin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    inviteCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!form.inviteCode) {
      toast.error("Invite code is required");
      return;
    }

    setLoading(true);
    try {
      await authAPI.registerAdmin(form);
      toast.success("Admin account created! You can now login.");
      navigate("/login");
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
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: "440px" }}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "0.5rem",
            }}
          >
            <Shield size={16} color="var(--gold)" />
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Admin Registration
            </p>
          </div>
        </div>

        <div
          style={{
            background: "var(--card)",
            border: "1px solid rgba(240,192,64,0.3)",
            borderRadius: "20px",
            padding: "2.5rem",
          }}
        >
          {/* Invite code notice */}
          <div
            style={{
              background: "rgba(240,192,64,0.08)",
              border: "1px solid rgba(240,192,64,0.2)",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "1.5rem",
            }}
          >
            <p
              style={{
                color: "var(--gold)",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              🔐 Admin accounts require an invite code from a Super Admin.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {[
              {
                key: "email",
                label: "Email",
                type: "email",
                placeholder: "admin@example.com",
              },
              {
                key: "username",
                label: "Username",
                type: "text",
                placeholder: "adminname",
              },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: "1.2rem" }}>
                <label
                  style={{
                    display: "block",
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    marginBottom: "6px",
                    fontWeight: 600,
                  }}
                >
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) =>
                    setForm({ ...form, [field.key]: e.target.value })
                  }
                  required
                  placeholder={field.placeholder}
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
            ))}

            {/* Password */}
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

            {/* Invite code */}
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
                Invite Code
              </label>
              <input
                type="text"
                value={form.inviteCode}
                onChange={(e) =>
                  setForm({ ...form, inviteCode: e.target.value.toUpperCase() })
                }
                required
                placeholder="NOVA-XXXXXXXXXXXX"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "var(--navy)",
                  border: "1px solid rgba(240,192,64,0.3)",
                  borderRadius: "10px",
                  color: "var(--gold)",
                  fontSize: "0.95rem",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "monospace",
                  letterSpacing: "2px",
                  fontWeight: 700,
                }}
              />
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
                "Creating Account..."
              ) : (
                <>
                  <Shield size={16} /> Create Admin Account
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
      </motion.div>
    </div>
  );
}
