import { useState } from 'react'
import { PrimaryButton } from '../../components/ui/Button.jsx'
import { API_BASE_URL } from '../../services/apiBase.js'
import {
  getEmailValidationError,
  getPasswordValidationChecks,
  getPasswordValidationErrors,
  signIn,
  signUp,
} from '../../services/authService.js'
import { CheckIcon, CloseIcon } from '../../components/ui/Icons.jsx'
import { routes } from '../../utils/routing.js'

const styles = `
  .signin-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    background: var(--color-bg);
    font-family: var(--font-sans);
  }

  .signin-box {
    width: 100%;
    max-width: 420px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    padding: 2.5rem 2rem;
    box-shadow: var(--shadow-soft);
    box-sizing: border-box;
  }

  .signin-header {
    margin-bottom: 1.75rem;
  }

  .signin-header h1 {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 400;
    color: var(--color-text);
    margin: 0 0 0.4rem;
    line-height: 1.1;
  }

  .signin-header p {
    font-size: 0.9rem;
    color: var(--color-muted);
    margin: 0;
    line-height: 1.5;
  }

  .auth-tabs {
    display: flex;
    background: rgba(45, 59, 21, 0.08);
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
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-muted);
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .auth-tab.active {
    background: var(--color-surface);
    color: var(--color-text);
    box-shadow: 0 1px 3px rgba(0,0,0,0.10);
  }

  .signin-form {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }

  .signin-error {
    background: var(--color-danger-bg);
    border: 1px solid var(--color-danger-border);
    color: var(--color-danger-text);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
  }

  .signin-error ul {
    margin: 0;
    padding-left: 1.1rem;
    display: grid;
    gap: 0.35rem;
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
    color: var(--color-text);
  }

  .forgot-link {
    font-size: 0.8rem;
    color: var(--color-accent);
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    font-family: var(--font-sans);
    padding: 0;
  }

  .forgot-link:hover { text-decoration: underline; }

  .input-wrapper {
    position: relative;
  }

  .field-group input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1.5px solid var(--color-border);
    border-radius: 8px;
    font-family: var(--font-sans);
    font-size: 0.95rem;
    color: var(--color-text);
    background: var(--color-input-bg);
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
    outline: none;
  }

  .field-group input.has-toggle { padding-right: 3rem; }

  .field-group input::placeholder { color: var(--color-muted); }

  .field-group input:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(193, 127, 74, 0.12);
    background: var(--color-input-focus-bg);
  }

  .field-note {
    margin: 0;
    font-size: 0.8rem;
    line-height: 1.5;
    color: var(--color-muted);
  }

  .password-checklist {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 0.45rem;
  }

  .password-checklist__item {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    font-size: 0.82rem;
    line-height: 1.4;
    color: var(--color-muted);
  }

  .password-checklist__item svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  .password-checklist__bullet {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    border: 1.5px solid currentColor;
    border-radius: 999px;
    opacity: 0.55;
  }

  .password-checklist__item--valid {
    color: var(--color-success-text);
  }

  .password-checklist__item--invalid {
    color: var(--color-danger-text);
  }

  .password-checklist__item--pending {
    color: var(--color-muted);
  }

  .show-password-btn {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-muted);
    padding: 0.25rem;
    display: flex;
    align-items: center;
    transition: color 0.15s;
  }

  .show-password-btn:hover { color: var(--color-text); }

  .divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--color-muted);
    font-size: 0.8rem;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--color-border);
  }

  .google-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1.5px solid var(--color-border);
    border-radius: 8px;
    background: var(--color-surface);
    font-family: var(--font-sans);
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--color-text);
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;
  }

  .google-btn:hover {
    background: var(--color-input-bg);
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(193, 127, 74, 0.08);
  }

  .auth-footer {
    text-align: center;
    margin-top: 1.25rem;
    font-size: 0.875rem;
    color: var(--color-muted);
  }

  .auth-footer button {
    background: none;
    border: none;
    color: var(--color-accent);
    font-family: var(--font-sans);
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
  const [errors, setErrors] = useState([])
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  const isSignUp = mode === 'signup'
  const passwordChecks = getPasswordValidationChecks(password)
  const confirmPasswordMatches = password.length > 0 && password === confirmPassword
  const shouldShowChecklistState =
    hasAttemptedSubmit || password.length > 0 || confirmPassword.length > 0

  const getSignupFormErrors = () => {
    const nextErrors = []
    const normalizedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    if (!normalizedEmail) {
      nextErrors.push('Email is required.')
    } else {
      const emailError = getEmailValidationError(normalizedEmail)

      if (emailError) {
        nextErrors.push(emailError)
      }
    }

    if (!trimmedPassword) {
      nextErrors.push('Password is required.')
    } else {
      nextErrors.push(...getPasswordValidationErrors(password))
    }

    if (!confirmPassword) {
      nextErrors.push('Confirm your password.')
    } else if (password !== confirmPassword) {
      nextErrors.push('Passwords do not match.')
    }

    return [...new Set(nextErrors)]
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setHasAttemptedSubmit(true)
    setErrors([])

    const normalizedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    if (isSignUp) {
      const signupErrors = getSignupFormErrors()

      if (signupErrors.length) {
        setErrors(signupErrors)
        return
      }
    }

    if (!normalizedEmail || !trimmedPassword) {
      setErrors(['Fill in both fields to continue'])
      return
    }

    const emailError = getEmailValidationError(normalizedEmail)

    if (emailError) {
      setErrors([emailError])
      return
    }

    setIsLoading(true)
    try {
      const authAction = isSignUp ? signUp : signIn
      const session = await authAction({
        email: normalizedEmail,
        password,
        name: normalizedEmail.split('@')[0],
      })

      const userType = isSignUp ? 'new' : 'returning'

      if (onAuthSuccess) {
        await onAuthSuccess(session, userType)
      }
    } catch (err) {
      setErrors([err.message || 'Something went wrong. Try again.'])
    } finally {
      setIsLoading(false)
    }
  }

  const switchMode = (next) => {
    setMode(next)
    setErrors([])
    setHasAttemptedSubmit(false)
    setPassword('')
    setConfirmPassword('')
  }

  const handleGoogleSignIn = () => {
    const googleAuthUrl = new URL(`${API_BASE_URL}/api/auth/google`)
    googleAuthUrl.searchParams.set(
      'redirectTo',
      `${window.location.origin}${routes.events}`,
    )
    window.location.href = googleAuthUrl.toString()
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
            {errors.length ? (
              <div className="signin-error" role="alert">
                <ul>
                  {errors.map((errorMessage) => (
                    <li key={errorMessage}>{errorMessage}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="field-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.length) {
                    setErrors([])
                  }
                }}
                placeholder="you@example.com"
                autoComplete="email"
                inputMode="email"
                pattern="^[^\\s@]+@[^\\s@]+\\.com$"
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
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.length) {
                      setErrors([])
                    }
                  }}
                  placeholder="........"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  className="has-toggle"
                />
                <button type="button" className="show-password-btn" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {isSignUp ? (
                <ul className="password-checklist" aria-label="Password requirements">
                  {passwordChecks.map((check) => (
                    <li
                      key={check.id}
                      className={`password-checklist__item ${
                        check.isValid
                          ? 'password-checklist__item--valid'
                          : shouldShowChecklistState
                            ? 'password-checklist__item--invalid'
                            : 'password-checklist__item--pending'
                      }`}
                    >
                      {check.isValid ? (
                        <CheckIcon />
                      ) : shouldShowChecklistState ? (
                        <CloseIcon />
                      ) : (
                        <span className="password-checklist__bullet" aria-hidden="true" />
                      )}
                      <span>{check.label}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {isSignUp && (
              <div className="field-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (errors.length) {
                        setErrors([])
                      }
                    }}
                    placeholder="........"
                    autoComplete="new-password"
                    className="has-toggle"
                  />
                  <button type="button" className="show-password-btn" onClick={() => setShowConfirm((value) => !value)} aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
                <div
                  className={`password-checklist__item ${
                    confirmPassword.length === 0 && !hasAttemptedSubmit
                      ? 'password-checklist__item--pending'
                      : confirmPasswordMatches
                        ? 'password-checklist__item--valid'
                        : 'password-checklist__item--invalid'
                  }`}
                >
                  {confirmPasswordMatches ? (
                    <CheckIcon />
                  ) : confirmPassword.length === 0 && !hasAttemptedSubmit ? (
                    <span className="password-checklist__bullet" aria-hidden="true" />
                  ) : (
                    <CloseIcon />
                  )}
                  <span>Passwords match</span>
                </div>
              </div>
            )}

            <PrimaryButton type="submit" disabled={isLoading}>
              {isLoading
                ? (isSignUp ? 'Creating account...' : 'Signing in...')
                : (isSignUp ? 'Create account' : 'Continue')}
            </PrimaryButton>

            <div className="divider">or</div>

            <button type="button" className="google-btn" onClick={handleGoogleSignIn}>
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
