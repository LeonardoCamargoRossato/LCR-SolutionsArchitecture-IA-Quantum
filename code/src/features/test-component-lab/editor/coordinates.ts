import type { CanvasRatio, EditorUnit, Transform } from './document-model'
export type Axis = 'x' | 'y'
export function gridCounts(width: number, height: number): [number, number] {
  return [16, Math.max(1, Math.round(16 * height / width))]
}
export function fromVirtual(px: number, axis: Axis, width: number, height: number, unit: EditorUnit): number {
  if (unit === 'px') return Math.round(px * 100) / 100
  if (unit === 'percent') return Math.round(px / (axis === 'x' ? width : height) * 10000) / 100
  return Math.round(px / (width / 16) * 1000) / 1000
}
export function toVirtual(value: number, axis: Axis, width: number, height: number, unit: EditorUnit): number {
  if (!Number.isFinite(value)) return 0
  if (unit === 'px') return value
  if (unit === 'percent') return value * (axis === 'x' ? width : height) / 100
  return value * width / 16
}
export function angleFromPoint(x: number, y: number, centerX: number, centerY: number): number {
  return Math.atan2(y - centerY, x - centerX) * 180 / Math.PI + 90
}
export function relativeDelta(dx: number, dy: number, rotation: number) {
  const radians = rotation * Math.PI / 180
  return { dx: dx * Math.cos(radians) + dy * Math.sin(radians), dy: -dx * Math.sin(radians) + dy * Math.cos(radians) }
}
export function resizeTransform(base: Transform, handle: string, dx: number, dy: number): Transform {
  const local = relativeDelta(dx, dy, base.rotation)
  let { x, y, width, height } = base
  if (handle.includes('e')) width += local.dx
  if (handle.includes('w')) { width -= local.dx; x += local.dx }
  if (handle.includes('s')) height += local.dy
  if (handle.includes('n')) { height -= local.dy; y += local.dy }
  if (base.lockAspectRatio) {
    const ratio = base.width / base.height
    if ((handle.includes('n') || handle.includes('s')) && !(handle.includes('e') || handle.includes('w'))) width = height * ratio
    else height = width / ratio
  }
  width = Math.max(24, Math.min(4096, width))
  height = Math.max(24, Math.min(4096, height))
  return { ...base, x: base.lockX ? base.x : x, y: base.lockY ? base.y : y, width, height }
}
export function canvasRatioFor(width: number, height: number): CanvasRatio {
  const ratios: [CanvasRatio, number][] = [['16:9',16/9],['16:4',4],['4:3',4/3],['1:1',1]]
  return ratios.find(([_,value])=>Math.abs(value-width/height)<.003)?.[0] || 'custom'
}
