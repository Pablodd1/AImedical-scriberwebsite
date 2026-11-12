# AIMS — Complete Platform Feature Specification
# For website development by an AI developer — every feature, in detail.

Document purpose: single source of truth describing EVERY capability of the AIMS
platform (EHR, patients, invoices, payments, integrations, voice, AI agents,
portal, labs, settings, analytics) so a website can be built that describes the
product completely and accurately.

All facts below were verified against the live system (backend route table,
controller/model inventory, deployed frontend tools, live nginx map) as of
2026-11-11. Live domain: https://aimedicalscriber.com

---

## 1. PLATFORM OVERVIEW

AIMS (Artificial Intelligence Medical Scribe) is an AI-native clinic operating
system: a full EHR + AI documentation suite + payments + patient portal, running
on one Node.js backend with a MongoDB Atlas database and multiple AI
microservices.

### 1.1 System architecture (the "subnodes" — every service node)

| Node | What it is | Port |
|------|------------|------|
| AIMS Backend | Node.js/Express + Mongoose (MongoDB Atlas). All EHR data: patients, visits, appointments, invoices, labs, docs, consent. | 4000 |
| React SPA (EHR UI) | The main doctor/staff application served by nginx. | static |
| AI Tool Pages | 17+ standalone HTML5 tools (scribe, intake, codes...) served by nginx. | static |
| OpenAI Proxy | Holds OpenAI key server-side; runs the multi-agent medical review board (Builder/Reviewer + 5-agent consensus + RAG). | 3456 |
| Messaging Service | Twilio SMS + email microservice (systemd). | 3457 |
| Payment Bridge | GoDaddy/Poynt smart-terminal bridge; records card-present payments into AIMS. | 3458 |
| Patient Portal | Separate React build: self-service for patients. | static |
| Kiosk Sync | Cron job: Google Sheets check-in sheet -> AIMS appointments. | cron |
| Daily AI Agent | Overnight batch: Ollama-powered clinic report emailed to the doctor. | cron |
| SMS Reminders | Cron: appointment reminders 24h + 2h before visit. | cron |
| AI Receptionist (companion) | IMW phone receptionist: Twilio + FastAPI + ElevenLabs + GPT-4o mini, ~10 calls/day. | separate |

### 1.2 Roles

- Admin (clinic owner) — full access incl. staff management, note types, settings.
- Doctor — clinical work, signature, appointments, billing.
- Assistant — front-desk: patients, check-in, appointments, payments.
- Patient — portal: appointments, visit history, invoices, telehealth links.

### 1.3 Security posture

- JWT auth on all EHR APIs (role embedded); internal-key auth on terminal
  payment webhook; AES-encrypted credentials at rest; SHA-256 consent registry.
- OpenAI keys NEVER reach the browser (proxy pattern).
- HIPAA-conscious design: role-based access, per-clinic data scoping, audit-ready
  signature and consent trails. (Compliance claim wording for website should be
  "built for HIPAA-conscious workflows" unless a formal attestation exists.)

---

## 2. CORE EHR (main application)

### 2.1 Dashboard
Summary: Clinic command overview — today's patients, appointments, pending
items, quick actions.
Detail: Shows today's schedule, patient counts, recent activity and quick links
to the main workflows. Route: /Dashboard. APIs: getTodayPatients,
getTodayPatietnsForAppointment, getPaitentsCount, recentVisit, getRecentUsers.

### 2.2 Patient management
Summary: Full patient registry with instant add, search, import/export.
Detail:
- Create/edit patients (createPatient, updatePatient, addInstantPatient —
  one-click walk-in creation).
- Search 5 ways: by alphabet, by type, global search, limited top-5
  (searchPatientsByAlphabet, searchPatientsByType, searchPatientsGlobal,
  searchPatientsByTypeAndLimit5).
- Bulk CSV import and export (importPatients, exportAllPatients).
- Patient history reset tool (deletePatientHitory).
- Today's patients list + per-patient view (getTodayPatients, getPatientById).
Routes: /Patient, /TodayPatients, /EHR (patient chart).

### 2.3 Patient chart (EHR)
Summary: One screen for the whole clinical record.
Detail: demographics, visit history (getPatientVisits, getVists, getAllVisits),
notes, documents, lab results, invoices, consent status — everything tied to the
patient. Per-patient visit counter (visitCount = distinct clinic days) shown
here, always recomputed from real activity (appointments completed, check-ins,
visit notes).

### 2.4 Appointments & calendar
Summary: Google-Calendar-style scheduler with month/week views, statuses and
automated reminders.
Detail:
- Create/edit/delete/reschedule appointments (createAppointment, editAppTime,
  delAppointment).
- Calendar views by date (calenderDates, getbyDateAppointment), filtered views
  (filterAppointments), all-appointments export (allAppointments).
- Statuses: Pending -> Checked-in -> Complete/No-show (changeStatus); status
  changes feed the visit counter and reminders.
- Patient email confirmation: patients can confirm/cancel by replying to
  reminder emails (userResponseFromEmail).
- Automated SMS/email reminders 24h and 2h before the appointment
  (triggerAppointmentReminders cron).
- Daily schedule SMS to the clinic each morning (triggerDailySchedule,
  sendDailySchedule).
Routes: /AppointmentSelection, /Appointment, /AppointmentMenu, /calendar/.
API: appointmentReport.

### 2.5 Visit notes & reports
Summary: Full encounter documentation: SOAP visits, generation from audio/text,
edit, review, sign.
Detail:
- Create visit from consultation (createVisit), regenerate reports
  (generateReExamReport), legacy report save (newReportMethodStoredIntoDb).
- View/edit reports (viewReport, editReport), visit history with pagination
  (getVists), all-visits list (getAllVisits), delete (delVisit), change date
  (updateVisitDate), recent visit for follow-ups (recentVisit).
- Export: DOCX and PDF report generation (reportDocx, reportPdf,
  createQuickDocx, reportDocxDirectDownload, exportVisitDocx,
  ameriarePatientDocument — patient handout).
Routes: /AllReports, /QuickReport.

### 2.6 Doctor signature
Summary: Provider e-signature with countersignature support on reports and
consents.
Detail: Doctors upload/manage their signature (updateSignature, delSignature),
sign visits (signVisit), and the pre-sign audit (preSignAudit) validates
completeness before signing. Provider countersignature is also captured on
patient consent forms.

### 2.7 Check-in & front desk
Summary: Digital check-in with notes.
Detail: checkIn marks the patient arrived and updates the visit counter; getTodayCheckIns gives the front desk a live arrival board. Encounter notes (addNote, getNotes, deleteNote) attach to the visit; note templates (noteTemplate CRUD) speed up standard entries.

### 2.8 Medical codes (ICD-10 / CPT / DX)
Summary: Built-in code search, favorites, custom codes, and billing compliance
audit.
Detail:
- Search codes and categories (searchMedicalCodes, getCodeCategories).
- Custom codes per clinic (addCustomCode, updateCustomCode).
- Favorites and recent codes for one-tap use (addFavoriteCode,
  removeFavoriteCode, getFavoriteCodes, getRecentCodes).
- Billing compliance auditor: checks documentation against billing rules
  (runBillingCompliance — Helper/billingAuditor.js).
- ROM calculator helper (Helper/romCalculator.js) for functional measurements.
Route: /MedicalCodes.

### 2.9 Labs & blood panels
Summary: Lab results hub with trends.
Detail: manual lab entry (createLabResult), PDF/image upload (uploadLabFile),
full list + detail + delete (getLabResults, getLabResultById, deleteLabResult),
CSV export (exportLabResults), and trend charts per lab (getLabTrends) so the
doctor sees how a patient's blood panel evolves visit to visit.

### 2.10 Documents & storage
Summary: Clinic document manager with secure storage.
Detail: upload PDFs (uploadPDF), paginated document list (getDocuments), delete
(deleteDocument), date fix (updateDocumentDate). Storage: signed-URL upload and
private read via S3-compatible storage (getSignedUrlForUpload, getObject,
deleteObject) with legacy uploads directory fallback.

### 2.11 Invoicing & billing
Summary: Complete invoice lifecycle.
Detail: create invoices (makeInvoice), list (getAllInvoices), detail
(getInvoiceById), edit (updateInvoice), delete (deleteInvoice), status workflow
(invoiceStatus), status-filtered lists (getAllByStatus), and invoice analytics
(getInvoiceAnalyitcs) for revenue dashboards.

### 2.12 Payments & card terminals
Summary: Card-present payments straight from the exam room to the invoice.
Detail:
- GoDaddy/Poynt smart terminal bridge (port 3458): tap/swipe/insert payments
  land in AIMS with amount matching (match uses amount.subTotal).
- Terminal transactions (getTerminalPayments), unmatched payment queue
  (getUnmatchedPayments), assign payments to invoices (assignTerminalPayment),
  secure webhook with internal key (internal/terminal-payment).
- Manual mode: record cash/external-terminal payments when no terminal
  credentials are configured. Open architecture — any processor can be plugged
  in by swapping the backend.
Route: /Invoice.

### 2.13 Settings & personalization
Summary: Everything per-clinic.
Detail: profile (updateProfile), password (updatePassword), clinic logo
(updateClinicLogo), profile pictures (updateProfiePicture, setEmptyPic),
email credentials (updatEmailredentials), website URL (updatewebsiteURL),
notification preferences (updateNotificationSettings), OpenAI key
(setOpenAiKey), signature (updateSignature).
Routes: /Settings, /profile, /Admin (global: AI agent toggles, SMS/email
settings, clinical workflow switches, kiosk-sync toggles).

### 2.14 Staff management (admin)
Summary: Users, doctors, assistants.
Detail: create users + JWT login (createUser, signin, getUserInfo,
checkUserToken, adminLogin), doctors CRUD (addDoctor, getDoctors, fetchAllDoctors,
deleteDoctor, updateDoctor), assistants CRUD (addAssistant, getAssistants,
updateAssistant, deleteAssistant), demo accounts for training (createDemoUser,
fecthDemoAccounts, demoUserCount).

### 2.15 Feedback
Summary: In-app feedback loop. sendFeedBack, fetchFeedBack,
deleteFeedBackById. Route: /FeedBack.

---

## 3. THE 7-STEP PATIENT FLOW (flagship workflow)

The complete patient journey, fully automated:

1. INTAKE — patient fills the 33-question voice intake (EN/ES/Haitian Kreyol).
2. SUMMARY — doctor reviews demographics + missing-field alerts before the visit.
3. CHECK-IN — kiosk sync (Google Sheets) or front desk marks arrival.
4. PRE-CONSULT — full history, every past SOAP note, AI red-flag scan.
5. CONSULTATION — Medical Scribe: live transcription + AI chatbot.
6. APPROVAL — review/edit/regenerate the SOAP, DX codes, CPT codes, red flags.
7. SAVE — one click to the visit record, signed, available for future visits.

Quick-Note path (returning patients): lookup by name/code -> consultation ->
approve -> save. Skips steps 1-4. Route: /quick-note/.

---

## 4. AI TOOLS CATALOG (deployed, live)

### 4.1 Medical Scribe (/scribe/)
Summary: Side-by-side live transcription + AI consultation assistant that
generates a complete, signed SOAP note.
Detail: two-panel workspace — left: continuous transcription of the
doctor-patient conversation (Whisper); right: AI chatbot the doctor can ask
about the transcript mid-visit. After the visit: one button generates the
comprehensive note (full SOAP, ICD-10 DX codes, CPT codes, severity-coded red
flags, missing-info list, recommended tests). Results save directly to the
patient's visit record. Wake-lock keeps the screen on during recording; test
simulator lets the doctor demo the flow without a patient.

### 4.2 Two-Agent Medical Review (built into Scribe)
Summary: Every AI note is checked by a second AI before it's saved.
Detail: Agent 1 "Builder" (MD/PhD-level) produces the comprehensive note in one
pass. Agent 2 "Reviewer" verifies it against the transcript AND the clinic
knowledge base: accuracy of codes, completeness, missed red flags or
contraindications, medical-legal quality — returns approved/not-approved with
corrections. Chosen over the 5-agent board for lower cost and cleaner UI.

### 4.3 Five-Agent Consensus Board (voice monitor, /monitor/)
Summary: Five specialist AI agents review every case in parallel with clinic
knowledge retrieval.
Detail:
- Alpha — Clinical Assessment: symptoms, differential, treatment plan.
- Beta — Medical Coding: ICD-10, CPT, modifiers.
- Gamma — Safety Review: red flags + contraindications + safe-to-treat verdict.
- Delta — Billing Compliance: documentation gaps and audit risks.
- Epsilon — RAG Knowledge Base: clinic protocols and similar past cases pulled
  from MongoDB (15,716 CPT codes + visit history + documents).
Continuous voice capture, auto-consensus after every few utterances, WebSocket
live results, optional JWT when embedded in the EHR.

### 4.4 Voice Intake (/intake/)
Summary: 33-question new-patient form patients complete by talking.
Detail: Web Speech API voice recognition auto-fills questions in English,
Spanish, or Haitian Kreyol; progress bar tracks completion; covers
demographics, insurance, history, symptoms, lifestyle, review of systems.
Questions are configurable per clinic via note types
(getQuestionsForIntake?slug=new-patient-intake). AI extracts entities from
intake text (extractIntakeEntities) and can pre-draft the chart note
(suggestTreatment).

### 4.5 Intake Summary (/summary/)
Summary: Doctor's intake dashboard — demographics, missing fields, visit history
in one glance. patientDataToSummary API.

### 4.6 Pre-Consultation (/pre-consult/)
Summary: Everything about the patient before walking into the room.
Detail: complete history, all previous SOAP notes, AI red-flag scan of the
record. generateNoteWithHistory powers note drafting from history.

### 4.7 Quick Note (/quick-note/)
Summary: 60-second documentation for returning patients — type name/code, AI
generates the SOAP from your notes.

### 4.8 Audio Notes (/audio-notes/)
Summary: Record or upload audio -> transcription -> saved to the visit.
Detail: speechToText (Whisper), saveTranscription; download any note back as
audio (downloadNoteAsAudio) — useful for accessibility and patient follow-up.

### 4.9 Red Flags (/red-flags/)
Summary: Symptom-to-alert safety checker. validateRedFlags returns
severity-coded contraindications before treatment.

### 4.10 Treatment Plans (/treatment-plan/)
Summary: AI-generated chiropractic care plans — modalities, home care,
follow-up schedule. suggestTreatment API.

### 4.11 DX/CPT Codes (/dx-cpt-codes/)
Summary: Extract ICD-10 + CPT codes from the consultation text in one click.
extractDxCptCodes API.

### 4.12 Translate (/translate/)
Summary: Multi-language support: English/Spanish/Kreyol <-> English for notes
and patient communication. translateNote + translateToEnglish APIs.

### 4.13 Voice Commander (/voice-commander/)
Summary: Hands-free navigation of the whole EHR by voice.
Detail: interpretCommand AI understands natural-language commands and returns
an action + target + page — e.g. "open today's appointments", "search patient
Smith", "start scribe" — letting the doctor control the app without touching
the keyboard.

### 4.14 Realtime Voice API (advanced voice)
Summary: A live, interruptible voice agent with clinical actions.
Detail: OpenAI Realtime voice tokens (voice/realtime-token) power a spoken
assistant that can, by voice alone: search patients (voice/search-patient),
read the patient's calendar (voice/patient-calendar), schedule appointments
(voice/schedule-appointment), start the medical scribe (voice/start-scribe),
create payments (voice/create-payment), look up patient info
(voice/patient-info), and list today's appointments (voice/today-appointments).
Also: legacy Voice Intake 2.0 (openai/voiceIntake2.0).

### 4.15 Speech-to-text with OCR
Summary: Extract both the spoken audio AND photographed documents.
Detail: dual-file endpoint (speechToText/both) transcribes audio and OCRs a
photo in one call; extractPatientDataFromImage pulls patient data from ID
cards/insurance cards; generateReportFromAudioFile builds a report straight
from an uploaded recording.

### 4.16 Quality check
Summary: Automated note quality assurance (runQualityCheck) — completeness and
formatting checks before notes are finalized.

### 4.17 AimsAssistant (chatbot)
Summary: AI assistant inside the EHR (route /AimsAssistant) + legacy OpenAI
assistants API (threads/messages/runs) for conversational support and file
uploads (newAssistant).

### 4.18 AI Tools hub
Route /AITools + Command Center (/command-center/): master dashboard linking
every tool, with breadcrumb navigation through the 7-step flow. A flow
diagram page documents every route, button, API and data flow.

---

## 5. MULTI-AGENT & AUTOMATION SYSTEMS

### 5.1 Daily AI Agent (overnight)
Summary: Every morning the doctor wakes up to an AI-generated clinic briefing.
Detail: a nightly batch job (local Ollama) analyzes appointments, recent
activity and pending items and emails a daily AI report. Runs unattended;
degrades gracefully if the AI node is offline.

### 5.2 Mission Control (/mission-control/)
Summary: Business-growth command center — dual-mode.
Detail: (1) Website lead generator for 10 local businesses with pipeline
stages and contact tracking; (2) Hotel rate intelligence for 10 boutique
hotels. Both modes send SMS/email follow-ups via the messaging service.

### 5.3 SMS Center (/sms-center/)
Summary: Patient communication hub on Twilio — appointment reminders,
notifications, QR code invitations (sendQrCode), two-way email replies
(userResponseFromEmail).

### 5.4 AI Receptionist (companion product for the clinic group)
Summary: Phone receptionist that answers calls 24/7.
Detail: Twilio call handling + FastAPI orchestration + ElevenLabs voice +
GPT-4o mini conversation. Answers, books appointments, answers questions.
Handles ~10 calls/day for the clinic group.

### 5.5 Messaging microservice
Summary: SMS + email as a separate, always-on service.
Detail: systemd Node.js service (port 3457) with /messaging/health,
/messaging/send-sms, /messaging/send-email — used by Mission Control, SMS
Center, reminders and the admin panel. Isolated from the EHR so messaging
updates never restart the clinical system.

---

## 6. PATIENT PORTAL (self-service)

Summary: Patients manage their own care online.
Detail (routes): Dashboard, Appointment booking (/Appointment,
/AppointmentMenu, /AppointmentSelection), telehealth meeting links
(/CreateMeet, /Meeting, /MeetingPreview), visit history (/AllReports), invoices
(/Invoice), AI assistant (/AimsAssistant), quick report (/QuickReport),
profile + settings, registration pages (/registrationmiami, /signup, /form),
pricing (/price), feedback (/FeedBack), about/help.
APIs: patientLogin (JWT for patients), patientAppointments,
patientVisitHistory. Hosted as a separate React build with its own auth.

---

## 7. CONSENT MANAGEMENT

Summary: Four electronic consent forms with legal-grade integrity.
Detail: /consent/ serves 4 forms; a text registry (consentForms.js) + SHA-256
hashing makes every signed form tamper-evident; provider countersignature
(name + signature) captured at signing (submitConsent, getConsents,
getConsentForms). Patient whitelist controls access.

---

## 8. ANALYTICS & USAGE

- Invoice analytics (getInvoiceAnalyitcs): revenue, outstanding, by status.
- Lab trends (getLabTrends): per-patient panel evolution.
- Appointment report (appointmentReport): schedule stats.
- Admin dashboard (/Admin/Dashboard): system-level overview.
- Voice monitor dashboard (/monitor/): live agent activity.
- Settings analytics module (aims-settings-analytics.js).
- Mission Control pipelines: lead funnels + rate tracking.
- Usage & demo account metrics (demoUserCount).

---

## 9. INTEGRATIONS SUMMARY (what AIMS connects to)

| Integration | Used for |
|-------------|----------|
| OpenAI (GPT-4o/mini, Whisper, Realtime) | notes, coding, translation, red flags, voice agents, transcription |
| Twilio | SMS reminders, notifications, receptionist calls |
| GoDaddy Poynt terminals | card-present payments |
| MongoDB Atlas | primary database |
| S3-compatible storage + Cloudinary | documents, images |
| Gmail SMTP | patient + staff email |
| Google Sheets | kiosk check-in sync |
| ElevenLabs | receptionist voice |
| Local Ollama | overnight agent, lead-gen agents |
| AdvanceMD (stub) | external EHR integration point (placeholder, not active) |

---

## 10. WEBSITE CONTENT BLUEPRINT (for the AI developer)

Recommended sitemap and what each page should say (summaries above are
copy-ready):

1. Home — one-line positioning ("AI-native clinic OS"), hero with the 7-step
   flow animation, live demo request, social proof.
2. EHR — sections 2.1-2.14 condensed: chart, calendar, visits, labs, docs.
3. AI Scribe — sections 4.1-4.3 (scribe + 2-agent review + 5-agent board).
4. Voice — 4.4, 4.13, 4.14, 4.15 (intake voice, commander, realtime API, OCR).
5. Payments & Billing — 2.11-2.12 + section 9 payment rows.
6. Patient Portal — section 6.
7. Automation — section 5 (daily agent, mission control, SMS center,
   receptionist).
8. Integrations — section 9 table.
9. Security & Compliance — section 1.3.
10. Pricing/Contact — demo accounts, contact forms.
11. FAQ — derived from every section's detail.

Style notes: keep the patient-flow narrative front and center (steps 1-7);
every feature page ends with a "book a demo" CTA; use real URLs
(/scribe/, /intake/...) as proof links in demo mode.

---

## 11. ACCURACY NOTES (for the developer)

- All URLs/routes/APIs above are real and live as of 2026-11-11.
- "Blood panels" = Lab Results module (section 2.9).
- "Code analysis/extraction" = DX/CPT extraction + billing compliance
  (sections 2.8, 4.11).
- "Subnodes" = the service-node architecture (section 1.1).
- "Learning" = RAG knowledge base (agent Epsilon) + favorites/recents +
  per-clinic custom codes/note types.
- AdvanceMD integration is a placeholder stub — do not market it as live.
