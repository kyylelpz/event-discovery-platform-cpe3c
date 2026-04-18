import { programmerProfiles } from '../../data/sitePages.js'

function AboutProgrammersPage() {
  return (
    <div className="info-page">
      <section className="info-page__hero">
        <h1>About the Programmers</h1>
        <p>
          This page works as a portfolio-style introduction to the team behind
          Eventcinity, highlighting the roles shaping the product and the kind
          of work the project represents.
        </p>
      </section>

      <section className="programmer-grid">
        {programmerProfiles.map((profile) => (
          <article key={profile.role} className="info-card programmer-card">
            <span className="programmer-card__role">{profile.role}</span>
            <h2>{profile.name}</h2>
            <p>{profile.summary}</p>
          </article>
        ))}
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
          <h2>Portfolio note</h2>
          <p>
            These profile cards are ready for your real names, titles, bios, and
            links whenever you want to turn this into a more personal showcase.
          </p>
        </article>
      </section>
    </div>
  )
}

export default AboutProgrammersPage
