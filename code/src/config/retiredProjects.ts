/** Publicly retired portfolio entries, including legacy slugs and aliases.
 * Keep historical CMS records for audit/rollback; never render their cards
 * or case routes, even from a six-hour browser cache.
 */
export const RETIRED_PROJECT_SLUGS: ReadonlySet<string> = new Set([
  'power-platform',
  'scientific-analysis',
  'scientific-analysis-toolkit',
  'pdf-frequency-analyzer',
])
