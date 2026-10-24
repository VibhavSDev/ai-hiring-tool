/**
 * Parse human-readable duration strings like "1h", "7d", "3600s" to milliseconds.
 * Also handles numeric values (assumed to be seconds).
 */
export const parseDurationToMs = (durationStr) => {
  if (!durationStr) return null;

  // If it's already a number, treat as seconds
  if (typeof durationStr === "number") {
    return durationStr * 1000;
  }

  const str = String(durationStr).trim();
  
  // Try to parse as number (seconds)
  const numValue = parseInt(str, 10);
  if (!isNaN(numValue) && str === String(numValue)) {
    return numValue * 1000;
  }

  // Parse duration with unit suffix
  const match = str.match(/^(\d+)\s*([smhd])$/i);
  if (!match) {
    throw new Error(`Invalid duration format: ${durationStr}. Use format like "3600", "1h", "7d", "60s".`);
  }

  const [, value, unit] = match;
  const num = parseInt(value, 10);

  const unitsToMs = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return num * (unitsToMs[unit.toLowerCase()] || 1000);
};
