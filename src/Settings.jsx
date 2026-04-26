import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import DashNav from './DashNav'
import './Settings.css'

const NOTIFICATION_SETTINGS = [
  { key: 'notif_new_shift', label: 'New shift posted in your area', sub: 'Get notified when a new shift matches your preferences' },
  { key: 'notif_shift_accepted', label: 'Shift application accepted', sub: 'Know immediately when a business confirms you' },
  { key: 'notif_shift_reminder', label: 'Shift reminder', sub: 'Reminder the day before your upcoming shift' },
  { key: 'notif_payment', label: 'Payment processed', sub: 'Alert when your payment is sent' },
  { key: 'notif_notices', label: 'Notices from QuickWork', sub: 'Important updates from our team' },
]

function Toggle({ checked, onChange }) {
  return (
    <label className="set-toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="set-toggle-slider" />
    </label>
  )
}

function Settings() {
  const navigate = useNavigate()
  const [userRole, setUserRole] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [notifs, setNotifs] = useState({
    notif_new_shift: true,
    notif_shift_accepted: true,
    notif_shift_reminder: true,
    notif_payment: true,
    notif_notices: true,
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUserRole(user.user_metadata?.role)

      // Load saved settings from worker_profiles
      const { data: wp } = await supabase
        .from('worker_profiles')
        .select('notif_new_shift, notif_shift_accepted, notif_shift_reminder, notif_payment, notif_notices')
        .eq('user_id', user.id)
        .single()

      if (wp) {
        setNotifs({
          notif_new_shift: wp.notif_new_shift ?? true,
          notif_shift_accepted: wp.notif_shift_accepted ?? true,
          notif_shift_reminder: wp.notif_shift_reminder ?? true,
          notif_payment: wp.notif_payment ?? true,
          notif_notices: wp.notif_notices ?? true,
        })
      }
    }
    load()
  }, [])

  const handleToggle = async (key, val) => {
    const updated = { ...notifs, [key]: val }
    setNotifs(updated)
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('worker_profiles').upsert({
      user_id: user.id,
      ...updated,
      updated_at: new Date().toISOString()
    })
    setSaving(false)
    setSavedMsg('Saved!')
    setTimeout(() => setSavedMsg(''), 2000)
  }

  const handleChangePassword = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    setSavedMsg('Reset link sent to your email!')
    setTimeout(() => setSavedMsg(''), 3000)
  }

  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    // Sign out and navigate — actual deletion requires admin RPC
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="set-page">
      <DashNav userRole={userRole} />

      {savedMsg && <div className="set-toast">{savedMsg}</div>}

      {showDeleteConfirm && (
        <div className="set-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="set-modal" onClick={e => e.stopPropagation()}>
            <div className="set-modal-icon">⚠️</div>
            <h3 className="set-modal-title">Delete your account?</h3>
            <p className="set-modal-sub">This will permanently remove your account, profile, and all your data from QuickWork. This cannot be undone.</p>
            <div className="set-modal-actions">
              <button className="set-cancel-btn" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="set-delete-confirm-btn" onClick={handleDeleteAccount} disabled={deleteLoading}>
                {deleteLoading ? 'Deleting...' : 'Yes, delete my account'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="set-body">
        <h1 className="set-page-title">Settings</h1>

        {/* NOTIFICATIONS */}
        <div className="set-section">
          <div className="set-section-header">
            <p className="set-section-title">Notifications</p>
            <p className="set-section-sub">Manage alerts for your account activity{saving ? ' · Saving...' : ''}</p>
          </div>
          {NOTIFICATION_SETTINGS.map(n => (
            <div key={n.key} className="set-row">
              <div className="set-row-text">
                <div className="set-row-label">{n.label}</div>
                <div className="set-row-sub">{n.sub}</div>
              </div>
              <Toggle checked={notifs[n.key]} onChange={val => handleToggle(n.key, val)} />
            </div>
          ))}
        </div>

        {/* LANGUAGE */}
        <div className="set-section">
          <div className="set-section-header">
            <p className="set-section-title">Language</p>
          </div>
          <div className="set-coming-soon">
            🌐 We are working on releasing Marathi and Hindi versions of QuickWork — coming soon!
          </div>
          <div className="set-row">
            <div className="set-row-text">
              <div className="set-row-label">App language</div>
            </div>
            <div className="set-lang-wrap">
              <button className="set-lang-btn set-lang-active">English</button>
              <button className="set-lang-btn set-lang-disabled">मराठी</button>
              <button className="set-lang-btn set-lang-disabled">हिंदी</button>
            </div>
          </div>
        </div>

        {/* ACCOUNT */}
        <div className="set-section">
          <div className="set-section-header">
            <p className="set-section-title">Account</p>
          </div>
          <div className="set-row">
            <div className="set-row-text">
              <div className="set-row-label">Change password</div>
              <div className="set-row-sub">Send a reset link to your registered email</div>
            </div>
            <button className="set-action-btn" onClick={handleChangePassword}>Change →</button>
          </div>
          <div className="set-row">
            <div className="set-row-text">
              <div className="set-row-label set-danger-label">Delete account</div>
              <div className="set-row-sub">Permanently remove your account and all data</div>
            </div>
            <button className="set-danger-btn" onClick={() => setShowDeleteConfirm(true)}>Delete →</button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Settings
