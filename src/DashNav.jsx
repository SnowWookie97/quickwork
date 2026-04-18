import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import logoImg from './assets/logo.png'
import './DashNav.css'

function DashNav({ userRole, onInvite }) {
  const navigate = useNavigate()
  const [dashDropdown, setDashDropdown] = useState(false)
  const [profileDropdown, setProfileDropdown] = useState(false)
  const dashRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (dashRef.current && !dashRef.current.contains(e.target)) setDashDropdown(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileDropdown(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogoClick = () => {
    if (userRole === 'business') navigate('/business/dashboard')
    else if (userRole === 'worker') navigate('/worker/dashboard')
    else navigate('/')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const dashMenuItems = ['My Shifts', 'Payments', 'Ratings']
  const profileMenuItems = ['Update Profile', 'Validation', 'Invite Friends', 'Contact Us', 'Feedback', 'Settings', 'Log Out']

  return (
    <nav className="dashnav">
      <div className="dashnav-logo" onClick={handleLogoClick}>
        <img src={logoImg} alt="QuickWork" className="dashnav-logo-img" />
        <span className="dashnav-logo-text">QuickWork</span>
      </div>

      <div className="dashnav-right">
        <div className="dashnav-item" ref={dashRef}>
          <button className="dashnav-btn" onClick={() => { setDashDropdown(!dashDropdown); setProfileDropdown(false) }}>
            My Dashboard <span className="dashnav-chevron">{dashDropdown ? '▲' : '▼'}</span>
          </button>
          {dashDropdown && (
            <div className="dashnav-dropdown">
              {dashMenuItems.map(item => (
                <div key={item} className="dashnav-dropdown-item" onClick={() => {
                  setDashDropdown(false)
                  if (item === 'My Shifts') navigate('/my-shifts')
                  else navigate('/under-construction')
                }}>
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashnav-item" ref={profileRef}>
          <button className="dashnav-btn profile-btn" onClick={() => { setProfileDropdown(!profileDropdown); setDashDropdown(false) }}>
            <span className="dashnav-avatar">👤</span>
            My Profile <span className="dashnav-chevron">{profileDropdown ? '▲' : '▼'}</span>
          </button>
          {profileDropdown && (
            <div className="dashnav-dropdown">
              {profileMenuItems.map(item => (
                <div
                  key={item}
                  className={`dashnav-dropdown-item ${item === 'Log Out' ? 'logout-item' : ''} ${item === 'Invite Friends' ? 'invite-item' : ''}`}
                  onClick={() => {
                    setProfileDropdown(false)
                    if (item === 'Log Out') handleLogout()
                    else if (item === 'Contact Us') navigate('/contact')
                    else if (item === 'Feedback') navigate('/feedback')
                    else if (item === 'Invite Friends') { if (onInvite) onInvite() }
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
  )
}

export default DashNav
