import { useNavigate, useLocation } from 'react-router-dom'
import logoImg from './assets/logo.png'
import './RoleSelect.css'

function RoleSelect() {
  const navigate = useNavigate()
  const location = useLocation()
  const mode = location.state?.mode || 'signup'

  const handleSelect = (role) => {
    if (mode === 'login') {
      navigate('/login', { state: { role } })
    } else {
      navigate('/signup', { state: { role } })
    }
  }

  return (
    <div className="role-page">
      <nav className="role-navbar">
        <div className="nav-logo" onClick={() => navigate('/')}>
          <img src={logoImg} alt="QuickWork" className="logo-img" />
          <span className="logo-text">QuickWork</span>
        </div>
      </nav>

      <div className="role-container">
        <h1 className="role-title">Who are you?</h1>
        <p className="role-sub">Choose how you'd like to use QuickWork</p>

        <div className="role-cards">
          <div className="role-card" onClick={() => handleSelect('business')}>
            <div className="role-icon">🏢</div>
            <h2>Business</h2>
            <p>I need flexible workers for my Business</p>
            <button className="role-btn">Continue as Business →</button>
          </div>

          <div className="role-card" onClick={() => handleSelect('worker')}>
            <div className="role-icon">👷</div>
            <h2>Worker</h2>
            <p>I want to find shifts and earn daily</p>
            <button className="role-btn">Continue as Worker →</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleSelect
