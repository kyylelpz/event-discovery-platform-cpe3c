import { useState } from 'react'
import { HelpCircleIcon, MailIcon, MessageCircleIcon } from '../../components/ui/Icons.jsx'

const styles = `
  .contact-support-hero {
    justify-items: center;
    text-align: center;
  }

  .contact-support-grid {
    align-items: start;
  }

  .contact-support__main {
    grid-column: span 2;
    display: grid;
    align-content: start;
  }

  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    max-width: 560px;
    width: 100%;
  }

  .contact-field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .contact-field label {
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--color-text);
  }

  .contact-field input,
  .contact-field select,
  .contact-field textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1.5px solid var(--color-border);
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.95rem;
    color: var(--color-text);
    background: var(--color-input-bg);
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    resize: vertical;
  }

  .contact-field input:focus,
  .contact-field select:focus,
  .contact-field textarea:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(193,127,74,0.12);
    background: var(--color-input-focus-bg);
  }

  .contact-field textarea {
    min-height: 130px;
  }

  .contact-submit {
    align-self: flex-start;
    padding: 0.75rem 2rem;
    background: var(--color-text);
    color: var(--color-bg);
    border: none;
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }

  .contact-submit:hover { background: var(--color-accent); }
  .contact-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .contact-success {
    background: var(--color-success-bg);
    border: 1px solid var(--color-success-border);
    color: var(--color-success-text);
    border-radius: 8px;
    padding: 1rem 1.25rem;
    font-size: 0.9rem;
    max-width: 560px;
    width: 100%;
  }

  .contact-channels {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--color-text);
  }

  .contact-channels a {
    color: var(--color-accent);
    text-decoration: none;
  }

  .contact-side-card {
    align-content: start;
    gap: 12px;
    height: 100%;
    padding-top: 28px;
    padding-bottom: 28px;
  }

  .contact-side-card .info-card__header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .contact-side-card .info-card__icon {
    flex: 0 0 auto;
  }

  .contact-side-card .info-card__header h2 {
    line-height: 1.2;
  }

  .contact-channels a:hover { text-decoration: underline; }

  @media (max-width: 1200px) {
    .contact-support__main {
      grid-column: auto;
    }
  }
`

function ContactSupportPage() {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const set = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setSubmitted(true)
  }

  return (
    <div className="info-page">
      <style>{styles}</style>

      <section className="info-page__hero contact-support-hero">
        <div className="info-page__hero-icon">
          <MessageCircleIcon />
        </div>
        <h1>Contact Support</h1>
        <p>
          Have a question, spotted an issue, or want to share feedback? Send us a
          message and we will get back to you as soon as we can.
        </p>
      </section>

      <section className="info-page__grid contact-support-grid">
        <div className="contact-support__main">
          {submitted ? (
            <div className="contact-success">
              Thanks for reaching out. We have received your message and will reply to{' '}
              <strong>{form.email}</strong> shortly.
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-field">
                <label htmlFor="c-name">Your name</label>
                <input
                  id="c-name"
                  type="text"
                  placeholder="Juan dela Cruz"
                  value={form.name}
                  onChange={set('name')}
                />
              </div>
              <div className="contact-field">
                <label htmlFor="c-email">Email address</label>
                <input
                  id="c-email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set('email')}
                />
              </div>
              <div className="contact-field">
                <label htmlFor="c-topic">Topic</label>
                <select id="c-topic" value={form.topic} onChange={set('topic')}>
                  <option value="">Select a topic...</option>
                  <option value="event-issue">Event issue</option>
                  <option value="account">Account help</option>
                  <option value="bug">Bug report</option>
                  <option value="feedback">General feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="contact-field">
                <label htmlFor="c-message">Message</label>
                <textarea
                  id="c-message"
                  placeholder="Describe your issue or question..."
                  value={form.message}
                  onChange={set('message')}
                />
              </div>
              <button
                type="submit"
                className="contact-submit"
                disabled={!form.name || !form.email || !form.message}
              >
                Send message
              </button>
            </form>
          )}
        </div>

        <article className="info-card contact-side-card">
          <div className="info-card__header">
            <div className="info-card__icon">
              <MailIcon />
            </div>
            <h2>Other ways to reach us</h2>
          </div>
          <div className="contact-channels">
            <span>Email: <a href="mailto:support@eventcinity.com">support@eventcinity.com</a></span>
            <span>Response time: within 1-2 business days</span>
            <span>Based in the Philippines</span>
          </div>
        </article>

        <article className="info-card contact-side-card">
          <div className="info-card__header">
            <div className="info-card__icon">
              <HelpCircleIcon />
            </div>
            <h2>Before you write</h2>
          </div>
          <p>
            Check the Help Center for quick answers to common questions about creating
            events, saving listings, and managing your profile. Many issues are solved in
            under a minute.
          </p>
        </article>
      </section>
    </div>
  )
}

export default ContactSupportPage
