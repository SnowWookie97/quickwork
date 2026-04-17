import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import logoImg from './assets/logo.png'
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
  const [referralCode, setReferralCode] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedCity, setSelectedCity] = useState('Nashik')
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dashDropdown, setDashDropdown] = useState(false)
  const [profileDropdown, setProfileDropdown] = useState(false)

  const dashRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      const fullName = user.user_metadata?.name || ''
      setFirstName(fullName.split(' ')[0])

      // Fetch referral code
      const { data: refData } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('user_id', user.id)
        .single()

      if (refData) setReferralCode(refData.referral_code)
    }
    getUser()
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (dashRef.current && !dashRef.current.contains(e.target)) setDashDropdown(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const today = new Date()
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const isCurrentMonth =
    currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear()

  const isPastDay = (day) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return d < todayMidnight
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const startOffset = (firstDay === 0 ? 6 : firstDay - 1)
    return { daysInMonth, startOffset }
  }

  const { daysInMonth, startOffset } = getDaysInMonth(currentMonth)

  const isToday = (day) =>
    day === today.getDate() &&
    currentMonth.getMonth() === today.getMonth() &&
    currentMonth.getFullYear() === today.getFullYear()

  const isSelected = (day) =>
    selectedDate &&
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === currentMonth.getMonth() &&
    selectedDate.getFullYear() === currentMonth.getFullYear()

  const handleDayClick = (day) => {
    if (isPastDay(day)) return
    const clicked = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    if (selectedDate && selectedDate.getTime() === clicked.getTime()) {
      setSelectedDate(null)
    } else {
      setSelectedDate(clicked)
    }
  }

  const prevMonth = () => {
    if (isCurrentMonth) return
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

  const formatSelectedDate = () => {
    if (!selectedDate) return null
    return selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const getDayLabel = (day) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).getDay()
    return DAYS[d === 0 ? 6 : d - 1]
  }

  const dashMenuItems = ['My Shifts', 'Payments', 'Ratings']
  const profileMenuItems = ['Update Profile', 'Settings', 'Validation', 'Invite Friends', 'Contact Us', 'Feedback', 'Log Out']

  const prevBtnStyle = {
    opacity: isCurrentMonth ? 0.2 : 1,
    cursor: isCurrentMonth ? 'default' : 'pointer'
  }

  return (
    <div className="wd-page">

      {/* INVITE MODAL */}
      {showInviteModal && (
        <div className="invite-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
            <button className="invite-close" onClick={() => setShowInviteModal(false)}>✕</button>
            <div className="invite-icon">🎉</div>
            <h2 className="invite-title">Invite Friends to QuickWork</h2>
            <p className="invite-sub">Share your unique referral code with friends. When they sign up using your code, they'll be linked to you!</p>
            <div className="invite-code-box">
              <span className="invite-code">{referralCode || 'Loading...'}</span>
              <button className="invite-copy-btn" onClick={handleCopy}>
                {copied ? '✅ Copied!' : 'Copy'}
              </button>
            </div>
            <p className="invite-note">Your friends can enter this code during signup under "Were you invited by a friend?"</p>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="wd-navbar">
        <div className="wd-nav-logo" onClick={() => navigate('/')}>
          <img src={logoImg} alt="QuickWork" className="wd-logo-img" />
          <span className="wd-logo-text">QuickWork</span>
        </div>

        <div className="wd-nav-right">
          <div className="wd-nav-item" ref={dashRef}>
            <button className="wd-nav-btn" onClick={() => { setDashDropdown(!dashDropdown); setProfileDropdown(false) }}>
              My Dashboard <span className="wd-chevron">{dashDropdown ? '▲' : '▼'}</span>
            </button>
            {dashDropdown && (
              <div className="wd-dropdown">
                {dashMenuItems.map(item => (
                  <div key={item} className="wd-dropdown-item" onClick={() => { navigate('/under-construction'); setDashDropdown(false) }}>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="wd-nav-item" ref={profileRef}>
            <button className="wd-nav-btn profile-btn" onClick={() => { setProfileDropdown(!profileDropdown); setDashDropdown(false) }}>
              <div className="wd-avatar">👤</div>
              My Profile <span className="wd-chevron">{profileDropdown ? '▲' : '▼'}</span>
            </button>
            {profileDropdown && (
              <div className="wd-dropdown">
                {profileMenuItems.map(item => (
                  <div
                    key={item}
                    className={`wd-dropdown-item ${item === 'Log Out' ? 'logout-item' : ''} ${item === 'Invite Friends' ? 'invite-item' : ''}`}
                    onClick={() => {
                      setProfileDropdown(false)
                      if (item === 'Log Out') handleLogout()
                      else if (item === 'Contact Us') window.location.href = 'mailto:hello@quickwork.in'
                      else if (item === 'Invite Friends') setShowInviteModal(true)
                      else navigate('/under-construction')
                    }}
                  >
                    {item === 'Invite Friends' ? '🎉 Invite Friends' : item}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="wd-main">

        {/* LEFT PANEL */}
        <div className="wd-left">
          <h2 className="wd-greeting">Hello, <span className="wd-name">{firstName || 'Worker'}</span>! 👋</h2>

          {/* DESKTOP CALENDAR */}
          <div className="wd-calendar">
            <div className="wd-cal-header">
              <button className="wd-cal-nav" onClick={prevMonth} style={prevBtnStyle}>‹</button>
              <span className="wd-cal-month">{monthName}</span>
              <button className="wd-cal-nav" onClick={nextMonth}>›</button>
            </div>

            <div className="wd-cal-grid">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} className="wd-cal-dow">{d}</div>
              ))}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="wd-cal-day empty" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const past = isPastDay(day)
                return (
                  <div
                    key={day}
                    className={`wd-cal-day ${past ? 'past' : ''} ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''}`}
                    onClick={() => handleDayClick(day)}
                  >
                    {day}
                  </div>
                )
              })}
            </div>

            {selectedDate ? (
              <div className="wd-cal-selected-info">
                📅 Showing shifts for <strong>{formatSelectedDate()}</strong>
                <button className="wd-clear-date" onClick={() => setSelectedDate(null)}>✕ Clear</button>
              </div>
            ) : (
              <p className="wd-cal-hint">Tap a date to filter shifts</p>
            )}
          </div>

          {/* MOBILE DATE STRIP */}
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
                  <div
                    key={day}
                    className={`wd-strip-day ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''}`}
                    onClick={() => handleDayClick(day)}
                  >
                    <span className="wd-strip-dow">{getDayLabel(day)}</span>
                    <span className="wd-strip-num">{day}</span>
                  </div>
                )
              })}
            </div>

            {selectedDate && (
              <div className="wd-strip-selected-info">
                <span>📅 {formatSelectedDate()}</span>
                <button className="wd-clear-date" onClick={() => setSelectedDate(null)}>✕ Clear</button>
              </div>
            )}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="wd-divider" />

        {/* RIGHT PANEL */}
        <div className="wd-right">
          <h2 className="wd-section-title">What would you like to do today?</h2>

          <div className="wd-filters">
            <div className="wd-search-wrap">
              <span className="wd-search-icon">🔍</span>
              <input
                className="wd-search"
                type="text"
                placeholder="Search jobs, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              className="wd-select category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              className="wd-select city-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="wd-empty-state">
            <div className="wd-empty-icon">📋</div>
            <h3 className="wd-empty-title">No shifts available yet</h3>
            <p className="wd-empty-sub">
              {selectedDate
                ? `No shifts posted for ${formatSelectedDate()} in ${selectedCity}.`
                : `No shifts available in ${selectedCity} right now.`}
              <br />Check back soon — businesses are joining every day!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkerDashboard
