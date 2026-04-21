import EventList from '../../components/events/EventList.jsx'
import FeaturedEvent from '../../components/events/FeaturedEvent.jsx'
import CategoryHighlight from '../../components/ui/CategoryHighlight.jsx'
import FilterTabs from '../../components/ui/FilterTabs.jsx'

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
        <CategoryHighlight value={selectedCategory} onCategoryClick={onCategoryChange} />
      </section>

      <section className="section-block">
        <div className="section-block__topline">
          <div className="section-block__topline-copy">
            <h2>{selectedCategory === 'All Events' ? 'Upcoming Events' : selectedCategory}</h2>
            <p>
              {selectedLocation === 'All Philippines'
                ? 'Events across the Philippines'
                : `Events in ${selectedLocation}`}
            </p>
          </div>
          <span className="section-block__count">
            {filteredCount === 0
              ? '0 events'
              : `${Math.min(events.length, filteredCount)} shown of ${filteredCount}`}
          </span>
        </div>

        <FilterTabs
          options={dateFilterOptions}
          value={selectedDateFilter}
          onChange={onDateFilterChange}
        />

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
