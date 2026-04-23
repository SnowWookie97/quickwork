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

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate("/login"); return }
      const { data: profile } = await supabase.from("profiles").select("is_blacklisted").eq("id", user.id).single()
      if (profile?.is_blacklisted) { navigate("/blacklisted"); return }
      setUserRole(user.user_metadata?.role)
      setFirstName((user.user_metadata?.name || "").split(" ")[0])
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

  return (
    <div className="wd-page">
      <DashNav userRole={userRole} onHomepage={() => setShowHomepageMsg(true)} />

      {showHomepageMsg && (
        <div className="wd-homepage-msg" onClick={() => setShowHomepageMsg(false)}>
          This is the homepage bro 🙌 <span className="wd-homepage-msg-close">✕</span>
        </div>
      )}

      <div className="wd-main">
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
      </div>
    </div>
  )
}

export default WorkerDashboard
