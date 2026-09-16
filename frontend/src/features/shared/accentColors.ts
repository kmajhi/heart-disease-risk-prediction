/**
 * Shared multicolor accent system for icon badges/highlights across the
 * dark theme — cycled by index so grids of cards read as "colorful" rather
 * than every card reusing one brand gradient. Keep gradients 2-stop and
 * restrained (this is "minimal", not neon) — used only on small icon
 * badges, never as full-card washes.
 */
export const ACCENT_GRADIENTS = [
  'from-indigo-500 to-violet-500',
  'from-cyan-400 to-sky-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-fuchsia-400 to-purple-500',
] as const

export function accentFor(index: number): string {
  return ACCENT_GRADIENTS[index % ACCENT_GRADIENTS.length]
}
