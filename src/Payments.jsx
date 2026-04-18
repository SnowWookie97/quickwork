import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import DashNav from './DashNav'
import './Payments.css'

const TABS = ['Payment History', 'Payment Status']

function Payments() {
  const navigate = useNavigate()
  const [userRole, setUserRole] = useState(null)
  const [activeTab, setActiveTab] = useState('Payment History')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUserRole(user.user_metadata?.role)
    }
    getUser()
  }, [])

  const getNextFriday = () => {
    const now = new Date()
    const day = now.getDay()
    const daysUntilFriday = (5 - day + 7) % 7 || 7
    const nextFriday = new Date(now)
    nextFriday.setDate(now.getDate() + daysUntilFriday)
    nextFriday.setHours(14, 0, 0, 0)
    if (day === 5 && now.getHours() < 14) {
      nextFriday.setDate(now.getDate())
    }
    return nextFriday.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const pendingAmount = 0.00
  const immediateAmount = (pendingAmount - (pendingAmount * 0.0575)).toFixed(2)
  const fee = (pendingAmount * 0.0575).toFixed(2)

  return (
    <div className="pay-page">
      <DashNav userRole={userRole} />

      <div className="pay-body">

        {/* LEFT — MAIN */}
        <div className="pay-left">

          {/* SUMMARY CARD */}
          <div className="pay-summary-card">
            <div className="pay-summary-left">
              <p className="pay-summary-label">Payment Pending</p>
              <h2 className="pay-amount">₹{pendingAmount.toFixed(2)}</h2>
              <p className="pay-date-label">Next Payment Date</p>
              <p className="pay-date">{getNextFriday()} at 2:00 PM</p>
            </div>
            <div className="pay-summary-right">
              <button className="pay-immediate-btn" disabled={pendingAmount === 0}>
                Request Immediate Payment
              </button>
              {pendingAmount > 0 && (
                <p className="pay-immediate-note">
                  You'll receive ₹{immediateAmount} after a ₹{fee} fee (5.75%)
                </p>
              )}
              {pendingAmount === 0 && (
                <p className="pay-immediate-note">No pending amount to withdraw</p>
              )}
            </div>
          </div>

          {/* NOTICE */}
          <div className="pay-notice">
            <div className="pay-notice-row">
              <span className="pay-notice-icon">📅</span>
              <div>
                <strong>Weekly Payouts</strong>
                <p>Payments are processed every Friday at 2:00 PM to your registered UPI ID or bank account. Shifts completed after 2:00 PM on Friday will be paid out the following Friday.</p>
              </div>
            </div>
            <div className="pay-notice-divider" />
            <div className="pay-notice-row">
              <span className="pay-notice-icon">⚡</span>
              <div>
                <strong>Immediate Payment</strong>
                <p>Need your money sooner? Request an immediate payout anytime. A 5.75% processing fee applies! </p>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="pay-card">
            <div className="pay-tabs">
              {TABS.map(tab => (
                <button
                  key={tab}
                  className={`pay-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="pay-tab-divider" />
            <div className="pay-tab-content">
              {activeTab === 'Payment History' && (
                <div className="pay-empty">
                  <div className="pay-empty-icon">🧾</div>
                  <h3 className="pay-empty-title">No payment history yet</h3>
                  <p className="pay-empty-sub">Your completed payments will appear here once you've worked and been paid for your first shift.</p>
                </div>
              )}
              {activeTab === 'Payment Status' && (
                <div className="pay-empty">
                  <div className="pay-empty-icon">📊</div>
                  <h3 className="pay-empty-title">No payment status to show</h3>
                  <p className="pay-empty-sub">Active and pending payment statuses will appear here once payments are being processed.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT — UPI/BANK DETAILS */}
        <div className="pay-right">
          <div className="pay-details-card">
            <div className="pay-details-header">
              <span className="pay-details-icon">🏦</span>
              <h3 className="pay-details-title">Payment Details</h3>
            </div>
            <p className="pay-details-sub">Your registered payment method</p>
            <div className="pay-details-empty">
              <p>No payment details added yet.</p>
              <button className="pay-details-btn">+ Add UPI / Bank Account</button>
            </div>
            <div className="pay-details-divider" />
            <p className="pay-details-note">
              💡 Payments will be sent to this account every Friday at 2:00 PM. Make sure your details are correct before your first shift.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Payments
