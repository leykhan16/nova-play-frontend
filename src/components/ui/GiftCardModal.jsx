import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Gift, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

const CARD_TYPES = [
  "Amazon",
  "iTunes / Apple",
  "Google Play",
  "Steam",
  "Vanilla Visa",
  "American Express",
  "eBay",
  "Walmart",
  "Target",
  "Nike",
  "Xbox",
  "PlayStation",
  "Other",
];

export default function GiftCardModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("choose"); // choose | image | manual
  const [cardType, setCardType] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [cardNumber, setCardNumber] = useState("");
  const [cardPin, setCardPin] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setMode("image");
  };

  const handleSubmit = async () => {
    if (!cardType) {
      toast.error("Select card type");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Enter card amount");
      return;
    }
    if (mode === "image" && !image) {
      toast.error("Upload gift card image");
      return;
    }
    if (mode === "manual" && !cardNumber) {
      toast.error("Enter card number");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("card_type", cardType);
      formData.append("currency", currency);

      if (mode === "image" && image) {
        formData.append("image", image);
      }

      if (mode === "manual") {
        formData.append("card_number", cardNumber);
        formData.append("card_pin", cardPin);
      }

      await api.post("/payments/gift-card", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Gift card submitted! Admin will verify shortly.");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit gift card");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={onClose}
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
          maxWidth: "460px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Gift size={20} color="var(--gold)" />
            <h3 style={{ fontWeight: 800, fontSize: "1.2rem" }}>
              Gift Card Payment
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Card type selector */}
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
            Card Type
          </label>
          <div style={{ position: "relative" }}>
            <select
              value={cardType}
              onChange={(e) => setCardType(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 40px 12px 16px",
                background: "var(--navy)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                color: cardType
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
                fontSize: "0.95rem",
                outline: "none",
                appearance: "none",
                cursor: "pointer",
              }}
            >
              <option value="">Select card type...</option>
              {CARD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-secondary)",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>

        {/* Amount and currency */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "8px",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                marginBottom: "6px",
                fontWeight: 600,
              }}
            >
              Card Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--navy)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                marginBottom: "6px",
                fontWeight: 600,
              }}
            >
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{
                padding: "12px",
                background: "var(--navy)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                color: "var(--text-primary)",
                fontSize: "0.95rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>

        {/* Choose mode */}
        {mode === "choose" && (
          <div>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              How would you like to submit your gift card?
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              {/* Camera / Gallery */}
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  background: "var(--navy)",
                  border: "2px solid var(--border)",
                  borderRadius: "14px",
                  padding: "1.5rem 1rem",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "var(--gold)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border)")
                }
              >
                <Camera size={28} color="var(--gold)" />
                <span
                  style={{
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  Take Photo
                </span>
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.75rem",
                  }}
                >
                  Camera or Gallery
                </span>
              </button>

              {/* Manual entry */}
              <button
                onClick={() => setMode("manual")}
                style={{
                  background: "var(--navy)",
                  border: "2px solid var(--border)",
                  borderRadius: "14px",
                  padding: "1.5rem 1rem",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "var(--gold)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border)")
                }
              >
                <Upload size={28} color="#00d4ff" />
                <span
                  style={{
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  Enter Details
                </span>
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.75rem",
                  }}
                >
                  Type card info
                </span>
              </button>
            </div>

            {/* Hidden file input — accepts camera and gallery */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
          </div>
        )}

        {/* Image preview mode */}
        {mode === "image" && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
              }}
            >
              <label
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                Gift Card Image
              </label>
              <button
                onClick={() => {
                  setMode("choose");
                  setImage(null);
                  setImagePreview(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                }}
              >
                Change
              </button>
            </div>

            {imagePreview && (
              <div
                style={{
                  position: "relative",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "2px solid rgba(240,192,64,0.3)",
                }}
              >
                <img
                  src={imagePreview}
                  alt="Gift card"
                  style={{
                    width: "100%",
                    maxHeight: "200px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                    padding: "1rem",
                    color: "#fff",
                    fontSize: "0.8rem",
                  }}
                >
                  ✅ Image ready to submit
                </div>
              </div>
            )}

            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: "100%",
                marginTop: "8px",
                padding: "10px",
                background: "none",
                border: "1px dashed var(--border)",
                borderRadius: "8px",
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              📷 Choose different image
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
          </div>
        )}

        {/* Manual entry mode */}
        {mode === "manual" && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <label
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                Card Details
              </label>
              <button
                onClick={() => setMode("choose")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                }}
              >
                ← Back
              </button>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  color: "var(--text-secondary)",
                  fontSize: "0.82rem",
                  marginBottom: "6px",
                }}
              >
                Card Number / Claim Code *
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "var(--navy)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "monospace",
                  letterSpacing: "1px",
                }}
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  color: "var(--text-secondary)",
                  fontSize: "0.82rem",
                  marginBottom: "6px",
                }}
              >
                PIN (if applicable)
              </label>
              <input
                type="text"
                value={cardPin}
                onChange={(e) => setCardPin(e.target.value)}
                placeholder="Optional"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "var(--navy)",
                  border: "1px solid var(--border)",
                  borderRadius: "10px",
                  color: "var(--text-primary)",
                  fontSize: "0.95rem",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "monospace",
                }}
              />
            </div>

            <div
              style={{
                background: "rgba(255,68,68,0.08)",
                border: "1px solid rgba(255,68,68,0.2)",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: "0.8rem",
                color: "#ff8888",
              }}
            >
              🔒 Your card details are encrypted and only visible to admins for
              verification.
            </div>
          </div>
        )}

        {/* Submit button */}
        {(mode === "image" || mode === "manual") && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: "100%",
              padding: "14px",
              background: submitting
                ? "rgba(240,192,64,0.4)"
                : "linear-gradient(135deg, #f0c040, #c9a227)",
              border: "none",
              borderRadius: "12px",
              color: "#000",
              fontWeight: 800,
              fontSize: "1rem",
              cursor: submitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {submitting ? "Submitting..." : "🎁 Submit Gift Card"}
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
