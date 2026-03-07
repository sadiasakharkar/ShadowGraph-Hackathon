export function nodePulse(time: number, offset = 0, min = 0.86, max = 1.22): number {
  const t = (Math.sin(time * 1.4 + offset) + 1) * 0.5;
  return min + t * (max - min);
}
