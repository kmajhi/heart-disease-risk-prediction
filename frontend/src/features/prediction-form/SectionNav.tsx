interface Section {
  id: string
  label: string
  complete: boolean
}

export function SectionNav({ sections }: { sections: Section[] }) {
  return (
    <nav className="sticky top-4 space-y-1">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${section.complete ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}
            aria-hidden
          />
          {section.label}
        </a>
      ))}
    </nav>
  )
}
