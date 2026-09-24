export function damp(current: number, target: number, dt: number, lambda = 7): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}
