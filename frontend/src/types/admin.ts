export interface AdminStats {
  total_users: number
  total_predictions: number
  predictions_last_7_days: number
  tier_counts: {
    basic: number
    enhanced: number
    legacy: number
  }
  risk_label_counts: {
    Low: number
    Moderate: number
    High: number
  }
  model_version_counts: { model_version: string; count: number }[]
  predictions_per_day: { date: string; count: number }[]
  average_probability: number | null
}
