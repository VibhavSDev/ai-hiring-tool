import { Search, RotateCcw, Filter } from "lucide-react";

const JobsFilters = ({ filters, onFilterChange }) => {
  const handleSearchChange = (e) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (e) => {
    onFilterChange({ ...filters, status: e.target.value });
  };

  const handleDateChange = (e) => {
    onFilterChange({ ...filters, dateRange: e.target.value });
  };

  const handleReset = () => {
    onFilterChange({
      search: "",
      status: "all",
      dateRange: "",
      sort: "createdAt",
      order: "desc",
    });
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
        {/* Search Input */}
        <div className="relative flex-1 group">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by job title or ID..."
            value={filters.search}
            onChange={handleSearchChange}
            className="block w-full rounded-lg border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-3 text-sm text-slate-200 placeholder-slate-500 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative min-w-[140px]">
          <select
            value={filters.status}
            onChange={handleStatusChange}
            className="w-full cursor-pointer appearance-none rounded-lg border border-slate-800 bg-slate-900/50 py-2.5 pl-3 pr-10 text-sm text-slate-300 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
            <Filter size={14} />
          </div>
        </div>

        {/* Date Filter */}
        <div className="relative min-w-[160px]">
          <select
            value={filters.dateRange || ""}
            onChange={handleDateChange}
            className="w-full cursor-pointer appearance-none rounded-lg border border-slate-800 bg-slate-900/50 py-2.5 pl-3 pr-10 text-sm text-slate-300 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
          >
            <option value="">Any Time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Reset Action */}
      <button
        onClick={handleReset}
        className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
      >
        <RotateCcw size={16} />
        Reset Filters
      </button>
    </div>
  );
};

export default JobsFilters;