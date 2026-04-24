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
    descriptionCurrent: "🎉 You are now Level 2 verified! Your identity has been confirmed via Aadhaar. Take the next step — get your address verified by a QuickWork team member and unlock the Level 3 trust shield.",
    descriptionPast: "✅ You have been Level 2 verified!",
    how: "Submit a clear photo of your Aadhaar card via the form below. Our team will verify it within 1–2 business days.",
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
    return (
      <svg width={size} height={Math.round(size * 1.1)} viewBox="0 0 48 52">
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
  const [userId, setUserId] = useState(null)
  const [trustLevel, setTrustLevel] = useState(() => {
    const cached = localStorage.getItem('qw_trust_level')
    return cached ? parseInt(cached) : 1
  })
  const [activeLevel, setActiveLevel] = useState(() => {
    const cached = localStorage.getItem('qw_trust_level')
    return cached ? parseInt(cached) : 1
  })

  // Submission state
  const [submission, setSubmission] = useState(null) // existing submission if any
  const [submissionLoading, setSubmissionLoading] = useState(true)
  const [showForm, setShowForm] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [form, setForm] = useState({
    full_name: '', date_of_birth: '', gender: '', address: ''
  })
  const [frontFile, setFrontFile] = useState(null)
  const [backFile, setBackFile] = useState(null)
  const [frontPreview, setFrontPreview] = useState(null)
  const [backPreview, setBackPreview] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUserRole(user.user_metadata?.role)
      setUserId(user.id)

      const { data } = await supabase.from('profiles').select('trust_level').eq('id', user.id).single()
      if (data) {
        setTrustLevel(data.trust_level)
        setActiveLevel(data.trust_level)
        localStorage.setItem('qw_trust_level', data.trust_level)
      }

      // Check for existing submission
      const { data: sub } = await supabase
        .from('aadhaar_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .single()

      if (sub) setSubmission(sub)
      setSubmissionLoading(false)
    }
    getUser()
  }, [])

  const handleFileChange = (side, file) => {
    if (!file) return
    if (side === 'front') {
      setFrontFile(file)
      setFrontPreview(URL.createObjectURL(file))
    } else {
      setBackFile(file)
      setBackPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    setSubmitError('')
    if (!form.full_name || !form.date_of_birth || !form.gender || !form.address) {
      setSubmitError('Please fill in all fields.'); return
    }
    if (!frontFile || !backFile) {
      setSubmitError('Please upload both front and back photos of your Aadhaar card.'); return
    }

    setSubmitting(true)

    // Upload front image
    const frontPath = `${userId}/front_${Date.now()}.${frontFile.name.split('.').pop()}`
    const { error: frontError } = await supabase.storage
      .from('aadhaar-docs')
      .upload(frontPath, frontFile, { upsert: true })
    if (frontError) { setSubmitError('Failed to upload front image. Please try again.'); setSubmitting(false); return }

    // Upload back image
    const backPath = `${userId}/back_${Date.now()}.${backFile.name.split('.').pop()}`
    const { error: backError } = await supabase.storage
      .from('aadhaar-docs')
      .upload(backPath, backFile, { upsert: true })
    if (backError) { setSubmitError('Failed to upload back image. Please try again.'); setSubmitting(false); return }

    // Get signed URLs (private bucket)
    const { data: frontUrl } = await supabase.storage.from('aadhaar-docs').createSignedUrl(frontPath, 60 * 60 * 24 * 365)
    const { data: backUrl } = await supabase.storage.from('aadhaar-docs').createSignedUrl(backPath, 60 * 60 * 24 * 365)

    // Insert submission
    const { data: newSub, error: subError } = await supabase.from('aadhaar_submissions').insert({
      user_id: userId,
      full_name: form.full_name,
      date_of_birth: form.date_of_birth,
      gender: form.gender,
      address: form.address,
      front_image_url: frontUrl?.signedUrl,
      back_image_url: backUrl?.signedUrl,
      status: 'pending',
      submitted_at: new Date().toISOString()
    }).select().single()

    if (subError) { setSubmitError('Submission failed. Please try again.'); setSubmitting(false); return }

    setSubmission(newSub)
    setShowForm(false)
    setSubmitting(false)
  }

  const getStatusInfo = (num) => {
    if (num < trustLevel) return { text: '✓ Completed', cls: 'status-done' }
    if (num === trustLevel) return { text: '● Current Level', cls: 'status-current' }
    if (num === trustLevel + 1) return { text: 'Available to unlock', cls: 'status-available' }
    return { text: '🔒 Locked', cls: 'status-locked' }
  }

  const current = LEVELS[trustLevel - 1]
  const next = trustLevel < 4 ? LEVELS[trustLevel] : null

  // Render Level 2 upgrade section
  const renderLevel2Section = () => {
    if (submissionLoading) return <div className="val-loading"><div className="val-loading-shield" /><p className="val-loading-text">Checking submission status...</p></div>

    // Already approved — they're level 2, nothing to show here
    if (trustLevel >= 2) return null

    // Has a pending submission
    if (submission && submission.status === 'pending') {
      return (
        <div className="val-submission-status">
          <div className="val-submission-icon">⏳</div>
          <h3 className="val-submission-title">Verification in Progress</h3>
          <p className="val-submission-text">We have received your request for validation at Level 2. Our team will review your Aadhaar details and get back to you within 2 business days.</p>
          <p className="val-submission-date">Submitted: {new Date(submission.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      )
    }

    // Has a rejected submission — show form again with rejection note
    if (submission && submission.status === 'rejected') {
      return (
        <div className="val-submission-rejected">
          <div className="val-rejected-notice">
            <span className="val-rejected-icon">⚠️</span>
            <div>
              <p className="val-rejected-title">Your previous submission was rejected</p>
              {submission.rejection_reason && <p className="val-rejected-reason">{submission.rejection_reason}</p>}
              <p className="val-rejected-sub">Please correct the issue and resubmit below.</p>
            </div>
          </div>
          {renderForm()}
        </div>
      )
    }

    // No submission yet — show form directly
    return renderForm()
  }

  const renderForm = () => (
    <div className="val-aadhaar-form">
      <p className="val-form-title">Aadhaar Verification Form</p>
      <p className="val-form-sub">Enter your details exactly as they appear on your Aadhaar card.</p>

      <div className="val-form-fields">
        <div className="val-field-group">
          <label className="val-field-label">Full Name (as on Aadhaar)</label>
          <input className="val-field-input" type="text" placeholder="e.g. Abhijeet Vijay Kotwal" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
        </div>
        <div className="val-field-row">
          <div className="val-field-group">
            <label className="val-field-label">Date of Birth (DD/MM/YYYY)</label>
            <input
              className="val-field-input"
              type="text"
              placeholder="e.g. 15/08/1995"
              value={form.date_of_birth}
              onChange={e => {
                let val = e.target.value.replace(/[^\d]/g, '')
                if (val.length >= 3) val = val.slice(0,2) + '/' + val.slice(2)
                if (val.length >= 6) val = val.slice(0,5) + '/' + val.slice(5)
                val = val.slice(0, 10)
                setForm({ ...form, date_of_birth: val })
              }}
              maxLength={10}
            />
          </div>
          <div className="val-field-group">
            <label className="val-field-label">Gender</label>
            <select className="val-field-input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Transgender">Transgender</option>
            </select>
          </div>
        </div>
        <div className="val-field-group">
          <label className="val-field-label">Address (as on Aadhaar)</label>
          <textarea className="val-field-input val-field-textarea" placeholder="Full address as printed on your Aadhaar card" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={3} />
        </div>
      </div>

      {/* Photo upload */}
      <div className="val-photo-notice">
        📸 Please submit clear, well-lit photos of your Aadhaar card. Blurry or dark images will be rejected.
      </div>

      <div className="val-photo-row">
        <div className="val-photo-upload" onClick={() => document.getElementById('front-upload').click()}>
          {frontPreview ? <img src={frontPreview} alt="front" className="val-photo-preview" /> : <><span className="val-photo-icon">📄</span><span className="val-photo-label">Aadhaar Front</span><span className="val-photo-sub">Tap to upload</span></>}
          <input id="front-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileChange('front', e.target.files[0])} />
        </div>
        <div className="val-photo-upload" onClick={() => document.getElementById('back-upload').click()}>
          {backPreview ? <img src={backPreview} alt="back" className="val-photo-preview" /> : <><span className="val-photo-icon">📄</span><span className="val-photo-label">Aadhaar Back</span><span className="val-photo-sub">Tap to upload</span></>}
          <input id="back-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileChange('back', e.target.files[0])} />
        </div>
      </div>

      {submitError && <p className="val-submit-error">{submitError}</p>}

      <div className="val-form-actions">
        {!submission?.status === 'rejected' && <button className="val-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>}
        <button className="val-contact-btn" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit for Verification →'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="val-page">
      <DashNav userRole={userRole} trustLevel={trustLevel} currentPage="validation" />

      {/* NOTICE */}
      <div className="val-notice">
        <div className="val-notice-inner">
          <span className="val-notice-title">Why does your trust level matter?</span>
          <p className="val-notice-text">Your trust level is visible to every business when you apply. Higher levels are preferred by employers. Upgrading is completely free and only takes a few days <span className="val-dance">🕺</span></p>
        </div>
      </div>

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
            <div className="val-current-desc">
              {trustLevel === 2 && current.descriptionCurrent
                ? current.descriptionCurrent
                : trustLevel > 2 && current.descriptionPast
                ? current.descriptionPast
                : current.description}
            </div>
          </div>

          {next ? (
            <div className="val-next-card">
              <p className="val-next-label">Next: <strong>Level {next.num} — {next.name}</strong></p>
              <p className="val-next-how">{next.how}</p>
              <button className="val-contact-btn" onClick={() => navigate('/contact')}>
                Still have questions? Contact Us →
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
              {activeLevel === 2 && trustLevel === 1 ? (
                renderLevel2Section()
              ) : (
                <>
                  <p className="val-detail-how-label">How to achieve this</p>
                  <p className="val-detail-how">{LEVELS[activeLevel - 1].how}</p>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Validation
