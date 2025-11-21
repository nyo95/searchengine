export function normalizeDisplayName(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(' ')
}

export function normalizeLookupKey(value: string) {
  return value.trim().toLowerCase()
}

export function derivePrefixFromName(name: string) {
  const normalized = normalizeDisplayName(name)
  const uppercaseLetters = normalized.match(/\b[A-Z]/g)
  if (uppercaseLetters && uppercaseLetters.length >= 2) {
    return uppercaseLetters.slice(0, 5).join('')
  }

  const words = normalized.split(/\s+/).filter(Boolean)
  if (words.length) {
    return words.map((word) => word.charAt(0).toUpperCase()).join('').slice(0, 5)
  }

  if (normalized) {
    return normalized.slice(0, 2).toUpperCase()
  }

  return 'PR'
}

export function formatCodeSequence(value: number) {
  return String(value).padStart(2, '0')
}

export function extractSequenceFromCode(code: string, prefix: string) {
  const normalized = code.trim().toUpperCase()
  const normalizedPrefix = `${prefix.toUpperCase()}-`
  if (!normalized.startsWith(normalizedPrefix)) {
    return null
  }
  const digits = normalized.slice(normalizedPrefix.length).match(/\d+/g)
  if (!digits) {
    return null
  }
  const parsed = Number(digits.join(''))
  return Number.isFinite(parsed) ? parsed : null
}

export function normalizeTags(raw?: string | string[]) {
  if (!raw) return []
  const values = Array.isArray(raw) ? raw : raw.split(',')
  return values
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => value.toLowerCase())
}
