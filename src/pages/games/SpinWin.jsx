import { useState, useRef, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gamesAPI, walletAPI } from '../../services/api'
import { AuthContext } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { ArrowRight, RotateCcw } from 'lucide-react'

const PRIZES = [
  { label: '$1,000', value: 1000, color: '#00ff88', tier: '1000' },
  { label: '$10,000', value: 10000, color: '#00d4ff', tier: '10000' },
  { label: '?', value: 0, color: '#ff4444', tier: 'loss' },
  { label: '$50,000', value: 50000, color: '#f0c040', tier: '50000' },
  { label: '$1,000', value: 1000, color: '#00ff88', tier: '1000' },
  { label: '?', value: 0, color: '#ff4444', tier: 'loss' },
  { label: '$10,000', value: 10000, color: '#00d4ff', tier: '10000' },
  { label: '🎁 Prize', value: null, color: '#c084fc', tier: 'prize' },
  { label: '$1,000', value: 1000, color: '#00ff88', tier: '1000' },
  { label: '?', value: 0, color: '#ff4444', tier: 'loss' },
  { label: '$1,000', value: 1000, color: '#00ff88', tier: '1000' },
  { label: '$10,000', value: 10000, color: '#00d4ff', tier: '10000' },
]

const SEGMENT_ANGLE = 360 / PRIZES.length

const PRIZE_TIERS_DISPLAY = [
  { label: '$1,000', color: '#00ff88', chance: '45%' },
  { label: '$10,000', color: '#00d4ff', chance: '25%' },
  { label: '$50,000', color: '#f0c040', chance: '7.5%' },
  { label: 'Physical Prize', color: '#c084fc', chance: '1%' },
  { label: '? Loss', color: '#ff4444', chance: '21.5%' },
]

export default function SpinWin() {
  const { user } = useContext(AuthContext)
  const [betAmount, setBetAmount] = useState('10')
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState(null)
  const [balance, setBalance] = useState(null)
  const [history, setHistory] = useState([])
  const wheelRef = useRef(null)

  const fetchBalance = async () => {
    try {
      const res = await walletAPI.getWallet()
      setBalance(res.data.data.balance)
    } catch {}
  }

  useState(() => { fetchBalance() }, [])

  const handleSpin = async () => {
    if (spinning) return
    if (!betAmount || parseFloat(betAmount) <= 0) {
      toast.error('Enter a valid bet amount')
      return
    }
    setSpinning(true)
    setResult(null)
    try {
      const res = await gamesAPI.spin({ betAmount: parseFloat(betAmount), currency: 'USD' })
      const data = res.data.data
      const tierIndex = PRIZES.findIndex(p => p.tier === data.prize_tier)
      const safeIndex = tierIndex >= 0 ? tierIndex : 0
      const targetAngle = 360 - (safeIndex * SEGMENT_ANGLE) - (SEGMENT_ANGLE / 2)
      const totalRotation = rotation + 1440 + targetAngle
      setRotation(totalRotation)
      setTimeout(() => {
        setResult(data)
        setHistory(prev => [data, ...prev].slice(0, 5))
        fetchBalance()
        toast.success(data.message)
        setSpinning(false)
      }, 4000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not spin')
      setSpinning(false)
    }
  }

  const drawWheel = () => (
    <svg viewBox="0 0 300 300" style={{ width: '100%', height: '100%' }}>
      {PRIZES.map((prize, i) => {
        const startAngle = (i * SEGMENT_ANGLE - 90) * (Math.PI / 180)
        const endAngle = ((i + 1) * SEGMENT_ANGLE - 90) * (Math.PI / 180)
        const x1 = 150 + 140 * Math.cos(startAngle)
        const y1 = 150 + 140 * Math.sin(startAngle)
        const x2 = 150 + 140 * Math.cos(endAngle)
        const y2 = 150 + 140 * Math.sin(endAngle)
        const midAngle = ((i + 0.5) * SEGMENT_ANGLE - 90) * (Math.PI / 180)
        const textX = 150 + 95 * Math.cos(midAngle)
        const textY = 150 + 95 * Math.sin(midAngle)
        return (
          <g key={i}>
            <path
              d={`M 150 150 L ${x1} ${y1} A 140 140 0 0 1 ${x2} ${y2} Z`}
              fill={i % 2 === 0 ? prize.color + '22' : prize.color + '11'}
              stroke={prize.color}
              strokeWidth="1.5"
            />
            <text
              x={textX} y={textY}
              textAnchor="middle" dominantBaseline="middle"
              fill={prize.color} fontSize="10" fontWeight="800"
              transform={`rotate(${(i + 0.5) * SEGMENT_ANGLE}, ${textX}, ${textY})`}
            >
              {prize.label}
            </text>
          </g>
        )
      })}
      <circle cx="150" cy="150" r="30" fill="#0a0a1a" stroke="var(--gold)" strokeWidth="3" />
      <text x="150" y="150" textAnchor="middle" dominantBaseline="middle" fill="var(--gold)" fontSize="14" fontWeight="900">NP</text>
      <circle cx="150" cy="150" r="140" fill="none" stroke="var(--gold)" strokeWidth="3" />
    </svg>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', padding: '1.5rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>🎰 Spin & Win</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Win $1K, $10K, $50K or a physical prize. Land on ? and the house wins.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>
          {/* Wheel */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
              <div style={{
                position: 'absolute', top: '-16px', left: '50%',
                transform: 'translateX(-50%)', zIndex: 10,
                width: 0, height: 0,
                borderLeft: '12px solid transparent',
                borderRight: '12px solid transparent',
                borderTop: '24px solid var(--gold)',
                filter: 'drop-shadow(0 0 8px rgba(240,192,64,0.8))'
              }} />
              <motion.div
                ref={wheelRef}
                animate={{ rotate: rotation }}
                transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
                style={{ width: '100%', aspectRatio: '1', filter: 'drop-shadow(0 0 20px rgba(240,192,64,0.2))' }}
              >
                {drawWheel()}
              </motion.div>
            </div>

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    marginTop: '1.5rem', textAlign: 'center',
                    background: result.prize_tier === 'loss'
                      ? 'linear-gradient(135deg, rgba(255,68,68,0.1), rgba(255,68,68,0.05))'
                      : 'linear-gradient(135deg, rgba(240,192,64,0.1), rgba(0,212,255,0.05))',
                    border: `1px solid ${result.prize_tier === 'loss' ? 'rgba(255,68,68,0.4)' : 'rgba(240,192,64,0.4)'}`,
                    borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '400px'
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                    {result.prize_tier === 'loss' ? '💀' : '🎉'}
                  </div>
                  <h3 style={{
                    color: result.prize_tier === 'loss' ? '#ff4444' : 'var(--gold)',
                    fontWeight: 900, fontSize: '1.5rem', marginBottom: '0.25rem'
                  }}>
                    {result.prize_tier === 'loss'
                      ? 'House Wins!'
                      : result.prize_tier === 'prize'
                      ? result.prize?.name || 'Special Prize'
                      : `$${result.payout?.toLocaleString()}`}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    Consolation bonus:{' '}
                    <span style={{ color: '#00ff88', fontWeight: 700 }}>
                      +${parseFloat(result.bonus_awarded || 0).toFixed(2)}
                    </span>
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    Seed: {result.server_seed?.slice(0, 16)}...
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bet panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {balance !== null && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Balance</p>
                <p style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '1.5rem' }}>
                  ${balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}

            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Bet Amount</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '1rem' }}>
                {[5, 10, 25, 50, 100, 250].map(amt => (
                  <button key={amt} onClick={() => setBetAmount(amt.toString())} style={{
                    padding: '8px 4px', borderRadius: '8px', cursor: 'pointer',
                    background: betAmount == amt ? 'rgba(240,192,64,0.2)' : 'var(--navy)',
                    border: betAmount == amt ? '1px solid var(--gold)' : '1px solid var(--border)',
                    color: betAmount == amt ? 'var(--gold)' : 'var(--text-secondary)',
                    fontSize: '0.8rem', fontWeight: 600
                  }}>
                    ${amt}
                  </button>
                ))}
              </div>
              <input
                type="number" value={betAmount}
                onChange={e => setBetAmount(e.target.value)}
                placeholder="Custom amount"
                style={{
                  width: '100%', padding: '12px', marginBottom: '1rem',
                  background: 'var(--navy)', border: '1px solid var(--border)',
                  borderRadius: '10px', color: 'var(--text-primary)',
                  fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
                }}
              />
              <button onClick={handleSpin} disabled={spinning} style={{
                width: '100%', padding: '16px',
                background: spinning ? 'rgba(240,192,64,0.3)' : 'linear-gradient(135deg, #f0c040, #c9a227)',
                border: 'none', borderRadius: '12px', color: '#000',
                fontWeight: 900, fontSize: '1.1rem',
                cursor: spinning ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
                {spinning
                  ? <><RotateCcw size={18} /> Spinning...</>
                  : <>SPIN <ArrowRight size={18} /></>}
              </button>
            </div>

            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Prize Tiers</h3>
              {PRIZE_TIERS_DISPLAY.map(t => (
                <div key={t.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: t.color, fontWeight: 700, fontSize: '0.9rem' }}>{t.label}</span>
                  <span style={{ background: t.color + '15', color: t.color, padding: '2px 8px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {t.chance}
                  </span>
                </div>
              ))}
            </div>

            {history.length > 0 && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Recent Spins</h3>
                {history.map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>${parseFloat(h.spin?.bet_amount || 0).toFixed(0)} bet</span>
                    <span style={{ color: h.prize_tier === 'loss' ? '#ff4444' : '#00ff88', fontWeight: 700 }}>
                      {h.prize_tier === 'loss' ? 'Loss' : `+$${h.payout?.toLocaleString()}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
