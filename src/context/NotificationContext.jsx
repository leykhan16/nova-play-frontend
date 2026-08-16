import { createContext, useState, useEffect, useContext } from 'react'
import { connectSocket, joinUserRoom } from '../services/socket'
import { AuthContext } from './AuthContext'
import toast from 'react-hot-toast'

export const NotificationContext = createContext(null)

const ToastCard = ({ emoji, title, message, color }) => (
  <div style={{
    background: '#12122a', border: `1px solid ${color}`,
    borderRadius: '12px', padding: '1rem', maxWidth: '320px',
    boxShadow: `0 0 20px ${color}33`
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
      <span>{emoji}</span>
      <span style={{ color, fontWeight: 700, fontSize: '0.9rem' }}>{title}</span>
    </div>
    <p style={{ color: '#a0a0c0', fontSize: '0.82rem', margin: 0 }}>{message}</p>
  </div>
)

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)

  const add = (notif) => {
    setNotifications(prev => [{ ...notif, id: Date.now(), time: new Date().toISOString() }, ...prev].slice(0, 30))
    setUnread(prev => prev + 1)
  }

  const notify = (emoji, title, message, color, duration = 6000) => {
    add({ emoji, title, message, color })
    toast.custom(() => <ToastCard emoji={emoji} title={title} message={message} color={color} />, { duration })
  }

  useEffect(() => {
    if (!user) return

    const socket = connectSocket()

    // Join personal room for targeted notifications
    if (user.id) {
      joinUserRoom(user.id)
    }

    // ── Join admin room ──────────────────────────────────────────────────────
    if (['admin', 'super_admin'].includes(user.role)) {
      socket.emit('join_admin_room', { role: user.role })
    }

    // ── ADMIN events ─────────────────────────────────────────────────────────
    if (['admin', 'super_admin'].includes(user.role)) {

      socket.on('payment_initiated', (data) => {
        notify('💰', 'New Payment Request',
          `${data.username} wants to deposit $${data.amount} via ${data.payment_method}`,
          '#f0c040', 8000)
      })

      socket.on('payment_confirming', (data) => {
        notify('✅', 'Payment Sent!',
          `${data.user} confirmed sending $${data.amount} — verify now`,
          '#00ff88', 8000)
      })

      socket.on('gift_card_submitted', (data) => {
        notify('🎁', 'Gift Card Submitted',
          `${data.username} submitted a ${data.card_type || 'gift'} card — $${data.amount}`,
          '#c084fc', 8000)
      })

      socket.on('prize_delivery_submitted', (data) => {
        notify('🏆', 'Prize Delivery Request',
          `A player submitted a prize delivery form`,
          '#c084fc', 10000)
      })

      socket.on('ticket_updated', (data) => {
        notify('🎫', 'Support Ticket',
          `A user replied to ticket ${data.ticket_id?.slice(0, 8)}...`,
          '#00d4ff', 6000)
      })

      socket.on('new_ticket', (data) => {
        notify('🎫', 'New Support Ticket',
          `${data.username}: ${data.subject}`,
          '#f0c040', 8000)
      })

      socket.on('big_win', (data) => {
        notify('🎰', 'Big Win Alert!',
          `A player won $${Number(data.payout || 0).toLocaleString()} on ${data.prize_tier}`,
          '#c084fc', 8000)
      })
    }

    // ── USER events ───────────────────────────────────────────────────────────
    socket.on(`payment_approved_${user.id}`, (data) => {
      notify('🎉', 'Payment Approved!',
        `Your $${data.amount} deposit has been approved and wallet credited!`,
        '#00ff88', 10000)
    })

    socket.on(`payment_rejected_${user.id}`, (data) => {
      notify('❌', 'Payment Rejected',
        `Your $${data.amount} payment was rejected. ${data.notes || 'Contact support.'}`,
        '#ff4444', 10000)
    })

    socket.on(`payment_details_${user.id}`, (data) => {
      notify('📋', 'Payment Details Ready!',
        `Admin sent payment details for your $${data.amount} deposit. Check your wallet.`,
        '#00d4ff', 12000)
    })

    socket.on(`ticket_reply_${user.id}`, (data) => {
      notify('💬', 'Support Reply',
        `Admin replied to your support ticket`,
        '#00d4ff', 8000)
    })

    socket.on(`ticket_status_${user.id}`, (data) => {
      notify('🎫', 'Ticket Updated',
        `Your support ticket status changed to ${data.status}`,
        '#f0c040', 6000)
    })

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      socket.off('payment_initiated')
      socket.off('payment_confirming')
      socket.off('gift_card_submitted')
      socket.off('prize_delivery_submitted')
      socket.off('ticket_updated')
      socket.off('new_ticket')
      socket.off('big_win')
      socket.off(`payment_approved_${user.id}`)
      socket.off(`payment_rejected_${user.id}`)
      socket.off(`payment_details_${user.id}`)
      socket.off(`ticket_reply_${user.id}`)
      socket.off(`ticket_status_${user.id}`)
    }
  }, [user])

  const markAllRead = () => setUnread(0)
  const clearAll   = () => { setNotifications([]); setUnread(0) }

  return (
    <NotificationContext.Provider value={{ notifications, unread, markAllRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  )
}
