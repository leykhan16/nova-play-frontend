import { useState, useContext, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationContext } from "../../context/NotificationContext";
import { Bell, X, CheckCheck } from "lucide-react";

export default function NotificationBell() {
  const { notifications, unread, markAllRead, clearAll } =
    useContext(NotificationContext);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleOpen = () => {
    setOpen(!open);
    if (!open) markAllRead();
  };

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={handleOpen}
        style={{
          background: "none",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "6px 10px",
          cursor: "pointer",
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          position: "relative",
        }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: "absolute",
              top: "-6px",
              right: "-6px",
              background: "#ff4444",
              color: "#fff",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              fontSize: "0.7rem",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              right: 0,
              top: "44px",
              width: "340px",
              maxHeight: "480px",
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              zIndex: 1000,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "1rem 1.2rem",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                Notifications{" "}
                {notifications.length > 0 && `(${notifications.length})`}
              </span>
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-secondary)",
                      fontSize: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <CheckCheck size={12} /> Clear all
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div style={{ overflowY: "auto", maxHeight: "400px" }}>
              {notifications.length === 0 ? (
                <div
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Bell
                    size={32}
                    style={{ marginBottom: "0.5rem", opacity: 0.3 }}
                  />
                  <p style={{ fontSize: "0.85rem" }}>No notifications yet</p>
                </div>
              ) : (
                notifications.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      padding: "1rem 1.2rem",
                      borderBottom: "1px solid var(--border)",
                      borderLeft: `3px solid ${n.color}`,
                      background: i === 0 ? `${n.color}05` : "transparent",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "flex-start",
                      }}
                    >
                      <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>
                        {n.emoji}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            marginBottom: "2px",
                            color: n.color,
                          }}
                        >
                          {n.title}
                        </p>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.8rem",
                            lineHeight: 1.4,
                          }}
                        >
                          {n.message}
                        </p>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.72rem",
                            marginTop: "4px",
                            opacity: 0.6,
                          }}
                        >
                          {timeAgo(n.time)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
