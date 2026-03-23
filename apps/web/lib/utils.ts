import { formatUnits } from "viem";

export function shortAddress(address?: string | null) {
  if (!address) {
    return "Not connected";
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTokenValue(value: bigint, decimals = 18, digits = 4) {
  return Number(formatUnits(value, decimals)).toFixed(digits);
}

export function formatRelativeTime(timestamp: string) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffSeconds = Math.max(Math.floor(diffMs / 1000), 0);
  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  return `${diffHours}h ago`;
}
