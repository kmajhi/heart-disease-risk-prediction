import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getPrediction, getPredictionExplanation, listPredictions, submitPrediction } from '../api/predictions'

export function usePredictMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitPrediction,
    onSuccess: (result) => {
      queryClient.setQueryData(['prediction', String(result.id)], result)
    },
  })
}

export function usePrediction(id: string | undefined) {
  return useQuery({
    queryKey: ['prediction', id],
    queryFn: () => getPrediction(id as string),
    enabled: Boolean(id),
  })
}

// Independent query/loading state from usePrediction — the LLM call is
// slower than the ML call and must never block the rest of the result page.
export function usePredictionExplanation(id: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['prediction-explanation', id],
    queryFn: () => getPredictionExplanation(id as string),
    enabled: Boolean(id) && enabled,
    retry: false,
  })
}

export function usePredictionHistory() {
  return useQuery({
    queryKey: ['predictions'],
    queryFn: listPredictions,
  })
}
