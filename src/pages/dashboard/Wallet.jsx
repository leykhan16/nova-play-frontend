import { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { walletAPI, paymentsAPI } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { ArrowDownLeft, ArrowUpRight, Plus, RefreshCw } from "lucide-react";
import GiftCardModal from "../../components/ui/GiftCardModal";

const PAYMENT_METHODS = [
  { id: "bank_transfer", label: "Bank Transfer", icon: "🏦" },
  { id: "crypto", label: "Crypto", icon: "₿" },
  { id: "zelle", label: "Zelle", icon: "💸" },
  { id: "card", label: "Card", icon: "💳" },
  { id: "apple_pay", label: "Apple Pay", icon: "🍎" },
  { id: "gift_card", label: "Gift Card", icon: "🎁" },
];

export default function Wallet() {
  const { user } = useContext(AuthContext);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [depositForm, setDepositForm] = useState({
    amount: "",
    payment_method: "bank_transfer",
  });
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [showGiftCard, setShowGiftCard] = useState(false);

  const fetchData = async () => {
    try {
      const [wRes, tRes] = await Promise.all([
        walletAPI.getWallet(),
        walletAPI.getTransactions(),
      ]);
      setWallet(wRes.data.data);
      setTransactions(tRes.data.data);
    } catch (err) {
      toast.error("Could not load wallet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositForm.amount || depositForm.amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    if (depositForm.payment_method === "gift_card") {
      setShowDeposit(false);
      setShowGiftCard(true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await paymentsAPI.initiate({
        amount: parseFloat(depositForm.amount),
        currency: "USD",
        payment_method: depositForm.payment_method,
      });
      setPendingPayment(res.data.data);
      setShowDeposit(false);
      toast.success("Payment initiated! Waiting for admin to send details.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not initiate payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmSent = async () => {
    if (!pendingPayment) return;
    setSubmitting(true);
    try {
      await paymentsAPI.confirmSent(pendingPayment.id);
      toast.success("Payment confirmed! Admin will verify shortly.");
      setPendingPayment(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not confirm payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || withdrawAmount < 5000) {
      toast.error("Minimum withdrawal is $5,000");
      return;
    }
    setSubmitting(true);
    try {
      await walletAPI.withdraw({
        amount: parseFloat(withdrawAmount),
        currency: "USD",
      });
      toast.success(`Withdrawal of $${withdrawAmount} processed!`);
      setShowWithdraw(false);
      setWithdrawAmount("");
      fetchData();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Could not process withdrawal",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const txTypeColor = (type) => {
    if (["deposit", "payout", "bonus"].includes(type)) return "#00ff88";
    return "#ff4444";
  };

  const txTypeIcon = (type) => {
    if (["deposit", "payout", "bonus"].includes(type))
      return <ArrowDownLeft size={14} />;
    return <ArrowUpRight size={14} />;
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <RefreshCw
          size={32}
          color="var(--gold)"
          style={{ animation: "spin 1s linear infinite" }}
        />
      </div>
    );

  return (
    <div
      style={{ minHeight: "100vh", background: "var(--navy)", padding: "2rem" }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: "2rem" }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 900,
              marginBottom: "0.5rem",
            }}
          >
            My Wallet
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage your balance and transactions
          </p>
        </motion.div>

        {/* Balance card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            background: "linear-gradient(135deg, #1a1a3e, #0f0f2e)",
            border: "1px solid rgba(240,192,64,0.3)",
            borderRadius: "20px",
            padding: "2.5rem",
            marginBottom: "2rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: "-50px",
              top: "-50px",
              width: "200px",
              height: "200px",
              background:
                "radial-gradient(circle, rgba(240,192,64,0.08) 0%, transparent 70%)",
              borderRadius: "50%",
            }}
          />
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
              marginBottom: "0.5rem",
            }}
          >
            Available Balance
          </p>
          <h2
            style={{
              fontSize: "3.5rem",
              fontWeight: 900,
              color: "var(--gold)",
              marginBottom: "0.5rem",
            }}
          >
            $
            {wallet?.balance?.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            {wallet?.currency} · Updated just now
          </p>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginTop: "2rem",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => setShowDeposit(true)}
              style={{
                background: "linear-gradient(135deg, #f0c040, #c9a227)",
                border: "none",
                borderRadius: "10px",
                padding: "12px 24px",
                color: "#000",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.9rem",
              }}
            >
              <Plus size={16} /> Deposit
            </button>
            <button
              onClick={() => setShowWithdraw(true)}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "12px 24px",
                color: "var(--text-primary)",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.9rem",
              }}
            >
              <ArrowUpRight size={16} /> Withdraw
            </button>
            <button
              onClick={fetchData}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                padding: "12px",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </motion.div>

        {/* Pending payment banner */}
        {pendingPayment && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "rgba(240,192,64,0.08)",
              border: "1px solid rgba(240,192,64,0.3)",
              borderRadius: "14px",
              padding: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <h3
              style={{
                color: "var(--gold)",
                fontWeight: 700,
                marginBottom: "0.5rem",
              }}
            >
              ⏳ Payment Pending
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
                marginBottom: "1rem",
              }}
            >
              Amount:{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                ${pendingPayment.amount}
              </strong>{" "}
              via{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {pendingPayment.payment_method}
              </strong>
              <br />
              Reference:{" "}
              <strong style={{ color: "var(--gold)", fontSize: "0.85rem" }}>
                {pendingPayment.payment_reference}
              </strong>
            </p>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              An admin will send you payment details shortly. Once you've sent
              the payment, click the button below.
            </p>
            <button
              onClick={handleConfirmSent}
              disabled={submitting}
              style={{
                background: "linear-gradient(135deg, #f0c040, #c9a227)",
                border: "none",
                borderRadius: "8px",
                padding: "10px 20px",
                color: "#000",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              {submitting ? "Confirming..." : "✅ I Have Sent the Payment"}
            </button>
          </motion.div>
        )}

        {/* Deposit modal */}
        {showDeposit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "1rem",
            }}
            onClick={() => setShowDeposit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                padding: "2rem",
                width: "100%",
                maxWidth: "420px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                style={{
                  fontWeight: 800,
                  fontSize: "1.3rem",
                  marginBottom: "1.5rem",
                }}
              >
                💰 Deposit Funds
              </h3>
              <form onSubmit={handleDeposit}>
                <div style={{ marginBottom: "1.2rem" }}>
                  <label
                    style={{
                      display: "block",
                      color: "var(--text-secondary)",
                      fontSize: "0.85rem",
                      marginBottom: "6px",
                      fontWeight: 600,
                    }}
                  >
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    value={depositForm.amount}
                    min="100"
                    onChange={(e) =>
                      setDepositForm({ ...depositForm, amount: e.target.value })
                    }
                    placeholder="Minimum $100"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: "var(--navy)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      color: "var(--text-primary)",
                      fontSize: "1rem",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.78rem",
                      marginTop: "4px",
                    }}
                  >
                    Minimum deposit:{" "}
                    <span style={{ color: "var(--gold)", fontWeight: 700 }}>
                      $100
                    </span>
                  </p>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label
                    style={{
                      display: "block",
                      color: "var(--text-secondary)",
                      fontSize: "0.85rem",
                      marginBottom: "8px",
                      fontWeight: 600,
                    }}
                  >
                    Payment Method
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "8px",
                    }}
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() =>
                          setDepositForm({
                            ...depositForm,
                            payment_method: m.id,
                          })
                        }
                        style={{
                          padding: "10px 8px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          border:
                            depositForm.payment_method === m.id
                              ? "2px solid var(--gold)"
                              : "1px solid var(--border)",
                          background:
                            depositForm.payment_method === m.id
                              ? "rgba(240,192,64,0.1)"
                              : "var(--navy)",
                          color: "var(--text-primary)",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{ fontSize: "1.2rem", marginBottom: "2px" }}
                        >
                          {m.icon}
                        </div>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "linear-gradient(135deg, #f0c040, #c9a227)",
                    border: "none",
                    borderRadius: "10px",
                    color: "#000",
                    fontWeight: 800,
                    fontSize: "1rem",
                    cursor: "pointer",
                  }}
                >
                  {submitting
                    ? "Processing..."
                    : depositForm.payment_method === "gift_card"
                      ? "🎁 Submit Gift Card"
                      : "Initiate Payment"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Withdraw modal */}
        {showWithdraw && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "1rem",
            }}
            onClick={() => setShowWithdraw(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                padding: "2rem",
                width: "100%",
                maxWidth: "420px",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                style={{
                  fontWeight: 800,
                  fontSize: "1.3rem",
                  marginBottom: "0.5rem",
                }}
              >
                💸 Withdraw Funds
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                  marginBottom: "1.5rem",
                }}
              >
                Minimum withdrawal:{" "}
                <span style={{ color: "var(--gold)", fontWeight: 700 }}>
                  $5,000
                </span>
              </p>
              <form onSubmit={handleWithdraw}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label
                    style={{
                      display: "block",
                      color: "var(--text-secondary)",
                      fontSize: "0.85rem",
                      marginBottom: "6px",
                      fontWeight: 600,
                    }}
                  >
                    Amount (USD)
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    min="5000"
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="5000"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      background: "var(--navy)",
                      border: "1px solid var(--border)",
                      borderRadius: "10px",
                      color: "var(--text-primary)",
                      fontSize: "1rem",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.8rem",
                      marginTop: "6px",
                    }}
                  >
                    Available:{" "}
                    <span style={{ color: "var(--gold)" }}>
                      ${wallet?.balance?.toLocaleString()}
                    </span>
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "linear-gradient(135deg, #f0c040, #c9a227)",
                    border: "none",
                    borderRadius: "10px",
                    color: "#000",
                    fontWeight: 800,
                    fontSize: "1rem",
                    cursor: "pointer",
                  }}
                >
                  {submitting ? "Processing..." : "Withdraw"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Transaction history */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            padding: "1.5rem",
          }}
        >
          <h3
            style={{
              fontWeight: 800,
              marginBottom: "1.5rem",
              fontSize: "1.1rem",
            }}
          >
            Transaction History
          </h3>
          {transactions.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: "var(--text-secondary)",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</div>
              No transactions yet. Make your first deposit!
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem",
                    background: "var(--navy)",
                    borderRadius: "10px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        background: `${txTypeColor(tx.transaction_type)}15`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: txTypeColor(tx.transaction_type),
                      }}
                    >
                      {txTypeIcon(tx.transaction_type)}
                    </div>
                    <div>
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          textTransform: "capitalize",
                        }}
                      >
                        {tx.transaction_type}
                      </p>
                      <p
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "0.78rem",
                        }}
                      >
                        {new Date(tx.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: "1rem",
                        color:
                          parseFloat(tx.amount) > 0 ? "#00ff88" : "#ff4444",
                      }}
                    >
                      {parseFloat(tx.amount) > 0 ? "+" : ""}$
                      {Math.abs(parseFloat(tx.amount)).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color:
                          tx.status === "completed"
                            ? "#00ff88"
                            : "var(--text-secondary)",
                      }}
                    >
                      {tx.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Gift Card Modal */}
      {showGiftCard && (
        <GiftCardModal
          onClose={() => setShowGiftCard(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
