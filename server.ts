import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

interface ChatMessageInput {
  role: 'user' | 'model';
  text: string;
}

interface ContactSubmission {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  clinicName: string;
  role: string;
  providerCount: string;
  department: string;
  message: string;
  provisionDemoUser: boolean;
  submittedAt: string;
}

const contactSubmissions: ContactSubmission[] = [];

const AIMS_SYSTEM_INSTRUCTION = `You are the official AIMS Concierge Assistant on aimedicalscriber.com (AIMS — Artificial Intelligence Medical Scribe, the AI-Native Clinic Operating System).

Answer questions concisely, accurately, and warmly in 2 to 5 short sentences or clean bullet points focusing strictly on clinical capabilities:
- Core Platform: Ambient AI Medical Scribe, Unified Longitudinal EHR, Multilingual Smart Intake Form, Visual OCR & Document/Card Extraction, Multi-Agent Clinical Review, AI Medical Coding & Encoding, AI Medical Billing with direct Office Ally integration, and a Self-Service Patient Portal & Telehealth suite.
- Do NOT mention internal software stack or infrastructure tools (never mention Node.js, MongoDB, Express, React, Port numbers, Whisper, OpenAI, Twilio, GoDaddy, Poynt, Ollama, ElevenLabs, Google Sheets, JWT, or SHA-256). Keep answers focused on medical workflows, AI capabilities, and Office Ally integration.
- 7-Step Patient Flow: (01) 33-question spoken or digital Intake Form in English, Spanish, and Haitian Kreyòl, (02) Visual OCR card/document extraction & Pre-Visit Summary, (03) Lobby Kiosk & Front-Desk Check-In, (04) Pre-Consultation longitudinal chart & red-flag safety scan, (05) Ambient AI Medical Scribe + mid-visit clinical copilot, (06) Multi-Agent Review (Dual-Agent Builder + Reviewer and 5-Agent Specialist Consensus Board across 15,716 ICD-10 & CPT coding rules), (07) One-click provider e-signature, patient handouts, and clean claim sync to Office Ally. Returning patients use 60-Second Express Quick-Note (skipping Steps 1–4).
- Visual OCR & Extraction: Automatically reads photographed insurance cards, photo IDs, referrals, and lab reports to extract demographics, subscriber IDs, and clinical entities into the EHR and billing profile.
- AI Medical Coding, Billing & Office Ally: Automated clinical extraction and encoding of ICD-10 diagnoses, CPT procedures, and modifiers, medical-necessity claim scrubbing, patient statements, and direct clearinghouse integration with Office Ally (837P electronic claims, eligibility, and ERA remittances).
- Privacy & Onboarding: Built for HIPAA-conscious clinical workflows (do NOT claim SOC2 Type II or formal HIPAA certification). Visitors can book a live walkthrough or request a staff training sandbox via the Contact Hub or demos@aimedicalscriber.com.`;

function inferSuggestedNav(text: string): { tab: string; sectionId: string; label: string } | null {
  const lower = text.toLowerCase();
  if (lower.includes('contact') || lower.includes('demo') || lower.includes('sandbox') || lower.includes('pricing')) {
    return { tab: 'platform', sectionId: 'section-contact', label: 'Open Contact & Demo Hub' };
  }
  if (
    lower.includes('office ally') ||
    lower.includes('billing') ||
    lower.includes('claim') ||
    lower.includes('invoice') ||
    lower.includes('superbill')
  ) {
    return { tab: 'security-hipaa', sectionId: 'section-payments', label: 'View AI Billing & Office Ally' };
  }
  if (lower.includes('consent') || lower.includes('hipaa') || lower.includes('privacy') || lower.includes('security')) {
    return { tab: 'security-hipaa', sectionId: 'section-security', label: 'View Privacy & Digital Consents' };
  }
  if (
    lower.includes('scribe') ||
    lower.includes('agent') ||
    lower.includes('coding') ||
    lower.includes('encoding') ||
    lower.includes('cpt') ||
    lower.includes('icd')
  ) {
    return { tab: 'ai-scribe', sectionId: 'section-scribe', label: 'Explore AI Scribe & Multi-Agents' };
  }
  if (
    lower.includes('ocr') ||
    lower.includes('visual') ||
    lower.includes('extract') ||
    lower.includes('voice') ||
    lower.includes('intake') ||
    lower.includes('krey')
  ) {
    return { tab: 'ai-scribe', sectionId: 'section-voice', label: 'Explore Intake & Visual OCR' };
  }
  if (lower.includes('portal') || lower.includes('telehealth') || lower.includes('lab')) {
    return { tab: '7-step-flow', sectionId: 'section-portal', label: 'View Patient Portal & Labs' };
  }
  if (lower.includes('7-step') || lower.includes('quick-note') || lower.includes('ehr')) {
    return { tab: '7-step-flow', sectionId: 'section-flow', label: 'Open 7-Step Flow & EHR' };
  }
  return null;
}

function buildLocalFallbackReply(userQuestion: string): string {
  const q = userQuestion.toLowerCase();
  if (q.includes('office ally') || q.includes('billing') || q.includes('claim') || q.includes('encoding') || q.includes('coding')) {
    return 'AIMS automates AI medical coding, encoding, and billing end to end: specialist AI agents extract high-specificity ICD-10 diagnoses, CPT procedures, and modifiers across 15,716 coding rules, scrub superbills for medical necessity, and sync clean electronic claims directly with Office Ally for fast reimbursement and ERA tracking.';
  }
  if (q.includes('ocr') || q.includes('visual') || q.includes('intake') || q.includes('extract')) {
    return 'With AIMS Smart Intake & Visual OCR, patients complete a 33-question spoken or digital intake form in English, Spanish, or Haitian Kreyòl, while Visual OCR automatically extracts demographics, policy numbers, and clinical details from photographed insurance cards, photo IDs, referrals, and lab sheets directly into the EHR.';
  }
  if (q.includes('7-step') || q.includes('flow') || q.includes('quick-note') || q.includes('ehr')) {
    return 'AIMS connects every visit across 7 steps: (1) Multilingual Smart Intake, (2) Visual OCR & Pre-Visit Summary, (3) Lobby Check-In, (4) Longitudinal Pre-Consult & Safety Scan, (5) Ambient AI Medical Scribe, (6) Multi-Agent SOAP & ICD-10/CPT Encoding, and (7) One-Click E-Signature & Office Ally Claim Sync—plus a 60-second Express Quick-Note mode for returning patients.';
  }
  if (q.includes('agent') || q.includes('scribe')) {
    return 'The Ambient AI Medical Scribe listens naturally during the exam alongside a mid-visit clinical copilot. Every encounter is verified by our Dual-Agent Builder + Reviewer protocol—or our 5-Agent Specialist Consensus Board for complex cases—auditing clinical accuracy, red-flag safety, and 15,716 ICD-10 & CPT coding rules before sign-off.';
  }
  return 'AIMS (aimedicalscriber.com) brings together an Ambient AI Medical Scribe, Unified Longitudinal EHR, 33-question Spoken & Digital Intake Forms, Visual OCR card & document extraction, Multi-Agent ICD-10/CPT medical encoding, and AI Medical Billing integrated with Office Ally. Ask about any workflow or book a live demo in the Contact Hub below!';
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'aims-web-gateway',
      inquiriesReceived: contactSubmissions.length,
    });
  });

  app.post('/api/contact', (req, res) => {
    const {
      fullName = '',
      email = '',
      phone = '',
      clinicName = '',
      role = 'Doctor / Provider',
      providerCount = '2–5 Providers',
      department = 'Live Product Demo',
      preferredWindow = '',
      message = '',
      provisionDemoUser = true,
    } = req.body ?? {};

    const cleanName = String(fullName || req.body?.name || '').trim();
    const cleanEmail = String(email).trim();
    if (!cleanName || !cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({
        ok: false,
        error: 'Please provide your full name and a valid clinic or work email address.',
      });
      return;
    }

    const referenceId = `AIMS-${Math.floor(100000 + Math.random() * 900000)}`;
    const combinedMessage = [
      preferredWindow ? `[Preferred Time: ${String(preferredWindow).trim()}]` : '',
      String(message).trim(),
    ]
      .filter(Boolean)
      .join(' ');

    const record: ContactSubmission = {
      id: referenceId,
      fullName: cleanName,
      email: cleanEmail,
      phone: String(phone).trim(),
      clinicName: String(clinicName || req.body?.clinic || '').trim() || 'Independent Practice',
      role: String(role).trim(),
      providerCount: String(providerCount).trim(),
      department: String(department).trim(),
      message: combinedMessage,
      provisionDemoUser: Boolean(provisionDemoUser),
      submittedAt: new Date().toISOString(),
    };

    contactSubmissions.unshift(record);
    if (contactSubmissions.length > 200) {
      contactSubmissions.length = 200;
    }

    const routedEmail =
      record.department.includes('Support') ||
      record.department.includes('Billing') ||
      record.department.includes('Office Ally')
        ? 'support@aimedicalscriber.com'
        : record.department.includes('Migration') || record.department.includes('Onboarding')
          ? 'onboarding@aimedicalscriber.com'
          : record.department.includes('Multi-Clinic') || record.department.includes('Receptionist')
            ? 'operations@aimedicalscriber.com'
            : 'demos@aimedicalscriber.com';

    res.json({
      ok: true,
      referenceId,
      routedEmail,
      submittedAt: record.submittedAt,
      sandboxProvisioned: record.provisionDemoUser,
    });
  });

  app.post('/api/chat', async (req, res) => {
    const rawMessages: ChatMessageInput[] = Array.isArray(req.body?.messages)
      ? req.body.messages
      : [];

    const sanitized = rawMessages
      .filter((m) => m && (m.role === 'user' || m.role === 'model') && typeof m.text === 'string' && m.text.trim())
      .slice(-12)
      .map((m) => ({
        role: m.role,
        parts: [{ text: m.text.trim().slice(0, 2000) }],
      }));

    if (sanitized.length === 0) {
      res.status(400).json({ error: 'Please enter a message to start chatting.' });
      return;
    }

    const latestUserText = sanitized[sanitized.length - 1]?.parts[0]?.text || '';
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      const reply = buildLocalFallbackReply(latestUserText);
      res.json({
        reply,
        suggestedNav: inferSuggestedNav(`${latestUserText} ${reply}`),
        mode: 'spec-engine',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: sanitized,
        config: {
          systemInstruction: AIMS_SYSTEM_INSTRUCTION,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });

      const replyText = response.text?.trim() || buildLocalFallbackReply(latestUserText);
      res.json({
        reply: replyText,
        suggestedNav: inferSuggestedNav(`${latestUserText} ${replyText}`),
        mode: 'gemini',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const statusMatch = /403|PERMISSION_DENIED|API_KEY_INVALID|400/.test(message)
        ? 'Check your GEMINI_API_KEY in Settings > Secrets if live AI generation is unavailable.'
        : /429|RESOURCE_EXHAUSTED/.test(message)
          ? 'Gemini quota reached; answered using verified AIMS platform documentation.'
          : undefined;

      const fallback = buildLocalFallbackReply(latestUserText);
      res.json({
        reply: fallback,
        suggestedNav: inferSuggestedNav(`${latestUserText} ${fallback}`),
        notice: statusMatch,
        mode: 'fallback',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AIMS Full-Stack Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start AIMS server:', err);
  process.exit(1);
});
