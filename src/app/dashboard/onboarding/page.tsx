import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { getOnboardingReferenceLists } from "@/lib/app-reference";

export default async function Page() {
  const { cities, propertyTypes } = await getOnboardingReferenceLists();

  return (
    <div className="flex min-h-screen bg-bg-page">
      <aside className="fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>
      <div className="ml-60 flex-1">
        <div className="fixed left-60 right-0 top-0 z-20">
          <Topbar title="Quick Setup" />
        </div>
        <main className="min-h-screen bg-bg-page p-8 pt-24">
          <OnboardingWizard cities={cities} propertyTypes={propertyTypes} />
        </main>
      </div>
    </div>
  );
}

