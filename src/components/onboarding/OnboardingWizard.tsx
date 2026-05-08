"use client";

import { type ReactNode, useMemo, useState, useTransition } from "react";
import { Building2, CheckCircle2, ClipboardList, Home, Loader2, Users } from "lucide-react";
import {
  bulkCreateUnitsAction,
  createPropertyAction,
  createPropertyWithHousesAction,
  saveOnboardingStateAction,
} from "@/app/dashboard/onboarding/actions";

const CITIES = ["Gaborone", "Francistown", "Maun", "Kasane", "Lobatse", "Molepolole", "Jwaneng"] as const;
const PROPERTY_TYPES = ["Apartment", "Complex", "House"] as const;

type Step = 1 | 2 | 3;

export default function OnboardingWizard() {
  const [step, setStep] = useState<Step>(1);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [propertySetupMode, setPropertySetupMode] = useState<"single" | "multi">("single");
  const [property, setProperty] = useState({
    name: "",
    address: "",
    city: "Gaborone",
    type: "Apartment",
  });
  const [numberOfHouses, setNumberOfHouses] = useState(10);
  const [bedroomsPerHouse, setBedroomsPerHouse] = useState(2);

  const [unitsMode, setUnitsMode] = useState<"generate" | "paste">("generate");
  const [unitsCount, setUnitsCount] = useState(6);
  const [unitsPattern, setUnitsPattern] = useState<"A" | "numeric">("A");
  const [unitsPasted, setUnitsPasted] = useState("");
  const [defaultRent, setDefaultRent] = useState<number>(0);

  const unitPreview = useMemo(() => {
    if (unitsMode === "paste") {
      return unitsPasted
        .split(/\r?\n|,/g)
        .map((v) => v.trim())
        .filter(Boolean)
        .slice(0, 12);
    }
    const count = Math.max(1, Math.min(12, unitsCount));
    if (unitsPattern === "numeric") return Array.from({ length: count }, (_, idx) => String(idx + 1));
    return Array.from({ length: count }, (_, idx) => `A${idx + 1}`);
  }, [unitsMode, unitsCount, unitsPattern, unitsPasted]);

  const markProgress = (next: Partial<{ step: Step; propertyId: string }>) => {
    void saveOnboardingStateAction({
      state: {
        step: next.step ?? step,
        propertyId: next.propertyId ?? propertyId,
        updatedAt: new Date().toISOString(),
      },
    }).catch(() => {});
  };

  const onCreateProperty = () => {
    setError("");
    startTransition(async () => {
      try {
        const result =
          propertySetupMode === "multi"
            ? await createPropertyWithHousesAction({
                ...property,
                numberOfHouses,
                bedroomsPerHouse,
              })
            : await createPropertyAction(property);
        setPropertyId(result.propertyId);
        if (propertySetupMode === "multi") {
          setStep(3);
          markProgress({ step: 3, propertyId: result.propertyId });
        } else {
          setStep(2);
          markProgress({ step: 2, propertyId: result.propertyId });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to create property.");
      }
    });
  };

  const onCreateUnits = () => {
    if (!propertyId) {
      setError("Create a property first.");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        await bulkCreateUnitsAction({
          propertyId,
          mode: unitsMode,
          count: unitsCount,
          pattern: unitsPattern,
          pasted: unitsPasted,
          defaultRent,
        });
        setStep(3);
        markProgress({ step: 3 });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to add units.");
      }
    });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="rounded-large border border-border-ghost bg-bg-card p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Quick Setup</p>
            <h1 className="mt-2 text-2xl font-bold text-primary sm:text-3xl">Get to first value in under 3 minutes</h1>
            <p className="mt-2 text-sm text-text-sub">
              Add your first property, generate units in one click, then invite tenants later.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <StepChip active={step === 1} done={step > 1} icon={<Home className="h-4 w-4" />} label="Property" />
            <StepChip
              active={step === 2}
              done={step > 2}
              icon={<ClipboardList className="h-4 w-4" />}
              label="Units"
            />
            <StepChip active={step === 3} done={false} icon={<Users className="h-4 w-4" />} label="Tenants" />
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="rounded-large border border-border-ghost bg-bg-card p-5 shadow-card sm:p-6 lg:col-span-3">
          {step === 1 ? (
            <>
              <h2 className="text-xl font-semibold text-primary">1) Create your first property</h2>
              <p className="mt-1 text-sm text-text-sub">Keep it minimal—you can add details later.</p>

              <div className="mt-4">
                <Field label="Setup mode">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPropertySetupMode("single")}
                      className={`h-11 rounded-base border px-3 text-sm font-semibold ${
                        propertySetupMode === "single"
                          ? "border-primary bg-primary text-white"
                          : "border-border-ghost bg-white text-primary"
                      }`}
                    >
                      Single building
                    </button>
                    <button
                      type="button"
                      onClick={() => setPropertySetupMode("multi")}
                      className={`h-11 rounded-base border px-3 text-sm font-semibold ${
                        propertySetupMode === "multi"
                          ? "border-primary bg-primary text-white"
                          : "border-border-ghost bg-white text-primary"
                      }`}
                    >
                      Multi-residence
                    </button>
                  </div>
                </Field>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Property name">
                  <input
                    className="h-11 w-full rounded-base border border-border-ghost bg-white px-3 text-sm focus:border-primary focus:outline-none"
                    placeholder="Sunset Apartments"
                    value={property.name}
                    onChange={(e) => setProperty((p) => ({ ...p, name: e.target.value }))}
                  />
                </Field>
                <Field label="City">
                  <select
                    className="h-11 w-full rounded-base border border-border-ghost bg-white px-3 text-sm focus:border-primary focus:outline-none"
                    value={property.city}
                    onChange={(e) => setProperty((p) => ({ ...p, city: e.target.value }))}
                  >
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Type">
                  <select
                    className="h-11 w-full rounded-base border border-border-ghost bg-white px-3 text-sm focus:border-primary focus:outline-none"
                    value={property.type}
                    onChange={(e) => setProperty((p) => ({ ...p, type: e.target.value }))}
                  >
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Address (Plot #)">
                  <input
                    className="h-11 w-full rounded-base border border-border-ghost bg-white px-3 text-sm focus:border-primary focus:outline-none"
                    placeholder="Plot 103"
                    value={property.address}
                    onChange={(e) => setProperty((p) => ({ ...p, address: e.target.value }))}
                  />
                </Field>
                {propertySetupMode === "multi" ? (
                  <>
                    <Field label="Number of houses">
                      <input
                        type="number"
                        min={1}
                        max={100}
                        className="h-11 w-full rounded-base border border-border-ghost bg-white px-3 text-sm focus:border-primary focus:outline-none"
                        value={numberOfHouses}
                        onChange={(e) => setNumberOfHouses(Number(e.target.value))}
                      />
                    </Field>
                    <Field label="Bedrooms per house">
                      <input
                        type="number"
                        min={1}
                        max={20}
                        className="h-11 w-full rounded-base border border-border-ghost bg-white px-3 text-sm focus:border-primary focus:outline-none"
                        value={bedroomsPerHouse}
                        onChange={(e) => setBedroomsPerHouse(Number(e.target.value))}
                      />
                    </Field>
                  </>
                ) : null}
              </div>

              {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}

              <button
                type="button"
                disabled={pending}
                onClick={onCreateProperty}
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-base bg-accent px-6 text-sm font-semibold text-white disabled:opacity-70"
              >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
                {propertySetupMode === "multi" ? "Create property & houses" : "Create property"}
              </button>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <h2 className="text-xl font-semibold text-primary">2) Add units (bulk)</h2>
              <p className="mt-1 text-sm text-text-sub">
                Generate units automatically or paste a list. Rent can be adjusted later.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Mode">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUnitsMode("generate")}
                      className={`h-11 rounded-base border px-3 text-sm font-semibold ${
                        unitsMode === "generate"
                          ? "border-primary bg-primary text-white"
                          : "border-border-ghost bg-white text-primary"
                      }`}
                    >
                      Generate
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnitsMode("paste")}
                      className={`h-11 rounded-base border px-3 text-sm font-semibold ${
                        unitsMode === "paste"
                          ? "border-primary bg-primary text-white"
                          : "border-border-ghost bg-white text-primary"
                      }`}
                    >
                      Paste list
                    </button>
                  </div>
                </Field>

                <Field label="Default rent (optional)">
                  <input
                    type="number"
                    min={0}
                    className="h-11 w-full rounded-base border border-border-ghost bg-white px-3 text-sm focus:border-primary focus:outline-none"
                    placeholder="2400"
                    value={defaultRent || ""}
                    onChange={(e) => setDefaultRent(Number(e.target.value))}
                  />
                </Field>

                {unitsMode === "generate" ? (
                  <>
                    <Field label="Units count">
                      <input
                        type="number"
                        min={1}
                        max={200}
                        className="h-11 w-full rounded-base border border-border-ghost bg-white px-3 text-sm focus:border-primary focus:outline-none"
                        value={unitsCount}
                        onChange={(e) => setUnitsCount(Number(e.target.value))}
                      />
                    </Field>
                    <Field label="Pattern">
                      <select
                        className="h-11 w-full rounded-base border border-border-ghost bg-white px-3 text-sm focus:border-primary focus:outline-none"
                        value={unitsPattern}
                        onChange={(e) => setUnitsPattern(e.target.value as "A" | "numeric")}
                      >
                        <option value="A">A1…A{Math.max(1, Math.min(99, unitsCount))}</option>
                        <option value="numeric">1…{Math.max(1, Math.min(99, unitsCount))}</option>
                      </select>
                    </Field>
                  </>
                ) : (
                  <div className="md:col-span-2">
                    <Field label="Paste unit numbers (comma or new line)">
                      <textarea
                        className="min-h-28 w-full rounded-base border border-border-ghost bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        placeholder={"A1\nA2\nA3"}
                        value={unitsPasted}
                        onChange={(e) => setUnitsPasted(e.target.value)}
                      />
                    </Field>
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-base border border-border-ghost bg-bg-page p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Preview</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {unitPreview.length ? (
                    unitPreview.map((unit) => (
                      <span key={unit} className="rounded-pill border border-border-ghost bg-white px-3 py-1 text-xs text-text-sub">
                        {unit}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-text-muted">No units yet</span>
                  )}
                </div>
              </div>

              {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={pending}
                  className="inline-flex h-11 items-center justify-center rounded-base border border-border-ghost bg-white px-5 text-sm font-semibold text-text-main disabled:opacity-70"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={onCreateUnits}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-base bg-accent px-6 text-sm font-semibold text-white disabled:opacity-70"
                >
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Add units
                </button>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <h2 className="text-xl font-semibold text-primary">3) Invite tenants (optional)</h2>
              <p className="mt-1 text-sm text-text-sub">
                You can invite tenants later. Your dashboard is ready now.
              </p>

              <div className="mt-6 rounded-base border border-border-ghost bg-bg-page p-5">
                <p className="text-sm font-semibold text-text-main">Next best actions</p>
                <ul className="mt-3 space-y-2 text-sm text-text-sub">
                  <li>Go to Properties and add rent amounts for each unit or house.</li>
                  <li>Start logging payments as they come in.</li>
                  <li>Use Maintenance to track issues end-to-end.</li>
                </ul>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/dashboard/properties"
                  className="inline-flex h-11 items-center justify-center rounded-base bg-accent px-6 text-sm font-semibold text-white"
                >
                  Go to properties
                </a>
                <a
                  href="/dashboard"
                  className="inline-flex h-11 items-center justify-center rounded-base border border-border-ghost bg-white px-6 text-sm font-semibold text-primary"
                >
                  Back to dashboard
                </a>
              </div>
            </>
          ) : null}
        </section>

        <aside className="rounded-large border border-border-ghost bg-bg-card p-6 shadow-card lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Why this works</p>
          <h3 className="mt-2 text-lg font-semibold text-primary">Less typing. More clarity.</h3>
          <p className="mt-2 text-sm text-text-sub">
            This setup keeps your data clean while letting you start fast. You can always refine details later.
          </p>

          <div className="mt-5 grid gap-3">
            <InfoCard title="Templates" text="Cities & property types are pre-filled for Botswana." />
            <InfoCard title="Bulk actions" text="Generate units instantly or create multiple houses in one flow." />
            <InfoCard title="Progress saved" text="If you leave, your setup can be resumed later." />
          </div>
        </aside>
      </div>
    </div>
  );
}

function StepChip(props: { active: boolean; done: boolean; icon: ReactNode; label: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-2 rounded-pill border px-3 py-2 ${
        props.active ? "border-primary bg-primary text-white" : props.done ? "border-border-ghost bg-white text-primary" : "border-border-ghost bg-white text-text-muted"
      }`}
    >
      {props.icon}
      <span className="font-semibold">{props.label}</span>
    </div>
  );
}

function Field(props: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-text-main">{props.label}</label>
      {props.children}
    </div>
  );
}

function InfoCard(props: { title: string; text: string }) {
  return (
    <div className="rounded-base border border-border-ghost bg-bg-page p-4">
      <p className="text-sm font-semibold text-text-main">{props.title}</p>
      <p className="mt-1 text-sm text-text-sub">{props.text}</p>
    </div>
  );
}
