import EventList from '../../components/events/EventList.jsx'
import FeaturedEvent from '../../components/events/FeaturedEvent.jsx'
import CategoryHighlight from '../../components/ui/CategoryHighlight.jsx'
import FilterTabs from '../../components/ui/FilterTabs.jsx'
import Pagination from '../../components/ui/Pagination.jsx'
import { formatEventDateHeading } from '../../utils/formatters.js'

function EventDiscoveryPage({
  featuredEvents,
  events,
  filteredCount,
  currentPage,
  totalPages,
  onPageChange,
  dateFilterOptions,
  selectedCategory,
  selectedDateFilter,
  onCategoryChange,
  onDateFilterChange,
  selectedLocation,
  selectedCalendarDate,
  onClearCalendarDate,
  ...sharedPageProps
}) {
  const isCalendarDateMode = Boolean(selectedCalendarDate)

  return (
    <div id="dashboard-top" className="page-stack">
      {!isCalendarDateMode ? (
        <FeaturedEvent
          events={featuredEvents}
          interactions={sharedPageProps.interactions}
          onViewDetails={sharedPageProps.onOpenEvent}
          onToggleHeart={sharedPageProps.onToggleHeart}
          onToggleSave={sharedPageProps.onToggleSave}
          onToggleAttend={sharedPageProps.onToggleAttend}
        />
      ) : null}

      {!isCalendarDateMode ? (
        <section className="section-block">
          <div className="section-block__heading">
            <h2>Browse by Category</h2>
            <p>Explore events by category and discover what is happening next.</p>
          </div>
          <CategoryHighlight value={selectedCategory} onCategoryClick={onCategoryChange} />
        </section>
      ) : null}

      <section id="upcoming-events" className="section-block">
        <div className="section-block__topline">
          <div className="section-block__topline-copy">
            <h2>
              {isCalendarDateMode
                ? `Events on ${formatEventDateHeading(selectedCalendarDate)}`
                : selectedCategory === 'All Events'
                  ? 'Upcoming Events'
                  : selectedCategory}
            </h2>
            <p>
              {isCalendarDateMode
                ? 'Showing every event happening on the selected date.'
                : selectedLocation === 'All Philippines'
                  ? 'Events across the Philippines'
                  : `Events in ${selectedLocation}`}
            </p>
          </div>
          <div className="section-block__summary">
            <span className="section-block__count">
              {filteredCount === 0
                ? '0 events'
                : `${Math.min(events.length, filteredCount)} shown of ${filteredCount}`}
            </span>
            {isCalendarDateMode ? (
              <button
                type="button"
                className="section-block__clear"
                onClick={onClearCalendarDate}
              >
                Clear date
              </button>
            ) : null}
          </div>
        </div>

        {!isCalendarDateMode ? (
          <FilterTabs
            options={dateFilterOptions}
            value={selectedDateFilter}
            onChange={onDateFilterChange}
          />
        ) : null}

        {!isCalendarDateMode && filteredCount > 0 && totalPages > 1 ? (
          <Pagination
            ariaLabel="Events pagination"
            summary={`Page ${currentPage} of ${totalPages}`}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        ) : null}

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
