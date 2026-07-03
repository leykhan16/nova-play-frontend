import { useState, useRef, useEffect } from "react";
import { walletAPI } from "../../services/api";
import toast from "react-hot-toast";

const ROWS = 12;
const MULTIPLIERS = [0, 0.5, 1, 2, 3, 5, 10, 5, 3, 2, 1, 0.5, 0];

const buildPegs = () => {
  const pegs = [];
  for (let row = 0; row < ROWS; row++)
    for (let col = 0; col <= row; col++)
      pegs.push({ x: 250 + (col - row / 2) * 40, y: 60 + row * 38 });
  return pegs;
};

const pegs = buildPegs();

export default function Plinko() {
  const canvasRef = useRef(null);
  const [betAmount, setBetAmount] = useState("10");
  const [balance, setBalance] = useState(null);
  const [dropping, setDropping] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    walletAPI
      .getWallet()
      .then((res) => setBalance(res.data.data.balance))
      .catch(() => {});
    setTimeout(drawBoard, 100);
  }, []);

  const drawBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pegs.forEach((peg) => {
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#f0c040";
      ctx.fill();
    });
    MULTIPLIERS.forEach((mult, i) => {
      const x = 250 + (i - (MULTIPLIERS.length - 1) / 2) * 40 - 18;
      const y = canvas.height - 60;
      const color =
        mult >= 5
          ? "#f0c040"
          : mult >= 2
            ? "#00d4ff"
            : mult >= 1
              ? "#00ff88"
              : "#ff4444";
      ctx.fillStyle = color + "22";
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y, 36, 40, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`${mult}x`, x + 18, y + 24);
    });
  };

  const dropBall = () => {
    if (dropping) return;
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error("Enter a bet amount");
      return;
    }
    if (parseFloat(betAmount) > balance) {
      toast.error("Insufficient balance");
      return;
    }
    setDropping(true);
    setBalance((prev) => prev - parseFloat(betAmount));
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let slot = 0;
    const path = [];
    for (let row = 0; row < ROWS; row++) {
      const goRight = Math.random() > 0.5;
      if (goRight) slot++;
      path.push({ slot, row });
    }
    let ballX = 250,
      ballY = 20,
      pathIndex = 0;
    const animate = () => {
      drawBoard();
      ctx.beginPath();
      ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#ffffff";
      ctx.fill();
      ctx.shadowBlur = 0;
      if (pathIndex < path.length) {
        const pegIndex =
          (path[pathIndex].row * (path[pathIndex].row + 1)) / 2 +
          path[pathIndex].slot;
        const target = pegs[pegIndex];
        if (target) {
          ballX += (target.x - ballX) * 0.15;
          ballY += (target.y - ballY) * 0.15;
          if (Math.abs(ballX - target.x) < 2 && Math.abs(ballY - target.y) < 2)
            pathIndex++;
        }
        requestAnimationFrame(animate);
      } else {
        const finalX = 250 + (slot - (MULTIPLIERS.length - 1) / 2) * 40;
        ballX += (finalX - ballX) * 0.1;
        ballY += (canvas.height - 50 - ballY) * 0.1;
        if (Math.abs(ballY - (canvas.height - 50)) > 3) {
          requestAnimationFrame(animate);
        } else {
          const multiplier = MULTIPLIERS[slot];
          const payout = parseFloat(betAmount) * multiplier;
          setBalance((prev) => prev + payout);
          setLastResult({ multiplier, payout });
          setHistory((prev) =>
            [{ multiplier, payout, bet: parseFloat(betAmount) }, ...prev].slice(
              0,
              8,
            ),
          );
          setDropping(false);
          if (payout > 0)
            toast.success(`${multiplier}x — Won $${payout.toFixed(2)}!`);
          else toast.error("0x — Better luck next time!");
          setTimeout(drawBoard, 100);
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
              Drop the ball. Watch it bounce to your prize.
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
              height={560}
              style={{ width: "100%", display: "block" }}
            />
          </div>

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
              <h3 style={{ fontWeight: 700, marginBottom: "1rem" }}>
                Drop Ball
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "6px",
                  marginBottom: "1rem",
                }}
              >
                {[5, 10, 25, 50, 100, 250].map((amt) => (
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
              <button
                onClick={dropBall}
                disabled={dropping}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: dropping
                    ? "rgba(240,192,64,0.3)"
                    : "linear-gradient(135deg, #f0c040, #c9a227)",
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
                    fontSize: "2rem",
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
              </div>
            )}

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
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {[...new Set(MULTIPLIERS)]
                  .sort((a, b) => b - a)
                  .map((m) => (
                    <span
                      key={m}
                      style={{
                        padding: "3px 8px",
                        borderRadius: "50px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        background:
                          m >= 5
                            ? "rgba(240,192,64,0.15)"
                            : m >= 2
                              ? "rgba(0,212,255,0.15)"
                              : m >= 1
                                ? "rgba(0,255,136,0.15)"
                                : "rgba(255,68,68,0.15)",
                        color:
                          m >= 5
                            ? "#f0c040"
                            : m >= 2
                              ? "#00d4ff"
                              : m >= 1
                                ? "#00ff88"
                                : "#ff4444",
                      }}
                    >
                      {m}x
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
