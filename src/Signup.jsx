import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './supabase'
import logoImg from './assets/logo.png'
import './AuthForm.css'

const WORKER_INDUSTRIES = [
  'Logistics', 'Retail', 'Hospitality', 'Office', 'Events', 'Delivery', 'Warehouse',
]

const BUSINESS_TYPES = [
  'Hotel / Hospitality',
  'Restaurant',
  'Construction',
  'Farm / Agriculture',
  'Retail / Shop',
  'Logistics / Warehouse',
  'Events',
  'Healthcare',
  'Other',
]

const CITIES = [
  'Nashik',
  'Mumbai',
  'Pune',
  'Nagpur',
  'Aurangabad',
  'Kolhapur',
  'Solapur',
  'Other',
]

function generateCode(userId) {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i)
    hash |= 0
  }
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'QW-'
  let n = Math.abs(hash)
  for (let i = 0; i < 6; i++) {
    code += chars[n % chars.length]
    n = Math.floor(n / chars.length) + (i * 7)
  }
  return code
}

function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const role = location.state?.role || 'worker'

  const [form, setForm] = useState({
    name: '', mobile: '', email: '', password: '',
    industry: '',       // worker only
    businessType: '',   // business only
    city: '',           // business only
  })
  const [wasReferred, setWasReferred] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSignup = async () => {
    setError('')

    if (!form.name || !form.mobile || !form.email || !form.password) {
      setError('Please fill in all fields.'); return
    }
    if (form.mobile.length < 10) {
      setError('Please enter a valid mobile number.'); return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); return
    }
    if (role === 'worker' && !form.industry) {
      setError('Please select your industry.'); return
    }
    if (role === 'business' && !form.businessType) {
      setError('Please select your business type.'); return
    }
    if (role === 'business' && !form.city) {
      setError('Please select your city.'); return
    }
    if (wasReferred && !referralCode.trim()) {
      setError('Please enter the referral code or switch to No.'); return
    }

    if (wasReferred && referralCode.trim()) {
      const { data: refData, error: refError } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referral_code', referralCode.trim().toUpperCase())
        .limit(1)

      if (refError || !refData || refData.length === 0) {
        setError('Invalid referral code. Please check and try again.'); return
      }
    }

    setLoading(true)

    const { data, error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          role,
          name: form.name,
          mobile: form.mobile,
          ...(role === 'worker' && { industry: form.industry }),
          ...(role === 'business' && {
            business_type: form.businessType,
            city: form.city,
          }),
        }
      }
    })

    if (signupError) {
      setLoading(false)
      setError(signupError.message)
      return
    }

    if (data.user) {
      const newCode = generateCode(data.user.id)
      await supabase.from('referrals').insert({
        user_id: data.user.id,
        referral_code: newCode,
        referred_by: wasReferred && referralCode.trim() ? referralCode.trim().toUpperCase() : null,
      })
    }

    setLoading(false)
    setSuccess(true)
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

              {role === 'worker' && (
                <div className="form-group">
                  <label>Industry</label>
                  <select value={form.industry} onChange={update('industry')} className="form-select">
                    <option value="">Select your industry</option>
                    {WORKER_INDUSTRIES.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              )}

              {role === 'business' && (
                <>
                  <div className="form-group">
                    <label>Business Type</label>
                    <select value={form.businessType} onChange={update('businessType')} className="form-select">
                      <option value="">Select your business type</option>
                      {BUSINESS_TYPES.map(bt => (
                        <option key={bt} value={bt}>{bt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>City</label>
                    <select value={form.city} onChange={update('city')} className="form-select">
                      <option value="">Select your city</option>
                      {CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </>
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

              <div className="form-group">
                <label>
                  {role === 'business' ? 'Were you invited by another business?' : 'Were you invited by a friend?'}
                </label>
                <div className="referral-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${!wasReferred ? 'active' : ''}`}
                    onClick={() => { setWasReferred(false); setReferralCode('') }}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${wasReferred ? 'active' : ''}`}
                    onClick={() => setWasReferred(true)}
                  >
                    Yes
                  </button>
                </div>
              </div>

              {wasReferred && (
                <div className="form-group">
                  <label>Enter Referral Code</label>
                  <input
                    type="text"
                    placeholder="e.g. QW-A3F9K2"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    style={{ textTransform: 'uppercase', letterSpacing: '2px' }}
                  />
                </div>
              )}

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
