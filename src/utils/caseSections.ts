export type CaseSectionBlock = {
  title?: string
  body: string[]
  items: string[]
}

export type CaseNarrative = {
  overview: CaseSectionBlock
  challenge: CaseSectionBlock
  context: CaseSectionBlock
  solution: CaseSectionBlock
  approach: CaseSectionBlock
  architecture: CaseSectionBlock
  hardware: CaseSectionBlock
  embeddedLogic: CaseSectionBlock
  webInterface: CaseSectionBlock
  integration: CaseSectionBlock
  features: CaseSectionBlock
  role: CaseSectionBlock
  results: CaseSectionBlock
  technologies: CaseSectionBlock

  // Existing/legacy sections kept so older cases do not regress.
  experience: CaseSectionBlock
  future: CaseSectionBlock
  softwareLayer: CaseSectionBlock
}

type RawSection = unknown
type RawSections = Record<string, RawSection>

function scalarText(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (!value || typeof value !== 'object') return undefined

  const source = value as Record<string, unknown>
  for (const key of ['title', 'label', 'name', 'value', 'description', 'text']) {
    const candidate = source[key]
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
  }
  return undefined
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        if (typeof item === 'string' && item.trim()) return [item.trim()]
        const converted = scalarText(item)
        return converted ? [converted] : []
      })
  }

  if (typeof value === 'string' && value.trim()) return [value.trim()]

  const converted = scalarText(value)
  return converted ? [converted] : []
}

function normalizeSection(value: RawSection, preferItems = false): CaseSectionBlock {
  if (!value) return { body: [], items: [] }

  if (typeof value === 'string' || Array.isArray(value)) {
    const values = toStringArray(value)
    return preferItems
      ? { body: [], items: values }
      : { body: values, items: [] }
  }

  if (typeof value === 'object') {
    const source = value as Record<string, unknown>
    const title = typeof source.title === 'string' && source.title.trim()
      ? source.title.trim()
      : undefined

    const bodySource =
      source.body ??
      source.content ??
      source.description ??
      source.text

    const body = toStringArray(bodySource)
    const items = toStringArray(source.items)

    if (!body.length && !items.length) {
      const fallback = toStringArray(source)
      return preferItems
        ? { title, body: [], items: fallback }
        : { title, body: fallback, items: [] }
    }

    return { title, body, items }
  }

  return { body: [], items: [] }
}

function firstDefined(raw: RawSections, ...keys: string[]) {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return raw[key]
  }
  return undefined
}

export function normalizeCaseSections(sections: unknown): CaseNarrative {
  const raw: RawSections = sections && typeof sections === 'object'
    ? sections as RawSections
    : {}

  return {
    overview: normalizeSection(firstDefined(raw, 'overview')),
    challenge: normalizeSection(firstDefined(raw, 'challenge')),
    context: normalizeSection(firstDefined(raw, 'context')),
    solution: normalizeSection(firstDefined(raw, 'solution', 'advantages')),
    approach: normalizeSection(firstDefined(raw, 'approach')),
    architecture: normalizeSection(firstDefined(raw, 'architecture'), true),
    hardware: normalizeSection(firstDefined(raw, 'hardware', 'hardwareLayer', 'hardware_layer'), true),
    embeddedLogic: normalizeSection(firstDefined(raw, 'embedded_logic', 'embeddedLogic', 'firmware'), true),
    webInterface: normalizeSection(firstDefined(raw, 'web_interface', 'webInterface', 'interface'), true),
    integration: normalizeSection(firstDefined(raw, 'integration', 'systemIntegration', 'system_integration'), true),
    features: normalizeSection(firstDefined(raw, 'features', 'properties'), true),
    role: normalizeSection(firstDefined(raw, 'role'), true),
    results: normalizeSection(firstDefined(raw, 'results'), true),
    technologies: normalizeSection(firstDefined(raw, 'technologies', 'technologiesUsed'), true),

    experience: normalizeSection(firstDefined(raw, 'experience', 'userExperience')),
    future: normalizeSection(firstDefined(raw, 'future')),
    softwareLayer: normalizeSection(firstDefined(raw, 'softwareLayer', 'software_layer', 'software')),
  }
}

export function hasCaseSection(section: CaseSectionBlock) {
  return Boolean(section.title || section.body.length || section.items.length)
}
