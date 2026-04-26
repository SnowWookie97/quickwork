import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import DashNav from './DashNav'
import './Dashboard.css'

const CITIES = [
  'Nashik', 'Mumbai', 'Pune', 'Nagpur', 'Thane',
  'Aurangabad', 'Solapur', 'Kolhapur', 'Nanded', 'Delhi'
]

const CATEGORIES = [
  'All Categories', 'Logistics', 'Retail', 'Hospitality',
  'Office', 'Events', 'Delivery', 'Warehouse'
]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function WorkerDashboard() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [userRole, setUserRole] = useState(null)
  const [showHomepageMsg, setShowHomepageMsg] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedCity, setSelectedCity] = useState('Nashik')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [trustLevel, setTrustLevel] = useState(() => {
    const c = localStorage.getItem('qw_trust_level')
    return c ? parseInt(c) : 1
  })
  const [profilePct, setProfilePct] = useState(0)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUserRole(user.user_metadata?.role)
      setFirstName((user.user_metadata?.name || '').split(' ')[0])

      const { data: profile } = await supabase.from('profiles').select('trust_level').eq('id', user.id).single()
      if (profile) {
        setTrustLevel(profile.trust_level || 1)
        localStorage.setItem('qw_trust_level', profile.trust_level || 1)
      }

      const { data: wp } = await supabase.from('worker_profiles').select('*').eq('user_id', user.id).single()
      if (wp) {
        let score = 0
        if (wp.emergency_contact_name && wp.emergency_contact_mobile) score += 20
        if (wp.work_history && wp.work_history.length > 0) score += 20
        if (wp.skills && wp.skills.length > 0) score += 20
        if (wp.has_degree !== null && wp.has_degree !== undefined) score += 20
        if (wp.upi_id || wp.bank_account) score += 20
        setProfilePct(score)
      }
    }
    getUser()
  }, [])

  const today = new Date()
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const isCurrentMonth = currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()
  const isPastDay = (day) => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) < todayMidnight
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { daysInMonth, startOffset: firstDay === 0 ? 6 : firstDay - 1 }
  }
  const { daysInMonth, startOffset } = getDaysInMonth(currentMonth)
  const isToday = (day) => day === today.getDate() && currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()
  const isSelected = (day) => selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear()
  const handleDayClick = (day) => {
    if (isPastDay(day)) return
    const clicked = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    setSelectedDate(selectedDate && selectedDate.getTime() === clicked.getTime() ? null : clicked)
  }
  const prevMonth = () => { if (isCurrentMonth) return; setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)) }
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })
  const formatSelectedDate = () => selectedDate ? selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null
  const getDayLabel = (day) => { const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).getDay(); return DAYS[d === 0 ? 6 : d - 1] }
  const prevBtnStyle = { opacity: isCurrentMonth ? 0.2 : 1, cursor: isCurrentMonth ? 'default' : 'pointer' }

  const r = 18
  const circ = 2 * Math.PI * r
  const filled = (profilePct / 100) * circ

  const showProfileNudge = profilePct < 100
  const showTrustNudge = trustLevel < 4

  return (
    <div className="wd-page">
      <DashNav userRole={userRole} onHomepage={() => setShowHomepageMsg(true)} currentPage="dashboard" />

      {showHomepageMsg && (
        <div className="wd-homepage-msg" onClick={() => setShowHomepageMsg(false)}>
          This is the homepage bro 🙌 <span className="wd-homepage-msg-close">✕</span>
        </div>
      )}

      <div className="wd-main">

        {/* LEFT — CALENDAR */}
        <div className="wd-left">
          <h2 className="wd-greeting">Hello, <span className="wd-name">{firstName || 'Worker'}</span>! 👋</h2>

          <div className="wd-calendar">
            <div className="wd-cal-header">
              <button className="wd-cal-nav" onClick={prevMonth} style={prevBtnStyle}>‹</button>
              <span className="wd-cal-month">{monthName}</span>
              <button className="wd-cal-nav" onClick={nextMonth}>›</button>
            </div>
            <div className="wd-cal-grid">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} className="wd-cal-dow">{d}</div>)}
              {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} className="wd-cal-day empty" />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const past = isPastDay(day)
                return <div key={day} className={`wd-cal-day ${past ? 'past' : ''} ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''}`} onClick={() => handleDayClick(day)}>{day}</div>
              })}
            </div>
            {selectedDate ? (
              <div className="wd-cal-selected-info">📅 Showing shifts for <strong>{formatSelectedDate()}</strong><button className="wd-clear-date" onClick={() => setSelectedDate(null)}>✕ Clear</button></div>
            ) : <p className="wd-cal-hint">Tap a date to filter shifts</p>}
          </div>

          <div className="wd-date-strip">
            <div className="wd-strip-month">
              <button className="wd-strip-nav" onClick={prevMonth} style={prevBtnStyle}>‹</button>
              <span className="wd-strip-month-name">{monthName}</span>
              <button className="wd-strip-nav" onClick={nextMonth}>›</button>
            </div>
            <div className="wd-strip-scroll">
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                if (isPastDay(day)) return null
                return (
                  <div key={day} className={`wd-strip-day ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''}`} onClick={() => handleDayClick(day)}>
                    <span className="wd-strip-dow">{getDayLabel(day)}</span>
                    <span className="wd-strip-num">{day}</span>
                  </div>
                )
              })}
            </div>
            {selectedDate && <div className="wd-strip-selected-info"><span>📅 {formatSelectedDate()}</span><button className="wd-clear-date" onClick={() => setSelectedDate(null)}>✕ Clear</button></div>}
          </div>
        </div>

        <div className="wd-divider" />

        {/* MIDDLE — SHIFTS */}
        <div className="wd-right">
          <h2 className="wd-section-title">What would you like to do today?</h2>
          <div className="wd-filters">
            <div className="wd-search-wrap">
              <span className="wd-search-icon">🔍</span>
              <input className="wd-search" type="text" placeholder="Search jobs, companies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select className="wd-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="wd-select" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="wd-empty-state">
            <div className="wd-empty-icon">📋</div>
            <h3 className="wd-empty-title">No shifts available yet</h3>
            <p className="wd-empty-sub">
              {selectedDate ? `No shifts posted for ${formatSelectedDate()} in ${selectedCity}.` : `No shifts available in ${selectedCity} right now.`}
              <br />Check back soon — businesses are joining every day!
            </p>
          </div>
        </div>

        {/* FAR RIGHT — NUDGE CARDS */}
        {(showProfileNudge || showTrustNudge) && (
          <>
            <div className="wd-divider" />
            <div className="wd-nudge-panel">
              <p className="wd-nudge-label">For you</p>

              {showProfileNudge && (
                <div className="wd-nudge-card" onClick={() => navigate('/my-profile')}>
                  <div className="wd-donut-wrap">
                    <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="24" cy="24" r={r} fill="none" stroke="#f0e8e0" strokeWidth="4.5" />
                      <circle cx="24" cy="24" r={r} fill="none" stroke="#E8470F" strokeWidth="4.5"
                        strokeLinecap="round" strokeDasharray={`${filled} ${circ}`} />
                    </svg>
                    <div className="wd-donut-pct">{profilePct}%</div>
                  </div>
                  <p className="wd-nudge-heading">Complete your profile</p>
                  <p className="wd-nudge-sub">Get more suitable job offers from employers.</p>
                  <span className="wd-nudge-btn">Complete →</span>
                </div>
              )}

              {showTrustNudge && (
                <div className="wd-nudge-card" onClick={() => navigate('/validation')}>
                  <div className="wd-shield-wrap">
                    <svg width="28" height="30" viewBox="0 0 44 48">
                      <path d="M22 3 L39 9.5 L39 26 C39 37 22 45 22 45 C22 45 5 37 5 26 L5 9.5 Z"
                        fill="#e8e8e8" stroke="#bbb" strokeWidth="2" />
                      <text x="22" y="30" textAnchor="middle" fontSize="16" fill="#777"
                        fontWeight="700" fontFamily="sans-serif">{trustLevel}</text>
                    </svg>
                  </div>
                  <p className="wd-nudge-heading">Upgrade to Level {trustLevel + 1}</p>
                  <p className="wd-nudge-sub">Free upgrade for better trust from employers and access to more shifts.</p>
                  <span className="wd-nudge-btn wd-nudge-btn-outline">Upgrade →</span>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default WorkerDashboard
