import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { gamesAPI, walletAPI } from "../../services/api";
import toast from "react-hot-toast";
import { ArrowRight, RotateCcw, Gift } from "lucide-react";
import PrizeShuffle from "../../components/ui/PrizeShuffle";

// ── 16 SEGMENTS ───────────────────────────────────────────────────────────────
const SEGMENTS = [
  { label: "?", color: "#cc2222", tier: "loss" },
  { label: "$1K", color: "#00ff88", tier: "1000" },
  { label: "?", color: "#cc2222", tier: "loss" },
  { label: "PRIZE", color: "#c084fc", tier: "prize" },
  { label: "?", color: "#cc2222", tier: "loss" },
  { label: "$10K", color: "#00d4ff", tier: "10000" },
  { label: "?", color: "#cc2222", tier: "loss" },
  { label: "$50K", color: "#f0c040", tier: "50000" },
  { label: "?", color: "#cc2222", tier: "loss" },
  { label: "$1K", color: "#00ff88", tier: "1000" },
  { label: "?", color: "#cc2222", tier: "loss" },
  { label: "PRIZE", color: "#c084fc", tier: "prize" },
  { label: "?", color: "#cc2222", tier: "loss" },
  { label: "$10K", color: "#00d4ff", tier: "10000" },
  { label: "?", color: "#cc2222", tier: "loss" },
  { label: "$1K", color: "#00ff88", tier: "1000" },
];

const N = SEGMENTS.length; // 16
const SEG_DEG = 360 / N; // 22.5°

const ODDS = [
  { label: "? Loss", color: "#ff4444", chance: "60%" },
  { label: "PRIZE 🎁", color: "#c084fc", chance: "10%" },
  { label: "$1,000", color: "#00ff88", chance: "10%" },
  { label: "$10,000", color: "#00d4ff", chance: "7%" },
  { label: "$50,000", color: "#f0c040", chance: "13%" },
];

const PREVIEW = [
  {
    name: "Lamborghini Urus",
    value: "$250K",
    image:
      "https://images.unsplash.com/photo-1621135802920-133df287f89c?w=400&q=80",
  },
  {
    name: "Manhattan Penthouse",
    value: "$2M",
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80",
  },
  {
    name: "Maldives 7 Nights",
    value: "$25K",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80",
  },
  {
    name: "Rolex Submariner",
    value: "$40K",
    image:
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400&q=80",
  },
  {
    name: "Paris Luxury Trip",
    value: "$15K",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80",
  },
  {
    name: "Patek Philippe",
    value: "$80K",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80",
  },
];

// ── WHEEL CANVAS ──────────────────────────────────────────────────────────────
function drawWheel(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const R = cx - 4;
  const rad = (d) => (d * Math.PI) / 180;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < N; i++) {
    const seg = SEGMENTS[i];
    const sRad = rad(i * SEG_DEG - 90);
    const eRad = rad((i + 1) * SEG_DEG - 90);
    const midRad = rad(i * SEG_DEG + SEG_DEG / 2 - 90);
    const isLoss = seg.tier === "loss";

    // Fill
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, sRad, eRad);
    ctx.closePath();
    ctx.fillStyle = isLoss
      ? i % 2 === 0
        ? "#200404"
        : "#280606"
      : seg.color + "20";
    ctx.fill();
    ctx.strokeStyle = seg.color;
    ctx.lineWidth = isLoss ? 0.6 : 1.8;
    ctx.stroke();

    // Label
    const lr = R * 0.68;
    const lx = cx + lr * Math.cos(midRad);
    const ly = cy + lr * Math.sin(midRad);

    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(midRad + Math.PI / 2);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (isLoss) {
      ctx.font = "bold 20px Arial, sans-serif";
      ctx.fillStyle = "#ff4444";
      ctx.fillText("?", 0, 0);
    } else if (seg.tier === "prize") {
      ctx.font = "bold 8.5px Arial, sans-serif";
      ctx.fillStyle = "#c084fc";
      ctx.fillText("PRIZE", 0, 0);
    } else {
      ctx.font = "bold 9px Arial, sans-serif";
      ctx.fillStyle = seg.color;
      ctx.fillText(seg.label, 0, 0);
    }
    ctx.restore();
  }

  // Outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = "#f0c040";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Center
  ctx.beginPath();
  ctx.arc(cx, cy, 30, 0, Math.PI * 2);
  ctx.fillStyle = "#0a0a1a";
  ctx.fill();
  ctx.strokeStyle = "#f0c040";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#f0c040";
  ctx.font = "bold 13px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("NP", cx, cy);
}

// ── RESULT CARD ───────────────────────────────────────────────────────────────
function ResultCard({ result, wonPrize }) {
  if (!result) return null;

  const isLoss = result.prize_tier === "loss";
  const isPrize = result.prize_tier === "prize";

  const title = isLoss
    ? "House Wins!"
    : isPrize
      ? wonPrize
        ? wonPrize.name
        : "🎁 Prize Coming..."
      : result.prize_tier === "1000"
        ? "You Won $1,000!"
        : result.prize_tier === "10000"
          ? "You Won $10,000!"
          : "You Won $50,000!";

  const borderColor = isLoss
    ? "rgba(255,68,68,0.5)"
    : isPrize
      ? "rgba(192,132,252,0.5)"
      : "rgba(240,192,64,0.5)";

  const bgColor = isLoss
    ? "rgba(200,20,20,0.08)"
    : isPrize
      ? "rgba(192,132,252,0.08)"
      : "rgba(240,192,64,0.08)";

  const titleColor = isLoss ? "#ff4444" : isPrize ? "#c084fc" : "#f0c040";

  const emoji = isLoss ? "💀" : isPrize ? "🎁" : "🎉";

  return (
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
        background: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: "18px",
        padding: "1.5rem",
      }}
    >
      <div style={{ fontSize: "2.5rem", marginBottom: "6px" }}>{emoji}</div>

      <h3
        style={{
          fontWeight: 900,
          fontSize: "1.6rem",
          marginBottom: "4px",
          color: titleColor,
        }}
      >
        {title}
      </h3>

      {/* Cash amount */}
      {!isLoss && !isPrize && (
        <p
          style={{
            color: "#00ff88",
            fontSize: "1.05rem",
            fontWeight: 700,
            marginTop: "4px",
          }}
        >
          ${Number(result.payout || 0).toLocaleString()} added to your wallet
        </p>
      )}

      {/* Prize image — shown after shuffle */}
      {isPrize && wonPrize && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginTop: "1rem" }}
        >
          <img
            src={wonPrize.image_url || wonPrize.image || ""}
            alt={wonPrize.name}
            style={{
              width: "100%",
              borderRadius: "10px",
              maxHeight: "160px",
              objectFit: "cover",
            }}
          />
          <p style={{ color: "#00ff88", fontWeight: 700, marginTop: "6px" }}>
            Valued at ${Number(wonPrize.estimated_value || 0).toLocaleString()}
          </p>
        </motion.div>
      )}

      {/* Bonus + seed */}
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.78rem",
          marginTop: "10px",
        }}
      >
        {isLoss ? "Consolation" : "Winner"} bonus:{" "}
        <span style={{ color: "#00ff88", fontWeight: 700 }}>
          +${parseFloat(result.bonus_awarded || 0).toFixed(2)}
        </span>
        {"  ·  "}
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "0.68rem",
            opacity: 0.45,
          }}
        >
          {(result.server_seed || "").slice(0, 12)}...
        </span>
      </p>
    </motion.div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function SpinWin() {
  const [betAmount, setBetAmount] = useState("100");
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [showShuffle, setShowShuffle] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);

  const canvasRef = useRef(null);
  const wheelRef = useRef(null); // raw div — CSS rotation, not Framer Motion
  const rotRef = useRef(0); // cumulative degrees

  const fetchBalance = () =>
    walletAPI
      .getWallet()
      .then((r) => setBalance(r.data.data.balance))
      .catch(() => {});

  useEffect(() => {
    drawWheel(canvasRef.current);
    fetchBalance();
  }, []);

  // Pick a random segment index matching the given tier
  const pickSegment = useCallback((tier) => {
    const matches = SEGMENTS.map((s, i) => ({ ...s, i })).filter(
      (s) => s.tier === tier,
    );
    if (matches.length === 0) {
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
      toast.error("Enter a valid amount");
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

      // 1. Which segment to land on
      const segIdx = pickSegment(data.prize_tier);

      // 2. Compute exact rotation needed
      // Segment i center sits at canvasDeg from 12-o-clock when wheel is at 0°
      // 2. Compute exact rotation needed
      const canvasDeg = segIdx * SEG_DEG + SEG_DEG / 2 - 90;
      const screenPos = ((canvasDeg % 360) + 360) % 360;
      // To bring screenPos to pointer (0°), rotate by (360 - screenPos)
      const targetRot = (360 - screenPos) % 360;
      const currentMod = ((rotRef.current % 360) + 360) % 360;
      let delta = (targetRot - currentMod + 360) % 360;
      if (delta < 10) delta += 360;
      delta += 360 * (6 + Math.floor(Math.random() * 3));
      delta += (Math.random() - 0.5) * SEG_DEG * 0.35;

      rotRef.current += delta;

      // 3. Apply rotation via plain CSS on a raw div
      //    This avoids Framer Motion's internal normalization which corrupts
      //    large rotation values and lands on the wrong segment.
      if (wheelRef.current) {
        wheelRef.current.style.transition =
          "transform 6s cubic-bezier(0.08, 0.82, 0.05, 1.0)";
        wheelRef.current.style.transform = `rotate(${rotRef.current}deg)`;
      }

      // 4. Show result after spin completes (6s + 0.5s buffer)
      setTimeout(() => {
        setResult(data);
        setHistory((prev) => [data, ...prev].slice(0, 6));
        fetchBalance();
        setSpinning(false);

        if (data.prize_tier === "prize") {
          setTimeout(() => setShowShuffle(true), 600);
        } else if (data.prize_tier === "loss") {
          toast.error("💀 House wins!");
        } else {
          toast.success(`🎉 ${data.message}`);
        }
      }, 6500);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Connection error — try again",
      );
      setSpinning(false);
    }
  };

  const handleShuffleClose = (prize) => {
    setWonPrize(prize);
    setShowShuffle(false);
    if (prize) toast.success(`🎁 You won: ${prize.name}!`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--navy)",
        padding: "1.5rem",
      }}
    >
      <div style={{ maxWidth: "1060px", margin: "0 auto" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 900 }}>🎰 Spin & Win</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Min $100 · Provably fair · Physical prizes available
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
          {/* LEFT — Wheel */}
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
                  borderTop: "30px solid #f0c040",
                  filter: "drop-shadow(0 0 14px #f0c040)",
                }}
              />

              {/* Wheel — raw div with CSS transition */}
              <div
                ref={wheelRef}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  transform: "rotate(0deg)",
                  willChange: "transform",
                }}
              >
                <canvas
                  ref={canvasRef}
                  width={450}
                  height={450}
                  style={{ width: "100%", height: "100%", display: "block" }}
                />
              </div>
            </div>

            {/* Spinning indicator */}
            {spinning && (
              <motion.p
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
                  size={15}
                  style={{ animation: "spin 0.5s linear infinite" }}
                />
                Spinning...
              </motion.p>
            )}

            {/* Result */}
            <AnimatePresence>
              {result && !showShuffle && (
                <ResultCard result={result} wonPrize={wonPrize} />
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT — Controls */}
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
                    fontSize: "1.5rem",
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
                    : "0 0 20px rgba(240,192,64,0.3)",
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
              {ODDS.map((t) => (
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

            {/* Prize pool */}
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
                {PREVIEW.map((p, i) => (
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
                Cars · Mansions · Vacations · Watches & more
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
                      ${parseFloat(h.spin?.bet_amount || 100).toFixed(0)} bet
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
                          : `+$${Number(h.payout || 0).toLocaleString()}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prize shuffle — receives EXACT prize from backend */}
      {showShuffle && (
        <PrizeShuffle wonPrize={result?.prize} onClose={handleShuffleClose} />
      )}
    </div>
  );
}
