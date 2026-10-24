import crypto from "crypto";

export function computeDeterminismHash(data) { // Default to empty object
  console.log("INTERNAL UTILITY CHECK - Received Data:", data); // 👈 Add this
  // Destructure with defaults to prevent the 'undefined' crash
  const { 
    jobId, 
    resumeIds = [], 
    weights = {}, 
    engineVersion = "v1" 
  } = data;

  if (!jobId) {
    throw new Error("computeDeterminismHash: jobId is required");
  }

  const safeIds = Array.isArray(resumeIds) 
    ? [...resumeIds].map(id => id.toString()).sort() 
    : [];

  const payload = {
    jobId: jobId.toString(),
    resumeIds: safeIds,
    weights,
    engineVersion,
  };

  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}