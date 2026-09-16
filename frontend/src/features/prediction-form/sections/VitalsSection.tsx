import type { UseFormReturn } from 'react-hook-form'
import { FormSection } from '../FormSection'
import { NumericField } from '../fields/NumericField'
import type { PredictionFormValues } from '../formSchema'

/**
 * MaxHR is deliberately NOT collected here — the ML-5 Basic/Enhanced
 * feature schemas exclude it (confirmed redundant with Age; see
 * reports/feature_selection.md). Only fields in the frozen schema belong
 * in this form.
 */
export function VitalsSection({ form }: { form: UseFormReturn<PredictionFormValues> }) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <FormSection
      id="vitals"
      title="Blood Pressure"
      subtitle="Enter your blood pressure value as recorded, using the format expected by this assessment."
    >
      <NumericField
        label="Blood pressure"
        unit="mmHg"
        hint="Enter the measurement in mmHg as recorded by your healthcare provider or device."
        error={errors.bp?.message}
        {...register('bp', { valueAsNumber: true })}
      />
    </FormSection>
  )
}
