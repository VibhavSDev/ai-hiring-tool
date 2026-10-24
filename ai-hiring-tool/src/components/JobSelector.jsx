import { useEffect, useState } from "react";
import API from "../services/api";

export default function JobSelector({ onSelect }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await API.get("/jobs"); // backend list endpoint
        setJobs(res.data.jobs || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  if (loading) return <p>Loading jobs...</p>;

  return (
    <select
      className="border p-2 rounded w-full"
      onChange={(e) => onSelect(e.target.value)}
    >
      <option value="">Select Job</option>
      {jobs.map((job) => (
        <option key={job._id} value={job._id}>
          {job.parsed?.title || "Untitled Job"}
        </option>
      ))}
    </select>
  );
}
