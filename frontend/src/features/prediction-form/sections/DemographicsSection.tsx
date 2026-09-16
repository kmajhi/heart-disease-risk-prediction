import { useMemo } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { FormSection } from '../FormSection'
import { NumericField } from '../fields/NumericField'
import { SelectField } from '../fields/SelectField'
import type { PredictionFormValues } from '../formSchema'

/**
 * BMI is never a form field, never registered with RHF, and never sent to
 * the API — it is a read-only display value computed from height/weight.
 * The ML-5 models never take BMI as an input.
 */
export function DemographicsSection({ form }: { form: UseFormReturn<PredictionFormValues> }) {
  const {
    register,
    watch,
    formState: { errors },
  } = form

  const height = watch('height_cm')
  const weight = watch('weight_kg')

  const bmi = useMemo(() => {
    const heightM = Number(height) / 100
    const weightKg = Number(weight)
    if (!(heightM > 0) || !(weightKg > 0)) return null
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10
  }, [height, weight])

  return (
    <FormSection
      id="demographics"
      title="Personal & Physical Information"
      subtitle="Basic information helps the model understand important characteristics associated with heart disease risk."
    >
      <NumericField
        label="Age"
        unit="years"
        hint="Your age in years"
        error={errors.age?.message}
        {...register('age', { valueAsNumber: true })}
      />
      <SelectField
        label="Sex"
        error={errors.sex?.message}
        options={[
          { value: 'M', label: 'Male' },
          { value: 'F', label: 'Female' },
        ]}
        {...register('sex')}
      />
      <NumericField
        label="Height"
        unit="cm"
        hint="Centimeters (cm)"
        error={errors.height_cm?.message}
        {...register('height_cm', { valueAsNumber: true })}
      />
      <NumericField
        label="Weight"
        unit="kg"
        hint="Kilograms (kg)"
        error={errors.weight_kg?.message}
        {...register('weight_kg', { valueAsNumber: true })}
      />
      <div className="sm:col-span-2">
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-4 py-3 transition-all duration-150">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Body Mass Index
          </span>
          {bmi === null ? (
            <p className="mt-1 text-sm text-slate-500">Enter height and weight to calculate BMI.</p>
          ) : (
            <div className="mt-1 flex items-baseline gap-2 transition-all duration-150">
              <span className="text-2xl font-bold text-white">
                {bmi}
                <span className="ml-1 text-sm font-medium text-slate-500">kg/m²</span>
              </span>
              <span className="text-xs text-slate-500">
                Calculated from your height and weight — for reference only, not used by the model
              </span>
            </div>
          )}
        </div>
      </div>
    </FormSection>
  )
}
