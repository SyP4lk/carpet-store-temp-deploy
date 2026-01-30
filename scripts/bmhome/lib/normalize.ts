export type PriceNormalizeReason = 'ok' | 'no_price' | 'zero_or_negative' | 'invalid'

export type PriceNormalizeResult = {
  normalized: string
  value: number | null
  reason: PriceNormalizeReason
}

export function normalizePriceWithMeta(rawInput: string | null | undefined): PriceNormalizeResult {
  const raw = (rawInput ?? '').trim()
  if (!raw) {
    return { normalized: '', value: null, reason: 'no_price' }
  }

  let cleaned = raw.replace(/[^\d.,]/g, '')
  if (!cleaned) {
    return { normalized: '', value: null, reason: 'invalid' }
  }

  const hasDot = cleaned.includes('.')
  const hasComma = cleaned.includes(',')

  if (hasDot && hasComma) {
    const lastDot = cleaned.lastIndexOf('.')
    const lastComma = cleaned.lastIndexOf(',')
    if (lastComma > lastDot) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.')
    } else {
      cleaned = cleaned.replace(/,/g, '')
    }
  } else if (hasComma && !hasDot) {
    cleaned = cleaned.replace(',', '.')
  }

  const parts = cleaned.split('.')
  if (parts.length > 2) {
    const decimal = parts.pop()
    cleaned = `${parts.join('')}.${decimal ?? ''}`
  }

  const value = Number.parseFloat(cleaned)
  if (!Number.isFinite(value)) {
    return { normalized: '', value: null, reason: 'invalid' }
  }
  if (value <= 0) {
    return { normalized: '', value, reason: 'zero_or_negative' }
  }

  return {
    normalized: value.toFixed(2),
    value,
    reason: 'ok',
  }
}

export function normalizePrice(raw: string): string {
  return normalizePriceWithMeta(raw).normalized
}
