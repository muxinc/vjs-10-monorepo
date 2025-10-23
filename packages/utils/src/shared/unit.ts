export function isValidNumber(value: any): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value);
}
