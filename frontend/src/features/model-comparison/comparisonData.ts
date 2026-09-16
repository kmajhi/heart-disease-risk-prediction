/**
 * Transcribed verbatim from reports/ml5_final_model_selection.md — every
 * number here must match that file exactly. Never edit these values without
 * updating the source report first (and vice versa).
 */
import type { Tier } from '../../types/prediction'

export interface AlgorithmAuc {
  algorithm: string
  basic: number
  enhanced: number
  isSelected?: boolean
}

// §6, first table — development-set CV, all 6 required algorithms.
export const DEV_CV_AUC_BY_ALGORITHM: AlgorithmAuc[] = [
  { algorithm: 'Logistic Regression', basic: 0.9014, enhanced: 0.979 },
  { algorithm: 'Decision Tree', basic: 0.8595, enhanced: 0.9303 },
  { algorithm: 'Random Forest', basic: 0.9327, enhanced: 0.9853 },
  { algorithm: 'XGBoost', basic: 0.9386, enhanced: 0.983, isSelected: true },
  { algorithm: 'SVM', basic: 0.9299, enhanced: 0.9836 },
  { algorithm: 'KNN', basic: 0.911, enhanced: 0.9724 },
]

export interface FullMetrics {
  algorithm: string
  auc: number
  accuracy: number
  precision: number
  recall: number
  specificity: number
  f1: number
  isSelected?: boolean
}

// §6, second table — "top contenders per tier", development CV.
export const DEV_CV_TOP_CONTENDERS: Record<Tier, FullMetrics[]> = {
  basic: [
    { algorithm: 'XGBoost', auc: 0.939, accuracy: 0.868, precision: 0.913, recall: 0.848, specificity: 0.894, f1: 0.879, isSelected: true },
    { algorithm: 'Random Forest', auc: 0.933, accuracy: 0.861, precision: 0.904, recall: 0.844, specificity: 0.883, f1: 0.873 },
    { algorithm: 'SVM', auc: 0.93, accuracy: 0.852, precision: 0.922, recall: 0.806, specificity: 0.911, f1: 0.859 },
  ],
  enhanced: [
    { algorithm: 'Random Forest', auc: 0.985, accuracy: 0.938, precision: 0.963, recall: 0.927, specificity: 0.953, f1: 0.944 },
    { algorithm: 'SVM', auc: 0.984, accuracy: 0.936, precision: 0.957, recall: 0.93, specificity: 0.944, f1: 0.943 },
    { algorithm: 'XGBoost', auc: 0.983, accuracy: 0.924, precision: 0.953, recall: 0.91, specificity: 0.942, f1: 0.931, isSelected: true },
    { algorithm: 'Logistic Regression', auc: 0.979, accuracy: 0.93, precision: 0.961, recall: 0.915, specificity: 0.95, f1: 0.937 },
  ],
}

// §6 — RF vs XGBoost paired significance test, development CV.
export const SIGNIFICANCE_TEST: Record<Tier, { t: number; p: number }> = {
  basic: { t: 1.069, p: 0.345 },
  enhanced: { t: -1.409, p: 0.232 },
}

export interface FinalTestRow {
  algorithm: string
  threshold: number
  auc: number
  accuracy: number
  precision: number
  recall: number
  specificity: number
  f1: number
  brier: number
  isSelected?: boolean
}

// §11 — final held-out test set (n=207), used exactly once.
export const FINAL_TEST_RESULTS: Record<Tier, FinalTestRow[]> = {
  basic: [
    { algorithm: 'XGBoost', threshold: 0.4681, auc: 0.9135, accuracy: 0.8454, precision: 0.8829, recall: 0.8376, specificity: 0.8556, f1: 0.8596, brier: 0.1121, isSelected: true },
    { algorithm: 'Random Forest', threshold: 0.5, auc: 0.9102, accuracy: 0.8502, precision: 0.8909, recall: 0.8376, specificity: 0.8667, f1: 0.8634, brier: 0.1178 },
  ],
  enhanced: [
    { algorithm: 'XGBoost', threshold: 0.3335, auc: 0.9787, accuracy: 0.942, precision: 0.9412, recall: 0.9573, specificity: 0.9222, f1: 0.9492, brier: 0.0487, isSelected: true },
    { algorithm: 'Random Forest', threshold: 0.5, auc: 0.9777, accuracy: 0.9469, precision: 0.9732, recall: 0.9316, specificity: 0.9667, f1: 0.952, brier: 0.054 },
  ],
}

export const MAJORITY_CLASS_BASELINE_ACCURACY = 0.5652

// §12 — confusion matrices, final test set (n=207), selected model (XGBoost).
export const CONFUSION_MATRICES: Record<Tier, { tn: number; fp: number; fn: number; tp: number }> = {
  basic: { tn: 77, fp: 13, fn: 19, tp: 98 },
  enhanced: { tn: 83, fp: 7, fn: 5, tp: 112 },
}

// §7 / §8 — real per-tier threshold rationale, not generic text.
export const THRESHOLD_RATIONALE: Record<Tier, { threshold: number; label: string; rationale: string }> = {
  basic: {
    threshold: 0.4681,
    label: 'Youden-optimal',
    rationale:
      "Forcing 95% sensitivity on Basic's weaker discrimination (AUC ≈ 0.94) would cost specificity down to roughly 0.60 (about a 40% false-positive rate among healthy users). The balanced Youden point (sensitivity 0.848 / specificity 0.883, development out-of-fold) is a more usable operating point for a low-burden first-pass screen.",
  },
  enhanced: {
    threshold: 0.3335,
    label: '95%-sensitivity target',
    rationale:
      "Enhanced's stronger discrimination (AUC ≈ 0.98) affords a high-sensitivity operating point while keeping specificity reasonable (≈ 0.90, development out-of-fold) — consistent with prioritizing sensitivity for a screening-support tool once the model has enough signal to support it without an unreasonable false-positive cost.",
  },
}

export const TIER_SAMPLE_SIZES = {
  development: 828,
  finalTest: 207,
  totalAdultRecords: 1035,
}
