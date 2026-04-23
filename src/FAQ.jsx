import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import DashNav from './DashNav'
import './FAQ.css'

const CATEGORIES = ['Accounts', 'Shifts', 'Payments', 'Technical App Problems']

function FAQ() {
  const navigate = useNavigate()
  const [userRole, setUserRole] = useState(null)
  const [activeCategory, setActiveCategory] = useState('Accounts')
  const [openIndex, setOpenIndex] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [faqData, setFaqData] = useState(() => {
    const cached = localStorage.getItem('qw_faq_data')
    return cached ? JSON.parse(cached) : {}
  })
  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem('qw_faq_data')
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUserRole(user.user_metadata?.role)
    }
    getUser()

    const fetchFaqs = async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('created_at', { ascending: true })

      const grouped = {}
      CATEGORIES.forEach(cat => { grouped[cat] = [] })

      if (data) {
        data.forEach(faq => {
          if (grouped[faq.category] !== undefined) {
            grouped[faq.category].push(faq)
          }
        })
      }
      setFaqData(grouped)
      localStorage.setItem('qw_faq_data', JSON.stringify(grouped))
      setLoading(false)
    }
    fetchFaqs()

    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    setOpenIndex(null)
  }

  const currentFAQs = faqData[activeCategory] || []

  const ContactCard = () => (
    <div className="faq-contact-card">
      <div className="faq-contact-icon">💬</div>
      <div className="faq-contact-text">
        <h3 className="faq-contact-title">Still have questions?</h3>
        <p className="faq-contact-sub">Our team is happy to help. Get in touch with us directly.</p>
      </div>
      <button className="faq-contact-btn" onClick={() => navigate('/contact')}>Contact Us →</button>
    </div>
  )

  return (
    <div className="faq-page">
      <DashNav userRole={userRole} />

      <div className="faq-hero">
        <h1 className="faq-title">Frequently Asked <span className="faq-orange">Questions</span></h1>
        <p className="faq-sub">Browse by category or reach out if you can't find your answer.</p>
      </div>

      <div className="faq-body">

        <div className="faq-left">
          <div className="faq-card">
            <div className="faq-tabs">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`faq-tab ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat)}
                >
                  {isMobile ? cat.replace('Technical App Problems', 'Technical') : cat}
                </button>
              ))}
            </div>

            <div className="faq-tab-divider" />

            <div className="faq-list">
              {loading ? (
                <div className="faq-empty">
                  <p className="faq-empty-title">Loading...</p>
                </div>
              ) : currentFAQs.length === 0 ? (
                <div className="faq-empty">
                  <div className="faq-empty-icon">📭</div>
                  <p className="faq-empty-title">No FAQs in this category yet</p>
                  <p className="faq-empty-sub">We're adding more answers soon. In the meantime, feel free to contact us directly.</p>
                </div>
              ) : (
                currentFAQs.map((faq, i) => (
                  <div key={faq.id || i} className={`faq-item ${openIndex === i ? 'open' : ''}`}>
                    <button className="faq-question" onClick={() => toggle(i)}>
                      <span>{faq.question}</span>
                      <span className="faq-chevron">{openIndex === i ? '▲' : '▼'}</span>
                    </button>
                    {openIndex === i && (
                      <div className="faq-answer">
                        {faq.answer.split('\n\n').map((para, j) => (
                          <p key={j}>{para}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {isMobile && <ContactCard />}
        </div>

        {!isMobile && (
          <div className="faq-right">
            <ContactCard />
          </div>
        )}

      </div>
    </div>
  )
}

export default FAQ
