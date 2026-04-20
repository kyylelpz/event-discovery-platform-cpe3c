const locations = [
  {
    name: 'Metro Manila',
    description:
      'The beating heart of Philippine events — from large-scale concerts and trade expos to intimate gallery openings and food festivals across BGC, Makati, and Quezon City.',
    highlights: ['BGC Arts Center', 'SM Mall of Asia Arena', 'Quezon Memorial Circle', 'Rizal Park'],
  },
  {
    name: 'Bulacan',
    description:
      'A province steeped in history and festivity, known for its vibrant local fiestas, heritage events, and growing arts scene just north of the capital.',
    highlights: ['Barasoain Church', 'Plaridel Park', 'San Miguel Festival Grounds'],
  },
  {
    name: 'Pampanga',
    description:
      'The culinary capital of the Philippines doubles as a major event hub, hosting food festivals, lantern festivals, and cultural showcases year-round.',
    highlights: ['SM City Pampanga', 'Marquee Mall Events Area', 'Giant Lantern Festival grounds'],
  },
  {
    name: 'Cavite',
    description:
      'A province with deep historical roots and a modern event landscape, from beachside gatherings in Naic to convention events in Imus and Bacoor.',
    highlights: ['Aguinaldo Shrine', 'Vermosa Sports Hub', 'Naic beachfront venues'],
  },
  {
    name: 'Laguna',
    description:
      'Home to hot springs, heritage towns, and outdoor venues perfect for retreats, team-building events, and nature-themed gatherings.',
    highlights: ['Enchanted Kingdom', 'Hidden Valley Springs', 'Los Baños lakeside venues'],
  },
  {
    name: 'Batangas',
    description:
      'A coastal province popular for beach events, dive festivals, and weekend retreats, with venues ranging from beachfront resorts to hilltop event spaces.',
    highlights: ['Anilao dive sites', 'Nasugbu beach resorts', 'Taal Volcano viewpoints'],
  },
]

function LocationGuidesPage() {
  return (
    <div className="info-page">
      <section className="info-page__hero">
        <h1>Location Guides</h1>
        <p>
          Explore the best provinces and cities across the Philippines for hosting and
          discovering events — each with its own character, venues, and vibe.
        </p>
      </section>

      <section className="info-page__grid">
        {locations.map((loc) => (
          <article key={loc.name} className="info-card">
            <h2>{loc.name}</h2>
            <p>{loc.description}</p>
            <ul style={{ marginTop: '0.75rem', paddingLeft: '1.1rem', fontSize: '0.85rem', color: '#7a7068', lineHeight: '1.8' }}>
              {loc.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  )
}

export default LocationGuidesPage
