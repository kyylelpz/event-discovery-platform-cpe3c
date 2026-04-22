import { useState } from 'react'
import {
  getUsernameValidationError,
  normalizeUsername,
} from '../../services/authService.js'

const ALL_INTERESTS = [
  { label: 'Music', emoji: '\uD83C\uDFB5' },
  { label: 'Art & Culture', emoji: '\uD83C\uDFA8' },
  { label: 'Food & Drink', emoji: '\uD83C\uDF5C' },
  { label: 'Sports', emoji: '\u26BD' },
  { label: 'Tech', emoji: '\uD83D\uDCBB' },
  { label: 'Business', emoji: '\uD83D\uDCBC' },
  { label: 'Wellness', emoji: '\uD83E\uDDD8' },
  { label: 'Education', emoji: '\uD83D\uDCDA' },
  { label: 'Community', emoji: '\uD83E\uDD1D' },
  { label: 'Travel', emoji: '\u2708\uFE0F' },
  { label: 'Film & Media', emoji: '\uD83C\uDFAC' },
  { label: 'Fashion', emoji: '\uD83D\uDC57' },
]

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500&display=swap');

  .interests-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    background: #ffffff;
    font-family: 'DM Sans', sans-serif;
  }

  .interests-box {
    width: 100%;
    max-width: 560px;
    background: #fff;
    border-radius: 16px;
    padding: 2.5rem 2rem;
    box-shadow: 0 4px 24px rgba(0,0,0,0.10);
    box-sizing: border-box;
  }

  .interests-header {
    margin-bottom: 0.5rem;
  }

  .interests-header h1 {
    font-family: 'DM Serif Display', serif;
    font-size: 1.75rem;
    font-weight: 400;
    color: #1a1714;
    margin: 0 0 0.4rem;
  }

  .interests-header p {
    font-size: 0.9rem;
    color: #7a7068;
    margin: 0 0 1.5rem;
  }

  .interests-field {
    display: grid;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .interests-field label {
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #4a4540;
  }

  .interests-field input {
    width: 100%;
    padding: 0.85rem 1rem;
    border: 1.5px solid #e2ddd8;
    border-radius: 10px;
    background: #faf9f7;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    color: #1a1714;
    box-sizing: border-box;
  }

  .interests-field input:focus {
    outline: none;
    border-color: #c17f4a;
    box-shadow: 0 0 0 3px rgba(193, 127, 74, 0.12);
    background: #fff;
  }

  .interests-field small {
    color: #7a7068;
    font-size: 0.8rem;
  }

  .interests-error {
    margin: 0 0 1rem;
    padding: 0.85rem 1rem;
    border: 1px solid #f0b6af;
    border-radius: 10px;
    background: #fff3f1;
    color: #b2402c;
    font-size: 0.85rem;
  }

  .interests-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.75rem;
  }

  .interest-chip {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    padding: 1rem 0.5rem;
    border: 1.5px solid #e2ddd8;
    border-radius: 12px;
    background: #faf9f7;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    color: #4a4540;
    transition: all 0.15s;
  }

  .interest-chip:hover {
    border-color: #c17f4a;
    background: #fff7ed;
  }

  .interest-chip.selected {
    border-color: #c17f4a;
    background: #fff7ed;
    color: #c17f4a;
    font-weight: 500;
  }

  .interest-chip .emoji {
    font-size: 1.5rem;
  }

  .interests-hint {
    font-size: 0.8rem;
    color: #bbb5ae;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .interests-submit {
    width: 100%;
    padding: 0.85rem;
    background: #1a1714;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }

  .interests-submit:hover { background: #333; }
  .interests-submit:disabled { opacity: 0.4; cursor: not-allowed; }

  .interests-skip {
    width: 100%;
    margin-top: 0.75rem;
    padding: 0.6rem;
    background: none;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    color: #7a7068;
    cursor: pointer;
  }

  .interests-skip:hover { text-decoration: underline; }
  .interests-skip:disabled { opacity: 0.4; cursor: not-allowed; }
`

function InterestsPage({ user, onDone }) {
  const [selected, setSelected] = useState(
    Array.isArray(user?.interests) ? user.interests : [],
  )
  const [username, setUsername] = useState(user?.username || '')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const normalizedUsername = normalizeUsername(username)
  const usernameError = getUsernameValidationError(normalizedUsername)
  const usernamePreview = normalizedUsername ? `@${normalizedUsername}` : '@your-username'

  const toggle = (label) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((interest) => interest !== label) : [...prev, label]
    )
  }

  const handleComplete = async (interests) => {
    if (usernameError) {
      setError(usernameError)
      return
    }

    setError('')
    setIsSaving(true)

    try {
      await onDone({
        interests,
        username: normalizedUsername,
      })
    } catch (saveError) {
      setError(saveError.message || 'Unable to save your profile right now.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="interests-wrapper">
        <div className="interests-box">
          <div className="interests-header">
            <h1>Welcome, {user.name || user.username || 'there'}!</h1>
            <p>Choose your username and pick the topics you care about for your event feed.</p>
          </div>

          <div className="interests-field">
            <label htmlFor="interest-username">Username</label>
            <input
              id="interest-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              onBlur={() => setUsername((currentValue) => normalizeUsername(currentValue))}
              placeholder="your-username"
              autoComplete="username"
              spellCheck="false"
            />
            <small>Public profile URL: {usernamePreview}</small>
          </div>

          {error ? <p className="interests-error">{error}</p> : null}

          <div className="interests-grid">
            {ALL_INTERESTS.map(({ label, emoji }) => (
              <button
                key={label}
                type="button"
                className={`interest-chip ${selected.includes(label) ? 'selected' : ''}`}
                onClick={() => toggle(label)}
              >
                <span className="emoji">{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          <p className="interests-hint">
            {selected.length === 0
              ? 'Select at least one to personalise your feed'
              : `${selected.length} selected`}
          </p>

          <button
            type="button"
            className="interests-submit"
            disabled={selected.length === 0 || Boolean(usernameError) || isSaving}
            onClick={() => handleComplete(selected)}
          >
            {isSaving ? 'Saving...' : "Let's go ->"}
          </button>

          <button
            type="button"
            className="interests-skip"
            disabled={Boolean(usernameError) || isSaving}
            onClick={() => handleComplete([])}
          >
            Skip for now
          </button>
        </div>
      </div>
    </>
  )
}

export default InterestsPage
