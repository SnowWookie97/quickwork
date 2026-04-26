import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import DashNav from './DashNav'
import './Ratings.css'

function StarDisplay({ value, size = 20 }) {
  return (
    <div className="star-display">
      {[1, 2, 3, 4, 5].map(star => {
        const full = value >= star
        const half = value >= star - 0.5 && value < star
        return (
          <svg key={star} width={size} height={size} viewBox="0 0 24 24">
            <defs>
              <clipPath id={`half-d-${star}`}>
                <rect x="0" y="0" width="12" height="24" />
              </clipPath>
            </defs>
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill="#e0e0e0" stroke="#e0e0e0" strokeWidth="1" />
            {full && <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill="#E8470F" stroke="#E8470F" strokeWidth="1" />}
            {half && <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill="#E8470F" stroke="#E8470F" strokeWidth="1" clipPath={`url(#half-d-${star})`} />}
          </svg>
        )
      })}
    </div>
  )
}

function StarInput({ value, onChange }) {
  const [hovered, setHovered] = useState(null)
  const display = hovered !== null ? hovered : value

  return (
    <div className="star-input">
      {[1, 2, 3, 4, 5].map(star => {
        const full = display >= star
        const half = display >= star - 0.5 && display < star
        return (
          <div key={star} className="star-input-wrap" onMouseLeave={() => setHovered(null)}>
            <div className="star-zone left"
              onMouseEnter={() => setHovered(star - 0.5)}
              onClick={() => onChange(star - 0.5)} />
            <div className="star-zone right"
              onMouseEnter={() => setHovered(star)}
              onClick={() => onChange(star)} />
            <svg width="32" height="32" viewBox="0 0 24 24" style={{ pointerEvents: 'none' }}>
              <defs>
                <clipPath id={`half-i-${star}`}>
                  <rect x="0" y="0" width="12" height="24" />
                </clipPath>
              </defs>
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill="#e0e0e0" stroke="#e0e0e0" strokeWidth="1" />
              {full && <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill="#E8470F" stroke="#E8470F" strokeWidth="1" />}
              {half && <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill="#E8470F" stroke="#E8470F" strokeWidth="1" clipPath={`url(#half-i-${star})`} />}
            </svg>
          </div>
        )
      })}
      <span className="star-input-val">{display > 0 ? `${display} / 5` : 'Tap to rate'}</span>
    </div>
  )
}

function Ratings() {
  const navigate = useNavigate()
  const [userRole, setUserRole] = useState(null)
  const [activeTab, setActiveTab] = useState('my-ratings')
  const [workerRatings, setWorkerRatings] = useState([])
  const [businessRatings, setBusinessRatings] = useState([])
  const [avgRating, setAvgRating] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editStars, setEditStars] = useState(0)
  const [editComment, setEditComment] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUserRole(user.user_metadata?.role)

      // Fetch ratings received by this worker
      const { data: wr } = await supabase
        .from('worker_ratings')
        .select('*')
        .eq('worker_id', user.id)
        .order('created_at', { ascending: false })
      if (wr && wr.length > 0) {
        setWorkerRatings(wr)
        const avg = wr.reduce((sum, r) => sum + parseFloat(r.stars), 0) / wr.length
        setAvgRating(Math.round(avg * 10) / 10)
      }

      // Fetch ratings given by this worker to businesses
      const { data: br } = await supabase
        .from('business_ratings')
        .select('*')
        .eq('worker_id', user.id)
        .order('created_at', { ascending: false })
      if (br) setBusinessRatings(br)

      setLoading(false)
    }
    load()
  }, [])

  const handleEditSave = async (id) => {
    setSaving(true)
    await supabase.from('business_ratings').update({
      stars: editStars,
      comment: editComment,
      updated_at: new Date().toISOString()
    }).eq('id', id)
    setBusinessRatings(prev => prev.map(r => r.id === id ? { ...r, stars: editStars, comment: editComment } : r))
    setEditingId(null)
    setSaving(false)
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  const ratingLabel = (stars) => {
    if (stars >= 4.5) return { text: 'Excellent', color: '#0F6E56' }
    if (stars >= 3.5) return { text: 'Good', color: '#185FA5' }
    if (stars >= 2.5) return { text: 'Average', color: '#854F0B' }
    return { text: 'Below average', color: '#c53030' }
  }

  return (
    <div className="rat-page">
      <DashNav userRole={userRole} />

      <div className="rat-body">

        {/* LEFT — MY RATING SUMMARY */}
        <div className="rat-left">
          <div className="rat-summary-card">
            <p className="rat-summary-label">Your average rating</p>
            {avgRating !== null ? (
              <>
                <div className="rat-big-score">{avgRating}</div>
                <StarDisplay value={avgRating} size={24} />
                <div className="rat-rating-label" style={{ color: ratingLabel(avgRating).color }}>
                  {ratingLabel(avgRating).text}
                </div>
                <p className="rat-summary-sub">Based on {workerRatings.length} shift{workerRatings.length !== 1 ? 's' : ''}</p>
              </>
            ) : (
              <>
                <div className="rat-big-score rat-big-score-empty">—</div>
                <StarDisplay value={0} size={24} />
                <p className="rat-summary-sub">No ratings yet</p>
              </>
            )}
          </div>

          <div className="rat-info-card">
            <div className="rat-info-icon">ℹ️</div>
            <p className="rat-info-text">Businesses rate you after each completed shift. Your rating is visible to all businesses when you apply.</p>
          </div>
        </div>

        {/* RIGHT — TABS */}
        <div className="rat-right">
          <div className="rat-tabs">
            <button className={`rat-tab ${activeTab === 'my-ratings' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-ratings')}>
              Ratings I Received
            </button>
            <button className={`rat-tab ${activeTab === 'given' ? 'active' : ''}`}
              onClick={() => setActiveTab('given')}>
              Ratings I Gave
            </button>
          </div>
          <div className="rat-tab-divider" />

          {loading ? (
            <div className="rat-empty"><p className="rat-empty-title">Loading...</p></div>
          ) : activeTab === 'my-ratings' ? (
            workerRatings.length === 0 ? (
              <div className="rat-empty">
                <div className="rat-empty-icon">⭐</div>
                <h3 className="rat-empty-title">No ratings yet</h3>
                <p className="rat-empty-sub">Once you complete a shift, businesses will be able to rate your performance here.</p>
              </div>
            ) : (
              <div className="rat-list">
                {workerRatings.map(r => (
                  <div key={r.id} className="rat-card">
                    <div className="rat-card-header">
                      <div className="rat-card-avatar">{r.business_id?.toString()[0]?.toUpperCase() || 'B'}</div>
                      <div className="rat-card-info">
                        <div className="rat-card-name">Business</div>
                        <div className="rat-card-date">{formatDate(r.created_at)}</div>
                      </div>
                      <div className="rat-card-stars">
                        <StarDisplay value={parseFloat(r.stars)} size={18} />
                        <span className="rat-card-score">{r.stars} / 5</span>
                      </div>
                    </div>
                    {r.comment && <p className="rat-card-comment">"{r.comment}"</p>}
                  </div>
                ))}
              </div>
            )
          ) : (
            businessRatings.length === 0 ? (
              <div className="rat-empty">
                <div className="rat-empty-icon">🏢</div>
                <h3 className="rat-empty-title">You haven't rated any businesses yet</h3>
                <p className="rat-empty-sub">After completing a shift, you'll be able to rate the business here. Your feedback helps other workers.</p>
              </div>
            ) : (
              <div className="rat-list">
                {businessRatings.map(r => (
                  <div key={r.id} className="rat-card">
                    {editingId === r.id ? (
                      <div className="rat-edit-form">
                        <p className="rat-edit-label">Edit your rating</p>
                        <StarInput value={editStars} onChange={setEditStars} />
                        <textarea className="rat-edit-textarea"
                          placeholder="Update your comment (optional)..."
                          value={editComment}
                          onChange={e => setEditComment(e.target.value)} />
                        <div className="rat-edit-actions">
                          <button className="rat-cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                          <button className="rat-save-btn" onClick={() => handleEditSave(r.id)} disabled={saving}>
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="rat-card-header">
                          <div className="rat-card-avatar">🏢</div>
                          <div className="rat-card-info">
                            <div className="rat-card-name">Business</div>
                            <div className="rat-card-date">{formatDate(r.created_at)}</div>
                          </div>
                          <div className="rat-card-stars">
                            <StarDisplay value={parseFloat(r.stars)} size={18} />
                            <span className="rat-card-score">{r.stars} / 5</span>
                          </div>
                        </div>
                        {r.comment && <p className="rat-card-comment">"{r.comment}"</p>}
                        <button className="rat-edit-btn" onClick={() => {
                          setEditingId(r.id)
                          setEditStars(parseFloat(r.stars))
                          setEditComment(r.comment || '')
                        }}>Edit rating</button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default Ratings
