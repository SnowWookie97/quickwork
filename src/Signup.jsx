import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './supabase'
import logoImg from './assets/logo.png'
import './AuthForm.css'

function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = location.state?.role || 'worker'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSignup = async () => {
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role }
      }
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
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
          <span className="auth-role-badge">
            {role === 'business' ? '🏢 Business' : '👷 Worker'}
          </span>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-sub">Join QuickWork for free today</p>

          {success ? (
            <div className="auth-success">
              ✅ Account created! Check your email to confirm your account, then log in.
              <br /><br />
              <button className="auth-btn" onClick={() => navigate('/login', { state: { role } })}>
                Go to Login →
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
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="auth-error">{error}</p>}
              <button className="auth-btn" onClick={handleSignup} disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>
            </div>
          )}

          <p className="auth-switch">
            Already have an account?{' '}
            <span onClick={() => navigate('/login', { state: { role } })}>Log in</span>
          </p>
          <p className="auth-back" onClick={() => navigate('/role', { state: { mode: 'signup' } })}>
            ← Change role
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
