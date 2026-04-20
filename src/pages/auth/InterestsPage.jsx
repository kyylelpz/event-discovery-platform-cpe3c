import { useState } from 'react'

const ALL_INTERESTS = [
  { label: 'Music', emoji: '🎵' },
  { label: 'Art & Culture', emoji: '🎨' },
  { label: 'Food & Drink', emoji: '🍜' },
  { label: 'Sports', emoji: '⚽' },
  { label: 'Tech', emoji: '💻' },
  { label: 'Business', emoji: '💼' },
  { label: 'Wellness', emoji: '🧘' },
  { label: 'Education', emoji: '📚' },
  { label: 'Community', emoji: '🤝' },
  { label: 'Travel', emoji: '✈️' },
  { label: 'Film & Media', emoji: '🎬' },
  { label: 'Fashion', emoji: '👗' },
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
`

function InterestsPage({ user, onDone }) {
  const [selected, setSelected] = useState([])

  const toggle = (label) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    )
  }

  return (
    <>
      <style>{styles}</style>
      <div className="interests-wrapper">
        <div className="interests-box">
          <div className="interests-header">
            <h1>Welcome, {user.name}! 👋</h1>
            <p>Pick the topics you care about and we'll tailor your event feed.</p>
          </div>

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
            disabled={selected.length === 0}
            onClick={() => onDone(selected)}
          >
            Let's go →
          </button>

          <button
            type="button"
            className="interests-skip"
            onClick={() => onDone([])}
          >
            Skip for now
          </button>
        </div>
      </div>
    </>
  )
}

export default InterestsPage
