import { useState, useContext } from "react";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  Send,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";

const CATEGORIES = [
  { value: "failed_transaction", label: "Failed Transaction", icon: "❌" },
  { value: "pending_payment", label: "Pending Payment", icon: "⏳" },
  { value: "withdrawal", label: "Withdrawal Issue", icon: "💸" },
  { value: "prize", label: "Prize Claim", icon: "🎁" },
  { value: "account", label: "Account Issue", icon: "👤" },
  { value: "other", label: "Other", icon: "💬" },
];

export default function Support() {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: user?.username || "",
    email: "",
    category: "",
    subject: "",
    message: "",
    payment_reference: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) {
      toast.error("Please select a category");
      return;
    }
    if (!form.message || form.message.length < 20) {
      toast.error("Please provide more details (min 20 characters)");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/support", {
        ...form,
        user_id: user?.id || null,
      });
      setSubmitted(res.data.data.ticket_id);
      toast.success("Support ticket submitted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--navy)",
          padding: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ maxWidth: "500px", width: "100%", textAlign: "center" }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✅</div>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 900,
              marginBottom: "1rem",
              color: "#00ff88",
            }}
          >
            Ticket Submitted!
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            We've received your request and will respond within 24 hours to your
            email.
          </p>
          <div
            style={{
              background: "rgba(240,192,64,0.08)",
              border: "1px solid rgba(240,192,64,0.3)",
              borderRadius: "12px",
              padding: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                marginBottom: "4px",
              }}
            >
              Your ticket reference
            </p>
            <p
              style={{
                color: "#f0c040",
                fontFamily: "monospace",
                fontWeight: 900,
                fontSize: "1.5rem",
                letterSpacing: "3px",
              }}
            >
              #{submitted}
            </p>
          </div>
          <button
            onClick={() => {
              setSubmitted(null);
              setForm({
                name: user?.username || "",
                email: "",
                category: "",
                subject: "",
                message: "",
                payment_reference: "",
              });
            }}
            style={{
              background: "linear-gradient(135deg,#f0c040,#c9a227)",
              border: "none",
              borderRadius: "10px",
              padding: "12px 28px",
              color: "#000",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Submit Another Ticket
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      style={{ minHeight: "100vh", background: "var(--navy)", padding: "2rem" }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: "2rem" }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 900,
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <MessageSquare size={28} color="#f0c040" /> Support Center
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Having an issue? We're here to help. Average response time: under 24
            hours.
          </p>
        </motion.div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "20px",
              padding: "2rem",
            }}
          >
            <h3
              style={{
                fontWeight: 800,
                marginBottom: "1.5rem",
                fontSize: "1.1rem",
              }}
            >
              Submit a Ticket
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Name + Email */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.2rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      color: "var(--text-secondary)",
                      fontSize: "0.85rem",
                      marginBottom: "6px",
                      fontWeight: 600,
                    }}
                  >
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    required
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    style={{
                      width: "100%",
                      padding: "11px 14px",
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
                <div>
                  <label
                    style={{
                      display: "block",
                      color: "var(--text-secondary)",
                      fontSize: "0.85rem",
                      marginBottom: "6px",
                      fontWeight: 600,
                    }}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    required
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="your@email.com"
                    style={{
                      width: "100%",
                      padding: "11px 14px",
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
              </div>

              {/* Category */}
              <div style={{ marginBottom: "1.2rem" }}>
                <label
                  style={{
                    display: "block",
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    marginBottom: "8px",
                    fontWeight: 600,
                  }}
                >
                  Category *
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: "8px",
                  }}
                >
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setForm({ ...form, category: c.value })}
                      style={{
                        padding: "10px 8px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        background:
                          form.category === c.value
                            ? "rgba(240,192,64,0.15)"
                            : "var(--navy)",
                        border:
                          form.category === c.value
                            ? "2px solid #f0c040"
                            : "1px solid var(--border)",
                        color:
                          form.category === c.value
                            ? "#f0c040"
                            : "var(--text-secondary)",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "1.1rem", marginBottom: "2px" }}>
                        {c.icon}
                      </div>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
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
                  Subject *
                </label>
                <input
                  type="text"
                  value={form.subject}
                  required
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  placeholder="Brief description of your issue"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
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

              {/* Payment reference */}
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
                  Payment Reference{" "}
                  <span style={{ color: "#666", fontWeight: 400 }}>
                    (optional — if related to a transaction)
                  </span>
                </label>
                <input
                  type="text"
                  value={form.payment_reference}
                  onChange={(e) =>
                    setForm({ ...form, payment_reference: e.target.value })
                  }
                  placeholder="NP-XXXXXXXXXX"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    background: "var(--navy)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    color: "#f0c040",
                    fontSize: "0.95rem",
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "monospace",
                  }}
                />
              </div>

              {/* Message */}
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
                  Message *{" "}
                  <span style={{ color: "#666", fontWeight: 400 }}>
                    ({form.message.length}/1000)
                  </span>
                </label>
                <textarea
                  value={form.message}
                  required
                  maxLength={1000}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder="Describe your issue in detail. Include dates, amounts, and any error messages you saw..."
                  rows={6}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "var(--navy)",
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    color: "var(--text-primary)",
                    fontSize: "0.95rem",
                    outline: "none",
                    boxSizing: "border-box",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: submitting
                    ? "rgba(240,192,64,0.4)"
                    : "linear-gradient(135deg,#f0c040,#c9a227)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#000",
                  fontWeight: 800,
                  fontSize: "1rem",
                  cursor: submitting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <Send size={16} />{" "}
                {submitting ? "Submitting..." : "Submit Ticket"}
              </button>
            </form>
          </motion.div>

          {/* Sidebar info */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {/* Response times */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "1.5rem",
              }}
            >
              <h3
                style={{
                  fontWeight: 700,
                  marginBottom: "1rem",
                  fontSize: "0.95rem",
                }}
              >
                Response Times
              </h3>
              {[
                {
                  icon: "❌",
                  label: "Failed Transactions",
                  time: "< 2 hours",
                  color: "#ff4444",
                },
                {
                  icon: "⏳",
                  label: "Pending Payments",
                  time: "< 4 hours",
                  color: "#f0c040",
                },
                {
                  icon: "💸",
                  label: "Withdrawals",
                  time: "< 12 hours",
                  color: "#00d4ff",
                },
                {
                  icon: "🎁",
                  label: "Prize Claims",
                  time: "< 24 hours",
                  color: "#c084fc",
                },
                {
                  icon: "💬",
                  label: "General Issues",
                  time: "< 24 hours",
                  color: "#00ff88",
                },
              ].map((r) => (
                <div
                  key={r.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.85rem",
                    }}
                  >
                    {r.icon} {r.label}
                  </span>
                  <span
                    style={{
                      background: r.color + "15",
                      color: r.color,
                      padding: "2px 8px",
                      borderRadius: "50px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {r.time}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "1.5rem",
              }}
            >
              <h3
                style={{
                  fontWeight: 700,
                  marginBottom: "1rem",
                  fontSize: "0.95rem",
                }}
              >
                💡 Tips for Faster Help
              </h3>
              {[
                "Include your payment reference number",
                "Mention the exact amount involved",
                "Describe what you expected vs what happened",
                "Include the date and time of the issue",
                "Attach screenshots if possible",
              ].map((tip, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "8px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      color: "#f0c040",
                      fontSize: "0.8rem",
                      marginTop: "2px",
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.83rem",
                    }}
                  >
                    {tip}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                background: "rgba(0,255,136,0.06)",
                border: "1px solid rgba(0,255,136,0.2)",
                borderRadius: "16px",
                padding: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <CheckCircle size={16} color="#00ff88" />
                <span
                  style={{
                    color: "#00ff88",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                  }}
                >
                  All Systems Operational
                </span>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                Payments, games and withdrawals are running normally.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
