export interface SubnodeService {
  node: string;
  description: string;
  port: string;
  securityNote: string;
}

export const SYSTEM_SUBNODES: SubnodeService[] = [
  {
    node: 'Ambient AI Medical Scribe',
    description:
      'Captures natural doctor-patient conversations in real time, pairing live transcription with a mid-visit clinical assistant and structured SOAP note synthesis.',
    port: 'Real-Time Scribe',
    securityNote: 'HIPAA-Conscious Privacy',
  },
  {
    node: 'Unified Clinical EHR',
    description:
      'Centralizes longitudinal patient charts, scheduling, clinical notes, lab trends, imaging documents, digital consents, and provider e-signatures.',
    port: 'Core EHR Suite',
    securityNote: 'Role-Based Clinic Access',
  },
  {
    node: 'Smart Intake & Visual OCR',
    description:
      '33-question spoken and digital patient intake in English, Spanish, and Haitian Kreyòl paired with visual OCR extraction for photo IDs, insurance cards, and referrals.',
    port: 'Voice & Visual AI',
    securityNote: 'Encrypted Intake Capture',
  },
  {
    node: 'Multi-Agent Clinical Review',
    description:
      'Dual-Agent Builder + Reviewer verification and a 5-Agent Specialist Consensus Board auditing clinical accuracy, red-flag safety, and medical necessity.',
    port: '2-Agent & 5-Agent AI',
    securityNote: 'Transcript-Grounded Audit',
  },
  {
    node: 'AI Medical Coding & Encoding',
    description:
      'Automatically extracts clinical entities and maps exam findings to specificity-verified ICD-10 diagnosis codes, CPT procedure codes, and billing modifiers.',
    port: '15,716 Coding Rules',
    securityNote: 'Pre-Claim Accuracy Check',
  },
  {
    node: 'AI Medical Billing & Office Ally',
    description:
      'Generates clean superbills, scrubs claims for medical necessity, tracks patient balances, and integrates directly with Office Ally for seamless claim submission and ERA sync.',
    port: 'Office Ally Sync',
    securityNote: 'Verified Claim Scrubbing',
  },
  {
    node: 'Self-Service Patient Portal',
    description:
      'Dedicated patient experience for online appointment booking, browser-based telehealth visits, intake completion, visit summaries, and statement payments.',
    port: 'Patient & Telehealth',
    securityNote: 'Isolated Patient Access',
  },
  {
    node: 'Automated Clinic Operations',
    description:
      'Delivers morning provider schedule briefings, 24-hour and 2-hour appointment reminders, digital lobby check-in sync, and 24/7 virtual phone reception.',
    port: '24/7 AI Operations',
    securityNote: 'Audit-Logged Workflows',
  },
];

export interface PlatformRole {
  role: string;
  badge: string;
  icon: string;
  summary: string;
  capabilities: string[];
}

export const PLATFORM_ROLES: PlatformRole[] = [
  {
    role: 'Clinic Owner & Billing Lead',
    badge: 'Operations · Office Ally',
    icon: 'admin_panel_settings',
    summary: 'Complete visibility across multi-provider schedules, AI medical billing, and Office Ally claim lifecycles.',
    capabilities: [
      'Manage providers, front-desk staff, custom intake forms, and specialty SOAP templates',
      'Monitor AI medical billing analytics, clean-claim rates, and Office Ally clearinghouse status',
      'Configure automated reminders, digital consent forms, and clinic-wide AI preferences',
    ],
  },
  {
    role: 'Doctor & Provider',
    badge: 'AI Scribe · EHR',
    icon: 'stethoscope',
    summary: 'Hands-free ambient scribing, multi-agent clinical review, medical encoding, and one-click sign-off.',
    capabilities: [
      'Ambient AI Medical Scribe, Dual-Agent SOAP verification, and 5-Agent Specialist Consensus',
      'Longitudinal patient chart, biomarker trends, visual lab review, and range-of-motion tracking',
      'Automated ICD-10 / CPT medical encoding, red-flag safety checks, and one-click e-signature',
    ],
  },
  {
    role: 'Front Desk & Care Coordinator',
    badge: 'Intake · Visual OCR',
    icon: 'concierge',
    summary: 'Effortless patient registration, visual insurance OCR extraction, arrival tracking, and checkout.',
    capabilities: [
      'One-click walk-in registration, lobby check-in board, and instant visual ID / insurance OCR',
      'Month and week appointment scheduling with automated 24h & 2h patient confirmations',
      'Superbill review, patient copay collection, and Office Ally billing queue coordination',
    ],
  },
  {
    role: 'Patient (Self-Service)',
    badge: 'Portal · Telehealth',
    icon: 'person_check',
    summary: 'Mobile-friendly self-service portal for spoken intake, virtual care, records, and statements.',
    capabilities: [
      'Complete the 33-question spoken or digital intake form in English, Spanish, or Haitian Kreyòl',
      'Book appointments online, join browser telehealth visits, and upload insurance card photos',
      'Review signed visit handouts, lab summaries, digital consents, and clinic statements',
    ],
  },
];

export interface EhrModuleSpec {
  id: string;
  number: string;
  title: string;
  icon: string;
  routes: string[];
  summary: string;
  details: string[];
  apis: string[];
}

export const CORE_EHR_MODULES: EhrModuleSpec[] = [
  {
    id: 'dashboard',
    number: '01',
    title: 'Clinic Command Dashboard',
    icon: 'space_dashboard',
    routes: ['Command View'],
    summary: 'Real-time overview of today’s arrivals, provider schedules, unsigned notes, and billing queues.',
    details: [
      'Displays live patient arrivals, daily appointment progress, and recent clinical encounters in one glance.',
      'One-click launchpad into check-in, ambient AI scribing, visual OCR uploads, and Office Ally claim queues.',
    ],
    apis: ['Live Arrival Board', 'Daily Schedule', 'Unsigned Notes', 'Billing Queue'],
  },
  {
    id: 'patients',
    number: '02',
    title: 'Patient Registry & Instant Lookup',
    icon: 'group_add',
    routes: ['Patient Registry'],
    summary: 'Comprehensive patient directory with 5-way instant search, walk-in registration, and CSV onboarding.',
    details: [
      'Register walk-in patients in seconds or populate full demographics automatically from visual ID & insurance OCR.',
      'Search across name, chart ID, date of birth, phone, or active care status with bulk CSV import and export.',
    ],
    apis: ['5-Way Instant Search', 'Walk-In Registration', 'Visual ID Auto-Fill', 'CSV Onboarding'],
  },
  {
    id: 'chart',
    number: '03',
    title: 'Longitudinal Patient Chart (EHR)',
    icon: 'clinical_notes',
    routes: ['Unified Chart'],
    summary: 'Single unified chart uniting demographics, SOAP history, labs, visual scans, consents, and billing.',
    details: [
      'Consolidates every prior SOAP encounter, uploaded imaging report, blood panel trend, consent, and superbill.',
      'Automatically tracks distinct clinic visit counts, care-plan milestones, and active clinical alerts.',
    ],
    apis: ['Complete Visit Timeline', 'Problem & Allergy List', 'Visit Counter', 'Care Milestones'],
  },
  {
    id: 'calendar',
    number: '04',
    title: 'Smart Scheduling & Reminders',
    icon: 'calendar_month',
    routes: ['Clinic Calendar'],
    summary: 'Intuitive month and week clinical calendar with status pipelines and automated patient reminders.',
    details: [
      'Track every visit from Scheduled to Checked-In, In-Exam, and Signed without manual status chasing.',
      'Dispatches 24-hour and 2-hour appointment reminders with two-way patient confirmation updates.',
    ],
    apis: ['Multi-Provider Calendar', '24h & 2h Reminders', 'Two-Way Confirmations', 'Waitlist Sync'],
  },
  {
    id: 'visits',
    number: '05',
    title: 'SOAP Notes & Patient Handouts',
    icon: 'description',
    routes: ['Clinical Notes'],
    summary: 'Generate structured SOAP notes from ambient encounters, run re-exams, and export polished reports.',
    details: [
      'Supports initial evaluations, follow-up quick notes, comparative re-exams, and inline physician editing.',
      'Exports formatted clinical PDFs, editable documents, and plain-language patient care handouts in one click.',
    ],
    apis: ['SOAP Synthesis', 'Comparative Re-Exams', 'PDF & Document Export', 'Patient Care Handouts'],
  },
  {
    id: 'signature',
    number: '06',
    title: 'Provider E-Signature & Pre-Sign Audit',
    icon: 'draw',
    routes: ['Sign & Lock'],
    summary: 'One-click digital provider signature gated by an automated AI clinical completeness check.',
    details: [
      'Verifies objective exam findings, diagnosis linkage, and medical coding completeness before locking the chart.',
      'Applies stored provider signatures and countersignatures across encounter notes and patient consent forms.',
    ],
    apis: ['Pre-Sign Completeness Check', 'Digital E-Signature', 'Consent Countersign', 'Audit Trail'],
  },
  {
    id: 'checkin',
    number: '07',
    title: 'Digital Check-In & Lobby Sync',
    icon: 'co_present',
    routes: ['Lobby Arrival'],
    summary: 'Real-time front-desk arrival board connected to tablet lobby kiosks and QR intake forms.',
    details: [
      'Syncs lobby kiosk submissions and mobile QR check-ins directly onto the clinic’s live arrival board.',
      'Attaches nursing vitals, chief complaints, and front-desk intake notes straight to today’s encounter.',
    ],
    apis: ['Kiosk & QR Check-In', 'Waiting Room Tracker', 'Vitals & Triage Notes', 'Reusable Templates'],
  },
  {
    id: 'codes',
    number: '08',
    title: 'AI Medical Coding & Encoding',
    icon: 'fact_check',
    routes: ['Medical Coding'],
    summary: 'Automated ICD-10 diagnosis and CPT procedure encoding backed by 15,716 clinical coding rules.',
    details: [
      'Extracts billable diagnoses, procedures, and required modifiers (-25, -59) directly from clinical documentation.',
      'Includes built-in range-of-motion calculators, custom clinic code favorites, and medical necessity validation.',
    ],
    apis: ['ICD-10 & CPT Encoder', '15,716 Coding Rules', 'Modifier Validation', 'ROM Calculator'],
  },
  {
    id: 'labs',
    number: '09',
    title: 'Labs & Longitudinal Biomarkers',
    icon: 'biotech',
    routes: ['Lab Trends'],
    summary: 'Visual lab report extraction, structured biomarker tracking, and visit-to-visit trend tables.',
    details: [
      'Upload external lab PDFs or images for visual extraction alongside structured biomarker entry.',
      'Visualizes multi-visit trajectories across inflammation, metabolic, and nutritional panels.',
    ],
    apis: ['Visual Lab Extraction', 'Biomarker Trajectories', 'Reference Alerts', 'CSV Export'],
  },
  {
    id: 'documents',
    number: '10',
    title: 'Visual OCR & Clinical Document Vault',
    icon: 'document_scanner',
    routes: ['OCR & Vault'],
    summary: 'Optical character recognition and visual extraction for insurance cards, photo IDs, and referrals.',
    details: [
      'Extracts patient demographics, policy numbers, group IDs, and clinical summaries from photographed cards and forms.',
      'Organizes imaging reports, referrals, and signed records inside a searchable per-patient document vault.',
    ],
    apis: ['Insurance Card OCR', 'Photo ID Extraction', 'Referral Parsing', 'Patient Document Vault'],
  },
  {
    id: 'invoicing',
    number: '11',
    title: 'AI Medical Billing & Office Ally Sync',
    icon: 'receipt_long',
    routes: ['Billing & Claims'],
    summary: 'Automated superbill generation, AI claim scrubbing, patient invoicing, and Office Ally integration.',
    details: [
      'Converts signed SOAP encounters and encoded ICD-10/CPT items into clean claims ready for Office Ally submission.',
      'Tracks insurance reimbursements, ERA remittances, patient copays, and revenue analytics from one screen.',
    ],
    apis: ['Office Ally Integration', 'AI Claim Scrubber', 'Superbill & Invoicing', 'Revenue Analytics'],
  },
  {
    id: 'settings-staff',
    number: '12',
    title: 'Practice Customization & Sandbox',
    icon: 'tune',
    routes: ['Clinic Settings'],
    summary: 'Per-specialty intake builders, custom note templates, role permissions, and staff training sandboxes.',
    details: [
      'Tailor intake questions, specialty exam templates, clinic branding, and multi-agent coding rules.',
      'Spin up safe staff training accounts and patientless scribe simulations so teams onboard with zero friction.',
    ],
    apis: ['Custom Intake Builder', 'Specialty Templates', 'Role Permissions', 'Training Sandbox'],
  },
];

export interface AiToolSpec {
  num: string;
  name: string;
  route: string;
  category: 'Scribe & Agents' | 'Voice & Intake' | 'Coding & Safety' | 'Hub & QA';
  summary: string;
  detail: string;
  api: string;
}

export const AI_TOOLS_CATALOG: AiToolSpec[] = [
  {
    num: '01',
    name: 'Ambient AI Medical Scribe',
    route: '/scribe/',
    category: 'Scribe & Agents',
    summary: 'Side-by-side live encounter transcription and mid-visit AI clinical assistant.',
    detail:
      'Listens naturally to the consultation and drafts structured SOAP notes, ICD-10 diagnoses, CPT codes, red-flag alerts, and follow-up plans—complete with screen wake-lock and a patientless simulator.',
    api: 'Ambient Scribe + SOAP Synthesis',
  },
  {
    num: '02',
    name: 'Dual-Agent Clinical Review',
    route: 'Builder + Reviewer',
    category: 'Scribe & Agents',
    summary: 'Agent 1 drafts the full clinical note; Agent 2 audits coding and medical accuracy.',
    detail:
      'Cross-examines the generated SOAP note against the conversation transcript and clinical coding rules to catch missing exam details, unsupported modifiers, or safety gaps before sign-off.',
    api: 'Two-Agent Clinical Verification',
  },
  {
    num: '03',
    name: 'Five-Agent Consensus Board',
    route: '/monitor/',
    category: 'Scribe & Agents',
    summary: 'Five specialist AI agents evaluating complex multi-system encounters in parallel.',
    detail:
      'Coordinates Clinical Assessment, AI Medical Encoding, Red-Flag Safety, AI Medical Billing Compliance, and 15,716 CPT Knowledge Rules simultaneously during live consultations.',
    api: 'Parallel 5-Agent Consensus',
  },
  {
    num: '04',
    name: 'Multilingual Voice Intake Form',
    route: '/intake/',
    category: 'Voice & Intake',
    summary: '33-question spoken or touch intake in English, Spanish, and Haitian Kreyòl.',
    detail:
      'Patients complete demographics, insurance, medical history, symptoms, and review of systems by speaking naturally. AI extracts structured clinical entities and pre-populates the chart.',
    api: 'Spoken Intake + Entity Extraction',
  },
  {
    num: '05',
    name: 'Pre-Visit Intake Summary',
    route: '/summary/',
    category: 'Voice & Intake',
    summary: 'Instant pre-rooming physician brief highlighting key symptoms and missing items.',
    detail:
      'Condenses completed intake forms and visual OCR uploads into a scannable clinical snapshot before the provider enters the exam room.',
    api: 'Structured Pre-Rooming Brief',
  },
  {
    num: '06',
    name: 'Longitudinal Pre-Consult Scanner',
    route: '/pre-consult/',
    category: 'Scribe & Agents',
    summary: 'Synthesizes prior SOAP notes, lab trajectories, and contraindications before the exam.',
    detail:
      'Reviews historical visits, active diagnoses, and prior treatment outcomes so clinicians walk into every follow-up visit completely prepared.',
    api: 'Longitudinal History Synthesis',
  },
  {
    num: '07',
    name: '60-Second Express Quick-Note',
    route: '/quick-note/',
    category: 'Scribe & Agents',
    summary: 'Rapid follow-up charting path that bypasses new-patient intake steps.',
    detail:
      'Select an existing patient, dictate or capture brief follow-up findings, and generate a compliant, encoded SOAP note in under a minute.',
    api: 'Express Follow-Up Workflow',
  },
  {
    num: '08',
    name: 'Visual OCR & Card Extraction',
    route: 'Visual OCR',
    category: 'Voice & Intake',
    summary: 'Optical character recognition for insurance cards, photo IDs, referrals, and forms.',
    detail:
      'Captures photos or scans of driver’s licenses, payer cards, and paper intake sheets—extracting subscriber IDs, group numbers, and demographics straight into the EHR and Office Ally billing profile.',
    api: 'Visual Document & Card Extraction',
  },
  {
    num: '09',
    name: 'AI Medical Coding & Encoder',
    route: '/dx-cpt-codes/',
    category: 'Coding & Safety',
    summary: 'Automated ICD-10 diagnosis, CPT procedure, and modifier extraction from clinical text.',
    detail:
      'Maps objective exam maneuvers, time, and procedures to high-specificity ICD-10 and CPT codes with supporting medical necessity notes.',
    api: 'Automated ICD-10 & CPT Encoding',
  },
  {
    num: '10',
    name: 'AI Medical Billing & Office Ally Prep',
    route: 'Billing & Claims',
    category: 'Coding & Safety',
    summary: 'Automated claim scrubbing, superbill validation, and Office Ally clearinghouse formatting.',
    detail:
      'Verifies diagnosis-to-procedure pointers, modifier rules, and payer completeness so clean claims flow smoothly into Office Ally.',
    api: 'AI Claim Scrubber + Office Ally',
  },
  {
    num: '11',
    name: 'Clinical Red-Flag Safety Scanner',
    route: '/red-flags/',
    category: 'Coding & Safety',
    summary: 'Real-time symptom and history screening for urgent clinical contraindications.',
    detail:
      'Flags vascular, neurological, orthopedic, or medication contraindications with severity grading before procedures or manual therapy.',
    api: 'Contraindication Safety Engine',
  },
  {
    num: '12',
    name: 'AI Care & Treatment Planner',
    route: '/treatment-plan/',
    category: 'Coding & Safety',
    summary: 'Structured multi-week care schedules, therapeutic modalities, and home exercises.',
    detail:
      'Generates clear rehabilitative and medical care plans with visit frequency, measurable functional goals, and re-evaluation intervals.',
    api: 'Structured Care Plan Builder',
  },
  {
    num: '13',
    name: 'Multilingual Clinical Translator',
    route: '/translate/',
    category: 'Voice & Intake',
    summary: 'Bidirectional English, Spanish, and Haitian Kreyòl medical translation.',
    detail:
      'Translates patient-spoken intake narratives into clinical English and converts discharge instructions into the patient’s preferred language.',
    api: 'Medical Terminology Translation',
  },
  {
    num: '14',
    name: 'Hands-Free Voice Commander',
    route: '/voice-commander/',
    category: 'Voice & Intake',
    summary: 'Navigate schedules, charts, scribing, and billing using natural spoken commands.',
    detail:
      'Say "open today’s appointments", "search patient Morales", or "start scribe" for sterile, zero-keyboard exam-room operation.',
    api: 'Hands-Free EHR Voice Control',
  },
  {
    num: '15',
    name: 'Conversational Voice Actions',
    route: 'Live Voice AI',
    category: 'Voice & Intake',
    summary: 'Interruptible voice assistant executing 7 live scheduling, charting, and billing tasks.',
    detail:
      'Search patients, check appointment history, book follow-ups, launch ambient scribing, or prepare visit statements strictly by voice.',
    api: '7 Live Clinical Voice Actions',
  },
  {
    num: '16',
    name: 'Audio Dictation & Spoken Handouts',
    route: '/audio-notes/',
    category: 'Voice & Intake',
    summary: 'Convert recorded dictations into reports and export spoken audio care instructions.',
    detail:
      'Processes uploaded voice memos into structured clinical notes and generates accessible spoken audio summaries for patients.',
    api: 'Dictation & Audio Care Summaries',
  },
  {
    num: '17',
    name: 'Automated Note Quality Check',
    route: 'Quality Audit',
    category: 'Hub & QA',
    summary: 'Pre-signature audit scanning for missing measurements, unsigned fields, or coding gaps.',
    detail:
      'Ensures every encounter meets clinical documentation and Office Ally claim standards before final provider lock.',
    api: 'Pre-Sign Documentation QA',
  },
  {
    num: '18',
    name: 'AIMS Clinical Copilot & Hub',
    route: '/command-center/',
    category: 'Hub & QA',
    summary: 'Conversational chart copilot and unified launcher across all 18 clinical AI workflows.',
    detail:
      'Lets providers query longitudinal charts, compare lab trends, upload visual documents for extraction, and launch any AI workflow from one hub.',
    api: 'Unified AI Clinical Hub',
  },
];

export const FIVE_SPECIALIST_AGENTS = [
  {
    id: 'alpha',
    code: 'AGENT ALPHA',
    name: 'Clinical Assessment',
    latency: 'Real-Time',
    verdict: 'Right C6 Radiculopathy · Cervical Traction + Care Plan',
    detail:
      'Synthesizes presenting symptoms, physical exam maneuvers, differential considerations, and structured SOAP care plans during the live encounter.',
  },
  {
    id: 'beta',
    code: 'AGENT BETA',
    name: 'AI Medical Encoding',
    latency: 'Real-Time',
    verdict: 'ICD-10: M54.12, M99.01 · CPT: 98940-25, 97012',
    detail:
      'Extracts specificity-verified ICD-10 diagnosis codes, CPT procedure codes, and required billing modifiers (-25, -59, -AT) directly from exam findings.',
  },
  {
    id: 'gamma',
    code: 'AGENT GAMMA',
    name: 'Clinical Safety Review',
    latency: 'Real-Time',
    verdict: 'SAFE TO TREAT · 0 Vascular / Neurological Red Flags',
    detail:
      'Continuously screens symptoms, vitals, and patient history for red flags, medication interactions, and clinical contraindications.',
  },
  {
    id: 'delta',
    code: 'AGENT DELTA',
    name: 'AI Medical Billing & Office Ally',
    latency: 'Real-Time',
    verdict: 'Claim Scrubbed · Ready for Office Ally Submission',
    detail:
      'Audits diagnosis-to-CPT pointers, objective measurements, and medical necessity so clean claims submit seamlessly to Office Ally.',
  },
  {
    id: 'epsilon',
    code: 'AGENT EPSILON',
    name: 'Clinical Coding Knowledge Base',
    latency: 'Real-Time',
    verdict: 'Matched 15,716 Coding Rules + Longitudinal Chart History',
    detail:
      'Cross-references 15,716 CPT and ICD-10 coding guidelines, clinic protocols, prior patient visits, and extracted OCR records for grounded accuracy.',
  },
];

export interface AutomationNodeSpec {
  num: string;
  title: string;
  routeOrRuntime: string;
  icon: string;
  summary: string;
  detail: string;
}

export const AUTOMATION_SYSTEMS: AutomationNodeSpec[] = [
  {
    num: '01',
    title: 'Office Ally Clearinghouse Sync',
    routeOrRuntime: 'Office Ally Integration',
    icon: 'Fact_Check',
    summary: 'Streamlined electronic claim submission, eligibility checks, and remittance reconciliation.',
    detail:
      'Connects AI-encoded superbills and scrubbed ICD-10/CPT claims directly with Office Ally so practices accelerate reimbursements and minimize claim rejections.',
  },
  {
    num: '02',
    title: 'Visual OCR & Intake Extraction',
    routeOrRuntime: 'Visual AI Pipeline',
    icon: 'document_scanner',
    summary: 'Zero-typing extraction from insurance cards, photo IDs, lab sheets, and paper forms.',
    detail:
      'Automatically reads photographed payer cards, driver’s licenses, and clinical referrals to populate patient demographics, policy details, and structured chart entities.',
  },
  {
    num: '03',
    title: 'Morning Provider Briefing AI',
    routeOrRuntime: 'Daily Clinical Digest',
    icon: 'wb_sunny',
    summary: 'Every morning clinicians receive an AI-prepared summary of their day’s schedule and charts.',
    detail:
      'Reviews upcoming patients, completed intake forms, pending lab trends, and unsigned encounters or billing items before clinic doors open.',
  },
  {
    num: '04',
    title: 'Automated Reminders & QR Intake',
    routeOrRuntime: 'Patient Engagement',
    icon: 'notifications_active',
    summary: '24-hour and 2-hour appointment reminders with mobile QR intake links and two-way replies.',
    detail:
      'Sends timely appointment reminders and pre-visit intake invitations so patients arrive checked in with forms and insurance photos already extracted.',
  },
  {
    num: '05',
    title: '24/7 AI Virtual Receptionist',
    routeOrRuntime: 'Always-On Front Desk',
    icon: 'support_agent',
    summary: 'Answers routine patient calls, clinic questions, and appointment requests around the clock.',
    detail:
      'Captures after-hours booking requests, shares pre-visit instructions, and keeps your front-desk schedule organized without missed calls.',
  },
];

export interface IntegrationRow {
  name: string;
  category: string;
  purpose: string;
  status: 'Active';
}

export const LIVE_INTEGRATIONS: IntegrationRow[] = [
  {
    name: 'Office Ally',
    category: 'Medical Billing & Clearinghouse',
    purpose:
      'Direct integration for electronic claim submission (837P), payer eligibility verification, claim status tracking, and ERA/835 remittance reconciliation.',
    status: 'Active',
  },
  {
    name: 'AIMS AI Medical Coding Engine',
    category: 'ICD-10 & CPT Encoding',
    purpose:
      'Automated clinical entity extraction and specificity-verified ICD-10, CPT, and modifier encoding across 15,716 medical coding rules.',
    status: 'Active',
  },
  {
    name: 'AIMS Visual OCR & Extraction',
    category: 'Optical Character Recognition',
    purpose:
      'Extracts subscriber details, policy numbers, demographics, and lab values from photographed insurance cards, photo IDs, and clinical documents.',
    status: 'Active',
  },
  {
    name: 'AIMS Multi-Agent Scribe Suite',
    category: 'Clinical Documentation AI',
    purpose:
      'Ambient encounter listening, Dual-Agent Builder + Reviewer verification, and 5-Agent Specialist Consensus for accurate SOAP notes.',
    status: 'Active',
  },
  {
    name: 'Multilingual Voice & Kiosk Intake',
    category: 'Patient Intake & Check-In',
    purpose:
      '33-question spoken and touch intake in English, Spanish, and Haitian Kreyòl with instant chart population and lobby arrival sync.',
    status: 'Active',
  },
  {
    name: 'Integrated Telehealth & Patient Portal',
    category: 'Virtual Care & Self-Service',
    purpose:
      'Browser-based video consultations, online self-scheduling, digital consent signing, visit handouts, and patient statement checkout.',
    status: 'Active',
  },
];

export interface FaqItem {
  q: string;
  a: string;
  tag: string;
}

export const WEBSITE_FAQS: FaqItem[] = [
  {
    tag: 'AI Scribe & Multi-Agents',
    q: 'How does AIMS ensure clinical notes and medical codes are accurate?',
    a: 'Every encounter in the AI Medical Scribe passes through Dual-Agent verification: Agent 1 ("Builder") drafts the structured SOAP note, ICD-10 diagnoses, and CPT codes, while Agent 2 ("Reviewer") audits the draft against the conversation transcript and 15,716 coding rules. For complex visits, our 5-Agent Consensus Board evaluates clinical assessment, medical encoding, safety red flags, and billing compliance in parallel.',
  },
  {
    tag: 'AI Medical Billing & Office Ally',
    q: 'How does AI medical billing work with Office Ally?',
    a: 'As soon as a provider signs an encounter, AIMS encodes the verified ICD-10 diagnoses, CPT procedures, and modifiers into a clean superbill, runs an automated medical-necessity claim scrub, and syncs directly with Office Ally for electronic clearinghouse submission, eligibility checks, and remittance tracking.',
  },
  {
    tag: 'Intake Form & Visual OCR',
    q: 'How do the smart intake form and visual OCR extraction save front-desk time?',
    a: 'Patients can complete the 33-question intake form by speaking or typing in English, Spanish, or Haitian Kreyòl—from home or in the lobby. Using Visual OCR, patients or staff simply snap a photo of a driver’s license, insurance card, or referral, and AIMS automatically extracts demographics, policy IDs, and clinical details into the EHR.',
  },
  {
    tag: '7-Step Flow & Returning Patients',
    q: 'Do returning follow-up patients need to repeat the full 7-step intake workflow?',
    a: 'No. New patients move smoothly through all 7 stages (Intake → Summary → Check-In → Pre-Consult → Scribe Consultation → Multi-Agent Review → Sign & Bill), while returning patients use the 60-Second Express Quick-Note workflow—skipping Steps 1–4 to complete and sign follow-up charting in under a minute.',
  },
  {
    tag: 'Labs, Visual Scans & Portal',
    q: 'Can providers track lab trends and share handouts through the Patient Portal?',
    a: 'Yes. Clinicians can upload external lab reports or enter discrete biomarkers to view visit-to-visit trend tables inside the EHR, while patients use the self-service Patient Portal to book appointments, join telehealth visits, sign consent forms, and review care handouts and statements.',
  },
  {
    tag: 'Privacy & Onboarding',
    q: 'Is AIMS built for healthcare privacy, and can our staff test it before migrating?',
    a: 'AIMS is built for HIPAA-conscious clinical workflows with role-based access across clinic owners, doctors, assistants, and patients, tamper-evident digital consents, and pre-sign clinical audits. Every practice receives guided CSV patient onboarding plus a safe staff training sandbox with a patientless scribe simulator.',
  },
];
