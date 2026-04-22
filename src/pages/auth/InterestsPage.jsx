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
  .interests-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    background: var(--color-bg);
    font-family: var(--font-sans);
  }

  .interests-box {
    width: 100%;
    max-width: 560px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    padding: 2.5rem 2rem;
    box-shadow: var(--shadow-soft);
    box-sizing: border-box;
  }

  .interests-header {
    margin-bottom: 0.5rem;
  }

  .interests-header h1 {
    font-family: var(--font-display);
    font-size: 1.75rem;
    font-weight: 400;
    color: var(--color-text);
    margin: 0 0 0.4rem;
  }

  .interests-header p {
    font-size: 0.9rem;
    color: var(--color-muted);
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
    color: var(--color-text);
  }

  .interests-field input {
    width: 100%;
    padding: 0.85rem 1rem;
    border: 1.5px solid var(--color-border);
    border-radius: 10px;
    background: var(--color-input-bg);
    font-family: var(--font-sans);
    font-size: 0.95rem;
    color: var(--color-text);
    box-sizing: border-box;
  }

  .interests-field input:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(193, 127, 74, 0.12);
    background: var(--color-input-focus-bg);
  }

  .interests-field small {
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .interests-error {
    margin: 0 0 1rem;
    padding: 0.85rem 1rem;
    border: 1px solid var(--color-danger-border);
    border-radius: 10px;
    background: var(--color-danger-bg);
    color: var(--color-danger-text);
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
    border: 1.5px solid var(--color-border);
    border-radius: 12px;
    background: var(--color-input-bg);
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: 0.85rem;
    color: var(--color-text);
    transition: all 0.15s;
  }

  .interest-chip:hover {
    border-color: var(--color-accent);
    background: rgba(45, 59, 21, 0.08);
  }

  .interest-chip.selected {
    border-color: var(--color-accent);
    background: rgba(45, 59, 21, 0.12);
    color: var(--color-accent);
    font-weight: 500;
  }

  .interest-chip .emoji {
    font-size: 1.5rem;
  }

  .interests-hint {
    font-size: 0.8rem;
    color: var(--color-muted);
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
    font-family: var(--font-sans);
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
    font-family: var(--font-sans);
    font-size: 0.875rem;
    color: var(--color-muted);
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
