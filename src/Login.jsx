import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import logoImg from './assets/logo.png'
import './AuthForm.css'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    // Check blacklist before redirecting
    const { data: profile } = await supabase.from('profiles').select('is_blacklisted').eq('id', data.user.id).single()
    if (profile?.is_blacklisted) {
      window.location.replace('/blacklisted')
      return
    }

    const role = data.user?.user_metadata?.role
    if (role === 'business') {
      navigate('/business/dashboard')
    } else {
      navigate('/worker/dashboard')
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
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Log in to your QuickWork account</p>

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
            <button className="auth-btn" onClick={handleLogin} disabled={loading}>
              {loading ? 'Logging in...' : 'Log In →'}
            </button>
          </div>

          <p className="forgot-password" onClick={() => navigate('/forgot-password')}>
            Forgot your password?
          </p>

          <p className="auth-switch">
            Don't have an account?{' '}
            <span onClick={() => navigate('/role', { state: { mode: 'signup' } })}>Sign up</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
