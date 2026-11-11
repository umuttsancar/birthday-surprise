/** Normalize Turkish answer text for open-ended birthday checks. */
export function normalizeAnswer(raw: string): string {
  return raw
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isFeyzaBirthdayAnswer(raw: string): boolean {
  const t = normalizeAnswer(raw)
  if (!t) return false

  const hasFeyza = t.includes('feyza')
  const hasBirthday =
    t.includes('dogum gunu') ||
    t.includes('dogumgunu') ||
    t.includes('birthday') ||
    t.includes('dogumu') ||
    t === 'dogum gunu' ||
    t.includes('dogdugu gun')

  // Accept close variants: "feyza'nın doğum günü", "feyzanın doğumu", etc.
  if (hasFeyza && hasBirthday) return true
  if (t.includes('feyzanin dogum')) return true
  if (t === 'feyza dogum gunu') return true
  if (hasFeyza && (t.includes('dogum') || t.includes('kutlu'))) return true

  return false
}
