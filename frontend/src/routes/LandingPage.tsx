import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { AssessmentTiersSection } from '../features/landing/AssessmentTiersSection'
import { ExplainableAISection } from '../features/landing/ExplainableAISection'
import { FinalCTASection } from '../features/landing/FinalCTASection'
import { HeroSection } from '../features/landing/HeroSection'
import { HowItWorksSection } from '../features/landing/HowItWorksSection'
import { LandingFooter } from '../features/landing/LandingFooter'
import { StatsHighlightsSection } from '../features/landing/StatsHighlightsSection'
import { TechnologySection } from '../features/landing/TechnologySection'
import { TrustIntroSection } from '../features/landing/TrustIntroSection'

/**
 * Full-bleed edge-to-edge (negative margins escape AppLayout's <main>
 * padding) so section backgrounds run the full viewport width rather than
 * sitting inset within the page's max-w container.
 */
export function LandingPage() {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="-mx-4 -my-8 overflow-x-clip bg-slate-950 text-slate-100">
      <HeroSection />
      <TrustIntroSection />
      <HowItWorksSection />
      <AssessmentTiersSection />
      <ExplainableAISection />
      <TechnologySection />
      <StatsHighlightsSection />
      <FinalCTASection />
      <LandingFooter />
    </div>
  )
}
