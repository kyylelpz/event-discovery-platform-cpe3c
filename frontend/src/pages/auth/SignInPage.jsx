import { PrimaryButton } from '../../components/ui/Button.jsx'

function SignInPage({ onContinue }) {
  return (
    <div className="signin-page">
      <section className="signin-card">
        <div className="signin-card__copy">
          <h1>Sign In</h1>
          <p>Keep your saved and attended events in one place.</p>
        </div>

        <form className="signin-form">
          <label>
            <span>Email</span>
            <input type="email" placeholder="you@example.com" />
          </label>
          <label>
            <span>Password</span>
            <input type="password" placeholder="Enter your password" />
          </label>
          <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
        </form>
      </section>
    </div>
  )
}

export default SignInPage
