const PAGE_COLLAPSE_THRESHOLD = 6

const buildPageItems = (currentPage, totalPages) => {
  if (totalPages < PAGE_COLLAPSE_THRESHOLD) {
    return Array.from({ length: totalPages }, (_, index) => ({
      type: 'page',
      value: index + 1,
      key: `page-${index + 1}`,
    }))
  }

  const sortedPages = [...new Set([1, 2, 3, currentPage, totalPages - 1, totalPages])]
    .filter((pageNumber) => pageNumber >= 1 && pageNumber <= totalPages)
    .sort((leftPage, rightPage) => leftPage - rightPage)

  return sortedPages.reduce((items, pageNumber, index) => {
    const previousPage = sortedPages[index - 1]

    if (previousPage && pageNumber - previousPage > 1) {
      items.push({
        type: 'ellipsis',
        key: `ellipsis-${previousPage}-${pageNumber}`,
      })
    }

    items.push({
      type: 'page',
      value: pageNumber,
      key: `page-${pageNumber}`,
    })

    return items
  }, [])
}

function Pagination({
  ariaLabel,
  summary,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) {
  if (totalPages <= 1) {
    return null
  }

  const pageItems = buildPageItems(currentPage, totalPages)

  return (
    <nav className="pagination" aria-label={ariaLabel}>
      <p className="pagination__summary">{summary}</p>
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
          {pageItems.map((item) =>
            item.type === 'ellipsis' ? (
              <span key={item.key} className="pagination__ellipsis" aria-hidden="true">
                ...
              </span>
            ) : (
              <button
                key={item.key}
                type="button"
                className={`pagination__button ${
                  item.value === currentPage ? 'pagination__button--active' : ''
                }`}
                onClick={() => onPageChange(item.value)}
                aria-current={item.value === currentPage ? 'page' : undefined}
              >
                {item.value}
              </button>
            ),
          )}
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
  )
}

export default Pagination
