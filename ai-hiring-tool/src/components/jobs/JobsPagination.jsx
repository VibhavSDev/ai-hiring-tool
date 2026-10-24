const JobsPagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-between border-t border-gray-800 pt-4">
      {/* Total Count Info */}
      <div className="text-xs text-gray-400">
        Page <span className="font-medium text-gray-200">{page}</span> of{" "}
        <span className="font-medium text-gray-200">{totalPages}</span>
      </div>

      <div className="flex gap-2">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center gap-1 rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-200 transition-all hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Prev
        </button>

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex items-center gap-1 rounded-md bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-200 transition-all hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-800"
        >
          Next
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default JobsPagination;