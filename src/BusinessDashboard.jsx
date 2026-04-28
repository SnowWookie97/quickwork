import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import DashNav from './DashNav'
import './Dashboard.css'
import './BusinessDashboard.css'

const CATEGORIES = [
  'Logistics', 'Retail', 'Hospitality', 'Office', 'Events', 'Delivery', 'Warehouse'
]

// Generate 30-min time slots: 12:00 AM to 11:30 PM
const TIME_SLOTS = []
for (let h = 0; h < 24; h++) {
  for (let m of [0, 30]) {
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    const ampm = h < 12 ? 'AM' : 'PM'
    const label = `${hour12}:${m === 0 ? '00' : '30'} ${ampm}`
    const value = `${String(h).padStart(2, '0')}:${m === 0 ? '00' : '30'}`
    TIME_SLOTS.push({ label, value })
  }
}

const defaultForm = {
  title: '',
  category: '',
  date: '',
  start_time: '',
  end_time: '',
  location: '',
  workers_needed: 1,
  wage_amount: '',
  wage_type: 'hour',
  description: '',
  min_trust_level: 1,
}

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour < 12 ? 'AM' : 'PM'
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${hour12}:${m} ${ampm}`
}

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d + 'T00:00:00')
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function StatusBadge({ status }) {
  const map = {
    open: { label: 'Open', cls: 'bd-badge-open' },
    filled: { label: 'Filled', cls: 'bd-badge-filled' },
    completed: { label: 'Done', cls: 'bd-badge-done' },
    cancelled: { label: 'Cancelled', cls: 'bd-badge-cancelled' },
  }
  const s = map[status] || map.open
  return <span className={`bd-badge ${s.cls}`}>{s.label}</span>
}

function BusinessDashboard() {
  const navigate = useNavigate()
  const [businessName, setBusinessName] = useState('')
  const [userId, setUserId] = useState(null)
  const [showHomepageMsg, setShowHomepageMsg] = useState(false)
  const [showPostShift, setShowPostShift] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [shifts, setShifts] = useState([])
  const [applications, setApplications] = useState([])
  const [loadingShifts, setLoadingShifts] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setBusinessName(user.user_metadata?.name || 'Business')
      setUserId(user.id)
      fetchShifts(user.id)
      fetchApplications(user.id)
    }
    getUser()
  }, [])

  const fetchShifts = async (uid) => {
    setLoadingShifts(true)
    const { data } = await supabase
      .from('shifts')
      .select('*')
      .eq('business_id', uid)
      .order('date', { ascending: true })
    setShifts(data || [])
    setLoadingShifts(false)
  }

  const fetchApplications = async (uid) => {
    const { data } = await supabase
      .from('shift_applications')
      .select('*, shifts!inner(title, business_id)')
      .eq('shifts.business_id', uid)
      .eq('status', 'pending')
    setApplications(data || [])
  }

  // Worker detail overlay
  const [selectedWorker, setSelectedWorker] = useState(null)

  const calcAge = (dob) => {
    if (!dob) return null
    const birth = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  const SHIELD_DATA = [
    { fill: "#e8e8e8", stroke: "#bbb", numColor: "#777" },
    { fill: "#C0DD97", stroke: "#3B6D11", numColor: "#173404" },
    { fill: "#c8e6f8", stroke: "#378ADD", numColor: "#0C447C" },
    { fill: "#FFD700", stroke: "#B8860B", numColor: "#5a3e00" }
  ]

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handlePostShift = async () => {
    setFormError('')
    if (!form.title || !form.category || !form.date || !form.start_time || !form.end_time || !form.location || !form.wage_amount) {
      setFormError('Please fill in all required fields.'); return
    }
    if (parseFloat(form.wage_amount) <= 0) {
      setFormError('Please enter a valid wage amount.'); return
    }
    if (form.start_time >= form.end_time) {
      setFormError('End time must be after start time.'); return
    }

    setFormLoading(true)
    const { error } = await supabase.from('shifts').insert({
      business_id: userId,
      business_name: businessName,
      title: form.title,
      category: form.category,
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      location: form.location,
      workers_needed: parseInt(form.workers_needed),
      wage_amount: parseFloat(form.wage_amount),
      wage_type: form.wage_type,
      description: form.description || null,
      min_trust_level: parseInt(form.min_trust_level),
    })
    setFormLoading(false)

    if (error) { setFormError('Something went wrong. Please try again.'); return }

    setFormSuccess(true)
    fetchShifts(userId)
  }

  const handleCloseOverlay = () => {
    setShowPostShift(false)
    setForm(defaultForm)
    setFormError('')
    setFormSuccess(false)
  }

  const handleAccept = async (appId, shiftId) => {
    await supabase.from('shift_applications').update({ status: 'accepted' }).eq('id', appId)
    fetchApplications(userId)
    fetchShifts(userId)
  }

  const handleReject = async (appId) => {
    await supabase.from('shift_applications').update({ status: 'rejected' }).eq('id', appId)
    fetchApplications(userId)
  }

  const today = new Date().toISOString().split('T')[0]

  const activeShifts = shifts.filter(s => s.status === 'open' || s.status === 'filled').length
  const completedShifts = shifts.filter(s => s.status === 'completed').length

  return (
    <div className="wd-page">
      <DashNav
        userRole="business"
        onHomepage={() => setShowHomepageMsg(true)}
        currentPage="dashboard"
      />

      {showHomepageMsg && (
        <div className="wd-homepage-msg" onClick={() => setShowHomepageMsg(false)}>
          This is the homepage bro 🙌 <span className="wd-homepage-msg-close">✕</span>
        </div>
      )}

      {/* POST A SHIFT OVERLAY */}
      {showPostShift && (
        <div className="bd-overlay-backdrop" onClick={handleCloseOverlay}>
          <div className="bd-overlay" onClick={(e) => e.stopPropagation()}>
            <div className="bd-overlay-header">
              <h2 className="bd-overlay-title">Post a Shift</h2>
              <button className="bd-overlay-close" onClick={handleCloseOverlay}>✕</button>
            </div>

            {formSuccess ? (
              <div className="bd-overlay-success">
                <div className="bd-success-icon">✅</div>
                <h3>Shift Posted!</h3>
                <p>Your shift is now live. Workers can apply immediately.</p>
                <button className="bd-post-btn" onClick={handleCloseOverlay}>Done</button>
              </div>
            ) : (
              <div className="bd-overlay-form">

                <div className="bd-form-row">
                  <div className="bd-form-group">
                    <label>Job Title <span className="bd-required">*</span></label>
                    <input type="text" placeholder="e.g. Kitchen Helper" value={form.title} onChange={update('title')} />
                  </div>
                  <div className="bd-form-group">
                    <label>Category <span className="bd-required">*</span></label>
                    <select value={form.category} onChange={update('category')}>
                      <option value="">Select category</option>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bd-form-row">
                  <div className="bd-form-group">
                    <label>Date <span className="bd-required">*</span></label>
                    <input type="date" value={form.date} onChange={update('date')} min={today} />
                  </div>
                  <div className="bd-form-group">
                    <label>Start Time <span className="bd-required">*</span></label>
                    <select value={form.start_time} onChange={update('start_time')}>
                      <option value="">Select time</option>
                      {TIME_SLOTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="bd-form-group">
                    <label>End Time <span className="bd-required">*</span></label>
                    <select value={form.end_time} onChange={update('end_time')}>
                      <option value="">Select time</option>
                      {TIME_SLOTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bd-form-group">
                  <label>Location / Area <span className="bd-required">*</span></label>
                  <input type="text" placeholder="e.g. Nashik Road, Near CBS, Panchavati" value={form.location} onChange={update('location')} />
                </div>

                <div className="bd-form-row">
                  <div className="bd-form-group">
                    <label>Workers Needed <span className="bd-required">*</span></label>
                    <input type="number" min={1} max={50} value={form.workers_needed} onChange={update('workers_needed')} />
                  </div>
                  <div className="bd-form-group">
                    <label>Wage (₹) <span className="bd-required">*</span></label>
                    <input type="number" min={1} placeholder="e.g. 150" value={form.wage_amount} onChange={update('wage_amount')} />
                  </div>
                  <div className="bd-form-group">
                    <label>Per</label>
                    <div className="bd-wage-toggle">
                      <button type="button" className={`bd-toggle-btn ${form.wage_type === 'hour' ? 'active' : ''}`} onClick={() => setForm({ ...form, wage_type: 'hour' })}>Hour</button>
                      <button type="button" className={`bd-toggle-btn ${form.wage_type === 'day' ? 'active' : ''}`} onClick={() => setForm({ ...form, wage_type: 'day' })}>Day</button>
                    </div>
                  </div>
                </div>

                <div className="bd-form-group">
                  <label>Description / Requirements</label>
                  <textarea placeholder="Any specific skills, dress code, experience needed..." value={form.description} onChange={update('description')} rows={3} />
                </div>

                <div className="bd-form-group">
                  <label>Minimum Trust Level Required</label>
                  <select value={form.min_trust_level} onChange={update('min_trust_level')}>
                    <option value={1}>Level 1 — Any worker</option>
                    <option value={2}>Level 2 — Aadhaar verified</option>
                    <option value={3}>Level 3 — Address verified</option>
                  </select>
                </div>

                {formError && <p className="bd-form-error">{formError}</p>}

                <button className="bd-post-btn bd-submit-btn" onClick={handlePostShift} disabled={formLoading}>
                  {formLoading ? 'Posting...' : 'Post Shift →'}
                </button>

              </div>
            )}
          </div>
        </div>
      )}

      {/* WORKER DETAIL OVERLAY */}
      {selectedWorker && (() => {
        const name = selectedWorker.worker_name || 'Worker'
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        const avatar = selectedWorker.worker_avatar
        const age = calcAge(selectedWorker.worker_dob)
        const trust = selectedWorker.worker_trust_level || 1
        const sd = SHIELD_DATA[trust - 1]
        const trustLabels = ['Signed Up', 'Aadhaar Verified', 'Address Verified', 'Police Cleared']
        return (
          <div className="bd-overlay-backdrop" onClick={() => setSelectedWorker(null)}>
            <div className="bd-overlay bd-worker-overlay" onClick={e => e.stopPropagation()}>
              <div className="bd-overlay-header">
                <h2 className="bd-overlay-title">Worker Profile</h2>
                <button className="bd-overlay-close" onClick={() => setSelectedWorker(null)}>✕</button>
              </div>
              <div className="bd-worker-profile">
                <div className="bd-worker-avatar-lg">
                  {avatar
                    ? <img src={avatar} alt={name} className="bd-worker-avatar-img" />
                    : <span>{initials}</span>
                  }
                </div>
                <h3 className="bd-worker-name">{name}</h3>
                <p className="bd-worker-shift">Applied for: <strong>{selectedWorker.shifts?.title}</strong></p>

                <div className="bd-worker-stats">
                  <div className="bd-worker-stat">
                    <div className="bd-worker-stat-val">{age || '—'}</div>
                    <div className="bd-worker-stat-label">Age</div>
                  </div>
                  <div className="bd-worker-stat">
                    <div className="bd-worker-stat-val">
                      <svg width="28" height="30" viewBox="0 0 44 48" style={{ display: 'block', margin: '0 auto' }}>
                        <path d="M22 3 L39 9.5 L39 26 C39 37 22 45 22 45 C22 45 5 37 5 26 L5 9.5 Z" fill={sd.fill} stroke={sd.stroke} strokeWidth="2"/>
                        <text x="22" y="30" textAnchor="middle" fontSize="16" fill={sd.numColor} fontWeight="700" fontFamily="sans-serif">{trust}</text>
                      </svg>
                    </div>
                    <div className="bd-worker-stat-label">Level {trust}</div>
                  </div>
                  <div className="bd-worker-stat">
                    <div className="bd-worker-stat-val" style={{ fontSize: 13 }}>{trustLabels[trust - 1]}</div>
                    <div className="bd-worker-stat-label">Validation</div>
                  </div>
                </div>

                {selectedWorker.worker_dob && (
                  <div className="bd-worker-detail-row">
                    <span className="bd-worker-detail-label">Date of Birth</span>
                    <span className="bd-worker-detail-val">{new Date(selectedWorker.worker_dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                )}

                <div className="bd-worker-actions">
                  <button className="bd-btn-reject bd-worker-action-btn" onClick={() => { handleReject(selectedWorker.id); setSelectedWorker(null) }}>Reject</button>
                  <button className="bd-btn-accept bd-worker-action-btn" onClick={() => { handleAccept(selectedWorker.id, selectedWorker.shift_id); setSelectedWorker(null) }}>Accept Worker →</button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      <div className="bd-main">
        <div className="bd-topbar">
          <div className="bd-greeting">
            Welcome back, <span className="bd-name">{businessName}</span>!
          </div>
          <button className="bd-post-btn" onClick={() => setShowPostShift(true)}>
            + Post a Shift
          </button>
        </div>

        <div className="bd-stats">
          {[
            { label: 'Active Shifts', value: activeShifts },
            { label: 'Open Applications', value: applications.length },
            { label: 'Workers Hired', value: 0 },
            { label: 'Shifts Completed', value: completedShifts },
          ].map(s => (
            <div className="bd-stat-card" key={s.label}>
              <div className="bd-stat-label">{s.label}</div>
              <div className={`bd-stat-val ${s.value > 0 ? 'orange' : ''}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="bd-panels">

          {/* YOUR SHIFTS */}
          <div className="bd-panel">
            <div className="bd-panel-title">YOUR SHIFTS</div>
            {loadingShifts ? (
              <div className="bd-empty"><p className="bd-empty-sub">Loading...</p></div>
            ) : shifts.length === 0 ? (
              <div className="bd-empty">
                <div className="bd-empty-icon">📋</div>
                <p className="bd-empty-heading">No shifts posted yet</p>
                <p className="bd-empty-sub">Post your first shift to start finding workers.</p>
                <button className="bd-empty-btn" onClick={() => setShowPostShift(true)}>+ Post a Shift</button>
              </div>
            ) : (
              <div className="bd-shift-list">
                {shifts.map(shift => (
                  <div className="bd-shift-row" key={shift.id}>
                    <div className="bd-shift-info">
                      <div className="bd-shift-title">{shift.title}</div>
                      <div className="bd-shift-meta">
                        {formatDate(shift.date)} · {formatTime(shift.start_time)}–{formatTime(shift.end_time)} · {shift.workers_needed} worker{shift.workers_needed > 1 ? 's' : ''}
                      </div>
                      <div className="bd-shift-meta">{shift.location} · ₹{shift.wage_amount}/{shift.wage_type}</div>
                    </div>
                    <StatusBadge status={shift.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* PENDING APPLICATIONS */}
          <div className="bd-panel">
            <div className="bd-panel-title">PENDING APPLICATIONS</div>
            {applications.length === 0 ? (
              <div className="bd-empty">
                <div className="bd-empty-icon">👥</div>
                <p className="bd-empty-heading">No applications yet</p>
                <p className="bd-empty-sub">Once workers apply to your shifts, they'll appear here.</p>
              </div>
            ) : (
              <div className="bd-app-list">
                {applications.map(app => {
                  const name = app.worker_name || 'Worker'
                  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                  const avatar = app.worker_avatar
                  return (
                    <div className="bd-app-row" key={app.id} onClick={() => setSelectedWorker(app)} style={{ cursor: 'pointer' }}>
                      <div className="bd-app-avatar">
                        {avatar
                          ? <img src={avatar} alt={name} className="bd-avatar-img" />
                          : <span>{initials}</span>
                        }
                      </div>
                      <div className="bd-app-info">
                        <div className="bd-app-name">{name}</div>
                        <div className="bd-app-meta">{app.shifts?.title} · Tap to view profile</div>
                      </div>
                      <div className="bd-app-actions" onClick={e => e.stopPropagation()}>
                        <button className="bd-btn-accept" onClick={() => handleAccept(app.id, app.shift_id)}>Accept</button>
                        <button className="bd-btn-reject" onClick={() => handleReject(app.id)}>Reject</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default BusinessDashboard
