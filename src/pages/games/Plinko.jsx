import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { walletAPI } from "../../services/api";
import toast from "react-hot-toast";
import { RotateCcw } from "lucide-react";

const ROWS = 13;
const MULTIPLIERS = [0, 0, 0, 0.2, 0.5, 1, 3, 1, 0.5, 0.2, 0, 0, 0];
const CENTER_SLOT = 6; // index of the 3x slot

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
    name: "Rolex Submariner",
    category: "Luxury Watch",
    value: "$40,000",
    image:
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80",
  },
  {
    name: "Dubai VIP Experience",
    category: "Vacation",
    value: "$20,000",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
  },
  {
    name: "Patek Philippe",
    category: "Luxury Watch",
    value: "$80,000",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80",
  },
];

const PrizeShuffle = ({ onClose }) => {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    let step = 0;
    const tick = () => {
      step++;
      const delay = step < 20 ? 70 : step < 32 ? 160 : step < 40 ? 320 : 600;
      if (step >= 44) {
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
    setTimeout(tick, 70);
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
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        style={{
          background: "linear-gradient(135deg,#0f0f2e,#1a0a2e)",
          border: "2px solid #f0c040",
          borderRadius: "24px",
          padding: "2rem",
          width: "100%",
          maxWidth: "440px",
          textAlign: "center",
          boxShadow: "0 0 80px rgba(240,192,64,0.5)",
        }}
      >
        <p
          style={{
            color: "#f0c040",
            fontWeight: 900,
            letterSpacing: "2px",
            marginBottom: "1rem",
          }}
        >
          {done ? "🎉 JACKPOT PRIZE!" : "🎰 SELECTING PRIZE..."}
        </p>
        <motion.div
          key={idx}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          style={{
            borderRadius: "14px",
            overflow: "hidden",
            marginBottom: "1.2rem",
            border: `2px solid ${done ? "#f0c040" : "rgba(240,192,64,0.2)"}`,
            position: "relative",
          }}
        >
          <img
            src={p.image}
            alt={p.name}
            style={{ width: "100%", height: "200px", objectFit: "cover" }}
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
                size={36}
                color="#fff"
                style={{ animation: "spin 0.3s linear infinite" }}
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
            fontSize: "1.4rem",
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
            fontSize: "1.2rem",
            marginBottom: "1.2rem",
          }}
        >
          Valued at {p.value}
        </p>
        {done && winner && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              🎊 Plinko Jackpot! Admin will contact you within 24 hours.
            </p>
            <button
              onClick={() => onClose(winner)}
              style={{
                width: "100%",
                padding: "14px",
                background: "linear-gradient(135deg,#f0c040,#c9a227)",
                border: "none",
                borderRadius: "12px",
                color: "#000",
                fontWeight: 900,
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              🎁 Claim Prize
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

const buildPegs = () => {
  const pegs = [];
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col <= row; col++)
      pegs.push({ x: 250 + (col - row / 2) * 38, y: 55 + row * 36 });
  return pegs;
};
const PEGS = buildPegs();

export default function Plinko() {
  const canvasRef = useRef(null);
  const [betAmount, setBetAmount] = useState("100");
  const [balance, setBalance] = useState(null);
  const [dropping, setDropping] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showPrizeShuffle, setShowPrizeShuffle] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);

  useEffect(() => {
    walletAPI
      .getWallet()
      .then((r) => setBalance(r.data.data.balance))
      .catch(() => {});
    setTimeout(() => drawBoard(), 100);
  }, []);

  const drawBoard = (highlightSlot = -1) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Pegs
    PEGS.forEach((peg) => {
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#f0c040";
      ctx.shadowBlur = 4;
      ctx.shadowColor = "#f0c040";
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Multiplier slots
    MULTIPLIERS.forEach((mult, i) => {
      const x = 250 + (i - (MULTIPLIERS.length - 1) / 2) * 38 - 17;
      const y = canvas.height - 58;
      const isJP = i === CENTER_SLOT;
      const color = isJP
        ? "#f0c040"
        : mult >= 1
          ? "#00ff88"
          : mult > 0
            ? "#00d4ff"
            : "#ff4444";

      ctx.fillStyle = i === highlightSlot ? color + "55" : color + "18";
      ctx.strokeStyle = color;
      ctx.lineWidth = i === highlightSlot ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, 34, 42, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = isJP ? "bold 10px sans-serif" : "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(isJP ? "3x🎁" : `${mult}x`, x + 17, y + 21);
    });
  };

  const dropBall = () => {
    if (dropping) return;
    const bet = parseFloat(betAmount);
    if (!bet || bet <= 0) {
      toast.error("Enter a bet amount");
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

    setDropping(true);
    setWonPrize(null);
    setBalance((prev) => prev - bet);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Simulate ball path
    let slot = 0;
    const path = [];
    for (let row = 0; row < ROWS; row++) {
      const goRight = Math.random() > 0.5;
      if (goRight) slot++;
      path.push({ slot, row });
    }

    let ballX = 250;
    let ballY = 20;
    let pathIndex = 0;

    const animate = () => {
      drawBoard();

      // Ball
      ctx.beginPath();
      ctx.arc(ballX, ballY, 9, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(
        ballX - 3,
        ballY - 3,
        1,
        ballX,
        ballY,
        9,
      );
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(1, "#cccccc");
      ctx.fillStyle = grad;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#ffffff";
      ctx.fill();
      ctx.shadowBlur = 0;

      if (pathIndex < path.length) {
        const pegIdx =
          (path[pathIndex].row * (path[pathIndex].row + 1)) / 2 +
          path[pathIndex].slot;
        const target = PEGS[pegIdx];
        if (target) {
          ballX += (target.x - ballX) * 0.14;
          ballY += (target.y - ballY) * 0.14;
          if (Math.abs(ballX - target.x) < 2 && Math.abs(ballY - target.y) < 2)
            pathIndex++;
        }
        requestAnimationFrame(animate);
      } else {
        const finalX = 250 + (slot - (MULTIPLIERS.length - 1) / 2) * 38;
        ballX += (finalX - ballX) * 0.1;
        ballY += (canvas.height - 48 - ballY) * 0.1;

        if (Math.abs(ballY - (canvas.height - 48)) > 3) {
          requestAnimationFrame(animate);
        } else {
          // Landed
          const multiplier = MULTIPLIERS[slot];
          const payout = bet * multiplier;

          drawBoard(slot);
          setBalance((prev) => prev + payout);
          setLastResult({ multiplier, payout, slot });
          setHistory((prev) =>
            [{ multiplier, payout, bet }, ...prev].slice(0, 8),
          );
          setDropping(false);

          if (payout > 0) {
            toast.success(`${multiplier}x — Won $${payout.toFixed(2)}!`);
          } else {
            toast.error("0x — No win this time");
          }

          // Prize check — center jackpot slot (3x)
          if (slot === CENTER_SLOT && Math.random() < 0.2) {
            setTimeout(() => setShowPrizeShuffle(true), 800);
          }

          walletAPI
            .getWallet()
            .then((r) => setBalance(r.data.data.balance))
            .catch(() => {});
          setTimeout(() => drawBoard(), 2500);
        }
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--navy)",
        padding: "1.5rem",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900 }}>🎯 Plinko</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Drop the ball · Min $100 · Hit center 3x🎁 for a chance at a
              physical prize!
            </p>
          </div>
          {balance !== null && (
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "8px 16px",
              }}
            >
              💰{" "}
              <span style={{ color: "var(--gold)", fontWeight: 700 }}>
                $
                {balance?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 280px",
            gap: "1.5rem",
          }}
        >
          {/* Canvas */}
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "20px",
              overflow: "hidden",
            }}
          >
            <canvas
              ref={canvasRef}
              width={500}
              height={580}
              style={{ width: "100%", display: "block" }}
            />
          </div>

          {/* Controls */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "1.5rem",
              }}
            >
              <h3 style={{ fontWeight: 700, marginBottom: "4px" }}>
                Drop Ball
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
                  gridTemplateColumns: "repeat(2,1fr)",
                  gap: "6px",
                  marginBottom: "1rem",
                }}
              >
                {[100, 250, 500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBetAmount(amt.toString())}
                    style={{
                      padding: "8px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      background:
                        betAmount == amt
                          ? "rgba(240,192,64,0.2)"
                          : "var(--navy)",
                      border:
                        betAmount == amt
                          ? "1px solid var(--gold)"
                          : "1px solid var(--border)",
                      color:
                        betAmount == amt
                          ? "var(--gold)"
                          : "var(--text-secondary)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                    }}
                  >
                    ${amt >= 1000 ? `${amt / 1000}K` : amt}
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
                onClick={dropBall}
                disabled={dropping}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: dropping
                    ? "rgba(240,192,64,0.3)"
                    : "linear-gradient(135deg,#f0c040,#c9a227)",
                  border: "none",
                  borderRadius: "10px",
                  color: "#000",
                  fontWeight: 800,
                  fontSize: "1rem",
                  cursor: dropping ? "not-allowed" : "pointer",
                }}
              >
                {dropping ? "Dropping..." : "⬇ Drop Ball"}
              </button>
            </div>

            {/* Last result */}
            {lastResult && (
              <div
                style={{
                  background:
                    lastResult.payout > 0
                      ? "rgba(0,255,136,0.08)"
                      : "rgba(255,68,68,0.08)",
                  border: `1px solid ${lastResult.payout > 0 ? "rgba(0,255,136,0.3)" : "rgba(255,68,68,0.3)"}`,
                  borderRadius: "14px",
                  padding: "1.2rem",
                  textAlign: "center",
                }}
              >
                <p
                  style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}
                >
                  Last Result
                </p>
                <p
                  style={{
                    color: lastResult.payout > 0 ? "#00ff88" : "#ff4444",
                    fontWeight: 900,
                    fontSize: "2.2rem",
                  }}
                >
                  {lastResult.multiplier}x
                </p>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.85rem",
                  }}
                >
                  {lastResult.payout > 0
                    ? `+$${lastResult.payout.toFixed(2)}`
                    : "No win"}
                </p>
                {wonPrize && (
                  <div
                    style={{
                      marginTop: "0.75rem",
                      padding: "8px",
                      background: "rgba(192,132,252,0.1)",
                      borderRadius: "8px",
                      border: "1px solid rgba(192,132,252,0.3)",
                    }}
                  >
                    <p
                      style={{
                        color: "#c084fc",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      🎁 {wonPrize.name}
                    </p>
                    <p style={{ color: "#00ff88", fontSize: "0.8rem" }}>
                      {wonPrize.value}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Multiplier legend */}
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
                Multipliers
              </h3>
              {[
                {
                  label: "3x 🎁 Jackpot",
                  color: "#f0c040",
                  note: "20% prize chance",
                },
                { label: "1x", color: "#00ff88", note: "Break even" },
                { label: "0.5x", color: "#00d4ff", note: "Half loss" },
                { label: "0.2x", color: "#00d4ff", note: "Partial loss" },
                { label: "0x", color: "#ff4444", note: "Full loss" },
              ].map((m) => (
                <div
                  key={m.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      color: m.color,
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    {m.label}
                  </span>
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.75rem",
                    }}
                  >
                    {m.note}
                  </span>
                </div>
              ))}
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
                  History
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
                      ${h.bet} bet
                    </span>
                    <span
                      style={{
                        color: h.payout > 0 ? "#00ff88" : "#ff4444",
                        fontWeight: 700,
                      }}
                    >
                      {h.multiplier}x{" "}
                      {h.payout > 0 ? `+$${h.payout.toFixed(2)}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showPrizeShuffle && (
        <PrizeShuffle
          onClose={(prize) => {
            setWonPrize(prize);
            setShowPrizeShuffle(false);
            toast.success(`🎁 Jackpot! You won a ${prize.name}!`);
          }}
        />
      )}
    </div>
  );
}
