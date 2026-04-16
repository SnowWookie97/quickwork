import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import logoImg from './assets/logo.png'
import './AuthForm.css'

function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleReset = async () => {
    setError('')
    if (!email) { setError('Please enter your email.'); return }
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="auth-page">
      <nav className="role-navbar">
        <div className="nav-logo" onClick={() => navigate('/')}>
          <img src={logoImg} alt="QuickWork" className="logo-img" />
          <span className="logo-text">QuickWork</span>
        </div>
      </nav>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-icon">🔐</div>
          <h1 className="auth-title">Forgot Password?</h1>
          <p className="auth-sub">Enter your email and we'll send you a reset link</p>

          {sent ? (
            <div className="auth-success">
              ✅ Reset link sent! Check your email inbox and follow the link to reset your password.
              <br /><br />
              <button className="auth-btn" onClick={() => navigate('/login')}>
                Back to Login →
              </button>
            </div>
          ) : (
            <div className="auth-form">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="auth-error">{error}</p>}
              <button className="auth-btn" onClick={handleReset} disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link →'}
              </button>
            </div>
          )}

          <p className="auth-back" onClick={() => navigate('/login')}>
            ← Back to Login
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
