import { useNavigate } from 'react-router-dom'
import logoImg from './assets/logo.png'
import './ContactUs.css'

function ContactUs() {
  const navigate = useNavigate()

  const address = "Flat No.4, Vastupark-B, Ashwin Nagar, Near Mahindra Guest House, Nashik, 422009, Maharashtra"
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

  return (
    <div className="contact-page">
      <nav className="contact-navbar">
        <div className="contact-nav-logo" onClick={() => navigate('/')}>
          <img src={logoImg} alt="QuickWork" className="contact-logo-img" />
          <span className="contact-logo-text">QuickWork</span>
        </div>
        <button className="contact-back-btn" onClick={() => navigate(-1)}>← Back</button>
      </nav>

      <div className="contact-hero">
        <h1 className="contact-title">We're here to <span className="contact-orange">help!</span></h1>
      </div>

      <div className="contact-main">

        <div className="contact-cards">

          <div className="contact-card">
            <div className="contact-card-icon">📞</div>
            <h2 className="contact-card-title">Call Us Directly</h2>
            <p className="contact-card-desc">Speak to our team for immediate help</p>
            <a href="tel:+919521099270" className="contact-card-value">+91 95210 99270</a>
            <div className="contact-card-hours">
              <span className="hours-label">Operating Hours</span>
              <span className="hours-value">Mon – Fri, 9:00 AM – 2:00 PM</span>
            </div>
          </div>

          <div className="contact-card contact-card-featured">
            <div className="contact-card-icon">✉️</div>
            <h2 className="contact-card-title">Write To Us</h2>
            <p className="contact-card-desc">Send us an email and we'll get back to you</p>
            <a href="mailto:abhijeetkotwal87@gmail.com" className="contact-card-value">abhijeetkotwal87@gmail.com</a>
            <div className="contact-card-hours">
              <span className="hours-label">Response Time</span>
              <span className="hours-value">2–3 working days</span>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-card-icon">📍</div>
            <h2 className="contact-card-title">Visit Us On-Site</h2>
            <p className="contact-card-desc">Come visit us at our office in Nashik</p>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="contact-card-value contact-address">
              Flat No.4, Vastupark-B, Ashwin Nagar, Near Mahindra Guest House, Nashik – 422009
            </a>
            <div className="contact-card-hours">
              <span className="hours-label">Operating Hours</span>
              <span className="hours-value">Mon – Fri, 9:00 AM – 2:00 PM</span>
            </div>
          </div>

        </div>

        <div className="contact-map-section">
          <div className="contact-map-card">
            <div className="contact-map-left">
              <div className="contact-map-pin">📍</div>
              <div>
                <h3 className="contact-map-title">Find Us in Nashik</h3>
                <p className="contact-map-address">
                  Flat No.4, Vastupark-B, Ashwin Nagar,<br />
                  Near Mahindra Guest House,<br />
                  Nashik, Maharashtra – 422009
                </p>
                <div className="contact-map-hours">
                  <span>🕘 Mon – Fri &nbsp;|&nbsp; 9:00 AM – 2:00 PM</span>
                </div>
              </div>
            </div>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="contact-map-btn">
              🗺️ Open in Google Maps →
            </a>
          </div>
        </div>


      </div>
    </div>
  )
}

export default ContactUs
