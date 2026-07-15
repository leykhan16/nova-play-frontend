import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { paymentsAPI } from "../../services/api";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { connectSocket } from "../../services/socket";
import toast from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  Send,
  RefreshCw,
  Bell,
  Shield,
  Copy,
} from "lucide-react";

export default function AdminPanel() {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsForm, setDetailsForm] = useState({});
  const [sendingDetails, setSendingDetails] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [inviteCode, setInviteCode] = useState(null);
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState("payments"); // 'payments' | 'tickets'
  const [ticketFilter, setTicketFilter] = useState("open");

  const fetchTickets = async () => {
    try {
      const res = await api.get("/support");
      setTickets(res.data.data);
    } catch {}
  };
  useEffect(() => {
    fetchPayments();
    fetchTickets();

    const socket = connectSocket();
    socket.emit("join_admin_room", { role: user.role });

    // Support ticket listener
    socket.on("new_support_ticket", (data) => {
      setTickets((prev) => [data, ...prev]);
      toast.custom(
        () => (
          <div
            style={{
              background: "#12122a",
              border: "1px solid #c084fc",
              borderRadius: "12px",
              padding: "1rem",
            }}
          >
            <span style={{ color: "#c084fc", fontWeight: 700 }}>
              New Support Ticket
            </span>
          </div>
        ),
        { duration: 6000 },
      );
    });

    socket.on("payment_initiated", (data) => {
      toast.custom(
        () => (
          <div
            style={{
              background: "#12122a",
              border: "1px solid #f0c040",
              borderRadius: "12px",
              padding: "1rem",
              maxWidth: "320px",
              boxShadow: "0 0 20px rgba(240,192,64,0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <Bell size={16} color="#f0c040" />
              <span style={{ color: "#f0c040", fontWeight: 700 }}>
                New Payment Request
              </span>
            </div>
            <p style={{ color: "#a0a0c0", fontSize: "0.85rem" }}>
              {data.username} wants to deposit ${data.amount} via{" "}
              {data.payment_method}
            </p>
          </div>
        ),
        { duration: 6000 },
      );
      setNotifications((prev) => [data, ...prev].slice(0, 10));
      fetchPayments();
    });

    socket.on("payment_confirming", (data) => {
      toast.custom(
        () => (
          <div
            style={{
              background: "#12122a",
              border: "1px solid #00ff88",
              borderRadius: "12px",
              padding: "1rem",
              maxWidth: "320px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <CheckCircle size={16} color="#00ff88" />
              <span style={{ color: "#00ff88", fontWeight: 700 }}>
                Payment Sent!
              </span>
            </div>
            <p style={{ color: "#a0a0c0", fontSize: "0.85rem" }}>
              {data.user} says they've sent ${data.amount} — verify now
            </p>
          </div>
        ),
        { duration: 6000 },
      );
      fetchPayments();
    });

    socket.on("gift_card_submitted", (data) => {
      toast.custom(
        () => (
          <div
            style={{
              background: "#12122a",
              border: "1px solid #c084fc",
              borderRadius: "12px",
              padding: "1rem",
              maxWidth: "320px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <span>🎁</span>
              <span style={{ color: "#c084fc", fontWeight: 700 }}>
                Gift Card Submitted
              </span>
            </div>
            <p style={{ color: "#a0a0c0", fontSize: "0.85rem" }}>
              {data.username} submitted a {data.card_type} gift card — $
              {data.amount}
            </p>
          </div>
        ),
        { duration: 6000 },
      );
      fetchPayments();
    });

    socket.on("jackpot_won", (data) => {
      toast.custom(
        () => (
          <div
            style={{
              background: "#12122a",
              border: "2px solid #c084fc",
              borderRadius: "12px",
              padding: "1rem",
              maxWidth: "320px",
              boxShadow: "0 0 20px rgba(192,132,252,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "6px",
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>🏆</span>
              <span style={{ color: "#c084fc", fontWeight: 900 }}>
                JACKPOT WON!
              </span>
            </div>

            <p style={{ color: "#fff", fontWeight: 700, marginBottom: "2px" }}>
              {data.username}
            </p>

            <p
              style={{
                color: "#00ff88",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              {data.prize}
            </p>

            <p style={{ color: "#a0a0c0", fontSize: "0.8rem" }}>
              via {data.game}
            </p>
          </div>
        ),
        { duration: 10000 },
      );

      setNotifications((prev) =>
        [
          {
            id: Date.now(),
            type: "jackpot",
            title: "JACKPOT!",
            message: `${data.username} won ${data.prize} on ${data.game}`,
            time: new Date().toISOString(),
            color: "#c084fc",
            emoji: "🏆",
          },
          ...prev,
        ].slice(0, 20),
      );
    });

    return () => {
      socket.off("new_support_ticket");
      socket.off("payment_initiated");
      socket.off("payment_confirming");
      socket.off("gift_card_submitted");
      socket.off("jackpot_won");
      socket.disconnect();
    };
  }, [user]);

  const fetchPayments = async () => {
    try {
      const res = await paymentsAPI.getPending();
      setPayments(res.data.data);
    } catch (err) {
      toast.error("Could not load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInvite = async () => {
    setGeneratingInvite(true);
    try {
      const res = await api.post("/auth/invite");
      setInviteCode(res.data.data.code);
      toast.success("Invite code generated — valid for 48 hours");
    } catch (err) {
      toast.error("Could not generate invite");
    } finally {
      setGeneratingInvite(false);
    }
  };

  const handleSendDetails = async (paymentId) => {
    if (
      !detailsForm[paymentId] ||
      Object.keys(detailsForm[paymentId]).length === 0
    ) {
      toast.error("Enter payment details first");
      return;
    }
    setSendingDetails(true);
    try {
      await paymentsAPI.sendDetails(paymentId, {
        details: detailsForm[paymentId],
      });
      toast.success("Payment details sent to user");
      setSelectedPayment(null);
      setDetailsForm({});
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send details");
    } finally {
      setSendingDetails(false);
    }
  };

  const handleApprove = async (paymentId) => {
    try {
      await paymentsAPI.approve(paymentId);
      toast.success("Payment approved — wallet credited!");
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not approve");
    }
  };

  const handleReject = async (paymentId) => {
    try {
      await paymentsAPI.reject(paymentId, {
        notes: rejectNote || "Payment rejected by admin",
      });
      toast.success("Payment rejected");
      setRejectNote("");
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not reject");
    }
  };

  const methodIcon = (method) => {
    const icons = {
      bank_transfer: "🏦",
      crypto: "₿",
      zelle: "💸",
      card: "💳",
      apple_pay: "🍎",
      gift_card: "🎁",
    };
    return icons[method] || "💰";
  };

  const statusColor = (status) => {
    const colors = {
      pending: "#f0c040",
      confirming: "#00d4ff",
      completed: "#00ff88",
      failed: "#ff4444",
    };
    return colors[status] || "#a0a0c0";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--navy)",
        padding: "1.5rem",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: "2rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 900 }}>
                🛡️ Admin Panel
              </h1>
              <p
                style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}
              >
                Logged in as{" "}
                <span style={{ color: "var(--gold)" }}>{user?.username}</span> ·{" "}
                {user?.role}
              </p>
            </div>
            <button
              onClick={fetchPayments}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "10px",
                cursor: "pointer",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {[
            {
              label: "Pending Payments",
              value: payments.filter((p) => p.status === "pending").length,
              color: "#f0c040",
            },
            {
              label: "Awaiting Confirm",
              value: payments.filter((p) => p.status === "confirming").length,
              color: "#00d4ff",
            },
            {
              label: "Total Requests",
              value: payments.length,
              color: "#00ff88",
            },
            {
              label: "Notifications",
              value: notifications.length,
              color: "#c084fc",
            },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                padding: "1.2rem",
                textAlign: "center",
              }}
            >
              <p style={{ color: s.color, fontWeight: 900, fontSize: "2rem" }}>
                {s.value}
              </p>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Invite Admin — super admin only */}
        {user?.role === "super_admin" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "var(--card)",
              border: "1px solid rgba(240,192,64,0.2)",
              borderRadius: "16px",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <h3
              style={{
                fontWeight: 700,
                marginBottom: "1rem",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Shield size={16} color="var(--gold)" /> Invite New Admin
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              Generate a one-time invite code. Valid for 48 hours. Share it with
              the new admin and direct them to{" "}
              <span style={{ color: "#00d4ff" }}>/register-admin</span>
            </p>

            {inviteCode ? (
              <div
                style={{
                  background: "rgba(240,192,64,0.08)",
                  border: "1px solid rgba(240,192,64,0.3)",
                  borderRadius: "10px",
                  padding: "1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.8rem",
                      marginBottom: "4px",
                    }}
                  >
                    Share this code:
                  </p>
                  <p
                    style={{
                      color: "var(--gold)",
                      fontFamily: "monospace",
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      letterSpacing: "2px",
                    }}
                  >
                    {inviteCode}
                  </p>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.75rem",
                      marginTop: "4px",
                    }}
                  >
                    Register at:{" "}
                    <span style={{ color: "#00d4ff" }}>/register-admin</span>
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inviteCode);
                      toast.success("Copied!");
                    }}
                    style={{
                      background: "rgba(240,192,64,0.2)",
                      border: "1px solid rgba(240,192,64,0.3)",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      cursor: "pointer",
                      color: "var(--gold)",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Copy size={14} /> Copy
                  </button>
                  <button
                    onClick={() => setInviteCode(null)}
                    style={{
                      background: "none",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      cursor: "pointer",
                      color: "var(--text-secondary)",
                      fontSize: "0.85rem",
                    }}
                  >
                    New Code
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleGenerateInvite}
                disabled={generatingInvite}
                style={{
                  background: "linear-gradient(135deg, #f0c040, #c9a227)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "10px 20px",
                  color: "#000",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Shield size={14} />{" "}
                {generatingInvite ? "Generating..." : "Generate Invite Code"}
              </button>
            )}
          </motion.div>
        )}

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
          {[
            { key: "payments", label: "💰 Payments", count: payments.length },
            {
              key: "tickets",
              label: "🎫 Support",
              count: tickets.filter((t) => t.status === "open").length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: 700,
                background:
                  activeTab === tab.key ? "var(--gold)" : "var(--card)",
                color: activeTab === tab.key ? "#000" : "var(--text-secondary)",
                border:
                  activeTab === tab.key ? "none" : "1px solid var(--border)",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  style={{
                    background:
                      activeTab === tab.key ? "rgba(0,0,0,0.2)" : "var(--gold)",
                    color: activeTab === tab.key ? "#000" : "#000",
                    borderRadius: "50px",
                    padding: "1px 8px",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tickets panel */}
        {activeTab === "tickets" && (
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "20px",
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <h3 style={{ fontWeight: 800, fontSize: "1.1rem" }}>
                Support Tickets
              </h3>
              <div style={{ display: "flex", gap: "6px" }}>
                {["open", "in_progress", "resolved", "all"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setTicketFilter(f)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background:
                        ticketFilter === f
                          ? "rgba(240,192,64,0.2)"
                          : "var(--navy)",
                      border:
                        ticketFilter === f
                          ? "1px solid var(--gold)"
                          : "1px solid var(--border)",
                      color:
                        ticketFilter === f
                          ? "var(--gold)"
                          : "var(--text-secondary)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {f.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {tickets.filter(
              (t) => ticketFilter === "all" || t.status === ticketFilter,
            ).length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "var(--text-secondary)",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                  🎫
                </div>
                No {ticketFilter} tickets
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {tickets
                  .filter(
                    (t) => ticketFilter === "all" || t.status === ticketFilter,
                  )
                  .map((ticket) => {
                    const statusColors = {
                      open: "#ff4444",
                      in_progress: "#f0c040",
                      resolved: "#00ff88",
                      closed: "#666",
                    };
                    const catIcons = {
                      failed_transaction: "❌",
                      pending_payment: "⏳",
                      withdrawal: "💸",
                      prize: "🎁",
                      account: "👤",
                      other: "💬",
                    };

                    return (
                      <div
                        key={ticket.id}
                        style={{
                          background: "var(--navy)",
                          border: "1px solid var(--border)",
                          borderRadius: "14px",
                          padding: "1.5rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "1rem",
                            flexWrap: "wrap",
                            gap: "8px",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "4px",
                              }}
                            >
                              <span>{catIcons[ticket.category] || "💬"}</span>
                              <span style={{ fontWeight: 700 }}>
                                {ticket.name}
                              </span>
                              <span
                                style={{
                                  color: "var(--text-secondary)",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {ticket.email}
                              </span>
                            </div>
                            <p
                              style={{
                                color: "var(--gold)",
                                fontWeight: 600,
                                margin: "0 0 4px",
                              }}
                            >
                              {ticket.subject}
                            </p>
                            {ticket.payment_reference && (
                              <p
                                style={{
                                  color: "var(--text-secondary)",
                                  fontSize: "0.8rem",
                                  margin: 0,
                                }}
                              >
                                Ref:{" "}
                                <span
                                  style={{
                                    color: "#00d4ff",
                                    fontFamily: "monospace",
                                  }}
                                >
                                  {ticket.payment_reference}
                                </span>
                              </p>
                            )}
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span
                              style={{
                                background: statusColors[ticket.status] + "15",
                                color: statusColors[ticket.status],
                                padding: "4px 10px",
                                borderRadius: "50px",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              {ticket.status.replace("_", " ").toUpperCase()}
                            </span>
                            <span
                              style={{
                                color: "var(--text-secondary)",
                                fontSize: "0.75rem",
                              }}
                            >
                              {new Date(ticket.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Message */}
                        <div
                          style={{
                            background: "var(--card)",
                            borderRadius: "8px",
                            padding: "12px",
                            marginBottom: "1rem",
                            color: "var(--text-secondary)",
                            fontSize: "0.88rem",
                            lineHeight: 1.6,
                          }}
                        >
                          {ticket.message}
                        </div>

                        {/* Status update */}
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          {["in_progress", "resolved", "closed"].map((s) => (
                            <button
                              key={s}
                              onClick={async () => {
                                try {
                                  await api.patch(`/support/${ticket.id}`, {
                                    status: s,
                                  });
                                  toast.success(
                                    `Ticket marked as ${s.replace("_", " ")}`,
                                  );
                                  fetchTickets();
                                } catch {
                                  toast.error("Could not update ticket");
                                }
                              }}
                              disabled={ticket.status === s}
                              style={{
                                padding: "7px 14px",
                                borderRadius: "8px",
                                cursor:
                                  ticket.status === s ? "default" : "pointer",
                                background:
                                  ticket.status === s
                                    ? "rgba(255,255,255,0.05)"
                                    : statusColors[s] + "15",
                                border: `1px solid ${ticket.status === s ? "var(--border)" : statusColors[s] + "40"}`,
                                color:
                                  ticket.status === s
                                    ? "var(--text-secondary)"
                                    : statusColors[s],
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                textTransform: "capitalize",
                              }}
                            >
                              {s.replace("_", " ")}
                            </button>
                          ))}

                          {/* Reply via email */}
                          <a
                            href={`mailto:${ticket.email}?subject=Re: ${encodeURIComponent(ticket.subject)} [#${ticket.id.slice(0, 8).toUpperCase()}]`}
                            style={{
                              padding: "7px 14px",
                              borderRadius: "8px",
                              background: "rgba(0,212,255,0.1)",
                              border: "1px solid rgba(0,212,255,0.3)",
                              color: "#00d4ff",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            📧 Reply via Email
                          </a>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Payments list */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            padding: "1.5rem",
          }}
        >
          <h3
            style={{
              fontWeight: 800,
              marginBottom: "1.5rem",
              fontSize: "1.1rem",
            }}
          >
            Payment Requests
          </h3>

          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "var(--text-secondary)",
              }}
            >
              <RefreshCw
                size={24}
                style={{ animation: "spin 1s linear infinite" }}
              />
            </div>
          ) : payments.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "var(--text-secondary)",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✅</div>
              No pending payments
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {payments.map((payment) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    background: "var(--navy)",
                    border: "1px solid var(--border)",
                    borderRadius: "14px",
                    padding: "1.5rem",
                  }}
                >
                  {/* Payment header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>
                          {methodIcon(payment.payment_method)}
                        </span>
                        <span style={{ fontWeight: 700 }}>
                          {payment.username}
                        </span>
                        <span
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.85rem",
                          }}
                        >
                          {payment.email}
                        </span>
                      </div>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                        }}
                      >
                        Ref:{" "}
                        <span
                          style={{
                            color: "var(--gold)",
                            fontFamily: "monospace",
                          }}
                        >
                          {payment.payment_reference}
                        </span>
                      </p>

                      {/* Gift card details */}
                      {payment.payment_method === "gift_card" &&
                        payment.gift_card_details && (
                          <div
                            style={{
                              background: "rgba(240,192,64,0.06)",
                              border: "1px solid rgba(240,192,64,0.2)",
                              borderRadius: "8px",
                              padding: "10px 14px",
                              marginTop: "8px",
                              fontSize: "0.82rem",
                            }}
                          >
                            <p
                              style={{
                                color: "var(--gold)",
                                fontWeight: 700,
                                marginBottom: "6px",
                              }}
                            >
                              🎁 Gift Card Details
                            </p>
                            {payment.gift_card_image_url && (
                              <a
                                href={payment.gift_card_image_url}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: "block",
                                  marginBottom: "8px",
                                }}
                              >
                                <img
                                  src={payment.gift_card_image_url}
                                  alt="Gift card"
                                  style={{
                                    maxWidth: "200px",
                                    borderRadius: "6px",
                                    border: "1px solid var(--border)",
                                  }}
                                />
                              </a>
                            )}
                            {Object.entries(
                              typeof payment.gift_card_details === "string"
                                ? JSON.parse(payment.gift_card_details)
                                : payment.gift_card_details,
                            )
                              .filter(([, v]) => v)
                              .map(([k, v]) => (
                                <p
                                  key={k}
                                  style={{
                                    color: "var(--text-secondary)",
                                    marginBottom: "2px",
                                  }}
                                >
                                  <span style={{ color: "#888" }}>
                                    {k.replace(/_/g, " ")}:{" "}
                                  </span>
                                  <span
                                    style={{
                                      color: "var(--text-primary)",
                                      fontWeight: 600,
                                      fontFamily: "monospace",
                                    }}
                                  >
                                    {v}
                                  </span>
                                </p>
                              ))}
                          </div>
                        )}
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <p
                        style={{
                          fontWeight: 900,
                          fontSize: "1.3rem",
                          color: "var(--text-primary)",
                        }}
                      >
                        ${parseFloat(payment.amount).toLocaleString()}
                      </p>
                      <span
                        style={{
                          background: statusColor(payment.status) + "15",
                          color: statusColor(payment.status),
                          padding: "3px 10px",
                          borderRadius: "50px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        {payment.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Send details — for pending payments */}
                  {payment.status === "pending" && (
                    <div
                      style={{
                        borderTop: "1px solid var(--border)",
                        paddingTop: "1rem",
                      }}
                    >
                      {selectedPayment === payment.id ? (
                        <div>
                          <p
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.85rem",
                              marginBottom: "0.75rem",
                            }}
                          >
                            Send {payment.payment_method.replace("_", " ")}{" "}
                            details to user:
                          </p>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                              marginBottom: "1rem",
                            }}
                          >
                            {payment.payment_method === "bank_transfer" &&
                              [
                                "account_name",
                                "account_number",
                                "bank",
                                "routing_number",
                              ].map((field) => (
                                <input
                                  key={field}
                                  placeholder={field
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                  onChange={(e) =>
                                    setDetailsForm((prev) => ({
                                      ...prev,
                                      [payment.id]: {
                                        ...prev[payment.id],
                                        [field]: e.target.value,
                                      },
                                    }))
                                  }
                                  style={{
                                    padding: "10px 14px",
                                    background: "var(--card)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "8px",
                                    color: "var(--text-primary)",
                                    fontSize: "0.9rem",
                                    outline: "none",
                                  }}
                                />
                              ))}
                            {payment.payment_method === "crypto" &&
                              ["btc_address", "eth_address", "network"].map(
                                (field) => (
                                  <input
                                    key={field}
                                    placeholder={field
                                      .replace(/_/g, " ")
                                      .toUpperCase()}
                                    onChange={(e) =>
                                      setDetailsForm((prev) => ({
                                        ...prev,
                                        [payment.id]: {
                                          ...prev[payment.id],
                                          [field]: e.target.value,
                                        },
                                      }))
                                    }
                                    style={{
                                      padding: "10px 14px",
                                      background: "var(--card)",
                                      border: "1px solid var(--border)",
                                      borderRadius: "8px",
                                      color: "var(--text-primary)",
                                      fontSize: "0.9rem",
                                      outline: "none",
                                    }}
                                  />
                                ),
                              )}
                            {payment.payment_method === "zelle" &&
                              [
                                "zelle_email",
                                "zelle_phone",
                                "recipient_name",
                              ].map((field) => (
                                <input
                                  key={field}
                                  placeholder={field
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                  onChange={(e) =>
                                    setDetailsForm((prev) => ({
                                      ...prev,
                                      [payment.id]: {
                                        ...prev[payment.id],
                                        [field]: e.target.value,
                                      },
                                    }))
                                  }
                                  style={{
                                    padding: "10px 14px",
                                    background: "var(--card)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "8px",
                                    color: "var(--text-primary)",
                                    fontSize: "0.9rem",
                                    outline: "none",
                                  }}
                                />
                              ))}
                            {["card", "apple_pay"].includes(
                              payment.payment_method,
                            ) && (
                              <input
                                placeholder="Stripe payment link or instructions"
                                onChange={(e) =>
                                  setDetailsForm((prev) => ({
                                    ...prev,
                                    [payment.id]: {
                                      ...prev[payment.id],
                                      instructions: e.target.value,
                                    },
                                  }))
                                }
                                style={{
                                  padding: "10px 14px",
                                  background: "var(--card)",
                                  border: "1px solid var(--border)",
                                  borderRadius: "8px",
                                  color: "var(--text-primary)",
                                  fontSize: "0.9rem",
                                  outline: "none",
                                }}
                              />
                            )}
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleSendDetails(payment.id)}
                              disabled={sendingDetails}
                              style={{
                                background:
                                  "linear-gradient(135deg, #f0c040, #c9a227)",
                                border: "none",
                                borderRadius: "8px",
                                padding: "10px 16px",
                                color: "#000",
                                fontWeight: 700,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "0.85rem",
                              }}
                            >
                              <Send size={14} />{" "}
                              {sendingDetails ? "Sending..." : "Send Details"}
                            </button>
                            <button
                              onClick={() => setSelectedPayment(null)}
                              style={{
                                background: "none",
                                border: "1px solid var(--border)",
                                borderRadius: "8px",
                                padding: "10px 16px",
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedPayment(payment.id)}
                          style={{
                            background: "rgba(240,192,64,0.1)",
                            border: "1px solid rgba(240,192,64,0.3)",
                            borderRadius: "8px",
                            padding: "10px 16px",
                            color: "var(--gold)",
                            cursor: "pointer",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.85rem",
                          }}
                        >
                          <Send size={14} /> Send Payment Details
                        </button>
                      )}
                    </div>
                  )}

                  {/* Approve/Reject — for confirming payments */}
                  {payment.status === "confirming" && (
                    <div
                      style={{
                        borderTop: "1px solid var(--border)",
                        paddingTop: "1rem",
                      }}
                    >
                      <p
                        style={{
                          color: "#00d4ff",
                          fontSize: "0.85rem",
                          marginBottom: "1rem",
                          fontWeight: 600,
                        }}
                      >
                        ✅ User says they've sent the payment. Verify and
                        approve or reject.
                      </p>
                      <input
                        placeholder="Rejection note (optional)"
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          marginBottom: "0.75rem",
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          color: "var(--text-primary)",
                          fontSize: "0.9rem",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => handleApprove(payment.id)}
                          style={{
                            background:
                              "linear-gradient(135deg, #00ff88, #00cc66)",
                            border: "none",
                            borderRadius: "8px",
                            padding: "10px 20px",
                            color: "#000",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.85rem",
                            flex: 1,
                            justifyContent: "center",
                          }}
                        >
                          <CheckCircle size={16} /> Approve & Credit Wallet
                        </button>
                        <button
                          onClick={() => handleReject(payment.id)}
                          style={{
                            background: "rgba(255,68,68,0.1)",
                            border: "1px solid rgba(255,68,68,0.3)",
                            borderRadius: "8px",
                            padding: "10px 20px",
                            color: "#ff4444",
                            cursor: "pointer",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.85rem",
                          }}
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
