import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import logoImg from './assets/logo.png'
import './DashNav.css'

const SHIELD_DATA = [
  { fill: "#e8e8e8", stroke: "#bbb", stroke2: "#ddd", numColor: "#777" },
  { fill: "#C0DD97", stroke: "#3B6D11", stroke2: "#639922", numColor: "#173404" },
  { fill: "#c8e6f8", stroke: "#378ADD", stroke2: "#85B7EB", numColor: "#0C447C" },
  { fill: "#FFD700", stroke: "#B8860B", stroke2: "#FFE55C", numColor: "#5a3e00" }
]

function MiniShield({ level }) {
  const d = SHIELD_DATA[level - 1]
  const isPremium = level >= 3
  if (isPremium) {
    return (
      <svg width="20" height="22" viewBox="0 0 48 52" style={{ flexShrink: 0 }}>
        <path d="M24 2 L43 9 L43 28 C43 40 24 49 24 49 C24 49 5 40 5 28 L5 9 Z" fill="none" stroke={d.stroke} strokeWidth={level === 4 ? "4" : "3"} opacity="0.2"/>
        <path d="M24 4 L41 10.5 L41 28 C41 39 24 47 24 47 C24 47 7 39 7 28 L7 10.5 Z" fill={d.fill} stroke={d.stroke} strokeWidth="2.5"/>
        <path d="M24 9 L36 14.5 L36 27 C36 35.5 24 42 24 42 C24 42 12 35.5 12 27 L12 14.5 Z" fill="none" stroke={d.stroke2} strokeWidth="1.2" opacity="0.8"/>
        <text x="24" y="33" textAnchor="middle" fontSize="16" fill={d.numColor} fontWeight="700" fontFamily="sans-serif">{level}</text>
      </svg>
    )
  }
  return (
    <svg width="20" height="22" viewBox="0 0 44 48" style={{ flexShrink: 0 }}>
      <path d="M22 3 L39 9.5 L39 26 C39 37 22 45 22 45 C22 45 5 37 5 26 L5 9.5 Z" fill={d.fill} stroke={d.stroke} strokeWidth="2"/>
      <path d="M22 8 L34 13 L34 25 C34 33.5 22 40 22 40 C22 40 10 33.5 10 25 L10 13 Z" fill="none" stroke={d.stroke2} strokeWidth="1" opacity="0.6"/>
      <text x="22" y="30" textAnchor="middle" fontSize="16" fill={d.numColor} fontWeight="700" fontFamily="sans-serif">{level}</text>
    </svg>
  )
}

function DashNav({ userRole, onHomepage, trustLevel: trustLevelProp }) {
  const navigate = useNavigate()
  const [dashDropdown, setDashDropdown] = useState(false)
  const [profileDropdown, setProfileDropdown] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [trustLevel, setTrustLevel] = useState(() => {
    const c = localStorage.getItem('qw_trust_level')
    return trustLevelProp || (c ? parseInt(c) : 1)
  })
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('qw_is_admin') === 'true'
  })
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
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: refData } = await supabase.from('referrals').select('referral_code').eq('user_id', user.id).single()
      if (refData) setReferralCode(refData.referral_code)
      const { data: profileData } = await supabase.from('profiles').select('trust_level, is_admin').eq('id', user.id).single()
      if (profileData) {
        setTrustLevel(profileData.trust_level)
        localStorage.setItem('qw_trust_level', profileData.trust_level)
        const admin = profileData.is_admin === true
        setIsAdmin(admin)
        localStorage.setItem('qw_is_admin', admin)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (trustLevelProp) setTrustLevel(trustLevelProp)
  }, [trustLevelProp])

  const handleLogoClick = () => {
    if (userRole === 'business') navigate('/business/dashboard')
    else if (userRole === 'worker') navigate('/worker/dashboard')
    else navigate('/')
  }

  const handleLogout = async () => {
    localStorage.removeItem('qw_is_admin')
    localStorage.removeItem('qw_trust_level')
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
    { label: 'ACCOUNT', items: ['My Profile', 'Validation', 'Settings'] },
    { label: 'FROM QUICKWORK', items: ['Invite Friends', 'Contact Us', 'Insurance', 'FAQ', 'Feedback'] },
    { label: 'LEGAL', items: ['Privacy Policy', 'Terms and Conditions'] }
  ]

  const handleProfileItem = (item) => {
    setProfileDropdown(false)
    if (item === 'Log Out') handleLogout()
    else if (item === 'Contact Us') navigate('/contact')
    else if (item === 'Feedback') navigate('/feedback')
    else if (item === 'FAQ') navigate('/faq')
    else if (item === 'Validation') navigate('/validation')
    else if (item === 'Invite Friends') setShowInviteModal(true)
    else navigate('/under-construction')
  }

  const renderItem = (item) => {
    if (item === 'Invite Friends') return <><span>🎉 Invite Friends</span></>
    if (item === 'Validation') return <>{trustLevel && <MiniShield level={trustLevel} />}<span>Validation</span></>
    return <span>{item}</span>
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
          {isAdmin && (
            <button className="dashnav-btn admin-btn" onClick={() => navigate('/admin')}>
              Admin
            </button>
          )}

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
                        {renderItem(item)}
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
