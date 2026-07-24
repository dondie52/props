import DashboardShell from "@/components/layout/DashboardShell";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { getOnboardingReferenceLists } from "@/lib/app-reference";

export default async function Page() {
  const { cities, propertyTypes } = await getOnboardingReferenceLists();

  return (
    <DashboardShell title="Quick Setup">
      <OnboardingWizard cities={cities} propertyTypes={propertyTypes} />
    </DashboardShell>
  );
}
