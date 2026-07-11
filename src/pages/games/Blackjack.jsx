import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { walletAPI } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { RotateCcw } from "lucide-react";

const SUITS = ["♠", "♥", "♦", "♣"];
const VALUES = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

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
    name: "Malibu Beach House",
    category: "Real Estate",
    value: "$1,500,000",
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
  },
  {
    name: "Dubai VIP Experience",
    category: "Vacation",
    value: "$20,000",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
  },
];

const PrizeShuffle = ({ onClose }) => {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);
  const [winner, setWinner] = useState(null);

  useState(() => {
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
          {done ? "🎉 BONUS PRIZE!" : "🎰 SELECTING PRIZE..."}
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
              🎊 Natural Blackjack bonus! Admin will contact you within 24
              hours.
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

const createDeck = () => {
  const deck = [];
  for (const suit of SUITS)
    for (const value of VALUES) deck.push({ suit, value });
  return deck.sort(() => Math.random() - 0.5);
};

const cardValue = (card) => {
  if (["J", "Q", "K"].includes(card.value)) return 10;
  if (card.value === "A") return 11;
  return parseInt(card.value);
};

const handTotal = (hand) => {
  let total = hand.reduce((s, c) => s + cardValue(c), 0);
  let aces = hand.filter((c) => c.value === "A").length;
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
};

const isRed = (suit) => ["♥", "♦"].includes(suit);

const Card = ({ card, hidden = false }) => (
  <motion.div
    initial={{ rotateY: 90, opacity: 0 }}
    animate={{ rotateY: 0, opacity: 1 }}
    transition={{ duration: 0.3 }}
    style={{
      width: "70px",
      height: "100px",
      borderRadius: "8px",
      background: hidden
        ? "linear-gradient(135deg,#1a1a3e,#0f0f2e)"
        : "#ffffff",
      border: hidden ? "2px solid var(--border)" : "2px solid #ddd",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "6px",
      fontSize: "1rem",
      fontWeight: 900,
      flexShrink: 0,
      color: hidden ? "transparent" : isRed(card.suit) ? "#dc2626" : "#111",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    }}
  >
    {hidden ? (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "repeating-linear-gradient(45deg,#2a2a4a,#2a2a4a 5px,#1a1a3e 5px,#1a1a3e 10px)",
          borderRadius: "4px",
        }}
      />
    ) : (
      <>
        <div style={{ fontSize: "0.85rem", lineHeight: 1 }}>
          {card.value}
          <br />
          {card.suit}
        </div>
        <div style={{ fontSize: "1.4rem", textAlign: "center" }}>
          {card.suit}
        </div>
        <div
          style={{
            fontSize: "0.85rem",
            lineHeight: 1,
            alignSelf: "flex-end",
            transform: "rotate(180deg)",
          }}
        >
          {card.value}
          <br />
          {card.suit}
        </div>
      </>
    )}
  </motion.div>
);

export default function Blackjack() {
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [phase, setPhase] = useState("betting");
  const [betAmount, setBetAmount] = useState("100");
  const [balance, setBalance] = useState(null);
  const [result, setResult] = useState(null);
  const [dealerRevealed, setDealerRevealed] = useState(false);
  const [showPrizeShuffle, setShowPrizeShuffle] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);

  useState(() => {
    walletAPI
      .getWallet()
      .then((r) => setBalance(r.data.data.balance))
      .catch(() => {});
  }, []);

  const deal = () => {
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

    const newDeck = createDeck();
    const p = [newDeck.pop(), newDeck.pop()];
    const d = [newDeck.pop(), newDeck.pop()];

    setDeck(newDeck);
    setPlayerHand(p);
    setDealerHand(d);
    setPhase("playing");
    setResult(null);
    setDealerRevealed(false);
    setWonPrize(null);
    setBalance((prev) => prev - bet);

    const playerTotal = handTotal(p);

    // Natural blackjack — 25% chance of physical prize
    if (playerTotal === 21 && p.length === 2) {
      toast.success("🃏 Natural Blackjack!");
      if (Math.random() < 0.25) {
        setTimeout(() => setShowPrizeShuffle(true), 1200);
      }
      setTimeout(() => stand(d, p, newDeck), 600);
      return;
    }

    if (playerTotal > 21) {
      setTimeout(() => stand(d, p, newDeck), 500);
    }
  };

  const hit = () => {
    const newDeck = [...deck];
    const newHand = [...playerHand, newDeck.pop()];
    setDeck(newDeck);
    setPlayerHand(newHand);
    if (handTotal(newHand) > 21) {
      setPhase("result");
      setDealerRevealed(true);
      setResult("bust");
    }
  };

  const stand = (dHand = dealerHand, pHand = playerHand, d = deck) => {
    setPhase("dealer");
    setDealerRevealed(true);
    let currentDealer = [...dHand];
    let currentDeck = [...d];

    const dealerPlay = () => {
      if (handTotal(currentDealer) < 19) {
        currentDealer.push(currentDeck.pop());
        setDealerHand([...currentDealer]);
        setTimeout(dealerPlay, 600);
      } else {
        const playerTotal = handTotal(pHand);
        const dealerTotal = handTotal(currentDealer);
        let outcome;

        if (dealerTotal > 21) outcome = "dealer_bust";
        else if (playerTotal > dealerTotal) outcome = "win";
        else if (playerTotal < dealerTotal) outcome = "lose";
        else outcome = "push";

        setResult(outcome);
        setPhase("result");

        const bet = parseFloat(betAmount);
        if (outcome === "win" || outcome === "dealer_bust") {
          setBalance((prev) => prev + bet * 2);
          toast.success(
            outcome === "dealer_bust"
              ? `Dealer busts! Won $${bet * 2}`
              : `You win $${bet * 2}!`,
          );
        } else if (outcome === "push") {
          setBalance((prev) => prev + bet);
          toast.success("Push — bet returned");
        } else {
          toast.error("Dealer wins");
        }
        walletAPI
          .getWallet()
          .then((r) => setBalance(r.data.data.balance))
          .catch(() => {});
      }
    };
    setTimeout(dealerPlay, 600);
  };

  const resultDisplay = {
    win: { text: "🎉 You Win!", color: "#00ff88" },
    lose: { text: "😞 Dealer Wins", color: "#ff4444" },
    bust: { text: "💥 Bust!", color: "#ff4444" },
    dealer_bust: { text: "🎉 Dealer Busts!", color: "#00ff88" },
    push: { text: "🤝 Push", color: "#f0c040" },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--navy)",
        padding: "1.5rem",
      }}
    >
      <div style={{ maxWidth: "820px", margin: "0 auto" }}>
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
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900 }}>
              🃏 Blackjack
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Beat the dealer · Min $100 · Natural Blackjack may trigger a
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

        {/* Table */}
        <div
          style={{
            background: "linear-gradient(135deg,#0d4a2a,#0a3a20)",
            border: "3px solid #1a6a3a",
            borderRadius: "24px",
            padding: "2rem",
            minHeight: "420px",
            position: "relative",
          }}
        >
          {/* Dealer */}
          {dealerHand.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.85rem",
                  marginBottom: "0.75rem",
                }}
              >
                Dealer {dealerRevealed ? `— ${handTotal(dealerHand)}` : ""}
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {dealerHand.map((card, i) => (
                  <Card
                    key={i}
                    card={card}
                    hidden={!dealerRevealed && i === 1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: "center", padding: "1rem" }}
              >
                <div
                  style={{
                    display: "inline-block",
                    background: "rgba(0,0,0,0.6)",
                    borderRadius: "16px",
                    padding: "1rem 2rem",
                    border: `2px solid ${resultDisplay[result]?.color}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: "2rem",
                      fontWeight: 900,
                      color: resultDisplay[result]?.color,
                    }}
                  >
                    {resultDisplay[result]?.text}
                  </p>
                  {wonPrize && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ marginTop: "0.75rem" }}
                    >
                      <p
                        style={{
                          color: "#c084fc",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        🎁 Bonus Prize: {wonPrize.name}
                      </p>
                      <p style={{ color: "#00ff88", fontSize: "0.85rem" }}>
                        {wonPrize.value}
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Player */}
          {playerHand.length > 0 && (
            <div style={{ marginTop: "2rem" }}>
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.85rem",
                  marginBottom: "0.75rem",
                }}
              >
                You — {handTotal(playerHand)}
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {playerHand.map((card, i) => (
                  <Card key={i} card={card} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {phase === "betting" && (
            <div
              style={{
                textAlign: "center",
                padding: "4rem",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🃏</div>
              Place your bet and deal to start
            </div>
          )}
        </div>

        {/* Controls */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            padding: "1.5rem",
            marginTop: "1rem",
          }}
        >
          {phase === "betting" || phase === "result" ? (
            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", gap: "6px" }}>
                {[100, 200, 500, 1000, 2000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBetAmount(amt.toString())}
                    style={{
                      padding: "8px 12px",
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
                      fontSize: "0.82rem",
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
                  width: "90px",
                  padding: "8px 12px",
                  background: "var(--navy)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  outline: "none",
                }}
              />
              <button
                onClick={deal}
                style={{
                  background: "linear-gradient(135deg,#f0c040,#c9a227)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 28px",
                  color: "#000",
                  fontWeight: 800,
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                {phase === "result" ? "🃏 Deal Again" : "🃏 Deal"}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={hit}
                disabled={phase !== "playing"}
                style={{
                  background: "linear-gradient(135deg,#00ff88,#00cc66)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "14px 0",
                  color: "#000",
                  fontWeight: 800,
                  cursor: "pointer",
                  fontSize: "1rem",
                  flex: 1,
                }}
              >
                Hit
              </button>
              <button
                onClick={() => stand()}
                disabled={phase !== "playing"}
                style={{
                  background: "linear-gradient(135deg,#ff6b6b,#cc4444)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "14px 0",
                  color: "#fff",
                  fontWeight: 800,
                  cursor: "pointer",
                  fontSize: "1rem",
                  flex: 1,
                }}
              >
                Stand
              </button>
            </div>
          )}

          {/* Prize hint */}
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.75rem",
              marginTop: "0.75rem",
              textAlign: "center",
            }}
          >
            🎁 Natural Blackjack (21 on first 2 cards) may trigger a physical
            prize draw!
          </p>
        </div>
      </div>

      {showPrizeShuffle && (
        <PrizeShuffle
          onClose={(prize) => {
            setWonPrize(prize);
            setShowPrizeShuffle(false);
            toast.success(`🎁 You won: ${prize.name}!`);
          }}
        />
      )}
    </div>
  );
}
