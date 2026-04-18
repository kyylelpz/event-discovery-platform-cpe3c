function InfoPage({ title, intro, sections }) {
  return (
    <div className="info-page">
      <section className="info-page__hero">
        <h1>{title}</h1>
        <p>{intro}</p>
      </section>

      <section className="info-page__grid">
        {sections.map((section) => (
          <article key={section.title} className="info-card">
            <h2>{section.title}</h2>
            <p>{section.body}</p>
            {section.points?.length ? (
              <ul className="info-card__list">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  )
}

export default InfoPage
