import { z } from 'zod'
import type { PredictionInput } from '../../types/prediction'

/**
 * Mirrors backend/predictions/serializers.py's Basic/Enhanced serializers
 * field-for-field (ML-5 frozen schema: Basic = 9 fields, Enhanced = 9 + 4).
 * A single flat schema + superRefine (rather than a true zod discriminated
 * union) keeps this compatible with RHF's register/valueAsNumber pattern
 * already used elsewhere in this form — the 4 Enhanced-only fields are
 * simply optional unless tier === 'enhanced'.
 */
const yesNo = z.enum(['yes', 'no'], { message: 'Select an option' })
// See Phase 3 ML-3/ML-4 history: z.coerce.number() splits RHF's field-value
// type from zod's parsed type across zod v4; register(..., {valueAsNumber:true})
// avoids that, so plain z.number() is used here, not z.coerce.number().
const num = (min: number, max: number) =>
  z.number().min(min, `Must be ${min}–${max}`).max(max, `Must be ${min}–${max}`)
const optionalNum = (min: number, max: number) => num(min, max).optional()

const ENHANCED_ONLY_FIELDS = ['total_cholesterol', 'ldl', 'triglycerides', 'rbs'] as const

export const predictionFormSchema = z
  .object({
    tier: z.enum(['basic', 'enhanced']),
    age: num(1, 120).int('Whole years only'),
    sex: z.enum(['M', 'F'], { message: 'Select an option' }),
    height_cm: num(50, 250),
    weight_kg: num(10, 300),
    bp: num(40, 300),
    family_history: yesNo,
    hypertension: yesNo,
    diabetes: yesNo,
    chest_pain_history: yesNo,
    total_cholesterol: optionalNum(0, 1000),
    ldl: optionalNum(0, 400),
    triglycerides: optionalNum(0, 1000),
    rbs: optionalNum(0, 50),
  })
  .superRefine((data, ctx) => {
    if (data.tier !== 'enhanced') return
    for (const field of ENHANCED_ONLY_FIELDS) {
      const value = data[field]
      if (value === undefined || Number.isNaN(value)) {
        ctx.addIssue({ code: 'custom', path: [field], message: 'Required for Enhanced prediction.' })
      }
    }
  })

export type PredictionFormValues = z.infer<typeof predictionFormSchema>

const YES_NO_FIELDS = ['family_history', 'hypertension', 'diabetes', 'chest_pain_history'] as const

export function toPredictionInput(values: PredictionFormValues): PredictionInput {
  const base = {
    tier: values.tier,
    age: values.age,
    sex: values.sex,
    height_cm: values.height_cm,
    weight_kg: values.weight_kg,
    bp: values.bp,
  } as Record<string, unknown>

  for (const field of YES_NO_FIELDS) {
    base[field] = values[field] === 'yes'
  }

  if (values.tier === 'enhanced') {
    base.total_cholesterol = values.total_cholesterol
    base.ldl = values.ldl
    base.triglycerides = values.triglycerides
    base.rbs = values.rbs
  }

  return base as unknown as PredictionInput
}
