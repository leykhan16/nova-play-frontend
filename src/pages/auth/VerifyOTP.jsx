import { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";
import { ArrowRight, RefreshCw } from "lucide-react";

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!email) navigate("/register");
  }, [email]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      await authAPI.verifyOTP({ email, otp });
      toast.success("Email verified! You can now login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.resendOTP({ email });
      toast.success("New code sent to your email");
      setCountdown(60);
      setOtp("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not resend OTP");
    } finally {
      setResending(false);
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
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            Check your email for a 6-digit code
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
          {/* Email display */}
          <div
            style={{
              background: "rgba(240,192,64,0.08)",
              border: "1px solid rgba(240,192,64,0.2)",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            <span
              style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
            >
              Code sent to{" "}
            </span>
            <span
              style={{
                color: "var(--gold)",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              {email}
            </span>
          </div>

          <form onSubmit={handleVerify}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                  marginBottom: "6px",
                  fontWeight: 600,
                }}
              >
                Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                maxLength={6}
                style={{
                  width: "100%",
                  padding: "16px",
                  textAlign: "center",
                  background: "var(--navy)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  color: "var(--text-primary)",
                  fontSize: "2rem",
                  fontWeight: 800,
                  letterSpacing: "12px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                  marginTop: "6px",
                  textAlign: "center",
                }}
              >
                Code expires in 60 seconds
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              style={{
                width: "100%",
                padding: "14px",
                background:
                  otp.length === 6
                    ? "linear-gradient(135deg, #f0c040, #c9a227)"
                    : "rgba(240,192,64,0.3)",
                border: "none",
                borderRadius: "10px",
                color: "#000",
                fontWeight: 800,
                fontSize: "1rem",
                cursor: otp.length === 6 ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {loading ? (
                "Verifying..."
              ) : (
                <>
                  Verify Email <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            {countdown > 0 ? (
              <p
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                Resend code in{" "}
                <span style={{ color: "var(--gold)", fontWeight: 600 }}>
                  {countdown}s
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--gold)",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <RefreshCw size={14} />{" "}
                {resending ? "Sending..." : "Resend Code"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
