import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import logoImg from './assets/logo.png'
import './DashNav.css'

function DashNav({ userRole, onHomepage }) {
  const navigate = useNavigate()
  const [dashDropdown, setDashDropdown] = useState(false)
  const [profileDropdown, setProfileDropdown] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [copied, setCopied] = useState(false)
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

  useEffect(() => {
    const fetchReferral = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('referrals').select('referral_code').eq('user_id', user.id).single()
      if (data) setReferralCode(data.referral_code)
    }
    fetchReferral()
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

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const dashMenuItems = ['Homepage', 'My Shifts', 'Payments', 'Ratings']

  const profileGroups = [
    {
      label: 'ACCOUNT',
      items: ['My Profile', 'Validation', 'Settings']
    },
    {
      label: 'FROM QUICKWORK',
      items: ['Invite Friends', 'Contact Us', 'Insurance', 'FAQ', 'Feedback']
    },
    {
      label: 'LEGAL',
      items: ['Privacy Policy', 'Terms and Conditions']
    }
  ]

  const handleProfileItem = (item) => {
    setProfileDropdown(false)
    if (item === 'Log Out') handleLogout()
    else if (item === 'Contact Us') navigate('/contact')
    else if (item === 'Feedback') navigate('/feedback')
    else if (item === 'FAQ') navigate('/faq')
    else if (item === 'Invite Friends') setShowInviteModal(true)
    else navigate('/under-construction')
  }

  return (
    <>
      {showInviteModal && (
        <div className="dashnav-invite-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="dashnav-invite-modal" onClick={(e) => e.stopPropagation()}>
            <button className="dashnav-invite-close" onClick={() => setShowInviteModal(false)}>✕</button>
            <div className="dashnav-invite-icon">🎉</div>
            <h2 className="dashnav-invite-title">Invite Friends to QuickWork</h2>
            <p className="dashnav-invite-sub">Share your unique referral code with friends. When they sign up using your code, they'll be linked to you!</p>
            <div className="dashnav-invite-code-box">
              <span className="dashnav-invite-code">{referralCode || 'Loading...'}</span>
              <button className="dashnav-invite-copy-btn" onClick={handleCopy}>{copied ? '✅ Copied!' : 'Copy'}</button>
            </div>
            <p className="dashnav-invite-note">Your friends can enter this code during signup under "Were you invited by a friend?"</p>
          </div>
        </div>
      )}

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
                    if (item === 'Homepage') { if (onHomepage) onHomepage(); else navigate('/worker/dashboard') }
                    else if (item === 'My Shifts') navigate('/my-shifts')
                    else if (item === 'Payments') navigate('/payments')
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
              My Account <span className="dashnav-chevron">{profileDropdown ? '▲' : '▼'}</span>
            </button>
            {profileDropdown && (
              <div className="dashnav-dropdown dashnav-dropdown-grouped">
                {profileGroups.map((group, gi) => (
                  <div key={gi} className="dashnav-group">
                    <div className="dashnav-group-label">{group.label}</div>
                    {group.items.map(item => (
                      <div
                        key={item}
                        className={`dashnav-dropdown-item ${item === 'Invite Friends' ? 'invite-item' : ''}`}
                        onClick={() => handleProfileItem(item)}
                      >
                        {item === 'Invite Friends' ? '🎉 Invite Friends' : item}
                      </div>
                    ))}
                  </div>
                ))}
                <div className="dashnav-group">
                  <div className="dashnav-dropdown-item logout-item" onClick={() => handleProfileItem('Log Out')}>
                    Log Out
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}

export default DashNav
