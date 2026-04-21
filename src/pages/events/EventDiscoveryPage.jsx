import EventList from '../../components/events/EventList.jsx'
import FeaturedEvent from '../../components/events/FeaturedEvent.jsx'
import CategoryHighlight from '../../components/ui/CategoryHighlight.jsx'
import FilterTabs from '../../components/ui/FilterTabs.jsx'
import { formatEventDateHeading } from '../../utils/formatters.js'

function EventDiscoveryPage({
  featuredEvent,
  events,
  filteredCount,
  currentPage,
  totalPages,
  onPageChange,
  dateFilterOptions,
  selectedCategory,
  selectedDateFilter,
  selectedSort,
  onCategoryChange,
  onDateFilterChange,
  onSortChange,
  selectedLocation,
  selectedCalendarDate,
  onClearCalendarDate,
  ...sharedPageProps
}) {
  const isCalendarDateMode = Boolean(selectedCalendarDate)

  return (
    <div className="page-stack">
      {!isCalendarDateMode ? (
        <FeaturedEvent event={featuredEvent} onViewDetails={sharedPageProps.onOpenEvent} />
      ) : null}

      {!isCalendarDateMode ? (
        <section className="section-block">
          <div className="section-block__heading">
            <h2>Browse by Category</h2>
            <p>Explore events that match your interests.</p>
          </div>
          <CategoryHighlight value={selectedCategory} onCategoryClick={onCategoryChange} />
        </section>
      ) : null}

      <section className="section-block">
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

        {!isCalendarDateMode ? (
          <div className="listing-toolbar">
            {filteredCount > 0 && totalPages > 1 ? (
              <nav className="pagination" aria-label="Events pagination">
                <p className="pagination__summary">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="pagination__controls">
                  <button
                    type="button"
                    className="pagination__button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  <div className="pagination__pages">
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        className={`pagination__button ${
                          pageNumber === currentPage ? 'pagination__button--active' : ''
                        }`}
                        onClick={() => onPageChange(pageNumber)}
                        aria-current={pageNumber === currentPage ? 'page' : undefined}
                      >
                        {pageNumber}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="pagination__button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </nav>
            ) : (
              <div />
            )}

            <div className="sort-controls">
              <span className="sort-controls__label">Sort by</span>
              <FilterTabs
                options={['Nearest date', 'Relevance']}
                value={selectedSort}
                onChange={onSortChange}
              />
            </div>
          </div>
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
