import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import DashNav from './DashNav'
import './Dashboard.css'

function UnderConstruction() {
  const navigate = useNavigate()
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserRole(user.user_metadata?.role)
    }
    getUser()
  }, [])

  return (
    <div className="dashboard-page">
      <DashNav userRole={userRole} />

      <div className="dash-container">
        <div className="dash-card">
          <div className="dash-emoji">🚧</div>
          <h1 className="dash-title">Under Construction!</h1>
          <p className="dash-sub">This section is being built. Check back soon — we're working hard to get it ready!</p>

          <div className="construction-scene">
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
              <span className="worker w1">👷</span>
              <span className="worker w2">🔨</span>
              <span className="worker w3">👷‍♀️</span>
            </div>
          </div>

          <div className="dash-badge">⚡ Coming Soon</div>
        </div>
      </div>
    </div>
  )
}

export default UnderConstruction
