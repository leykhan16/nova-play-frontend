import { useState, useRef, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gamesAPI, walletAPI } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Users, History } from "lucide-react";

const TICK_INTERVAL = 100;
const GROWTH_RATE = 0.00006;
const calcMultiplier = (elapsed) =>
  Math.max(1, Math.pow(Math.E, GROWTH_RATE * elapsed));

export default function CrashGame() {
  const { user } = useContext(AuthContext);
  const [phase, setPhase] = useState("waiting");
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(null);
  const [betAmount, setBetAmount] = useState("");
  const [activeBet, setActiveBet] = useState(null);
  const [balance, setBalance] = useState(0);
  const [demoMode, setDemoMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [countdown, setCountdown] = useState(5);
  const canvasRef = useRef(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true
      const token = localStorage.getItem('accessToken')
      if (token) {
        walletAPI.getWallet().then(r => setBalance(r.data.data.balance)).catch(() => {})
      }
      startNewRound()
    }
    return () => clearInterval(intervalRef.current)
  }, [])
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const pointsRef = useRef([]);

  const startNewRound = () => {
    setPhase("waiting");
    setMultiplier(1.0);
    setCrashPoint(null);
    setActiveBet(null);
    pointsRef.current = [];
    setCountdown(5);

    let count = 5;
    const cdInterval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) clearInterval(cdInterval);
    }, 1000);

    setTimeout(() => {
      // Realistic crash distribution — mostly low, rarely high
      const roll = Math.random();
      let fakeCrash;
      if (roll < 0.04)
        fakeCrash = 1.0; // 4%  — instant crash
      else if (roll < 0.44)
        fakeCrash = parseFloat((1.0 + Math.random() * 0.5).toFixed(2)); // 40% — 1.00-1.50x
      else if (roll < 0.69)
        fakeCrash = parseFloat((1.5 + Math.random() * 0.5).toFixed(2)); // 25% — 1.50-2.00x
      else if (roll < 0.84)
        fakeCrash = parseFloat((2.0 + Math.random() * 1.0).toFixed(2)); // 15% — 2.00-3.00x
      else if (roll < 0.94)
        fakeCrash = parseFloat((3.0 + Math.random() * 2.0).toFixed(2)); // 10% — 3.00-5.00x
      else if (roll < 0.97)
        fakeCrash = parseFloat((5.0 + Math.random() * 5.0).toFixed(2)); // 3%  — 5.00-10.00x
      else fakeCrash = parseFloat((10.0 + Math.random() * 90.0).toFixed(2)); // 3%  — 10x-100x rare

      setCrashPoint(fakeCrash);
      setPhase("running");
      startTimeRef.current = Date.now();
      runGameLoop(fakeCrash);
    }, 5500);
  };

  const runGameLoop = (crash) => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const cur = calcMultiplier(elapsed);
      setMultiplier(parseFloat(cur.toFixed(2)));
      drawCanvas(cur);

      if (cur >= crash) {
        clearInterval(intervalRef.current);
        setMultiplier(parseFloat(crash.toFixed(2)));
        setPhase("crashed");
        setActiveBet((prev) => {
          if (prev) toast.error(`Crashed at ${crash}x — Lost $${prev.amount}`);
          return null;
        });
        walletAPI
          .getWallet()
          .then((r) => setBalance(r.data.data.balance))
          .catch(() => {});
        gamesAPI
          .getHistory()
          .then((r) => setHistory(r.data.data.slice(0, 10)))
          .catch(() => {});
        setTimeout(startNewRound, 4000);
      }
    }, TICK_INTERVAL);
  };

  const drawCanvas = (cur) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const elapsed = Date.now() - startTimeRef.current;
    const x = Math.min((elapsed / 20000) * W, W - 10);
    const y = H - 40 - Math.min((cur - 1) / 9, 1) * (H - 80);
    pointsRef.current.push({ x, y });

    if (pointsRef.current.length < 2) return;

    const g = ctx.createLinearGradient(0, H, W, 0);
    g.addColorStop(0, "#00ff88");
    g.addColorStop(0.5, "#f0c040");
    g.addColorStop(1, "#ff4444");

    ctx.beginPath();
    ctx.moveTo(pointsRef.current[0].x, pointsRef.current[0].y);
    pointsRef.current.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = g;
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.stroke();

    ctx.lineTo(x, H - 40);
    ctx.lineTo(pointsRef.current[0].x, H - 40);
    ctx.closePath();
    ctx.fillStyle = "rgba(0,255,136,0.05)";
    ctx.fill();

    const last = pointsRef.current[pointsRef.current.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#00ff88";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const handlePlaceBet = async () => {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error("Enter a valid bet amount");
      return;
    }
    if (phase !== "waiting") {
      toast.error("Wait for the next round");
      return;
    }
    const isDemo = parseFloat(betAmount) > balance || balance <= 0
    if (!isDemo) {
      try {
        // Create a game first then place bet
        await walletAPI.crashBet({ amount: parseFloat(betAmount), currency: 'USD' })
        setBalance((prev) => prev - parseFloat(betAmount))
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Could not place bet')
        return
      }
    }
    setActiveBet({ amount: parseFloat(betAmount), demo: isDemo });
    setDemoMode(isDemo);
    toast.success(isDemo ? `🎮 Demo bet of ${betAmount} placed!` : `Bet placed — ${betAmount}`);
    setBetAmount("");
  };

  const handleCashOut = async () => {
    if (!activeBet || phase !== "running") return;
    const payout = (activeBet.amount * multiplier).toFixed(2);
    if (!activeBet.demo) {
      try {
        await gamesAPI.endGame(activeBet.gameId, {
          crash_point: parseFloat(multiplier),
          status: 'crashed'
        })
        walletAPI.getWallet().then((r) => setBalance(r.data.data.balance)).catch(() => {})
        toast.success(`🎉 Cashed out at ${multiplier}x — Won ${payout}!`)
      } catch (err) {
        toast.error('Cashout failed')
        return
      }
    } else {
      toast.success(`🎮 Demo cashout at ${multiplier}x — Would have won ${payout}!`)
    }
    setActiveBet(null)
  };

  const mColor = () => {
    if (phase === "crashed") return "#ff4444";
    if (multiplier >= 5) return "#f0c040";
    if (multiplier >= 2) return "#00d4ff";
    return "#00ff88";
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900 }}>🚀 Crash</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Cash out before it crashes!
            </p>
          </div>
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
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: "1.5rem",
          }}
        >
          {/* Canvas side */}
          <div>
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Multiplier overlay */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  textAlign: "center",
                  zIndex: 10,
                }}
              >
                <AnimatePresence mode="wait">
                  {phase === "waiting" ? (
                    <motion.div
                      key="waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "1rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Next round in
                      </div>
                      <div
                        style={{
                          color: "var(--gold)",
                          fontSize: "4rem",
                          fontWeight: 900,
                        }}
                      >
                        {countdown}s
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="running"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <div
                        style={{
                          fontSize: "clamp(3rem, 8vw, 5rem)",
                          fontWeight: 900,
                          color: mColor(),
                          textShadow: `0 0 40px ${mColor()}`,
                          lineHeight: 1,
                        }}
                      >
                        {multiplier.toFixed(2)}x
                      </div>
                      {phase === "crashed" && (
                        <>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                              color: "#ff4444",
                              fontWeight: 700,
                              marginTop: "0.5rem",
                              fontSize: "1.2rem",
                            }}
                          >
                            CRASHED!
                          </motion.div>
                          {crashPoint !== null && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              style={{
                                color: "var(--text-secondary)",
                                marginTop: "0.35rem",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                              }}
                            >
                              Crash at {crashPoint.toFixed(2)}x
                            </motion.div>
                          )}
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <canvas
                ref={canvasRef}
                width={700}
                height={350}
                style={{ width: "100%", height: "350px", display: "block" }}
              />
            </div>

            {/* History */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "1rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <History size={14} color="var(--text-secondary)" />
              {history.map((g, i) => (
                <span
                  key={i}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "50px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    background:
                      parseFloat(g.crash_point) < 2
                        ? "rgba(255,68,68,0.15)"
                        : "rgba(0,255,136,0.1)",
                    color:
                      parseFloat(g.crash_point) < 2 ? "#ff4444" : "#00ff88",
                    border: `1px solid ${parseFloat(g.crash_point) < 2 ? "rgba(255,68,68,0.3)" : "rgba(0,255,136,0.2)"}`,
                  }}
                >
                  {parseFloat(g.crash_point).toFixed(2)}x
                </span>
              ))}
            </div>
          </div>

          {/* Bet panel */}
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
              <h3
                style={{
                  fontWeight: 700,
                  marginBottom: "1rem",
                  fontSize: "1rem",
                }}
              >
                Place Bet
              </h3>

              {/* Quick amounts */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "6px",
                  marginBottom: "1rem",
                }}
              >
                {[10, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBetAmount(amt.toString())}
                    style={{
                      padding: "8px 4px",
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
                      fontSize: "0.8rem",
                      fontWeight: 600,
                    }}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Custom amount"
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

              {/* Bet / Cashout button */}
              {!activeBet ? (
                <button
                  onClick={handlePlaceBet}
                  disabled={phase !== "waiting"}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background:
                      phase === "waiting"
                        ? "linear-gradient(135deg, #f0c040, #c9a227)"
                        : "rgba(240,192,64,0.3)",
                    border: "none",
                    borderRadius: "10px",
                    color: "#000",
                    fontWeight: 800,
                    fontSize: "1rem",
                    cursor: phase === "waiting" ? "pointer" : "not-allowed",
                  }}
                >
                  {phase === "waiting"
                    ? "Place Bet"
                    : phase === "crashed"
                      ? "Round Ended"
                      : "Round in Progress"}
                </button>
              ) : (
                <button
                  onClick={handleCashOut}
                  disabled={phase !== "running"}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background:
                      phase === "running"
                        ? "linear-gradient(135deg, #00ff88, #00cc66)"
                        : "rgba(0,255,136,0.3)",
                    border: "none",
                    borderRadius: "10px",
                    color: "#000",
                    fontWeight: 800,
                    fontSize: "1rem",
                    cursor: "pointer",
                    animation:
                      phase === "running"
                        ? "pulse 1s ease-in-out infinite"
                        : "none",
                  }}
                >
                  {phase === "running"
                    ? `Cash Out @ ${multiplier.toFixed(2)}x = $${(activeBet.amount * multiplier).toFixed(2)}`
                    : "Waiting..."}
                </button>
              )}

              {/* Active bet info */}
              {activeBet && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "10px",
                    borderRadius: "8px",
                    background: "rgba(0,255,136,0.08)",
                    border: "1px solid rgba(0,255,136,0.2)",
                    textAlign: "center",
                    fontSize: "0.85rem",
                  }}
                >
                  <span style={{ color: "var(--text-secondary)" }}>Bet: </span>
                  <span style={{ color: "#00ff88", fontWeight: 700 }}>
                    ${activeBet.amount}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {" "}
                    · Profit:{" "}
                  </span>
                  <span style={{ color: "#00ff88", fontWeight: 700 }}>
                    +$
                    {(activeBet.amount * multiplier - activeBet.amount).toFixed(
                      2,
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Live players */}
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "1rem",
                }}
              >
                <Users size={16} color="var(--text-secondary)" />
                <h3 style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  Live Players
                </h3>
              </div>
              {[
                { name: "nova***", bet: 50, cashedOut: 1.4 },
                { name: "king***", bet: 100, cashedOut: null },
                { name: "ace***", bet: 25, cashedOut: 1.8 },
                { name: "star***", bet: 200, cashedOut: null },
              ].map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span style={{ fontSize: "0.85rem" }}>{p.name}</span>
                  <div>
                    <span
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      ${p.bet}
                    </span>
                    {p.cashedOut && (
                      <span
                        style={{
                          color: "#00ff88",
                          fontSize: "0.78rem",
                          marginLeft: "6px",
                          fontWeight: 700,
                        }}
                      >
                        @{p.cashedOut}x
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {activeBet && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--gold)",
                      fontWeight: 700,
                    }}
                  >
                    👤 {user?.username}
                  </span>
                  <span
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    ${activeBet.amount}
                  </span>
                </div>
              )}
            </div>

            {/* Round info */}
            <div
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "16px",
                padding: "1.2rem",
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
              }}
            >
              <p style={{ marginBottom: "4px" }}>
                🎯{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  How to play:
                </strong>
              </p>
              <p>
                Place your bet before the round starts. The multiplier climbs —
                cash out before it crashes to win. Wait too long and you lose
                everything.
              </p>
              <p style={{ marginTop: "8px", color: "#ff4444" }}>
                ⚠️ Most rounds crash below 2x. Cash out early!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
