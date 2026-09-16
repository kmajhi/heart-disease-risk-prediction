export type Tier = 'basic' | 'enhanced'
export type RiskLabel = 'Low' | 'Moderate' | 'High'

export interface BasicPredictionInput {
  tier: 'basic'
  age: number
  sex: 'M' | 'F'
  height_cm: number
  weight_kg: number
  bp: number
  family_history: boolean
  hypertension: boolean
  diabetes: boolean
  chest_pain_history: boolean
}

export interface EnhancedPredictionInput extends Omit<BasicPredictionInput, 'tier'> {
  tier: 'enhanced'
  total_cholesterol: number
  ldl: number
  triglycerides: number
  rbs: number
}

export type PredictionInput = BasicPredictionInput | EnhancedPredictionInput

export interface ExplanationFactor {
  feature: string
  value: number | boolean | string
  contribution: number
  direction: 'increases_risk' | 'decreases_risk'
}

export interface Explanation {
  top_factors: ExplanationFactor[]
}

export interface PredictionResult {
  id: number
  tier: Tier | 'legacy'
  prediction: boolean
  probability: number
  risk_label: RiskLabel
  bmi: number | null
  model_version: string
  threshold_used: number
  explanation: Explanation | null
  created_at: string
  input: Record<string, unknown>
}
