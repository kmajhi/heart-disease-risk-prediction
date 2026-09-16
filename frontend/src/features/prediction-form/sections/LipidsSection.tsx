import type { UseFormReturn } from 'react-hook-form'
import { FormSection } from '../FormSection'
import { NumericField } from '../fields/NumericField'
import type { PredictionFormValues } from '../formSchema'

/**
 * Enhanced-tier only (rendered conditionally by PredictionFormPage). HDL is
 * deliberately NOT collected here — the ML-5 Enhanced feature schema
 * excludes it (confirmed near-zero incremental value once the rest of the
 * lipid panel + RBS are present; see reports/feature_selection.md).
 */
export function LipidsSection({ form }: { form: UseFormReturn<PredictionFormValues> }) {
  const {
    register,
    formState: { errors },
  } = form

  const labHint = 'Use the values from your available laboratory report.'

  return (
    <FormSection
      id="lipids"
      title="Additional Clinical Measurements"
      subtitle="These laboratory measurements provide additional information to the Enhanced machine-learning model."
      badge="Enhanced data"
    >
      <NumericField
        label="Total cholesterol"
        unit="mg/dL"
        hint={labHint}
        error={errors.total_cholesterol?.message}
        {...register('total_cholesterol', { valueAsNumber: true })}
      />
      <NumericField
        label="LDL"
        unit="mg/dL"
        hint={labHint}
        error={errors.ldl?.message}
        {...register('ldl', { valueAsNumber: true })}
      />
      <NumericField
        label="Triglycerides"
        unit="mg/dL"
        hint={labHint}
        error={errors.triglycerides?.message}
        {...register('triglycerides', { valueAsNumber: true })}
      />
      <NumericField
        label="Random blood sugar (RBS)"
        unit="mmol/L"
        hint={labHint}
        error={errors.rbs?.message}
        {...register('rbs', { valueAsNumber: true })}
      />
    </FormSection>
  )
}
