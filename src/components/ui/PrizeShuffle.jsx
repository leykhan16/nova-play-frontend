import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { usePrizes, FALLBACK_PRIZES } from "../../hooks/usePrizes";

export default function PrizeShuffle({
  onClose,
  title = "SELECTING YOUR PRIZE...",
  successTitle = "YOU WON!",
}) {
  const { prizes } = usePrizes();
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [winner, setWinner] = useState(null);

  // Use DB prizes if loaded, else fallback
  const prizePool = prizes.length > 0 ? prizes : FALLBACK_PRIZES;

  useEffect(() => {
    if (prizePool.length === 0) return;
    let step = 0;

    const tick = () => {
      step++;
      const delay = step < 20 ? 65 : step < 32 ? 150 : step < 40 ? 300 : 550;

      if (step >= 45) {
        const w = prizePool[Math.floor(Math.random() * prizePool.length)];
        setWinner(w);
        setIdx(prizePool.indexOf(w));
        setDone(true);
        return;
      }

      setIdx(Math.floor(Math.random() * prizePool.length));
      setTimeout(tick, delay);
    };

    setTimeout(tick, 65);
  }, [prizePool.length]);

  const p = winner || prizePool[idx];
  if (!p) return null;

  const imageUrl = p.image_url || p.image || "";
  const value = p.estimated_value
    ? `$${Number(p.estimated_value).toLocaleString()}`
    : p.value || "Priceless";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.97)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
        padding: "1rem",
      }}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          background: "linear-gradient(135deg, #0f0f2e, #1a0a2e)",
          border: "2px solid #f0c040",
          borderRadius: "24px",
          padding: "2rem",
          width: "100%",
          maxWidth: "460px",
          textAlign: "center",
          boxShadow: "0 0 80px rgba(240,192,64,0.5)",
        }}
      >
        {/* Title */}
        <motion.p
          animate={done ? {} : { opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 0.75 }}
          style={{
            color: "#f0c040",
            fontWeight: 900,
            letterSpacing: "2px",
            fontSize: "0.9rem",
            marginBottom: "1.2rem",
          }}
        >
          {done ? `🎉 ${successTitle}` : `🎰 ${title}`}
        </motion.p>

        {/* Prize image */}
        <motion.div
          key={idx}
          initial={{ opacity: 0.6, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            borderRadius: "16px",
            overflow: "hidden",
            marginBottom: "1.2rem",
            position: "relative",
            border: `2px solid ${done ? "#f0c040" : "rgba(240,192,64,0.2)"}`,
            boxShadow: done ? "0 0 30px rgba(240,192,64,0.5)" : "none",
            background: "#1a1a2e",
            minHeight: "220px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={p.name}
              style={{
                width: "100%",
                height: "220px",
                objectFit: "cover",
                display: "block",
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div style={{ fontSize: "4rem" }}>🎁</div>
          )}

          {!done && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RotateCcw
                size={42}
                color="white"
                style={{ animation: "spin 0.35s linear infinite" }}
              />
            </div>
          )}
        </motion.div>

        {/* Category badge */}
        <span
          style={{
            background: "rgba(192,132,252,0.18)",
            border: "1px solid rgba(192,132,252,0.4)",
            borderRadius: "50px",
            padding: "3px 14px",
            color: "#c084fc",
            fontSize: "0.75rem",
            fontWeight: 700,
          }}
        >
          {p.prize_type?.replace("_", " ").toUpperCase() ||
            p.category ||
            "PRIZE"}
        </span>

        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 900,
            margin: "10px 0 4px",
            color: done ? "#f0c040" : "#fff",
          }}
        >
          {p.name}
        </h2>

        <p
          style={{
            color: "#00ff88",
            fontWeight: 800,
            fontSize: "1.25rem",
            marginBottom: "1.2rem",
          }}
        >
          Valued at {value}
        </p>

        {p.description && (
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.82rem",
              marginBottom: "1rem",
            }}
          >
            {p.description}
          </p>
        )}

        {/* Claim button */}
        {done && winner && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                marginBottom: "1.2rem",
              }}
            >
              🎊 Congratulations! An admin will contact you within 24 hours to
              arrange delivery.
            </p>
            <button
              onClick={() => onClose(winner)}
              style={{
                width: "100%",
                padding: "15px",
                background: "linear-gradient(135deg, #f0c040, #c9a227)",
                border: "none",
                borderRadius: "12px",
                color: "#000",
                fontWeight: 900,
                fontSize: "1.1rem",
                cursor: "pointer",
                boxShadow: "0 0 24px rgba(240,192,64,0.5)",
              }}
            >
              🎁 Claim My Prize
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
