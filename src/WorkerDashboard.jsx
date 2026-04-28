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
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// Timezone-safe: reads local date, not UTC
function localDateStr(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function TrustBadge({ level }) {
  const colors = ['#888', '#3B6D11', '#378ADD', '#B8860B']
  return (
    <span style={{
      fontSize: 11, padding: '2px 8px', borderRadius: 20,
      background: `${colors[level - 1]}18`, color: colors[level - 1],
      fontWeight: 600, border: `1px solid ${colors[level - 1]}44`
    }}>
      Min Level {level}
    </span>
  )
}

function WorkerDashboard() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [userId, setUserId] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [showHomepageMsg, setShowHomepageMsg] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedCity, setSelectedCity] = useState('Nashik')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [trustLevel, setTrustLevel] = useState(() => {
    const c = localStorage.getItem('qw_trust_level')
    return c ? parseInt(c) : 1
  })
  const [profilePct, setProfilePct] = useState(0)
  const [shifts, setShifts] = useState([])
  const [appliedIds, setAppliedIds] = useState([])
  const [applyingId, setApplyingId] = useState(null)
  const [loadingShifts, setLoadingShifts] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUserRole(user.user_metadata?.role)
      setFirstName((user.user_metadata?.name || '').split(' ')[0])
      setUserId(user.id)

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

      const { data: apps } = await supabase
        .from('shift_applications')
        .select('shift_id')
        .eq('worker_id', user.id)
      if (apps) setAppliedIds(apps.map(a => a.shift_id))

      fetchShifts()
    }
    getUser()
  }, [])

  const fetchShifts = async () => {
    setLoadingShifts(true)
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('status', 'open')
      .order('date', { ascending: true })
    console.log('SHIFTS DATA:', data)
    console.log('SHIFTS ERROR:', error)
    setShifts(data || [])
    setLoadingShifts(false)
  }

  const handleApply = async (shiftId, minTrustLevel) => {
    if (trustLevel < minTrustLevel) return
    setApplyingId(shiftId)
    const { error } = await supabase.from('shift_applications').insert({
      shift_id: shiftId,
      worker_id: userId,
    })
    if (!error) setAppliedIds([...appliedIds, shiftId])
    setApplyingId(null)
  }

  // Filter by category and search only — never hide by date
  const filteredShifts = shifts.filter(s => {
    const matchCategory = selectedCategory === 'All Categories' || s.category === selectedCategory
    const matchSearch = !searchQuery ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  // Group shifts by date, selected date pinned first
  const selectedDateStr = selectedDate ? localDateStr(selectedDate) : null
  const groupShiftsByDate = (shiftList) => {
    const groups = {}
    shiftList.forEach(s => {
      if (!groups[s.date]) groups[s.date] = []
      groups[s.date].push(s)
    })
    const dates = Object.keys(groups).sort()
    if (selectedDateStr && groups[selectedDateStr]) {
      const rest = dates.filter(d => d !== selectedDateStr)
      return [selectedDateStr, ...rest].filter(d => groups[d]).map(d => ({ date: d, shifts: groups[d] }))
    }
    return dates.map(d => ({ date: d, shifts: groups[d] }))
  }
  const groupedShifts = groupShiftsByDate(filteredShifts)

  const formatGroupDate = (d) => {
    const date = new Date(d + 'T00:00:00')
    return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  // Calendar helpers
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

          {loadingShifts ? (
            <div className="wd-empty-state">
              <p className="wd-empty-sub">Loading shifts...</p>
            </div>
          ) : filteredShifts.length === 0 ? (
            <div className="wd-empty-state">
              <div className="wd-empty-icon">📋</div>
              <h3 className="wd-empty-title">No shifts available yet</h3>
              <p className="wd-empty-sub">
                No open shifts right now.<br />Check back soon — businesses are joining every day!
              </p>
            </div>
          ) : (
            <div className="wd-shift-cards">
              {groupedShifts.map(group => (
                <div key={group.date}>
                  <div className={`wd-date-header ${selectedDateStr === group.date ? 'wd-date-header-selected' : ''}`}>
                    {formatGroupDate(group.date)}
                    {selectedDateStr === group.date && <span className="wd-date-pin">📌 Selected</span>}
                  </div>
                  {group.shifts.map(shift => {
                    const bizName = shift.business_name || 'Business'
                    const initials = bizName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    const applied = appliedIds.includes(shift.id)
                    const eligible = trustLevel >= shift.min_trust_level
                    const applying = applyingId === shift.id
                    return (
                      <div className="wd-shift-card" key={shift.id}>
                        <div className="wd-shift-card-top">
                          <div className="wd-biz-avatar">
                            <span>{initials}</span>
                          </div>
                          <div className="wd-shift-card-info">
                            <div className="wd-shift-card-title">{shift.title}</div>
                            <div className="wd-shift-card-biz">{bizName}</div>
                          </div>
                          <div className="wd-shift-card-wage">
                            ₹{shift.wage_amount}<span>/{shift.wage_type}</span>
                          </div>
                        </div>
                        <div className="wd-shift-card-details">
                          <span>🕐 {formatTime(shift.start_time)}–{formatTime(shift.end_time)}</span>
                          <span>📍 {shift.location}</span>
                          <span>👥 {shift.workers_needed} needed</span>
                        </div>
                        <div className="wd-shift-card-footer">
                          <TrustBadge level={shift.min_trust_level} />
                          {applied ? (
                            <button className="wd-apply-btn wd-applied" disabled>Applied ✓</button>
                          ) : !eligible ? (
                            <button className="wd-apply-btn wd-ineligible" disabled>Need Level {shift.min_trust_level}</button>
                          ) : (
                            <button className="wd-apply-btn" onClick={() => handleApply(shift.id, shift.min_trust_level)} disabled={applying}>
                              {applying ? 'Applying...' : 'Apply Now →'}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
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

