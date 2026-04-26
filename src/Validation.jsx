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
    descriptionCurrent: "You are now Level 2 verified! Your identity has been confirmed via Aadhaar. Take the next step — get your address verified by a QuickWork team member and unlock the Level 3 trust shield.",
    descriptionPast: "You have been Level 2 verified!",
    how: "Submit a clear photo of your Aadhaar card via the form below. Our team will verify it within 1–2 business days.",
    fill: "#C0DD97", stroke: "#3B6D11", stroke2: "#639922", labelColor: "#27500A", numColor: "#173404",
    premium: false
  },
  {
    num: 3, name: "Address Verified", sub: "Location confirmed",
    description: "A QuickWork team member will visit and verify your home address. This makes you accountable and reachable for businesses.",
    descriptionCurrent: "You are now Level 3 verified! Your address has been confirmed by our team. Take the final step — submit your Police Clearance Certificate to reach the highest trust level.",
    descriptionPast: "You have been Level 3 address verified!",
    how: "Request a visit below. Our team will contact you on your registered mobile number to schedule a visit within 3–5 business days.",
    fill: "#c8e6f8", stroke: "#378ADD", stroke2: "#85B7EB", labelColor: "#185FA5", numColor: "#0C447C",
    premium: true
  },
  {
    num: 4, name: "Police Cleared", sub: "Gold — highest trust",
    description: "Submit a valid police clearance certificate. This is the highest trust level on QuickWork and unlocks premium shift opportunities.",
    descriptionCurrent: "You have reached the highest trust level on QuickWork! Businesses can see you are fully verified and trustworthy.",
    how: "Upload your Police Clearance Certificate below. Our team will verify it within 1–2 business days.",
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

  // Submissions
  const [submission, setSubmission] = useState(null)
  const [allSubmissions, setAllSubmissions] = useState([])
  const [submissionLoading, setSubmissionLoading] = useState(true)

  // Level 2 form
  const [submitting2, setSubmitting2] = useState(false)
  const [submitError2, setSubmitError2] = useState('')
  const [form2, setForm2] = useState({ full_name: '', date_of_birth: '', gender: '', address: '' })
  const [frontFile, setFrontFile] = useState(null)
  const [backFile, setBackFile] = useState(null)
  const [frontPreview, setFrontPreview] = useState(null)
  const [backPreview, setBackPreview] = useState(null)

  // Level 3 form
  const [submitting3, setSubmitting3] = useState(false)

  // Level 4 form
  const [certFile, setCertFile] = useState(null)
  const [certPreview, setCertPreview] = useState(null)
  const [submitting4, setSubmitting4] = useState(false)
  const [submitError4, setSubmitError4] = useState('')

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

      const { data: allSubs } = await supabase
        .from('aadhaar_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })

      if (allSubs && allSubs.length > 0) {
        setAllSubmissions(allSubs)
        setSubmission(allSubs[0])
      }
      setSubmissionLoading(false)
    }
    getUser()
  }, [])

  // ── LEVEL 2 HANDLERS ──
  const handleFileChange = (side, file) => {
    if (!file) return
    if (side === 'front') { setFrontFile(file); setFrontPreview(URL.createObjectURL(file)) }
    else { setBackFile(file); setBackPreview(URL.createObjectURL(file)) }
  }

  const handleSubmit2 = async () => {
    setSubmitError2('')
    if (!form2.full_name || !form2.date_of_birth || !form2.gender || !form2.address) {
      setSubmitError2('Please fill in all fields.'); return
    }
    if (!frontFile || !backFile) {
      setSubmitError2('Please upload both front and back photos of your Aadhaar card.'); return
    }
    setSubmitting2(true)
    const frontPath = `${userId}/front_${Date.now()}.${frontFile.name.split('.').pop()}`
    const backPath = `${userId}/back_${Date.now()}.${backFile.name.split('.').pop()}`
    const { error: fe } = await supabase.storage.from('aadhaar-docs').upload(frontPath, frontFile, { upsert: true })
    if (fe) { setSubmitError2('Failed to upload front image.'); setSubmitting2(false); return }
    const { error: be } = await supabase.storage.from('aadhaar-docs').upload(backPath, backFile, { upsert: true })
    if (be) { setSubmitError2('Failed to upload back image.'); setSubmitting2(false); return }
    const { data: fu } = await supabase.storage.from('aadhaar-docs').createSignedUrl(frontPath, 60 * 60 * 24 * 365)
    const { data: bu } = await supabase.storage.from('aadhaar-docs').createSignedUrl(backPath, 60 * 60 * 24 * 365)
    const { data: newSub, error: subError } = await supabase.from('aadhaar_submissions').insert({
      user_id: userId,
      full_name: form2.full_name,
      date_of_birth: form2.date_of_birth,
      gender: form2.gender,
      address: form2.address,
      front_image_url: fu?.signedUrl,
      back_image_url: bu?.signedUrl,
      status: 'pending',
      verification_level: 2,
      submitted_at: new Date().toISOString()
    }).select().single()
    if (subError) { setSubmitError2('Submission failed. Please try again.'); setSubmitting2(false); return }
    setSubmission(newSub)
    setAllSubmissions([newSub, ...allSubmissions])
    setSubmitting2(false)
  }

  // ── LEVEL 3 HANDLER ──
  const handleSubmit3 = async () => {
    setSubmitting3(true)
    const { data: newSub } = await supabase.from('aadhaar_submissions').insert({
      user_id: userId,
      status: 'pending',
      verification_level: 3,
      submitted_at: new Date().toISOString()
    }).select().single()
    if (newSub) {
      setSubmission(newSub)
      setAllSubmissions([newSub, ...allSubmissions])
    }
    setSubmitting3(false)
  }

  // ── LEVEL 4 HANDLER ──
  const handleSubmit4 = async () => {
    setSubmitError4('')
    if (!certFile) { setSubmitError4('Please upload your Police Clearance Certificate.'); return }
    setSubmitting4(true)
    const certPath = `${userId}/pcc_${Date.now()}.${certFile.name.split('.').pop()}`
    const { error: ce } = await supabase.storage.from('aadhaar-docs').upload(certPath, certFile, { upsert: true })
    if (ce) { setSubmitError4('Failed to upload certificate. Please try again.'); setSubmitting4(false); return }
    const { data: cu } = await supabase.storage.from('aadhaar-docs').createSignedUrl(certPath, 60 * 60 * 24 * 365)
    const { data: newSub, error: subError } = await supabase.from('aadhaar_submissions').insert({
      user_id: userId,
      front_image_url: cu?.signedUrl,
      status: 'pending',
      verification_level: 4,
      submitted_at: new Date().toISOString()
    }).select().single()
    if (subError) { setSubmitError4('Submission failed. Please try again.'); setSubmitting4(false); return }
    setSubmission(newSub)
    setAllSubmissions([newSub, ...allSubmissions])
    setSubmitting4(false)
  }

  const getStatusInfo = (num) => {
    if (num < trustLevel) return { text: '✓ Completed', cls: 'status-done' }
    if (num === trustLevel) return { text: '● Current Level', cls: 'status-current' }
    if (num === trustLevel + 1) return { text: 'Available to unlock', cls: 'status-available' }
    return { text: '🔒 Locked', cls: 'status-locked' }
  }

  // Get most recent submission for a specific level
  const getSubmissionForLevel = (level) =>
    allSubmissions.find(s => s.verification_level === level)

  const current = LEVELS[trustLevel - 1]
  const next = trustLevel < 4 ? LEVELS[trustLevel] : null

  // ── RENDER LEVEL 2 SECTION ──
  const renderLevel2Section = () => {
    if (submissionLoading) return <div className="val-loading"><div className="val-loading-shield" /><p className="val-loading-text">Checking...</p></div>
    if (trustLevel >= 2) return null
    const sub2 = getSubmissionForLevel(2)
    const rejections = allSubmissions.filter(s => s.verification_level === 2 && s.status === 'rejected').length
    if (rejections >= 4) {
      return (
        <div className="val-submission-status" style={{ background: '#fff5f5', borderColor: '#fed7d7' }}>
          <div className="val-submission-icon">🚫</div>
          <h3 className="val-submission-title" style={{ color: '#c53030' }}>Verification Attempts Exhausted</h3>
          <p className="val-submission-text">Your Aadhaar verification has been rejected 4 times. Please contact us directly to proceed.</p>
          <button className="val-contact-btn" onClick={() => navigate('/contact')}>Contact Us to Proceed →</button>
        </div>
      )
    }
    if (sub2 && sub2.status === 'pending') {
      return (
        <div className="val-submission-status">
          <div className="val-submission-icon">⏳</div>
          <h3 className="val-submission-title">Verification in Progress</h3>
          <p className="val-submission-text">We have received your request. Our team will get back to you within 2 business days.</p>
          <p className="val-submission-date">Submitted: {new Date(sub2.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      )
    }
    if (sub2 && sub2.status === 'rejected') {
      return (
        <div className="val-submission-rejected">
          <div className="val-rejected-notice">
            <span className="val-rejected-icon">⚠️</span>
            <div>
              <p className="val-rejected-title">Rejected {rejections > 1 ? `(${rejections} times so far)` : ''}</p>
              {sub2.rejection_reason && <p className="val-rejected-reason">{sub2.rejection_reason}</p>}
              <p className="val-rejected-sub">Please correct the issue and resubmit. {4 - rejections} attempt{4 - rejections !== 1 ? 's' : ''} remaining.</p>
            </div>
          </div>
          {renderForm2()}
        </div>
      )
    }
    return renderForm2()
  }

  const renderForm2 = () => (
    <div className="val-aadhaar-form">
      <p className="val-form-title">Aadhaar Verification Form</p>
      <p className="val-form-sub">Enter your details exactly as they appear on your Aadhaar card.</p>
      <div className="val-form-fields">
        <div className="val-field-group">
          <label className="val-field-label">Full Name (as on Aadhaar)</label>
          <input className="val-field-input" type="text" placeholder="e.g. Abhijeet Vijay Kotwal" value={form2.full_name} onChange={e => setForm2({ ...form2, full_name: e.target.value })} />
        </div>
        <div className="val-field-row">
          <div className="val-field-group">
            <label className="val-field-label">Date of Birth (DD/MM/YYYY)</label>
            <input className="val-field-input" type="text" placeholder="e.g. 15/08/1995" value={form2.date_of_birth}
              onChange={e => {
                let val = e.target.value.replace(/[^\d]/g, '')
                if (val.length >= 3) val = val.slice(0,2) + '/' + val.slice(2)
                if (val.length >= 6) val = val.slice(0,5) + '/' + val.slice(5)
                setForm2({ ...form2, date_of_birth: val.slice(0, 10) })
              }} maxLength={10} />
          </div>
          <div className="val-field-group">
            <label className="val-field-label">Gender</label>
            <select className="val-field-input" value={form2.gender} onChange={e => setForm2({ ...form2, gender: e.target.value })}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Transgender">Transgender</option>
            </select>
          </div>
        </div>
        <div className="val-field-group">
          <label className="val-field-label">Address (as on Aadhaar)</label>
          <textarea className="val-field-input val-field-textarea" placeholder="Full address as printed on your Aadhaar card" value={form2.address} onChange={e => setForm2({ ...form2, address: e.target.value })} rows={3} />
        </div>
      </div>
      <div className="val-photo-notice">📸 Please submit clear, well-lit photos of your Aadhaar card. Blurry or dark images will be rejected.</div>
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
      {submitError2 && <p className="val-submit-error">{submitError2}</p>}
      <div className="val-form-actions">
        <button className="val-contact-btn" onClick={handleSubmit2} disabled={submitting2}>
          {submitting2 ? 'Submitting...' : 'Submit for Verification →'}
        </button>
      </div>
    </div>
  )

  // ── RENDER LEVEL 3 SECTION ──
  const renderLevel3Section = () => {
    if (submissionLoading) return null
    if (trustLevel >= 3) return null
    if (trustLevel < 2) return null
    const sub3 = getSubmissionForLevel(3)
    if (sub3 && sub3.status === 'pending') {
      return (
        <div className="val-submission-status">
          <div className="val-submission-icon">⏳</div>
          <h3 className="val-submission-title">Address Verification Requested</h3>
          <p className="val-submission-text">Our team will contact you on your registered mobile number to schedule a visit. This usually takes 3–5 business days.</p>
          <p className="val-submission-date">Submitted: {new Date(sub3.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      )
    }
    if (sub3 && sub3.status === 'rejected') {
      return (
        <div className="val-submission-rejected">
          <div className="val-rejected-notice">
            <span className="val-rejected-icon">⚠️</span>
            <div>
              <p className="val-rejected-title">Address verification was unsuccessful</p>
              {sub3.rejection_reason && <p className="val-rejected-reason">{sub3.rejection_reason}</p>}
              <p className="val-rejected-sub">Please request again or contact us for help.</p>
            </div>
          </div>
          <button className="val-contact-btn" onClick={handleSubmit3} disabled={submitting3}>
            {submitting3 ? 'Requesting...' : 'Request Again →'}
          </button>
        </div>
      )
    }
    return (
      <div className="val-level3-form">
        <div className="val-photo-notice" style={{ marginBottom: 12 }}>
          📞 Our team will call you on your registered mobile number to schedule a home visit. Make sure your address on your Aadhaar card is accurate before requesting.
        </div>
        <button className="val-contact-btn" onClick={handleSubmit3} disabled={submitting3}>
          {submitting3 ? 'Requesting...' : 'Request Address Verification →'}
        </button>
      </div>
    )
  }

  // ── RENDER LEVEL 4 SECTION ──
  const renderLevel4Section = () => {
    if (submissionLoading) return null
    if (trustLevel >= 4) return null
    if (trustLevel < 3) return null
    const sub4 = getSubmissionForLevel(4)
    if (sub4 && sub4.status === 'pending') {
      return (
        <div className="val-submission-status">
          <div className="val-submission-icon">⏳</div>
          <h3 className="val-submission-title">Certificate Under Review</h3>
          <p className="val-submission-text">We have received your Police Clearance Certificate. Our team will verify it within 1–2 business days.</p>
          <p className="val-submission-date">Submitted: {new Date(sub4.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      )
    }
    if (sub4 && sub4.status === 'rejected') {
      return (
        <div className="val-submission-rejected">
          <div className="val-rejected-notice">
            <span className="val-rejected-icon">⚠️</span>
            <div>
              <p className="val-rejected-title">Certificate was rejected</p>
              {sub4.rejection_reason && <p className="val-rejected-reason">{sub4.rejection_reason}</p>}
              <p className="val-rejected-sub">Please upload a valid certificate and resubmit.</p>
            </div>
          </div>
          {renderForm4()}
        </div>
      )
    }
    return renderForm4()
  }

  const renderForm4 = () => (
    <div className="val-aadhaar-form">
      <p className="val-form-title">Police Clearance Certificate</p>
      <p className="val-form-sub">Upload a valid, recent Police Clearance Certificate issued by your local police station.</p>
      <div className="val-photo-notice">📄 Make sure the certificate is clearly readable, not expired, and shows your full name and date of issue.</div>
      <div className="val-photo-row">
        <div className="val-photo-upload" style={{ flex: 'none', width: '100%' }} onClick={() => document.getElementById('cert-upload').click()}>
          {certPreview ? <img src={certPreview} alt="certificate" className="val-photo-preview" style={{ height: 120 }} /> : <><span className="val-photo-icon">📋</span><span className="val-photo-label">Police Clearance Certificate</span><span className="val-photo-sub">Tap to upload (image or PDF)</span></>}
          <input id="cert-upload" type="file" accept="image/*,.pdf" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files[0]; if (f) { setCertFile(f); setCertPreview(URL.createObjectURL(f)) } }} />
        </div>
      </div>
      {submitError4 && <p className="val-submit-error">{submitError4}</p>}
      <div className="val-form-actions">
        <button className="val-contact-btn" onClick={handleSubmit4} disabled={submitting4}>
          {submitting4 ? 'Uploading...' : 'Submit Certificate →'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="val-page">
      <DashNav userRole={userRole} trustLevel={trustLevel} currentPage="validation" />

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
            <div className="val-current-shield"><ShieldSVG level={trustLevel} size={80} /></div>
            <h2 className="val-current-name">{current.name}</h2>
            <p className="val-current-sub">{current.sub}</p>
            <div className="val-current-desc">
              {trustLevel === 2 && current.descriptionCurrent ? current.descriptionCurrent
                : trustLevel > 2 && current.descriptionPast ? current.descriptionPast
                : current.description}
            </div>
          </div>

          {next ? (
            <div className="val-next-card">
              <p className="val-next-label">Next: <strong>Level {next.num} — {next.name}</strong></p>
              <p className="val-next-how">{next.how}</p>
              {trustLevel === 1 ? renderLevel2Section()
                : trustLevel === 2 ? renderLevel3Section()
                : trustLevel === 3 ? renderLevel4Section()
                : null}
              <p className="val-next-how" style={{ marginTop: 8 }}>Still have questions about this step?</p>
              <button className="val-contact-btn" onClick={() => navigate('/contact')}>Contact Us →</button>
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
              ) : activeLevel === 3 && trustLevel === 2 ? (
                renderLevel3Section()
              ) : activeLevel === 4 && trustLevel === 3 ? (
                renderLevel4Section()
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
