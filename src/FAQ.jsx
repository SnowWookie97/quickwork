import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import DashNav from './DashNav'
import './FAQ.css'

const CATEGORIES = [
  { label: 'Accounts', short: 'Accounts' },
  { label: 'Shifts', short: 'Shifts' },
  { label: 'Payments', short: 'Payments' },
  { label: 'Technical App Problems', short: 'Technical' },
]

const FAQS = {
  'Accounts': [
    {
      question: "What do I do if I want to register as both a business and a worker on QuickWork?",
      answer: "QuickWork currently does not support dual registrations under the same account. If you wish to operate as both a business and a worker on the platform, you will need to create two separate accounts using different registration details (mobile number, email address, etc.).\n\nAlternatively, you may delete your existing account and re-register with the same details under your preferred role. To request an account deletion, please write to us via email — you can find our contact details on the Contact Us page."
    }
  ],
  'Shifts': [],
  'Payments': [],
  'Technical App Problems': []
}

function FAQ() {
  const navigate = useNavigate()
  const [userRole, setUserRole] = useState(null)
  const [activeCategory, setActiveCategory] = useState('Accounts')
  const [openIndex, setOpenIndex] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [faqData, setFaqData] = useState({})

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUserRole(user.user_metadata?.role)
    }
    getUser()

    const fetchFaqs = async () => {
      const { data } = await supabase.from('faqs').select('*').order('created_at', { ascending: true })
      if (data) {
        const grouped = {}
        CATEGORIES.forEach(cat => { grouped[cat] = [] })
        data.forEach(faq => {
          if (grouped[faq.category]) grouped[faq.category].push(faq)
        })
        setFaqData(grouped)
      }
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
                  key={cat.label}
                  className={`faq-tab ${activeCategory === cat.label ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.label)}
                >
                  {isMobile ? cat.short : cat.label}
                </button>
              ))}
            </div>

            <div className="faq-tab-divider" />

            <div className="faq-list">
              {currentFAQs.length === 0 ? (
                <div className="faq-empty">
                  <div className="faq-empty-icon">📭</div>
                  <p className="faq-empty-title">No FAQs in this category yet</p>
                  <p className="faq-empty-sub">We're adding more answers soon. In the meantime, feel free to contact us directly.</p>
                </div>
              ) : (
                currentFAQs.map((faq, i) => (
                  <div key={i} className={`faq-item ${openIndex === i ? 'open' : ''}`}>
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
