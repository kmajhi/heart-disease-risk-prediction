export function DisclaimerPage() {
  return (
    <div className="prose max-w-none dark:prose-invert">
      <h1 className="text-2xl font-bold">Disclaimer &amp; Ethics</h1>
      <p>
        This system is a research/decision-support prototype developed as part
        of a university project. It is <strong>not</strong> a diagnostic tool,
        a replacement for clinical judgement, or clinically validated.
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">
        <li>Not externally validated or prospectively evaluated.</li>
        <li>Trained on a single-institution, hospital-admitted cohort.</li>
        <li>Predictions and any AI-generated explanations are not a medical diagnosis.</li>
        <li>No patient-identifying information is collected by this application.</li>
      </ul>
    </div>
  )
}
