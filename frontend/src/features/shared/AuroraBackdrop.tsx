export function AuroraBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="animate-aurora absolute -top-24 -left-16 h-72 w-72 rounded-full bg-indigo-400/30 blur-3xl dark:bg-indigo-500/20" />
      <div className="animate-aurora-reverse absolute -right-16 top-10 h-72 w-72 rounded-full bg-cyan-400/30 blur-3xl dark:bg-cyan-400/15" />
      <div className="animate-aurora absolute bottom-[-4rem] left-1/3 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-500/15" />
    </div>
  )
}
