import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import DashNav from './DashNav'
import './Validation.css'

const LEVELS = [
  {
    num: 1,
    name: "Signed Up",
    sub: "Basic access",
    description: "You have registered with email, password and OTP verification. You can browse and apply for shifts immediately.",
    how: "Automatic on signup — no action needed.",
    shieldFill: "#f5c87a", shieldStroke: "#BA7517", shieldStroke2: "#EF9F27",
    labelColor: "#633806", numColor: "#412402",
    decoration: "",
    status: "completed"
  },
  {
    num: 2,
    name: "ID Verified",
    sub: "Aadhaar confirmed",
    description: "Submit your Aadhaar card for identity verification. Businesses will see your confirmed identity and trust you more.",
    how: "Submit a clear photo of your Aadhaar card via the Contact Us page. Our team will verify it within 1–2 business days.",
    shieldFill: "#e8e8e8", shieldStroke: "#bbb", shieldStroke2: "#ddd",
    labelColor: "#999", numColor: "#777",
    decoration: `<circle cx="22" cy="38" r="2.5" fill="#bbb" opacity="0.6"/>`,
    status: "available"
  },
  {
    num: 3,
    name: "Address Verified",
    sub: "Location confirmed",
    description: "A QuickWork team member will visit and verify your home address. This makes you accountable and reachable for businesses.",
    how: "Once ID verified, request an address visit via the Contact Us page. A team member will schedule a visit within 3–5 business days.",
    shieldFill: "#c8e6f8", shieldStroke: "#378ADD", shieldStroke2: "#85B7EB",
    labelColor: "#185FA5", numColor: "#0C447C",
    decoration: `
      <circle cx="16" cy="36" r="2" fill="#378ADD" opacity="0.5"/>
      <circle cx="22" cy="39" r="2.5" fill="#378ADD" opacity="0.7"/>
      <circle cx="28" cy="36" r="2" fill="#378ADD" opacity="0.5"/>
    `,
    status: "locked"
  },
  {
    num: 4,
    name: "Police Cleared",
    sub: "Gold — highest trust",
    description: "Submit a valid police clearance certificate. This is the highest trust level on QuickWork and unlocks premium shift opportunities.",
    how: "Obtain a Police Clearance Certificate from your local police station and submit it via the Contact Us page.",
    shieldFill: "#FFD700", shieldStroke: "#B8860B", shieldStroke2: "#FFE55C",
    labelColor: "#7a5a00", numColor: "#5a3e00",
    decoration: `
      <path d="M15 24 L19.5 29 L29 19" stroke="#7a5a00" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <circle cx="22" cy="38" r="2.5" fill="#B8860B" opacity="0.8"/>
      <circle cx="15" cy="35.5" r="1.8" fill="#B8860B" opacity="0.5"/>
      <circle cx="29" cy="35.5" r="1.8" fill="#B8860B" opacity="0.5"/>
    `,
    status: "locked"
  }
]

function ShieldSVG({ level, size = 52 }) {
  const d = LEVELS[level - 1]
  return (
    <svg width={size} height={Math.round(size * 1.1)} viewBox="0 0 44 48">
      <path d="M22 3 L39 9.5 L39 26 C39 37 22 45 22 45 C22 45 5 37 5 26 L5 9.5 Z"
        fill={d.shieldFill} stroke={d.shieldStroke} strokeWidth="1.8"/>
      <path d="M22 8 L34 13 L34 25 C34 33.5 22 40 22 40 C22 40 10 33.5 10 25 L10 13 Z"
        fill="none" stroke={d.shieldStroke2} strokeWidth="1" opacity="0.6"/>
      <text x="22" y="20" textAnchor="middle" fontSize="7.5" fill={d.labelColor}
        fontWeight="600" fontFamily="sans-serif" letterSpacing="1">TRUST</text>
      <text x="22" y="32" textAnchor="middle" fontSize="15" fill={d.numColor}
        fontWeight="700" fontFamily="sans-serif">{level}</text>
      <g dangerouslySetInnerHTML={{ __html: d.decoration }} />
    </svg>
  )
}

function Validation() {
  const navigate = useNavigate()
  const [userRole, setUserRole] = useState(null)
  const [trustLevel, setTrustLevel] = useState(1)
  const [activeLevel, setActiveLevel] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUserRole(user.user_metadata?.role)

      const { data } = await supabase
        .from('profiles')
        .select('trust_level')
        .eq('id', user.id)
        .single()

      if (data) {
        setTrustLevel(data.trust_level)
        setActiveLevel(data.trust_level)
      }
    }
    getUser()
  }, [])

  const getStatusLabel = (levelNum) => {
    if (levelNum < trustLevel) return { text: '✓ Completed', cls: 'status-done' }
    if (levelNum === trustLevel) return { text: '● Current Level', cls: 'status-current' }
    if (levelNum === trustLevel + 1) return { text: 'Available to unlock', cls: 'status-available' }
    return { text: '🔒 Locked', cls: 'status-locked' }
  }

  const currentLevel = LEVELS[trustLevel - 1]

  return (
    <div className="val-page">
      <DashNav userRole={userRole} trustLevel={trustLevel} />

      <div className="val-body">

        {/* LEFT — current status */}
        <div className="val-left">
          <div className="val-current-card">
            <p className="val-card-label">Your current trust level</p>
            <div className="val-current-shield">
              <ShieldSVG level={trustLevel} size={80} />
            </div>
            <h2 className="val-current-name">{currentLevel.name}</h2>
            <p className="val-current-sub">{currentLevel.sub}</p>
            <div className="val-current-desc">{currentLevel.description}</div>
          </div>

          {trustLevel < 4 && (
            <div className="val-next-card">
              <p className="val-next-label">Next level: <strong>{LEVELS[trustLevel].name}</strong></p>
              <p className="val-next-how">{LEVELS[trustLevel].how}</p>
              <button className="val-contact-btn" onClick={() => navigate('/contact')}>
                Contact Us to Upgrade →
              </button>
            </div>
          )}

          {trustLevel === 4 && (
            <div className="val-next-card val-gold-card">
              <p className="val-next-label">🏆 You have reached the highest trust level!</p>
              <p className="val-next-how">You are Gold verified. Businesses can see you are fully trusted on QuickWork.</p>
            </div>
          )}
        </div>

        {/* RIGHT — all levels */}
        <div className="val-right">
          <p className="val-levels-title">All trust levels</p>
          <div className="val-levels-list">
            {LEVELS.map(level => {
              const statusInfo = getStatusLabel(level.num)
              const isActive = activeLevel === level.num
              return (
                <div
                  key={level.num}
                  className={`val-level-row ${isActive ? 'active' : ''} ${level.num > trustLevel + 1 ? 'locked' : ''}`}
                  onClick={() => setActiveLevel(level.num)}
                >
                  <ShieldSVG level={level.num} size={40} />
                  <div className="val-level-info">
                    <p className="val-level-name">Level {level.num} — {level.name}</p>
                    <p className="val-level-sub">{level.sub}</p>
                  </div>
                  <span className={`val-status ${statusInfo.cls}`}>{statusInfo.text}</span>
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
