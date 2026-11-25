import { useEffect, useRef, useState, type FormEvent } from 'react';

export const siteReview = true;
export const contactEmail = 'jasmelacosta@gmail.com';
export const contactPhone = '+17866432099';

interface SubmittedReceipt {
  reference: string;
  name: string;
  practice: string;
  email: string;
  preferredTime: string;
  emailConfirmationSent?: boolean;
}

export function prefillAndScrollToContact(prefillText?: string) {
  if (prefillText) {
    window.dispatchEvent(new CustomEvent('aims:prefill-contact', { detail: prefillText }));
  }
  const el = document.getElementById('section-contact') || document.getElementById('book-demo');
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function ReviewContact({ id }: { id: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'received' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [inquiryText, setInquiryText] = useState('');
  const [preferredTime, setPreferredTime] = useState('Flexible — let’s agree on a time by email');
  const [receipt, setReceipt] = useState<SubmittedReceipt | null>(null);
  const requestId = useRef(crypto.randomUUID());
  const locked = useRef(false);

  useEffect(() => {
    function onPrefill(e: Event) {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) {
        setState('idle');
        setInquiryText(detail);
      }
    }
    window.addEventListener('aims:prefill-contact', onPrefill);
    return () => window.removeEventListener('aims:prefill-contact', onPrefill);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked.current) return;
    locked.current = true;
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') || '').trim();
    const practice = String(formData.get('practice') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const prefWindow = String(formData.get('preferredTime') || preferredTime).trim();
    const rawMsg = String(formData.get('message') || inquiryText).trim();
    const website = String(formData.get('website') || '').trim();

    const combinedMessage = prefWindow
      ? `${rawMsg}\n[Preferred walkthrough window: ${prefWindow}]`
      : rawMsg;

    setState('sending');
    try {
      const payload = {
        id: requestId.current,
        name,
        practice,
        email,
        phone,
        preferredTime: prefWindow,
        message: combinedMessage.slice(0, 1200),
        website,
      };

      let response: Response;
      try {
        response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(20000),
        });
      } catch {
        response = await fetch('https://aiscribers.com/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(20000),
        });
      }

      const result = await response.json();
      if (!response.ok || !result.received) {
        throw new Error(result.error || 'We could not save your request.');
      }

      setReceipt({
        reference: result.reference || requestId.current,
        name,
        practice,
        email,
        preferredTime: prefWindow,
        emailConfirmationSent: Boolean(result.emailConfirmationSent),
      });
      setMessage(
        `Your request has been received and saved (Reference ${
          result.reference || requestId.current
        }). Jasmel Acosta will follow up at ${email} to agree on a time for your walkthrough.`
      );
      setState('received');
    } catch (error) {
      setMessage(
        error instanceof Error && error.name !== 'TimeoutError'
          ? error.message
          : 'We could not confirm your request. Please retry or email Jasmel directly.'
      );
      setState('error');
    } finally {
      locked.current = false;
    }
  }

  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-32 px-4 py-12 sm:px-8">
      <div className="glass-surface grid gap-8 rounded-2xl border border-border-subtle p-6 sm:p-8 md:grid-cols-2">
        <div className="flex flex-col justify-between gap-4">
          <div>
            <span className="font-caption font-semibold text-clinical-teal">
              Walkthrough &amp; Dedicated Sandbox Request
            </span>
            <h2 className="font-headline-sm mt-1">
              Request a walkthrough — we&rsquo;ll agree on a time
            </h2>
            <p className="my-3 text-text-secondary">
              Tell Jasmel Acosta about your practice and the workflow you would like to see. We do not use an automated calendar link on this site—after you send your request, we&rsquo;ll reply directly by email or phone to agree on a walkthrough time and provision your clinic sandbox.
            </p>
            <div className="grid gap-2.5 text-clinical-teal underline font-medium">
              <a href={'tel:' + contactPhone}>(786) 643-2099</a>
              <a href={'mailto:' + contactEmail}>{contactEmail}</a>
              <a href="https://www.instagram.com/aiscribers/" target="_blank" rel="noreferrer">
                Instagram @aiscribers
              </a>
            </div>
          </div>

          <div className="rounded-xl bg-surface-canvas border border-border-subtle p-4 text-xs text-text-secondary space-y-1">
            <div className="font-semibold text-text-primary">
              Want to test AIMS right now before scheduling?
            </div>
            <p>
              Use the interactive <strong>Try Scribe Simulator</strong>,{' '}
              <strong>AI Billing Scrubber</strong>, and{' '}
              <strong>Recorded Walkthrough Video</strong> on this page—no account required.
            </p>
            <p className="pt-1 text-text-muted">
              Business inquiries only. Please leave protected patient information (PHI) out of this form.
            </p>
          </div>
        </div>

        {state === 'received' && receipt ? (
          <div
            role="status"
            aria-live="polite"
            className="space-y-4 self-center rounded-2xl border border-alert-success/40 bg-alert-success-subtle p-6 text-text-primary"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-clinical-teal px-3 py-1 text-xs font-semibold text-on-primary">
              <span>✓ Request Received &amp; Confirmed</span>
            </div>
            <h3 className="font-headline-sm">Thank you, {receipt.name}.</h3>
            <p className="font-body-sm text-text-secondary">{message}</p>
            <dl className="grid grid-cols-1 gap-2 rounded-xl bg-surface-panel p-4 text-xs border border-border-subtle">
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">Confirmation Reference:</dt>
                <dd className="font-mono font-semibold text-clinical-teal">{receipt.reference}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">Practice / Organization:</dt>
                <dd className="font-semibold text-text-primary">{receipt.practice}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">Follow-Up Email:</dt>
                <dd className="font-semibold text-text-primary">{receipt.email}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-text-muted">Preferred Window:</dt>
                <dd className="text-text-secondary">{receipt.preferredTime}</dd>
              </div>
            </dl>
            <button
              type="button"
              className="rounded-xl bg-clinical-teal px-4 py-2.5 text-sm font-semibold text-on-primary hover:opacity-90 cursor-pointer"
              onClick={() => {
                requestId.current = crypto.randomUUID();
                setReceipt(null);
                setInquiryText('');
                setState('idle');
              }}
            >
              Send another inquiry
            </button>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="aims-inquiry grid gap-3"
            aria-label="AIMS walkthrough inquiry"
          >
            <label>
              Your name
              <input name="name" autoComplete="name" required maxLength={80} placeholder="Dr. Elena Morales" />
            </label>
            <label>
              Practice or organization
              <input
                name="practice"
                autoComplete="organization"
                required
                maxLength={100}
                placeholder="Biscayne Rehab & Wellness"
              />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={150}
                  placeholder="doctor@yourclinic.com"
                />
              </label>
              <label>
                Phone (optional)
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={40}
                  placeholder="(305) 555-0192"
                />
              </label>
            </div>
            <label>
              Preferred day or time window (we&rsquo;ll confirm by email)
              <select
                name="preferredTime"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-surface-panel border border-border-subtle font-body-sm text-text-primary"
              >
                <option value="Flexible — let’s agree on a time by email">
                  Flexible — let&rsquo;s agree on a time by email
                </option>
                <option value="Weekday Mornings (8am–12pm EST)">
                  Weekday Mornings (8am–12pm EST)
                </option>
                <option value="Weekday Midday (12pm–3pm EST)">
                  Weekday Midday (12pm–3pm EST)
                </option>
                <option value="Weekday Afternoons (3pm–6pm EST)">
                  Weekday Afternoons (3pm–6pm EST)
                </option>
              </select>
            </label>
            <label>
              What would you like to see?
              <textarea
                name="message"
                maxLength={1200}
                required
                rows={3}
                value={inquiryText}
                onChange={(e) => setInquiryText(e.target.value)}
                placeholder="e.g. Ambient AI Scribe, 33-question intake, Office Ally 837P billing, or dedicated sandbox access..."
              />
            </label>
            <label className="sr-only" aria-hidden="true">
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <button
              type="submit"
              disabled={state === 'sending'}
              className="rounded-xl bg-clinical-teal text-on-primary px-4 py-3 font-semibold disabled:opacity-60 cursor-pointer"
            >
              {state === 'sending' ? 'Sending request…' : 'Send request (we’ll agree on a time)'}
            </button>
            {state === 'error' && (
              <p role="alert" className="text-sm text-alert-critical">
                {message} You can also{' '}
                <a className="underline" href={'mailto:' + contactEmail}>
                  email Jasmel directly
                </a>
                .
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
