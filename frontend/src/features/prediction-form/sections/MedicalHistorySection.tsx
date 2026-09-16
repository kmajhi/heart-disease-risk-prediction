import type { UseFormReturn } from 'react-hook-form'
import { FormSection } from '../FormSection'
import { YesNoField } from '../fields/YesNoField'
import type { PredictionFormValues } from '../formSchema'

export function MedicalHistorySection({ form }: { form: UseFormReturn<PredictionFormValues> }) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <FormSection
      id="medical-history"
      title="Medical History"
      subtitle="These questions capture selected personal and family health factors used by the prediction model."
    >
      <YesNoField
        label="Family history of heart disease"
        hint="Select Yes if you have a relevant family history of heart disease."
        error={errors.family_history?.message}
        registration={register('family_history')}
      />
      <YesNoField
        label="Hypertension"
        error={errors.hypertension?.message}
        registration={register('hypertension')}
      />
      <YesNoField
        label="Diabetes"
        error={errors.diabetes?.message}
        registration={register('diabetes')}
      />
      <YesNoField
        label="History of chest pain"
        error={errors.chest_pain_history?.message}
        registration={register('chest_pain_history')}
      />
    </FormSection>
  )
}
