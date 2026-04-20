import { useState } from 'react'
import { PrimaryButton } from '../../components/ui/Button.jsx'
import { setSession } from '../../services/authService.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  .signin-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    background: #ffffff;
    font-family: 'DM Sans', sans-serif;
  }

  .signin-box {
    width: 100%;
    max-width: 420px;
    background: #fff;
    border-radius: 16px;
    padding: 2.5rem 2rem;
    box-shadow:
      0 1px 2px rgba(0,0,0,0.04),
      0 4px 24px rgba(0,0,0,0.10);
    box-sizing: border-box;
  }

  .signin-header {
    margin-bottom: 1.75rem;
  }

  .signin-header h1 {
    font-family: 'DM Serif Display', serif;
    font-size: 2rem;
    font-weight: 400;
    color: #1a1714;
    margin: 0 0 0.4rem;
    line-height: 1.1;
  }

  .signin-header p {
    font-size: 0.9rem;
    color: #7a7068;
    margin: 0;
    line-height: 1.5;
  }

  .auth-tabs {
    display: flex;
    background: #f5f2ee;
    border-radius: 10px;
    padding: 4px;
    margin-bottom: 1.5rem;
    gap: 4px;
  }

  .auth-tab {
    flex: 1;
    padding: 0.5rem;
    border: none;
    border-radius: 7px;
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    color: #7a7068;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .auth-tab.active {
    background: #fff;
    color: #1a1714;
    box-shadow: 0 1px 3px rgba(0,0,0,0.10);
  }

  .signin-form {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }

  .signin-error {
    background: #fff3f3;
    border: 1px solid #fbbfbf;
    color: #c0392b;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .field-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .field-group label {
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #4a4540;
  }

  .forgot-link {
    font-size: 0.8rem;
    color: #c17f4a;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    padding: 0;
  }

  .forgot-link:hover { text-decoration: underline; }

  .input-wrapper {
    position: relative;
  }

  .field-group input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1.5px solid #e2ddd8;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    color: #1a1714;
    background: #faf9f7;
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
    outline: none;
  }

  .field-group input.has-toggle { padding-right: 3rem; }

  .field-group input::placeholder { color: #bbb5ae; }

  .field-group input:focus {
    border-color: #c17f4a;
    box-shadow: 0 0 0 3px rgba(193, 127, 74, 0.12);
    background: #fff;
  }

  .show-password-btn {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #9e968e;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    transition: color 0.15s;
  }

  .show-password-btn:hover { color: #4a4540; }

  .divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #bbb5ae;
    font-size: 0.8rem;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e2ddd8;
  }

  .google-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1.5px solid #e2ddd8;
    border-radius: 8px;
    background: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    font-weight: 500;
    color: #1a1714;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
  }

  .google-btn:hover {
    background: #faf9f7;
    border-color: #c17f4a;
    box-shadow: 0 0 0 3px rgba(193, 127, 74, 0.08);
  }

  .auth-footer {
    text-align: center;
    margin-top: 1.25rem;
    font-size: 0.875rem;
    color: #7a7068;
  }

  .auth-footer button {
    background: none;
    border: none;
    color: #c17f4a;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    padding: 0;
    margin-left: 0.25rem;
  }

  .auth-footer button:hover { text-decoration: underline; }
`

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

function SignInPage({ onAuthSuccess }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const isSignUp = mode === 'signup'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Fill in both fields to continue')
      return
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const endpoint = isSignUp
        ? `${API_BASE_URL}/api/auth/register`
        : `${API_BASE_URL}/api/auth/login`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong with the server.')
      }

      const session = {
        email,
        name: data.user?.name || email.split('@')[0],
        interests: [],
      }
      setSession(session)

      const userType = isSignUp ? 'new' : 'returning'

      if (onAuthSuccess) {
        await onAuthSuccess(session, userType)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = (next) => {
    setMode(next)
    setError(null)
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <>
      <style>{styles}</style>
      <div className="signin-wrapper">
        <div className="signin-box">
          <header className="signin-header">
            <h1>{isSignUp ? 'Create account' : 'Welcome back'}</h1>
            <p>
              {isSignUp
                ? 'Join to discover and save events near you.'
                : 'Pick up where you left off. Your saved events are waiting.'}
            </p>
          </header>

          <div className="auth-tabs">
            <button className={`auth-tab ${mode === 'signin' ? 'active' : ''}`} onClick={() => switchMode('signin')} type="button">
              Sign in
            </button>
            <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => switchMode('signup')} type="button">
              Sign up
            </button>
          </div>

          <form className="signin-form" onSubmit={handleSubmit} noValidate>
            {error && <div className="signin-error" role="alert">{error}</div>}

            <div className="field-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="field-group">
              <div className="field-label-row">
                <label htmlFor="password">Password</label>
                {!isSignUp && (
                  <button type="button" className="forgot-link" onClick={() => alert('Forgot password flow here')}>
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="........"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  className="has-toggle"
                />
                <button type="button" className="show-password-btn" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            {isSignUp && (
              <div className="field-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="........"
                    autoComplete="new-password"
                    className="has-toggle"
                  />
                  <button type="button" className="show-password-btn" onClick={() => setShowConfirm((value) => !value)} aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
              </div>
            )}

            <PrimaryButton type="submit" disabled={isLoading}>
              {isLoading
                ? (isSignUp ? 'Creating account...' : 'Signing in...')
                : (isSignUp ? 'Create account' : 'Continue')}
            </PrimaryButton>

            <div className="divider">or</div>

            <button type="button" className="google-btn" onClick={() => window.location.href = `${API_BASE_URL}/api/auth/google`}>
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          <div className="auth-footer">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button type="button" onClick={() => switchMode(isSignUp ? 'signin' : 'signup')}>
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignInPage
