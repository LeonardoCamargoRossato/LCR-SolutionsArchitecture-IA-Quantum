import { WAVE_PRESETS, clampWaveSettings, type PreviewSurface, type WavePresetId, type WaveSettings } from '../../../components/test-component-lab/particle-wave/particle-wave-types'

export type EditorUnit = 'grid' | 'px' | 'percent'
export type CanvasRatio = '16:9' | '16:4' | '4:3' | '1:1' | 'custom'
export type BackgroundFit = 'contain' | 'cover' | 'original'
export type WaveDirection = 'forward' | 'reverse'
export type LayerKind = 'background' | 'wave' | 'text' | 'guides'
export type FontChoice = 'sans' | 'serif' | 'mono'
export type TextKind = 'title' | 'subtitle' | 'free'
export type Transform = {
  x: number; y: number; width: number; height: number; rotation: number
  flipX: boolean; flipY: boolean; lockX: boolean; lockY: boolean; lockAspectRatio: boolean
}
export type TextOverlay = {
  id: string; kind: TextKind; content: string; transform: Transform
  font: FontChoice; fontSize: number; color: string; align: 'left' | 'center' | 'right'
}
export type Layer = { id: string; kind: LayerKind; name: string; visible: boolean; locked: boolean; order: number }
export type BackgroundReference = {
  id: string; name: string; mime: string; width: number; height: number
  fit: BackgroundFit; opacity: number
}
export type CompositionDocument = {
  schemaVersion: 2; componentId: 'particle-wave'; preset: WavePresetId
  canvas: { width: number; height: number; aspectRatio: CanvasRatio; lockAspectRatio: boolean }
  units: EditorUnit; gridVisible: boolean; rulersVisible: boolean
  transform: Transform; animation: { direction: WaveDirection; running: boolean }
  surface: PreviewSurface; settings: WaveSettings
  background: BackgroundReference | null; texts: TextOverlay[]; layers: Layer[]
}
export type StoredPreset = { id: string; name: string; savedAt: string; document: CompositionDocument }

export const CANVAS_SIZES = {
  '16:9': { width: 1600, height: 900 },
  '16:4': { width: 1600, height: 400 },
  '4:3': { width: 1200, height: 900 },
  '1:1': { width: 1000, height: 1000 },
} as const

export const initialTransform: Transform = {
  x: 300, y: 100, width: 1000, height: 680, rotation: 0,
  flipX: false, flipY: false, lockX: false, lockY: false, lockAspectRatio: false,
}
export const defaultDocument: CompositionDocument = {
  schemaVersion: 2, componentId: 'particle-wave', preset: 'lcr-dark',
  canvas: { width: 1600, height: 900, aspectRatio: '16:9', lockAspectRatio: true },
  units: 'grid', gridVisible: true, rulersVisible: true,
  transform: { ...initialTransform },
  animation: { direction: 'forward', running: true },
  surface: 'dark', settings: { ...WAVE_PRESETS['lcr-dark'] },
  background: null, texts: [],
  layers: [
    { id: 'background', kind: 'background', name: 'Background / Screenshot', visible: true, locked: true, order: 0 },
    { id: 'wave', kind: 'wave', name: 'Particle Wave', visible: true, locked: false, order: 1 },
    { id: 'guides', kind: 'guides', name: 'Editor Guides', visible: true, locked: true, order: 1000 },
  ],
}

export function id(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `layer-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}
const within = (value: unknown, min: number, max: number, fallback: number) => {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback
}
const hex = (value: unknown, fallback: string) => typeof value === 'string' && /^#[a-f\d]{6}$/i.test(value) ? value : fallback
export function safeTransform(value: unknown, fallback: Transform = initialTransform): Transform {
  const v = value && typeof value === 'object' ? value as Partial<Transform> : {}
  return {
    x: within(v.x, -4096, 4096, fallback.x), y: within(v.y, -4096, 4096, fallback.y),
    width: within(v.width, 24, 4096, fallback.width), height: within(v.height, 24, 4096, fallback.height),
    rotation: within(v.rotation, -3600, 3600, fallback.rotation),
    flipX: Boolean(v.flipX), flipY: Boolean(v.flipY),
    lockX: Boolean(v.lockX), lockY: Boolean(v.lockY), lockAspectRatio: Boolean(v.lockAspectRatio),
  }
}
const isPreset = (value: unknown): value is WavePresetId => value === 'codarox' || value === 'lcr-light' || value === 'lcr-dark'
const isSurface = (value: unknown): value is PreviewSurface => value === 'light' || value === 'dark' || value === 'transparent'
const isRatio = (value: unknown): value is CanvasRatio => ['16:9','16:4','4:3','1:1','custom'].includes(String(value))
const isUnit = (value: unknown): value is EditorUnit => ['grid','px','percent'].includes(String(value))

/** Validate untrusted local JSON and migrate the older V1 configuration format. */
export function parseConfiguration(raw: unknown): CompositionDocument {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw Error('Arquivo JSON inválido.')
  const v = raw as Record<string, unknown>
  if (v.componentId !== 'particle-wave') throw Error('Apenas Particle Wave está registrado nesta versão.')
  if (v.schemaVersion !== undefined && v.schemaVersion !== 2 && v.schemaVersion !== 1) throw Error('Versão de esquema não suportada.')
  const preset = isPreset(v.preset) ? v.preset : 'lcr-dark'
  if (!v.settings || typeof v.settings !== 'object' || Array.isArray(v.settings)) throw Error('O JSON precisa de parâmetros da animação.')
  const settings = clampWaveSettings({ ...WAVE_PRESETS[preset], ...v.settings as Partial<WaveSettings> })
  const base = structuredClone(defaultDocument)
  if (v.schemaVersion !== 2) {
    return { ...base, preset, surface: isSurface(v.surface) ? v.surface : base.surface, settings }
  }
  const canvas = v.canvas && typeof v.canvas === 'object' ? v.canvas as Record<string, unknown> : {}
  const width = within(canvas.width, 240, 4096, 1600)
  const height = within(canvas.height, 160, 4096, 900)
  const canvasRatio = isRatio(canvas.aspectRatio) ? canvas.aspectRatio : 'custom'
  const transform = safeTransform(v.transform)
  const anim = v.animation && typeof v.animation === 'object' ? v.animation as Record<string, unknown> : {}
  const bg = v.background && typeof v.background === 'object' ? v.background as Record<string, unknown> : null
  const background = bg && typeof bg.id === 'string' && typeof bg.name === 'string' && bg.id.length < 200
    ? {
      id: bg.id, name: bg.name.slice(0,180), mime: typeof bg.mime === 'string' ? bg.mime.slice(0,50) : 'image/png',
      width: within(bg.width, 1, 8192, 1), height: within(bg.height, 1, 8192, 1),
      fit: (['contain','cover','original'] as unknown[]).includes(bg.fit) ? bg.fit as BackgroundFit : 'contain',
      opacity: within(bg.opacity, 0, 1, 1),
    } : null
  const texts = (Array.isArray(v.texts) ? v.texts : []).slice(0, 20).filter(t => t && typeof t === 'object').map((value, index) => {
    const t = value as Record<string, unknown>
    const kind: TextKind = t.kind === 'title' || t.kind === 'subtitle' ? t.kind : 'free'
    return {
      id: typeof t.id === 'string' && t.id.length < 120 ? t.id : `text-${index}`,
      kind, content: String(t.content ?? '').slice(0, 500),
      transform: safeTransform(t.transform, { ...initialTransform, x: 90, y: 75 + index * 90, width: 800, height: 75 }),
      font: t.font === 'serif' || t.font === 'mono' ? t.font : 'sans',
      fontSize: within(t.fontSize, 10, 180, 38), color: hex(t.color, '#ffffff'),
      align: t.align === 'center' || t.align === 'right' ? t.align : 'left',
    } as TextOverlay
  })
  const rawLayers = Array.isArray(v.layers) ? v.layers : []
  const layerIds = new Set(['background','wave','guides', ...texts.map(t => t.id)])
  const layers: Layer[] = [...layerIds].map((layerId, index) => {
    const entry = rawLayers.find(t => t && typeof t === 'object' && (t as { id?: unknown }).id === layerId) as Partial<Layer> | undefined
    const kind: LayerKind = layerId === 'background' ? 'background' : layerId === 'wave' ? 'wave' : layerId === 'guides' ? 'guides' : 'text'
    return { id: layerId, kind, name: kind === 'text' ? `Text: ${texts.find(t => t.id === layerId)?.content.slice(0,24) || 'Overlay'}` : kind === 'wave' ? 'Particle Wave' : kind === 'guides' ? 'Editor Guides' : 'Background / Screenshot',
      visible: entry?.visible !== false, locked: kind === 'background' || kind === 'guides' ? true : Boolean(entry?.locked),
      order: within(entry?.order, -100, 1000, index) }
  })
  return { schemaVersion: 2, componentId: 'particle-wave', preset,
    canvas: { width, height, aspectRatio: canvasRatio, lockAspectRatio: Boolean(canvas.lockAspectRatio) },
    units: isUnit(v.units) ? v.units : 'grid', gridVisible: v.gridVisible !== false, rulersVisible: v.rulersVisible !== false,
    transform, settings, surface: isSurface(v.surface) ? v.surface : 'dark',
    animation: { direction: anim.direction === 'reverse' ? 'reverse' : 'forward', running: anim.running !== false },
    background, texts, layers }
}

export function heroPreset(): CompositionDocument {
  const doc = structuredClone(defaultDocument)
  const phrases = [
    ['title', 'AI Engineering & Software Development', 64, 80, 860, 130, 70],
    ['subtitle', 'Building Intelligent Solutions.', 64, 235, 800, 80, 39],
    ['free', 'I design and build intelligent software, combining AI, data, and systems architecture.', 64, 350, 810, 130, 25],
  ] as const
  doc.texts = phrases.map(([kind, content, x, y, width, height, fontSize]) => ({
    id: id(), kind, content, transform: { ...initialTransform, x, y, width, height },
    font: 'sans', color: '#ffffff', fontSize, align: 'left',
  }))
  doc.layers.push(...doc.texts.map((t, i) => ({ id: t.id, kind: 'text' as const, name: `Text: ${t.kind}`, visible: true, locked: false, order: 3 + i })))
  doc.transform = { ...initialTransform, x: 760, y: 165, width: 760, height: 570 }
  return doc
}
