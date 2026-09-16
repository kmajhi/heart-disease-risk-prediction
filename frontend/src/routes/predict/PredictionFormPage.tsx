import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { AssessmentProgress } from '../../features/prediction-form/AssessmentProgress'
import { AssessmentSummary } from '../../features/prediction-form/AssessmentSummary'
import { InfoBanner } from '../../features/prediction-form/InfoBanner'
import { PredictionHeader } from '../../features/prediction-form/PredictionHeader'
import { PredictionSidebar } from '../../features/prediction-form/PredictionSidebar'
import { DemographicsSection } from '../../features/prediction-form/sections/DemographicsSection'
import { LipidsSection } from '../../features/prediction-form/sections/LipidsSection'
import { MedicalHistorySection } from '../../features/prediction-form/sections/MedicalHistorySection'
import { VitalsSection } from '../../features/prediction-form/sections/VitalsSection'
import { predictionFormSchema, toPredictionInput, type PredictionFormValues } from '../../features/prediction-form/formSchema'
import { TierToggle } from '../../features/prediction-form/TierToggle'
import { ErrorBanner } from '../../features/shared/ErrorBanner'
import { usePredictMutation } from '../../hooks/usePredictionMutations'
import type { Tier } from '../../types/prediction'

const BASIC_SECTION_FIELDS: Record<string, (keyof PredictionFormValues)[]> = {
  demographics: ['age', 'sex', 'height_cm', 'weight_kg'],
  'medical-history': ['family_history', 'hypertension', 'diabetes', 'chest_pain_history'],
  vitals: ['bp'],
}
const ENHANCED_EXTRA_FIELDS: (keyof PredictionFormValues)[] = ['total_cholesterol', 'ldl', 'triglycerides', 'rbs']

export function PredictionFormPage() {
  const [tier, setTier] = useState<Tier>('basic')
  const form = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionFormSchema),
    mode: 'onBlur',
    defaultValues: { tier: 'basic' },
  })
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    watch,
  } = form
  const predictMutation = usePredictMutation()
  const navigate = useNavigate()
  const values = watch()

  const handleTierChange = (next: Tier) => {
    setTier(next)
    setValue('tier', next, { shouldValidate: true })
  }

  const sectionFields: Record<string, (keyof PredictionFormValues)[]> =
    tier === 'enhanced'
      ? { ...BASIC_SECTION_FIELDS, lipids: ENHANCED_EXTRA_FIELDS }
      : BASIC_SECTION_FIELDS

  const allRequiredFields = Object.values(sectionFields).flat()
  const isFieldComplete = (field: keyof PredictionFormValues) => {
    // RHF's pre-fill runtime value for an untouched radio/select field is ''
    // (empty string), even though that's outside the zod-inferred type —
    // cast to unknown here since this is a best-effort UI hint, not the
    // real validation (zod + form submission still gate correctness).
    const value = values[field] as unknown
    if (value === undefined || value === null || value === '') return false
    if (typeof value === 'number' && Number.isNaN(value)) return false
    return !(field in errors)
  }
  const completedCount = allRequiredFields.filter(isFieldComplete).length

  const onSubmit = handleSubmit(async (formValues) => {
    try {
      const result = await predictMutation.mutateAsync(toPredictionInput(formValues))
      navigate(`/predictions/${result.id}`)
    } catch (error) {
      if (error instanceof ApiError) {
        setError('root', { message: error.detail })
      } else {
        setError('root', { message: 'Something went wrong. Please try again.' })
      }
    }
  })

  return (
    <div className="-mx-4 -my-8 bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <PredictionHeader />
        <InfoBanner />
        <TierToggle tier={tier} onChange={handleTierChange} />
        <AssessmentProgress completed={completedCount} total={allRequiredFields.length} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            {errors.root && <ErrorBanner message={errors.root.message ?? 'Submission failed.'} />}

            <DemographicsSection form={form} />
            <MedicalHistorySection form={form} />
            <VitalsSection form={form} />
            {tier === 'enhanced' && <LipidsSection form={form} />}

            <AssessmentSummary tier={tier} completed={completedCount} total={allRequiredFields.length} />

            <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-5 text-center shadow-sm sm:p-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full max-w-sm rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all duration-150 hover:shadow-lg hover:shadow-indigo-500/40 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 sm:text-base"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="size-2 animate-pulse rounded-full bg-white" />
                    <span className="size-2 animate-pulse rounded-full bg-white [animation-delay:150ms]" />
                    <span className="size-2 animate-pulse rounded-full bg-white [animation-delay:300ms]" />
                    Analyzing your information…
                  </span>
                ) : (
                  'Analyze My Heart Risk'
                )}
              </button>
              <p className="text-xs text-slate-500">
                Your information will be processed to generate a model-estimated risk and explanation.
              </p>
            </div>
          </form>

          <PredictionSidebar />
        </div>
      </div>
    </div>
  )
}
