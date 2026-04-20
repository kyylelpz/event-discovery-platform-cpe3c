import EventList from '../../components/events/EventList.jsx'
import FeaturedEvent from '../../components/events/FeaturedEvent.jsx'
import CategoryHighlight from '../../components/ui/CategoryHighlight.jsx'
import FilterTabs from '../../components/ui/FilterTabs.jsx'

function EventDiscoveryPage({
  featuredEvent,
  events,
  categoryOptions,
  dateFilterOptions,
  selectedCategory,
  selectedDateFilter,
  onCategoryChange,
  onDateFilterChange,
  selectedLocation,
  isLoadingEvents,
  feedMode,
  totalEvents,
  ...sharedPageProps
}) {
  return (
    <div className="page-stack">
      <FeaturedEvent event={featuredEvent} onViewDetails={sharedPageProps.onOpenEvent} />

      <section className="section-block">
        <div className="section-block__heading">
          <h2>Browse by Category</h2>
          <p>Explore events that match your interests.</p>
        </div>
        <CategoryHighlight onCategoryClick={onCategoryChange} />
      </section>

      <section className="section-block">
        <div className="section-block__topline">
          <div>
            <h2>{selectedCategory === 'All Events' ? 'Upcoming Events' : selectedCategory}</h2>
            <p>
              {selectedLocation === 'All Philippines'
                ? 'Events across the Philippines'
                : `Events in ${selectedLocation}`}
            </p>
          </div>
          <span>{events.length} events</span>
        </div>

        <FilterTabs
          options={categoryOptions}
          value={selectedCategory}
          onChange={onCategoryChange}
        />
        <FilterTabs
          options={dateFilterOptions}
          value={selectedDateFilter}
          onChange={onDateFilterChange}
        />

        <div className="status-note">
          <span>
            {isLoadingEvents
              ? 'Refreshing events for your selected location.'
              : feedMode === 'live'
                ? 'Showing backend-fed events.'
                : 'Showing curated preview data.'}
          </span>
          <span>{totalEvents} total events in the current catalog</span>
        </div>

        <EventList
          events={events}
          emptyTitle="No events match this filter set yet"
          emptyCopy="Try another province in the Philippines, widen your date range, or clear the search term."
          {...sharedPageProps}
        />
      </section>
    </div>
  )
}

export default EventDiscoveryPage
