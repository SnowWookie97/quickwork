import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import logoImg from './assets/logo.png'
import './AdminPanel.css'

// ── MINI SHIELD ──────────────────────────────────────────────
const SHIELD_DATA = [
  { fill: "#e8e8e8", stroke: "#bbb", stroke2: "#ddd", numColor: "#777" },
  { fill: "#C0DD97", stroke: "#3B6D11", stroke2: "#639922", numColor: "#173404" },
  { fill: "#c8e6f8", stroke: "#378ADD", stroke2: "#85B7EB", numColor: "#0C447C" },
  { fill: "#FFD700", stroke: "#B8860B", stroke2: "#FFE55C", numColor: "#5a3e00" }
]

function MiniShield({ level }) {
  const d = SHIELD_DATA[(level || 1) - 1]
  return (
    <svg width="22" height="24" viewBox="0 0 44 48" style={{ flexShrink: 0 }}>
      <path d="M22 3 L39 9.5 L39 26 C39 37 22 45 22 45 C22 45 5 37 5 26 L5 9.5 Z" fill={d.fill} stroke={d.stroke} strokeWidth="2"/>
      <path d="M22 8 L34 13 L34 25 C34 33.5 22 40 22 40 C22 40 10 33.5 10 25 L10 13 Z" fill="none" stroke={d.stroke2} strokeWidth="1" opacity="0.6"/>
      <text x="22" y="30" textAnchor="middle" fontSize="16" fill={d.numColor} fontWeight="700" fontFamily="sans-serif">{level || 1}</text>
    </svg>
  )
}

// ── TABS ──────────────────────────────────────────────────────
const TABS = ['Dashboard', 'Validation Requests', 'Users', 'Referrals', 'Feedback', 'FAQ Manager', 'Recent Logins']
const TAB_ICONS = { 'Dashboard': '📊', 'Validation Requests': '🛡️', 'Users': '👥', 'Referrals': '🎉', 'Feedback': '💬', 'FAQ Manager': '❓', 'Recent Logins': '🕐' }

export default function AdminPanel() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [adminPhoto, setAdminPhoto] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Data states — load from cache instantly
  const [users, setUsers] = useState(() => {
    const c = localStorage.getItem('qw_admin_users'); return c ? JSON.parse(c) : []
  })
  const [profiles, setProfiles] = useState(() => {
    const c = localStorage.getItem('qw_admin_profiles'); return c ? JSON.parse(c) : {}
  })
  const [submissions, setSubmissions] = useState(() => {
    const c = localStorage.getItem('qw_admin_submissions'); return c ? JSON.parse(c) : []
  })
  const [feedbacks, setFeedbacks] = useState(() => {
    const c = localStorage.getItem('qw_admin_feedbacks'); return c ? JSON.parse(c) : []
  })
  const [referrals, setReferrals] = useState(() => {
    const c = localStorage.getItem('qw_admin_referrals'); return c ? JSON.parse(c) : []
  })
  const [faqs, setFaqs] = useState(() => {
    const c = localStorage.getItem('qw_admin_faqs'); return c ? JSON.parse(c) : []
  })
  const [signupFilter, setSignupFilter] = useState('week')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  // Modal states
  const [noticeModal, setNoticeModal] = useState(null)
  const [noticeMsg, setNoticeMsg] = useState('')
  const [noticePage, setNoticePage] = useState('dashboard')
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [faqModal, setFaqModal] = useState(null)
  const [faqForm, setFaqForm] = useState({ category: 'Accounts', question: '', answer: '' })
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('is_admin, avatar_url').eq('id', user.id).single()
      if (!profile?.is_admin) { navigate('/worker/dashboard'); return }
      if (profile.avatar_url) setAdminPhoto(profile.avatar_url)
      fetchAll()
    }
    checkAdmin()
  }, [])

  const fetchAll = async () => {
    const { data: profilesData } = await supabase.from('profiles').select('*')
    if (profilesData) {
      const profileMap = {}
      profilesData.forEach(p => { profileMap[p.id] = p })
      setProfiles(profileMap)
      localStorage.setItem('qw_admin_profiles', JSON.stringify(profileMap))
    }

    const { data: usersData } = await supabase.rpc('get_all_users')
    if (usersData) {
      setUsers(usersData)
      localStorage.setItem('qw_admin_users', JSON.stringify(usersData))
    }

    const { data: subsData } = await supabase.from('aadhaar_submissions').select('*').order('submitted_at', { ascending: false })
    if (subsData) {
      setSubmissions(subsData)
      localStorage.setItem('qw_admin_submissions', JSON.stringify(subsData))
    }

    const { data: fbData } = await supabase.from('feedback').select('*').order('created_at', { ascending: false })
    if (fbData) {
      setFeedbacks(fbData)
      localStorage.setItem('qw_admin_feedbacks', JSON.stringify(fbData))
    }

    const { data: refData } = await supabase.from('referrals').select('*')
    if (refData) {
      setReferrals(refData)
      localStorage.setItem('qw_admin_referrals', JSON.stringify(refData))
    }

    const { data: faqData } = await supabase.from('faqs').select('*').order('created_at', { ascending: false })
    if (faqData) {
      setFaqs(faqData)
      localStorage.setItem('qw_admin_faqs', JSON.stringify(faqData))
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const { data: { user } } = await supabase.auth.getUser()
    const ext = file.name.split('.').pop()
    const path = `admin/${user.id}.${ext}`
    await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
    setAdminPhoto(publicUrl)
  }

  const handleApprove = async (sub) => {
    await supabase.from('aadhaar_submissions').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', sub.id)
    await supabase.rpc('admin_update_profile', { target_user_id: sub.user_id, updates: { trust_level: 2 } })
    fetchAll()
  }

  const handleReject = async () => {
    await supabase.from('aadhaar_submissions').update({ status: 'rejected', rejection_reason: rejectReason, reviewed_at: new Date().toISOString() }).eq('id', rejectModal.id)
    await supabase.from('notices').insert({ user_id: rejectModal.user_id, message: `Your ID verification was rejected: ${rejectReason}. Please resubmit via the Validation page.`, target_page: 'validation', is_read: false })
    setRejectModal(null)
    setRejectReason('')
    fetchAll()
  }

  const handleDeleteFiles = async (sub) => {
    await supabase.from('aadhaar_submissions').update({ front_image_url: null, back_image_url: null, status: 'pending' }).eq('id', sub.id)
    fetchAll()
  }

  const handleSendNotice = async () => {
    await supabase.from('notices').insert({ user_id: noticeModal.id, message: noticeMsg, target_page: noticePage, is_read: false })
    setNoticeModal(null)
    setNoticeMsg('')
  }

  // ── FIX: use admin_update_profile RPC to bypass RLS ──────────
  const handleBlacklist = async (user) => {
    const current = profiles[user.id]?.is_blacklisted
    const { error } = await supabase.rpc('admin_update_profile', {
      target_user_id: user.id,
      updates: { is_blacklisted: !current }
    })
    if (error) { alert('Failed: ' + error.message); return }
    await fetchAll()
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return
    const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId })
    if (error) { alert('Failed to delete: ' + error.message); return }
    fetchAll()
  }

  const handleSaveFaq = async () => {
    if (faqModal === 'new') {
      await supabase.from('faqs').insert(faqForm)
    } else {
      await supabase.from('faqs').update(faqForm).eq('id', faqModal.id)
    }
    setFaqModal(null)
    setFaqForm({ category: 'Accounts', question: '', answer: '' })
    fetchAll()
  }

  const handleDeleteFaq = async (id) => {
    await supabase.from('faqs').delete().eq('id', id)
    fetchAll()
  }

  const getFilteredUsers = () => {
    const now = new Date()
    return users.filter(u => {
      const created = new Date(u.created_at)
      if (signupFilter === 'today') return created.toDateString() === now.toDateString()
      if (signupFilter === 'week') { const w = new Date(now); w.setDate(w.getDate() - 7); return created >= w }
      if (signupFilter === 'month') { const m = new Date(now); m.setMonth(m.getMonth() - 1); return created >= m }
      if (signupFilter === 'year') { const y = new Date(now); y.setFullYear(y.getFullYear() - 1); return created >= y }
      if (signupFilter === 'custom' && customStart && customEnd) return created >= new Date(customStart) && created <= new Date(customEnd)
      return true
    })
  }

  const workers = users.filter(u => u.role === 'worker')
  const businesses = users.filter(u => u.role === 'business')
  const pendingSubmissions = submissions.filter(s => s.status === 'pending')

  const filteredSearch = (list) => {
    if (!searchQuery) return list
    return list.filter(item => JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase()))
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <div className="ap-wrap">

      {/* REJECT MODAL */}
      {rejectModal && (
        <div className="ap-modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="ap-modal" onClick={e => e.stopPropagation()}>
            <h3 className="ap-modal-title">Reject Submission</h3>
            <p className="ap-modal-sub">Enter a reason — the user will see this on their Validation page.</p>
            <textarea className="ap-modal-textarea" placeholder="e.g. Photo is blurry, please reupload a clear image" value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            <div className="ap-modal-actions">
              <button className="ap-btn-cancel" onClick={() => setRejectModal(null)}>Cancel</button>
              <button className="ap-btn-confirm-reject" onClick={handleReject}>Send Rejection</button>
            </div>
          </div>
        </div>
      )}

      {/* NOTICE MODAL */}
      {noticeModal && (
        <div className="ap-modal-overlay" onClick={() => setNoticeModal(null)}>
          <div className="ap-modal" onClick={e => e.stopPropagation()}>
            <h3 className="ap-modal-title">Send Notice to {noticeModal.name}</h3>
            <p className="ap-modal-sub">Choose where this notice appears on their account.</p>
            <select className="ap-modal-select" value={noticePage} onChange={e => setNoticePage(e.target.value)}>
              <option value="dashboard">Dashboard</option>
              <option value="validation">Validation Page</option>
              <option value="profile">My Profile Page</option>
            </select>
            <textarea className="ap-modal-textarea" placeholder="Type your message..." value={noticeMsg} onChange={e => setNoticeMsg(e.target.value)} />
            <div className="ap-modal-actions">
              <button className="ap-btn-cancel" onClick={() => setNoticeModal(null)}>Cancel</button>
              <button className="ap-btn-confirm" onClick={handleSendNotice}>Send Notice</button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ MODAL */}
      {faqModal && (
        <div className="ap-modal-overlay" onClick={() => setFaqModal(null)}>
          <div className="ap-modal" onClick={e => e.stopPropagation()}>
            <h3 className="ap-modal-title">{faqModal === 'new' ? 'Add New FAQ' : 'Edit FAQ'}</h3>
            <select className="ap-modal-select" value={faqForm.category} onChange={e => setFaqForm({ ...faqForm, category: e.target.value })}>
              {['Accounts', 'Shifts', 'Payments', 'Technical App Problems'].map(c => <option key={c}>{c}</option>)}
            </select>
            <input className="ap-modal-input" placeholder="Question" value={faqForm.question} onChange={e => setFaqForm({ ...faqForm, question: e.target.value })} />
            <textarea className="ap-modal-textarea" placeholder="Answer" value={faqForm.answer} onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })} rows={5} />
            <div className="ap-modal-actions">
              <button className="ap-btn-cancel" onClick={() => setFaqModal(null)}>Cancel</button>
              <button className="ap-btn-confirm" onClick={handleSaveFaq}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div className="ap-sidebar">
        <div className="ap-profile-section">
          <label className="ap-photo-wrap">
            {adminPhoto ? <img src={adminPhoto} className="ap-photo-img" alt="admin" /> : <span className="ap-photo-placeholder">👤</span>}
            <div className="ap-photo-overlay">📷</div>
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          </label>
          <p className="ap-profile-name">This is me, Abhijeet</p>
          <p className="ap-profile-title">— the awesome Admin Bro! 😎</p>
          <div className="ap-admin-badge">⚡ ADMIN</div>
        </div>

        <div className="ap-logo-row">
          <img src={logoImg} alt="QW" className="ap-logo-img" />
          <div>
            <div className="ap-logo-text">QuickWork</div>
            <div className="ap-logo-sub">Admin Panel</div>
          </div>
        </div>

        <div className="ap-nav">
          {TABS.map(tab => (
            <div key={tab} className={`ap-nav-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              <span className="ap-nav-icon">{TAB_ICONS[tab]}</span>
              <span>{tab}</span>
              {tab === 'Validation Requests' && pendingSubmissions.length > 0 && (
                <span className="ap-nav-badge">{pendingSubmissions.length}</span>
              )}
            </div>
          ))}
        </div>

        <div className="ap-sidebar-bottom">
          <button className="ap-exit-btn" onClick={() => navigate('/worker/dashboard')}>← Exit Admin Panel</button>
        </div>
      </div>

      {/* MAIN */}
      <div className="ap-main">

        {/* TOPBAR */}
        <div className="ap-topbar">
          <div className="ap-search">
            <span className="ap-search-icon">🔍</span>
            <input className="ap-search-input" placeholder="Search any user by name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <button className="ap-exit-top" onClick={() => navigate('/worker/dashboard')}>← Exit Admin Panel</button>
        </div>

        {/* CONTENT */}
        <div className="ap-content">

          {/* ── DASHBOARD ── */}
          {activeTab === 'Dashboard' && (
            <>
              <h2 className="ap-title">Dashboard</h2>
              <div className="ap-stats-grid">
                <div className="ap-stat" onClick={() => setActiveTab('Users')}>
                  <div className="ap-stat-icon">👷</div>
                  <div className="ap-stat-num">{workers.length}</div>
                  <div className="ap-stat-label">Workers</div>
                </div>
                <div className="ap-stat" onClick={() => setActiveTab('Users')}>
                  <div className="ap-stat-icon">🏢</div>
                  <div className="ap-stat-num">{businesses.length}</div>
                  <div className="ap-stat-label">Businesses</div>
                </div>
                <div className="ap-stat orange">
                  <div className="ap-stat-icon">📋</div>
                  <div className="ap-stat-num">0</div>
                  <div className="ap-stat-label">Job Postings</div>
                </div>
                <div className="ap-stat orange">
                  <div className="ap-stat-icon">✅</div>
                  <div className="ap-stat-num">0</div>
                  <div className="ap-stat-label">Accepted Workers</div>
                </div>
                <div className="ap-stat orange">
                  <div className="ap-stat-icon">📨</div>
                  <div className="ap-stat-num">0</div>
                  <div className="ap-stat-label">Applications</div>
                </div>
              </div>

              <div className="ap-section-label">Recent Signups</div>
              <div className="ap-filter-row">
                {['today', 'week', 'month', 'year', 'custom'].map(f => (
                  <button key={f} className={`ap-filter-btn ${signupFilter === f ? 'active' : ''}`} onClick={() => setSignupFilter(f)}>
                    {f === 'today' ? 'Today' : f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : f === 'year' ? 'This Year' : 'Custom Range'}
                  </button>
                ))}
              </div>
              {signupFilter === 'custom' && (
                <div className="ap-date-range">
                  <input type="date" className="ap-date-input" value={customStart} onChange={e => setCustomStart(e.target.value)} />
                  <span className="ap-date-sep">to</span>
                  <input type="date" className="ap-date-input" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
                </div>
              )}
              {getFilteredUsers().map(u => (
                <div key={u.id}>
                  <div className="ap-user-row ap-user-row-clickable" onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}>
                    <div className="ap-avatar">{(u.name || u.email || '?')[0].toUpperCase()}</div>
                    <div>
                      <div className="ap-user-name">{u.name || '—'}</div>
                      <div className="ap-user-email">{u.email}</div>
                    </div>
                    {profiles[u.id]?.is_blacklisted && <span className="ap-blacklisted-tag">Blacklisted</span>}
                    <MiniShield level={profiles[u.id]?.trust_level || 1} />
                    <span className={`ap-role-tag ${u.role}`}>{u.role}</span>
                    <span className="ap-time">{formatDate(u.created_at)}</span>
                  </div>
                  {selectedUser?.id === u.id && (
                    <div className="ap-user-detail">
                      <div className="ap-detail-actions">
                        <button className="ap-btn-notice" onClick={() => setNoticeModal(u)}>📢 Send Notice</button>
                        <button className="ap-btn-blacklist" onClick={() => handleBlacklist(u)}>
                          {profiles[u.id]?.is_blacklisted ? '✓ Unblacklist' : '🚫 Blacklist'}
                        </button>
                        <button className="ap-btn-del-user" onClick={() => handleDeleteUser(u.id)}>🗑 Delete User</button>
                      </div>
                      <div className="ap-detail-grid">
                        <div className="ap-field"><div className="ap-field-label">Email</div><div className="ap-field-value">{u.email}</div></div>
                        <div className="ap-field"><div className="ap-field-label">Role</div><div className="ap-field-value">{u.role}</div></div>
                        <div className="ap-field"><div className="ap-field-label">Trust Level</div><div className="ap-field-value">{profiles[u.id]?.trust_level || 1}</div></div>
                        <div className="ap-field"><div className="ap-field-label">Signed Up</div><div className="ap-field-value">{formatDate(u.created_at)}</div></div>
                        <div className="ap-field"><div className="ap-field-label">Last Login</div><div className="ap-field-value">{formatDate(u.last_sign_in_at)}</div></div>
                        <div className="ap-field"><div className="ap-field-label">Blacklisted</div><div className="ap-field-value">{profiles[u.id]?.is_blacklisted ? 'Yes' : 'No'}</div></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* ── VALIDATION REQUESTS ── */}
          {activeTab === 'Validation Requests' && (
            <>
              <h2 className="ap-title">Validation Requests</h2>
              <div className="ap-filter-row">
                {['all', 'pending', 'approved', 'rejected'].map(f => (
                  <button key={f} className="ap-filter-btn">{f.charAt(0).toUpperCase() + f.slice(1)}</button>
                ))}
              </div>
              {submissions.length === 0 && <div className="ap-empty">No submissions yet.</div>}
              {submissions.map(sub => (
                <div key={sub.id} className="ap-approval-card">
                  <div className="ap-approval-header">
                    <div className="ap-avatar">{(sub.full_name || '?')[0]}</div>
                    <div>
                      <div className="ap-user-name">{sub.full_name}</div>
                      <div className="ap-user-email">Submitted {formatDate(sub.submitted_at)}</div>
                    </div>
                    <span className={`ap-status-tag ${sub.status}`}>{sub.status}</span>
                  </div>
                  <div className="ap-approval-fields">
                    <div className="ap-field"><div className="ap-field-label">Full Name (as on Aadhaar)</div><div className="ap-field-value">{sub.full_name || '—'}</div></div>
                    <div className="ap-field"><div className="ap-field-label">Date of Birth</div><div className="ap-field-value">{sub.date_of_birth || '—'}</div></div>
                    <div className="ap-field"><div className="ap-field-label">Gender</div><div className="ap-field-value">{sub.gender || '—'}</div></div>
                    <div className="ap-field"><div className="ap-field-label">Address</div><div className="ap-field-value">{sub.address || '—'}</div></div>
                  </div>
                  <div className="ap-doc-row">
                    {sub.front_image_url ? <a href={sub.front_image_url} target="_blank" rel="noreferrer" className="ap-doc-box">📄 Aadhaar Front — View</a> : <div className="ap-doc-box ap-doc-empty">No front image</div>}
                    {sub.back_image_url ? <a href={sub.back_image_url} target="_blank" rel="noreferrer" className="ap-doc-box">📄 Aadhaar Back — View</a> : <div className="ap-doc-box ap-doc-empty">No back image</div>}
                  </div>
                  {sub.status === 'pending' && (
                    <div className="ap-approval-actions">
                      <button className="ap-btn-approve" onClick={() => handleApprove(sub)}>✓ Approve</button>
                      <button className="ap-btn-reject" onClick={() => setRejectModal(sub)}>✕ Reject with Reason</button>
                      <button className="ap-btn-del-files" onClick={() => handleDeleteFiles(sub)}>🗑 Delete Files</button>
                    </div>
                  )}
                  {sub.status === 'rejected' && sub.rejection_reason && (
                    <div className="ap-rejection-reason">Rejection reason: {sub.rejection_reason}</div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* ── USERS ── */}
          {activeTab === 'Users' && (
            <>
              <h2 className="ap-title">All Users</h2>
              {filteredSearch(users).map(u => (
                <div key={u.id}>
                  <div className="ap-user-row ap-user-row-clickable" onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}>
                    <div className="ap-avatar">{(u.name || u.email || '?')[0].toUpperCase()}</div>
                    <div>
                      <div className="ap-user-name">{u.name || '—'}</div>
                      <div className="ap-user-email">{u.email} · Last login: {formatDate(u.last_sign_in_at)}</div>
                    </div>
                    {profiles[u.id]?.is_blacklisted && <span className="ap-blacklisted-tag">Blacklisted</span>}
                    <MiniShield level={profiles[u.id]?.trust_level || 1} />
                    <span className={`ap-role-tag ${u.role}`}>{u.role}</span>
                  </div>
                  {selectedUser?.id === u.id && (
                    <div className="ap-user-detail">
                      <div className="ap-detail-actions">
                        <button className="ap-btn-notice" onClick={() => setNoticeModal(u)}>📢 Send Notice</button>
                        <button className="ap-btn-blacklist" onClick={() => handleBlacklist(u)}>
                          {profiles[u.id]?.is_blacklisted ? '✓ Unblacklist' : '🚫 Blacklist'}
                        </button>
                        <button className="ap-btn-del-user" onClick={() => handleDeleteUser(u.id)}>🗑 Delete User</button>
                      </div>
                      <div className="ap-detail-grid">
                        <div className="ap-field"><div className="ap-field-label">Email</div><div className="ap-field-value">{u.email}</div></div>
                        <div className="ap-field"><div className="ap-field-label">Role</div><div className="ap-field-value">{u.role}</div></div>
                        <div className="ap-field"><div className="ap-field-label">Trust Level</div><div className="ap-field-value">{profiles[u.id]?.trust_level || 1}</div></div>
                        <div className="ap-field"><div className="ap-field-label">Signed Up</div><div className="ap-field-value">{formatDate(u.created_at)}</div></div>
                        <div className="ap-field"><div className="ap-field-label">Last Login</div><div className="ap-field-value">{formatDate(u.last_sign_in_at)}</div></div>
                        <div className="ap-field"><div className="ap-field-label">Blacklisted</div><div className="ap-field-value">{profiles[u.id]?.is_blacklisted ? 'Yes' : 'No'}</div></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* ── REFERRALS ── */}
          {activeTab === 'Referrals' && (
            <>
              <h2 className="ap-title">Referrals</h2>
              {referrals.map(r => (
                <div key={r.id} className="ap-user-row">
                  <div className="ap-avatar">{r.referral_code?.[3] || 'R'}</div>
                  <div>
                    <div className="ap-user-name">Code: {r.referral_code}</div>
                    <div className="ap-user-email">{r.referred_by ? `Referred by: ${r.referred_by}` : 'No referrer'}</div>
                  </div>
                </div>
              ))}
              {referrals.length === 0 && <div className="ap-empty">No referral data yet.</div>}
            </>
          )}

          {/* ── FEEDBACK ── */}
          {activeTab === 'Feedback' && (
            <>
              <h2 className="ap-title">Feedback</h2>
              <div className="ap-search ap-feedback-search">
                <span className="ap-search-icon">🔍</span>
                <input className="ap-search-input" placeholder="Search by user name or keyword in feedback..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              {filteredSearch(feedbacks).map(fb => (
                <div key={fb.id} className="ap-feedback-card">
                  <div className="ap-feedback-header">
                    <div className="ap-avatar">{(fb.user_name || '?')[0]}</div>
                    <div>
                      <div className="ap-user-name">{fb.user_name}</div>
                      <div className="ap-user-email">{fb.user_email} · {fb.user_role} · {formatDate(fb.created_at)}</div>
                    </div>
                    {fb.q4_business_rating && <span className="ap-rating">⭐ {fb.q4_business_rating}</span>}
                  </div>
                  {fb.q1_improvement && <div className="ap-fb-row"><span className="ap-fb-label">Improve:</span> {fb.q1_improvement}</div>}
                  {fb.q2_likes && <div className="ap-fb-row"><span className="ap-fb-label">Likes:</span> {fb.q2_likes}</div>}
                  {fb.q3_challenges && <div className="ap-fb-row"><span className="ap-fb-label">Challenges:</span> {fb.q3_challenges}</div>}
                  {fb.q4_business_comment && <div className="ap-fb-row"><span className="ap-fb-label">Business comment:</span> {fb.q4_business_comment}</div>}
                </div>
              ))}
              {feedbacks.length === 0 && <div className="ap-empty">No feedback yet.</div>}
            </>
          )}

          {/* ── FAQ MANAGER ── */}
          {activeTab === 'FAQ Manager' && (
            <>
              <div className="ap-title-row">
                <h2 className="ap-title">FAQ Manager</h2>
                <button className="ap-add-btn" onClick={() => { setFaqModal('new'); setFaqForm({ category: 'Accounts', question: '', answer: '' }) }}>+ Add FAQ</button>
              </div>
              <div className="ap-filter-row">
                {['Accounts', 'Shifts', 'Payments', 'Technical App Problems'].map(cat => (
                  <button key={cat} className="ap-filter-btn">{cat}</button>
                ))}
              </div>
              {faqs.map(faq => (
                <div key={faq.id} className="ap-faq-row">
                  <span className="ap-faq-cat">{faq.category}</span>
                  <div className="ap-faq-q">{faq.question}</div>
                  <button className="ap-btn-edit" onClick={() => { setFaqModal(faq); setFaqForm({ category: faq.category, question: faq.question, answer: faq.answer }) }}>Edit</button>
                  <button className="ap-btn-del-faq" onClick={() => handleDeleteFaq(faq.id)}>Delete</button>
                </div>
              ))}
              {faqs.length === 0 && <div className="ap-empty">No FAQs yet.</div>}
            </>
          )}

          {/* ── RECENT LOGINS ── */}
          {activeTab === 'Recent Logins' && (
            <>
              <h2 className="ap-title">Recent Logins</h2>
              <div className="ap-filter-row">
                {['today', 'week', 'month', 'custom'].map(f => (
                  <button key={f} className={`ap-filter-btn ${signupFilter === f ? 'active' : ''}`} onClick={() => setSignupFilter(f)}>
                    {f === 'today' ? 'Today' : f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : 'Custom Range'}
                  </button>
                ))}
              </div>
              {[...users].sort((a, b) => new Date(b.last_sign_in_at) - new Date(a.last_sign_in_at)).map(u => (
                <div key={u.id} className="ap-user-row">
                  <div className="ap-avatar">{(u.name || u.email || '?')[0].toUpperCase()}</div>
                  <div>
                    <div className="ap-user-name">{u.name || '—'}</div>
                    <div className="ap-user-email">{u.email}</div>
                  </div>
                  <span className={`ap-role-tag ${u.role}`}>{u.role}</span>
                  <span className="ap-time">{formatDate(u.last_sign_in_at)}</span>
                </div>
              ))}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
