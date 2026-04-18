import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import DashNav from './DashNav'
import './MyShifts.css'

const TABS = ['Completed Shifts', 'Applied Shifts', 'Upcoming Shifts', 'Cancelled Shifts']

function MyShifts() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [userRole, setUserRole] = useState(null)
  const [activeTab, setActiveTab] = useState('Completed Shifts')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUserRole(user.user_metadata?.role)
      setFirstName((user.user_metadata?.name || '').split(' ')[0])
    }
    getUser()
  }, [])

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const emptyMessages = {
    'Completed Shifts': { icon: '🏁', title: 'No completed shifts yet', sub: "Your completed shifts will appear here once you've worked your first one. Keep going!", showBrowse: false },
    'Applied Shifts': { icon: '📨', title: "You haven't applied to any shifts yet", sub: 'Once you apply for a shift, it will show up here while you wait for confirmation.', showBrowse: true },
    'Upcoming Shifts': { icon: '📅', title: 'No upcoming shifts yet', sub: 'Head over to the dashboard and apply for shifts — your confirmed shifts will appear here.', showBrowse: true },
    'Cancelled Shifts': { icon: '❌', title: 'No cancelled shifts', sub: 'Any shifts that were cancelled — either by you or the business — will be listed here.', showBrowse: false },
  }

  const current = emptyMessages[activeTab]

  return (
    <div className="ms-page">
      <DashNav userRole={userRole} />

      <div className="ms-greeting-bar">
        <h1 className="ms-greeting">{getGreeting()}, <span className="ms-orange">{firstName || 'there'}</span>!</h1>
        <p className="ms-greeting-sub">Here you can find all your shifts.</p>
      </div>

      <div className="ms-body">
        <div className="ms-left">
          <div className="ms-card">
            <div className="ms-tabs">
              {TABS.map(tab => (
                <button key={tab} className={`ms-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="ms-tab-divider" />
            <div className="ms-tab-content">
              <div className="ms-empty">
                <div className="ms-empty-icon">{current.icon}</div>
                <h3 className="ms-empty-title">{current.title}</h3>
                <p className="ms-empty-sub">{current.sub}</p>
                {current.showBrowse && (
                  <button className="ms-find-btn" onClick={() => navigate('/worker/dashboard')}>Browse Shifts →</button>
                )}
              </div>
            </div>
          </div>
        </div>

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
