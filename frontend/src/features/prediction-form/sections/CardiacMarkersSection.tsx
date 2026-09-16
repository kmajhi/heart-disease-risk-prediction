import type { UseFormReturn } from 'react-hook-form'
import { FormSection } from '../FormSection'
import { CheckboxField } from '../fields/CheckboxField'
import { NumericField } from '../fields/NumericField'
import type { PredictionFormValues } from '../formSchema'

export function CardiacMarkersSection({ form }: { form: UseFormReturn<PredictionFormValues> }) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <FormSection id="cardiac-markers" title="Cardiac Markers">
      <NumericField
        label="Troponin-I"
        unit="ng/mL"
        error={errors.troponin_i?.message}
        {...register('troponin_i', { valueAsNumber: true })}
      />
      <CheckboxField
        label="Value was instrument-censored (reported as “greater than”)"
        hint="Check this if the lab reported a value like “&gt;25000” rather than an exact number."
        {...register('troponin_censored_high')}
      />
    </FormSection>
  )
}
