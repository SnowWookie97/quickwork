import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import DashNav from './DashNav'
import './MyShifts.css'

const TABS = ['Applied Shifts', 'Upcoming Shifts', 'Completed Shifts', 'Cancelled Shifts']

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

function ShiftCard({ shift, app, status }) {
  const bannerColors = {
    'Hospitality': '#1A2744', 'Restaurant': '#1A2744',
    'Logistics': '#0F6E56', 'Warehouse': '#0F6E56',
    'Events': '#534AB7', 'Retail': '#185FA5',
    'Office': '#185FA5', 'Delivery': '#854F0B',
    'Construction': '#854F0B', 'Healthcare': '#0F6E56',
  }
  const bannerBg = bannerColors[shift?.category] || '#1A2744'
  const bizName = shift?.business_name || 'Business'
  const initials = bizName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  const statusColors = {
    pending: { bg: '#fff3e0', color: '#e65100', label: 'Pending' },
    accepted: { bg: '#e8f5e9', color: '#2e7d32', label: 'Accepted ✓' },
    rejected: { bg: '#fff5f5', color: '#c62828', label: 'Rejected' },
    cancelled: { bg: '#f5f5f5', color: '#888', label: 'Cancelled' },
  }
  const st = statusColors[app?.status] || statusColors.pending

  const calcHours = () => {
    if (!shift?.start_time || !shift?.end_time) return null
    const [sh, sm] = shift.start_time.split(':').map(Number)
    const [eh, em] = shift.end_time.split(':').map(Number)
    const mins = (eh * 60 + em) - (sh * 60 + sm)
    return mins > 0 ? mins / 60 : null
  }
  const hours = calcHours()
  const estPay = shift?.wage_type === 'hour' && hours ? Math.round(shift.wage_amount * hours) : null

  return (
    <div className="ms-shift-card">
      <div className="ms-shift-banner" style={{ background: bannerBg }}>
        <div className="ms-shift-banner-initials">{initials}</div>
        <span className="ms-shift-banner-biz">{bizName}</span>
      </div>
      <div className="ms-shift-card-body">
        <div className="ms-shift-top">
          <div>
            <div className="ms-shift-title">{shift?.title}</div>
            <div className="ms-shift-location">{shift?.location}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="ms-shift-wage">₹{shift?.wage_amount}<span>/{shift?.wage_type}</span></div>
            {estPay && <div className="ms-shift-est">Est. ₹{estPay}</div>}
          </div>
        </div>
        <div className="ms-shift-pills">
          <span className="ms-shift-pill">📅 {formatDate(shift?.date)}</span>
          <span className="ms-shift-pill">🕐 {formatTime(shift?.start_time)}–{formatTime(shift?.end_time)}</span>
          {hours && <span className="ms-shift-pill">{hours % 1 === 0 ? hours : hours.toFixed(1)} hrs</span>}
        </div>
        <div className="ms-shift-footer">
          <span className="ms-shift-status" style={{ background: st.bg, color: st.color }}>{st.label}</span>
        </div>
      </div>
    </div>
  )
}

function MyShifts() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [userRole, setUserRole] = useState(null)
  const [activeTab, setActiveTab] = useState('Applied Shifts')
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUserRole(user.user_metadata?.role)
      setFirstName((user.user_metadata?.name || '').split(' ')[0])
      fetchApplications(user.id)
    }
    getUser()
  }, [])

  const fetchApplications = async (uid) => {
    setLoading(true)
    const { data } = await supabase
      .from('shift_applications')
      .select('*, shifts(*)')
      .eq('worker_id', uid)
      .order('created_at', { ascending: false })
    setApplications(data || [])
    setLoading(false)
  }

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Tab filtering
  const tabData = {
    'Upcoming Shifts': applications.filter(a => a.status === 'accepted' && a.shifts?.status !== 'cancelled'),
    'Applied Shifts': applications.filter(a => a.status === 'pending'),
    'Completed Shifts': applications.filter(a => a.shifts?.status === 'completed'),
    'Cancelled Shifts': applications.filter(a => a.shifts?.status === 'cancelled' || a.status === 'rejected'),
  }

  const emptyMessages = {
    'Upcoming Shifts': { icon: '📅', title: 'No upcoming shifts', sub: 'Once a business accepts your application, the shift will appear here.', showBrowse: true },
    'Applied Shifts': { icon: '📨', title: "You haven't applied to any shifts yet", sub: 'Once you apply for a shift, it will show up here while you wait for confirmation.', showBrowse: true },
    'Completed Shifts': { icon: '🏁', title: 'No completed shifts yet', sub: "Your completed shifts will appear here once you've worked your first one.", showBrowse: false },
    'Cancelled Shifts': { icon: '❌', title: 'No cancelled shifts', sub: 'Any shifts that were cancelled — either by you or the business — will be listed here.', showBrowse: false },
  }

  const current = emptyMessages[activeTab]
  const currentData = tabData[activeTab]

  const tabCounts = {
    'Upcoming Shifts': tabData['Upcoming Shifts'].length,
    'Applied Shifts': tabData['Applied Shifts'].length,
    'Completed Shifts': tabData['Completed Shifts'].length,
    'Cancelled Shifts': tabData['Cancelled Shifts'].length,
  }

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
                  {tabCounts[tab] > 0 && <span className="ms-tab-count">{tabCounts[tab]}</span>}
                </button>
              ))}
            </div>
            <div className="ms-tab-divider" />
            <div className="ms-tab-content">
              {loading ? (
                <div className="ms-empty"><p className="ms-empty-sub">Loading...</p></div>
              ) : currentData.length === 0 ? (
                <div className="ms-empty">
                  <div className="ms-empty-icon">{current.icon}</div>
                  <h3 className="ms-empty-title">{current.title}</h3>
                  <p className="ms-empty-sub">{current.sub}</p>
                  {current.showBrowse && (
                    <button className="ms-find-btn" onClick={() => navigate('/worker/dashboard')}>Browse Shifts →</button>
                  )}
                </div>
              ) : (
                <div className="ms-shift-list" style={{ alignItems: 'stretch' }}>
                  {currentData.map(app => (
                    <ShiftCard key={app.id} shift={app.shifts} app={app} status={app.status} />
                  ))}
                </div>
              )}
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
