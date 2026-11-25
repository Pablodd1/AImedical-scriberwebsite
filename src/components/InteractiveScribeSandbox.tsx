import React, { useRef, useState } from 'react';
import { GlassCard } from './GlassCard';

export type SandboxMode = 'scribe' | 'billing' | 'video';

interface InteractiveScribeSandboxProps {
  initialMode?: SandboxMode;
  onNotify: (msg: string) => void;
  onRequestWalkthrough: (prefillMessage?: string) => void;
}

interface ClinicalPreset {
  id: string;
  label: string;
  specialty: string;
  transcript: string;
  subjective: string;
  objective: string;
  assessment: string;
  performedToday: string;
  plannedFuture: string;
  icd10: Array<{ code: string; desc: string }>;
  cpt: Array<{ code: string; modifier?: string; desc: string; charge: number }>;
  auditNotes: string[];
}

const CLINICAL_PRESETS: ClinicalPreset[] = [
  {
    id: 'chiro-mva',
    label: 'Chiropractic / Spine MVA',
    specialty: 'Chiropractic & Physical Medicine',
    transcript:
      'Dr. Draesel: 46yo female 3 weeks post-MVA broadside impact at 35 mph. Severe neck pain (8/10) radiating to left thumb/index finger (C6) and low back pain (7/10). Sitting limited to 20 min. Exam: BP 128/82. Cervical flexion 28 deg (44% deficit), extension 18 deg (70% deficit). Spurling test positive left, SLR positive left at 40 deg. Subluxations at C2-C3, C5-C6, T4-T6, L4-L5, and left SI joint. Performed today: 30-min E/M evaluation (99214-25), CMT 4 regions (98941), 15-min manual therapy (97140), 15-min EMS/cryo (97014). Plan: Order Cervical MRI without contrast, care plan 3x/wk for 4 weeks, re-eval at visit 12.',
    subjective:
      '46-year-old female presents 3 weeks post-MVA (35 mph driver-side broadside collision, seatbelt worn). Reports 8/10 cervical pain radiating into left C6 dermatome (thumb/index finger) and 7/10 lumbosacral pain. Functional ADL deficit: unable to sit at workstation > 20 minutes or lift > 10 lbs; sleep disrupted 3–4x/night.',
    objective:
      'Vitals: BP 128/82 mmHg, HR 74 bpm. Guarded cervical posture, antalgic gait. Dual-inclinometer ROM: Cervical flexion 28° (normal 50°, 44% deficit), extension 18° (normal 60°, 70% deficit), left rotation 32° (60% deficit, reproduces C6 numbness); Lumbar flexion 38° (37% deficit). Positive left Spurling’s test and left SLR at 40°. Segmental dysfunction palpitated at C2–C3, C5–C6, T4–T6, L4–L5, and left SI joint.',
    assessment:
      '1. Acute cervical sprain/whiplash (S13.4XXA). 2. Left cervical radiculopathy at C6 (M54.12). 3. Segmental and somatic dysfunction of cervical, thoracic, lumbar, and pelvic regions (M99.01, M99.02, M99.03, M99.05). 4. Lumbago with left sciatica (M54.42). Direct causal link to MVA.',
    performedToday:
      '• Detailed E/M exam & medical decision-making (99214-25)\n• Chiropractic manipulative treatment (CMT) to 4 spinal regions: cervical, thoracic, lumbar, pelvic (98941)\n• Manual myofascial release therapy, 15 minutes (97140)\n• Attended electrical muscle stimulation & cryotherapy, 15 minutes (97014)\n• Ergonomic and red-flag return precaution counseling',
    plannedFuture:
      '• Order MRI Cervical Spine without contrast (72141) to evaluate C5–C6 nerve root\n• Active care frequency: 3 visits/week for 4 weeks\n• Formal functional re-evaluation & repeat inclinometer ROM at Visit 12',
    icd10: [
      { code: 'S13.4XXA', desc: 'Sprain of ligaments of cervical spine, initial encounter' },
      { code: 'M54.12', desc: 'Radiculopathy, cervical region' },
      { code: 'M99.01', desc: 'Segmental and somatic dysfunction of cervical region' },
      { code: 'M99.02', desc: 'Segmental and somatic dysfunction of thoracic region' },
      { code: 'M99.03', desc: 'Segmental and somatic dysfunction of lumbar region' },
      { code: 'M54.42', desc: 'Lumbago with sciatica, left side' },
    ],
    cpt: [
      { code: '99214', modifier: '25', desc: 'Detailed E/M office visit (separately identifiable)', charge: 165 },
      { code: '98941', desc: 'Chiropractic manipulative treatment (CMT), 3–4 spinal regions', charge: 85 },
      { code: '97140', modifier: '59', desc: 'Manual therapy techniques (myofascial release), 15 min', charge: 65 },
      { code: '97014', desc: 'Electrical muscle stimulation modality, 15 min', charge: 45 },
    ],
    auditNotes: [
      'PASS: CPT 98941 substantiated by 4 documented spinal regions (Cervical, Thoracic, Lumbar, Pelvic) and M99.01–M99.03 pairing.',
      'PASS: Modifier -25 on 99214 supported by distinct cognitive trauma workup and MRI ordering rationale.',
      'PASS: Performed Today vs. Planned/Future orders strictly segregated (MRI order kept out of today’s billed procedures).',
    ],
  },
  {
    id: 'primary-care',
    label: 'Primary Care / Internal Med',
    specialty: 'Primary Care & Chronic Care Management',
    transcript:
      'Provider: 58yo male here for 3-month follow-up of Type 2 Diabetes and essential hypertension. Taking Metformin 1000mg BID and Lisinopril 20mg daily. Home BP log averages 126/78. Fasting glucose 118, today HbA1c improved from 7.4% to 6.6%. Denies chest pain, dyspnea, foot numbness, or hypoglycemia. Exam: BP 124/76, HR 68, lungs clear, monofilament foot exam intact bilaterally, no pedal edema. Performed today: 25-min chronic care E/M reconciliation (99214), point-of-care HbA1c review. Plan: Continue Metformin 1000mg BID and Lisinopril 20mg daily, order annual lipid panel & urine microalbumin for next visit in 3 months.',
    subjective:
      '58-year-old male presents for 3-month longitudinal follow-up of Type 2 Diabetes Mellitus and essential hypertension. Compliant with Metformin 1000 mg BID and Lisinopril 20 mg daily. Home blood pressure logs average 126/78 mmHg. Denies polyuria, polydipsia, hypoglycemic episodes, chest pain, dyspnea, visual changes, or peripheral paresthesias.',
    objective:
      'Vitals: BP 124/76 mmHg, HR 68 bpm, BMI 27.1. Cardiovascular: Regular rate and rhythm, no murmurs, no lower extremity edema. Respiratory: Lungs clear to auscultation bilaterally. Neurological/Foot exam: 10-g monofilament sensation intact bilaterally; dorsalis pedis pulses 2+ symmetric. Lab review: HbA1c improved from 7.4% to 6.6%.',
    assessment:
      '1. Type 2 diabetes mellitus without complications, controlled (E11.9). 2. Essential (primary) hypertension, at goal (I10). 3. Long-term current use of oral hypoglycemic drugs (Z79.84).',
    performedToday:
      '• Outpatient E/M chronic condition evaluation & medication reconciliation (99214)\n• Ongoing longitudinal complex chronic care add-on (G2211)\n• Diabetic monofilament foot screening & blood pressure log review\n• Glycemic nutrition and cardiovascular risk counseling',
    plannedFuture:
      '• Continue Metformin 1000 mg PO BID and Lisinopril 20 mg PO daily\n• Order fasting lipid panel and urine albumin-to-creatinine ratio prior to next visit\n• Follow-up appointment in 3 months',
    icd10: [
      { code: 'E11.9', desc: 'Type 2 diabetes mellitus without complications' },
      { code: 'I10', desc: 'Essential (primary) hypertension' },
      { code: 'Z79.84', desc: 'Long-term (current) use of oral hypoglycemic drugs' },
    ],
    cpt: [
      { code: '99214', desc: 'Established patient office visit, moderate MDM (2 stable/improving chronic illnesses)', charge: 165 },
      { code: 'G2211', desc: 'Visit complexity inherent to longitudinal primary medical care', charge: 35 },
    ],
    auditNotes: [
      'PASS: CPT 99214 substantiated by management of 2 chronic illnesses with prescription drug management.',
      'PASS: Future lab orders (lipid panel, microalbumin) separated from today’s performed services.',
    ],
  },
  {
    id: 'ortho-pain',
    label: 'Ortho & Pain Management',
    specialty: 'Interventional Pain & Orthopedics',
    transcript:
      'Provider: 62yo female with right knee medial compartment osteoarthritis, pain 7/10 walking stairs, failed 6 weeks of NSAIDs and physical therapy. Exam: Right knee mild effusion, medial joint line tenderness, flexion 105 deg, McMurray negative, stable Lachman. Informed consent signed today. Performed right knee intra-articular corticosteroid injection under ultrasound guidance using 40mg Kenalog and 2mL 1% lidocaine via superolateral approach without complication. Patient tolerated well, post-procedure pain 2/10. Plan: Rest 24 hours, resume physical therapy in 5 days, follow up in 4 weeks.',
    subjective:
      '62-year-old female presents with refractory right knee pain rated 7/10, worse when climbing stairs and weight-bearing. Conservative care including 6 weeks of physical therapy and oral NSAIDs provided inadequate relief.',
    objective:
      'Right knee examination: Mild suprapatellar effusion, localized tenderness along the medial joint line, active flexion restricted to 105° with crepitus. Negative McMurray, stable varus/valgus and Lachman testing. Distal neurovascular status intact.',
    assessment:
      '1. Unilateral primary osteoarthritis, right knee (M17.11). 2. Chronic pain due to trauma/degenerative joint disease (G89.29).',
    performedToday:
      '• Focused orthopedic evaluation confirming failure of conservative therapy (99213-25)\n• Signed procedural consent for right knee arthrocentesis/injection\n• Right knee major joint intra-articular injection (40 mg Triamcinolone + 2 mL 1% Lidocaine) under real-time ultrasound guidance with permanent image recording (20611)\n• Post-injection observation: immediate pain reduction to 2/10, zero complications',
    plannedFuture:
      '• Relative joint rest for 24–48 hours; ice 15 minutes PRN\n• Resume low-impact quadriceps strengthening PT in 5 days\n• Follow-up clinical re-evaluation in 4 weeks',
    icd10: [
      { code: 'M17.11', desc: 'Unilateral primary osteoarthritis, right knee' },
      { code: 'G89.29', desc: 'Other chronic pain' },
    ],
    cpt: [
      { code: '99213', modifier: '25', desc: 'Established patient evaluation prior to procedure', charge: 120 },
      { code: '20611', modifier: 'RT', desc: 'Arthrocentesis/injection, major joint or bursa, with ultrasound guidance', charge: 240 },
      { code: 'J3301', desc: 'Injection, triamcinolone acetonide (Kenalog), 40 mg', charge: 28 },
    ],
    auditNotes: [
      'PASS: CPT 20611 includes ultrasound guidance and permanent image documentation note; laterality modifier -RT applied.',
      'PASS: Medical necessity for joint injection substantiated by documented failure of 6 weeks PT + NSAIDs.',
    ],
  },
];

const VIDEO_CHAPTERS = [
  { start: 0, end: 4, label: '01. Smart Intake & Visual OCR', desc: 'Spoken/mobile 33-question intake & insurance card OCR extraction.' },
  { start: 4, end: 8, label: '02. Ambient AI Medical Scribe', desc: 'Hands-free conversation listening & structured SOAP drafting.' },
  { start: 8, end: 12, label: '03. Clinical Review & Coding', desc: 'Verify draft against transcript, check ICD-10/CPT & Modifier -25.' },
  { start: 12, end: 16, label: '04. AI Billing & Office Ally', desc: 'Pre-sign compliance scrub & 837P electronic claim handoff.' },
];

function synthesizeCustomTranscript(raw: string): ClinicalPreset {
  const lower = raw.toLowerCase();
  const hasCervical = /neck|cervical|spurling|c5|c6/i.test(raw);
  const hasLumbar = /lumbar|low back|sciatica|slr|l4|l5/i.test(raw);
  const hasKnee = /knee|meniscus|osteoarthritis|effusion/i.test(raw);

  const icd10: Array<{ code: string; desc: string }> = [];
  const cpt: Array<{ code: string; modifier?: string; desc: string; charge: number }> = [
    { code: '99214', modifier: '25', desc: 'Outpatient E/M visit with moderate-to-high MDM', charge: 165 },
  ];

  if (hasCervical) {
    icd10.push({ code: 'M54.12', desc: 'Radiculopathy, cervical region' });
    icd10.push({ code: 'M99.01', desc: 'Segmental and somatic dysfunction of cervical region' });
  }
  if (hasLumbar) {
    icd10.push({ code: 'M54.50', desc: 'Low back pain, unspecified' });
    icd10.push({ code: 'M99.03', desc: 'Segmental and somatic dysfunction of lumbar region' });
  }
  if (hasKnee) {
    icd10.push({ code: 'M17.11', desc: 'Primary osteoarthritis, knee' });
  }
  if (icd10.length === 0) {
    icd10.push({ code: 'R52', desc: 'Pain, unspecified (extracted from custom consultation note)' });
  }

  if (/adjust|cmt|manipulat|sublux/i.test(lower)) {
    cpt.push({
      code: hasCervical && hasLumbar ? '98941' : '98940',
      desc: hasCervical && hasLumbar ? 'CMT spinal manipulation, 3–4 regions' : 'CMT spinal manipulation, 1–2 regions',
      charge: hasCervical && hasLumbar ? 85 : 65,
    });
  }
  if (/manual therapy|myofascial|trigger point/i.test(lower)) {
    cpt.push({ code: '97140', modifier: '59', desc: 'Manual therapy techniques, 15 minutes', charge: 65 });
  }
  if (/ems|estim|traction|ultrasound|cryo/i.test(lower)) {
    cpt.push({ code: '97014', desc: 'Attended electrical stimulation / physical modality', charge: 45 });
  }

  return {
    id: 'custom',
    label: 'Custom Consultation Note',
    specialty: 'Custom Sandbox Encounter',
    transcript: raw,
    subjective: `Extracted from custom transcript: ${raw.slice(0, 260)}${raw.length > 260 ? '…' : ''}`,
    objective:
      'Structured physical examination findings parsed from encounter dictation. Vital signs, regional palpation, range-of-motion measurements, and provocative maneuvers indexed for coding verification.',
    assessment: icd10.map((d, i) => `${i + 1}. ${d.desc} (${d.code})`).join('; '),
    performedToday: cpt.map((c) => `• ${c.desc} (CPT ${c.code}${c.modifier ? '-' + c.modifier : ''})`).join('\n'),
    plannedFuture:
      '• Follow-up clinical re-evaluation per care plan\n• Any diagnostic imaging or referrals mentioned in transcript segregated from today’s billed procedures',
    icd10,
    cpt,
    auditNotes: [
      'PASS: Custom encounter parsed into Subjective, Objective, Assessment, Performed Today, and Planned/Future.',
      'PASS: Suggested ICD-10 and CPT codes linked with Modifier -25 evaluation check.',
    ],
  };
}

export const InteractiveScribeSandbox: React.FC<InteractiveScribeSandboxProps> = ({
  initialMode = 'scribe',
  onNotify,
  onRequestWalkthrough,
}) => {
  const [activeMode, setActiveMode] = useState<SandboxMode>(initialMode);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(CLINICAL_PRESETS[0].id);
  const [transcriptInput, setTranscriptInput] = useState<string>(CLINICAL_PRESETS[0].transcript);
  const [activeNote, setActiveNote] = useState<ClinicalPreset>(CLINICAL_PRESETS[0]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [includeMod25, setIncludeMod25] = useState<boolean>(true);
  const [claimScrubbed, setClaimScrubbed] = useState<boolean>(false);
  const [show837p, setShow837p] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoTime, setVideoTime] = useState<number>(0);

  const handleSelectPreset = (preset: ClinicalPreset) => {
    setSelectedPresetId(preset.id);
    setTranscriptInput(preset.transcript);
    setActiveNote(preset);
    setClaimScrubbed(false);
    onNotify(`Loaded sample encounter: ${preset.label}`);
  };

  const handleRunSimulator = () => {
    setIsGenerating(true);
    setClaimScrubbed(false);
    setTimeout(() => {
      const matched = CLINICAL_PRESETS.find((p) => p.transcript.trim() === transcriptInput.trim());
      if (matched) {
        setActiveNote(matched);
      } else {
        setActiveNote(synthesizeCustomTranscript(transcriptInput));
      }
      setIsGenerating(false);
      onNotify('Draft SOAP note, Performed vs. Planned separation & ICD-10/CPT codes generated');
    }, 450);
  };

  const handleSeekVideo = (seconds: number, label: string) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
    setVideoTime(seconds);
    onNotify(`Playing walkthrough chapter: ${label}`);
  };

  const totalCharge = activeNote.cpt.reduce((sum, item) => sum + item.charge, 0);
  const hasProceduralAndEm = activeNote.cpt.length > 1 && activeNote.cpt.some((c) => /^992/.test(c.code));
  const mod25Warning = hasProceduralAndEm && !includeMod25;

  return (
    <section
      id="section-sandbox"
      aria-labelledby="sandbox-heading"
      className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-10 sm:px-8"
    >
      <div className="flex flex-col gap-6">
        {/* Header & Mode Switcher */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <span className="font-caption font-semibold text-clinical-teal">
              Interactive Browser Sandbox &amp; Recorded Product Walkthrough
            </span>
            <h2 id="sandbox-heading" className="font-headline-lg text-text-primary mt-1">
              Try the Scribe Simulator, Test AI Billing Live, or Watch the Walkthrough
            </h2>
            <p className="font-body-md text-text-secondary max-w-3xl mt-1">
              Test how AIMS turns a clinical consultation into a structured SOAP note, separates procedures performed today from future orders, and scrubs an 837P claim—right here in your browser with no login required.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Interactive demo modes"
            className="inline-flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-surface-canvas border border-border-subtle self-start"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === 'scribe'}
              onClick={() => setActiveMode('scribe')}
              className={`px-4 py-2 rounded-xl font-body-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                activeMode === 'scribe'
                  ? 'bg-clinical-teal text-on-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-base">mic</span>
              <span>1. Try Scribe Simulator</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeMode === 'billing'}
              onClick={() => setActiveMode('billing')}
              className={`px-4 py-2 rounded-xl font-body-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                activeMode === 'billing'
                  ? 'bg-clinical-teal text-on-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-base">receipt_long</span>
              <span>2. Interactive AI Billing Demo</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeMode === 'video'}
              onClick={() => setActiveMode('video')}
              className={`px-4 py-2 rounded-xl font-body-sm font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                activeMode === 'video'
                  ? 'bg-clinical-teal text-on-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-base">smart_display</span>
              <span>3. Recorded Walkthrough Video</span>
            </button>
          </div>
        </div>

        {/* MODE 1: INTERACTIVE SCRIBE SIMULATOR */}
        {activeMode === 'scribe' && (
          <GlassCard interactive={false} className="p-5 sm:p-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
              <div>
                <div className="font-caption font-semibold text-clinical-teal">
                  Patientless Scribe Simulator · Master Clinical Prompt v2
                </div>
                <h3 className="font-headline-md text-text-primary mt-0.5">
                  Select a sample consultation or type your own clinical dictation
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {CLINICAL_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-3 py-1.5 rounded-lg font-caption font-semibold border transition-colors cursor-pointer ${
                      selectedPresetId === preset.id
                        ? 'bg-clinical-teal text-on-primary border-clinical-teal'
                        : 'bg-surface-canvas text-text-secondary border-border-subtle hover:text-text-primary'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Editable Transcript Input */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <label
                    htmlFor="simulator-transcript-input"
                    className="font-section-title text-text-primary block"
                  >
                    Consultation Transcript / Dictation Input
                  </label>
                  <p className="font-caption text-text-secondary">
                    Edit the transcript below or paste a sample de-identified visit note, then click{' '}
                    <strong>Generate Draft SOAP &amp; Codes</strong>.
                  </p>
                  <textarea
                    id="simulator-transcript-input"
                    rows={10}
                    value={transcriptInput}
                    onChange={(e) => {
                      setTranscriptInput(e.target.value);
                      setSelectedPresetId('custom');
                    }}
                    placeholder="Type or paste a sample consultation transcript here..."
                    className="w-full p-3.5 rounded-xl bg-surface-canvas border border-border-subtle font-body-sm text-text-primary leading-relaxed focus:outline-none focus:ring-2 focus:ring-clinical-teal"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleRunSimulator}
                    disabled={isGenerating || !transcriptInput.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-clinical-teal hover:bg-primary-container text-on-primary font-body-md font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-lg">auto_fix_high</span>
                    <span>
                      {isGenerating ? 'Generating SOAP & Codes…' : 'Generate Draft SOAP & Codes'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveMode('billing')}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surface-canvas hover:bg-clinical-teal-subtle border border-border-subtle text-clinical-teal font-body-sm font-semibold transition-colors cursor-pointer"
                  >
                    <span>Send Draft to AI Billing Live →</span>
                  </button>
                </div>
              </div>

              {/* Right: Structured SOAP Output + Performed Today vs Planned Future + Codes */}
              <div className="lg:col-span-7 bg-surface-canvas rounded-2xl border border-border-subtle p-5 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border-subtle">
                  <span className="font-section-title text-text-primary">
                    Generated Clinical Note ({activeNote.specialty})
                  </span>
                  <span className="font-code-badge text-alert-success">
                    Anti-Hallucination Segregation Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-body-sm">
                  <div className="p-3.5 rounded-xl bg-surface-panel border border-border-subtle">
                    <div className="font-code-badge text-clinical-teal font-bold mb-1">
                      SUBJECTIVE (HPI &amp; ADL IMPACT)
                    </div>
                    <p className="text-text-secondary leading-relaxed">{activeNote.subjective}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-panel border border-border-subtle">
                    <div className="font-code-badge text-clinical-teal font-bold mb-1">
                      OBJECTIVE (EXAM &amp; QUANTIFIED ROM)
                    </div>
                    <p className="text-text-secondary leading-relaxed">{activeNote.objective}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-panel border border-border-subtle font-body-sm">
                  <div className="font-code-badge text-clinical-teal font-bold mb-1">
                    ASSESSMENT &amp; DIFFERENTIAL REASONING
                  </div>
                  <p className="text-text-secondary leading-relaxed">{activeNote.assessment}</p>
                </div>

                {/* Performed Today vs Planned Future */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-body-sm">
                  <div className="p-3.5 rounded-xl bg-clinical-teal-subtle border border-clinical-teal/30">
                    <div className="font-code-badge text-clinical-teal font-bold mb-1">
                      PERFORMED TODAY (PRESENT — BILLED TODAY)
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-text-primary text-xs leading-relaxed">
                      {activeNote.performedToday}
                    </pre>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-panel border border-border-subtle">
                    <div className="font-code-badge text-text-primary font-bold mb-1">
                      PLANNED / FUTURE (NOT YET DONE — EXCLUDED FROM CLAIM)
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-text-secondary text-xs leading-relaxed">
                      {activeNote.plannedFuture}
                    </pre>
                  </div>
                </div>

                {/* Extracted Codes */}
                <div className="pt-2 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {activeNote.icd10.map((dx) => (
                      <span
                        key={dx.code}
                        title={dx.desc}
                        className="font-code-badge px-2.5 py-1 rounded-md bg-surface-panel border border-border-subtle text-text-primary"
                      >
                        ICD-10: {dx.code}
                      </span>
                    ))}
                    {activeNote.cpt.map((c) => (
                      <span
                        key={c.code}
                        title={c.desc}
                        className="font-code-badge px-2.5 py-1 rounded-md bg-clinical-teal text-on-primary font-semibold"
                      >
                        CPT: {c.code}
                        {c.modifier ? `-${c.modifier}` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* MODE 2: INTERACTIVE AI BILLING & OFFICE ALLY CLAIM SCRUBBER */}
        {activeMode === 'billing' && (
          <GlassCard interactive={false} className="p-5 sm:p-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
              <div>
                <div className="font-caption font-semibold text-clinical-teal">
                  Interactive AI Medical Billing &amp; Office Ally 837P Scrubber Demo
                </div>
                <h3 className="font-headline-md text-text-primary mt-0.5">
                  Test Pre-Sign Coding Rules, Modifier -25 Validation &amp; 837P Claim Generation
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {CLINICAL_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-3 py-1.5 rounded-lg font-caption font-semibold border transition-colors cursor-pointer ${
                      selectedPresetId === preset.id
                        ? 'bg-clinical-teal text-on-primary border-clinical-teal'
                        : 'bg-surface-canvas text-text-secondary border-border-subtle hover:text-text-primary'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Superbill Line Items & Modifier -25 Interactive Toggle */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-section-title text-text-primary">
                      Superbill Line Items &amp; Diagnosis Pointers
                    </span>
                    <label className="inline-flex items-center gap-2 font-caption font-semibold text-text-primary cursor-pointer bg-surface-canvas px-3 py-1.5 rounded-lg border border-border-subtle">
                      <input
                        type="checkbox"
                        checked={includeMod25}
                        onChange={(e) => {
                          setIncludeMod25(e.target.checked);
                          setClaimScrubbed(false);
                        }}
                        className="accent-teal-600"
                      />
                      <span>Include Modifier -25 on E/M Code (Test Audit Rule)</span>
                    </label>
                  </div>

                  <div className="space-y-2.5">
                    {activeNote.cpt.map((item, idx) => {
                      const effectiveMod =
                        item.modifier === '25' ? (includeMod25 ? '25' : undefined) : item.modifier;
                      return (
                        <div
                          key={item.code + idx}
                          className="p-3.5 rounded-xl bg-surface-canvas border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-code-clinical font-bold text-clinical-teal">
                                CPT {item.code}
                                {effectiveMod ? `-${effectiveMod}` : ''}
                              </span>
                              <span className="font-caption text-text-muted">
                                · Dx Pointer: {activeNote.icd10[0]?.code || 'A'}
                              </span>
                            </div>
                            <div className="font-body-sm text-text-primary mt-0.5">{item.desc}</div>
                          </div>
                          <div className="font-code-clinical font-semibold text-text-primary">
                            ${item.charge.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-canvas border border-border-subtle flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-caption text-text-muted">Total Sample Claim Charge</div>
                    <div className="font-headline-md text-text-primary tabular-nums">
                      ${totalCharge.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShow837p((v) => !v)}
                      className="px-3.5 py-2 rounded-xl bg-surface-panel border border-border-subtle font-body-sm font-semibold text-text-primary hover:border-clinical-teal cursor-pointer"
                    >
                      {show837p ? 'Hide 837P EDI Payload' : 'Inspect 837P EDI Payload'}
                    </button>

                    <button
                      type="button"
                      disabled={mod25Warning}
                      onClick={() => {
                        setClaimScrubbed(true);
                        onNotify('Sample 837P claim scrubbed and validated for Office Ally');
                      }}
                      className="px-4 py-2 rounded-xl bg-clinical-teal hover:bg-primary-container text-on-primary font-body-sm font-semibold cursor-pointer disabled:opacity-50"
                    >
                      {claimScrubbed ? '✓ Claim Scrubbed & Ready' : 'Run Pre-Sign Billing Scrub'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Deterministic Pre-Sign Audit Output & 837P Preview */}
              <div className="lg:col-span-5 bg-surface-canvas rounded-2xl border border-border-subtle p-5 flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                    <span className="font-section-title text-text-primary">
                      Pre-Sign Billing Compliance Auditor
                    </span>
                    <span
                      className={`font-code-badge ${
                        mod25Warning ? 'text-alert-critical' : 'text-alert-success'
                      }`}
                    >
                      {mod25Warning ? '1 Audit Hold Flagged' : '0 Clawback Risks'}
                    </span>
                  </div>

                  {mod25Warning ? (
                    <div
                      role="alert"
                      className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-text-primary font-body-sm space-y-1.5"
                    >
                      <div className="font-semibold text-alert-critical">
                        HOLD: Missing Modifier -25 on Same-Day E/M + Procedure
                      </div>
                      <p className="text-text-secondary text-xs leading-relaxed">
                        CPT {activeNote.cpt[0].code} is billed alongside a same-day procedure (
                        {activeNote.cpt[1]?.code}). Check &ldquo;Include Modifier -25&rdquo; to
                        attest that a separately identifiable evaluation was documented.
                      </p>
                    </div>
                  ) : null}

                  <ul className="space-y-2 font-body-sm text-text-secondary">
                    {activeNote.auditNotes.map((note) => (
                      <li
                        key={note}
                        className="p-3 rounded-xl bg-surface-panel border border-border-subtle flex items-start gap-2"
                      >
                        <span className="material-symbols-outlined text-sm text-clinical-teal mt-0.5">
                          verified
                        </span>
                        <span className="text-xs leading-relaxed text-text-primary">{note}</span>
                      </li>
                    ))}
                  </ul>

                  {show837p && (
                    <pre className="p-3 rounded-xl bg-slate-950 text-teal-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                      {`ISA*00*          *00*          *ZZ*AIMSEHR        *ZZ*OFFICEALLY     *261125*1200*^*00501*000089410*0*P*:~
CLM*V-89410*${totalCharge.toFixed(2)}***11:B:1*Y*A*Y*Y~
HI*ABK:${activeNote.icd10.map((d) => d.code.replace('.', '')).join('*ABF:')}~
${activeNote.cpt
  .map((c, i) => {
    const m = c.modifier === '25' ? (includeMod25 ? ':25' : '') : c.modifier ? `:${c.modifier}` : '';
    return `LX*${i + 1}~\nSV1*HC:${c.code}${m}*${c.charge.toFixed(2)}*UN*1***1~`;
  })
  .join('\n')}`}
                    </pre>
                  )}
                </div>

                <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2 font-caption text-text-muted">
                  <span>Interactive browser simulation (no PHI stored)</span>
                  <button
                    type="button"
                    onClick={() =>
                      onRequestWalkthrough(
                        `Interested in the AI Medical Billing & Office Ally 837P workflow (${activeNote.label}).`
                      )
                    }
                    className="text-clinical-teal font-semibold hover:underline cursor-pointer"
                  >
                    Discuss with billing team →
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* MODE 3: RECORDED PRODUCT WALKTHROUGH VIDEO */}
        {activeMode === 'video' && (
          <GlassCard interactive={false} className="p-5 sm:p-8 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-caption font-semibold text-clinical-teal">
                  Recorded Interface Walkthrough · 4 Workflow Chapters
                </div>
                <h3 className="font-headline-md text-text-primary mt-0.5">
                  Watch the Recorded AIMS Product Walkthrough
                </h3>
              </div>
              <span className="font-caption text-text-secondary">
                Click any chapter below to jump directly to that workflow stage
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border-subtle bg-slate-950 shadow-xl">
              <video
                ref={videoRef}
                src="/videos/aims-hero-reel.mp4"
                poster="/videos/aims-hero-poster.jpg"
                controls
                playsInline
                preload="metadata"
                onTimeUpdate={(e) => setVideoTime(e.currentTarget.currentTime)}
                className="w-full max-h-[520px] object-contain bg-slate-950"
              >
                Your browser does not support embedded MP4 video.
              </video>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {VIDEO_CHAPTERS.map((chap) => {
                const isCurrent = videoTime >= chap.start && videoTime < chap.end;
                return (
                  <button
                    key={chap.label}
                    type="button"
                    onClick={() => handleSeekVideo(chap.start, chap.label)}
                    className={`p-4 rounded-xl border text-left transition-colors cursor-pointer flex flex-col justify-between gap-2 ${
                      isCurrent
                        ? 'bg-clinical-teal-subtle border-clinical-teal text-text-primary'
                        : 'bg-surface-canvas border-border-subtle hover:bg-surface-panel text-text-secondary'
                    }`}
                  >
                    <div>
                      <div className="font-section-title text-clinical-teal">{chap.label}</div>
                      <p className="font-caption text-text-secondary mt-1">{chap.desc}</p>
                    </div>
                    <span className="font-code-clinical text-xs text-text-muted">
                      Jump to 0:0{chap.start}s →
                    </span>
                  </button>
                );
              })}
            </div>
          </GlassCard>
        )}

        {/* Honest Sandbox & Live Walkthrough Disclosure Banner */}
        <div className="rounded-2xl bg-surface-panel border border-border-subtle p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="font-section-title text-text-primary">
              Want a dedicated multi-user sandbox on our live EHR or a 1-on-1 walkthrough?
            </div>
            <p className="font-body-sm text-text-secondary">
              You can test the interactive Scribe Simulator, AI Billing Scrubber, and recorded walkthrough video right above. To keep clinical workspaces isolated, dedicated clinic sandbox accounts and live walkthroughs are scheduled after you send a request—we&rsquo;ll reply directly to agree on a time.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              onRequestWalkthrough(
                'Please provision a dedicated clinic sandbox and let us agree on a walkthrough time.'
              )
            }
            className="px-4 py-2.5 rounded-xl bg-clinical-teal hover:bg-primary-container text-on-primary font-body-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            Request Walkthrough &amp; Sandbox
          </button>
        </div>
      </div>
    </section>
  );
};
