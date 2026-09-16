import type { UseFormReturn } from 'react-hook-form'
import { FormSection } from '../FormSection'
import { NumericField } from '../fields/NumericField'
import type { PredictionFormValues } from '../formSchema'

export function LabsSection({ form }: { form: UseFormReturn<PredictionFormValues> }) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <FormSection id="labs" title="Hematology / Renal / Electrolytes">
      <NumericField
        label="Haemoglobin"
        unit="g/dL"
        error={errors.haemoglobin?.message}
        {...register('haemoglobin', { valueAsNumber: true })}
      />
      <NumericField
        label="Creatinine"
        unit="mg/dL"
        error={errors.creatinine?.message}
        {...register('creatinine', { valueAsNumber: true })}
      />
      <NumericField
        label="Platelets"
        unit="/µL"
        error={errors.platelets?.message}
        {...register('platelets', { valueAsNumber: true })}
      />
      <NumericField
        label="Sodium"
        unit="mmol/L"
        error={errors.sodium?.message}
        {...register('sodium', { valueAsNumber: true })}
      />
      <NumericField
        label="Potassium"
        unit="mmol/L"
        error={errors.potassium?.message}
        {...register('potassium', { valueAsNumber: true })}
      />
      <NumericField
        label="Chloride"
        unit="mmol/L"
        error={errors.chloride?.message}
        {...register('chloride', { valueAsNumber: true })}
      />
    </FormSection>
  )
}
