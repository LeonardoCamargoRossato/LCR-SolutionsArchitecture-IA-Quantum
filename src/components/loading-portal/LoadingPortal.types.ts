/** Approved LCR Loading Portal V1 contract. Site readiness is external. */
export type LoadingPortalPhase = 'charging' | 'charged' | 'opening' | 'opened';

export type LoadingPortalProps = {
  /** Host-supplied progress. It is never a simulated network byte percentage. */
  progress: number;
  /** A true readiness signal is required to open the door. */
  ready: boolean;
  /** Called exactly once after the door finishes opening. */
  onOpened?: () => void;
  /** Respects the Vite Pages base (not /assets/... absolute root). */
  assetBaseUrl?: string;
  chargedHoldMs?: number;
  openingDurationMs?: number;
  className?: string;
};
