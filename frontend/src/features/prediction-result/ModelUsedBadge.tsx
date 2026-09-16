import { Link } from 'react-router-dom'

export function ModelUsedBadge({ modelVersion }: { modelVersion: string }) {
  return (
    <p className="text-sm text-slate-600 dark:text-slate-300">
      Model:{' '}
      <Link to="/models/compare" className="underline">
        {modelVersion}
      </Link>
    </p>
  )
}
