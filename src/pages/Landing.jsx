import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthContext } from '../context/AuthContext'
import { ThemeContext } from '../context/ThemeContext'
import { Sun, Moon, Zap, Shield, Trophy, ArrowRight } from 'lucide-react'

const games = [
  { name: 'Crash', description: 'Watch the multiplier climb. Cash out before it crashes.', emoji: '🚀', color: '#00ff88', path: '/games/crash', badge: 'LIVE' },
  { name: 'Spin & Win', description: 'Spin for $1K, $10K, $50K or a physical prize.', emoji: '🎰', color: '#f0c040', path: '/games/spin', badge: 'HOT' },
  { name: 'Blackjack', description: 'Beat the dealer. Get to 21 without going over.', emoji: '🃏', color: '#00d4ff', path: '/games/blackjack', badge: 'NEW' },
  { name: 'Plinko', description: 'Drop the ball. Watch it bounce to your prize.', emoji: '🎯', color: '#ff6b6b', path: '/games/plinko', badge: 'NEW' },
  { name: 'Roulette', description: 'American roulette. Pick your number, place your bet.', emoji: '🎡', color: '#c084fc', path: '/games/roulette', badge: 'SOON' },
  { name: 'Video Poker', description: 'Five card draw. Skill meets slots.', emoji: '♠️', color: '#fb923c', path: '/games/poker', badge: 'SOON' },
]

const stats = [
  { label: 'Players Online', value: '12,847', icon: '🟢' },
  { label: 'Total Paid Out', value: '$4.2M', icon: '💰' },
  { label: 'Games Available', value: '6+', icon: '🎮' },
  { label: 'Biggest Win', value: '$50,000', icon: '🏆' },
]

export default function Landing() {
  const { user } = useContext(AuthContext)
  const { theme, toggleTheme } = useContext(ThemeContext)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', overflowX: 'hidden' }}>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,10,26,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', height: '70px'
      }}>
        <span style={{ color: 'var(--gold)', fontWeight: 900, fontSize: '1.5rem', letterSpacing: '3px' }}>NOVA PLAY</span>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={toggleTheme} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {user ? (
            <Link to="/lobby" style={{ background: 'var(--gold)', color: '#000', padding: '8px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>Play Now</Link>
          ) : (
            <>
              <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem' }}>Login</Link>
              <Link to="/register" style={{ background: 'var(--gold)', color: '#000', padding: '8px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem' }}>Get Started</Link>
            </>
          )}
        </div>
      </nav>

      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(240,192,64,0.08) 0%, transparent 70%)', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} style={{ display: 'inline-block', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.3)', borderRadius: '50px', padding: '6px 16px', marginBottom: '1.5rem', color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '2px' }}>
            🎰 PROVABLY FAIR GAMING
          </motion.div>
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: '1.5rem', background: 'linear-gradient(135deg, #ffffff 0%, #f0c040 50%, #ffffff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            WIN BIG.<br />PLAY FAIR.
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.7, maxWidth: '500px', margin: '0 auto 2.5rem' }}>
            Crash games, Spin & Win, Blackjack, Plinko — with prizes up to $50,000 and physical rewards like cars and houses.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ background: 'linear-gradient(135deg, #f0c040, #c9a227)', color: '#000', padding: '16px 36px', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 30px rgba(240,192,64,0.3)' }}>
              Start Playing <ArrowRight size={20} />
            </Link>
            <Link to="/login" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', padding: '16px 36px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '1.1rem', border: '1px solid var(--border)' }}>
              Login
            </Link>
          </div>
        </motion.div>
      </section>

      <section style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', textAlign: 'center' }}>
          {stats.map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '1.4rem' }}>{s.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ padding: '5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Choose Your Game</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Every game is provably fair. Every outcome is verifiable.</p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {games.map((game, i) => (
            <motion.div key={game.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} whileHover={{ y: -5, scale: 1.02 }}>
              <Link to={game.badge === 'SOON' ? '#' : (user ? game.path : '/register')} style={{ textDecoration: 'none' }}>
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', cursor: 'pointer', position: 'relative', overflow: 'hidden', borderColor: game.badge === 'SOON' ? 'var(--border)' : game.color + '40' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: game.badge === 'SOON' ? 'var(--border)' : game.color, opacity: 0.8 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '2.5rem' }}>{game.emoji}</span>
                    <span style={{ background: game.badge === 'SOON' ? 'rgba(255,255,255,0.1)' : game.badge === 'LIVE' ? 'rgba(0,255,136,0.2)' : game.badge === 'HOT' ? 'rgba(240,192,64,0.2)' : 'rgba(0,212,255,0.2)', color: game.badge === 'SOON' ? 'var(--text-secondary)' : game.badge === 'LIVE' ? '#00ff88' : game.badge === 'HOT' ? 'var(--gold)' : 'var(--neon-blue)', padding: '4px 10px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '1px' }}>
                      {game.badge}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{game.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>{game.description}</p>
                  {game.badge !== 'SOON' && (
                    <div style={{ marginTop: '1.5rem', color: game.color, fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Play Now <ArrowRight size={14} />
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={{ padding: '5rem 2rem', background: 'var(--card)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '3rem' }}>Why Nova Play?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {[
              { icon: <Shield size={32} />, color: '#00ff88', title: 'Provably Fair', desc: 'Every game outcome is cryptographically verifiable. We cannot cheat.' },
              { icon: <Zap size={32} />, color: '#f0c040', title: 'Instant Payouts', desc: 'Win and your wallet is credited immediately. No delays, no waiting.' },
              { icon: <Trophy size={32} />, color: '#00d4ff', title: 'Real Prizes', desc: 'Win cash, cars, houses, and gadgets. Not just credits — real value.' },
            ].map((f) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ background: 'var(--navy)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem' }}>
                <div style={{ color: f.color, marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '5rem 2rem', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} style={{ maxWidth: '600px', margin: '0 auto', background: 'linear-gradient(135deg, rgba(240,192,64,0.1), rgba(0,212,255,0.05))', border: '1px solid rgba(240,192,64,0.3)', borderRadius: '24px', padding: '4rem 2rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>Ready to Win?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Join thousands of players. Your first spin could win you $50,000.</p>
          <Link to="/register" style={{ background: 'linear-gradient(135deg, #f0c040, #c9a227)', color: '#000', padding: '16px 40px', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Create Free Account <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--gold)', fontWeight: 800 }}>NOVA PLAY</span> © 2026 · Play Responsibly · 18+
      </footer>
    </div>
  )
}
