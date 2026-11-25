import { prefillAndScrollToContact, ReviewContact, siteReview } from './ReviewContact';
import React, { useMemo, useState } from 'react';
import {
  AUTOMATION_SYSTEMS,
  LIVE_INTEGRATIONS,
  WEBSITE_FAQS,
} from '../data/aimsSpecData';
import { BookDemoSection } from './BookDemoSection';
import { LegalModalTab } from './ClinicTrustModals';
import { GlassCard } from './GlassCard';
import { InteractiveScribeSandbox, SandboxMode } from './InteractiveScribeSandbox';

interface SecurityAndBillingScreenProps {
  onNotify: (msg: string) => void;
  onOpenFullContact: () => void;
  onOpenLegalPolicy?: (policy: LegalModalTab) => void;
}

const CONSENT_TEMPLATES = [
  'Form 01 — Informed Clinical & Rehabilitative Care Consent',
  'Form 02 — Sample Privacy Notice & Scribe Authorization',
  'Form 03 — Telehealth Consultation & Digital Communications Consent',
  'Form 04 — Financial Policy, Insurance Assignment & Billing Authorization',
];

function computeVerificationSeal(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const partA = (h1 >>> 0).toString(16).padStart(8, '0').toUpperCase();
  const partB = (h2 >>> 0).toString(16).padStart(8, '0').toUpperCase();
  return `AIMS-SEAL-${partA}-${partB}`;
}

interface OfficeAllyClaim {
  id: string;
  patient: string;
  codes: string;
  amount: string;
  payer: string;
  scrubbed: boolean;
}

const PRACTICE_ANALYTICS = [
  { metric: 'Clean-Claim & Revenue Dashboard', label: 'Submitted vs. paid claims, copays & outstanding balances' },
  { metric: 'Office Ally Remittance Tracker', label: 'Electronic 837P claim status & ERA/835 reconciliation' },
  { metric: 'AI Medical Coding Accuracy', label: 'ICD-10 specificity, CPT utilization & modifier substantiation' },
  { metric: 'Patient Biomarker Trajectories', label: 'Longitudinal lab & functional outcome trends across visits' },
  { metric: 'Schedule & Arrival Analytics', label: 'Check-in velocity, completion rates & reminder confirmations' },
  { metric: 'Intake & Visual OCR Adoption', label: 'Pre-visit digital intake & insurance scan completion rates' },
  { metric: 'Consensus Insights', label: 'Clinical safety alerts caught & pre-sign QA completions' },
  { metric: 'Provider Time-Saved Report', label: 'After-hours charting & manual coding hours eliminated' },
];

export const SecurityAndBillingScreen: React.FC<SecurityAndBillingScreenProps> = ({
  onNotify,
  onOpenFullContact,
  onOpenLegalPolicy,
}) => {
  const [patientName, setPatientName] = useState('Elena Morales');
  const [providerName, setProviderName] = useState('Dr. Mateo Alvarez, DC');
  const [templateIdx, setTemplateIdx] = useState(0);
  const [clinicalAddendum, setClinicalAddendum] = useState(
    'Patient reviewed consent form; provider countersignature verified.'
  );
  const [consentLocked, setConsentLocked] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number>(0);
  const [automationView, setAutomationView] = useState<'workflows' | 'matrix'>('workflows');
  const [sandboxMode, setSandboxMode] = useState<SandboxMode>('billing');

  const openSandbox = (mode: SandboxMode, toast?: string) => {
    setSandboxMode(mode);
    if (toast) onNotify(toast);
    window.setTimeout(() => {
      document.getElementById('section-sandbox')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  };

  const scrollToBookDemo = (prefill?: string) => {
    prefillAndScrollToContact(prefill);
  };

  const [claims, setClaims] = useState<OfficeAllyClaim[]>([
    {
      id: 'CLM-88412',
      patient: 'Elena Morales',
      codes: 'M54.12 · 98940-25, 97012',
      amount: '$185.00',
      payer: 'BlueCross PPO · via Office Ally',
      scrubbed: true,
    },
    {
      id: 'CLM-88419',
      patient: 'Marcus Sterling',
      codes: 'M54.50 · 99213-25, 97110',
      amount: '$220.00',
      payer: 'Aetna Choice · Ready for Office Ally',
      scrubbed: false,
    },
    {
      id: 'CLM-88425',
      patient: 'Claire Deschamps',
      codes: 'G44.209 · 98941, 97140',
      amount: '$245.00',
      payer: 'UnitedHealthcare · via Office Ally',
      scrubbed: true,
    },
  ]);

  const liveSeal = useMemo(
    () =>
      computeVerificationSeal(
        `${patientName}|${providerName}|${CONSENT_TEMPLATES[templateIdx]}|${clinicalAddendum}`
      ),
    [patientName, providerName, templateIdx, clinicalAddendum]
  );

  const handleLockConsent = (e: React.FormEvent) => {
    e.preventDefault();
    setConsentLocked(true);
    onNotify(`Digital consent countersigned and sealed (${liveSeal})`);
  };

  const handleSubmitOfficeAllyClaim = (id: string) => {
    setClaims((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              scrubbed: true,
              payer: c.payer.replace('Ready for Office Ally', 'Submitted via Office Ally'),
            }
          : c
      )
    );
    onNotify(`Claim ${id} scrubbed and transmitted to Office Ally`);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-10 flex flex-col gap-12">
        {/* AI Medical Billing, Claim Encoding & Office Ally Integration */}
        <section id="section-payments" className="flex flex-col gap-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="font-caption text-clinical-teal font-semibold">
                AI Medical Billing · AI Medical Encoding · Office Ally Integration
              </div>
              <h1 className="font-display-hero text-text-primary mt-1">
                From a signed note to a claim draft
              </h1>
              <p className="font-body-lg text-text-secondary max-w-3xl mt-2">
                Walk through a sample billing handoff. See the diagnoses, procedures, and modifiers a biller would
                review before sending a claim through a clearinghouse such as Office Ally.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => openSandbox('billing', 'Opened interactive AI Billing & Office Ally 837P Scrubber demo')}
                className="inline-flex items-center gap-2 rounded-xl bg-clinical-teal hover:bg-primary-container text-on-primary px-5 py-2.5 font-body-md font-semibold shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">receipt_long</span>
                <span>See AI Billing Live</span>
              </button>

              <button
                type="button"
                onClick={() => openSandbox('scribe', 'Opened interactive Scribe Simulator')}
                className="inline-flex items-center gap-2 rounded-xl bg-surface-canvas hover:bg-surface-panel border border-border-subtle text-text-primary px-4 py-2.5 font-body-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg text-clinical-teal">mic</span>
                <span>Try Scribe Simulator</span>
              </button>

              <button
                type="button"
                onClick={() => openSandbox('video', 'Opened recorded walkthrough video')}
                className="inline-flex items-center gap-2 rounded-xl bg-surface-canvas hover:bg-surface-panel border border-border-subtle text-text-primary px-4 py-2.5 font-body-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg text-clinical-teal">smart_display</span>
                <span>Watch Recorded Walkthrough</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* AI Medical Billing & Encoding Overview */}
            <GlassCard className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <span className="font-caption text-clinical-teal font-semibold">
                  End-to-End Revenue Cycle Intelligence
                </span>
                <h2 className="font-headline-md text-text-primary">
                  Automated Encoding, Superbills &amp; Office Ally Clearinghouse
                </h2>
                <p className="font-body-sm text-text-secondary leading-relaxed">
                  Eliminate manual code lookup and double data entry between your clinical EHR and
                  your billing clearinghouse.
                </p>
                <ul className="space-y-2.5 font-body-sm text-text-primary">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-clinical-teal mt-0.5">
                      check_circle
                    </span>
                    <span>
                      <strong>AI Medical Encoding:</strong> Maps SOAP findings to ICD-10, CPT, and
                      modifiers across coding rules.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-clinical-teal mt-0.5">
                      check_circle
                    </span>
                    <span>
                      <strong>Direct Office Ally Integration:</strong> Submit scrubbed 837P
                      electronic claims, verify eligibility, and reconcile ERA remittances.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm text-clinical-teal mt-0.5">
                      check_circle
                    </span>
                    <span>
                      <strong>Visual Insurance OCR + Patient Statements:</strong> Pulls payer IDs
                      straight from card photos and manages copays &amp; patient invoices.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="pt-3 border-t border-border-subtle font-caption text-text-muted">
                Seamless Office Ally Sync · Clean-Claim Pre-Audit Included
              </div>
            </GlassCard>

            {/* Interactive Office Ally Claim Scrubber & Queue */}
            <GlassCard
              interactive={false}
              className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-5"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-caption text-clinical-teal font-semibold">
                    AI Claim Scrubber &amp; Office Ally Queue
                  </span>
                  <span className="font-caption text-alert-success font-semibold">
                    Office Ally Connected
                  </span>
                </div>

                <h2 className="font-headline-md text-text-primary">
                  Encoded Superbill &amp; Clearinghouse Dispatch
                </h2>

                <div className="space-y-3 pt-1">
                  {claims.map((clm) => (
                    <div
                      key={clm.id}
                      className="p-4 rounded-xl bg-surface-canvas border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2 font-code-clinical text-xs text-text-muted">
                          <span className="text-text-primary font-semibold">{clm.id}</span>
                          <span>·</span>
                          <span className="text-clinical-teal">{clm.codes}</span>
                        </div>
                        <div className="font-section-title text-text-primary mt-1">
                          {clm.patient} —{' '}
                          <span className="text-clinical-teal tabular-nums">{clm.amount}</span>
                        </div>
                        <div className="font-caption text-text-muted mt-0.5">{clm.payer}</div>
                      </div>

                      <div className="shrink-0">
                        {clm.scrubbed ? (
                          <span className="inline-flex items-center gap-1 font-caption font-semibold text-alert-success">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span>Synced to Office Ally</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSubmitOfficeAllyClaim(clm.id)}
                            className="px-3.5 py-2 rounded-lg bg-clinical-teal text-on-primary font-caption font-semibold hover:bg-primary-container transition-colors cursor-pointer whitespace-nowrap"
                          >
                            Scrub &amp; Send to Office Ally
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-between font-caption text-text-muted">
                <span>Diagnosis pointers &amp; modifier medical necessity verified</span>
                <span className="font-semibold text-text-primary">837P / ERA Ready</span>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Consolidated Clinic Automation & Office Ally Connectivity */}
        <section id="section-automation" className="flex flex-col gap-6 scroll-mt-24">
          <span id="section-integrations" className="sr-only" aria-hidden="true" />
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <span className="font-caption text-clinical-teal font-semibold">
                Automation &amp; Clearinghouse Connectivity
              </span>
              <h2 className="font-headline-lg text-text-primary mt-1">
                Background Clinic Automation &amp; Office Ally Capabilities
              </h2>
            </div>

            {/* Segmented Toggle Consolidating Daily Workflows & Capabilities Matrix */}
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-surface-canvas border border-border-subtle self-start">
              <button
                type="button"
                onClick={() => setAutomationView('workflows')}
                className={`px-3.5 py-1.5 rounded-lg font-caption font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  automationView === 'workflows'
                    ? 'bg-clinical-teal text-on-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Daily Automation ({AUTOMATION_SYSTEMS.length})
              </button>
              <button
                type="button"
                onClick={() => setAutomationView('matrix')}
                className={`px-3.5 py-1.5 rounded-lg font-caption font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  automationView === 'matrix'
                    ? 'bg-clinical-teal text-on-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Office Ally &amp; AI Matrix
              </button>
            </div>
          </div>

          {automationView === 'workflows' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {AUTOMATION_SYSTEMS.map((node) => (
                <GlassCard key={node.num} className="p-6 flex flex-col justify-between gap-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="material-symbols-outlined text-clinical-teal">
                        {node.icon === 'Fact_Check' ? 'fact_check' : node.icon}
                      </span>
                      <span className="font-caption text-clinical-teal font-semibold">
                        {node.routeOrRuntime}
                      </span>
                    </div>
                    <div className="font-caption text-text-muted">{node.num}. Workflow</div>
                    <h3 className="font-headline-sm text-text-primary">{node.title}</h3>
                    <p className="font-body-sm text-text-primary font-medium">{node.summary}</p>
                    <p className="font-body-sm text-text-secondary leading-relaxed">
                      {node.detail}
                    </p>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="glass-surface rounded-2xl border border-border-subtle p-6 sm:p-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-sm border-collapse">
                  <thead className="bg-surface-canvas font-caption text-text-secondary border-y border-border-subtle">
                    <tr>
                      <th className="py-3 px-4">Integration / AI Engine</th>
                      <th className="py-3 px-4">Clinical Domain</th>
                      <th className="py-3 px-4">Role Inside Your Practice</th>
                      <th className="py-3 px-4">Availability</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {LIVE_INTEGRATIONS.map((item) => (
                      <tr key={item.name} className="hover:bg-surface-canvas/70">
                        <td className="py-3.5 px-4 font-semibold text-text-primary whitespace-nowrap">
                          {item.name}
                        </td>
                        <td className="py-3.5 px-4 font-caption text-text-secondary whitespace-nowrap">
                          {item.category}
                        </td>
                        <td className="py-3.5 px-4 text-text-secondary">{item.purpose}</td>
                        <td className="py-3.5 px-4 font-caption font-semibold text-alert-success whitespace-nowrap">
                          {item.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Digital Consents, Privacy Safeguards & Practice Analytics */}
        <section id="section-security" className="grid grid-cols-1 lg:grid-cols-12 gap-6 scroll-mt-24">
          <form
            onSubmit={handleLockConsent}
            className="lg:col-span-6 glass-surface rounded-2xl border border-border-subtle p-6 sm:p-8 flex flex-col justify-between gap-5"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-caption text-clinical-teal font-semibold">
                  Digital Clinical Consents (4 Forms)
                </span>
                <span className="font-caption font-semibold text-alert-success">
                  {consentLocked ? 'Countersigned & Sealed' : 'Tamper-Evident'}
                </span>
              </div>

              <h2 className="font-headline-md text-text-primary">
                Electronic Patient Consents &amp; Provider Countersignature
              </h2>
              <p className="font-body-sm text-text-secondary">
                Patients sign clinical, telehealth, privacy, and financial consent forms digitally,
                complete with provider countersignatures and tamper-evident audit trails.
              </p>

              <div>
                <label
                  htmlFor="consent-template"
                  className="font-caption text-text-secondary block mb-1"
                >
                  Select Clinical Consent Form
                </label>
                <select
                  id="consent-template"
                  value={templateIdx}
                  onChange={(e) => {
                    setTemplateIdx(Number(e.target.value));
                    setConsentLocked(false);
                  }}
                  className="w-full h-10 px-3 rounded-lg bg-surface-canvas border border-border-subtle font-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-clinical-teal"
                >
                  {CONSENT_TEMPLATES.map((tpl, idx) => (
                    <option key={tpl} value={idx}>
                      {tpl}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="consent-patient"
                    className="font-caption text-text-secondary block mb-1"
                  >
                    Patient Full Name
                  </label>
                  <input
                    id="consent-patient"
                    type="text"
                    value={patientName}
                    onChange={(e) => {
                      setPatientName(e.target.value);
                      setConsentLocked(false);
                    }}
                    className="w-full h-10 px-3 rounded-lg bg-surface-canvas border border-border-subtle font-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-clinical-teal"
                  />
                </div>

                <div>
                  <label
                    htmlFor="consent-provider"
                    className="font-caption text-text-secondary block mb-1"
                  >
                    Countersigning Provider
                  </label>
                  <input
                    id="consent-provider"
                    type="text"
                    value={providerName}
                    onChange={(e) => {
                      setProviderName(e.target.value);
                      setConsentLocked(false);
                    }}
                    className="w-full h-10 px-3 rounded-lg bg-surface-canvas border border-border-subtle font-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-clinical-teal"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="consent-notes"
                  className="font-caption text-text-secondary block mb-1"
                >
                  Clinical Consent Note
                </label>
                <textarea
                  id="consent-notes"
                  rows={2}
                  value={clinicalAddendum}
                  onChange={(e) => {
                    setClinicalAddendum(e.target.value);
                    setConsentLocked(false);
                  }}
                  className="w-full p-3 rounded-lg bg-surface-canvas border border-border-subtle font-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-clinical-teal"
                />
              </div>

              <div className="p-3.5 rounded-lg bg-surface-canvas border border-border-subtle">
                <div className="font-caption text-text-muted mb-1">
                  Tamper-Evident Clinical Verification ID
                </div>
                <div className="font-code-clinical text-xs text-clinical-teal break-all">
                  {liveSeal}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-subtle">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-clinical-teal hover:bg-primary-container text-on-primary px-4 py-2.5 font-body-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-base">verified</span>
                <span>{consentLocked ? 'Update Signed Consent' : 'Countersign & Seal Record'}</span>
              </button>

              <button
                type="button"
                data-ink-toggle="true"
                className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-high hover:bg-clinical-teal hover:text-white px-3.5 py-2.5 font-body-sm font-medium text-text-primary transition-colors cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-base">contrast</span>
                <span>Switch Theme</span>
              </button>
            </div>
          </form>

          <div className="lg:col-span-6 flex flex-col gap-6">
            <GlassCard className="p-6 sm:p-8 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-caption text-clinical-teal font-semibold">
                  Clinical Privacy, Governance &amp; BAA
                </span>
                <span className="font-caption font-semibold text-alert-success">
                  Ask about a BAA
                </span>
              </div>
              <h2 className="font-headline-md text-text-primary">
                Privacy and onboarding questions
              </h2>
              <ul className="space-y-2.5 font-body-sm text-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-sm text-clinical-teal mt-0.5">
                    contract_edit
                  </span>
                  <span>
                    <strong className="text-text-primary">Business Associate Agreement (BAA):</strong>{' '}
                    Ask the AIMS team about agreement terms and requirements before using patient data.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-sm text-clinical-teal mt-0.5">
                    shield_lock
                  </span>
                  <span>
                    <strong className="text-text-primary">Protected Clinical AI Processing:</strong>{' '}
                    Confirm how the live product would handle visit audio, intake answers, and scanned documents.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-sm text-clinical-teal mt-0.5">
                    vpn_key
                  </span>
                  <span>
                    <strong className="text-text-primary">Role-Scoped Clinic Access:</strong>{' '}
                    Review which records owners, clinicians, front-desk staff, and patients would be able to access.
                  </span>
                </li>
              </ul>
              {onOpenLegalPolicy && (
                <div className="pt-2 border-t border-border-subtle flex items-center justify-between font-caption">
                  <span className="text-text-muted">Compliance &amp; legal documentation</span>
                  <button
                    type="button"
                    onClick={() => onOpenLegalPolicy('baa')}
                    className="text-clinical-teal font-semibold hover:underline cursor-pointer"
                  >
                    Read privacy and BAA information →
                  </button>
                </div>
              )}
            </GlassCard>

            <GlassCard interactive={false} className="p-6 sm:p-8 flex flex-col gap-4 flex-1">
              <span className="font-caption text-clinical-teal font-semibold">
                Clinical &amp; Revenue Reporting
              </span>
              <h3 className="font-headline-sm text-text-primary">
                8 Built-In Practice, Coding &amp; Billing Dashboards
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRACTICE_ANALYTICS.map((m) => (
                  <div
                    key={m.metric}
                    className="p-3 rounded-lg bg-surface-canvas border border-border-subtle"
                  >
                    <div className="font-caption text-clinical-teal font-semibold">{m.metric}</div>
                    <div className="font-caption text-text-secondary mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Interactive Sandbox & Recorded Walkthrough Hub */}
        <InteractiveScribeSandbox
          key={sandboxMode}
          initialMode={sandboxMode}
          onNotify={onNotify}
          onRequestWalkthrough={(prefill) => scrollToBookDemo(prefill)}
        />

        {/* Clinic Deployment Plans */}
        <section id="section-pricing" className="flex flex-col gap-6 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-caption text-clinical-teal font-semibold">
                Practice Rollout, Sandbox &amp; Guided Onboarding
              </span>
              <h2 className="font-headline-lg text-text-primary mt-1">
                Onboarding for different practice sizes
              </h2>
            </div>
            <span className="font-body-sm text-text-secondary">
              Test the interactive sandbox above, or send a request below and we&rsquo;ll agree on a walkthrough time.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                tier: 'Solo Practice Edition',
                badge: '1 Provider + Front Desk',
                desc: 'Full Unified EHR, 7-step flow + 60s Quick-Note, Ambient AI Medical Scribe with review, 33-question spoken intake, Visual OCR, and Patient Portal.',
                sandboxMode: 'scribe' as SandboxMode,
                requestLabel: 'Request Solo Walkthrough (Agree on a Time)',
              },
              {
                tier: 'Multi-Provider Clinic Suite',
                badge: 'Most Popular · Full AI Billing',
                desc: 'Adds the clinical review, full AI Medical Coding & Encoding, automated superbill scrubbing, and direct Office Ally clearinghouse integration.',
                sandboxMode: 'billing' as SandboxMode,
                requestLabel: 'Request Clinic Suite Walkthrough (Agree on a Time)',
                featured: true,
              },
              {
                tier: 'Multi-Site Group Edition',
                badge: 'Multi-Location + 24/7 AI',
                desc: 'Includes multi-location EHR governance, 24/7 AI Virtual Receptionist, morning executive provider briefings, and dedicated Office Ally migration engineering.',
                sandboxMode: 'video' as SandboxMode,
                requestLabel: 'Request Group Walkthrough (Agree on a Time)',
              },
            ].map((plan) => (
              <GlassCard
                key={plan.tier}
                className={`p-6 flex flex-col justify-between gap-6 ${
                  plan.featured ? 'ring-2 ring-clinical-teal/45' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="font-caption font-semibold text-clinical-teal">{plan.badge}</div>
                  <h3 className="font-headline-md text-text-primary">{plan.tier}</h3>
                  <p className="font-body-sm text-text-secondary leading-relaxed">{plan.desc}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      openSandbox(
                        plan.sandboxMode,
                        `Loaded interactive sandbox for ${plan.tier}`
                      )
                    }
                    className={`w-full text-center py-2.5 px-4 rounded-xl font-body-sm font-semibold transition-colors cursor-pointer ${
                      plan.featured
                        ? 'bg-clinical-teal hover:bg-primary-container text-on-primary'
                        : 'bg-surface-canvas hover:bg-clinical-teal-subtle border border-border-subtle text-clinical-teal'
                    }`}
                  >
                    Try Interactive Sandbox &amp; Video ↑
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      scrollToBookDemo(
                        `Interested in ${plan.tier}. Let’s agree on a time for a live walkthrough.`
                      )
                    }
                    className="w-full text-center py-2 px-3 rounded-xl font-caption font-semibold text-text-secondary hover:text-clinical-teal underline underline-offset-4 cursor-pointer"
                  >
                    {plan.requestLabel}
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* Clinical & Billing FAQ */}
        <section id="section-faq" className="flex flex-col gap-6 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-caption text-clinical-teal font-semibold">
                Frequently Asked Questions
              </span>
              <h2 className="font-headline-lg text-text-primary mt-1">
                AI Scribe, Intake, OCR &amp; Office Ally Billing FAQ
              </h2>
            </div>
            <span className="font-caption text-text-muted">
              Answers for physicians, practice managers &amp; billing teams
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {WEBSITE_FAQS.map((item, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={item.q}
                  className="rounded-xl glass-surface border border-border-subtle overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-surface-canvas/60 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="font-caption font-semibold text-clinical-teal shrink-0">
                        {item.tag}
                      </span>
                      <span className="font-section-title text-text-primary">{item.q}</span>
                    </div>
                    <span className="material-symbols-outlined text-text-muted shrink-0">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 font-body-md text-text-secondary leading-relaxed border-t border-border-subtle/60">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {siteReview ? <ReviewContact id="book-demo" /> : <BookDemoSection
        onNotify={onNotify}
        onOpenFullContact={onOpenFullContact}
        contextLabel="AI Medical Billing · Office Ally Integration · Privacy & BAA"
      />}
    </div>
  );
};
