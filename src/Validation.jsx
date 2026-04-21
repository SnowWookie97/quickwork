import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import DashNav from './DashNav'
import './Validation.css'

const LEVELS = [
  {
    num: 1, name: "Signed Up", sub: "Basic access",
    description: "You have registered with email, password and OTP verification. You can browse and apply for shifts immediately.",
    how: "Automatic on signup — no action needed.",
    fill: "#e8e8e8", stroke: "#bbb", stroke2: "#ddd", labelColor: "#999", numColor: "#777",
    premium: false
  },
  {
    num: 2, name: "ID Verified", sub: "Aadhaar confirmed",
    description: "Submit your Aadhaar card for identity verification. Businesses will see your confirmed identity and trust you more.",
    how: "Submit a clear photo of your Aadhaar card via the Contact Us page. Our team will verify it within 1–2 business days.",
    fill: "#C0DD97", stroke: "#3B6D11", stroke2: "#639922", labelColor: "#27500A", numColor: "#173404",
    premium: false
  },
  {
    num: 3, name: "Address Verified", sub: "Location confirmed",
    description: "A QuickWork team member will visit and verify your home address. This makes you accountable and reachable for businesses.",
    how: "Once ID verified, request an address visit via the Contact Us page. A team member will schedule a visit within 3–5 business days.",
    fill: "#c8e6f8", stroke: "#378ADD", stroke2: "#85B7EB", labelColor: "#185FA5", numColor: "#0C447C",
    premium: true
  },
  {
    num: 4, name: "Police Cleared", sub: "Gold — highest trust",
    description: "Submit a valid police clearance certificate. This is the highest trust level on QuickWork and unlocks premium shift opportunities.",
    how: "Obtain a Police Clearance Certificate from your local police station and submit it via the Contact Us page.",
    fill: "#FFD700", stroke: "#B8860B", stroke2: "#FFE55C", labelColor: "#7a5a00", numColor: "#5a3e00",
    premium: true
  }
]

function ShieldSVG({ level, size = 52 }) {
  const d = LEVELS[level - 1]

  if (d.premium) {
    const w = size, h = Math.round(size * 1.1)
    return (
      <svg width={w} height={h} viewBox="0 0 48 52">
        <path d="M24 2 L43 9 L43 28 C43 40 24 49 24 49 C24 49 5 40 5 28 L5 9 Z"
          fill="none" stroke={d.stroke} strokeWidth={level === 4 ? "4" : "3"} opacity="0.2"/>
        <path d="M24 4 L41 10.5 L41 28 C41 39 24 47 24 47 C24 47 7 39 7 28 L7 10.5 Z"
          fill={d.fill} stroke={d.stroke} strokeWidth="2.5"/>
        <path d="M24 9 L36 14.5 L36 27 C36 35.5 24 42 24 42 C24 42 12 35.5 12 27 L12 14.5 Z"
          fill="none" stroke={d.stroke2} strokeWidth="1.2" opacity="0.8"/>
        <path d="M24 11 L34 15.5 L34 26.5 C34 33.5 24 39 24 39 C24 39 14 33.5 14 26.5 L14 15.5 Z"
          fill="none" stroke={d.stroke} strokeWidth="0.6" opacity="0.4"/>
        <text x="24" y="22" textAnchor="middle" fontSize="7.5" fill={d.labelColor}
          fontWeight="700" fontFamily="sans-serif" letterSpacing="1">TRUST</text>
        <text x="24" y="36" textAnchor="middle" fontSize="16" fill={d.numColor}
          fontWeight="700" fontFamily="sans-serif">{level}</text>
      </svg>
    )
  }

  return (
    <svg width={size} height={Math.round(size * 1.1)} viewBox="0 0 44 48">
      <path d="M22 3 L39 9.5 L39 26 C39 37 22 45 22 45 C22 45 5 37 5 26 L5 9.5 Z"
        fill={d.fill} stroke={d.stroke} strokeWidth="2"/>
      <path d="M22 8 L34 13 L34 25 C34 33.5 22 40 22 40 C22 40 10 33.5 10 25 L10 13 Z"
        fill="none" stroke={d.stroke2} strokeWidth="1" opacity="0.6"/>
      <text x="22" y="19" textAnchor="middle" fontSize="7.5" fill={d.labelColor}
        fontWeight="700" fontFamily="sans-serif" letterSpacing="1">TRUST</text>
      <text x="22" y="32" textAnchor="middle" fontSize="16" fill={d.numColor}
        fontWeight="700" fontFamily="sans-serif">{level}</text>
    </svg>
  )
}

function Validation() {
  const navigate = useNavigate()
  const [userRole, setUserRole] = useState(null)
  const [trustLevel, setTrustLevel] = useState(1)
  const [activeLevel, setActiveLevel] = useState(1)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUserRole(user.user_metadata?.role)
      const { data } = await supabase.from('profiles').select('trust_level').eq('id', user.id).single()
      if (data) { setTrustLevel(data.trust_level); setActiveLevel(data.trust_level) }
    }
    getUser()
  }, [])

  const getStatusInfo = (num) => {
    if (num < trustLevel) return { text: '✓ Completed', cls: 'status-done' }
    if (num === trustLevel) return { text: '● Current Level', cls: 'status-current' }
    if (num === trustLevel + 1) return { text: 'Available to unlock', cls: 'status-available' }
    return { text: '🔒 Locked', cls: 'status-locked' }
  }

  const current = LEVELS[trustLevel - 1]
  const next = trustLevel < 4 ? LEVELS[trustLevel] : null

  return (
    <div className="val-page">
      <DashNav userRole={userRole} trustLevel={trustLevel} />

      <div className="val-body">

        {/* LEFT */}
        <div className="val-left">
          <div className="val-current-card">
            <p className="val-card-label">Your current trust level</p>
            <div className="val-current-shield">
              <ShieldSVG level={trustLevel} size={80} />
            </div>
            <h2 className="val-current-name">{current.name}</h2>
            <p className="val-current-sub">{current.sub}</p>
            <div className="val-current-desc">{current.description}</div>
          </div>

          {next ? (
            <div className="val-next-card">
              <p className="val-next-label">Next: <strong>Level {next.num} — {next.name}</strong></p>
              <p className="val-next-how">{next.how}</p>
              <button className="val-contact-btn" onClick={() => navigate('/contact')}>
                Contact Us to Upgrade →
              </button>
            </div>
          ) : (
            <div className="val-next-card val-gold-card">
              <p className="val-next-label">🏆 Highest trust level reached!</p>
              <p className="val-next-how">You are Gold verified. Businesses can see you are fully trusted on QuickWork.</p>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className="val-right">
          <p className="val-levels-title">All trust levels</p>
          <div className="val-levels-list">
            {LEVELS.map(level => {
              const s = getStatusInfo(level.num)
              return (
                <div
                  key={level.num}
                  className={`val-level-row ${activeLevel === level.num ? 'active' : ''} ${level.num > trustLevel + 1 ? 'locked' : ''}`}
                  onClick={() => setActiveLevel(level.num)}
                >
                  <ShieldSVG level={level.num} size={40} />
                  <div className="val-level-info">
                    <p className="val-level-name">Level {level.num} — {level.name}</p>
                    <p className="val-level-sub">{level.sub}</p>
                  </div>
                  <span className={`val-status ${s.cls}`}>{s.text}</span>
                </div>
              )
            })}
          </div>

          {activeLevel && activeLevel !== trustLevel && (
            <div className="val-detail-card">
              <h3 className="val-detail-name">Level {activeLevel} — {LEVELS[activeLevel - 1].name}</h3>
              <p className="val-detail-desc">{LEVELS[activeLevel - 1].description}</p>
              <div className="val-detail-divider" />
              <p className="val-detail-how-label">How to achieve this</p>
              <p className="val-detail-how">{LEVELS[activeLevel - 1].how}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Validation
