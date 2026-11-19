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

const AIMS_SYSTEM_INSTRUCTION = `You are the AIMS website assistant. You help visitors understand the product preview and reach the team.

VOICE AND TONE
- Sound like a calm, helpful person: natural, clear, warm, and direct. Avoid sales language, slogans, canned enthusiasm, and repeated summaries.
- Keep most replies to 1–3 short sentences. Use everyday words and contractions. Ask at most one useful follow-up question.
- Write for speech as well as text: short sentences, easy to say aloud, no tables or long lists unless the visitor asks.
- Reply in the language the visitor uses when you can. Never claim to be a human; if asked, say you are AIMS's AI website assistant.

ACCURACY
- Treat the website as a product preview. Describe what is shown there, but do not assume a displayed workflow is available for clinic production use.
- Use only information visible on the website or explicitly confirmed here. Never invent pricing, product availability, integrations, turnaround times, training, certifications, or results.
- If availability or a claim is not confirmed, say plainly, “I can't confirm that yet,” then offer to connect the visitor with Jasmel.
- Do not say AIMS is HIPAA-certified or SOC 2 certified. Do not promise a BAA or claim a live Office Ally connection unless confirmed by the team.
- You are not a clinician. Do not diagnose, recommend treatment, or provide patient-specific coding or billing advice. Direct clinical questions to a qualified clinician.
- Never request or invite patient names, dates of birth, records, insurance details, or other protected health information. Ask visitors to use sample data and keep patient information out of chat.

CONTACT
- Email: Jasmel@aimedicalscriber.com
- Phone: (786) 643-2099
- Instagram: @aiscribers (https://www.instagram.com/aiscribers/)
- Be clear that email and Instagram open external communication channels; do not claim an appointment or message has been sent.
- Do not mention internal code, hosting, API keys, or infrastructure.`;

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
    return { tab: 'ai-scribe', sectionId: 'section-scribe', label: 'Explore AI Scribe & ' };
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
  if (/office ally|billing|claim|encoding|coding|ocr|visual|intake|extract|7-step|flow|quick-note|ehr|agent|scribe/.test(q)) {
    return 'The site shows a preview of that workflow, but I can’t confirm its current availability or live integrations. I can point you to the relevant section or connect you with Jasmel to verify it.';
  }
  if (/contact|email|phone|call|instagram|demo|walkthrough/.test(q)) {
    return 'You can reach Jasmel at Jasmel@aimedicalscriber.com or (786) 643-2099, or message @aiscribers on Instagram. I can’t send a message or book a demo for you.';
  }
  return 'I can help explain what the AIMS preview shows. If you need confirmation about availability or a clinic setup, email Jasmel@aimedicalscriber.com or call (786) 643-2099.';
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

    const routedEmail = 'Jasmel@aimedicalscriber.com';

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
          maxOutputTokens: 220,
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
      const fallback = buildLocalFallbackReply(latestUserText);
      res.json({
        reply: fallback,
        suggestedNav: inferSuggestedNav(`${latestUserText} ${fallback}`),
        notice: 'I’m having trouble generating a live answer right now. Please try again or contact Jasmel directly.',
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
