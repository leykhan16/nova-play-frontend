import { useState } from "react";
import { motion } from "framer-motion";
import { supportAPI } from "../../services/api";
import toast from "react-hot-toast";
import { X, Package } from "lucide-react";

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Nigeria",
  "UAE",
  "Singapore",
  "Other",
];
const ID_TYPES = ["Passport", "Driver's License", "National ID", "State ID"];

export default function PrizeDeliveryForm({ prize, betPrizeId, onClose }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    country: "United States",
    postal_code: "",
    id_type: "Passport",
    id_number: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const inp = {
    style: {
      width: "100%",
      padding: "10px 14px",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid var(--border)",
      borderRadius: "8px",
      color: "var(--text-primary)",
      fontSize: "0.9rem",
      outline: "none",
      boxSizing: "border-box",
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = [
      "full_name",
      "email",
      "phone",
      "address_line1",
      "city",
      "state",
      "country",
      "postal_code",
      "id_type",
      "id_number",
    ];
    for (const f of required) {
      if (!form[f]) {
        toast.error(`Please fill in ${f.replace(/_/g, " ")}`);
        return;
      }
    }
    setSubmitting(true);
    try {
      await supportAPI.submitPrizeDelivery({
        ...form,
        prize_id: prize?.id,
        bet_prize_id: betPrizeId,
      });
      setDone(true);
      toast.success(
        "Delivery form submitted! Admin will contact you within 24 hours.",
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit form");
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
        background: "rgba(0,0,0,0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 3000,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={{
          background: "linear-gradient(135deg,#0f0f2e,#1a0a2e)",
          border: "2px solid var(--gold)",
          borderRadius: "24px",
          padding: "2rem",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 0 60px rgba(240,192,64,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Package size={20} color="var(--gold)" />
            <h3
              style={{
                fontWeight: 800,
                fontSize: "1.2rem",
                color: "var(--gold)",
              }}
            >
              Claim Your Prize
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

        {prize && (
          <div
            style={{
              background: "rgba(192,132,252,0.1)",
              border: "1px solid rgba(192,132,252,0.3)",
              borderRadius: "12px",
              padding: "1rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {prize.image_url && (
              <img
                src={prize.image_url}
                alt={prize.name}
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
              />
            )}
            <div>
              <p style={{ color: "#c084fc", fontWeight: 700 }}>{prize.name}</p>
              <p style={{ color: "#00ff88", fontSize: "0.85rem" }}>
                Valued at ${Number(prize.estimated_value || 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {done ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
            <h3
              style={{
                color: "var(--gold)",
                fontWeight: 900,
                marginBottom: "0.5rem",
              }}
            >
              Form Submitted!
            </h3>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
                marginBottom: "1.5rem",
              }}
            >
              Our team will contact you within 24 hours to arrange delivery of
              your prize.
            </p>
            <button
              onClick={onClose}
              style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg,#f0c040,#c9a227)",
                border: "none",
                borderRadius: "10px",
                color: "#000",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.82rem",
                marginBottom: "1.2rem",
              }}
            >
              Fill in your details so we can deliver your prize. All fields
              marked * are required.
            </p>

            {/* Personal info */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              {[
                ["full_name", "Full Name *", "John Doe"],
                ["email", "Email *", "you@email.com"],
              ].map(([k, l, p]) => (
                <div key={k}>
                  <label
                    style={{
                      display: "block",
                      color: "var(--text-secondary)",
                      fontSize: "0.78rem",
                      marginBottom: "4px",
                      fontWeight: 600,
                    }}
                  >
                    {l}
                  </label>
                  <input
                    {...inp}
                    type={k === "email" ? "email" : "text"}
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    placeholder={p}
                    required
                  />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label
                style={{
                  display: "block",
                  color: "var(--text-secondary)",
                  fontSize: "0.78rem",
                  marginBottom: "4px",
                  fontWeight: 600,
                }}
              >
                Phone Number *
              </label>
              <input
                {...inp}
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 234 567 8900"
                required
              />
            </div>

            {/* Address */}
            <div style={{ marginBottom: "0.75rem" }}>
              <label
                style={{
                  display: "block",
                  color: "var(--text-secondary)",
                  fontSize: "0.78rem",
                  marginBottom: "4px",
                  fontWeight: 600,
                }}
              >
                Address Line 1 *
              </label>
              <input
                {...inp}
                value={form.address_line1}
                onChange={(e) =>
                  setForm({ ...form, address_line1: e.target.value })
                }
                placeholder="123 Main Street"
                required
              />
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <label
                style={{
                  display: "block",
                  color: "var(--text-secondary)",
                  fontSize: "0.78rem",
                  marginBottom: "4px",
                  fontWeight: 600,
                }}
              >
                Address Line 2
              </label>
              <input
                {...inp}
                value={form.address_line2}
                onChange={(e) =>
                  setForm({ ...form, address_line2: e.target.value })
                }
                placeholder="Apt, Suite, etc (optional)"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              {[
                ["city", "City *", "New York"],
                ["state", "State/Province *", "NY"],
                ["postal_code", "Postal Code *", "10001"],
              ].map(([k, l, p]) => (
                <div key={k}>
                  <label
                    style={{
                      display: "block",
                      color: "var(--text-secondary)",
                      fontSize: "0.78rem",
                      marginBottom: "4px",
                      fontWeight: 600,
                    }}
                  >
                    {l}
                  </label>
                  <input
                    {...inp}
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    placeholder={p}
                    required
                  />
                </div>
              ))}
            </div>

            <div style={{ marginBottom: "0.75rem" }}>
              <label
                style={{
                  display: "block",
                  color: "var(--text-secondary)",
                  fontSize: "0.78rem",
                  marginBottom: "4px",
                  fontWeight: 600,
                }}
              >
                Country *
              </label>
              <select
                {...inp}
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                required
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* ID verification */}
            <div
              style={{
                background: "rgba(240,192,64,0.06)",
                border: "1px solid rgba(240,192,64,0.2)",
                borderRadius: "10px",
                padding: "1rem",
                marginBottom: "0.75rem",
              }}
            >
              <p
                style={{
                  color: "var(--gold)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  marginBottom: "0.75rem",
                }}
              >
                🪪 ID Verification (required for prize delivery)
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      color: "var(--text-secondary)",
                      fontSize: "0.78rem",
                      marginBottom: "4px",
                      fontWeight: 600,
                    }}
                  >
                    ID Type *
                  </label>
                  <select
                    {...inp}
                    value={form.id_type}
                    onChange={(e) =>
                      setForm({ ...form, id_type: e.target.value })
                    }
                    required
                  >
                    {ID_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      color: "var(--text-secondary)",
                      fontSize: "0.78rem",
                      marginBottom: "4px",
                      fontWeight: 600,
                    }}
                  >
                    ID Number *
                  </label>
                  <input
                    {...inp}
                    value={form.id_number}
                    onChange={(e) =>
                      setForm({ ...form, id_number: e.target.value })
                    }
                    placeholder="ID number"
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  color: "var(--text-secondary)",
                  fontSize: "0.78rem",
                  marginBottom: "4px",
                  fontWeight: 600,
                }}
              >
                Additional Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any special delivery instructions..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "14px",
                background: submitting
                  ? "rgba(192,132,252,0.3)"
                  : "linear-gradient(135deg,#c084fc,#9333ea)",
                border: "none",
                borderRadius: "12px",
                color: "#fff",
                fontWeight: 900,
                fontSize: "1rem",
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 0 20px rgba(192,132,252,0.3)",
              }}
            >
              {submitting ? "Submitting..." : "🏆 Submit Delivery Form"}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
