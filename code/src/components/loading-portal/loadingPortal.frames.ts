/** Eight approved keyframes from the LCR Loading Portal V1 package. */
export const LOADING_PORTAL_KEYFRAMES = [
  { value: 0, filename: 'portal-000.webp' },
  { value: 2, filename: 'portal-002.webp' },
  { value: 10, filename: 'portal-010.webp' },
  { value: 30, filename: 'portal-030.webp' },
  { value: 50, filename: 'portal-050.webp' },
  { value: 80, filename: 'portal-080.webp' },
  { value: 99, filename: 'portal-099.webp' },
  { value: 100, filename: 'portal-100.webp' },
] as const;

export const DEFAULT_LOADING_PORTAL_ASSETS =
  `${import.meta.env.BASE_URL}assets/home/loading-portal`;

export function clampProgress(value: number): number {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
}

export function resolveKeyframes(progress: number) {
  const p = clampProgress(progress);
  const frames = LOADING_PORTAL_KEYFRAMES;
  for (let i = 1; i < frames.length; i++) {
    const upper = frames[i];
    if (p <= upper.value) {
      const lower = frames[i - 1];
      return {
        from: lower.filename,
        to: upper.filename,
        mix: (p - lower.value) / (upper.value - lower.value),
      };
    }
  }
  return { from: frames[frames.length - 1].filename, to: frames[frames.length - 1].filename, mix: 0 };
}

export function assetUrl(directory: string, filename: string): string {
  return `${directory.replace(/\/$/, '')}/${filename}`;
}
