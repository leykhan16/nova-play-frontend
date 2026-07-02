import { useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../../context/AuthContext";
import { ArrowRight, Lock } from "lucide-react";

const games = [
  {
    name: "Crash",
    description: "Watch the multiplier climb. Cash out before it crashes.",
    emoji: "🚀",
    color: "#00ff88",
    path: "/games/crash",
    badge: "LIVE",
    players: "2,847 playing",
  },
  {
    name: "Spin & Win",
    description: "Spin for $1K, $10K, $50K or a physical prize.",
    emoji: "🎰",
    color: "#f0c040",
    path: "/games/spin",
    badge: "HOT",
    players: "1,203 playing",
  },
  {
    name: "Blackjack",
    description: "Beat the dealer. Get to 21 without going over.",
    emoji: "🃏",
    color: "#00d4ff",
    path: "/games/blackjack",
    badge: "NEW",
    players: "892 playing",
  },
  {
    name: "Plinko",
    description: "Drop the ball. Watch it bounce to your prize.",
    emoji: "🎯",
    color: "#ff6b6b",
    path: "/games/plinko",
    badge: "NEW",
    players: "634 playing",
  },
  {
    name: "American Roulette",
    description: "Pick your number. Watch the wheel spin.",
    emoji: "🎡",
    color: "#c084fc",
    path: "/games/roulette",
    badge: "SOON",
    players: null,
  },
  {
    name: "Video Poker",
    description: "Five card draw. Skill meets slots.",
    emoji: "♠️",
    color: "#fb923c",
    path: "/games/poker",
    badge: "SOON",
    players: null,
  },
];

const badgeColors = {
  LIVE: { bg: "rgba(0,255,136,0.15)", color: "#00ff88" },
  HOT: { bg: "rgba(240,192,64,0.15)", color: "#f0c040" },
  NEW: { bg: "rgba(0,212,255,0.15)", color: "#00d4ff" },
  SOON: { bg: "rgba(255,255,255,0.08)", color: "#666" },
};

export default function Lobby() {
  const { user } = useContext(AuthContext);

  return (
    <div
      style={{ minHeight: "100vh", background: "var(--navy)", padding: "2rem" }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: "2.5rem" }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 900,
              marginBottom: "0.5rem",
            }}
          >
            Welcome back,{" "}
            <span style={{ color: "var(--gold)" }}>{user?.username}</span> 👋
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Choose a game and start winning. Every outcome is provably fair.
          </p>
        </motion.div>

        {/* Live ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            padding: "12px 20px",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            overflowX: "auto",
          }}
        >
          <span
            style={{
              color: "#00ff88",
              fontWeight: 700,
              fontSize: "0.8rem",
              whiteSpace: "nowrap",
            }}
          >
            🟢 LIVE
          </span>
          {[
            { user: "nova***", game: "Spin & Win", amount: "$10,000" },
            { user: "star***", game: "Crash", amount: "$2,400" },
            { user: "king***", game: "Spin & Win", amount: "$1,000" },
            { user: "ace***", game: "Plinko", amount: "$500" },
            { user: "jack***", game: "Crash", amount: "$8,750" },
          ].map((win, i) => (
            <span
              key={i}
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.82rem",
                whiteSpace: "nowrap",
                padding: "4px 12px",
                background: "rgba(255,255,255,0.04)",
                borderRadius: "50px",
                border: "1px solid var(--border)",
              }}
            >
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                {win.user}
              </span>
              {" won "}
              <span style={{ color: "#00ff88", fontWeight: 700 }}>
                {win.amount}
              </span>
              {" on "}
              {win.game}
            </span>
          ))}
        </motion.div>

        {/* Games grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {games.map((game, i) => {
            const badge = badgeColors[game.badge];
            const isLocked = game.badge === "SOON";

            return (
              <motion.div
                key={game.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={!isLocked ? { y: -4, scale: 1.01 } : {}}
              >
                <Link
                  to={isLocked ? "#" : game.path}
                  style={{ textDecoration: "none", display: "block" }}
                  onClick={(e) => isLocked && e.preventDefault()}
                >
                  <div
                    style={{
                      background: "var(--card)",
                      border: `1px solid ${isLocked ? "var(--border)" : game.color + "35"}`,
                      borderRadius: "18px",
                      padding: "1.8rem",
                      position: "relative",
                      overflow: "hidden",
                      cursor: isLocked ? "not-allowed" : "pointer",
                      opacity: isLocked ? 0.6 : 1,
                      transition: "all 0.3s",
                    }}
                  >
                    {/* Top color line */}
                    {!isLocked && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "3px",
                          background: `linear-gradient(90deg, ${game.color}, transparent)`,
                        }}
                      />
                    )}

                    {/* Header */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "1.2rem",
                      }}
                    >
                      <span style={{ fontSize: "2.8rem" }}>{game.emoji}</span>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            background: badge.bg,
                            color: badge.color,
                            padding: "4px 12px",
                            borderRadius: "50px",
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            letterSpacing: "1px",
                          }}
                        >
                          {game.badge}
                        </span>
                        {isLocked && <Lock size={14} color="#666" />}
                      </div>
                    </div>

                    {/* Info */}
                    <h3
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        marginBottom: "0.4rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {game.name}
                    </h3>
                    <p
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "0.88rem",
                        lineHeight: 1.5,
                        marginBottom: "1.2rem",
                      }}
                    >
                      {game.description}
                    </p>

                    {/* Footer */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      {game.players ? (
                        <span
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.78rem",
                          }}
                        >
                          🟢 {game.players}
                        </span>
                      ) : (
                        <span style={{ color: "#555", fontSize: "0.78rem" }}>
                          Coming soon
                        </span>
                      )}
                      {!isLocked && (
                        <span
                          style={{
                            color: game.color,
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          Play <ArrowRight size={14} />
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
