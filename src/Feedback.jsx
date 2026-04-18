import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import logoImg from './assets/logo.png'
import './Feedback.css'

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(null)

  const stars = [1, 2, 3, 4, 5]
  const halfStars = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

  const display = hovered !== null ? hovered : value

  return (
    <div className="star-rating">
      {stars.map((star) => {
        const full = display >= star
        const half = display >= star - 0.5 && display < star
        return (
          <div key={star} className="star-wrapper">
            {/* Left half */}
            <div
              className="star-half left"
              onMouseEnter={() => setHovered(star - 0.5)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onChange(star - 0.5)}
            />
            {/* Right half */}
            <div
              className="star-half right"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onChange(star)}
            />
            <span className={`star-icon ${full ? 'full' : half ? 'half' : 'empty'}`}>
              {full ? '★' : half ? '⭐' : '☆'}
            </span>
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
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    q1: '',
    q2: '',
    q3: '',
    q4Rating: 0,
    q4Comment: '',
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUserId(user.id)
      setUserRole(user.user_metadata?.role)
      setUserName(user.user_metadata?.name || '')
      setUserEmail(user.email || '')
    }
    getUser()
  }, [])

  const handleLogoClick = () => {
    if (userRole === 'business') navigate('/business/dashboard')
    else if (userRole === 'worker') navigate('/worker/dashboard')
    else navigate('/')
  }

  const handleSubmit = async () => {
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
    if (!error) setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="fb-page">
        <nav className="fb-navbar">
          <div className="fb-nav-logo" onClick={handleLogoClick}>
            <img src={logoImg} alt="QuickWork" className="fb-logo-img" />
            <span className="fb-logo-text">QuickWork</span>
          </div>
          <button className="fb-back-btn" onClick={() => navigate(-1)}>← Back</button>
        </nav>
        <div className="fb-thankyou">
          <div className="fb-ty-emoji">🙏</div>
          <h1 className="fb-ty-title">Thank you for your feedback!</h1>
          <p className="fb-ty-sub">We take every piece of feedback seriously. You may even hear back from us!</p>
          <div className="fb-ty-gif">
            <span style={{ fontSize: '80px' }}>🎉</span>
          </div>
          <button className="fb-submit-btn" onClick={handleLogoClick}>← Back to Dashboard</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fb-page">
      <nav className="fb-navbar">
        <div className="fb-nav-logo" onClick={handleLogoClick}>
          <img src={logoImg} alt="QuickWork" className="fb-logo-img" />
          <span className="fb-logo-text">QuickWork</span>
        </div>
        <button className="fb-back-btn" onClick={() => navigate(-1)}>← Back</button>
      </nav>

      <div className="fb-body">

        <div className="fb-hero">
          <h1 className="fb-title">Share your <span className="fb-orange">feedback</span></h1>
          <p className="fb-sub">Help us make QuickWork better for everyone</p>
        </div>

        <div className="fb-form">

          {/* Q1 */}
          <div className="fb-section">
            <label className="fb-label">💡 What can we improve?</label>
            <textarea
              className="fb-textarea"
              placeholder="Tell us what could be better..."
              value={form.q1}
              onChange={(e) => setForm({ ...form, q1: e.target.value })}
            />
          </div>

          {/* Q2 */}
          <div className="fb-section">
            <label className="fb-label">❤️ What do you like about QuickWork?</label>
            <textarea
              className="fb-textarea"
              placeholder="What's working well for you..."
              value={form.q2}
              onChange={(e) => setForm({ ...form, q2: e.target.value })}
            />
          </div>

          {/* Q3 */}
          <div className="fb-section">
            <label className="fb-label">⚠️ What are the most common challenges you face?</label>
            <textarea
              className="fb-textarea"
              placeholder="Any pain points or frustrations..."
              value={form.q3}
              onChange={(e) => setForm({ ...form, q3: e.target.value })}
            />
          </div>

          {/* Q4 */}
          <div className="fb-section">
            <label className="fb-label">🏢 How reliable and professional are the businesses on the platform?</label>
            <StarRating value={form.q4Rating} onChange={(v) => setForm({ ...form, q4Rating: v })} />
            <textarea
              className="fb-textarea fb-textarea-sm"
              placeholder="Optional — elaborate if you'd like..."
              value={form.q4Comment}
              onChange={(e) => setForm({ ...form, q4Comment: e.target.value })}
            />
          </div>

          <button className="fb-submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Feedback →'}
          </button>

        </div>
      </div>
    </div>
  )
}

export default Feedback
