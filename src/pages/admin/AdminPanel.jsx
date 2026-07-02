export default function AdminPanel() { return <div style={{color:'white',padding:'2rem'}}>Adminimport { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { paymentsAPI } from '../../services/api'
import { AuthContext } from '../../context/AuthContext'
import { connectSocket } from '../../services/socket'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Send, RefreshCw, Bell } from 'lucide-react'

export default function AdminPanel() {
  const { user } = useContext(AuthContext)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [detailsForm, setDetailsForm] = useState({})
  const [sendingDetails, setSendingDetails] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const [notifications, setNotifications] = useState([])
  const [activeTab, setActiveTab] = useState('payments')

  useEffect(() => {
    fetchPayments()

    // Connect socket and join admin room
    const socket = connectSocket()
    socket.emit('join_admin_room', { role: user.role })

    // Listen for new payment initiations
    socket.on('payment_initiated', (data) => {
      toast.custom((t) => (
        <div style={{
          background: '#12122a', border: '1px solid #f0c040',
          borderRadius: '12px', padding: '1rem', maxWidth: '320px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Bell size={16} color="#f0c040" />
            <span style={{ color: '#f0c040', fontWeight: 700, fontSize: '0.9rem' }}>New Payment Request</span>
          </div>
          <p style={{ color: '#a0a0c0', fontSize: '0.85rem' }}>
            {data.username} wants to deposit ${data.amount} via {data.payment_method}
          </p>
        </div>
      ), { duration: 6000 })

      setNotifications(prev => [data, ...prev].slice(0, 10))
      fetchPayments()
    })

    // Listen for payment confirmations
    socket.on('payment_confirming', (data) => {
      toast.custom((t) => (
        <div style={{
          background: '#12122a', border: '1px solid #00ff88',
          borderRadius: '12px', padding: '1rem', maxWidth: '320px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <CheckCircle size={16} color="#00ff88" />
            <span style={{ color: '#00ff88', fontWeight: 700, fontSize: '0.9rem' }}>Payment Sent!</span>
          </div>
          <p style={{ color: '#a0a0c0', fontSize: '0.85rem' }}>
            {data.user} says they've sent ${data.amount} via {data.payment_method}
          </p>
        </div>
      ), { duration: 6000 })

      fetchPayments()
    })

    return () => {
      socket.off('payment_initiated')
      socket.off('payment_confirming')
    }
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await paymentsAPI.getPending()
      setPayments(res.data.data)
    } catch (err) {
      toast.error('Could not load payments')
    } finally {
      setLoading(false)
    }
  }

  const handleSendDetails = async (paymentId) => {
    if (!detailsForm[paymentId] || Object.keys(detailsForm[paymentId]).length === 0) {
      toast.error('Enter payment details first')
      return
    }
    setSendingDetails(true)
    try {
      await paymentsAPI.sendDetails(paymentId, { details: detailsForm[paymentId] })
      toast.success('Payment details sent to user')
      setSelectedPayment(null)
      setDetailsForm({})
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send details')
    } finally {
      setSendingDetails(false)
    }
  }

  const handleApprove = async (paymentId) => {
    try {
      await paymentsAPI.approve(paymentId)
      toast.success('Payment approved — wallet credited!')
      fetchPayments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not approve')
    }
  }

  const handleReject = async (paymentId) => {
    try {
      await paymentsAPI.reject(paymentId, { notes: rejectNote || 'Payment rejected by admin' })
      toast.success('Payment rejected')
      setRejectNote('')
      fetchPayments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not reject')
    }
  }

  const methodIcon = (method) => {
    const icons = { bank_transfer: '🏦', crypto: '₿', zelle: '💸', card: '💳', apple_pay: '🍎' }
    return icons[method] || '💰'
  }

  const statusColor = (status) => {
    const colors = { pending: '#f0c040', confirming: '#00d4ff', completed: '#00ff88', failed: '#ff4444' }
    return colors[status] || '#a0a0c0'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', padding: '1.5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>
                🛡️ Admin Panel
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Logged in as <span style={{ color: 'var(--gold)' }}>{user?.username}</span> · {user?.role}
              </p>
            </div>
            <button onClick={fetchPayments} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '10px', cursor: 'pointer',
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center'
            }}>
              <RefreshCw size={16} />
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Pending Payments', value: payments.filter(p => p.status === 'pending').length, color: '#f0c040' },
            { label: 'Awaiting Confirm', value: payments.filter(p => p.status === 'confirming').length, color: '#00d4ff' },
            { label: 'Total Requests', value: payments.length, color: '#00ff88' },
            { label: 'Notifications', value: notifications.length, color: '#c084fc' },
          ].map(s => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: '14px', padding: '1.2rem', textAlign: 'center'
              }}
            >
              <p style={{ color: s.color, fontWeight: 900, fontSize: '2rem' }}>{s.value}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Payments list */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            Payment Requests
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : payments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              No pending payments
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {payments.map(payment => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    background: 'var(--navy)', border: '1px solid var(--border)',
                    borderRadius: '14px', padding: '1.5rem'
                  }}
                >
                  {/* Payment header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '1.2rem' }}>{methodIcon(payment.payment_method)}</span>
                        <span style={{ fontWeight: 700 }}>{payment.username}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{payment.email}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        Ref: <span style={{ color: 'var(--gold)', fontFamily: 'monospace' }}>{payment.payment_reference}</span>
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 900, fontSize: '1.3rem', color: 'var(--text-primary)' }}>
                        ${parseFloat(payment.amount).toLocaleString()}
                      </p>
                      <span style={{
                        background: statusColor(payment.status) + '15',
                        color: statusColor(payment.status),
                        padding: '3px 10px', borderRadius: '50px',
                        fontSize: '0.75rem', fontWeight: 700
                      }}>
                        {payment.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Send details form — for pending payments */}
                  {payment.status === 'pending' && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                      {selectedPayment === payment.id ? (
                        <div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                            Send {payment.payment_method.replace('_', ' ')} details to user:
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
                            {payment.payment_method === 'bank_transfer' && (
                              <>
                                {['account_name', 'account_number', 'bank', 'routing_number'].map(field => (
                                  <input
                                    key={field}
                                    placeholder={field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    onChange={e => setDetailsForm(prev => ({
                                      ...prev,
                                      [payment.id]: { ...prev[payment.id], [field]: e.target.value }
                                    }))}
                                    style={{
                                      padding: '10px 14px', background: 'var(--card)',
                                      border: '1px solid var(--border)', borderRadius: '8px',
                                      color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
                                    }}
                                  />
                                ))}
                              </>
                            )}
                            {payment.payment_method === 'crypto' && (
                              <>
                                {['btc_address', 'eth_address', 'network'].map(field => (
                                  <input
                                    key={field}
                                    placeholder={field.replace(/_/g, ' ').toUpperCase()}
                                    onChange={e => setDetailsForm(prev => ({
                                      ...prev,
                                      [payment.id]: { ...prev[payment.id], [field]: e.target.value }
                                    }))}
                                    style={{
                                      padding: '10px 14px', background: 'var(--card)',
                                      border: '1px solid var(--border)', borderRadius: '8px',
                                      color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
                                    }}
                                  />
                                ))}
                              </>
                            )}
                            {payment.payment_method === 'zelle' && (
                              <>
                                {['zelle_email', 'zelle_phone', 'recipient_name'].map(field => (
                                  <input
                                    key={field}
                                    placeholder={field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    onChange={e => setDetailsForm(prev => ({
                                      ...prev,
                                      [payment.id]: { ...prev[payment.id], [field]: e.target.value }
                                    }))}
                                    style={{
                                      padding: '10px 14px', background: 'var(--card)',
                                      border: '1px solid var(--border)', borderRadius: '8px',
                                      color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
                                    }}
                                  />
                                ))}
                              </>
                            )}
                            {['card', 'apple_pay'].includes(payment.payment_method) && (
                              <input
                                placeholder="Paystack payment link or instructions"
                                onChange={e => setDetailsForm(prev => ({
                                  ...prev,
                                  [payment.id]: { ...prev[payment.id], instructions: e.target.value }
                                }))}
                                style={{
                                  padding: '10px 14px', background: 'var(--card)',
                                  border: '1px solid var(--border)', borderRadius: '8px',
                                  color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
                                }}
                              />
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleSendDetails(payment.id)}
                              disabled={sendingDetails}
                              style={{
                                background: 'linear-gradient(135deg, #f0c040, #c9a227)',
                                border: 'none', borderRadius: '8px', padding: '10px 16px',
                                color: '#000', fontWeight: 700, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem'
                              }}
                            >
                              <Send size={14} /> {sendingDetails ? 'Sending...' : 'Send Details'}
                            </button>
                            <button
                              onClick={() => setSelectedPayment(null)}
                              style={{
                                background: 'none', border: '1px solid var(--border)',
                                borderRadius: '8px', padding: '10px 16px',
                                color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedPayment(payment.id)}
                          style={{
                            background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.3)',
                            borderRadius: '8px', padding: '10px 16px',
                            color: 'var(--gold)', cursor: 'pointer', fontWeight: 600,
                            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem'
                          }}
                        >
                          <Send size={14} /> Send Payment Details
                        </button>
                      )}
                    </div>
                  )}

                  {/* Approve/Reject — for confirming payments */}
                  {payment.status === 'confirming' && (
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                      <p style={{ color: '#00d4ff', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
                        ✅ User says they've sent the payment. Verify and approve or reject.
                      </p>
                      <input
                        placeholder="Rejection note (optional)"
                        value={rejectNote}
                        onChange={e => setRejectNote(e.target.value)}
                        style={{
                          width: '100%', padding: '10px 14px', marginBottom: '0.75rem',
                          background: 'var(--card)', border: '1px solid var(--border)',
                          borderRadius: '8px', color: 'var(--text-primary)',
                          fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleApprove(payment.id)}
                          style={{
                            background: 'linear-gradient(135deg, #00ff88, #00cc66)',
                            border: 'none', borderRadius: '8px', padding: '10px 20px',
                            color: '#000', fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem',
                            flex: 1, justifyContent: 'center'
                          }}
                        >
                          <CheckCircle size={16} /> Approve & Credit Wallet
                        </button>
                        <button
                          onClick={() => handleReject(payment.id)}
                          style={{
                            background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)',
                            borderRadius: '8px', padding: '10px 20px',
                            color: '#ff4444', cursor: 'pointer', fontWeight: 700,
                            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem'
                          }}
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}Panel</div> }
