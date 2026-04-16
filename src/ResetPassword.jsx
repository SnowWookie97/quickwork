import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import logoImg from './assets/logo.png'
import './AuthForm.css'

function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleReset = async () => {
    setError('')
    if (!password || !confirm) { setError('Please fill in both fields.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setDone(true)
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
          <div className="auth-icon">🔑</div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-sub">Enter your new password below</p>

          {done ? (
            <div className="auth-success">
              ✅ Password updated successfully!
              <br /><br />
              <button className="auth-btn" onClick={() => navigate('/login')}>
                Log In →
              </button>
            </div>
          ) : (
            <div className="auth-form">
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              {error && <p className="auth-error">{error}</p>}
              <button className="auth-btn" onClick={handleReset} disabled={loading}>
                {loading ? 'Updating...' : 'Update Password →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
