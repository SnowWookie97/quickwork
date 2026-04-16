import heroImg from './assets/hero.png'
import logoImg from './assets/logo.png'
import { useNavigate } from 'react-router-dom'
import './App.css'

function App() {
  const navigate = useNavigate()

  return (
    <div className="qw-app">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="nav-logo">
            <img src={logoImg} alt="QuickWork" className="logo-img" />
            <span className="logo-text">QuickWork</span>
          </div>
          
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-left">
            <h1 className="hero-heading">
              Find a shift.<br />
              Complete it.<br />
              <span className="hero-orange">Get Paid.</span>
            </h1>
            <p className="hero-sub">Yes! It's that easy!</p>
            <button className="btn-primary" onClick={() => navigate('/role', { state: { mode: 'signup' } })}>
              GET STARTED FREE →
            </button>
            <div className="hero-login">
              <span>Already have an account?</span>
              <button className="btn-login-hero" onClick={() => navigate('/login')}>
                Log In
              </button>
            </div>
          </div>
          <div className="hero-right">
            <h2 className="hero-platform-title">INDIA'S FASTEST JOB PLATFORM</h2>
            <img src={heroImg} alt="QuickWork platform" className="hero-img" />
          </div>
        </div>
      </section>

      {/* WHAT IS QUICKWORK */}
      <section className="what-section">
        <div className="what-inner">
          <div className="what-badges">
            <span className="what-badge">✔ Free to Join</span>
            <span className="what-badge">✔ Daily &amp; Weekly Payouts</span>
            <span className="what-badge">✔ Verified Process</span>
          </div>
          <h2 className="section-title orange">What is QuickWork?</h2>
          <div className="what-content">
            <p>QuickWork is India's shift marketplace — built for businesses that need reliable flexible staff, and for individuals who want flexible, well-paying work on their own terms.</p>
            <p>Businesses post a shift. Workers apply. The best fit gets confirmed. Payment is processed automatically on the same day via UPI.</p>
            <p className="what-highlight">No agencies. No paperwork. No waiting.</p>
            <p>Post a shift in minutes. Find work near you. Get paid the same day.</p>
          </div>
          <p className="what-tagline"><em>QuickWork — Puts You to Work.</em></p>
        </div>
      </section>

      {/* BROWSE BY CATEGORY */}
      <section className="categories-section">
        <div className="section-inner">
          <h2 className="section-title dark">Browse by Category</h2>
          <p className="section-sub">Thousands of daily shifts across 7 industries</p>
          <div className="categories-grid">
            {[
              { icon: '📦', label: 'Logistics' },
              { icon: '🛍️', label: 'Retail' },
              { icon: '🍽️', label: 'Hospitality' },
              { icon: '🖥️', label: 'Office' },
              { icon: '⭐', label: 'Events' },
              { icon: '🚚', label: 'Delivery' },
              { icon: '🏭', label: 'Warehouse' },
            ].map((cat) => (
              <div className="category-card" key={cat.label}>
                <span className="cat-icon">{cat.icon}</span>
                <span className="cat-label">{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section">
        <div className="section-inner">
          <h2 className="section-title dark">How QuickWork Works</h2>
          <p className="section-sub">Start earning in 3 simple steps</p>
          <div className="steps-grid">
            <div className="step-card">
              <span className="step-number">01</span>
              <div className="step-icon">⭐</div>
              <h3>Create Your Profile</h3>
              <p>Sign up in minutes with your basic details and choose your role — Worker or Employer.</p>
            </div>
            <div className="step-card">
              <span className="step-number">02</span>
              <div className="step-icon">📍</div>
              <h3>Browse &amp; Apply</h3>
              <p>Explore shifts across 7 industries. Filter by location, category, and date. Apply instantly.</p>
            </div>
            <div className="step-card">
              <span className="step-number">03</span>
              <div className="step-icon">₹</div>
              <h3>Work &amp; Earn</h3>
              <p>Show up, complete your shift, and receive payment directly to your account the same day.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="cta-section">
        <h2>Ready to start earning?</h2>
        <button className="btn-cta" onClick={() => navigate('/role', { state: { mode: 'signup' } })}>
          Create a Free Account →
        </button>
        <p className="cta-sub">Have Questions? <a href="mailto:hello@quickwork.in">Contact us</a></p>
      </section>

    </div>
  )
}

export default App
