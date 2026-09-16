import { request } from './client'
import type { PredictionInput, PredictionResult } from '../types/prediction'

export function submitPrediction(payload: PredictionInput) {
  return request<PredictionResult>('/predictions/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getPrediction(id: string) {
  return request<PredictionResult>(`/predictions/${id}/`)
}

export function listPredictions() {
  return request<PredictionResult[]>('/predictions/')
}

export function getPredictionExplanation(id: string) {
  return request<{ llm_summary: string }>(`/predictions/${id}/explanation/`)
}
