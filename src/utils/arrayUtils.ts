export function range(start: bigint | number, end: bigint | number) {
  const length = Number(BigInt(end) - BigInt(start))
  return Array.from({ length }, (_, i) => BigInt(start) + BigInt(i))
}

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}

export function remove<TValue>(arr: TValue[], value: TValue): TValue[] {
  return arr.filter((ele) => ele !== value)
}

export function unique<T>(values: T[]) {
  return Array.from(new Set(values))
}
