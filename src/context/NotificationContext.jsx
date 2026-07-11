import { createContext, useState, useEffect, useContext } from "react";
import { connectSocket } from "../services/socket";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;

    const socket = connectSocket();

    // Join admin room if admin
    if (["admin", "super_admin"].includes(user.role)) {
      socket.emit("join_admin_room", { role: user.role });
    }

    const addNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 20));
      setUnread((prev) => prev + 1);
    };

    // ADMIN notifications
    if (["admin", "super_admin"].includes(user.role)) {
      socket.on("payment_initiated", (data) => {
        addNotification({
          id: Date.now(),
          type: "payment_initiated",
          title: "New Payment Request",
          message: `${data.username} wants to deposit $${data.amount} via ${data.payment_method}`,
          time: new Date().toISOString(),
          color: "#f0c040",
          emoji: "💰",
        });
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
                <span>💰</span>
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
      });

      socket.on("payment_confirming", (data) => {
        addNotification({
          id: Date.now(),
          type: "payment_confirming",
          title: "Payment Sent!",
          message: `${data.user} says they've sent $${data.amount} — verify now`,
          time: new Date().toISOString(),
          color: "#00ff88",
          emoji: "✅",
        });
        toast.custom(
          () => (
            <div
              style={{
                background: "#12122a",
                border: "1px solid #00ff88",
                borderRadius: "12px",
                padding: "1rem",
                maxWidth: "320px",
                boxShadow: "0 0 20px rgba(0,255,136,0.2)",
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
                <span>✅</span>
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
      });

      socket.on("big_win", (data) => {
        addNotification({
          id: Date.now(),
          type: "big_win",
          title: "Big Win Alert!",
          message: `A player just won $${data.payout?.toLocaleString()} on ${data.prize_tier}`,
          time: new Date().toISOString(),
          color: "#c084fc",
          emoji: "🏆",
        });
      });
    }

    // USER notifications
    if (user) {
      // Payment approved
      socket.on(`payment_approved_${user.id}`, (data) => {
        addNotification({
          id: Date.now(),
          type: "payment_approved",
          title: "Payment Approved!",
          message: `Your $${data.amount} deposit has been approved. Wallet credited!`,
          time: new Date().toISOString(),
          color: "#00ff88",
          emoji: "🎉",
        });
        toast.custom(
          () => (
            <div
              style={{
                background: "#12122a",
                border: "1px solid #00ff88",
                borderRadius: "12px",
                padding: "1rem",
                maxWidth: "320px",
                boxShadow: "0 0 20px rgba(0,255,136,0.3)",
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
                <span>🎉</span>
                <span style={{ color: "#00ff88", fontWeight: 700 }}>
                  Payment Approved!
                </span>
              </div>
              <p style={{ color: "#a0a0c0", fontSize: "0.85rem" }}>
                Your ${data.amount} deposit has been approved. Your wallet has
                been credited!
              </p>
            </div>
          ),
          { duration: 8000 },
        );
      });

      // Payment rejected
      socket.on(`payment_rejected_${user.id}`, (data) => {
        addNotification({
          id: Date.now(),
          type: "payment_rejected",
          title: "Payment Rejected",
          message: `Your $${data.amount} payment was rejected. ${data.notes || ""}`,
          time: new Date().toISOString(),
          color: "#ff4444",
          emoji: "❌",
        });
        toast.custom(
          () => (
            <div
              style={{
                background: "#12122a",
                border: "1px solid #ff4444",
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
                <span>❌</span>
                <span style={{ color: "#ff4444", fontWeight: 700 }}>
                  Payment Rejected
                </span>
              </div>
              <p style={{ color: "#a0a0c0", fontSize: "0.85rem" }}>
                Your ${data.amount} payment was rejected. Please contact
                support.
              </p>
            </div>
          ),
          { duration: 8000 },
        );
      });

      // Payment details received
      socket.on(`payment_details_${user.id}`, (data) => {
        addNotification({
          id: Date.now(),
          type: "payment_details",
          title: "Payment Details Ready",
          message: `Admin sent payment details for your $${data.amount} deposit`,
          time: new Date().toISOString(),
          color: "#00d4ff",
          emoji: "📋",
          details: data.details,
        });
        toast.custom(
          () => (
            <div
              style={{
                background: "#12122a",
                border: "1px solid #00d4ff",
                borderRadius: "12px",
                padding: "1rem",
                maxWidth: "320px",
                boxShadow: "0 0 20px rgba(0,212,255,0.2)",
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
                <span>📋</span>
                <span style={{ color: "#00d4ff", fontWeight: 700 }}>
                  Payment Details Ready!
                </span>
              </div>
              <p style={{ color: "#a0a0c0", fontSize: "0.85rem" }}>
                Admin sent payment details for your ${data.amount} deposit.
                Check your wallet page.
              </p>
            </div>
          ),
          { duration: 10000 },
        );
      });
    }

    return () => {
      socket.off("payment_initiated");
      socket.off("payment_confirming");
      socket.off("big_win");
      socket.off(`payment_approved_${user?.id}`);
      socket.off(`payment_rejected_${user?.id}`);
      socket.off(`payment_details_${user?.id}`);
    };
  }, [user]);

  const markAllRead = () => setUnread(0);
  const clearAll = () => {
    setNotifications([]);
    setUnread(0);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unread, markAllRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
