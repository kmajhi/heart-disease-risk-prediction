export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      <p className="mt-4 text-xs uppercase tracking-wide text-slate-400">Coming soon</p>
    </div>
  )
}
