import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import logoImg from './assets/logo.png'
import './Feedback.css'

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(null)
  const display = hovered !== null ? hovered : value

  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const fillFull = display >= star
        const fillHalf = display >= star - 0.5 && display < star
        return (
          <div key={star} className="star-wrap" onMouseLeave={() => setHovered(null)}>
            <div className="star-zone left" onMouseEnter={() => setHovered(star - 0.5)} onClick={() => onChange(star - 0.5)} />
            <div className="star-zone right" onMouseEnter={() => setHovered(star)} onClick={() => onChange(star)} />
            <svg className="star-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <defs><clipPath id={`half-${star}`}><rect x="0" y="0" width="12" height="24" /></clipPath></defs>
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#e0e0e0" stroke="#e0e0e0" strokeWidth="1" />
              {fillFull && <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#E8470F" stroke="#E8470F" strokeWidth="1" />}
              {fillHalf && <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill="#E8470F" stroke="#E8470F" strokeWidth="1" clipPath={`url(#half-${star})`} />}
            </svg>
          </div>
        )
      })}
      <span className="star-value">{display > 0 ? `${display} / 5` : 'Tap to rate'}</span>
    </div>
  )
}

function Feedback() {
  const navigate = useNavigate()
  const [userRole, setUserRole] = useState(null)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [cooldownMsg, setCooldownMsg] = useState(null)
  const [checking, setChecking] = useState(true)

  const [form, setForm] = useState({
    q1: '', q2: '', q3: '', q4Rating: 0, q4Comment: '',
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUserId(user.id)
      setUserRole(user.user_metadata?.role)
      setUserName(user.user_metadata?.name || '')
      setUserEmail(user.email || '')

      // Check 2-week cooldown
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      const { data } = await supabase
        .from('feedback')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', twoWeeksAgo)
        .order('created_at', { ascending: false })
        .limit(1)

      if (data && data.length > 0) {
        const lastSubmitted = new Date(data[0].created_at)
        const nextAllowed = new Date(lastSubmitted.getTime() + 14 * 24 * 60 * 60 * 1000)
        const daysLeft = Math.ceil((nextAllowed - Date.now()) / (1000 * 60 * 60 * 24))
        setCooldownMsg(`You've already submitted feedback recently. You can submit again in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}.`)
      }
      setChecking(false)
    }
    getUser()
  }, [])

  const handleLogoClick = () => {
    if (userRole === 'business') navigate('/business/dashboard')
    else if (userRole === 'worker') navigate('/worker/dashboard')
    else navigate('/')
  }

  const handleSubmit = async () => {
    if (cooldownMsg) return
    setLoading(true)
    const { error } = await supabase.from('feedback').insert({
      user_id: userId,
      user_name: userName,
      user_email: userEmail,
      user_role: userRole,
      q1_improvement: form.q1 || null,
      q2_likes: form.q2 || null,
      q3_challenges: form.q3 || null,
      q4_business_rating: form.q4Rating || null,
      q4_business_comment: form.q4Comment || null,
    })
    setLoading(false)
    if (!error) setShowModal(true)
  }

  if (checking) return null

  return (
    <div className="fb-page">

      {/* THANK YOU MODAL */}
      {showModal && (
        <div className="fb-modal-overlay">
          <div className="fb-modal">
            <div className="fb-modal-emoji">🙏</div>
            <h2 className="fb-modal-title">Thank you for your feedback!</h2>
            <p className="fb-modal-sub">We take every piece of feedback seriously. You may even hear back from us!</p>
            <div className="fb-modal-confetti">🎉</div>
            <button className="fb-submit-btn" onClick={handleLogoClick}>← Back to Dashboard</button>
          </div>
        </div>
      )}

      <nav className="fb-navbar">
        <div className="fb-nav-logo" onClick={handleLogoClick}>
          <img src={logoImg} alt="QuickWork" className="fb-logo-img" />
          <span className="fb-logo-text">QuickWork</span>
        </div>
        <button className="fb-back-btn" onClick={() => navigate(-1)}>← Back</button>
      </nav>

      <div className="fb-body">

        {/* LEFT — FORM */}
        <div className="fb-left">
          <div className="fb-hero">
            <h1 className="fb-title">Share your <span className="fb-orange">feedback</span></h1>
            <p className="fb-sub">Help us make QuickWork better for everyone</p>
          </div>

          <div className="fb-form">
            <div className="fb-section">
              <label className="fb-label">💡 What can we improve?</label>
              <textarea className="fb-textarea" placeholder="Tell us what could be better..." value={form.q1} onChange={(e) => setForm({ ...form, q1: e.target.value })} disabled={!!cooldownMsg} />
            </div>

            <div className="fb-section">
              <label className="fb-label">❤️ What do you like about QuickWork?</label>
              <textarea className="fb-textarea" placeholder="What's working well for you..." value={form.q2} onChange={(e) => setForm({ ...form, q2: e.target.value })} disabled={!!cooldownMsg} />
            </div>

            <div className="fb-section">
              <label className="fb-label">⚠️ What are the most common challenges you face?</label>
              <textarea className="fb-textarea" placeholder="Any pain points or frustrations..." value={form.q3} onChange={(e) => setForm({ ...form, q3: e.target.value })} disabled={!!cooldownMsg} />
            </div>

            <div className="fb-section">
              <label className="fb-label">🏢 How reliable and professional are the businesses on the platform?</label>
              <StarRating value={form.q4Rating} onChange={(v) => !cooldownMsg && setForm({ ...form, q4Rating: v })} />
              <textarea className="fb-textarea fb-textarea-sm" placeholder="Optional — elaborate if you'd like..." value={form.q4Comment} onChange={(e) => setForm({ ...form, q4Comment: e.target.value })} disabled={!!cooldownMsg} />
            </div>

            {cooldownMsg ? (
              <div className="fb-cooldown-error">{cooldownMsg}</div>
            ) : (
              <button className="fb-submit-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Feedback →'}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT — NOTICE */}
        <div className="fb-right">
          <div className="fb-notice">
            <div className="fb-notice-icon">📋</div>
            <h3 className="fb-notice-title">A note on feedback</h3>
            <p className="fb-notice-text">
              We genuinely read and act on every submission. To keep feedback meaningful, each user may submit once every <strong>2 weeks</strong>.
            </p>
            <p className="fb-notice-text">
              This space is for honest criticism, suggestions, and praise that help us improve QuickWork for everyone.
            </p>
            <div className="fb-notice-divider" />
            <p className="fb-notice-urgent">
              <strong>Have an urgent concern?</strong><br />
              For complaints or issues that need immediate attention, please reach out directly through our{' '}
              <span className="fb-notice-link" onClick={() => navigate('/contact')}>Contact Us</span> page.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Feedback
