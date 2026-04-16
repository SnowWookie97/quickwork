import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './supabase'
import logoImg from './assets/logo.png'
import './AuthForm.css'

const INDUSTRIES = [
  'Logistics',
  'Retail',
  'Hospitality',
  'Office',
  'Events',
  'Delivery',
  'Warehouse',
]

function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = location.state?.role || 'worker'

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    industry: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSignup = async () => {
    setError('')

    // Basic validation
    if (!form.name || !form.mobile || !form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    if (form.mobile.length < 10) {
      setError('Please enter a valid mobile number.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (role === 'business' && !form.industry) {
      setError('Please select your industry.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          role,
          name: form.name,
          mobile: form.mobile,
          ...(role === 'business' && { industry: form.industry }),
        }
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
              ✅ Account created successfully! You can now log in.
              <br /><br />
              <button className="auth-btn" onClick={() => navigate('/login')}>
                Go to Login →
              </button>
            </div>
          ) : (
            <div className="auth-form">
              <div className="form-group">
                <label>{role === 'business' ? 'Business Name' : 'Full Name'}</label>
                <input
                  type="text"
                  placeholder={role === 'business' ? 'Your business name' : 'Your full name'}
                  value={form.name}
                  onChange={update('name')}
                />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <div className="phone-input">
                  <span className="phone-prefix">🇮🇳 +91</span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={form.mobile}
                    onChange={update('mobile')}
                    maxLength={10}
                  />
                </div>
              </div>
              {role === 'business' && (
                <div className="form-group">
                  <label>Industry</label>
                  <select value={form.industry} onChange={update('industry')} className="form-select">
                    <option value="">Select your industry</option>
                    {INDUSTRIES.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={update('email')}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={update('password')}
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
            <span onClick={() => navigate('/login')}>Log in</span>
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
