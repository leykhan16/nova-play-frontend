import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { paymentsAPI, supportAPI } from "../../services/api";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { connectSocket } from "../../services/socket";
import toast from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  Send,
  RefreshCw,
  Shield,
  Copy,
  Bell,
  Package,
  Ticket,
  CreditCard,
  Users,
} from "lucide-react";

const TABS = [
  { id: "payments", label: "Payments", icon: <CreditCard size={16} /> },
  { id: "tickets", label: "Support", icon: <Ticket size={16} /> },
  { id: "deliveries", label: "Prizes", icon: <Package size={16} /> },
  { id: "admins", label: "Admins", icon: <Users size={16} /> },
];

export default function AdminPanel() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("payments");
  const [payments, setPayments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsForm, setDetailsForm] = useState({});
  const [sendingDetails, setSendingDetails] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReplies, setTicketReplies] = useState([]);
  const [replyMsg, setReplyMsg] = useState("");
  const [inviteCode, setInviteCode] = useState(null);
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAll();
    const socket = connectSocket();
    socket.emit("join_admin_room", { role: user.role });

    const addNotif = (n) =>
      setNotifications((prev) => [n, ...prev].slice(0, 20));

    socket.on("payment_initiated", (data) => {
      addNotif({
        type: "payment",
        title: "New Payment Request",
        msg: `${data.username} wants to deposit $${data.amount}`,
        color: "#f0c040",
        time: new Date(),
      });
      toast.custom(() =>
        notifToast(
          "💰",
          "New Payment",
          `${data.username} — $${data.amount}`,
          "#f0c040",
        ),
      );
      fetchPayments();
    });

    socket.on("payment_confirming", (data) => {
      addNotif({
        type: "payment",
        title: "Payment Sent",
        msg: `${data.user} confirmed sending $${data.amount}`,
        color: "#00ff88",
        time: new Date(),
      });
      toast.custom(() =>
        notifToast(
          "✅",
          "Payment Sent",
          `${data.user} needs verification`,
          "#00ff88",
        ),
      );
      fetchPayments();
    });

    socket.on("gift_card_submitted", (data) => {
      addNotif({
        type: "gift_card",
        title: "Gift Card",
        msg: `${data.username} submitted a ${data.card_type} card`,
        color: "#c084fc",
        time: new Date(),
      });
      fetchPayments();
    });

    socket.on("prize_delivery_submitted", (data) => {
      addNotif({
        type: "delivery",
        title: "Prize Delivery",
        msg: "A player submitted a delivery form",
        color: "#c084fc",
        time: new Date(),
      });
      toast.custom(() =>
        notifToast(
          "🏆",
          "Prize Delivery",
          "Player submitted delivery form",
          "#c084fc",
        ),
      );
      fetchDeliveries();
    });

    socket.on("ticket_updated", () => fetchTickets());

    return () => {
      socket.off("payment_initiated");
      socket.off("payment_confirming");
      socket.off("gift_card_submitted");
      socket.off("prize_delivery_submitted");
      socket.off("ticket_updated");
    };
  }, []);

  const notifToast = (emoji, title, msg, color) => (
    <div
      style={{
        background: "#12122a",
        border: `1px solid ${color}`,
        borderRadius: "12px",
        padding: "1rem",
        maxWidth: "320px",
        boxShadow: `0 0 20px ${color}33`,
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
        <span>{emoji}</span>
        <span style={{ color, fontWeight: 700, fontSize: "0.9rem" }}>
          {title}
        </span>
      </div>
      <p style={{ color: "#a0a0c0", fontSize: "0.82rem", margin: 0 }}>{msg}</p>
    </div>
  );

  const fetchAll = () => {
    fetchPayments();
    fetchTickets();
    fetchDeliveries();
  };
  const fetchPayments = async () => {
    try {
      const r = await paymentsAPI.getPending();
      setPayments(r.data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };
  const fetchTickets = async () => {
    try {
      const r = await supportAPI.getAllTickets();
      setTickets(r.data.data);
    } catch {}
  };
  const fetchDeliveries = async () => {
    try {
      const r = await supportAPI.getPrizeDeliveries();
      setDeliveries(r.data.data);
    } catch {}
  };

  const openTicket = async (ticket) => {
    try {
      const r = await supportAPI.getTicket(ticket.id);
      setSelectedTicket(r.data.data.ticket);
      setTicketReplies(r.data.data.replies);
    } catch {
      toast.error("Could not load ticket");
    }
  };

  const handleReplyTicket = async () => {
    if (!replyMsg.trim()) return;
    setSubmitting(true);
    try {
      const r = await supportAPI.replyToTicket(selectedTicket.id, {
        message: replyMsg,
      });
      setTicketReplies((prev) => [...prev, r.data.data]);
      setReplyMsg("");
      toast.success("Reply sent!");
    } catch {
      toast.error("Could not send reply");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendDetails = async (paymentId) => {
    if (
      !detailsForm[paymentId] ||
      Object.keys(detailsForm[paymentId]).length === 0
    ) {
      toast.error("Enter payment details");
      return;
    }
    setSendingDetails(true);
    try {
      await paymentsAPI.sendDetails(paymentId, {
        details: detailsForm[paymentId],
      });
      toast.success("Details sent to user");
      setSelectedPayment(null);
      setDetailsForm({});
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send details");
    } finally {
      setSendingDetails(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await paymentsAPI.approve(id);
      toast.success("Approved — wallet credited!");
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not approve");
    }
  };

  const handleReject = async (id) => {
    try {
      await paymentsAPI.reject(id, {
        notes: rejectNote || "Rejected by admin",
      });
      toast.success("Rejected");
      setRejectNote("");
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not reject");
    }
  };

  const handleGenerateInvite = async () => {
    setGeneratingInvite(true);
    try {
      const r = await api.post("/auth/invite");
      setInviteCode(r.data.data.code);
      toast.success("Invite code generated!");
    } catch {
      toast.error("Could not generate invite");
    } finally {
      setGeneratingInvite(false);
    }
  };

  const handleUpdateDelivery = async (id, status) => {
    try {
      await supportAPI.updateDelivery(id, { status });
      toast.success(`Status updated to ${status}`);
      fetchDeliveries();
    } catch {
      toast.error("Could not update");
    }
  };

  const handleUpdateTicket = async (id, status) => {
    try {
      await supportAPI.updateTicketStatus(id, { status });
      toast.success("Ticket updated");
      fetchTickets();
      setSelectedTicket(null);
    } catch {
      toast.error("Could not update ticket");
    }
  };

  const methodIcon = (m) =>
    ({
      bank_transfer: "🏦",
      crypto: "₿",
      zelle: "💸",
      card: "💳",
      apple_pay: "🍎",
      gift_card: "🎁",
    })[m] || "💰";
  const statusColor = (s) =>
    ({
      pending: "#f0c040",
      confirming: "#00d4ff",
      completed: "#00ff88",
      failed: "#ff4444",
    })[s] || "#a0a0c0";
  const ticketStatusColor = (s) =>
    ({
      open: "#f0c040",
      in_progress: "#00d4ff",
      resolved: "#00ff88",
      closed: "#666",
    })[s] || "#a0a0c0";

  const inp = {
    style: {
      padding: "10px 14px",
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      color: "var(--text-primary)",
      fontSize: "0.9rem",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
    },
  };

  const unreadCount = notifications.length;
  const pendingPayments = payments.filter((p) =>
    ["pending", "confirming"].includes(p.status),
  ).length;
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const pendingDeliveries = deliveries.filter(
    (d) => d.status === "pending",
  ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--navy)",
        padding: "1.5rem",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900 }}>
              🛡️ Admin Panel
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              {user?.username} ·{" "}
              <span style={{ color: "var(--gold)" }}>{user?.role}</span>
            </p>
          </div>
          <button
            onClick={fetchAll}
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

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {[
            {
              label: "Pending Payments",
              value: pendingPayments,
              color: "#f0c040",
              icon: "💰",
            },
            {
              label: "Open Tickets",
              value: openTickets,
              color: "#00d4ff",
              icon: "🎫",
            },
            {
              label: "Prize Deliveries",
              value: pendingDeliveries,
              color: "#c084fc",
              icon: "🏆",
            },
            {
              label: "Notifications",
              value: unreadCount,
              color: "#00ff88",
              icon: "🔔",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                padding: "1.2rem",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "4px" }}>
                {s.icon}
              </div>
              <p
                style={{
                  color: s.color,
                  fontWeight: 900,
                  fontSize: "2rem",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.78rem",
                  marginTop: "4px",
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "1.5rem",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "0",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 20px",
                border: "none",
                cursor: "pointer",
                background:
                  activeTab === tab.id ? "var(--gold)" : "transparent",
                color: activeTab === tab.id ? "#000" : "var(--text-secondary)",
                fontWeight: activeTab === tab.id ? 700 : 400,
                borderRadius: "8px 8px 0 0",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                borderBottom:
                  activeTab === tab.id
                    ? "2px solid var(--gold)"
                    : "2px solid transparent",
              }}
            >
              {tab.icon} {tab.label}
              {tab.id === "payments" && pendingPayments > 0 && (
                <span
                  style={{
                    background: "#ff4444",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    fontSize: "0.65rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  {pendingPayments}
                </span>
              )}
              {tab.id === "tickets" && openTickets > 0 && (
                <span
                  style={{
                    background: "#ff4444",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    fontSize: "0.65rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  {openTickets}
                </span>
              )}
              {tab.id === "deliveries" && pendingDeliveries > 0 && (
                <span
                  style={{
                    background: "#ff4444",
                    color: "#fff",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    fontSize: "0.65rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  {pendingDeliveries}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── PAYMENTS TAB ── */}
        {activeTab === "payments" && (
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "20px",
              padding: "1.5rem",
            }}
          >
            <h3 style={{ fontWeight: 800, marginBottom: "1.5rem" }}>
              Payment Requests
            </h3>
            {loading ? (
              <div style={{ textAlign: "center", padding: "3rem" }}>
                <RefreshCw
                  size={24}
                  color="var(--gold)"
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
                ✅ No pending payments
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {payments.map((payment) => (
                  <div
                    key={payment.id}
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
                                padding: "10px",
                                marginTop: "8px",
                                fontSize: "0.82rem",
                              }}
                            >
                              <p
                                style={{
                                  color: "var(--gold)",
                                  fontWeight: 700,
                                  marginBottom: "4px",
                                }}
                              >
                                🎁 Gift Card
                              </p>
                              {payment.gift_card_image_url && (
                                <img
                                  src={payment.gift_card_image_url}
                                  alt="Gift card"
                                  style={{
                                    maxWidth: "200px",
                                    borderRadius: "6px",
                                    marginBottom: "4px",
                                  }}
                                />
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
                        <p style={{ fontWeight: 900, fontSize: "1.3rem" }}>
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

                    {/* Send details */}
                    {payment.status === "pending" && (
                      <div
                        style={{
                          borderTop: "1px solid var(--border)",
                          paddingTop: "1rem",
                        }}
                      >
                        {selectedPayment === payment.id ? (
                          <div>
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
                                ].map((f) => (
                                  <input
                                    key={f}
                                    {...inp}
                                    placeholder={f
                                      .replace(/_/g, " ")
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                                    onChange={(e) =>
                                      setDetailsForm((p) => ({
                                        ...p,
                                        [payment.id]: {
                                          ...p[payment.id],
                                          [f]: e.target.value,
                                        },
                                      }))
                                    }
                                  />
                                ))}
                              {payment.payment_method === "crypto" &&
                                ["btc_address", "eth_address", "network"].map(
                                  (f) => (
                                    <input
                                      key={f}
                                      {...inp}
                                      placeholder={f
                                        .replace(/_/g, " ")
                                        .toUpperCase()}
                                      onChange={(e) =>
                                        setDetailsForm((p) => ({
                                          ...p,
                                          [payment.id]: {
                                            ...p[payment.id],
                                            [f]: e.target.value,
                                          },
                                        }))
                                      }
                                    />
                                  ),
                                )}
                              {payment.payment_method === "zelle" &&
                                [
                                  "zelle_email",
                                  "zelle_phone",
                                  "recipient_name",
                                ].map((f) => (
                                  <input
                                    key={f}
                                    {...inp}
                                    placeholder={f
                                      .replace(/_/g, " ")
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                                    onChange={(e) =>
                                      setDetailsForm((p) => ({
                                        ...p,
                                        [payment.id]: {
                                          ...p[payment.id],
                                          [f]: e.target.value,
                                        },
                                      }))
                                    }
                                  />
                                ))}
                              {["card", "apple_pay"].includes(
                                payment.payment_method,
                              ) && (
                                <input
                                  {...inp}
                                  placeholder="Payment link or instructions"
                                  onChange={(e) =>
                                    setDetailsForm((p) => ({
                                      ...p,
                                      [payment.id]: {
                                        ...p[payment.id],
                                        instructions: e.target.value,
                                      },
                                    }))
                                  }
                                />
                              )}
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                onClick={() => handleSendDetails(payment.id)}
                                disabled={sendingDetails}
                                style={{
                                  background:
                                    "linear-gradient(135deg,#f0c040,#c9a227)",
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

                    {/* Approve/Reject */}
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
                            marginBottom: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          ✅ User confirmed payment sent. Verify and approve or
                          reject.
                        </p>
                        <input
                          {...inp}
                          placeholder="Rejection note (optional)"
                          value={rejectNote}
                          onChange={(e) => setRejectNote(e.target.value)}
                          style={{ ...inp.style, marginBottom: "0.75rem" }}
                        />
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleApprove(payment.id)}
                            style={{
                              background:
                                "linear-gradient(135deg,#00ff88,#00cc66)",
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
                            <CheckCircle size={16} /> Approve & Credit
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
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SUPPORT TICKETS TAB ── */}
        {activeTab === "tickets" && (
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "20px",
              padding: "1.5rem",
            }}
          >
            <h3 style={{ fontWeight: 800, marginBottom: "1.5rem" }}>
              Support Tickets
            </h3>
            {tickets.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "var(--text-secondary)",
                }}
              >
                ✅ No tickets
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => openTicket(t)}
                    style={{
                      background: "var(--navy)",
                      border: `1px solid var(--border)`,
                      borderLeft: `4px solid ${ticketStatusColor(t.status)}`,
                      borderRadius: "12px",
                      padding: "1rem",
                      cursor: "pointer",
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
                        <p style={{ fontWeight: 700, marginBottom: "2px" }}>
                          {t.subject}
                        </p>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.8rem",
                          }}
                        >
                          {t.username} · {t.ticket_number} ·{" "}
                          {new Date(t.created_at).toLocaleDateString()}
                        </p>
                        {t.game_played && (
                          <p
                            style={{
                              color: "var(--text-secondary)",
                              fontSize: "0.78rem",
                            }}
                          >
                            Game: {t.game_played}{" "}
                            {t.amount ? `· $${t.amount}` : ""}
                          </p>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "4px",
                        }}
                      >
                        <span
                          style={{
                            background: ticketStatusColor(t.status) + "20",
                            color: ticketStatusColor(t.status),
                            padding: "2px 10px",
                            borderRadius: "50px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                          }}
                        >
                          {t.status.replace("_", " ").toUpperCase()}
                        </span>
                        <span
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.75rem",
                          }}
                        >
                          {t.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ticket detail modal */}
            <AnimatePresence>
              {selectedTicket && (
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
                  onClick={() => setSelectedTicket(null)}
                >
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
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
                        marginBottom: "1rem",
                      }}
                    >
                      <div>
                        <h3 style={{ fontWeight: 800 }}>
                          {selectedTicket.subject}
                        </h3>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.8rem",
                          }}
                        >
                          {selectedTicket.ticket_number} ·{" "}
                          {selectedTicket.username}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {["open", "in_progress", "resolved", "closed"].map(
                          (s) => (
                            <button
                              key={s}
                              onClick={() =>
                                handleUpdateTicket(selectedTicket.id, s)
                              }
                              style={{
                                padding: "6px 10px",
                                borderRadius: "6px",
                                border: "1px solid var(--border)",
                                background:
                                  selectedTicket.status === s
                                    ? "var(--gold)"
                                    : "transparent",
                                color:
                                  selectedTicket.status === s
                                    ? "#000"
                                    : "var(--text-secondary)",
                                cursor: "pointer",
                                fontSize: "0.72rem",
                                fontWeight: 600,
                              }}
                            >
                              {s.replace("_", " ")}
                            </button>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Ticket details */}
                    <div
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        borderRadius: "10px",
                        padding: "1rem",
                        marginBottom: "1rem",
                        fontSize: "0.82rem",
                      }}
                    >
                      {[
                        ["Transaction", selectedTicket.transaction_type],
                        ["Game", selectedTicket.game_played],
                        [
                          "Amount",
                          selectedTicket.amount
                            ? `$${selectedTicket.amount}`
                            : null,
                        ],
                      ]
                        .filter(([, v]) => v)
                        .map(([k, v]) => (
                          <span
                            key={k}
                            style={{
                              marginRight: "1rem",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {k}:{" "}
                            <span
                              style={{
                                color: "var(--text-primary)",
                                fontWeight: 600,
                              }}
                            >
                              {v}
                            </span>
                          </span>
                        ))}
                    </div>

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
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          marginBottom: "6px",
                        }}
                      >
                        Original Message
                      </p>
                      <p
                        style={{
                          color: "var(--text-primary)",
                          fontSize: "0.9rem",
                        }}
                      >
                        {selectedTicket.message}
                      </p>
                    </div>

                    {ticketReplies.map((r) => (
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
                            color: ["admin", "super_admin"].includes(
                              r.sender_role,
                            )
                              ? "var(--gold)"
                              : "#00d4ff",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            marginBottom: "6px",
                          }}
                        >
                          {["admin", "super_admin"].includes(r.sender_role)
                            ? "🛡️ Admin"
                            : "👤 " + r.username}{" "}
                          · {new Date(r.created_at).toLocaleString()}
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

                    <textarea
                      value={replyMsg}
                      onChange={(e) => setReplyMsg(e.target.value)}
                      placeholder="Type admin reply..."
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
                        marginBottom: "8px",
                      }}
                    />
                    <button
                      onClick={handleReplyTicket}
                      disabled={submitting || !replyMsg.trim()}
                      style={{
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
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── PRIZE DELIVERIES TAB ── */}
        {activeTab === "deliveries" && (
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "20px",
              padding: "1.5rem",
            }}
          >
            <h3 style={{ fontWeight: 800, marginBottom: "1.5rem" }}>
              Prize Delivery Requests
            </h3>
            {deliveries.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "var(--text-secondary)",
                }}
              >
                No delivery requests yet
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {deliveries.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      background: "var(--navy)",
                      border: "1px solid rgba(192,132,252,0.3)",
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
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontWeight: 700,
                            fontSize: "1.05rem",
                            marginBottom: "4px",
                          }}
                        >
                          🏆 {d.prize_name || "Physical Prize"}
                        </p>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.85rem",
                          }}
                        >
                          {d.username} · {d.full_name}
                        </p>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.82rem",
                          }}
                        >
                          {d.email} · {d.phone}
                        </p>
                      </div>
                      <span
                        style={{
                          background: "rgba(192,132,252,0.15)",
                          color: "#c084fc",
                          padding: "3px 10px",
                          borderRadius: "50px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        {(d.status || "pending").toUpperCase()}
                      </span>
                    </div>

                    <div
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        borderRadius: "10px",
                        padding: "1rem",
                        fontSize: "0.82rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          marginBottom: "4px",
                        }}
                      >
                        📍 Delivery Address:
                      </p>
                      <p
                        style={{
                          color: "var(--text-primary)",
                          fontWeight: 600,
                        }}
                      >
                        {d.address_line1}
                        {d.address_line2 ? ", " + d.address_line2 : ""},{" "}
                        {d.city}, {d.state} {d.postal_code}, {d.country}
                      </p>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          marginTop: "6px",
                        }}
                      >
                        ID: {d.id_type} —{" "}
                        <span
                          style={{
                            color: "var(--text-primary)",
                            fontFamily: "monospace",
                          }}
                        >
                          {d.id_number}
                        </span>
                      </p>
                      {d.notes && (
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            marginTop: "4px",
                          }}
                        >
                          Notes: {d.notes}
                        </p>
                      )}
                      {d.tracking_number && (
                        <p
                          style={{
                            color: "#00ff88",
                            marginTop: "4px",
                            fontWeight: 600,
                          }}
                        >
                          📦 Tracking: {d.tracking_number}
                        </p>
                      )}
                    </div>

                    <div
                      style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                    >
                      {["pending", "processing", "shipped", "delivered"].map(
                        (s) => (
                          <button
                            key={s}
                            onClick={() => handleUpdateDelivery(d.id, s)}
                            style={{
                              padding: "8px 14px",
                              borderRadius: "8px",
                              border: "1px solid var(--border)",
                              background:
                                d.status === s ? "#c084fc" : "transparent",
                              color:
                                d.status === s
                                  ? "#000"
                                  : "var(--text-secondary)",
                              cursor: "pointer",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                            }}
                          >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ADMINS TAB ── */}
        {activeTab === "admins" && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            {/* Invite code generator */}
            {user?.role === "super_admin" && (
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid rgba(240,192,64,0.3)",
                  borderRadius: "20px",
                  padding: "1.5rem",
                }}
              >
                <h3
                  style={{
                    fontWeight: 800,
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Shield size={18} color="var(--gold)" /> Invite New Admin
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  Generate a one-time invite code. New admin registers at{" "}
                  <span style={{ color: "#00d4ff" }}>/register-admin</span>{" "}
                  using this code. Code expires in 48 hours.
                </p>

                {inviteCode ? (
                  <div
                    style={{
                      background: "rgba(240,192,64,0.08)",
                      border: "1px solid rgba(240,192,64,0.3)",
                      borderRadius: "12px",
                      padding: "1.2rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "1rem",
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
                        Share this code with the new admin:
                      </p>
                      <p
                        style={{
                          color: "var(--gold)",
                          fontFamily: "monospace",
                          fontWeight: 900,
                          fontSize: "1.3rem",
                          letterSpacing: "3px",
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
                        Register link:{" "}
                        <span style={{ color: "#00d4ff" }}>
                          {window.location.origin}/register-admin
                        </span>
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(inviteCode);
                          toast.success("Code copied!");
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
                        <Copy size={14} /> Copy Code
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${window.location.origin}/register-admin?code=${inviteCode}`,
                          );
                          toast.success("Link copied!");
                        }}
                        style={{
                          background: "rgba(0,212,255,0.1)",
                          border: "1px solid rgba(0,212,255,0.3)",
                          borderRadius: "8px",
                          padding: "8px 16px",
                          cursor: "pointer",
                          color: "#00d4ff",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                        }}
                      >
                        Copy Link
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
                      background: "linear-gradient(135deg,#f0c040,#c9a227)",
                      border: "none",
                      borderRadius: "10px",
                      padding: "12px 24px",
                      color: "#000",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Shield size={16} />{" "}
                    {generatingInvite
                      ? "Generating..."
                      : "Generate Invite Code"}
                  </button>
                )}
              </div>
            )}

            {/* How to add admin instructions */}
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                padding: "1.5rem",
              }}
            >
              <h3 style={{ fontWeight: 800, marginBottom: "1rem" }}>
                How to Add a New Admin
              </h3>
              {[
                {
                  step: "1",
                  text: 'Click "Generate Invite Code" above to create a one-time code',
                  color: "#f0c040",
                },
                {
                  step: "2",
                  text: "Copy the code and send it to the person you want to make admin",
                  color: "#00d4ff",
                },
                {
                  step: "3",
                  text: "They go to /register-admin on the platform",
                  color: "#00ff88",
                },
                {
                  step: "4",
                  text: "They fill in their details and paste the invite code",
                  color: "#c084fc",
                },
                {
                  step: "5",
                  text: "Their account is created with admin role automatically — no OTP needed",
                  color: "#f0c040",
                },
              ].map((s) => (
                <div
                  key={s.step}
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-start",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: s.color + "20",
                      border: `1px solid ${s.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        color: s.color,
                        fontWeight: 700,
                        fontSize: "0.8rem",
                      }}
                    >
                      {s.step}
                    </span>
                  </div>
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                      paddingTop: "4px",
                    }}
                  >
                    {s.text}
                  </p>
                </div>
              ))}

              <div
                style={{
                  background: "rgba(240,192,64,0.06)",
                  border: "1px solid rgba(240,192,64,0.2)",
                  borderRadius: "10px",
                  padding: "1rem",
                  marginTop: "1rem",
                }}
              >
                <p
                  style={{
                    color: "var(--gold)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    marginBottom: "4px",
                  }}
                >
                  ⚠️ Important
                </p>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.82rem",
                  }}
                >
                  Each invite code can only be used once and expires in 48
                  hours. Only super admins can generate invite codes. The new
                  admin will have the same permissions as you except they cannot
                  generate invite codes or promote other users to super_admin.
                </p>
              </div>
            </div>

            {/* Notifications log */}
            {notifications.length > 0 && (
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
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Bell size={16} /> Recent Notifications
                </h3>
                {notifications.map((n, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "flex-start",
                      padding: "10px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: n.color,
                        flexShrink: 0,
                        marginTop: "6px",
                      }}
                    />
                    <div>
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          color: n.color,
                        }}
                      >
                        {n.title}
                      </p>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.8rem",
                        }}
                      >
                        {n.msg}
                      </p>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.72rem",
                          marginTop: "2px",
                        }}
                      >
                        {new Date(n.time).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
