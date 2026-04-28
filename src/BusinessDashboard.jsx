import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import DashNav from './DashNav'
import './Dashboard.css'
import './BusinessDashboard.css'

function BusinessDashboard() {
  const navigate = useNavigate()
  const [businessName, setBusinessName] = useState('')
  const [userRole, setUserRole] = useState('business')
  const [showHomepageMsg, setShowHomepageMsg] = useState(false)

  // Stats (all 0 until shifts system is built)
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
    }
    getUser()
  }, [])

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

      <div className="bd-main">

        {/* TOP BAR */}
        <div className="bd-topbar">
          <div className="bd-greeting">
            Welcome back, <span className="bd-name">{businessName}</span>! 🏢
          </div>
          <button className="bd-post-btn" onClick={() => navigate('/under-construction')}>
            + Post a Shift
          </button>
        </div>

        {/* STATS ROW */}
        <div className="bd-stats">
          {stats.map(s => (
            <div className="bd-stat-card" key={s.label}>
              <div className="bd-stat-label">{s.label}</div>
              <div className={`bd-stat-val ${s.value > 0 ? 'orange' : ''}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* TWO PANELS */}
        <div className="bd-panels">

          {/* LEFT — YOUR SHIFTS */}
          <div className="bd-panel">
            <div className="bd-panel-title">YOUR SHIFTS</div>
            <div className="bd-empty">
              <div className="bd-empty-icon">📋</div>
              <p className="bd-empty-heading">No shifts posted yet</p>
              <p className="bd-empty-sub">Post your first shift to start finding workers.</p>
              <button className="bd-empty-btn" onClick={() => navigate('/under-construction')}>
                + Post a Shift
              </button>
            </div>
          </div>

          {/* RIGHT — PENDING APPLICATIONS */}
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
