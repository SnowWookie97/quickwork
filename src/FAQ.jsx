import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import DashNav from './DashNav'
import './FAQ.css'

const FAQS = [
  {
    question: "What do I do if I want to register as both a business and a worker on QuickWork?",
    answer: "QuickWork currently does not support dual registrations under the same account. If you wish to operate as both a business and a worker on the platform, you will need to create two separate accounts using different registration details (mobile number, email address, etc.).\n\nAlternatively, you may delete your existing account and re-register with the same details under your preferred role. To request an account deletion, please write to us via email — you can find our contact details on the Contact Us page."
  }
]

function FAQ() {
  const navigate = useNavigate()
  const [userRole, setUserRole] = useState(null)
  const [openIndex, setOpenIndex] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUserRole(user.user_metadata?.role)
    }
    getUser()
  }, [])

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  return (
    <div className="faq-page">
      <DashNav userRole={userRole} />

      <div className="faq-body">
        <div className="faq-hero">
          <h1 className="faq-title">Frequently Asked <span className="faq-orange">Questions</span></h1>
          <p className="faq-sub">Can't find what you're looking for? Reach out via our <span className="faq-link" onClick={() => navigate('/contact')}>Contact Us</span> page.</p>
        </div>

        <div className="faq-list">
          {FAQS.map((faq, i) => (
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
          ))}
        </div>

        <div className="faq-contact-card">
          <span className="faq-contact-icon">💬</span>
          <div>
            <h3 className="faq-contact-title">Still have questions?</h3>
            <p className="faq-contact-sub">Our team is happy to help. Get in touch with us directly.</p>
          </div>
          <button className="faq-contact-btn" onClick={() => navigate('/contact')}>Contact Us →</button>
        </div>
      </div>
    </div>
  )
}

export default FAQ
