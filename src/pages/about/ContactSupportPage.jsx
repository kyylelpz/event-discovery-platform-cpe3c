import { useState } from 'react'

const styles = `
  .contact-form {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    max-width: 560px;
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
    color: #4a4540;
  }

  .contact-field input,
  .contact-field select,
  .contact-field textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1.5px solid #e2ddd8;
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.95rem;
    color: #1a1714;
    background: #faf9f7;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    resize: vertical;
  }

  .contact-field input:focus,
  .contact-field select:focus,
  .contact-field textarea:focus {
    border-color: #c17f4a;
    box-shadow: 0 0 0 3px rgba(193,127,74,0.12);
    background: #fff;
  }

  .contact-field textarea {
    min-height: 130px;
  }

  .contact-submit {
    align-self: flex-start;
    padding: 0.75rem 2rem;
    background: #1a1714;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }

  .contact-submit:hover { background: #333; }
  .contact-submit:disabled { opacity: 0.5; cursor: not-allowed; }

  .contact-success {
    background: #f0fdf4;
    border: 1px solid #86efac;
    color: #16a34a;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    font-size: 0.9rem;
    max-width: 560px;
  }

  .contact-channels {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: #4a4540;
  }

  .contact-channels a {
    color: #c17f4a;
    text-decoration: none;
  }

  .contact-channels a:hover { text-decoration: underline; }
`

function ContactSupportPage() {
  const [form, setForm] = useState({ name: '', email: '', topic: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setSubmitted(true)
  }

  return (
    <div className="info-page">
      <style>{styles}</style>

      <section className="info-page__hero">
        <h1>Contact Support</h1>
        <p>
          Have a question, spotted an issue, or want to share feedback? Send us
          a message and we'll get back to you as soon as we can.
        </p>
      </section>

      <section className="info-page__grid">
        <div style={{ gridColumn: 'span 2' }}>
          {submitted ? (
            <div className="contact-success">
              ✓ Thanks for reaching out! We've received your message and will
              reply to <strong>{form.email}</strong> shortly.
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-field">
                <label htmlFor="c-name">Your name</label>
                <input id="c-name" type="text" placeholder="Juan dela Cruz" value={form.name} onChange={set('name')} />
              </div>
              <div className="contact-field">
                <label htmlFor="c-email">Email address</label>
                <input id="c-email" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
              </div>
              <div className="contact-field">
                <label htmlFor="c-topic">Topic</label>
                <select id="c-topic" value={form.topic} onChange={set('topic')}>
                  <option value="">Select a topic…</option>
                  <option value="event-issue">Event issue</option>
                  <option value="account">Account help</option>
                  <option value="bug">Bug report</option>
                  <option value="feedback">General feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="contact-field">
                <label htmlFor="c-message">Message</label>
                <textarea id="c-message" placeholder="Describe your issue or question…" value={form.message} onChange={set('message')} />
              </div>
              <button type="submit" className="contact-submit" disabled={!form.name || !form.email || !form.message}>
                Send message
              </button>
            </form>
          )}
        </div>

        <article className="info-card">
          <h2>Other ways to reach us</h2>
          <div className="contact-channels">
            <span>📧 <a href="mailto:support@eventcinity.com">support@eventcinity.com</a></span>
            <span>🕐 Response time: within 1–2 business days</span>
            <span>📍 Based in the Philippines</span>
          </div>
        </article>

        <article className="info-card">
          <h2>Before you write</h2>
          <p>
            Check the Help Center for quick answers to common questions about
            creating events, saving listings, and managing your profile. Many
            issues are solved in under a minute.
          </p>
        </article>
      </section>
    </div>
  )
}

export default ContactSupportPage
