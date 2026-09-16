import type { PredictionResult } from '../../types/prediction'

function csvEscape(value: string | number | boolean | null): string {
  const str = String(value ?? '')
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

const COLUMNS: { header: string; value: (p: PredictionResult) => string | number | boolean | null }[] = [
  { header: 'id', value: (p) => p.id },
  { header: 'created_at', value: (p) => p.created_at },
  { header: 'tier', value: (p) => p.tier },
  { header: 'probability', value: (p) => p.probability },
  { header: 'risk_label', value: (p) => p.risk_label },
  { header: 'prediction', value: (p) => p.prediction },
  { header: 'threshold_used', value: (p) => p.threshold_used },
  { header: 'bmi', value: (p) => p.bmi },
  { header: 'model_version', value: (p) => p.model_version },
]

/** Client-side only — exports data already fetched for the signed-in user, nothing is sent anywhere. */
export function downloadPredictionsCsv(predictions: PredictionResult[], filename = 'heart-risk-history.csv') {
  const header = COLUMNS.map((c) => c.header).join(',')
  const rows = predictions.map((p) => COLUMNS.map((c) => csvEscape(c.value(p))).join(','))
  const csv = [header, ...rows].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
