import { prefillAndScrollToContact, ReviewContact, siteReview } from './ReviewContact';
import React, { useState } from 'react';
import { AppTabId } from '../App';
import { PLATFORM_ROLES } from '../data/aimsSpecData';
import { ContactHubSection } from './ContactHubSection';
import { GlassCard } from './GlassCard';
import { HeroWorkflow } from './HeroWorkflow';
import { InteractiveScribeSandbox, SandboxMode } from './InteractiveScribeSandbox';


interface PlatformScreenProps {
  onNavigateSection: (tab: AppTabId, sectionId?: string) => void;
  onNotify: (message: string) => void;
}

interface SpecialtyProfile {
  id: string;
  name: string;
  intakeFocus: string;
  scribeAndSoap: string;
  codingExample: string;
  billingImpact: string;
}

const SPECIALTY_PROFILES: SpecialtyProfile[] = [
  {
    id: 'chiro-pmr',
    name: 'Chiropractic & Physical Med',
    intakeFocus:
      'Pain body-mapping, functional disability scores, mechanism of injury, and visual insurance/auto-medpay card OCR.',
    scribeAndSoap:
      'Example note with orthopedic exam findings and changes in range of motion between visits.',
    codingExample: 'M54.12 · M99.01 · 98940 · 97012 · 97110',
    billingImpact:
      'Example billing review for modifier 25 and timed therapy units before claim submission.',
  },
  {
    id: 'primary-care',
    name: 'Primary Care & Internal Med',
    intakeFocus:
      '33-question multilingual ROS, medication reconciliation, allergy checks, and photo extraction of external lab sheets.',
    scribeAndSoap:
      'Separates multi-problem chronic care visits into structured HPI, Assessment & Plan per condition, with a shorter note option for follow-up visits.',
    codingExample: 'E11.9 · I10 · E78.5 · 99214 · G2211',
    billingImpact:
      'Captures E/M MDM complexity, preventive add-on codes, and chronic care documentation ready for Office Ally.',
  },
  {
    id: 'pain-rehab',
    name: 'Pain Management & Ortho',
    intakeFocus:
      'Prior imaging history, conservative therapy timeline, surgical history, and referral/authorization OCR extraction.',
    scribeAndSoap:
      'Documents dermatomal deficits, motor strength grading, procedure consents, and red-flag safety screening.',
    codingExample: 'M51.16 · G89.29 · 99214-25 · 20610 · 76942',
    billingImpact:
      'Verifies medical-necessity criteria and diagnosis pointers so interventional and evaluation claims pass clearinghouse edits.',
  },
  {
    id: 'integrative',
    name: 'Integrative & Functional Med',
    intakeFocus:
      'Comprehensive lifestyle, nutrition, sleep, cardiometabolic history, and visual OCR extraction of multi-page blood panels.',
    scribeAndSoap:
      'Synthesizes 45-minute consultative encounters, tracks longitudinal hs-CRP / HbA1c / Vitamin D trends, and prints patient care plans.',
    codingExample: 'E55.9 · R53.83 · E66.9 · 99205 · 99402',
    billingImpact:
      'Supports hybrid insurance superbills via Office Ally alongside clear itemized patient statements and wellness plans.',
  },
  {
    id: 'behavioral',
    name: 'Behavioral Health & Neuro',
    intakeFocus:
      'Private mobile spoken/touch intake in English, Spanish, or Haitian Kreyòl, PHQ/GAD symptom baselines, and digital telehealth consent.',
    scribeAndSoap:
      'Hands-free ambient listening during in-person or browser telehealth sessions with structured mental status exam charting.',
    codingExample: 'F41.1 · F33.1 · G47.00 · 99214 · 90833',
    billingImpact:
      'Tracks session duration rules, telehealth place-of-service modifiers, and clean electronic claim dispatch via Office Ally.',
  },
  {
    id: 'multi-site',
    name: 'Multi-Specialty Groups',
    intakeFocus:
      'Shared longitudinal patient registry across providers and locations with 24/7 AI receptionist triage and automated reminders.',
    scribeAndSoap:
      'Specialty-specific SOAP templates per provider, clinical review for complex co-managed cases, and morning provider briefings.',
    codingExample: 'ICD-10 & CPT Rules · Multi-Provider QA',
    billingImpact:
      'Centralized claim scrubbing, provider productivity analytics, and unified Office Ally clearinghouse reconciliation.',
  },
];

const CAPABILITY_CARDS = [
  {
    icon: 'mic',
    title: 'Ambient AI Medical Scribe',
    desc: 'Captures natural clinical encounters, answers mid-visit chart questions, and generates structured SOAP notes—plus a follow-up quick note mode for follow-up visits.',
    footLabel: 'Explore Scribe & 3D Array',
    targetTab: 'ai-scribe' as AppTabId,
    sectionId: 'section-scribe',
  },
  {
    icon: 'clinical_notes',
    title: 'Unified Longitudinal EHR',
    desc: 'Complete electronic health record uniting patient registries, scheduling, reminders, longitudinal SOAP timelines, biomarker trends, digital consents, and a self-service Patient Portal.',
    footLabel: 'Explore 7-Step Flow & EHR',
    targetTab: '7-step-flow' as AppTabId,
    sectionId: 'section-flow',
  },
  {
    icon: 'document_scanner',
    title: 'Smart Intake & Visual OCR',
    desc: '33-question spoken & digital intake forms in English, Spanish, and Haitian Kreyòl paired with visual OCR extraction for photo IDs, insurance cards, and referrals.',
    footLabel: 'Explore Intake & OCR',
    targetTab: 'ai-scribe' as AppTabId,
    sectionId: 'section-voice',
  },
  {
    icon: 'psychology',
    title: 'Clinical Review',
    desc: 'Review the draft against the visit conversation, check suggested codes, and resolve missing details before signing.',
    footLabel: 'Explore clinical review',
    targetTab: 'ai-scribe' as AppTabId,
    sectionId: 'section-scribe',
  },
  {
    icon: 'fact_check',
    title: 'AI Medical Coding & Encoding',
    desc: 'Automated clinical entity extraction mapping exam findings directly to high-specificity ICD-10 diagnoses, CPT procedures, and modifiers across coding rules.',
    footLabel: 'View Coding Workflows',
    targetTab: 'ai-scribe' as AppTabId,
    sectionId: 'section-ai-tools',
  },
  {
    icon: 'receipt_long',
    title: 'AI Medical Billing & Office Ally',
    desc: 'Automated superbill generation, medical-necessity claim scrubbing, patient balance tracking, and seamless clearinghouse integration with Office Ally.',
    footLabel: 'Open Office Ally Billing',
    targetTab: 'security-hipaa' as AppTabId,
    sectionId: 'section-payments',
  },
];

const BEFORE_VS_WITH_AIMS = [
  {
    stage: 'Intake & Insurance Cards',
    before: 'Clipboards, manual front-desk typing, and miskeyed subscriber IDs',
    after: '33-Q spoken/mobile intake (EN/ES/HT) + instant Visual OCR card extraction',
  },
  {
    stage: 'Exam Room Documentation',
    before: 'Typing during visits or Additional documentation after clinic hours',
    after: 'Hands-free Ambient AI Medical Scribe + <60s Express Follow-Up Quick-Notes',
  },
  {
    stage: 'Medical Coding & QA',
    before: 'Manual ICD-10/CPT lookup, missed modifiers (-25), and avoidable claim denials',
    after: 'SOAP verification & automated encoding across coding rules',
  },
  {
    stage: 'Billing & Clearinghouse',
    before: 'Re-typing superbills from the EHR into a separate billing portal',
    after: 'One-click provider e-signature queues scrubbed 837P claims straight to Office Ally',
  },
];

export const PlatformScreen: React.FC<PlatformScreenProps> = ({
  onNavigateSection,
  onNotify,
}) => {
  const [signState, setSignState] = useState<'idle' | 'signing' | 'signed'>('idle');
  const [activeSpecialtyId, setActiveSpecialtyId] = useState(SPECIALTY_PROFILES[0].id);
  const [sandboxMode, setSandboxMode] = useState<SandboxMode>('scribe');

  const handleOpenSandbox = (mode: SandboxMode) => {
    setSandboxMode(mode);
    window.setTimeout(() => {
      document.getElementById('section-sandbox')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  };

  const activeSpecialty =
    SPECIALTY_PROFILES.find((s) => s.id === activeSpecialtyId) || SPECIALTY_PROFILES[0];

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    onNotify(`Copied medical code "${code}" to clipboard`);
  };

  const handleSignEncounter = () => {
    if (signState !== 'idle') return;
    setSignState('signing');
    setTimeout(() => {
      setSignState('signed');
      onNotify(
        'Pre-sign audit passed · Visit #V-89410 signed, saved to EHR & queued for Office Ally billing'
      );
      setTimeout(() => setSignState('idle'), 3400);
    }, 800);
  };

  return (
    <div className="flex flex-col w-full">
      {/* 1. Clinic workflow introduction */}
      <HeroWorkflow
        onNavigateSection={onNavigateSection}
        onOpenSandbox={handleOpenSandbox}
      />

      {/* 2. Interactive Scribe Simulator, AI Billing Demo & Recorded Walkthrough Video */}
      <InteractiveScribeSandbox
        key={sandboxMode}
        initialMode={sandboxMode}
        onNotify={onNotify}
        onRequestWalkthrough={(prefill) => prefillAndScrollToContact(prefill)}
      />

      {/* 3. Interactive Workspace Preview: Ambient AI Medical Scribe & Encoding */}
      <section className="px-4 sm:px-8 py-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <span className="font-caption text-clinical-teal font-semibold">
                Sample clinical workflow
              </span>
              <h2 className="font-headline-lg text-text-primary mt-1">
                Ambient AI Medical Scribe, Review &amp; Medical Encoding
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-text-secondary font-code-clinical">
              <span className="text-audio-recording font-semibold tabular-nums">REC 00:14:28</span>
              <span className="text-text-muted">·</span>
              <span className="font-caption text-text-muted">Ambient Voice Capture</span>
              <span className="text-text-muted">·</span>
              <span className="inline-flex items-center gap-1 text-clinical-teal font-caption font-semibold">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>Screen Wake-Lock Active</span>
              </span>
            </div>
          </div>

          <GlassCard interactive={false} className="overflow-hidden">
            {/* Workspace Header Bar */}
            <div className="bg-surface-container px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400/60" />
                </div>
                <span className="font-code-badge text-text-secondary">
                  AIMS Clinical Workspace · Encounter #V-89410
                </span>
              </div>
              <div className="flex items-center gap-4 text-text-secondary">
                <span className="font-caption text-text-muted">
                  Visual Insurance OCR Verified · Office Ally Claim Ready
                </span>
                <span className="inline-flex items-center gap-1 text-alert-success font-code-badge">
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  <span>EHR Synced</span>
                </span>
              </div>
            </div>

            {/* Asymmetric Split Grid: 58% Live Encounter & Copilot, 42% SOAP & Encoding */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
              {/* Left Column: Live Ambient Conversation & Extraction */}
              <div className="lg:col-span-7 p-6 flex flex-col justify-between bg-surface-panel border-b lg:border-b-0 lg:border-r border-border-subtle">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-clinical-teal text-base">
                        hearing
                      </span>
                      <span className="font-section-title text-text-primary">
                        Live Encounter Conversation
                      </span>
                    </div>
                    <span className="font-caption text-text-muted">
                      Dr. Mateo Alvarez, DC · Pt: Elena Morales (DOB: 1984-06-12)
                    </span>
                  </div>

                  <div className="space-y-3 font-body-md">
                    <div className="p-4 bg-surface-canvas rounded-xl border border-border-subtle/60">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-caption text-clinical-teal font-semibold">
                          Provider
                        </span>
                        <span className="font-code-clinical text-caption text-text-muted tabular-nums">
                          10:14:02 AM
                        </span>
                      </div>
                      <p className="text-text-primary">
                        &ldquo;Good morning Elena. We&rsquo;re re-evaluating the cervical pain
                        radiating down your right shoulder into the C6 dermatome. How has the
                        traction helped over the last seven days?&rdquo;
                      </p>
                    </div>

                    <div className="p-4 bg-surface-container-low rounded-xl border border-border-subtle/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-caption text-text-secondary font-semibold">
                          Patient
                        </span>
                        <span className="font-code-clinical text-caption text-text-muted tabular-nums">
                          10:14:18 AM
                        </span>
                      </div>
                      <p className="text-text-primary">
                        &ldquo;The burning in the thumb and index finger dropped significantly, but
                        if I extend my neck backward while working at my desk, I still feel a sharp
                        pinch right around the base of my neck on the right side.&rdquo;
                      </p>
                    </div>

                    <div className="p-4 bg-surface-canvas rounded-xl border border-border-subtle/60">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-caption text-clinical-teal font-semibold">
                          Provider
                        </span>
                        <span className="font-code-clinical text-caption text-text-muted tabular-nums">
                          10:14:35 AM
                        </span>
                      </div>
                      <p className="text-text-primary">
                        &ldquo;Understood. Let&rsquo;s run Spurling&rsquo;s test right now. Turning
                        your head to the right... slight extension... pressure applied. Any
                        radiating pain?&rdquo;
                      </p>
                    </div>

                    <div className="p-4 bg-surface-container-low rounded-xl border border-border-subtle/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-caption text-text-secondary font-semibold">
                          Patient
                        </span>
                        <span className="font-code-clinical text-caption text-text-muted tabular-nums">
                          10:14:48 AM
                        </span>
                      </div>
                      <p className="text-text-primary">
                        &ldquo;Yes, right there. Mild tingling shoots down the forearm, maybe a 4
                        out of 10.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mid-Visit Clinical Copilot + Audio Waveform */}
                <div className="pt-4 flex flex-col gap-3">
                  <div className="p-3.5 rounded-xl bg-clinical-teal-subtle border border-clinical-teal/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-caption text-clinical-teal font-semibold">
                        Mid-Visit AI Consultation Copilot
                      </span>
                      <span className="font-caption text-text-muted">
                        Intake &amp; OCR Context Loaded
                      </span>
                    </div>
                    <p className="font-body-sm text-text-secondary">
                      <strong className="text-text-primary">Doctor Query:</strong> &ldquo;Compare
                      today&rsquo;s extension ROM with last week.&rdquo; →{' '}
                      <span className="text-text-primary">
                        Improved +8&deg; (32&deg; today vs 24&deg; on Visit #04); no anticoagulants
                        reported on intake form.
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-text-muted font-caption">
                    <span>Hands-Free Ambient Clinical Audio</span>
                    <span className="font-code-clinical text-text-primary">
                      Sample encounter
                    </span>
                  </div>
                  <div className="h-9 bg-surface-canvas border border-border-subtle rounded-lg flex items-center px-4 justify-between gap-1 overflow-hidden">
                    {Array.from({ length: 28 }, (_, idx) => (
                      <div
                        key={idx}
                        className="w-1 bg-clinical-teal/80 rounded-full wave-bar"
                        style={{ animationDelay: `${(idx % 7) * 0.14}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: SOAP & Medical Encoding */}
              <div className="lg:col-span-5 p-6 bg-surface-canvas flex flex-col gap-5 justify-between">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-clinical-teal text-base">
                        psychology
                      </span>
                      <span className="font-section-title text-text-primary">
                        SOAP &amp; Encoding
                      </span>
                    </div>
                    <span className="font-code-badge text-alert-success">Ready for review</span>
                  </div>

                  {/* Agent 1: Draft note */}
                  <div className="p-4 bg-surface-panel rounded-xl border border-border-subtle shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-code-badge text-clinical-teal font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">auto_fix_high</span>
                        <span>Draft clinical note</span>
                      </span>
                      <span className="font-caption text-text-muted">Structured SOAP</span>
                    </div>

                    <div className="font-body-sm text-text-secondary space-y-1.5">
                      <div>
                        <strong className="text-text-primary font-code-badge mr-1.5">S:</strong>
                        41yo female reports resolving paresthesia in right C6 dermatome; localized
                        cervical stiffness aggravated by neck extension at workstation.
                      </div>
                      <div>
                        <strong className="text-text-primary font-code-badge mr-1.5">O:</strong>
                        Positive Spurling&rsquo;s test reproduces mild radicular symptom (4/10).
                        Cervical extension measured at 32&deg; (+8&deg; improvement).
                      </div>
                      <div>
                        <strong className="text-text-primary font-code-badge mr-1.5">A:</strong>
                        Cervical radiculopathy, right side (M54.12); Segmental cervical dysfunction
                        (M99.01).
                      </div>
                      <div>
                        <strong className="text-text-primary font-code-badge mr-1.5">P:</strong>
                        Manual cervical manipulation (98940), mechanical traction 12 min (97012),
                        ergonomic posture plan.
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {['ICD-10: M54.12', 'ICD-10: M99.01', 'CPT: 98940', 'CPT: 97012'].map(
                        (code) => (
                          <button
                            key={code}
                            type="button"
                            onClick={() => handleCopyCode(code)}
                            className="font-code-badge px-2 py-1 bg-surface-container-high rounded text-text-primary hover:bg-clinical-teal hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                            title="Click to copy medical code"
                          >
                            <span>{code}</span>
                            <span className="material-symbols-outlined text-[11px] opacity-70">
                              content_copy
                            </span>
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Agent 2: Compliance & Office Ally Billing Auditor */}
                  <div className="p-4 bg-clinical-teal-subtle rounded-xl border border-clinical-teal/30 space-y-2 relative overflow-hidden">
                    <div className="absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-clinical-teal/15 to-transparent pointer-events-none scan-beam" />
                    <div className="flex items-center justify-between relative z-10">
                      <span className="font-code-badge text-clinical-teal font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">verified</span>
                        <span>Coding review</span>
                      </span>
                      <span className="inline-flex items-center text-alert-success font-code-badge gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        <span>Sample claim draft</span>
                      </span>
                    </div>
                    <p className="font-body-sm text-text-secondary leading-snug relative z-10">
                      Verified against{' '}
                      <span className="font-code-clinical text-text-primary font-semibold">
                        ICD-10 &amp; CPT coding rules
                      </span>
                      . Objective Spurling&rsquo;s maneuver and ROM measurements substantiate
                      modifier -25. Formatted for seamless Office Ally claim submission.
                    </p>
                    <div className="flex items-center gap-2 pt-1 font-caption text-text-muted relative z-10">
                      <span className="inline-flex items-center gap-1 text-alert-success font-medium">
                        <span className="material-symbols-outlined text-xs">verified_user</span>
                        <span>Red-flag clearance</span>
                      </span>
                      <span>·</span>
                      <span>Office Ally 837P ready</span>
                    </div>
                  </div>
                </div>

                {/* One-Click Sign & Send to Billing */}
                <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                  <div className="flex flex-col">
                    <span className="font-caption text-text-muted">
                      Provider E-Signature &amp; Claim Queue
                    </span>
                    <span className="font-code-clinical text-text-primary">
                      EHR Chart + Office Ally Sync
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignEncounter}
                    disabled={signState === 'signing'}
                    className={`inline-flex items-center gap-1.5 font-body-sm px-4 py-2.5 rounded-xl transition-colors font-medium shadow-sm whitespace-nowrap shrink-0 cursor-pointer ${
                      signState === 'signed'
                        ? 'bg-alert-success text-white'
                        : 'bg-clinical-teal hover:bg-primary-container text-on-primary'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {signState === 'signed' ? 'done_all' : 'draw'}
                    </span>
                    <span>
                      {signState === 'signing'
                        ? 'Signing & Encoding...'
                        : signState === 'signed'
                          ? 'Signed & Sent to Billing'
                          : 'Sign & Queue Claim'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 4. 6 Core Platform Pillars */}
      <section className="px-4 sm:px-8 py-12 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-caption text-clinical-teal font-semibold">
                Unified Clinical Capabilities
              </span>
              <h2 className="font-headline-lg text-text-primary mt-1">
                Scribe, EHR, Intake, Visual OCR &amp; Billing
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigateSection('7-step-flow', 'section-flow')}
              className="inline-flex items-center gap-1.5 font-body-sm font-semibold text-clinical-teal hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Walk Through the Interactive 7-Step Patient Flow</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAPABILITY_CARDS.map((card) => (
              <GlassCard
                key={card.title}
                onClick={() => onNavigateSection(card.targetTab, card.sectionId)}
                className="p-6 flex flex-col justify-between cursor-pointer"
              >
                <div className="space-y-3 relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-clinical-teal-subtle border border-clinical-teal/25 flex items-center justify-center text-clinical-teal">
                    <span className="material-symbols-outlined">{card.icon}</span>
                  </div>
                  <h3 className="font-headline-sm text-text-primary">{card.title}</h3>
                  <p className="font-body-sm text-text-secondary leading-relaxed">{card.desc}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-border-subtle/60 flex items-center justify-between text-clinical-teal font-caption font-semibold relative z-10">
                  <span>{card.footLabel}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Built For Your Specialty + Before AIMS vs. With AIMS Comparison */}
      <section className="px-4 sm:px-8 py-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Interactive Specialty Fit Explorer */}
          <GlassCard
            interactive={false}
            className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6"
          >
            <div className="space-y-4">
              <div>
                <span className="font-caption text-clinical-teal font-semibold">
                  Built For Your Clinical Specialty
                </span>
                <h2 className="font-headline-md text-text-primary mt-1">
                  Tailored Intake, SOAP &amp; Medical Encoding by Practice Type
                </h2>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {SPECIALTY_PROFILES.map((spec) => {
                  const active = spec.id === activeSpecialty.id;
                  return (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => setActiveSpecialtyId(spec.id)}
                      className={`px-3 py-1.5 rounded-lg font-caption font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                        active
                          ? 'bg-clinical-teal text-on-primary border-clinical-teal'
                          : 'bg-surface-canvas text-text-secondary border-border-subtle hover:text-text-primary'
                      }`}
                    >
                      {spec.name}
                    </button>
                  );
                })}
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-surface-canvas border border-border-subtle space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border-subtle">
                  <span className="font-section-title text-text-primary">
                    {activeSpecialty.name}
                  </span>
                  <span className="font-code-clinical text-xs text-clinical-teal">
                    {activeSpecialty.codingExample}
                  </span>
                </div>

                <div className="space-y-2 font-body-sm">
                  <div>
                    <strong className="text-text-primary">Intake &amp; Visual OCR: </strong>
                    <span className="text-text-secondary">{activeSpecialty.intakeFocus}</span>
                  </div>
                  <div>
                    <strong className="text-text-primary">Ambient Scribe &amp; EHR: </strong>
                    <span className="text-text-secondary">{activeSpecialty.scribeAndSoap}</span>
                  </div>
                  <div>
                    <strong className="text-text-primary">AI Billing &amp; Office Ally: </strong>
                    <span className="text-text-secondary">{activeSpecialty.billingImpact}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border-subtle flex items-center justify-between font-caption text-text-muted">
              <span>Custom SOAP templates &amp; 33-Q intake configured during onboarding</span>
              <button
                type="button"
                onClick={() => onNavigateSection('platform', 'section-contact')}
                className="text-clinical-teal font-semibold hover:underline cursor-pointer whitespace-nowrap"
              >
                Request Specialty Demo →
              </button>
            </div>
          </GlassCard>

          {/* Before AIMS vs. With AIMS Comparison */}
          <GlassCard
            interactive={false}
            className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6"
          >
            <div className="space-y-4">
              <div>
                <span className="font-caption text-clinical-teal font-semibold">
                  Practice Consolidation &amp; Time Saved
                </span>
                <h2 className="font-headline-md text-text-primary mt-1">
                  Replace 5 Disconnected Clinic Tools with One Flow
                </h2>
              </div>

              <div className="space-y-2.5">
                {BEFORE_VS_WITH_AIMS.map((row) => (
                  <div
                    key={row.stage}
                    className="p-3.5 rounded-xl bg-surface-canvas border border-border-subtle space-y-1.5"
                  >
                    <div className="font-caption font-semibold text-text-primary">{row.stage}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-caption">
                      <div className="text-text-muted">
                        <span className="font-semibold text-text-secondary">Without AIMS: </span>
                        {row.before}
                      </div>
                      <div className="text-text-primary">
                        <span className="font-semibold text-clinical-teal">With AIMS: </span>
                        {row.after}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border-subtle flex items-center justify-between font-caption text-text-muted">
              <span>Bring visit documentation and coding review into one workflow</span>
              <button
                type="button"
                onClick={() => onNavigateSection('security-hipaa', 'section-payments')}
                className="text-clinical-teal font-semibold hover:underline cursor-pointer whitespace-nowrap"
              >
                See Office Ally Scrubber →
              </button>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 6. 4 Clinic & Patient Roles */}
      <section className="px-4 sm:px-8 py-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-caption text-clinical-teal font-semibold">
                Role-Scoped Workspaces
              </span>
              <h2 className="font-headline-lg text-text-primary mt-1">
                Purpose-Built Views for Doctors, Staff &amp; Patients
              </h2>
            </div>
            <span className="font-body-sm text-text-secondary">
              Dedicated permissions across administration, exam rooms, front desk, and patient
              portal.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLATFORM_ROLES.map((r) => (
              <GlassCard key={r.role} className="p-5 flex flex-col justify-between gap-4">
                <div className="space-y-2.5 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="material-symbols-outlined text-clinical-teal text-xl">
                      {r.icon}
                    </span>
                    <span className="font-caption text-text-muted">{r.badge}</span>
                  </div>
                  <h3 className="font-headline-sm text-text-primary">{r.role}</h3>
                  <p className="font-body-sm text-text-secondary">{r.summary}</p>
                </div>
                <ul className="space-y-1.5 pt-3 border-t border-border-subtle font-caption text-text-secondary relative z-10">
                  {r.capabilities.map((cap) => (
                    <li key={cap} className="flex items-start gap-1.5">
                      <span className="material-symbols-outlined text-xs text-clinical-teal mt-0.5">
                        check
                      </span>
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Comprehensive Contact Hub (4 Contact Areas + Validated Contact Form with Check-Mark Animations) */}
      {siteReview ? <ReviewContact id="section-contact" /> : <ContactHubSection onNotify={onNotify} />}
    </div>
  );
};
