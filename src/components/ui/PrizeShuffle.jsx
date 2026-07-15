import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { usePrizes, FALLBACK_PRIZES } from "../../hooks/usePrizes";

export default function PrizeShuffle({ onClose, wonPrize = null }) {
  const { prizes } = usePrizes();
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [winner, setWinner] = useState(null);

  const prizePool = prizes.length > 0 ? prizes : FALLBACK_PRIZES;

  useEffect(() => {
    if (prizePool.length === 0) return;

    let step = 0;
    const MAX = 44;

    const tick = () => {
      step++;
      const delay = step < 20 ? 65 : step < 32 ? 150 : step < 40 ? 300 : 550;

      if (step >= MAX) {
        // Land on the EXACT prize from backend if provided
        // otherwise pick random
        const finalPrize =
          wonPrize || prizePool[Math.floor(Math.random() * prizePool.length)];
        const finalIdx = prizePool.findIndex(
          (p) => p.id === finalPrize.id || p.name === finalPrize.name,
        );
        setWinner(finalPrize);
        setIdx(finalIdx >= 0 ? finalIdx : 0);
        setDone(true);
        return;
      }

      // Random shuffle while spinning
      setIdx(Math.floor(Math.random() * prizePool.length));
      setTimeout(tick, delay);
    };

    setTimeout(tick, 65);
  }, [prizePool.length, wonPrize]);

  const displayPrize = done ? winner : prizePool[idx];
  if (!displayPrize) return null;

  const imageUrl = displayPrize.image_url || displayPrize.image || "";
  const value = displayPrize.estimated_value
    ? `$${Number(displayPrize.estimated_value).toLocaleString()}`
    : displayPrize.value || "Priceless";

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
          background: "linear-gradient(135deg,#0f0f2e,#1a0a2e)",
          border: "2px solid #f0c040",
          borderRadius: "24px",
          padding: "2rem",
          width: "100%",
          maxWidth: "460px",
          textAlign: "center",
          boxShadow: "0 0 80px rgba(240,192,64,0.5)",
        }}
      >
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
          {done ? "🏆 JACKPOT! YOU WON!" : "🎰 SELECTING YOUR PRIZE..."}
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
            border: `2px solid ${done ? "#f0c040" : "rgba(240,192,64,0.2)"}`,
            boxShadow: done ? "0 0 40px rgba(240,192,64,0.6)" : "none",
            background: "#1a1a2e",
            minHeight: "220px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={displayPrize.name}
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
            <div style={{ fontSize: "5rem" }}>🎁</div>
          )}

          {!done && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RotateCcw
                size={44}
                color="white"
                style={{ animation: "spin 0.35s linear infinite" }}
              />
            </div>
          )}
        </motion.div>

        {/* Category */}
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
          {displayPrize.prize_type?.replace("_", " ").toUpperCase() ||
            displayPrize.category ||
            "PRIZE"}
        </span>

        <h2
          style={{
            fontSize: "1.6rem",
            fontWeight: 900,
            margin: "10px 0 4px",
            color: done ? "#f0c040" : "#fff",
          }}
        >
          {displayPrize.name}
        </h2>

        <p
          style={{
            color: "#00ff88",
            fontWeight: 800,
            fontSize: "1.3rem",
            marginBottom: "0.5rem",
          }}
        >
          Valued at {value}
        </p>

        {displayPrize.description && (
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.82rem",
              marginBottom: "1rem",
            }}
          >
            {displayPrize.description}
          </p>
        )}

        {done && winner && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div
              style={{
                background: "rgba(192,132,252,0.1)",
                border: "1px solid rgba(192,132,252,0.3)",
                borderRadius: "10px",
                padding: "12px",
                marginBottom: "1.2rem",
              }}
            >
              <p
                style={{
                  color: "#c084fc",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  margin: 0,
                }}
              >
                🎊 This is a PHYSICAL PRIZE — no wallet credit.
              </p>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                  margin: "4px 0 0",
                }}
              >
                An admin will contact you within 24 hours to arrange delivery.
              </p>
            </div>
            <button
              onClick={() => onClose(winner)}
              style={{
                width: "100%",
                padding: "15px",
                background: "linear-gradient(135deg,#c084fc,#9333ea)",
                border: "none",
                borderRadius: "12px",
                color: "#fff",
                fontWeight: 900,
                fontSize: "1.1rem",
                cursor: "pointer",
                boxShadow: "0 0 24px rgba(192,132,252,0.5)",
              }}
            >
              🏆 Claim My Prize
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
