import { useEffect, useState, useCallback } from "react";
import JobsHeader from "../../components/jobs/JobsHeader";
import JobsPagination from "../../components/jobs/JobsPagination";
import JobsFilters from "../../components/jobs/JobsFilters";
import JobsTable from "../../components/jobs/JobsTable";
import API from "../../services/api";

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    sort: "createdAt",
    order: "desc",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // api.js interceptor already unwrapped response.data.data into 'payload'
      const payload = await API.get("/jobs", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: filters.search || undefined,
          status: filters.status === "all" ? undefined : filters.status,
          sort: filters.sort,
          order: filters.order,
        },
      });

      if (payload) {
        const formattedJobs = (payload.jobs || []).map(job => ({
          ...job,
          title: job.title || job.parsed?.title || "Untitled Position",
          department: job.department || job.parsed?.employment_type || "N/A"
        }));

        setJobs(formattedJobs);
        
        setPagination((prev) => ({
          ...prev,
          totalPages: payload.pagination?.totalPages || 1,
          totalItems: payload.pagination?.totalItems || 0
        }));
      }
      
    } catch (err) {
      setError(err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (newFilters) => {
    setPagination((p) => ({ ...p, page: 1 }));
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handlePageChange = (page) => {
    setPagination((p) => ({ ...p, page }));
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-[#0b0f14] text-gray-200">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <JobsHeader
          jobs={jobs}
          fetchJobs={() => fetchJobs()}
        />

        {/* Filters and Search Container */}
        <div className="mt-6 rounded-xl bg-[#111827] p-5 shadow-2xl ring-1 ring-white/5">
          <JobsFilters
            filters={filters} 
            onFilterChange={handleFilterChange} 
          />

          {/* Table / Results Section */}
          <div className="my-6">
            {loading ? (
              <div className="py-20 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent" />
                <p className="mt-4 text-sm text-gray-400 animate-pulse">Scanning database...</p>
              </div>
            ) : error ? (
              <div className="py-20 text-center">
                <p className="text-red-400 font-medium">{error}</p>
                <button 
                  onClick={fetchJobs}
                  className="mt-4 text-sm text-indigo-400 hover:underline"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <JobsTable jobs={jobs} fetchJobs={fetchJobs} />
            )}
          </div>

          {/* Pagination */}
          <JobsPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default JobsList;