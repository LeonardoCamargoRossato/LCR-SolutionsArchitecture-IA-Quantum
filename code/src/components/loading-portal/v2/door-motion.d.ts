export interface DoorMotionOptions { duration?: number; cinematic?: boolean; mobile?: boolean; reducedMotion?: boolean; onOpening?: () => void; onOpened?: () => void; onFallback?: () => void }
export interface DoorMotion { pause(): void; play(): void; cancel(): void }
export function createDoorMotion(root: HTMLElement, options?: DoorMotionOptions): DoorMotion
