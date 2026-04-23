import logoImg from './assets/logo.png'
import './Blacklisted.css'

function Blacklisted() {
  return (
    <div className="bl-page">

      {/* LOGO */}
      <div className="bl-logo">
        <img src={logoImg} alt="QuickWork" className="bl-logo-img" />
        <span className="bl-logo-text">QuickWork</span>
      </div>

      {/* NOTICE */}
      <div className="bl-center">
        <div className="bl-icon">🚫</div>
        <h1 className="bl-title">Your account has been temporarily disabled.</h1>
        <p className="bl-sub">This account has been restricted from accessing QuickWork. If you believe this is a mistake or wish to reactivate your account, please get in touch with us.</p>

        {/* CONTACT CARDS */}
        <div className="bl-cards">
          <div className="bl-card">
            <div className="bl-card-icon">📞</div>
            <div className="bl-card-title">Call Us</div>
            <div className="bl-card-value">+91 95210 99270</div>
            <div className="bl-card-hours">Mon – Fri, 9:00 AM – 2:00 PM</div>
          </div>

          <div className="bl-card">
            <div className="bl-card-icon">✉️</div>
            <div className="bl-card-title">Write To Us</div>
            <div className="bl-card-value">abhijeetkotwal87@gmail.com</div>
            <div className="bl-card-hours">Response: 2–3 working days</div>
          </div>

          <div className="bl-card">
            <div className="bl-card-icon">📍</div>
            <div className="bl-card-title">Visit Us</div>
            <div className="bl-card-value">Flat No.4, Vastupark-B, Ashwin Nagar, Near Mahindra Guest House, Nashik – 422009</div>
            <div className="bl-card-hours">Mon – Fri, 9:00 AM – 2:00 PM</div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Blacklisted
