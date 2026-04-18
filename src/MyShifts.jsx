import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import logoImg from './assets/logo.png'
import './MyShifts.css'

const TABS = ['Upcoming Shifts', 'Applied', 'Past Shifts']

function MyShifts() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [userRole, setUserRole] = useState(null)
  const [activeTab, setActiveTab] = useState('Upcoming Shifts')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUserRole(user.user_metadata?.role)
      const fullName = user.user_metadata?.name || ''
      setFirstName(fullName.split(' ')[0])
    }
    getUser()
  }, [])

  const handleLogoClick = () => {
    if (userRole === 'business') navigate('/business/dashboard')
    else if (userRole === 'worker') navigate('/worker/dashboard')
    else navigate('/')
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const emptyMessages = {
    'Upcoming Shifts': {
      icon: '📅',
      title: 'No upcoming shifts yet',
      sub: 'Head over to the dashboard and apply for shifts — your confirmed shifts will appear here.',
    },
    'Applied': {
      icon: '📨',
      title: "You haven't applied to any shifts yet",
      sub: 'Once you apply for a shift, it will show up here while you wait for confirmation.',
    },
    'Past Shifts': {
      icon: '🏁',
      title: 'Nothing here yet',
      sub: 'Your completed shifts will appear here once you\'ve worked your first one. Keep going!',
    },
  }

  const current = emptyMessages[activeTab]

  return (
    <div className="ms-page">
      {/* NAVBAR */}
      <nav className="ms-navbar">
        <div className="ms-nav-logo" onClick={handleLogoClick}>
          <img src={logoImg} alt="QuickWork" className="ms-logo-img" />
          <span className="ms-logo-text">QuickWork</span>
        </div>
        <button className="ms-back-btn" onClick={() => navigate(-1)}>← Back</button>
      </nav>

      {/* GREETING */}
      <div className="ms-greeting-bar">
        <div>
          <h1 className="ms-greeting">{getGreeting()}, <span className="ms-orange">{firstName || 'there'}</span>!</h1>
          <p className="ms-greeting-sub">Here you can find all your shifts.</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="ms-body">

        {/* LEFT — SHIFTS */}
        <div className="ms-left">
          {/* TABS */}
          <div className="ms-tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                className={`ms-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <div className="ms-tab-content">
            <div className="ms-empty">
              <div className="ms-empty-icon">{current.icon}</div>
              <h3 className="ms-empty-title">{current.title}</h3>
              <p className="ms-empty-sub">{current.sub}</p>
              {activeTab !== 'Past Shifts' && (
                <button className="ms-find-btn" onClick={() => navigate('/worker/dashboard')}>
                  Browse Shifts →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — REMINDERS */}
        <div className="ms-right">
          <div className="ms-reminders">
            <div className="ms-reminders-header">
              <span className="ms-reminders-icon">🔔</span>
              <h3 className="ms-reminders-title">Reminders</h3>
            </div>
            <div className="ms-reminders-empty">
              <p>You have no reminders for now.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default MyShifts
