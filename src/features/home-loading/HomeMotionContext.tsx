import { createContext, useContext, type ReactNode } from 'react'

/** Home's existing animations are opt-in while the entry door is closed.
 * Default true keeps previews, other routes and isolated component tests intact.
 */
const HomeMotionContext = createContext(true)

export function HomeMotionProvider({
  enabled, children,
}: { enabled: boolean; children: ReactNode }) {
  return <HomeMotionContext.Provider value={enabled}>{children}</HomeMotionContext.Provider>
}

export function useHomeMotionEnabled(): boolean {
  return useContext(HomeMotionContext)
}
