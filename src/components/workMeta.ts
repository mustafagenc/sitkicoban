/** Eser künyesinin dolu parçaları, sırayla: yazı türleri (" · " ile), eser türü, yıl. Boşlar atılır. */
export function workMeta(e: {
  yaziTurleri: string[]
  tur?: string | null
  yil?: string | null
}): string[] {
  return [e.yaziTurleri.filter(Boolean).join(' · '), e.tur, e.yil]
    .map((s) => (s ?? '').trim())
    .filter(Boolean)
}
