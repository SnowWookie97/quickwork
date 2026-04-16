import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import logoImg from './assets/logo.png'
import './Dashboard.css'

function BusinessDashboard() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="dashboard-page">
      <nav className="dash-navbar">
        <div className="nav-logo" onClick={() => navigate('/')}>
          <img src={logoImg} alt="QuickWork" className="logo-img" />
          <span className="logo-text">QuickWork</span>
        </div>
        <button className="dash-logout" onClick={handleLogout}>Log Out</button>
      </nav>

      <div className="dash-container">
        <div className="dash-card">
          <div className="dash-emoji">🏢</div>
          <h1 className="dash-title">Under Construction,<br />Dear Entrepreneur!</h1>
          <p className="dash-sub">Your business dashboard is being built with the same hustle you bring every day. We'll be ready before you know it!</p>

          <div className="construction-scene business-scene">
            <div className="building">
              <div className="floor f5"></div>
              <div className="floor f4"></div>
              <div className="floor f3 active"></div>
              <div className="floor f2 done"></div>
              <div className="floor f1 done"></div>
              <div className="ground"></div>
            </div>
            <div className="crane">
              <div className="crane-arm"></div>
              <div className="crane-rope"></div>
              <div className="crane-hook">🏗️</div>
            </div>
            <div className="workers">
              <span className="worker w1">👔</span>
              <span className="worker w2">📋</span>
              <span className="worker w3">💼</span>
            </div>
          </div>

          <div className="dash-badge">🏢 Business Dashboard — Coming Soon</div>
        </div>
      </div>
    </div>
  )
}

export default BusinessDashboard
