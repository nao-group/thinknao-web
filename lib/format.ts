export function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// mm:ss
export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Xm YYs
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

// XP values carry up to 4 decimals server-side (and can pick up float dust when
// summed client-side) — always display at most 1, and drop it entirely for whole numbers.
export function formatXp(xp: number): string {
  return xp.toLocaleString(undefined, { maximumFractionDigits: 1 });
}
