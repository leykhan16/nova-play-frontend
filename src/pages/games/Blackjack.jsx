import { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { walletAPI } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

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
  let total = hand.reduce((sum, c) => sum + cardValue(c), 0);
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
        ? "linear-gradient(135deg, #1a1a3e, #0f0f2e)"
        : "#ffffff",
      border: hidden ? "2px solid var(--border)" : "2px solid #ddd",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "6px",
      fontSize: "1rem",
      fontWeight: 900,
      color: hidden ? "transparent" : isRed(card.suit) ? "#dc2626" : "#111",
      userSelect: "none",
      flexShrink: 0,
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    }}
  >
    {hidden ? (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "repeating-linear-gradient(45deg, #2a2a4a, #2a2a4a 5px, #1a1a3e 5px, #1a1a3e 10px)",
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
  const [phase, setPhase] = useState("betting"); // betting | playing | dealer | result
  const [betAmount, setBetAmount] = useState("10");
  const [balance, setBalance] = useState(null);
  const [result, setResult] = useState(null);
  const [dealerRevealed, setDealerRevealed] = useState(false);

  useState(() => {
    walletAPI
      .getWallet()
      .then((res) => setBalance(res.data.data.balance))
      .catch(() => {});
  }, []);

  const deal = () => {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error("Enter a bet amount");
      return;
    }
    if (parseFloat(betAmount) > balance) {
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
    setBalance((prev) => prev - parseFloat(betAmount));

    // Check immediate blackjack
    if (handTotal(p) === 21) {
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
      if (handTotal(currentDealer) < 17) {
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
              ? `Dealer busts! You win $${bet * 2}!`
              : `You win $${bet * 2}!`,
          );
        } else if (outcome === "push") {
          setBalance((prev) => prev + bet);
          toast.success("Push — bet returned");
        } else {
          toast.error("Dealer wins");
        }
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
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div
          style={{
            marginBottom: "2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900 }}>
              🃏 Blackjack
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Beat the dealer. Get to 21 without going over.
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
            background: "linear-gradient(135deg, #0d4a2a, #0a3a20)",
            border: "3px solid #1a6a3a",
            borderRadius: "24px",
            padding: "2rem",
            minHeight: "400px",
            position: "relative",
          }}
        >
          {/* Dealer hand */}
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

          {/* Center message */}
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Player hand */}
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
                {[5, 10, 25, 50, 100].map((amt) => (
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
                      fontSize: "0.85rem",
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
                placeholder="Bet"
                style={{
                  width: "80px",
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
                  background: "linear-gradient(135deg, #f0c040, #c9a227)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "12px 24px",
                  color: "#000",
                  fontWeight: 800,
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                {phase === "result" ? "Deal Again" : "Deal"}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={hit}
                disabled={phase !== "playing"}
                style={{
                  background: "linear-gradient(135deg, #00ff88, #00cc66)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "14px 32px",
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
                  background: "linear-gradient(135deg, #ff6b6b, #cc4444)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "14px 32px",
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
        </div>
      </div>
    </div>
  );
}
