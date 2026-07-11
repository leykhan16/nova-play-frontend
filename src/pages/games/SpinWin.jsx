import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gamesAPI, walletAPI } from "../../services/api";
import toast from "react-hot-toast";
import { ArrowRight, RotateCcw, Gift } from "lucide-react";

// ── WHEEL DEFINITION ─────────────────────────────────────────────────────────
// 16 segments: 8 loss, 3×$1K, 2×$10K, 1×$50K, 2×prize
const SEGMENTS = [
  { label: "?", color: "#cc2222", tier: "loss" },
  { label: "$1,000", color: "#00ff88", tier: "1000" },
  { label: "?", color: "#cc2222", tier: "loss" },
  { label: "$10,000", color: "#00d4ff", tier: "10000" },
  { label: "?", color: "#cc2222", tier: "loss" },
  { label: "🎁", color: "#c084fc", tier: "prize" },
  { label: "?", color: "#cc2222", tier: "loss" },
  { label: "$50,000", color: "#f0c040", tier: "50000" },
  { label: "?", color: "#cc2222", tier: "loss" },
  { label: "$1,000", color: "#00ff88", tier: "1000" },
  { label: "?", color: "#cc2222", tier: "loss" },
  { label: "🎁", color: "#c084fc", tier: "prize" },
  { label: "?", color: "#cc2222", tier: "loss" },
  { label: "$10,000", color: "#00d4ff", tier: "10000" },
  { label: "?", color: "#cc2222", tier: "loss" },
  { label: "$1,000", color: "#00ff88", tier: "1000" },
];
const N = SEGMENTS.length; // 16
const SEG_DEG = 360 / N; // 22.5° per segment

// ── PHYSICAL PRIZES ───────────────────────────────────────────────────────────
const PHYSICAL_PRIZES = [
  {
    name: "Lamborghini Urus",
    category: "Luxury Car",
    value: "$250,000",
    image:
      "https://images.unsplash.com/photo-1621135802920-133df287f89c?w=600&q=80",
  },
  {
    name: "Rolls-Royce Ghost",
    category: "Luxury Car",
    value: "$350,000",
    image:
      "https://images.unsplash.com/photo-1563720223809-b2ea5e4256b0?w=600&q=80",
  },
  {
    name: "Manhattan Penthouse",
    category: "Real Estate",
    value: "$2,000,000",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
  },
  {
    name: "Malibu Beach House",
    category: "Real Estate",
    value: "$1,500,000",
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
  },
  {
    name: "Maldives 7 Nights",
    category: "Vacation",
    value: "$25,000",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80",
  },
  {
    name: "Paris Luxury Trip",
    category: "Vacation",
    value: "$15,000",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
  },
  {
    name: "Dubai VIP Experience",
    category: "Vacation",
    value: "$20,000",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
  },
  {
    name: "Bali Honeymoon Suite",
    category: "Vacation",
    value: "$18,000",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
  },
  {
    name: "Rolex Submariner",
    category: "Luxury Watch",
    value: "$40,000",
    image:
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80",
  },
  {
    name: "Patek Philippe",
    category: "Luxury Watch",
    value: "$80,000",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80",
  },
  {
    name: "Sub-Zero Refrigerator",
    category: "Appliance",
    value: "$12,000",
    image:
      "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80",
  },
  {
    name: "Louis Vuitton Set",
    category: "Fashion",
    value: "$30,000",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
  },
];

// ── PRIZE SHUFFLE OVERLAY ─────────────────────────────────────────────────────
const PrizeShuffle = ({ onClose }) => {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    let step = 0;
    const maxSteps = 44;

    const tick = () => {
      step++;
      // Slow down gradually
      const delay = step < 20 ? 60 : step < 32 ? 140 : step < 40 ? 280 : 500;

      if (step >= maxSteps) {
        const w =
          PHYSICAL_PRIZES[Math.floor(Math.random() * PHYSICAL_PRIZES.length)];
        setWinner(w);
        setIdx(PHYSICAL_PRIZES.indexOf(w));
        setDone(true);
        return;
      }
      setIdx(Math.floor(Math.random() * PHYSICAL_PRIZES.length));
      setTimeout(tick, delay);
    };
    setTimeout(tick, 60);
  }, []);

  const p = winner || PHYSICAL_PRIZES[idx];

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
          transition={{ repeat: Infinity, duration: 0.7 }}
          style={{
            color: "#f0c040",
            fontWeight: 900,
            letterSpacing: "2px",
            fontSize: "0.9rem",
            marginBottom: "1.2rem",
          }}
        >
          {done ? "🎉 YOU WON A PRIZE!" : "🎰 SELECTING YOUR PRIZE..."}
        </motion.p>

        <motion.div
          key={idx}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          style={{
            borderRadius: "14px",
            overflow: "hidden",
            marginBottom: "1.2rem",
            border: `2px solid ${done ? "#f0c040" : "rgba(240,192,64,0.25)"}`,
            boxShadow: done ? "0 0 30px rgba(240,192,64,0.5)" : "none",
            position: "relative",
          }}
        >
          <img
            src={p.image}
            alt={p.name}
            style={{
              width: "100%",
              height: "220px",
              objectFit: "cover",
              display: "block",
            }}
          />
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
                color="#fff"
                style={{ animation: "spin 0.35s linear infinite" }}
              />
            </div>
          )}
        </motion.div>

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
          {p.category}
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
          Valued at {p.value}
        </p>

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
                background: "linear-gradient(135deg,#f0c040,#c9a227)",
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
};

// ── CANVAS WHEEL RENDERER ─────────────────────────────────────────────────────
const renderWheel = (canvas) => {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const R = cx - 5;
  const toRad = (deg) => (deg * Math.PI) / 180;

  ctx.clearRect(0, 0, W, H);

  SEGMENTS.forEach((seg, i) => {
    const startDeg = i * SEG_DEG - 90;
    const endDeg = startDeg + SEG_DEG;
    const midDeg = startDeg + SEG_DEG / 2;
    const isLoss = seg.tier === "loss";

    // Segment fill
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, toRad(startDeg), toRad(endDeg));
    ctx.closePath();
    ctx.fillStyle = isLoss
      ? i % 2 === 0
        ? "#1c0404"
        : "#220505"
      : seg.color + "1a";
    ctx.fill();
    ctx.strokeStyle = seg.color;
    ctx.lineWidth = isLoss ? 0.8 : 2.2;
    ctx.stroke();

    // Label
    const labelR = R * 0.67;
    const lx = cx + labelR * Math.cos(toRad(midDeg));
    const ly = cy + labelR * Math.sin(toRad(midDeg));

    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(toRad(midDeg + 90));
    ctx.fillStyle = seg.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (isLoss) {
      ctx.font = "bold 20px sans-serif";
      ctx.fillText("?", 0, 0);
    } else if (seg.label === "🎁") {
      ctx.font = "16px sans-serif";
      ctx.fillText("🎁", 0, 0);
    } else {
      // Multi-line for $ amounts
      const parts = seg.label.split(",");
      ctx.font = "bold 8px sans-serif";
      if (parts.length === 2) {
        ctx.fillText("$" + parts[0].replace("$", ""), 0, -5);
        ctx.fillText(parts[1].trim(), 0, 5);
      } else {
        ctx.fillText(seg.label, 0, 0);
      }
    }
    ctx.restore();
  });

  // Outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = "#f0c040";
  ctx.lineWidth = 5;
  ctx.stroke();

  // Center circle
  ctx.beginPath();
  ctx.arc(cx, cy, 34, 0, Math.PI * 2);
  ctx.fillStyle = "#0a0a1a";
  ctx.fill();
  ctx.strokeStyle = "#f0c040";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#f0c040";
  ctx.font = "bold 15px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("NP", cx, cy);
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SpinWin() {
  const [betAmount, setBetAmount] = useState("100");
  const [spinning, setSpinning] = useState(false);
  const [totalRotation, setTotalRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [showShuffle, setShowShuffle] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);
  const canvasRef = useRef(null);
  const rotRef = useRef(0); // tracks actual current rotation

  useEffect(() => {
    renderWheel(canvasRef.current);
    walletAPI
      .getWallet()
      .then((r) => setBalance(r.data.data.balance))
      .catch(() => {});
  }, []);

  // Given a tier, return a random segment index that matches
  const pickSegment = useCallback((tier) => {
    const matches = SEGMENTS.map((s, i) => ({ ...s, i })).filter(
      (s) => s.tier === tier,
    );

    if (matches.length === 0) {
      // Fallback: pick a loss segment
      const losses = SEGMENTS.map((s, i) => ({ ...s, i })).filter(
        (s) => s.tier === "loss",
      );
      return losses[Math.floor(Math.random() * losses.length)].i;
    }
    return matches[Math.floor(Math.random() * matches.length)].i;
  }, []);

  const handleSpin = async () => {
    if (spinning) return;

    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) {
      toast.error("Enter a valid bet amount");
      return;
    }
    if (bet < 100) {
      toast.error("Minimum bet is $100");
      return;
    }
    if (bet > (balance || 0)) {
      toast.error("Insufficient balance");
      return;
    }

    setSpinning(true);
    setResult(null);
    setWonPrize(null);

    try {
      const res = await gamesAPI.spin({ betAmount: bet, currency: "USD" });
      const data = res.data.data;

      console.log("Backend result:", data.prize_tier, "payout:", data.payout);

      // Find ALL segments matching this tier
      const matching = SEGMENTS.map((s, i) => ({ ...s, i })).filter(
        (s) => s.tier === data.prize_tier,
      );

      console.log(
        "Matching segments:",
        matching.map((m) => `${m.i}:${m.label}`),
      );

      // Pick a random matching segment
      const target =
        matching.length > 0
          ? matching[Math.floor(Math.random() * matching.length)]
          : SEGMENTS.map((s, i) => ({ ...s, i })).filter(
              (s) => s.tier === "loss",
            )[0];

      console.log("Landing on segment:", target.i, target.label);

      // The wheel canvas starts with segment 0 at the top (-90° offset in drawing)
      // Segment i center is at: i * SEG_DEG + SEG_DEG/2 degrees FROM the top
      // The pointer is at the top (12 o'clock position)
      // To land segment i under pointer, we rotate the wheel so segment i center = top
      // Current rotation is rotRef.current
      // We need: (rotRef.current + delta) % 360 positions segment i at top
      // Segment i center position on wheel = i * SEG_DEG + SEG_DEG / 2

      // Calculate where we want the wheel to stop
      const targetAngle = target.i * SEG_DEG + SEG_DEG / 2;

      // Small random offset so we never land exactly on a border
      const nudge = (Math.random() - 0.5) * (SEG_DEG * 0.4);

      // Where the wheel should finish
      const destination = (360 - targetAngle + nudge + 360) % 360;

      // Current wheel angle
      const current = ((rotRef.current % 360) + 360) % 360;

      // Difference from current to destination
      const deltaToTarget = (destination - current + 360) % 360;

      // Add 5–7 full spins
      const fullSpins = 360 * (5 + Math.floor(Math.random() * 3));

      const delta = fullSpins + deltaToTarget;

      rotRef.current += delta;
      setTotalRotation(rotRef.current);

      console.log({
        targetSegment: target.i,
        targetTier: target.tier,
        targetAngle,
        destination,
        current,
        delta,
        finalRotation: rotRef.current % 360,
      });

      console.log("Rotation delta:", delta, "Total:", rotRef.current);

      // Show result after animation completes
      setTimeout(() => {
        setResult(data);
        setHistory((prev) => [data, ...prev].slice(0, 6));
        walletAPI
          .getWallet()
          .then((r) => setBalance(r.data.data.balance))
          .catch(() => {});
        setSpinning(false);

        if (data.prize_tier === "prize") {
          setTimeout(() => setShowShuffle(true), 500);
        } else if (data.prize_tier === "loss") {
          toast.error("💀 House wins!");
        } else {
          toast.success(`🎉 ${data.message}`);
        }
      }, 6300);
    } catch (err) {
      console.error("Spin error:", err);
      const msg =
        err?.response?.data?.message || "Connection error — please try again";
      toast.error(msg);
      setSpinning(false);
    }
  };

  const handleShuffleClose = (prize) => {
    setWonPrize(prize);
    setShowShuffle(false);
    toast.success(`🎁 You won: ${prize.name}!`);
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--navy)",
        padding: "1.5rem",
      }}
    >
      <div style={{ maxWidth: "1060px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 900 }}>🎰 Spin & Win</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Min bet $100 · 70% house edge · Physical prizes available · Provably
            fair
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          {/* ── LEFT: Wheel ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{ position: "relative", width: "100%", maxWidth: "450px" }}
            >
              {/* Pointer */}
              <div
                style={{
                  position: "absolute",
                  top: "-22px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 20,
                  width: 0,
                  height: 0,
                  borderLeft: "16px solid transparent",
                  borderRight: "16px solid transparent",
                  borderTop: "32px solid #f0c040",
                  filter: "drop-shadow(0 0 16px #f0c040)",
                }}
              />

              {/* Wheel */}
              <motion.div
                animate={{ rotate: totalRotation }}
                transition={{ duration: 6, ease: [0.08, 0.82, 0.05, 1.0] }}
                style={{ width: "100%", aspectRatio: "1" }}
              >
                <canvas
                  ref={canvasRef}
                  width={450}
                  height={450}
                  style={{ width: "100%", height: "100%", display: "block" }}
                />
              </motion.div>
            </div>

            {/* Spinning label */}
            {spinning && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 0.9 }}
                style={{
                  marginTop: "1rem",
                  color: "#f0c040",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <RotateCcw
                  size={16}
                  style={{ animation: "spin 0.5s linear infinite" }}
                />
                Spinning...
              </motion.div>
            )}

            {/* Result card */}
            <AnimatePresence>
              {result && !showShuffle && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{
                    marginTop: "1.5rem",
                    width: "100%",
                    maxWidth: "450px",
                    textAlign: "center",
                    background:
                      result.prize_tier === "loss"
                        ? "rgba(255,40,40,0.08)"
                        : "rgba(240,192,64,0.08)",
                    border: `2px solid ${result.prize_tier === "loss" ? "rgba(255,68,68,0.45)" : "rgba(240,192,64,0.5)"}`,
                    borderRadius: "18px",
                    padding: "1.5rem",
                  }}
                >
                  <div style={{ fontSize: "2.5rem", marginBottom: "6px" }}>
                    {result.prize_tier === "loss"
                      ? "💀"
                      : result.prize_tier === "prize"
                        ? "🎁"
                        : "🎉"}
                  </div>

                  <h3
                    style={{
                      fontWeight: 900,
                      fontSize: "1.7rem",
                      marginBottom: "4px",
                      color:
                        result.prize_tier === "loss" ? "#ff4444" : "#f0c040",
                    }}
                  >
                    {result.prize_tier === "loss"
                      ? "House Wins!"
                      : result.prize_tier === "prize"
                        ? wonPrize
                          ? wonPrize.name
                          : "🎁 Prize Incoming..."
                        : `$${Number(result.payout).toLocaleString()}`}
                  </h3>

                  {/* Debug — remove after testing */}
                  <p
                    style={{
                      color: "#666",
                      fontSize: "0.7rem",
                      marginTop: "4px",
                    }}
                  >
                    tier: {result.prize_tier} | payout: ${result.payout}
                  </p>

                  {/* Won prize image */}
                  {wonPrize && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ marginTop: "1rem" }}
                    >
                      <img
                        src={wonPrize.image}
                        alt={wonPrize.name}
                        style={{
                          width: "100%",
                          borderRadius: "10px",
                          maxHeight: "160px",
                          objectFit: "cover",
                        }}
                      />
                      <p
                        style={{
                          color: "#00ff88",
                          fontWeight: 700,
                          marginTop: "6px",
                        }}
                      >
                        {wonPrize.value}
                      </p>
                    </motion.div>
                  )}

                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.8rem",
                      marginTop: "10px",
                    }}
                  >
                    {result.prize_tier === "loss" ? "Consolation" : "Winner"}{" "}
                    bonus:{" "}
                    <span style={{ color: "#00ff88", fontWeight: 700 }}>
                      +${parseFloat(result.bonus_awarded || 0).toFixed(2)}
                    </span>
                    {"  ·  "}
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.7rem",
                        opacity: 0.6,
                      }}
                    >
                      {result.server_seed?.slice(0, 14)}...
                    </span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── RIGHT: Controls ── */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {/* Balance */}
            {balance !== null && (
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  padding: "1rem",
                  textAlign: "center",
                }}
              >
                <p
                  style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}
                >
                  Balance
                </p>
                <p
                  style={{
                    color: "#f0c040",
                    fontWeight: 900,
                    fontSize: "1.6rem",
                  }}
                >
                  $
                  {balance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            )}

            {/* Bet */}
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "1.5rem",
              }}
            >
              <h3 style={{ fontWeight: 700, marginBottom: "4px" }}>
                Bet Amount
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.78rem",
                  marginBottom: "1rem",
                }}
              >
                Min:{" "}
                <span style={{ color: "#f0c040", fontWeight: 700 }}>$100</span>
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: "6px",
                  marginBottom: "1rem",
                }}
              >
                {[100, 250, 500, 1000, 2500, 5000].map((a) => (
                  <button
                    key={a}
                    onClick={() => setBetAmount(String(a))}
                    style={{
                      padding: "8px 4px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background:
                        Number(betAmount) === a
                          ? "rgba(240,192,64,0.2)"
                          : "var(--navy)",
                      border:
                        Number(betAmount) === a
                          ? "1px solid #f0c040"
                          : "1px solid var(--border)",
                      color:
                        Number(betAmount) === a
                          ? "#f0c040"
                          : "var(--text-secondary)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                    }}
                  >
                    ${a >= 1000 ? `${a / 1000}K` : a}
                  </button>
                ))}
              </div>

              <input
                type="number"
                value={betAmount}
                min="100"
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Min $100"
                style={{
                  width: "100%",
                  padding: "12px",
                  marginBottom: "1rem",
                  background: "var(--navy)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  color: "var(--text-primary)",
                  fontSize: "1rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />

              <button
                onClick={handleSpin}
                disabled={spinning}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: spinning
                    ? "rgba(240,192,64,0.3)"
                    : "linear-gradient(135deg,#f0c040,#c9a227)",
                  border: "none",
                  borderRadius: "12px",
                  color: "#000",
                  fontWeight: 900,
                  fontSize: "1.1rem",
                  cursor: spinning ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: spinning
                    ? "none"
                    : "0 0 20px rgba(240,192,64,0.35)",
                }}
              >
                {spinning ? (
                  <>
                    <RotateCcw
                      size={18}
                      style={{ animation: "spin 0.6s linear infinite" }}
                    />{" "}
                    Spinning...
                  </>
                ) : (
                  <>
                    SPIN <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>

            {/* Odds */}
            <div
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
                Win Odds
              </h3>
              {[
                { label: "? Loss", color: "#ff4444", chance: "70%" },
                { label: "$1,000", color: "#00ff88", chance: "10%" },
                { label: "$10,000", color: "#00d4ff", chance: "7%" },
                { label: "🎁 Physical Prize", color: "#c084fc", chance: "6%" },
                { label: "$50,000", color: "#f0c040", chance: "7%" },
              ].map((t) => (
                <div
                  key={t.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span
                    style={{
                      color: t.color,
                      fontWeight: 700,
                      fontSize: "0.88rem",
                    }}
                  >
                    {t.label}
                  </span>
                  <span
                    style={{
                      background: t.color + "18",
                      color: t.color,
                      padding: "2px 8px",
                      borderRadius: "50px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {t.chance}
                  </span>
                </div>
              ))}
            </div>

            {/* Prize pool preview */}
            <div
              style={{
                background: "var(--card)",
                border: "1px solid rgba(192,132,252,0.3)",
                borderRadius: "16px",
                padding: "1.5rem",
              }}
            >
              <h3
                style={{
                  fontWeight: 700,
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                  color: "#c084fc",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Gift size={14} /> Prize Pool
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px",
                }}
              >
                {PHYSICAL_PRIZES.slice(0, 6).map((p, i) => (
                  <div
                    key={i}
                    style={{
                      borderRadius: "8px",
                      overflow: "hidden",
                      position: "relative",
                      height: "64px",
                    }}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background:
                          "linear-gradient(transparent,rgba(0,0,0,0.88))",
                        padding: "3px 5px",
                      }}
                    >
                      <p
                        style={{
                          color: "#fff",
                          fontSize: "0.58rem",
                          fontWeight: 700,
                          lineHeight: 1.2,
                        }}
                      >
                        {p.name}
                      </p>
                      <p style={{ color: "#00ff88", fontSize: "0.56rem" }}>
                        {p.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.7rem",
                  marginTop: "8px",
                  textAlign: "center",
                }}
              >
                +{PHYSICAL_PRIZES.length - 6} more: mansions, watches, trips &
                more
              </p>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  padding: "1.2rem",
                }}
              >
                <h3
                  style={{
                    fontWeight: 700,
                    marginBottom: "0.75rem",
                    fontSize: "0.9rem",
                  }}
                >
                  Recent Spins
                </h3>
                {history.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "5px 0",
                      borderBottom: "1px solid var(--border)",
                      fontSize: "0.82rem",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      $
                      {parseFloat(h.spin?.bet_amount || h.payout || 0).toFixed(
                        0,
                      )}{" "}
                      bet
                    </span>
                    <span
                      style={{
                        color: h.prize_tier === "loss" ? "#ff4444" : "#00ff88",
                        fontWeight: 700,
                      }}
                    >
                      {h.prize_tier === "loss"
                        ? "💀 Loss"
                        : h.prize_tier === "prize"
                          ? "🎁 Prize"
                          : `+$${Number(h.payout).toLocaleString()}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prize shuffle overlay */}
      {showShuffle && <PrizeShuffle onClose={handleShuffleClose} />}
    </div>
  );
}
