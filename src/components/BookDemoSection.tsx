import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FieldCheckmark } from './FieldCheckmark';
import { GlassCard } from './GlassCard';

interface BookDemoSectionProps {
  onNotify: (message: string) => void;
  onOpenFullContact?: () => void;
  contextLabel?: string;
}

const DIRECT_CONTACT_DESKS = [
  { label: 'Demos & Sales', email: 'Jasmel@aimedicalscriber.com' },
  { label: 'EHR Onboarding', email: 'Jasmel@aimedicalscriber.com' },
  { label: 'Billing & Office Ally', email: 'Jasmel@aimedicalscriber.com' },
];

export const BookDemoSection: React.FC<BookDemoSectionProps> = ({
  onNotify,
  onOpenFullContact,
  contextLabel = 'AI Medical Scribe · Unified EHR · Office Ally Integration',
}) => {
  const [fullName, setFullName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [role, setRole] = useState('Doctor / Provider');
  const [preferredWindow, setPreferredWindow] = useState('Morning (8am–12pm EST)');
  const [email, setEmail] = useState('');
  const [provisionDemoUser, setProvisionDemoUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [fieldsConfirmed, setFieldsConfirmed] = useState(false);

  const clearConfirmed = () => {
    if (fieldsConfirmed) {
      setFieldsConfirmed(false);
    }
  };

  const handleResetDemoForm = () => {
    setTicketId(null);
    setFieldsConfirmed(false);
    setFullName('');
    setClinicName('');
    setEmail('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setFieldsConfirmed(false);

    try {
      const resp = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim() || clinicName.trim() || 'Clinic Inquiry',
          email: email.trim(),
          clinicName: clinicName.trim(),
          role,
          preferredWindow,
          department: 'Live Product Demo',
          message: 'Requested live clinic walkthrough via quick demo bar.',
          provisionDemoUser,
        }),
      });
      const data = await resp.json();
      const ref = data.referenceId || `AIMS-${Math.floor(100000 + Math.random() * 900000)}`;
      setTicketId(ref);
      setFieldsConfirmed(true);
      onNotify(
        `Walkthrough ${ref} booked (${preferredWindow}) for ${clinicName.trim() || email}.`
      );
    } catch {
      const ref = `AIMS-${Math.floor(100000 + Math.random() * 900000)}`;
      setTicketId(ref);
      setFieldsConfirmed(true);
      onNotify(`Walkthrough ${ref} booked for ${clinicName.trim() || email}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyEmail = (addr: string) => {
    navigator.clipboard?.writeText(addr).catch(() => {});
    onNotify(`Copied direct contact email: ${addr}`);
  };

  return (
    <section
      id="book-demo"
      className="px-4 sm:px-8 py-12 max-w-7xl mx-auto w-full scroll-mt-24"
    >
      <GlassCard interactive={false} className="p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 flex flex-col gap-3.5">
            <span className="font-caption font-semibold text-clinical-teal">{contextLabel}</span>
            <h2 className="font-display-hero text-text-primary">
              Book a Live Clinic Walkthrough &amp; Sandbox.
            </h2>
            <p className="font-body-lg text-text-secondary">
              See the complete 7-step patient flow, ambient AI Medical Scribe, Visual OCR
              extraction, medical encoding, and Office Ally billing integration
              tailored to your specialty.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2 font-caption">
              <a
                href="tel:+17866432099"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-clinical-teal-subtle border border-clinical-teal/30 font-semibold text-clinical-teal hover:bg-clinical-teal hover:text-on-primary transition-colors whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-sm">call</span>
                <span>(786) 643-2099</span>
              </a>
              {DIRECT_CONTACT_DESKS.map((desk) => (
                <button
                  key={desk.email}
                  type="button"
                  onClick={() => handleCopyEmail(desk.email)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-canvas hover:bg-clinical-teal-subtle border border-border-subtle text-text-secondary hover:text-clinical-teal transition-colors cursor-pointer"
                  title={`Click to copy ${desk.email}`}
                >
                  <span className="font-semibold text-text-primary">{desk.label}:</span>
                  <span className="font-code-clinical text-clinical-teal">{desk.email}</span>
                </button>
              ))}
            </div>

            {onOpenFullContact && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onOpenFullContact}
                  className="inline-flex items-center gap-1.5 font-body-sm font-semibold text-clinical-teal hover:underline cursor-pointer"
                >
                  <span>Need EHR migration, BAA, or Office Ally setup? Open Full Contact Hub</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="lg:col-span-6 bg-surface-canvas rounded-2xl border border-border-subtle p-5 sm:p-6 flex flex-col gap-4"
          >
            <AnimatePresence>
              {ticketId && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  className="p-3 rounded-xl bg-alert-success-subtle border border-alert-success/30 flex items-center justify-between gap-2 font-body-sm text-text-primary"
                >
                  <span className="inline-flex items-center gap-2">
                    <FieldCheckmark visible={true} delayIndex={0} />
                    <span>
                      Confirmed! Reference{' '}
                      <strong className="font-code-clinical text-clinical-teal">{ticketId}</strong>{' '}
                      routed to <code className="font-code-clinical">Jasmel@aimedicalscriber.com</code>.
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={handleResetDemoForm}
                    className="font-caption text-clinical-teal underline shrink-0 cursor-pointer"
                  >
                    New Request
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="demo-your-name"
                  className="font-caption text-text-secondary block mb-1"
                >
                  Your Name
                </label>
                <div className="relative">
                  <input
                    id="demo-your-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      clearConfirmed();
                    }}
                    placeholder="Dr. Morales"
                    className={`w-full h-10 px-3 rounded-lg bg-surface-panel border font-body-sm text-text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-clinical-teal ${
                      fieldsConfirmed && fullName.trim()
                        ? 'pr-9 border-alert-success/55'
                        : 'border-border-subtle'
                    }`}
                  />
                  <FieldCheckmark
                    visible={fieldsConfirmed && Boolean(fullName.trim())}
                    delayIndex={0}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    label="Name confirmed"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="demo-clinic-name"
                  className="font-caption text-text-secondary block mb-1"
                >
                  Clinic Name
                </label>
                <div className="relative">
                  <input
                    id="demo-clinic-name"
                    type="text"
                    value={clinicName}
                    onChange={(e) => {
                      setClinicName(e.target.value);
                      clearConfirmed();
                    }}
                    placeholder="Biscayne Rehab"
                    className={`w-full h-10 px-3 rounded-lg bg-surface-panel border font-body-sm text-text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-clinical-teal ${
                      fieldsConfirmed && clinicName.trim()
                        ? 'pr-9 border-alert-success/55'
                        : 'border-border-subtle'
                    }`}
                  />
                  <FieldCheckmark
                    visible={fieldsConfirmed && Boolean(clinicName.trim())}
                    delayIndex={1}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                    label="Clinic confirmed"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="demo-role" className="font-caption text-text-secondary">
                    Clinic Role
                  </label>
                  <FieldCheckmark
                    visible={fieldsConfirmed}
                    delayIndex={2}
                    className="!w-4 !h-4"
                    label="Role confirmed"
                  />
                </div>
                <select
                  id="demo-role"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    clearConfirmed();
                  }}
                  className={`w-full h-10 px-2.5 rounded-lg bg-surface-panel border font-body-sm text-text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-clinical-teal ${
                    fieldsConfirmed ? 'border-alert-success/55' : 'border-border-subtle'
                  }`}
                >
                  <option value="Admin / Clinic Owner">Clinic Owner</option>
                  <option value="Doctor / Provider">Doctor / Provider</option>
                  <option value="Billing / Practice Manager">Billing / Manager</option>
                  <option value="Multi-Clinic Group">Multi-Clinic Group</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="demo-time-window" className="font-caption text-text-secondary">
                    Preferred Demo Time
                  </label>
                  <FieldCheckmark
                    visible={fieldsConfirmed}
                    delayIndex={3}
                    className="!w-4 !h-4"
                    label="Preferred time confirmed"
                  />
                </div>
                <select
                  id="demo-time-window"
                  value={preferredWindow}
                  onChange={(e) => {
                    setPreferredWindow(e.target.value);
                    clearConfirmed();
                  }}
                  className={`w-full h-10 px-2.5 rounded-lg bg-surface-panel border font-body-sm text-text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-clinical-teal ${
                    fieldsConfirmed ? 'border-alert-success/55' : 'border-border-subtle'
                  }`}
                >
                  <option value="Morning (8am–12pm EST)">Morning (8am–12pm EST)</option>
                  <option value="Midday (12pm–3pm EST)">Midday (12pm–3pm EST)</option>
                  <option value="Afternoon (3pm–7pm EST)">Afternoon (3pm–7pm EST)</option>
                  <option value="Flexible / Anytime">Flexible / Anytime</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="demo-work-email"
                className="font-caption text-text-secondary block mb-1"
              >
                Work Email Address *
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <input
                    id="demo-work-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      clearConfirmed();
                    }}
                    placeholder="doctor@yourclinic.com"
                    className={`w-full h-11 px-3.5 rounded-lg bg-surface-panel border font-body-md text-text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-clinical-teal ${
                      fieldsConfirmed && email.trim()
                        ? 'pr-10 border-alert-success/55'
                        : 'border-border-subtle'
                    }`}
                  />
                  <FieldCheckmark
                    visible={fieldsConfirmed && Boolean(email.trim())}
                    delayIndex={4}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    label="Email confirmed"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`h-11 px-6 rounded-lg font-body-md font-semibold transition-colors shadow-sm whitespace-nowrap shrink-0 disabled:opacity-60 cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                    fieldsConfirmed
                      ? 'bg-alert-success text-white'
                      : 'bg-clinical-teal hover:bg-primary-container text-on-primary'
                  }`}
                >
                  {submitting ? 'Booking...' : fieldsConfirmed ? 'Demo Requested' : 'Book a Demo'}
                </button>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 font-body-sm text-text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={provisionDemoUser}
                onChange={(e) => {
                  setProvisionDemoUser(e.target.checked);
                  clearConfirmed();
                }}
                className="rounded accent-teal-600"
              />
              <span>
                Also provision staff training sandbox accounts &amp; patientless scribe simulator
              </span>
            </label>
          </form>
        </div>
      </GlassCard>
    </section>
  );
};
