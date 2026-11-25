import { createHash } from 'node:crypto';
import { put, head, BlobNotFoundError } from '@vercel/blob';
import nodemailer from 'nodemailer';

const allowedOrigins = new Set([
  'https://aiscribers.com',
  'https://www.aiscribers.com',
  'https://aims-clinical-workspace.jasssss.chatgpt.site',
]);
const limits = { name: 80, practice: 100, email: 150, phone: 40, preferredTime: 120, message: 1200 };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.has(origin) && !/^https:\/\/[a-z0-9-]+-jasssss\.vercel\.app$/i.test(origin)) {
    return res.status(403).json({ error: 'This form must be submitted from the AIMS website.' });
  }
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end();

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Please check the form and try again.' });
    }
  }
  if (!body || JSON.stringify(body).length > 7000 || body.website) {
    return res.status(400).json({ error: 'Please check the form and try again.' });
  }
  if (!/^[0-9a-f-]{36}$/i.test(body.id || '')) {
    return res.status(400).json({ error: 'Reload the page and try again.' });
  }

  const entry = {};
  for (const [field, length] of Object.entries(limits)) {
    if (body[field] != null && typeof body[field] !== 'string') {
      return res.status(400).json({ error: 'Please check the form fields.' });
    }
    entry[field] = (body[field] || '').trim();
    if (entry[field].length > length) {
      return res.status(400).json({ error: 'Please shorten your message and try again.' });
    }
  }

  if (!entry.name || !entry.practice || !entry.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email)) {
    return res.status(400).json({ error: 'Please enter your name, practice, email, and message.' });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'We could not save your request. Please email jasmelacosta@gmail.com.' });
  }

  const path = 'inquiries/' + body.id + '.json';
  try {
    try {
      await head(path);
      return res.json({ reference: body.id, received: true });
    } catch (error) {
      if (!(error instanceof BlobNotFoundError)) throw error;
    }

    const fingerprint = createHash('sha256')
      .update(req.headers['x-forwarded-for']?.split(',')[0] || 'unknown')
      .digest('hex');
    const ratePath = 'limits/' + fingerprint + '-' + Math.floor(Date.now() / 60000) + '.json';
    try {
      await put(ratePath, '{}', { access: 'private', addRandomSuffix: false, allowOverwrite: false });
    } catch (error) {
      if (/already exists/i.test(error.message)) {
        return res.status(429).json({ error: 'Please wait a minute before submitting another request.' });
      }
      throw error;
    }

    const receivedAt = new Date().toISOString();
    try {
      await put(path, JSON.stringify({ ...entry, reference: body.id, receivedAt }), {
        access: 'private',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: false,
      });
    } catch (error) {
      if (!/already exists/i.test(error.message)) throw error;
    }

    let emailConfirmationSent = false;
    if (process.env.GMAIL_APP_PASSWORD) {
      try {
        const user = process.env.GMAIL_USER || 'jasmelacosta@gmail.com';
        const transport = nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass: process.env.GMAIL_APP_PASSWORD },
          connectionTimeout: 8000,
          socketTimeout: 10000,
        });
        await transport.sendMail({
          from: user,
          to: 'jasmelacosta@gmail.com',
          replyTo: entry.email,
          subject: 'AIMS website inquiry — ' + entry.practice.replace(/[\r\n]/g, ' '),
          text: Object.entries({ ...entry, reference: body.id, receivedAt })
            .map(([k, v]) => k + '\n' + v)
            .join('\n\n'),
        });
        await transport
          .sendMail({
            from: user,
            to: entry.email,
            replyTo: 'jasmelacosta@gmail.com',
            subject: `We received your AIMS walkthrough request (${body.id.slice(0, 8)})`,
            text: `Hi ${entry.name},\n\nThank you for contacting AIMS (${entry.practice}). We have received your walkthrough request (Reference: ${body.id}).\n\nHow scheduling works: Jasmel Acosta will reply directly to this email to agree on a walkthrough time that fits your schedule.\n\nSubmitted message:\n${entry.message}\n\nWarm regards,\nJasmel Acosta\nAIMS Clinical Platform — https://aiscribers.com\n(786) 643-2099 | jasmelacosta@gmail.com`,
          })
          .then(() => {
            emailConfirmationSent = true;
          })
          .catch(() => {});
      } catch {
        console.warn('Inquiry saved; email notification failed. Reference:', body.id);
      }
    }

    return res.status(201).json({
      reference: body.id,
      received: true,
      receivedAt,
      emailConfirmationSent,
    });
  } catch (error) {
    console.error('Inquiry storage failed', error.name);
    return res.status(503).json({
      error: 'We could not save your request. Please email jasmelacosta@gmail.com or call (786) 643-2099.',
    });
  }
}
