import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gamesAPI, walletAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { ArrowRight, RotateCcw, Gift } from 'lucide-react'
import PrizeShuffle from '../../components/ui/PrizeShuffle'

// 16 segments: 8 loss, 2 prize, 3×$1K, 2×$10K, 1×$50K
const SEGMENTS = [
  { label: '?',       color: '#cc2222', tier: 'loss'  },
  { label: '$1,000',  color: '#00ff88', tier: '1000'  },
  { label: '?',       color: '#cc2222', tier: 'loss'  },
  { label: '🎁',      color: '#c084fc', tier: 'prize' },
  { label: '?',       color: '#cc2222', tier: 'loss'  },
  { label: '$10,000', color: '#00d4ff', tier: '10000' },
  { label: '?',       color: '#cc2222', tier: 'loss'  },
  { label: '$50,000', color: '#f0c040', tier: '50000' },
  { label: '?',       color: '#cc2222', tier: 'loss'  },
  { label: '$1,000',  color: '#00ff88', tier: '1000'  },
  { label: '?',       color: '#cc2222', tier: 'loss'  },
  { label: '🎁',      color: '#c084fc', tier: 'prize' },
  { label: '?',       color: '#cc2222', tier: 'loss'  },
  { label: '$10,000', color: '#00d4ff', tier: '10000' },
  { label: '?',       color: '#cc2222', tier: 'loss'  },
  { label: '$1,000',  color: '#00ff88', tier: '1000'  },
]

const N       = SEGMENTS.length
const SEG_DEG = 360 / N

const PRIZE_ODDS = [
  { label: '? Loss',            color: '#ff4444', chance: '60%' },
  { label: '🎁 Physical Prize', color: '#c084fc', chance: '10%' },
  { label: '$1,000',            color: '#00ff88', chance: '10%' },
  { label: '$10,000',           color: '#00d4ff', chance: '7%'  },
  { label: '$50,000',           color: '#f0c040', chance: '6%'  },
]

const PREVIEW_PRIZES = [
  { name: 'Lamborghini Urus',    value: '$250,000',   image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=600&q=80', category: 'Luxury Car' },
  { name: 'Manhattan Penthouse', value: '$2,000,000', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80', category: 'Real Estate' },
  { name: 'Maldives 7 Nights',  value: '$25,000',    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80', category: 'Vacation' },
  { name: 'Rolex Submariner',   value: '$40,000',    image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80', category: 'Luxury Watch' },
  { name: 'Paris Luxury Trip',  value: '$15,000',    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80', category: 'Vacation' },
  { name: 'Patek Philippe',     value: '$80,000',    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80', category: 'Luxury Watch' },
]

// ── Canvas wheel renderer ──────────────────────────────────────────────────
const renderWheel = (canvas) => {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const cx  = canvas.width / 2
  const cy  = canvas.height / 2
  const R   = cx - 5
  const rad = (d) => (d * Math.PI) / 180

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  SEGMENTS.forEach((seg, i) => {
    const s   = rad(i * SEG_DEG - 90)
    const e   = rad((i + 1) * SEG_DEG - 90)
    const mid = rad(i * SEG_DEG + SEG_DEG / 2 - 90)
    const isL = seg.tier === 'loss'

    // Fill
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, R, s, e)
    ctx.closePath()
    ctx.fillStyle   = isL ? (i % 2 === 0 ? '#1c0404' : '#220606') : seg.color + '1c'
    ctx.fill()
    ctx.strokeStyle = seg.color
    ctx.lineWidth   = isL ? 0.8 : 2.2
    ctx.stroke()

    // Label
    const lr = R * 0.67
    const lx = cx + lr * Math.cos(mid)
    const ly = cy + lr * Math.sin(mid)

    ctx.save()
    ctx.translate(lx, ly)
    ctx.rotate(mid + Math.PI / 2)
    ctx.fillStyle    = seg.color
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'

    if (isL) {
      ctx.font = 'bold 22px sans-serif'
      ctx.fillText('?', 0, 0)
    } else if (seg.label === '🎁') {
      ctx.font = '18px sans-serif'
      ctx.fillText('🎁', 0, 0)
    } else {
      // Split dollar amounts across 2 lines
      const parts = seg.label.replace('$', '').split(',')
      ctx.font = 'bold 8.5px sans-serif'
      if (parts.length > 1) {
        ctx.fillText('$' + parts[0], 0, -5.5)
        ctx.fillText(parts[1].trim(), 0, 5.5)
      } else {
        ctx.fillText(seg.label, 0, 0)
      }
    }
    ctx.restore()
  })

  // Outer ring
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.strokeStyle = '#f0c040'
  ctx.lineWidth   = 5
  ctx.stroke()

  // Center
  ctx.beginPath()
  ctx.arc(cx, cy, 34, 0, Math.PI * 2)
  ctx.fillStyle   = '#0a0a1a'
  ctx.fill()
  ctx.strokeStyle = '#f0c040'
  ctx.lineWidth   = 3
  ctx.stroke()
  ctx.fillStyle    = '#f0c040'
  ctx.font         = 'bold 15px sans-serif'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('NP', cx, cy)
}

// ── Main component ────────────────────────────────────────────────────────
export default function SpinWin() {
  const [betAmount,    setBetAmount]    = useState('100')
  const [spinning,     setSpinning]     = useState(false)
  const [totalRot,     setTotalRot]     = useState(0)
  const [result,       setResult]       = useState(null)
  const [balance,      setBalance]      = useState(null)
  const [history,      setHistory]      = useState([])
  const [showShuffle,  setShowShuffle]  = useState(false)
  const [wonPrize,     setWonPrize]     = useState(null)
  const canvasRef = useRef(null)
  const rotRef    = useRef(0)

  useEffect(() => {
    renderWheel(canvasRef.current)
    walletAPI.getWallet().then(r => setBalance(r.data.data.balance)).catch(() => {})
  }, [])

  const pickSegment = useCallback((tier) => {
    const matches = SEGMENTS.map((s, i) => ({ ...s, i })).filter(s => s.tier === tier)
    if (matches.length === 0) {
      const losses = SEGMENTS.map((s, i) => ({ ...s, i })).filter(s => s.tier === 'loss')
      return losses[Math.floor(Math.random() * losses.length)].i
    }
    return matches[Math.floor(Math.random() * matches.length)].i
  }, [])

  const handleSpin = async () => {
    if (spinning) return
    const bet = parseFloat(betAmount)
    if (isNaN(bet) || bet <= 0) { toast.error('Enter a valid amount'); return }
    if (bet < 100)              { toast.error('Minimum bet is $100');  return }
    if (bet > (balance || 0))  { toast.error('Insufficient balance'); return }

    setSpinning(true)
    setResult(null)
    setWonPrize(null)

    try {
      const res  = await gamesAPI.spin({ betAmount: bet, currency: 'USD' })
      const data = res.data.data

      const segIdx    = pickSegment(data.prize_tier)
      const segCenter = segIdx * SEG_DEG + SEG_DEG / 2
      const nudge     = (Math.random() - 0.5) * (SEG_DEG * 0.42)
      const baseRot   = (360 - segCenter + nudge + 360) % 360
      const delta     = 360 * 7 + baseRot

      rotRef.current += delta
      setTotalRot(rotRef.current)

      setTimeout(() => {
        setResult(data)
        setHistory(prev => [data, ...prev].slice(0, 6))
        walletAPI.getWallet().then(r => setBalance(r.data.data.balance)).catch(() => {})
        setSpinning(false)

        if (data.prize_tier === 'prize') {
          setTimeout(() => setShowShuffle(true), 500)
        } else if (data.prize_tier === 'loss') {
          toast.error('💀 House wins!')
        } else {
          toast.success(`🎉 ${data.message}`)
        }
      }, 6300)

    } catch (err) {
      toast.error(err?.response?.data?.message || 'Connection error')
      setSpinning(false)
    }
  }

  const handleShuffleClose = (prize) => {
    setWonPrize(prize)
    setShowShuffle(false)
    toast.success(`🎁 You won: ${prize.name}!`)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', padding: '1.5rem' }}>
      <div style={{ maxWidth: '1060px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>🎰 Spin & Win</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Min $100 · Physical prizes at 10% · 60% house edge · Provably fair
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>

          {/* Wheel */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '450px' }}>

              {/* Pointer */}
              <div style={{
                position: 'absolute', top: '-22px', left: '50%',
                transform: 'translateX(-50%)', zIndex: 20,
                width: 0, height: 0,
                borderLeft: '16px solid transparent',
                borderRight: '16px solid transparent',
                borderTop: '32px solid #f0c040',
                filter: 'drop-shadow(0 0 16px #f0c040)'
              }} />

              <motion.div
                animate={{ rotate: totalRot }}
                transition={{ duration: 6, ease: [0.08, 0.82, 0.05, 1.0] }}
                style={{ width: '100%', aspectRatio: '1' }}
              >
                <canvas
                  ref={canvasRef}
                  width={450} height={450}
                  style={{ width: '100%', height: '100%', display: 'block' }}
                />
              </motion.div>
            </div>

            {/* Spinning label */}
            {spinning && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 0.9 }}
                style={{ marginTop: '1rem', color: '#f0c040', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <RotateCcw size={16} style={{ animation: 'spin 0.5s linear infinite' }} />
                Spinning...
              </motion.div>
            )}

            {/* Result card */}
            <AnimatePresence>
              {result && !showShuffle && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0,  scale: 1 }}
                  exit   ={{ opacity: 0, scale: 0.95 }}
                  style={{
                    marginTop: '1.5rem', width: '100%', maxWidth: '450px',
                    textAlign: 'center',
                    background: result.prize_tier === 'loss'
                      ? 'rgba(255,40,40,0.08)'
                      : 'rgba(240,192,64,0.08)',
                    border: `2px solid ${result.prize_tier === 'loss' ? 'rgba(255,68,68,0.45)' : 'rgba(240,192,64,0.5)'}`,
                    borderRadius: '18px', padding: '1.5rem'
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '6px' }}>
                    {result.prize_tier === 'loss' ? '💀' : result.prize_tier === 'prize' ? '🎁' : '🎉'}
                  </div>

                  <h3 style={{
                    fontWeight: 900, fontSize: '1.7rem', marginBottom: '4px',
                    color: result.prize_tier === 'loss' ? '#ff4444' : '#f0c040'
                  }}>
                    {result.prize_tier === 'loss'
                      ? 'House Wins!'
                      : result.prize_tier === 'prize'
                        ? wonPrize ? wonPrize.name : '🎁 Prize Incoming...'
                        : `$${Number(result.payout).toLocaleString()}`}
                  </h3>

                  {wonPrize && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '1rem' }}>
                      <img
                        src={wonPrize.image_url || wonPrize.image}
                        alt={wonPrize.name}
                        style={{ width: '100%', borderRadius: '10px', maxHeight: '160px', objectFit: 'cover' }}
                        onError={e => e.target.style.display = 'none'}
                      />
                      <p style={{ color: '#00ff88', fontWeight: 700, marginTop: '6px' }}>
                        ${Number(wonPrize.estimated_value || 0).toLocaleString()}
                      </p>
                    </motion.div>
                  )}

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '10px' }}>
                    {result.prize_tier === 'loss' ? 'Consolation' : 'Winner'} bonus:{' '}
                    <span style={{ color: '#00ff88', fontWeight: 700 }}>
                      +${parseFloat(result.bonus_awarded || 0).toFixed(2)}
                    </span>
                    {'  ·  '}
                    <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', opacity: 0.6 }}>
                      {result.server_seed?.slice(0, 14)}...
                    </span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Balance */}
            {balance !== null && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Balance</p>
                <p style={{ color: '#f0c040', fontWeight: 900, fontSize: '1.6rem' }}>
                  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}

            {/* Bet form */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '4px' }}>Bet Amount</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '1rem' }}>
                Min: <span style={{ color: '#f0c040', fontWeight: 700 }}>$100</span>
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', marginBottom: '1rem' }}>
                {[100, 250, 500, 1000, 2500, 5000].map(a => (
                  <button key={a} onClick={() => setBetAmount(String(a))} style={{
                    padding: '8px 4px', borderRadius: '8px', cursor: 'pointer',
                    background: Number(betAmount) === a ? 'rgba(240,192,64,0.2)' : 'var(--navy)',
                    border:     Number(betAmount) === a ? '1px solid #f0c040'    : '1px solid var(--border)',
                    color:      Number(betAmount) === a ? '#f0c040'               : 'var(--text-secondary)',
                    fontSize: '0.78rem', fontWeight: 600
                  }}>
                    ${a >= 1000 ? `${a / 1000}K` : a}
                  </button>
                ))}
              </div>

              <input
                type="number" value={betAmount} min="100"
                onChange={e => setBetAmount(e.target.value)}
                placeholder="Min $100"
                style={{
                  width: '100%', padding: '12px', marginBottom: '1rem',
                  background: 'var(--navy)', border: '1px solid var(--border)',
                  borderRadius: '10px', color: 'var(--text-primary)',
                  fontSize: '1rem', outline: 'none', boxSizing: 'border-box'
                }}
              />

              <button onClick={handleSpin} disabled={spinning} style={{
                width: '100%', padding: '16px',
                background: spinning ? 'rgba(240,192,64,0.3)' : 'linear-gradient(135deg,#f0c040,#c9a227)',
                border: 'none', borderRadius: '12px', color: '#000',
                fontWeight: 900, fontSize: '1.1rem',
                cursor: spinning ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: spinning ? 'none' : '0 0 20px rgba(240,192,64,0.35)'
              }}>
                {spinning
                  ? <><RotateCcw size={18} style={{ animation: 'spin 0.6s linear infinite' }} /> Spinning...</>
                  : <>SPIN <ArrowRight size={18} /></>}
              </button>
            </div>

            {/* Odds */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Win Odds</h3>
              {PRIZE_ODDS.map(t => (
                <div key={t.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: t.color, fontWeight: 700, fontSize: '0.88rem' }}>{t.label}</span>
                  <span style={{ background: t.color + '18', color: t.color, padding: '2px 8px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 700 }}>
                    {t.chance}
                  </span>
                </div>
              ))}
            </div>

            {/* Prize pool preview */}
            <div style={{ background: 'var(--card)', border: '1px solid rgba(192,132,252,0.3)', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.9rem', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Gift size={14} /> Prize Pool Preview
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {PREVIEW_PRIZES.map((p, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.04 }}
                    style={{ borderRadius: '8px', overflow: 'hidden', position: 'relative', height: '68px', cursor: 'default' }}>
                    <img
                      src={p.image} alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.target.style.background = '#1a1a2e'; e.target.style.display = 'none' }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent,rgba(0,0,0,0.9))', padding: '3px 6px' }}>
                      <p style={{ color: '#fff', fontSize: '0.58rem', fontWeight: 700, lineHeight: 1.2 }}>{p.name}</p>
                      <p style={{ color: '#00ff88', fontSize: '0.56rem' }}>{p.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '8px', textAlign: 'center' }}>
                20 prizes total · Cars · Mansions · Vacations · Watches
              </p>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.2rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Recent Spins</h3>
                {history.map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      ${parseFloat(h.spin?.bet_amount || 0).toFixed(0)} bet
                    </span>
                    <span style={{ color: h.prize_tier === 'loss' ? '#ff4444' : '#00ff88', fontWeight: 700 }}>
                      {h.prize_tier === 'loss'  ? '💀 Loss'
                      : h.prize_tier === 'prize' ? '🎁 Prize'
                      : `+$${Number(h.payout).toLocaleString()}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showShuffle && <PrizeShuffle onClose={handleShuffleClose} />}
    </div>
  )
}