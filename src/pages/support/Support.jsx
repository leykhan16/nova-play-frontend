import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supportAPI } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Plus, X, Send, ChevronDown } from "lucide-react";

const TRANSACTION_TYPES = [
  "Deposit",
  "Withdrawal",
  "Spin & Win",
  "Crash Game",
  "Blackjack",
  "Plinko",
  "Bonus",
  "Other",
];
const GAMES = ["Spin & Win", "Crash", "Blackjack", "Plinko", "General", "N/A"];
const PRIORITIES = ["low", "normal", "high", "urgent"];

const STATUS_COLORS = {
  open: "#f0c040",
  in_progress: "#00d4ff",
  resolved: "#00ff88",
  closed: "#666",
};

const PRIORITY_COLORS = {
  low: "#666",
  normal: "#00d4ff",
  high: "#f0c040",
  urgent: "#ff4444",
};

export default function Support() {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyMsg, setReplyMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    account_id: "",
    transaction_type: "",
    game_played: "",
    amount: "",
    subject: "",
    message: "",
    priority: "normal",
  });

  const fetchTickets = async () => {
    try {
      const res = await supportAPI.getMyTickets();
      setTickets(res.data.data);
    } catch {
      toast.error("Could not load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const openTicket = async (ticket) => {
    try {
      const res = await supportAPI.getTicket(ticket.id);
      setSelected(res.data.data.ticket);
      setReplies(res.data.data.replies);
    } catch {
      toast.error("Could not load ticket");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.subject || !form.message) {
      toast.error("Please fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await supportAPI.createTicket(form);
      toast.success("Ticket submitted! We'll respond within 24 hours.");
      setShowForm(false);
      setForm({
        full_name: "",
        email: "",
        account_id: "",
        transaction_type: "",
        game_played: "",
        amount: "",
        subject: "",
        message: "",
        priority: "normal",
      });
      fetchTickets();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!replyMsg.trim()) return;
    setSubmitting(true);
    try {
      const res = await supportAPI.replyToTicket(selected.id, {
        message: replyMsg,
      });
      setReplies((prev) => [...prev, res.data.data]);
      setReplyMsg("");
      toast.success("Reply sent!");
    } catch {
      toast.error("Could not send reply");
    } finally {
      setSubmitting(false);
    }
  };

  const inp = (extra = {}) => ({
    style: {
      width: "100%",
      padding: "10px 14px",
      background: "var(--navy)",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      color: "var(--text-primary)",
      fontSize: "0.9rem",
      outline: "none",
      boxSizing: "border-box",
      ...extra,
    },
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--navy)",
        padding: "1.5rem",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900 }}>🎫 Support</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              We respond within 24 hours
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: "linear-gradient(135deg,#f0c040,#c9a227)",
              border: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              color: "#000",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Plus size={16} /> New Ticket
          </button>
        </div>

        {/* Ticket list */}
        {loading ? (
          <p
            style={{
              color: "var(--text-secondary)",
              textAlign: "center",
              padding: "3rem",
            }}
          >
            Loading...
          </p>
        ) : tickets.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
              color: "var(--text-secondary)",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎫</div>
            <p>No tickets yet. Create one if you need help.</p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {tickets.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => openTicket(t)}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  padding: "1.2rem",
                  cursor: "pointer",
                  borderLeft: `4px solid ${STATUS_COLORS[t.status] || "#666"}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 700, marginBottom: "4px" }}>
                      {t.subject}
                    </p>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {t.ticket_number} ·{" "}
                      {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexDirection: "column",
                      alignItems: "flex-end",
                    }}
                  >
                    <span
                      style={{
                        background: STATUS_COLORS[t.status] + "20",
                        color: STATUS_COLORS[t.status],
                        padding: "3px 10px",
                        borderRadius: "50px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                      }}
                    >
                      {t.status.replace("_", " ").toUpperCase()}
                    </span>
                    <span
                      style={{
                        background: PRIORITY_COLORS[t.priority] + "20",
                        color: PRIORITY_COLORS[t.priority],
                        padding: "3px 10px",
                        borderRadius: "50px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                      }}
                    >
                      {t.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Ticket detail modal */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "1rem",
              }}
              onClick={() => setSelected(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "20px",
                  padding: "2rem",
                  width: "100%",
                  maxWidth: "600px",
                  maxHeight: "80vh",
                  overflow: "auto",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div>
                    <h3 style={{ fontWeight: 800, fontSize: "1.1rem" }}>
                      {selected.subject}
                    </h3>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {selected.ticket_number}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Original message */}
                <div
                  style={{
                    background: "var(--navy)",
                    borderRadius: "10px",
                    padding: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <p
                    style={{
                      color: "var(--gold)",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      marginBottom: "6px",
                    }}
                  >
                    Original Message
                  </p>
                  <p
                    style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}
                  >
                    {selected.message}
                  </p>
                </div>

                {/* Replies */}
                {replies.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      background: ["admin", "super_admin"].includes(
                        r.sender_role,
                      )
                        ? "rgba(240,192,64,0.08)"
                        : "var(--navy)",
                      border: `1px solid ${["admin", "super_admin"].includes(r.sender_role) ? "rgba(240,192,64,0.3)" : "var(--border)"}`,
                      borderRadius: "10px",
                      padding: "1rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <p
                      style={{
                        color: ["admin", "super_admin"].includes(r.sender_role)
                          ? "var(--gold)"
                          : "#00d4ff",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        marginBottom: "6px",
                      }}
                    >
                      {["admin", "super_admin"].includes(r.sender_role)
                        ? "🛡️ Support Team"
                        : `👤 ${r.username}`}
                      {" · "}
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                    <p
                      style={{
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      {r.message}
                    </p>
                  </div>
                ))}

                {/* Reply input */}
                {selected.status !== "closed" && (
                  <div style={{ marginTop: "1rem" }}>
                    <textarea
                      value={replyMsg}
                      onChange={(e) => setReplyMsg(e.target.value)}
                      placeholder="Type your reply..."
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "var(--navy)",
                        border: "1px solid var(--border)",
                        borderRadius: "10px",
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                        outline: "none",
                        resize: "vertical",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      onClick={handleReply}
                      disabled={submitting || !replyMsg.trim()}
                      style={{
                        marginTop: "8px",
                        padding: "10px 20px",
                        background: "linear-gradient(135deg,#f0c040,#c9a227)",
                        border: "none",
                        borderRadius: "8px",
                        color: "#000",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Send size={14} />{" "}
                      {submitting ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New ticket modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "1rem",
              }}
              onClick={() => setShowForm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "20px",
                  padding: "2rem",
                  width: "100%",
                  maxWidth: "560px",
                  maxHeight: "90vh",
                  overflow: "auto",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <h3 style={{ fontWeight: 800, fontSize: "1.2rem" }}>
                    🎫 New Support Ticket
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                          marginBottom: "4px",
                          fontWeight: 600,
                        }}
                      >
                        Full Name *
                      </label>
                      <input
                        {...inp()}
                        value={form.full_name}
                        onChange={(e) =>
                          setForm({ ...form, full_name: e.target.value })
                        }
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                          marginBottom: "4px",
                          fontWeight: 600,
                        }}
                      >
                        Email *
                      </label>
                      <input
                        {...inp()}
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        placeholder="you@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                          marginBottom: "4px",
                          fontWeight: 600,
                        }}
                      >
                        Account ID
                      </label>
                      <input
                        {...inp()}
                        value={form.account_id}
                        onChange={(e) =>
                          setForm({ ...form, account_id: e.target.value })
                        }
                        placeholder="Your user ID"
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                          marginBottom: "4px",
                          fontWeight: 600,
                        }}
                      >
                        Amount
                      </label>
                      <input
                        {...inp()}
                        type="number"
                        value={form.amount}
                        onChange={(e) =>
                          setForm({ ...form, amount: e.target.value })
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                          marginBottom: "4px",
                          fontWeight: 600,
                        }}
                      >
                        Transaction Type
                      </label>
                      <select
                        {...inp()}
                        value={form.transaction_type}
                        onChange={(e) =>
                          setForm({ ...form, transaction_type: e.target.value })
                        }
                      >
                        <option value="">Select...</option>
                        {TRANSACTION_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                          marginBottom: "4px",
                          fontWeight: 600,
                        }}
                      >
                        Game Played
                      </label>
                      <select
                        {...inp()}
                        value={form.game_played}
                        onChange={(e) =>
                          setForm({ ...form, game_played: e.target.value })
                        }
                      >
                        <option value="">Select...</option>
                        {GAMES.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                          marginBottom: "4px",
                          fontWeight: 600,
                        }}
                      >
                        Priority
                      </label>
                      <select
                        {...inp()}
                        value={form.priority}
                        onChange={(e) =>
                          setForm({ ...form, priority: e.target.value })
                        }
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                          marginBottom: "4px",
                          fontWeight: 600,
                        }}
                      >
                        Subject *
                      </label>
                      <input
                        {...inp()}
                        value={form.subject}
                        onChange={(e) =>
                          setForm({ ...form, subject: e.target.value })
                        }
                        placeholder="Brief description"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      style={{
                        display: "block",
                        color: "var(--text-secondary)",
                        fontSize: "0.8rem",
                        marginBottom: "4px",
                        fontWeight: 600,
                      }}
                    >
                      Message *
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      placeholder="Describe your issue in detail..."
                      rows={5}
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        background: "var(--navy)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                        outline: "none",
                        resize: "vertical",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: "linear-gradient(135deg,#f0c040,#c9a227)",
                      border: "none",
                      borderRadius: "10px",
                      color: "#000",
                      fontWeight: 800,
                      fontSize: "1rem",
                      cursor: "pointer",
                    }}
                  >
                    {submitting ? "Submitting..." : "🎫 Submit Ticket"}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
