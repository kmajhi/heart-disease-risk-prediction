import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { accentFor } from '../features/shared/accentColors'
import {
  BarChartIcon,
  BrainCircuitIcon,
  FlaskIcon,
  GaugeIcon,
  InfoIcon,
  LayersIcon,
  SparklesIcon,
} from '../features/shared/icons'
import {
  MAJORITY_CLASS_BASELINE_ACCURACY,
  TIER_SAMPLE_SIZES,
} from '../features/model-comparison/comparisonData'

function Section({
  icon: Icon,
  accentIndex,
  title,
  children,
}: {
  icon: typeof InfoIcon
  accentIndex: number
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-7">
      <div className="flex items-center gap-2.5">
        <span
          className={`flex size-9 items-center justify-center rounded-lg bg-gradient-to-br text-white ${accentFor(accentIndex)}`}
        >
          <Icon className="size-[18px]" />
        </span>
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-400">{children}</div>
    </section>
  )
}

export function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 py-4">
      <header className="animate-fade-in-up">
        <span className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
          Academic Research Prototype
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          About this project
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate-400">
          What this system does, the data it was built from, how the models were selected, and what
          its limitations are.
        </p>
      </header>

      <Section icon={BrainCircuitIcon} accentIndex={0} title="Overview">
        <p>
          Heart Risk AI is a machine-learning powered heart disease risk assessment prototype,
          developed as an academic CSE research project. It estimates a probability of heart disease
          from submitted demographic, physical, and clinical information, and explains which factors
          the model weighted most heavily using SHAP (SHapley Additive exPlanations).
        </p>
        <p>
          It offers two assessment levels — a <strong className="text-slate-200">Basic</strong> tier
          using essential information, and an <strong className="text-slate-200">Enhanced</strong>{' '}
          tier that adds laboratory measurements for a stronger-discrimination model. See{' '}
          <Link to="/models/compare" className="font-medium text-indigo-400 hover:text-indigo-300">
            Model Comparison
          </Link>{' '}
          for the full evaluation tables behind these numbers.
        </p>
      </Section>

      <Section icon={LayersIcon} accentIndex={2} title="Dataset">
        <p>
          The models were trained on a clinical cardiac dataset collected from a hospital in Northern
          Bangladesh: <strong className="text-slate-200">1,048 patient records</strong> across 27
          columns. 13 pediatric records (age under 18) were excluded from the modelling population —
          all 13 were positive cases, which would have made "is this patient a child" an artificial
          predictor — leaving{' '}
          <strong className="text-slate-200">{TIER_SAMPLE_SIZES.totalAdultRecords} adult records</strong>.
        </p>
        <p>
          The target (<em>Heart Disease</em> present/absent) is mildly imbalanced: 598 positive
          (57.1%) vs. 450 negative (42.9%) before the pediatric exclusion. A stratified 80/20 split
          produced <strong className="text-slate-200">{TIER_SAMPLE_SIZES.development} development</strong> and{' '}
          <strong className="text-slate-200">{TIER_SAMPLE_SIZES.finalTest} final-test</strong> records; the
          final-test set was used exactly once, after every model-selection decision was frozen.
        </p>
        <p>
          Two columns were excluded as leakage risks before modelling: <code className="rounded bg-slate-800 px-1 py-0.5 text-xs">SL</code>{' '}
          (a pure row index) and <code className="rounded bg-slate-800 px-1 py-0.5 text-xs">UNIT</code>{' '}
          (ward placement, which can reflect a diagnosis already made).
        </p>
      </Section>

      <Section icon={FlaskIcon} accentIndex={4} title="Methodology">
        <p>
          Six algorithms were compared under identical stratified 5-fold cross-validation on the
          development set only, inside a scikit-learn <code className="rounded bg-slate-800 px-1 py-0.5 text-xs">Pipeline</code> +{' '}
          <code className="rounded bg-slate-800 px-1 py-0.5 text-xs">ColumnTransformer</code> (median
          imputation with missingness indicators for numeric fields, most-frequent imputation and
          one-hot encoding for categorical fields) fit fresh inside every fold: Logistic Regression,
          Decision Tree, Random Forest, XGBoost, SVM, and KNN.
        </p>
        <p>
          XGBoost was selected as the primary model for both tiers; a paired significance test found
          no statistically detectable difference from Random Forest at either tier, so Random Forest is
          retained as a documented comparison model. Each tier uses its own frozen decision threshold,
          chosen from development data only —{' '}
          <strong className="text-slate-200">Basic</strong> uses a Youden-optimal threshold (balances
          sensitivity/specificity for a low-burden first-pass screen), while{' '}
          <strong className="text-slate-200">Enhanced</strong> targets 95% sensitivity, which its
          stronger discrimination can support without an unreasonable false-positive cost.
        </p>
        <p>
          Both final models clear a majority-class baseline accuracy of{' '}
          {Math.round(MAJORITY_CLASS_BASELINE_ACCURACY * 100)}% by a wide margin on the held-out test
          set — full metrics are on the Model Comparison page.
        </p>
      </Section>

      <Section icon={SparklesIcon} accentIndex={5} title="Explainability">
        <p>
          Every prediction is accompanied by its SHAP-derived top contributing factors — the
          statistical features the model weighted most heavily toward a higher or lower estimated
          risk. A guardrailed LLM layer then turns those factors into a short plain-language summary;
          it only ever receives the model's own structured output (probability, risk label, and top
          factors), never raw patient data, and is prompted to use non-causal language such as
          "contributed to a higher model-estimated risk" rather than diagnostic claims.
        </p>
      </Section>

      <Section icon={GaugeIcon} accentIndex={1} title="Technology">
        <p>
          <strong className="text-slate-200">XGBoost</strong> for prediction,{' '}
          <strong className="text-slate-200">SHAP</strong> for feature-contribution explanations,{' '}
          <strong className="text-slate-200">React</strong> for the frontend, and{' '}
          <strong className="text-slate-200">Django REST Framework</strong> for the backend API and
          prediction service.
        </p>
      </Section>

      <Section icon={BarChartIcon} accentIndex={3} title="Limitations">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Single-institution, retrospective, hospital-admitted cohort — not a population-screening
            sample, so results may not generalize to other settings.
          </li>
          <li>No external validation cohort exists outside this single-institution sample.</li>
          <li>
            The Basic tier's calibration in the low-probability region is the weakest finding in
            evaluation — its raw probability numbers should be read with that in mind.
          </li>
          <li>How the original diagnosis label was assigned in the source data is not independently verifiable.</li>
        </ul>
      </Section>

      <p className="text-center text-sm text-slate-500">
        Read the full{' '}
        <Link to="/disclaimer" className="font-medium text-indigo-400 hover:text-indigo-300">
          research prototype disclaimer
        </Link>
        .
      </p>
    </div>
  )
}
