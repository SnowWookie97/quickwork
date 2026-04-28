import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import DashNav from './DashNav'
import './Dashboard.css'
import './BusinessDashboard.css'

const CATEGORIES = [
  'Logistics', 'Retail', 'Hospitality', 'Office', 'Events', 'Delivery', 'Warehouse'
]

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

  const stats = [
    { label: 'Active Shifts', value: 0 },
    { label: 'Open Applications', value: 0 },
    { label: 'Workers Hired', value: 0 },
    { label: 'Shifts Completed', value: 0 },
  ]

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setBusinessName(user.user_metadata?.name || 'Business')
      setUserId(user.id)
    }
    getUser()
  }, [])

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

    if (error) {
      setFormError('Something went wrong. Please try again.'); return
    }

    setFormSuccess(true)
  }

  const handleCloseOverlay = () => {
    setShowPostShift(false)
    setForm(defaultForm)
    setFormError('')
    setFormSuccess(false)
  }

  const today = new Date().toISOString().split('T')[0]

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
                <p>Your shift has been posted. Workers can now apply.</p>
                <button className="bd-post-btn" onClick={handleCloseOverlay}>Done</button>
              </div>
            ) : (
              <div className="bd-overlay-form">

                <div className="bd-form-row">
                  <div className="bd-form-group">
                    <label>Job Title <span className="bd-required">*</span></label>
                    <input type="text" placeholder="e.g. Kitchen Helper, Warehouse Staff" value={form.title} onChange={update('title')} />
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
                    <input type="time" value={form.start_time} onChange={update('start_time')} />
                  </div>
                  <div className="bd-form-group">
                    <label>End Time <span className="bd-required">*</span></label>
                    <input type="time" value={form.end_time} onChange={update('end_time')} />
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
                      <button
                        type="button"
                        className={`bd-toggle-btn ${form.wage_type === 'hour' ? 'active' : ''}`}
                        onClick={() => setForm({ ...form, wage_type: 'hour' })}
                      >Hour</button>
                      <button
                        type="button"
                        className={`bd-toggle-btn ${form.wage_type === 'day' ? 'active' : ''}`}
                        onClick={() => setForm({ ...form, wage_type: 'day' })}
                      >Day</button>
                    </div>
                  </div>
                </div>

                <div className="bd-form-group">
                  <label>Description / Requirements</label>
                  <textarea
                    placeholder="Any specific skills, dress code, experience needed..."
                    value={form.description}
                    onChange={update('description')}
                    rows={3}
                  />
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
          {stats.map(s => (
            <div className="bd-stat-card" key={s.label}>
              <div className="bd-stat-label">{s.label}</div>
              <div className={`bd-stat-val ${s.value > 0 ? 'orange' : ''}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="bd-panels">
          <div className="bd-panel">
            <div className="bd-panel-title">YOUR SHIFTS</div>
            <div className="bd-empty">
              <div className="bd-empty-icon">📋</div>
              <p className="bd-empty-heading">No shifts posted yet</p>
              <p className="bd-empty-sub">Post your first shift to start finding workers.</p>
              <button className="bd-empty-btn" onClick={() => setShowPostShift(true)}>
                + Post a Shift
              </button>
            </div>
          </div>

          <div className="bd-panel">
            <div className="bd-panel-title">PENDING APPLICATIONS</div>
            <div className="bd-empty">
              <div className="bd-empty-icon">👥</div>
              <p className="bd-empty-heading">No applications yet</p>
              <p className="bd-empty-sub">Once workers apply to your shifts, they'll appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessDashboard
