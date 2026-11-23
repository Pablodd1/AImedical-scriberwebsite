import { createHash } from 'node:crypto';
import { put, head, BlobNotFoundError } from '@vercel/blob';
import nodemailer from 'nodemailer';

const allowedOrigins = new Set(['https://aiscribers.com', 'https://www.aiscribers.com', 'https://aims-clinical-workspace.jasssss.chatgpt.site']);
const limits = {name: 80, practice: 100, email: 150, phone: 40, message: 1200};
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.has(origin)) return res.status(403).json({error:'This form must be submitted from the AIMS website.'});
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).end();
  let body = req.body;
  if (typeof body === 'string') {try {body = JSON.parse(body);} catch {return res.status(400).json({error:'Please check the form and try again.'});}}
  if (!body || JSON.stringify(body).length > 7000 || body.website) return res.status(400).json({error:'Please check the form and try again.'});
  if (!/^[0-9a-f-]{36}$/i.test(body.id || '')) return res.status(400).json({error:'Reload the page and try again.'});
  const entry = {};
  for (const [field, length] of Object.entries(limits)) {
    if (body[field] != null && typeof body[field] !== 'string') return res.status(400).json({error:'Please check the form fields.'});
    entry[field] = (body[field] || '').trim();
    if (entry[field].length > length) return res.status(400).json({error:'Please shorten your message and try again.'});
  }
  if (!entry.name || !entry.practice || !entry.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email)) return res.status(400).json({error:'Please enter your name, practice, email, and message.'});
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({error:'We could not save your request. Please email jasmelacosta@gmail.com.'});
  const path = 'inquiries/' + body.id + '.json';
  try {
    try {
      await head(path);
      return res.json({reference:body.id, received:true});
    } catch (error) {if (!(error instanceof BlobNotFoundError)) throw error;}
    // A private, deterministic record prevents duplicate requests when the client retries.
    const fingerprint = createHash('sha256').update(req.headers['x-forwarded-for']?.split(',')[0] || 'unknown').digest('hex');
    const ratePath = 'limits/' + fingerprint + '-' + Math.floor(Date.now() / 60000) + '.json';
    try {await put(ratePath, '{}', {access:'private', addRandomSuffix:false, allowOverwrite:false});}
    catch (error) {if (/already exists/i.test(error.message)) return res.status(429).json({error:'Please wait a minute before submitting another request.'});throw error;}
    const receivedAt = new Date().toISOString();
    try {await put(path, JSON.stringify({...entry, reference:body.id, receivedAt}), {access:'private', contentType:'application/json', addRandomSuffix:false, allowOverwrite:false});}
    catch (error) {if (!/already exists/i.test(error.message)) throw error;}
    if (process.env.GMAIL_APP_PASSWORD) {
      try {
        const user = process.env.GMAIL_USER || 'jasmelacosta@gmail.com';
        const transport = nodemailer.createTransport({service:'gmail', auth:{user, pass:process.env.GMAIL_APP_PASSWORD}, connectionTimeout:8000, socketTimeout:10000});
        await transport.sendMail({from:user, to:'jasmelacosta@gmail.com', replyTo:entry.email, subject:'AIMS website inquiry — ' + entry.practice.replace(/[\r\n]/g,' '), text:Object.entries({...entry, reference:body.id, receivedAt}).map(([k,v])=>k+'\n'+v).join('\n\n')});
      } catch {console.warn('Inquiry saved; email notification failed. Reference:', body.id);}
    }
    return res.status(201).json({reference:body.id, received:true});
  } catch (error) {
    console.error('Inquiry storage failed', error.name);
    return res.status(503).json({error:'We could not save your request. Please email jasmelacosta@gmail.com or call (786) 643-2099.'});
  }
}
