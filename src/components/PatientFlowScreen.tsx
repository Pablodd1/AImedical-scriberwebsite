import { prefillAndScrollToContact, ReviewContact, siteReview } from './ReviewContact';
import React, { useState } from 'react';
import { CORE_EHR_MODULES } from '../data/aimsSpecData';
import { BookDemoSection } from './BookDemoSection';
import { GlassCard } from './GlassCard';
import { InteractiveScribeSandbox, SandboxMode } from './InteractiveScribeSandbox';

interface PatientFlowScreenProps {
  onNotify: (msg: string) => void;
  onOpenFullContact: () => void;
}

interface StepDetail {
  num: string;
  title: string;
  stageLabel: string;
  duration: string;
  summary: string;
  languages?: string;
  payload: Array<{ label: string; value: string }>;
}

const SEVEN_STEPS_DATA: StepDetail[] = [
  {
    num: '01',
    title: 'Multilingual Smart Intake Form',
    stageLabel: 'Pre-Visit & Lobby Intake',
    duration: '33 Questions',
    languages: 'English · Español · Haitian Kreyòl (Spoken or Digital)',
    summary:
      'Patients complete the customizable 33-question intake form by speaking naturally or tapping on their phone or lobby tablet; AI extracts clinical entities and pre-populates the chart.',
    payload: [
      { label: 'Form Coverage', value: 'Demographics, Insurance, History, Symptoms & ROS' },
      { label: 'Language Support', value: 'Español → Auto-translated to Clinical English' },
      { label: 'Visual OCR Scan', value: 'Photo ID & Insurance Card extracted automatically' },
      { label: 'Clinical Extraction', value: 'Medications, allergies & chief complaint structured' },
    ],
  },
  {
    num: '02',
    title: 'Visual OCR & Intake Summary',
    stageLabel: 'Pre-Rooming Glance',
    duration: 'Instant Glance',
    summary:
      'Physician pre-rooming summary uniting extracted intake answers, visual insurance card OCR, missing-field alerts, and prior visit history in one scannable dashboard.',
    payload: [
      { label: 'Patient Profile', value: 'Elena Morales · 41F · Insurance Verified via OCR' },
      { label: 'Completeness Scan', value: '0 missing mandatory fields (33 / 33 complete)' },
      { label: 'Longitudinal Visits', value: '5 prior completed clinic encounters on file' },
      { label: 'Billing Readiness', value: 'Subscriber & group policy synced for Office Ally' },
    ],
  },
  {
    num: '03',
    title: 'Lobby Kiosk & Front-Desk Check-In',
    stageLabel: 'Arrival & Triage',
    duration: 'Real-Time',
    summary:
      'Lobby kiosk check-in or front-desk arrival updates the live waiting-room board, verifies signed clinical consents, and attaches triage vitals to the encounter.',
    payload: [
      { label: 'Arrival Board', value: 'Checked-In · Exam Room 02 Ready' },
      { label: 'Digital Consents', value: '4 / 4 Clinical & Financial Consents Signed' },
      { label: 'Triage & Vitals', value: 'Nursing intake notes & vitals attached to chart' },
      { label: 'Appointment Sync', value: '24h & 2h patient confirmation verified' },
    ],
  },
  {
    num: '04',
    title: 'Pre-Consultation & Safety Scan',
    stageLabel: 'Chart & Safety Prep',
    duration: 'Pre-Rooming Brief',
    summary:
      'Consolidates longitudinal chart history, every prior SOAP note, biomarker lab trajectories, and an automated AI red-flag contraindication check before the exam.',
    payload: [
      { label: 'Prior ROM Baseline', value: 'Cervical Extension 24° on Visit #04' },
      { label: 'Clinical Safety Screen', value: '0 vascular or neurological red-flag alerts' },
      { label: 'Lab Trajectory', value: 'hs-CRP improved from 4.1 → 1.6 mg/L' },
      { label: 'Provider Brief', value: 'Historical treatment response ready for review' },
    ],
  },
  {
    num: '05',
    title: 'Ambient AI Medical Scribe',
    stageLabel: 'Hands-Free Exam Room',
    duration: 'Hands-Free Capture',
    summary:
      'Two-panel clinical workspace: continuous ambient conversation capture on the left and a real-time AI clinical consultation copilot on the right, with screen wake-lock.',
    payload: [
      { label: 'Ambient Capture', value: 'Hands-free speaker-separated encounter listening' },
      { label: 'Mid-Visit Copilot', value: 'Query chart history, labs, or ROM mid-exam' },
      { label: 'Objective Extraction', value: 'Spurling’s (+Right) · Cervical Extension 32°' },
      { label: 'Training Mode', value: 'Sample encounter for staff review' },
    ],
  },
  {
    num: '06',
    title: 'Review & Encoding',
    stageLabel: 'Coding QA',
    duration: 'Draft and review',
    summary:
      'Review the draft against the visit conversation, check suggested codes, and resolve missing details before signing.',
    payload: [
      { label: 'Encoded ICD-10 & CPT', value: 'M54.12 · M99.01 · 98940-25 · 97012' },
      { label: 'Medical Necessity', value: 'Modifier -25 substantiated by objective exam' },
      { label: 'Quality Assurance', value: 'Completeness & contraindication checks passed' },
      { label: 'Reviewer Verdict', value: 'Approved · Clean superbill ready for billing' },
    ],
  },
  {
    num: '07',
    title: 'One-Click Sign, Export & Office Ally',
    stageLabel: 'EHR Lock & Office Ally',
    duration: '< 1 sec Sign-Off',
    summary:
      'Applies the provider e-signature, locks the longitudinal EHR note, generates PDF/document patient handouts, and queues the scrubbed claim for Office Ally.',
    payload: [
      { label: 'Provider Sign-Off', value: 'Pre-sign audit passed · Digital signature applied' },
      { label: 'Clinical Exports', value: 'Formatted PDF, editable document & care handout' },
      { label: 'AI Medical Billing', value: 'Clean 837P claim queued for Office Ally sync' },
      { label: 'Patient Portal', value: 'Visit summary & statement published to portal' },
    ],
  },
];

const LAB_BIOMARKERS = [
  {
    name: 'hs-CRP (Inflammation)',
    unit: 'mg/L',
    v1: 4.1,
    v2: 3.4,
    v3: 2.2,
    current: 1.6,
    ref: '< 2.0 mg/L',
    status: 'Optimal',
  },
  {
    name: '25-OH Vitamin D',
    unit: 'ng/mL',
    v1: 21,
    v2: 28,
    v3: 36,
    current: 44,
    ref: '30–80 ng/mL',
    status: 'Normal',
  },
  {
    name: 'HbA1c (Glycemic)',
    unit: '%',
    v1: 5.8,
    v2: 5.6,
    v3: 5.4,
    current: 5.3,
    ref: '< 5.7%',
    status: 'Optimal',
  },
  {
    name: 'Vitamin B12 (Neurotrophic)',
    unit: 'pg/mL',
    v1: 310,
    v2: 420,
    v3: 540,
    current: 615,
    ref: '300–900 pg/mL',
    status: 'Optimal',
  },
];

const PORTAL_CAPABILITIES = [
  {
    icon: 'event_available',
    title: 'Self-Service Appointment Booking',
    routes: 'Online Scheduling',
    desc: 'Patients browse real-time provider availability, book or reschedule visits, and confirm upcoming appointments from any device.',
  },
  {
    icon: 'videocam',
    title: 'Integrated Browser Telehealth',
    routes: 'Virtual Consultations',
    desc: 'Built-in video visits with camera preview and direct chart access—no third-party app downloads required for patients or doctors.',
  },
  {
    icon: 'document_scanner',
    title: 'Pre-Visit Intake & Visual Card Upload',
    routes: 'Mobile Intake & OCR',
    desc: 'Patients complete spoken or touch intake forms at home and snap photos of their ID and insurance card for automatic OCR extraction.',
  },
  {
    icon: 'folder_shared',
    title: 'Visit Summaries, Consents & Statements',
    routes: 'Records & Billing',
    desc: 'Secure patient access to signed care handouts, lab summaries, digital consent forms, and online clinic statement payments.',
  },
];

export const PatientFlowScreen: React.FC<PatientFlowScreenProps> = ({
  onNotify,
  onOpenFullContact,
}) => {
  const [activeStepIdx, setActiveStepIdx] = useState(4);
  const [quickNoteMode, setQuickNoteMode] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('Elena Morales (#PT-10492)');
  const [selectedEhrId, setSelectedEhrId] = useState(CORE_EHR_MODULES[0].id);
  const [showAllEhrModules, setShowAllEhrModules] = useState(false);
  const [sandboxMode, setSandboxMode] = useState<SandboxMode>('video');

  const openSandbox = (mode: SandboxMode) => {
    setSandboxMode(mode);
    window.setTimeout(() => {
      document.getElementById('section-sandbox')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  };

  const activeStep = SEVEN_STEPS_DATA[activeStepIdx];
  const activeEhr =
    CORE_EHR_MODULES.find((m) => m.id === selectedEhrId) || CORE_EHR_MODULES[0];

  const visibleEhrModules = showAllEhrModules
    ? CORE_EHR_MODULES
    : CORE_EHR_MODULES.slice(0, 6);

  const handleToggleQuickNote = () => {
    const next = !quickNoteMode;
    setQuickNoteMode(next);
    if (next && activeStepIdx < 4) {
      setActiveStepIdx(4);
    }
    onNotify(
      next
        ? 'Express Quick-Note enabled: Steps 01–04 bypassed for returning patient'
        : 'Full 7-Step New Patient Flow restored'
    );
  };

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-10 flex flex-col gap-12">
        {/* 7-Step Clinical Flow & Express Follow-Up Mode */}
        <section id="section-flow" className="flex flex-col gap-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="font-caption text-clinical-teal font-semibold">
                Patient Journey · Unified EHR · Self-Service Portal
              </div>
              <h1 className="font-display-hero text-text-primary mt-1">
                Follow a patient visit from check-in to sign-off
              </h1>
              <p className="font-body-lg text-text-secondary max-w-3xl mt-2">
                Use a sample visit to see how intake details reach the chart, how a clinician reviews a draft note,
                and what the billing handoff could look like. For a return visit, try the shorter follow-up note.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => openSandbox('video')}
                className="inline-flex items-center gap-2 rounded-xl bg-clinical-teal hover:bg-primary-container text-on-primary px-5 py-2.5 font-body-md font-semibold shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">smart_display</span>
                <span>Watch Recorded Walkthrough</span>
              </button>

              <button
                type="button"
                onClick={() => openSandbox('scribe')}
                className="inline-flex items-center gap-2 rounded-xl bg-surface-canvas hover:bg-surface-panel border border-border-subtle text-text-primary px-4 py-2.5 font-body-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg text-clinical-teal">mic</span>
                <span>Try Scribe Simulator</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  prefillAndScrollToContact('Interested in the 7-Step Patient Flow & Unified EHR walkthrough.')
                }
                className="inline-flex items-center gap-1.5 px-3 py-2 font-body-sm font-semibold text-clinical-teal underline underline-offset-4 cursor-pointer whitespace-nowrap"
              >
                <span>Request walkthrough (agree on a time)</span>
              </button>
            </div>
          </div>

          {/* Returning Patient Quick-Note Controls */}
          <GlassCard
            interactive={false}
            className="p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="material-symbols-outlined text-clinical-teal text-2xl">bolt</span>
              <div className="flex-1">
                <label
                  htmlFor="patient-quick-lookup"
                  className="font-section-title text-text-primary block"
                >
                  5-Way Instant Patient Lookup &amp; Express Follow-Up
                </label>
                <input
                  id="patient-quick-lookup"
                  type="text"
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  className="mt-1.5 w-full max-w-md h-9 px-3 rounded-lg bg-surface-canvas border border-border-subtle font-code-clinical text-text-primary focus:outline-none focus:ring-2 focus:ring-clinical-teal"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleToggleQuickNote}
                className={`px-4 py-2 rounded-lg font-body-sm font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                  quickNoteMode
                    ? 'bg-clinical-teal text-on-primary border-clinical-teal'
                    : 'bg-surface-canvas text-text-primary border-border-subtle hover:bg-surface-container-low'
                }`}
              >
                {quickNoteMode
                  ? 'Express Quick-Note: ON (Skips Steps 01–04)'
                  : 'Test Returning Patient Quick-Note'}
              </button>
            </div>
          </GlassCard>

          {/* Interactive 7-Step Selector Rail + Live Step Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 flex flex-col gap-2">
              {SEVEN_STEPS_DATA.map((st, idx) => {
                const bypassed = quickNoteMode && idx < 4;
                const isSelected = idx === activeStepIdx;
                return (
                  <button
                    key={st.num}
                    type="button"
                    disabled={bypassed}
                    onClick={() => setActiveStepIdx(idx)}
                    className={`text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      bypassed
                        ? 'opacity-40 bg-surface-canvas border-border-subtle cursor-not-allowed'
                        : isSelected
                          ? 'bg-clinical-teal-subtle border-clinical-teal/50 shadow-sm cursor-pointer'
                          : 'bg-surface-container-lowest border-border-subtle hover:bg-surface-container-low cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-code-badge text-clinical-teal font-bold shrink-0">
                        {st.num}
                      </span>
                      <span className="font-section-title text-text-primary truncate">
                        {st.title}
                      </span>
                    </div>
                    <span className="font-caption text-text-muted whitespace-nowrap shrink-0">
                      {bypassed ? 'Skipped' : st.duration}
                    </span>
                  </button>
                );
              })}
            </div>

            <GlassCard
              interactive={false}
              className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between gap-6"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-border-subtle">
                  <div>
                    <div className="font-caption text-clinical-teal font-semibold">
                      Step {activeStep.num} · {activeStep.stageLabel}
                    </div>
                    <h2 className="font-headline-lg text-text-primary mt-1">{activeStep.title}</h2>
                  </div>
                  <span className="font-code-clinical text-text-secondary">
                    {activeStep.duration}
                  </span>
                </div>

                {activeStep.languages && (
                  <div className="font-caption text-clinical-teal">{activeStep.languages}</div>
                )}

                <p className="font-body-lg text-text-secondary">{activeStep.summary}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {activeStep.payload.map((item) => (
                    <div
                      key={item.label}
                      className="p-4 rounded-lg bg-surface-canvas border border-border-subtle"
                    >
                      <div className="font-caption text-text-muted">{item.label}</div>
                      <div className="font-body-md text-text-primary font-medium mt-1">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border-subtle">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={activeStepIdx <= (quickNoteMode ? 4 : 0)}
                    onClick={() => setActiveStepIdx((i) => Math.max(quickNoteMode ? 4 : 0, i - 1))}
                    className="px-3.5 py-2 rounded-lg bg-surface-canvas border border-border-subtle font-body-sm text-text-primary disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    ← Previous Step
                  </button>
                  <button
                    type="button"
                    disabled={activeStepIdx >= 6}
                    onClick={() => setActiveStepIdx((i) => Math.min(6, i + 1))}
                    className="px-3.5 py-2 rounded-lg bg-clinical-teal text-on-primary font-body-sm font-medium disabled:opacity-40 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Next Step →
                  </button>
                </div>

                <button
                  type="button"
                  data-ink-toggle="true"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-clinical-teal-subtle text-clinical-teal border border-clinical-teal/30 font-body-sm font-medium cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span className="material-symbols-outlined text-base">contrast</span>
                  <span>Preview Light / Dark</span>
                </button>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Core EHR Modules Interactive Breakdown (Progressive Disclosure: 6 Default, Expandable to 12) */}
        <section id="section-ehr" className="flex flex-col gap-6 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-caption text-clinical-teal font-semibold">
                Unified Electronic Health Record
              </span>
              <h2 className="font-headline-lg text-text-primary mt-1">
                Complete Clinical EHR &amp; Visual Extraction Modules
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowAllEhrModules((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-canvas hover:bg-clinical-teal-subtle border border-border-subtle font-caption font-semibold text-clinical-teal transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span className="material-symbols-outlined text-base">
                {showAllEhrModules ? 'expand_less' : 'expand_more'}
              </span>
              <span>
                {showAllEhrModules
                  ? 'Show Core 6 Modules'
                  : `View All ${CORE_EHR_MODULES.length} EHR Modules (+${CORE_EHR_MODULES.length - 6} More)`}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
              {visibleEhrModules.map((mod) => {
                const isSelected = mod.id === selectedEhrId;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setSelectedEhrId(mod.id)}
                    className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-clinical-teal-subtle border-clinical-teal shadow-sm'
                        : 'bg-surface-container-lowest border-border-subtle hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-caption text-clinical-teal font-semibold">
                        {mod.number}. Module
                      </span>
                      <span className="material-symbols-outlined text-base text-clinical-teal">
                        {mod.icon}
                      </span>
                    </div>
                    <div className="font-section-title text-text-primary">{mod.title}</div>
                    <p className="font-caption text-text-secondary line-clamp-2">{mod.summary}</p>
                  </button>
                );
              })}
            </div>

            <GlassCard
              interactive={false}
              className="lg:col-span-5 p-6 flex flex-col justify-between gap-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <span className="font-caption text-clinical-teal font-semibold">
                    Module {activeEhr.number} · Core EHR
                  </span>
                  <span className="font-caption text-text-muted">
                    {activeEhr.routes.join(' · ')}
                  </span>
                </div>

                <h3 className="font-headline-md text-text-primary">{activeEhr.title}</h3>
                <p className="font-body-md text-text-secondary">{activeEhr.summary}</p>

                <ul className="space-y-2.5 pt-1">
                  {activeEhr.details.map((d) => (
                    <li
                      key={d}
                      className="flex items-start gap-2 font-body-sm text-text-primary leading-relaxed"
                    >
                      <span className="material-symbols-outlined text-sm text-clinical-teal mt-0.5">
                        check_circle
                      </span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-border-subtle font-caption text-text-secondary">
                <span className="text-text-muted font-semibold">Included: </span>
                <span>{activeEhr.apis.join(' · ')}</span>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Longitudinal Blood Panels & Lab Trends */}
        <section
          id="section-labs"
          className="glass-surface rounded-2xl border border-border-subtle p-6 sm:p-8 flex flex-col gap-6 scroll-mt-24"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="font-caption text-clinical-teal font-semibold">
                Visual Lab Extraction &amp; Longitudinal Biomarkers
              </span>
              <h2 className="font-headline-lg text-text-primary mt-1">
                Visit-to-Visit Patient Blood Panel Evolution
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onNotify('Exported longitudinal patient lab trend CSV')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-canvas hover:bg-surface-container-low border border-border-subtle font-body-sm font-medium text-text-primary transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">table_view</span>
              <span>Export Lab CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-sm border-collapse">
              <thead className="bg-surface-canvas font-caption text-text-secondary border-y border-border-subtle">
                <tr>
                  <th className="py-3 px-4">Biomarker Panel</th>
                  <th className="py-3 px-4">Visit #01</th>
                  <th className="py-3 px-4">Visit #02</th>
                  <th className="py-3 px-4">Visit #04</th>
                  <th className="py-3 px-4">Current (#05)</th>
                  <th className="py-3 px-4">Reference Range</th>
                  <th className="py-3 px-4">Clinical Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-code-clinical tabular-nums">
                {LAB_BIOMARKERS.map((row) => (
                  <tr key={row.name} className="hover:bg-surface-canvas/70">
                    <td className="py-3.5 px-4 font-sans font-semibold text-text-primary">
                      {row.name}
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">
                      {row.v1} {row.unit}
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">
                      {row.v2} {row.unit}
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary">
                      {row.v3} {row.unit}
                    </td>
                    <td className="py-3.5 px-4 text-clinical-teal font-bold">
                      {row.current} {row.unit}
                    </td>
                    <td className="py-3.5 px-4 text-text-muted">{row.ref}</td>
                    <td className="py-3.5 px-4 text-alert-success font-caption font-semibold">
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Self-Service Patient Portal */}
        <section id="section-portal" className="flex flex-col gap-6 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-caption text-clinical-teal font-semibold">
                Patient Experience &amp; Virtual Care
              </span>
              <h2 className="font-headline-lg text-text-primary mt-1">
                Self-Service Patient Portal &amp; Telehealth Suite
              </h2>
            </div>
            <span className="font-caption text-text-muted">
              Online Booking · Telehealth · Mobile Intake &amp; OCR · Visit Handouts
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PORTAL_CAPABILITIES.map((card) => (
              <GlassCard key={card.title} className="p-6 flex flex-col justify-between gap-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="material-symbols-outlined text-clinical-teal text-xl">
                      {card.icon}
                    </span>
                    <span className="font-caption text-clinical-teal font-semibold">
                      {card.routes}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-text-primary">{card.title}</h3>
                  <p className="font-body-sm text-text-secondary leading-relaxed">{card.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      </div>

      <InteractiveScribeSandbox
        key={sandboxMode}
        initialMode={sandboxMode}
        onNotify={onNotify}
        onRequestWalkthrough={(prefill) => prefillAndScrollToContact(prefill)}
      />

      {siteReview ? <ReviewContact id="book-demo" /> : <BookDemoSection
        onNotify={onNotify}
        onOpenFullContact={onOpenFullContact}
        contextLabel="7-Step Flow · Unified EHR · Visual OCR · Patient Portal"
      />}
    </div>
  );
};
