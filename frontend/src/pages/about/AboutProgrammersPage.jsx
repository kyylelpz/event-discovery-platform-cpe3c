import { programmerProfiles } from '../../data/sitePages.js'

const roleColors = {
  'Frontend UI/UX Developer': { bg: '#fff7ed', accent: '#c17f4a' },
  'Database Integrator':      { bg: '#f0fdf4', accent: '#16a34a' },
  'Backend Developer':        { bg: '#eff6ff', accent: '#2563eb' },
  'API Integrator':           { bg: '#fdf4ff', accent: '#9333ea' },
}

const getInitials = (name) =>
  name
    .split(' ')
    .filter((_, i, arr) => i === 0 || i === arr.length - 1)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

function AboutProgrammersPage() {
  return (
    <div className="info-page">
      <section className="info-page__hero">
        <h1>About the Programmers</h1>
        <p>
          Meet the team behind Eventcinity — five developers who built the
          platform from the ground up, each owning a key layer of the stack.
        </p>
      </section>

      <section className="programmer-grid">
        {programmerProfiles.map((profile) => {
          const colors = roleColors[profile.role] || { bg: '#f5f2ee', accent: '#7a7068' }
          return (
            <article key={profile.name} className="info-card programmer-card">
              {/* Avatar */}
              <div
                className="programmer-card__avatar"
                style={{ background: colors.bg, color: colors.accent }}
              >
                {getInitials(profile.name)}
              </div>

              {/* Role badge */}
              <span
                className="programmer-card__role"
                style={{ background: colors.bg, color: colors.accent }}
              >
                {profile.role}
              </span>

              <h2 className="programmer-card__name">{profile.name}</h2>
              <p className="programmer-card__summary">{profile.summary}</p>
            </article>
          )
        })}
      </section>

      <section className="info-page__grid">
        <article className="info-card">
          <h2>Project focus</h2>
          <p>
            Eventcinity is designed as a calmer alternative to louder event
            discovery interfaces, combining clean browsing, social actions, and
            a scalable path toward live event data.
          </p>
        </article>
        <article className="info-card">
          <h2>Current stack</h2>
          <p>
            The project uses a Vite React frontend with modular JSX components
            and a backend-ready structure that can grow into fuller API and auth
            workflows.
          </p>
        </article>
        <article className="info-card">
          <h2>Built with care</h2>
          <p>
            Every layer — from the UI to the database — was handled by a
            dedicated team member, keeping responsibilities clear and the
            codebase easy to maintain and extend.
          </p>
        </article>
      </section>

      <style>{`
        .programmer-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.6rem;
        }

        .programmer-card__avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          flex-shrink: 0;
          margin-bottom: 0.25rem;
        }

        .programmer-card__role {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
        }

        .programmer-card__name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1714;
          margin: 0;
          line-height: 1.2;
        }

        .programmer-card__summary {
          font-size: 0.875rem;
          color: #7a7068;
          line-height: 1.6;
          margin: 0;
        }
      `}</style>
    </div>
  )
}

export default AboutProgrammersPage