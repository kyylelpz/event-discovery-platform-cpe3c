const faqs = [
  {
    q: 'How do I create an event?',
    a: 'Sign in to your account, then click "Create Event" in the navigation. Fill in your event title, category, date, venue, and description, then hit publish. Your event goes live immediately.',
  },
  {
    q: 'Can I edit my event after publishing?',
    a: 'Yes. Navigate to your event page, open the event detail, and use the edit option. Updates are reflected instantly for all attendees who have saved or are attending your event.',
  },
  {
    q: 'How do I save an event?',
    a: 'Click the bookmark icon on any event card or event detail page. Bookmarked events appear in your profile under the "Bookmarks" tab so you can find them quickly later.',
  },
  {
    q: 'How does location filtering work?',
    a: 'Use the location selector in the top navigation to browse events by province. Choose "All Philippines" to see everything, or narrow down to Metro Manila, Cebu, Davao del Sur, Laguna, and more.',
  },
  {
    q: 'What categories are available?',
    a: 'Eventcinity covers Music, Arts, Food, Sports, Tech, Business, Wellness, Education, and more. Use the category filter on the discovery page to browse by type.',
  },
  {
    q: 'Is Eventcinity free to use?',
    a: 'Yes — browsing, saving, and creating events on Eventcinity is completely free for all users.',
  },
  {
    q: 'How do I connect with other people?',
    a: 'Visit the People page to browse community members and hosts. Public profiles highlight basic community info and created events, while private interests and activity stay visible only to the account owner.',
  },
  {
    q: 'What do I do if an event has incorrect information?',
    a: 'If you notice an error in an event listing, use the Contact Support page to report it. We\'ll review and follow up with the host directly.',
  },
]

function HelpCenterPage() {
  return (
    <div className="info-page">
      <section className="info-page__hero">
        <h1>Help Center</h1>
        <p>
          Answers to the most common questions about using Eventcinity — from
          creating events to managing your profile.
        </p>
      </section>

      <section className="info-page__grid">
        {faqs.map((faq) => (
          <article key={faq.q} className="info-card">
            <h2>{faq.q}</h2>
            <p>{faq.a}</p>
          </article>
        ))}
      </section>
    </div>
  )
}

export default HelpCenterPage
