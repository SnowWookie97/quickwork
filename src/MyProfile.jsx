import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import DashNav from './DashNav'
import './MyProfile.css'

const INDUSTRIES = [
  { group: 'Trade & Services', options: ['Logistics', 'Retail', 'Delivery', 'Warehouse'] },
  { group: 'Hospitality & Events', options: ['Hospitality', 'Events', 'Travel & Tourism'] },
  { group: 'Construction & Skilled Trade', options: ['Construction', 'Electrical', 'Plumbing', 'Carpentry'] },
  { group: 'Professional', options: ['Engineering', 'Finance / CA', 'MBA / Management', 'Healthcare / Medical', 'IT / Technology', 'Education', 'Legal'] },
  { group: 'Other', options: ['Agriculture', 'Security', 'Domestic Help', 'Other'] },
]

const ALL_SKILLS = [
  'Cooking', 'Cleaning', 'Driving', 'Waiter', 'Bartender', 'Receptionist',
  'Packing', 'Loading / Unloading', 'Security Guard', 'Cashier',
  'Construction Work', 'Electrician', 'Plumber', 'Carpenter',
  'Data Entry', 'Customer Service', 'Sales', 'Delivery',
  'Gardening', 'Painting', 'Tailoring', 'Babysitting / Caretaking', 'Other'
]

const DEGREE_FIELDS = [
  'Engineering', 'Commerce / Finance', 'Medicine / Healthcare',
  'Arts / Humanities', 'Law', 'Management / MBA',
  'Science', 'Agriculture', 'Education / Teaching',
  'Computer Science / IT', 'Architecture', 'Other'
]

function MyProfile() {
  const navigate = useNavigate()
  const [userRole, setUserRole] = useState(null)
  const [trustLevel, setTrustLevel] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  // User data from auth
  const [authUser, setAuthUser] = useState(null)

  // Profile photo
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [photoUploading, setPhotoUploading] = useState(false)

  // Emergency contact
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyMobile, setEmergencyMobile] = useState('')

  // Work history
  const [workHistory, setWorkHistory] = useState([])
  const [newWork, setNewWork] = useState({ industry: '', years: '', description: '' })
  const [showWorkForm, setShowWorkForm] = useState(false)

  // Skills
  const [skills, setSkills] = useState([])
  const [skillSearch, setSkillSearch] = useState('')
  const [showSkillDropdown, setShowSkillDropdown] = useState(false)

  // Education
  const [hasDegree, setHasDegree] = useState(false)
  const [degreeLevel, setDegreeLevel] = useState('')
  const [degreeField, setDegreeField] = useState('')
  const [degreeUniversity, setDegreeUniversity] = useState('')
  const [degreeYear, setDegreeYear] = useState('')
  const [degreeSaved, setDegreeSaved] = useState(false)
  const [showDegreeForm, setShowDegreeForm] = useState(false)

  // Payment
  const [upiId, setUpiId] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [editingPayment, setEditingPayment] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setAuthUser(user)
      setUserRole(user.user_metadata?.role)

      const { data: profile } = await supabase.from('profiles').select('trust_level, avatar_url').eq('id', user.id).single()
      if (profile) {
        setTrustLevel(profile.trust_level || 1)
        setAvatarUrl(profile.avatar_url || null)
        localStorage.setItem('qw_trust_level', profile.trust_level || 1)
      }

      const { data: wp } = await supabase.from('worker_profiles').select('*').eq('user_id', user.id).single()
      if (wp) {
        setEmergencyName(wp.emergency_contact_name || '')
        setEmergencyMobile(wp.emergency_contact_mobile || '')
        setWorkHistory(wp.work_history || [])
        setSkills(wp.skills || [])
        setHasDegree(wp.has_degree || false)
        setDegreeLevel(wp.degree_level || '')
        setDegreeField(wp.degree_field || '')
        setDegreeUniversity(wp.degree_university || '')
        setDegreeYear(wp.degree_year || '')
        setDegreeSaved(!!(wp.degree_level && wp.degree_field))
        setUpiId(wp.upi_id || '')
        setBankAccount(wp.bank_account || '')
      }
      setLoading(false)
    }
    load()
  }, [])

  const saveProfile = async (updates) => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('worker_profiles').upsert({
      user_id: user.id,
      emergency_contact_name: emergencyName,
      emergency_contact_mobile: emergencyMobile,
      work_history: workHistory,
      skills,
      has_degree: hasDegree,
      degree_level: degreeLevel,
      degree_field: degreeField,
      degree_university: degreeUniversity,
      degree_year: degreeYear,
      upi_id: upiId,
      bank_account: bankAccount,
      updated_at: new Date().toISOString(),
      ...updates
    })
    setSaving(false)
    setSaveMsg('Saved!')
    setTimeout(() => setSaveMsg(''), 2000)
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhotoUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const ext = file.name.split('.').pop()
    const path = `avatars/${user.id}.${ext}`
    await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const url = publicUrl + '?t=' + Date.now()
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
    setAvatarUrl(url)
    setPhotoUploading(false)
  }

  const addWorkEntry = () => {
    if (!newWork.industry || !newWork.years) return
    const updated = [...workHistory, { ...newWork, id: Date.now() }]
    setWorkHistory(updated)
    setNewWork({ industry: '', years: '', description: '' })
    setShowWorkForm(false)
    saveProfile({ work_history: updated })
  }

  const removeWorkEntry = (id) => {
    const updated = workHistory.filter(w => w.id !== id)
    setWorkHistory(updated)
    saveProfile({ work_history: updated })
  }

  const toggleSkill = (skill) => {
    if (skills.includes(skill)) {
      const updated = skills.filter(s => s !== skill)
      setSkills(updated)
      saveProfile({ skills: updated })
    } else if (skills.length < 4) {
      const updated = [...skills, skill]
      setSkills(updated)
      saveProfile({ skills: updated })
    }
    setSkillSearch('')
    setShowSkillDropdown(false)
  }

  const saveDegree = () => {
    if (!degreeLevel || !degreeField) return
    setDegreeSaved(true)
    setShowDegreeForm(false)
    saveProfile({ has_degree: true, degree_level: degreeLevel, degree_field: degreeField, degree_university: degreeUniversity, degree_year: degreeYear })
  }

  const removeDegree = () => {
    setDegreeSaved(false)
    setDegreeLevel(''); setDegreeField(''); setDegreeUniversity(''); setDegreeYear('')
    saveProfile({ has_degree: false, degree_level: null, degree_field: null, degree_university: null, degree_year: null })
  }

  const filteredSkills = ALL_SKILLS.filter(s =>
    s.toLowerCase().includes(skillSearch.toLowerCase()) && !skills.includes(s)
  )

  const isLocked = trustLevel >= 2

  if (loading) return (
    <div className="mp-page">
      <DashNav userRole={userRole} trustLevel={trustLevel} />
      <div className="mp-loading">Loading your profile...</div>
    </div>
  )

  const name = authUser?.user_metadata?.name || '—'
  const mobile = authUser?.user_metadata?.mobile || '—'
  const email = authUser?.email || '—'

  return (
    <div className="mp-page">
      <DashNav userRole={userRole} trustLevel={trustLevel} />

      {saveMsg && <div className="mp-save-toast">{saveMsg}</div>}

      <div className="mp-body">

        {/* LEFT */}
        <div className="mp-left">

          {/* PHOTO + NAME */}
          <div className="mp-card mp-card-center">
            <div className="mp-avatar-wrap">
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" className="mp-avatar-img" />
                : <div className="mp-avatar-placeholder">👤</div>
              }
              <label className="mp-avatar-edit">
                {photoUploading ? '...' : '📷'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
              </label>
            </div>
            <h2 className="mp-name">{name}</h2>
            <span className="mp-role-badge">👷 Worker</span>
            <div className="mp-trust-row">
              <span className="mp-trust-label">Trust Level {trustLevel}</span>
              {trustLevel >= 2 && <span className="mp-verified-tag">✓ ID Verified</span>}
            </div>
          </div>

          {/* PERSONAL INFO */}
          <div className="mp-card">
            <div className="mp-section-label">Personal info</div>
            {isLocked && (
              <div className="mp-lock-notice">
                🔒 Verified info — <span className="mp-lock-link" onClick={() => navigate('/contact')}>contact us to change</span>
              </div>
            )}
            <div className="mp-info-row"><span className="mp-info-label">Full Name</span><span className="mp-info-value">{name}</span></div>
            <div className="mp-info-row"><span className="mp-info-label">Email</span><span className="mp-info-value" style={{ fontSize: 11 }}>{email}</span></div>
            <div className="mp-info-row"><span className="mp-info-label">Mobile</span><span className="mp-info-value">+91 {mobile}</span></div>
            <div className="mp-info-row"><span className="mp-info-label">DOB</span><span className="mp-info-value">{authUser?.user_metadata?.dob || '—'}</span></div>
            <div className="mp-info-row"><span className="mp-info-label">Gender</span><span className="mp-info-value">{authUser?.user_metadata?.gender || '—'}</span></div>
          </div>

          {/* EMERGENCY CONTACT */}
          <div className="mp-card">
            <div className="mp-section-label">Emergency contact</div>
            <div className="mp-field-group">
              <label className="mp-field-label">Name</label>
              <input className="mp-field-input" value={emergencyName} onChange={e => setEmergencyName(e.target.value)} placeholder="Friend or family member" onBlur={() => saveProfile({})} />
            </div>
            <div className="mp-field-group" style={{ marginTop: 8 }}>
              <label className="mp-field-label">Mobile</label>
              <div className="mp-phone-wrap">
                <span className="mp-phone-prefix">+91</span>
                <input className="mp-field-input mp-phone-input" value={emergencyMobile} onChange={e => setEmergencyMobile(e.target.value)} placeholder="9876543210" maxLength={10} onBlur={() => saveProfile({})} />
              </div>
            </div>
          </div>

          {/* PAYMENT */}
          <div className="mp-card">
            <div className="mp-section-label-row">
              <span className="mp-section-label">Payment details</span>
              {!editingPayment && <button className="mp-text-btn" onClick={() => setEditingPayment(true)}>Edit</button>}
            </div>
            {editingPayment ? (
              <>
                <div className="mp-field-group">
                  <label className="mp-field-label">UPI ID</label>
                  <input className="mp-field-input" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" />
                </div>
                <div className="mp-field-group" style={{ marginTop: 8 }}>
                  <label className="mp-field-label">Bank Account Number (optional)</label>
                  <input className="mp-field-input" value={bankAccount} onChange={e => setBankAccount(e.target.value)} placeholder="Account number" />
                </div>
                <button className="mp-save-btn" style={{ marginTop: 10 }} onClick={() => { setEditingPayment(false); saveProfile({}) }}>Save Payment Details</button>
              </>
            ) : (
              <>
                <div className="mp-info-row"><span className="mp-info-label">UPI ID</span><span className="mp-info-value" style={{ fontSize: 11 }}>{upiId || '—'}</span></div>
                <div className="mp-info-row"><span className="mp-info-label">Bank Account</span><span className="mp-info-value" style={{ fontSize: 11 }}>{bankAccount || '—'}</span></div>
              </>
            )}
          </div>

        </div>

        {/* RIGHT */}
        <div className="mp-right">

          {/* WORK HISTORY */}
          <div className="mp-card">
            <div className="mp-section-label-row">
              <div>
                <div className="mp-card-title">Work history</div>
                <div className="mp-card-sub">Add your past experience across any industry.</div>
              </div>
              {!showWorkForm && <button className="mp-add-btn" onClick={() => setShowWorkForm(true)}>+ Add</button>}
            </div>

            {showWorkForm && (
              <div className="mp-work-form">
                <div className="mp-form-row">
                  <select className="mp-form-select" value={newWork.industry} onChange={e => setNewWork({ ...newWork, industry: e.target.value })}>
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map(g => (
                      <optgroup key={g.group} label={g.group}>
                        {g.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <input className="mp-form-input" type="number" placeholder="Years" min="0" max="50" value={newWork.years} onChange={e => setNewWork({ ...newWork, years: e.target.value })} />
                </div>
                <textarea className="mp-form-textarea" placeholder="Describe your role (optional)..." value={newWork.description} onChange={e => setNewWork({ ...newWork, description: e.target.value })} />
                <div className="mp-form-actions">
                  <button className="mp-cancel-btn" onClick={() => { setShowWorkForm(false); setNewWork({ industry: '', years: '', description: '' }) }}>Cancel</button>
                  <button className="mp-save-btn" onClick={addWorkEntry}>Save Entry</button>
                </div>
              </div>
            )}

            {workHistory.length > 0 ? (
              <div className="mp-work-list">
                {workHistory.map(w => (
                  <div key={w.id} className="mp-work-pill">
                    <span className="mp-industry-badge">{w.industry}</span>
                    <span className="mp-years-badge">{w.years} {parseInt(w.years) === 1 ? 'yr' : 'yrs'}</span>
                    {w.description && <span className="mp-work-desc">{w.description}</span>}
                    <button className="mp-remove-btn" onClick={() => removeWorkEntry(w.id)}>✕</button>
                  </div>
                ))}
              </div>
            ) : (
              !showWorkForm && <p className="mp-empty-msg">No work history added yet.</p>
            )}
          </div>

          {/* EDUCATION */}
          <div className="mp-card">
            <div className="mp-card-title" style={{ marginBottom: 12 }}>Education</div>
            <div className="mp-toggle-row">
              <span className="mp-toggle-label">Do you have a university degree?</span>
              <div className="mp-toggle-wrap">
                <button className={`mp-toggle-btn ${!hasDegree ? 'active' : ''}`} onClick={() => { setHasDegree(false); setShowDegreeForm(false); setDegreeSaved(false); saveProfile({ has_degree: false }) }}>No</button>
                <button className={`mp-toggle-btn ${hasDegree ? 'active' : ''}`} onClick={() => { setHasDegree(true); setShowDegreeForm(true) }}>Yes</button>
              </div>
            </div>

            {hasDegree && showDegreeForm && (
              <div className="mp-edu-form">
                <div className="mp-two-col">
                  <div className="mp-field-group">
                    <label className="mp-field-label">Highest degree</label>
                    <select className="mp-form-select" style={{ width: '100%' }} value={degreeLevel} onChange={e => setDegreeLevel(e.target.value)}>
                      <option value="">Select...</option>
                      <option>Diploma</option>
                      <option>Bachelor's</option>
                      <option>Master's</option>
                      <option>PhD</option>
                    </select>
                  </div>
                  <div className="mp-field-group">
                    <label className="mp-field-label">Field of study</label>
                    <select className="mp-form-select" style={{ width: '100%' }} value={degreeField} onChange={e => setDegreeField(e.target.value)}>
                      <option value="">Select...</option>
                      {DEGREE_FIELDS.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mp-two-col">
                  <div className="mp-field-group">
                    <label className="mp-field-label">University (optional)</label>
                    <input className="mp-field-input" value={degreeUniversity} onChange={e => setDegreeUniversity(e.target.value)} placeholder="e.g. Pune University" />
                  </div>
                  <div className="mp-field-group">
                    <label className="mp-field-label">Year completed (optional)</label>
                    <input className="mp-field-input" value={degreeYear} onChange={e => setDegreeYear(e.target.value)} placeholder="e.g. 2019" maxLength={4} />
                  </div>
                </div>
                <button className="mp-save-btn" onClick={saveDegree}>Save</button>
              </div>
            )}

            {hasDegree && degreeSaved && !showDegreeForm && (
              <div className="mp-edu-pill">
                <span className="mp-degree-badge">{degreeLevel}</span>
                <div>
                  <div className="mp-edu-field">{degreeField}</div>
                  {(degreeUniversity || degreeYear) && (
                    <div className="mp-edu-uni">{[degreeUniversity, degreeYear].filter(Boolean).join(' · ')}</div>
                  )}
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <button className="mp-text-btn" onClick={() => setShowDegreeForm(true)}>Edit</button>
                  <button className="mp-remove-btn" onClick={removeDegree}>✕</button>
                </div>
              </div>
            )}
          </div>

          {/* SKILLS */}
          <div className="mp-card">
            <div className="mp-card-title">Skills</div>
            <div className="mp-skills-notice">Select your top 4 skills — these are shown to businesses when you apply for shifts.</div>
            <div className="mp-skill-search-wrap">
              <input
                className="mp-field-input"
                placeholder="Search skills — e.g. cooking, driving..."
                value={skillSearch}
                onChange={e => { setSkillSearch(e.target.value); setShowSkillDropdown(true) }}
                onFocus={() => setShowSkillDropdown(true)}
              />
              {showSkillDropdown && skillSearch && filteredSkills.length > 0 && (
                <div className="mp-skill-dropdown">
                  {filteredSkills.slice(0, 6).map(s => (
                    <div key={s} className="mp-skill-option" onClick={() => toggleSkill(s)}>{s}</div>
                  ))}
                </div>
              )}
            </div>
            {skills.length > 0 && (
              <div className="mp-selected-skills">
                {skills.map(s => (
                  <div key={s} className="mp-skill-tag">
                    {s} <span onClick={() => toggleSkill(s)}>✕</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mp-skill-count">{skills.length} of 4 selected{skills.length === 4 ? ' — maximum reached' : ''}</div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default MyProfile
