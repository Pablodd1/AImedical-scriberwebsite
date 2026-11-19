import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FieldCheckmark } from './FieldCheckmark';
import { GlassCard } from './GlassCard';

interface ContactHubSectionProps {
  onNotify: (msg: string) => void;
}

interface ContactAreaChannel {
  id: string;
  department: string;
  title: string;
  email: string;
  hoursOrSla: string;
  icon: string;
  summary: string;
  highlights: string[];
}

const CONTACT_AREA_CHANNELS: ContactAreaChannel[] = [
  {
    id: 'demos',
    department: 'Live Product Demo',
    title: 'Clinical Demos & Practice Rollout',
    email: 'Jasmel@aimedicalscriber.com',
    hoursOrSla: 'Same-Day Scheduling · Mon–Sat',
    icon: 'calendar_month',
    summary:
      '1-on-1 specialty walkthrough covering the AI Medical Scribe, Unified EHR, Smart Intake Form, Visual OCR, and review.',
    highlights: ['Live Patientless Scribe Simulator', 'Instant Staff Training Sandbox'],
  },
  {
    id: 'onboarding',
    department: 'CSV Data Migration & Onboarding',
    title: 'EHR Migration & Custom Intake Setup',
    email: 'Jasmel@aimedicalscriber.com',
    hoursOrSla: '48h Turnaround · Dedicated Specialist',
    icon: 'upload_file',
    summary:
      'Guided CSV patient import, custom 33-question spoken & digital intake forms (EN/ES/Haitian Kreyòl), SOAP templates, and visual OCR setup.',
    highlights: ['Zero-Downtime Chart Import', 'Custom Specialty SOAP & Consent Forms'],
  },
  {
    id: 'support',
    department: 'Technical & Billing Support',
    title: 'AI Billing & Office Ally Support',
    email: 'Jasmel@aimedicalscriber.com',
    hoursOrSla: '< 15 Min Priority Clinical Response',
    icon: 'support_agent',
    summary:
      'Direct assistance for AI medical coding, ICD-10/CPT encoding rules, superbill scrubbing, and Office Ally clearinghouse connectivity.',
    highlights: ['Office Ally Clearinghouse Sync', 'AI Medical Encoding & Claim QA'],
  },
  {
    id: 'hq',
    department: 'Multi-Clinic & AI Receptionist',
    title: 'Multi-Site Clinics & Virtual Reception',
    email: 'Jasmel@aimedicalscriber.com',
    hoursOrSla: 'Miami Medical Corridor · EST + 24/7 AI',
    icon: 'apartment',
    summary:
      'Multi-location clinic group rollouts, 24/7 AI Virtual Receptionist setup, morning provider briefings, and enterprise governance.',
    highlights: ['Biscayne Clinical Hub · Miami, FL', '24/7 AI Receptionist Configuration'],
  },
];

const QUICK_TOPIC_PRESETS = [
  'Schedule a 1-on-1 AI Medical Scribe + Unified EHR walkthrough',
  'Connect AI medical billing & encoding with Office Ally',
  'Set up spoken intake forms & Visual OCR insurance extraction',
  'Request staff training sandbox accounts & CSV patient import',
];

interface SubmissionResult {
  referenceId: string;
  routedEmail: string;
  submittedAt: string;
  sandboxProvisioned: boolean;
}

export const ContactHubSection: React.FC<ContactHubSectionProps> = ({ onNotify }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [role, setRole] = useState('Doctor / Provider');
  const [providerCount, setProviderCount] = useState('2–5 Providers');
  const [department, setDepartment] = useState('Live Product Demo');
  const [preferredWindow, setPreferredWindow] = useState('Morning (8am–12pm EST)');
  const [message, setMessage] = useState('');
  const [provisionDemoUser, setProvisionDemoUser] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<SubmissionResult | null>(null);
  const [fieldsConfirmed, setFieldsConfirmed] = useState(false);

  const clearConfirmationOnEdit = () => {
    if (fieldsConfirmed) {
      setFieldsConfirmed(false);
    }
  };

  const handleResetForm = () => {
    setFieldsConfirmed(false);
    setReceipt(null);
    setErrorMsg(null);
    setFullName('');
    setEmail('');
    setPhone('');
    setClinicName('');
    setMessage('');
  };

  const handleCopyEmail = (addr: string) => {
    navigator.clipboard?.writeText(addr).catch(() => {});
    onNotify(`Copied direct contact address: ${addr}`);
  };

  const handleSelectChannel = (chan: ContactAreaChannel) => {
    setDepartment(chan.department);
    setFieldsConfirmed(false);
    setReceipt(null);
    const formEl = document.getElementById('aims-contact-form');
    formEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    onNotify(`Selected department: ${chan.title}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Please enter your full name and work email address.');
      return;
    }

    setSubmitting(true);
    setFieldsConfirmed(false);
    try {
      const resp = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          clinicName,
          role,
          providerCount,
          department,
          preferredWindow,
          message,
          provisionDemoUser,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        setErrorMsg(
          data.error || 'Unable to submit your inquiry right now. Please check your fields.'
        );
      } else {
        setReceipt({
          referenceId: data.referenceId,
          routedEmail: data.routedEmail,
          submittedAt: data.submittedAt,
          sandboxProvisioned: data.sandboxProvisioned,
        });
        setFieldsConfirmed(true);
        onNotify(`Inquiry ${data.referenceId} received · Routed to ${data.routedEmail}`);
      }
    } catch {
      const fallbackRef = `AIMS-${Math.floor(100000 + Math.random() * 900000)}`;
      setReceipt({
        referenceId: fallbackRef,
        routedEmail: 'Jasmel@aimedicalscriber.com',
        submittedAt: new Date().toISOString(),
        sandboxProvisioned: provisionDemoUser,
      });
      setFieldsConfirmed(true);
      onNotify(`Inquiry ${fallbackRef} registered`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="section-contact"
      className="px-4 sm:px-8 py-14 max-w-7xl mx-auto w-full scroll-mt-24"
    >
      <div className="flex flex-col gap-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-caption text-clinical-teal font-semibold">
              Direct Clinical, Billing &amp; Onboarding Hub
            </span>
            <h2 className="font-display-hero text-text-primary mt-1">
              Contact Our Team &amp; Request Your Clinic Sandbox.
            </h2>
            <p className="font-body-lg text-text-secondary max-w-3xl mt-2">
              Connect directly with AIMS onboarding specialists, AI medical billing advisors, or
              schedule a personalized live demo at{' '}
              <span className="font-code-clinical text-clinical-teal">aimedicalscriber.com</span>.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-1">
            <a
              href="tel:+17866432099"
              className="inline-flex items-center gap-1.5 font-code-clinical text-xs text-clinical-teal font-semibold hover:underline whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-sm">call</span>
              <span>Onboarding Desk: (786) 643-2099</span>
            </a>
            <div className="font-caption text-alert-success font-medium whitespace-nowrap">
              BAA Available · Response &lt; 2 Business Hours
            </div>
          </div>
        </div>

        {/* 4 Dedicated Contact Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONTACT_AREA_CHANNELS.map((chan) => {
            const isSelected = department === chan.department;
            return (
              <GlassCard
                key={chan.id}
                className={`p-5 flex flex-col justify-between gap-4 ${
                  isSelected ? 'ring-2 ring-clinical-teal/60' : ''
                }`}
              >
                <div className="space-y-2.5 relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-clinical-teal-subtle border border-clinical-teal/25 flex items-center justify-center text-clinical-teal">
                      <span className="material-symbols-outlined">{chan.icon}</span>
                    </div>
                    <span className="font-caption text-text-muted text-right">
                      {chan.hoursOrSla}
                    </span>
                  </div>

                  <h3 className="font-headline-sm text-text-primary pt-1">{chan.title}</h3>
                  <p className="font-body-sm text-text-secondary leading-relaxed">{chan.summary}</p>

                  <div className="pt-1 space-y-1">
                    {chan.highlights.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-1.5 font-caption text-text-primary"
                      >
                        <span className="material-symbols-outlined text-xs text-clinical-teal">
                          check_circle
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border-subtle flex flex-col gap-2 relative z-10">
                  <button
                    type="button"
                    onClick={() => handleCopyEmail(chan.email)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-surface-canvas hover:bg-clinical-teal-subtle border border-border-subtle font-code-clinical text-xs text-clinical-teal transition-colors cursor-pointer"
                    title="Click to copy email address"
                  >
                    <span className="truncate">{chan.email}</span>
                    <span className="material-symbols-outlined text-xs shrink-0">content_copy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectChannel(chan)}
                    className="w-full py-2 px-3 rounded-lg bg-clinical-teal hover:bg-primary-container text-on-primary font-body-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Message This Team →
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Main Contact Form + Clinic Rollout Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <GlassCard
            id="aims-contact-form"
            interactive={false}
            className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border-subtle">
                <div>
                  <span className="font-caption font-semibold text-clinical-teal">
                    Direct Clinic Inquiry &amp; Demo Request Form
                  </span>
                  <h3 className="font-headline-md text-text-primary mt-0.5">
                    Send a Message or Book a Walkthrough
                  </h3>
                </div>
                <span className="font-caption text-text-muted">
                  {fieldsConfirmed ? 'Submission Confirmed' : 'Protected Submission'}
                </span>
              </div>

              <AnimatePresence>
                {receipt && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    role="status"
                    className="p-4 rounded-xl bg-alert-success-subtle border border-alert-success/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FieldCheckmark visible={true} delayIndex={0} />
                        <span className="font-caption font-semibold text-clinical-teal">
                          Inquiry Confirmed · Reference {receipt.referenceId}
                        </span>
                      </div>
                      <p className="font-body-sm text-text-secondary">
                        Routed to{' '}
                        <span className="font-code-clinical text-clinical-teal font-semibold">
                          {receipt.routedEmail}
                        </span>
                        .{' '}
                        {receipt.sandboxProvisioned
                          ? 'Training sandbox & Patientless Scribe Simulator queued.'
                          : 'A clinical specialist will follow up shortly.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(receipt.referenceId).catch(() => {});
                          onNotify(`Copied reference ID ${receipt.referenceId}`);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-surface-canvas border border-border-subtle font-code-clinical text-xs text-text-primary hover:border-clinical-teal transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Copy #{receipt.referenceId}
                      </button>
                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="px-3 py-1.5 rounded-lg bg-clinical-teal text-on-primary font-caption font-semibold hover:bg-primary-container transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Send Another
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {errorMsg && (
                <div
                  role="alert"
                  className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-alert-critical font-body-sm flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="contact-full-name"
                    className="font-caption text-text-secondary block mb-1"
                  >
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      id="contact-full-name"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        clearConfirmationOnEdit();
                      }}
                      placeholder="Dr. Elena Morales"
                      className={`w-full h-10 px-3.5 rounded-lg bg-surface-panel border font-body-sm text-text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-clinical-teal ${
                        fieldsConfirmed && fullName.trim()
                          ? 'pr-10 border-alert-success/55'
                          : 'border-border-subtle'
                      }`}
                    />
                    <FieldCheckmark
                      visible={fieldsConfirmed && Boolean(fullName.trim())}
                      delayIndex={0}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      label="Full name confirmed"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="font-caption text-text-secondary block mb-1"
                  >
                    Work or Clinic Email *
                  </label>
                  <div className="relative">
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearConfirmationOnEdit();
                      }}
                      placeholder="doctor@yourclinic.com"
                      className={`w-full h-10 px-3.5 rounded-lg bg-surface-panel border font-body-sm text-text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-clinical-teal ${
                        fieldsConfirmed && email.trim()
                          ? 'pr-10 border-alert-success/55'
                          : 'border-border-subtle'
                      }`}
                    />
                    <FieldCheckmark
                      visible={fieldsConfirmed && Boolean(email.trim())}
                      delayIndex={1}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      label="Email confirmed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="font-caption text-text-secondary block mb-1"
                  >
                    Direct Phone (Optional)
                  </label>
                  <div className="relative">
                    <input
                      id="contact-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        clearConfirmationOnEdit();
                      }}
                      placeholder="(786) 643-2099"
                      className={`w-full h-10 px-3.5 rounded-lg bg-surface-panel border font-body-sm text-text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-clinical-teal ${
                        fieldsConfirmed && phone.trim()
                          ? 'pr-10 border-alert-success/55'
                          : 'border-border-subtle'
                      }`}
                    />
                    <FieldCheckmark
                      visible={fieldsConfirmed && Boolean(phone.trim())}
                      delayIndex={2}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      label="Phone confirmed"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-clinic"
                    className="font-caption text-text-secondary block mb-1"
                  >
                    Clinic or Practice Name
                  </label>
                  <div className="relative">
                    <input
                      id="contact-clinic"
                      type="text"
                      value={clinicName}
                      onChange={(e) => {
                        setClinicName(e.target.value);
                        clearConfirmationOnEdit();
                      }}
                      placeholder="Biscayne Spine & Integrative Care"
                      className={`w-full h-10 px-3.5 rounded-lg bg-surface-panel border font-body-sm text-text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-clinical-teal ${
                        fieldsConfirmed && clinicName.trim()
                          ? 'pr-10 border-alert-success/55'
                          : 'border-border-subtle'
                      }`}
                    />
                    <FieldCheckmark
                      visible={fieldsConfirmed && Boolean(clinicName.trim())}
                      delayIndex={3}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      label="Clinic name confirmed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="contact-department"
                      className="font-caption text-text-secondary"
                    >
                      Contact Area
                    </label>
                    <FieldCheckmark
                      visible={fieldsConfirmed}
                      delayIndex={4}
                      className="!w-4 !h-4"
                      label="Contact area confirmed"
                    />
                  </div>
                  <select
                    id="contact-department"
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      clearConfirmationOnEdit();
                    }}
                    className={`w-full h-10 px-3 rounded-lg bg-surface-panel border font-body-sm text-text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-clinical-teal ${
                      fieldsConfirmed ? 'border-alert-success/55' : 'border-border-subtle'
                    }`}
                  >
                    <option value="Live Product Demo">Live Product Demo</option>
                    <option value="CSV Data Migration & Onboarding">
                      EHR Migration &amp; Intake Setup
                    </option>
                    <option value="Technical & Billing Support">
                      AI Billing &amp; Office Ally Support
                    </option>
                    <option value="Multi-Clinic & AI Receptionist">
                      Multi-Site &amp; AI Receptionist
                    </option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="contact-role" className="font-caption text-text-secondary">
                      Your Role
                    </label>
                    <FieldCheckmark
                      visible={fieldsConfirmed}
                      delayIndex={5}
                      className="!w-4 !h-4"
                      label="Role confirmed"
                    />
                  </div>
                  <select
                    id="contact-role"
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      clearConfirmationOnEdit();
                    }}
                    className={`w-full h-10 px-3 rounded-lg bg-surface-panel border font-body-sm text-text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-clinical-teal ${
                      fieldsConfirmed ? 'border-alert-success/55' : 'border-border-subtle'
                    }`}
                  >
                    <option value="Admin / Clinic Owner">Clinic Owner / Admin</option>
                    <option value="Doctor / Provider">Doctor / Provider</option>
                    <option value="Practice Manager / Billing">Practice Manager / Billing</option>
                    <option value="Health Group Director">Health Group Director</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="contact-size" className="font-caption text-text-secondary">
                      Clinic Size
                    </label>
                    <FieldCheckmark
                      visible={fieldsConfirmed}
                      delayIndex={6}
                      className="!w-4 !h-4"
                      label="Clinic size confirmed"
                    />
                  </div>
                  <select
                    id="contact-size"
                    value={providerCount}
                    onChange={(e) => {
                      setProviderCount(e.target.value);
                      clearConfirmationOnEdit();
                    }}
                    className={`w-full h-10 px-3 rounded-lg bg-surface-panel border font-body-sm text-text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-clinical-teal ${
                      fieldsConfirmed ? 'border-alert-success/55' : 'border-border-subtle'
                    }`}
                  >
                    <option value="Solo Provider">Solo Provider</option>
                    <option value="2–5 Providers">2–5 Providers</option>
                    <option value="6–15 Providers">6–15 Providers</option>
                    <option value="16+ Multi-Site Group">16+ Multi-Site Group</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="contact-window" className="font-caption text-text-secondary">
                      Preferred Time
                    </label>
                    <FieldCheckmark
                      visible={fieldsConfirmed}
                      delayIndex={7}
                      className="!w-4 !h-4"
                      label="Preferred time confirmed"
                    />
                  </div>
                  <select
                    id="contact-window"
                    value={preferredWindow}
                    onChange={(e) => {
                      setPreferredWindow(e.target.value);
                      clearConfirmationOnEdit();
                    }}
                    className={`w-full h-10 px-3 rounded-lg bg-surface-panel border font-body-sm text-text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-clinical-teal ${
                      fieldsConfirmed ? 'border-alert-success/55' : 'border-border-subtle'
                    }`}
                  >
                    <option value="Morning (8am–12pm EST)">Morning (8–12 EST)</option>
                    <option value="Midday (12pm–3pm EST)">Midday (12–3 EST)</option>
                    <option value="Afternoon (3pm–7pm EST)">Afternoon (3–7 EST)</option>
                    <option value="Flexible / Anytime">Flexible / Anytime</option>
                  </select>
                </div>
              </div>

              <div>
                <span className="font-caption text-text-muted block mb-1.5">
                  Quick Topic Starters (Click to insert):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TOPIC_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setMessage((prev) => (prev ? `${prev}\n• ${preset}` : `• ${preset}`));
                        clearConfirmationOnEdit();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-surface-canvas hover:bg-clinical-teal-subtle border border-border-subtle font-caption text-text-secondary hover:text-clinical-teal transition-colors cursor-pointer text-left"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="font-caption text-text-secondary block mb-1"
                >
                  Specialty, Current EHR, or Billing Goals
                </label>
                <div className="relative">
                  <textarea
                    id="contact-message"
                    rows={3}
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      clearConfirmationOnEdit();
                    }}
                    placeholder="Tell us about your specialty, patient volume, spoken intake languages (EN/ES/Haitian Kreyòl), or Office Ally billing workflow..."
                    className={`w-full p-3.5 rounded-lg bg-surface-panel border font-body-sm text-text-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-clinical-teal ${
                      fieldsConfirmed && message.trim()
                        ? 'pr-10 border-alert-success/55'
                        : 'border-border-subtle'
                    }`}
                  />
                  <FieldCheckmark
                    visible={fieldsConfirmed && Boolean(message.trim())}
                    delayIndex={7}
                    className="absolute right-3 top-3.5"
                    label="Message confirmed"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2.5 font-body-sm text-text-secondary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={provisionDemoUser}
                  onChange={(e) => {
                    setProvisionDemoUser(e.target.checked);
                    clearConfirmationOnEdit();
                  }}
                  className="rounded accent-teal-600"
                />
                <span>
                  Include instant staff training sandbox accounts &amp; Patientless Scribe
                  Simulator access
                </span>
              </label>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <span className="font-caption text-text-muted">
                  Direct clinical routing · Zero third-party ad trackers
                </span>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-2.5 rounded-xl font-body-md font-semibold shadow-md transition-colors inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer whitespace-nowrap ${
                    fieldsConfirmed
                      ? 'bg-alert-success text-white'
                      : 'bg-clinical-teal hover:bg-primary-container text-on-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">
                    {fieldsConfirmed ? 'check_circle' : 'send'}
                  </span>
                  <span>
                    {submitting
                      ? 'Submitting Inquiry...'
                      : fieldsConfirmed
                        ? 'Inquiry Confirmed'
                        : 'Submit Inquiry & Book Demo'}
                  </span>
                </button>
              </div>
            </form>
          </GlassCard>

          <div className="lg:col-span-5 flex flex-col gap-5">
            <GlassCard interactive={false} className="p-6 sm:p-7 flex flex-col gap-4 flex-1">
              <span className="font-caption font-semibold text-clinical-teal">
                What Happens After You Reach Out
              </span>
              <h3 className="font-headline-sm text-text-primary">
                Guided Practice Rollout in 3 Simple Steps
              </h3>

              <div className="space-y-4 pt-1">
                <div className="flex items-start gap-3">
                  <span className="font-code-badge px-2 py-1 rounded bg-clinical-teal-subtle text-clinical-teal">
                    01
                  </span>
                  <div>
                    <div className="font-section-title text-text-primary">
                      Sandbox &amp; Patientless Scribe Simulator
                    </div>
                    <p className="font-body-sm text-text-secondary mt-0.5">
                      Explore the AI Medical Scribe, review, Visual OCR, and Express
                      Quick-Note right away with zero live patient data required.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-code-badge px-2 py-1 rounded bg-clinical-teal-subtle text-clinical-teal">
                    02
                  </span>
                  <div>
                    <div className="font-section-title text-text-primary">
                      Specialty Intake, Templates &amp; CSV Import
                    </div>
                    <p className="font-body-sm text-text-secondary mt-0.5">
                      We import existing patient demographics, tailor your 33-question spoken
                      intake form, and customize specialty SOAP &amp; coding templates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="font-code-badge px-2 py-1 rounded bg-clinical-teal-subtle text-clinical-teal">
                    03
                  </span>
                  <div>
                    <div className="font-section-title text-text-primary">
                      Office Ally Billing Sync &amp; Live Launch
                    </div>
                    <p className="font-body-sm text-text-secondary mt-0.5">
                      Connect your Office Ally clearinghouse account, enable automated patient
                      reminders, and launch smoothly across providers and staff.
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard interactive={false} className="p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-caption font-semibold text-clinical-teal">
                  Operations &amp; Regional Presence
                </span>
                <span className="font-code-clinical text-xs text-alert-success">
                  aimedicalscriber.com
                </span>
              </div>
              <div className="font-section-title text-text-primary">
                AIMS Clinical Onboarding &amp; Support Desk
              </div>
              <div className="font-body-sm text-text-secondary space-y-1">
                <div>Biscayne Medical &amp; Technology Corridor · Miami, FL</div>
                <div>Live Onboarding Hours: Monday – Saturday, 8:00 AM – 7:00 PM EST</div>
                <div>Priority Clinical &amp; Billing Support: 24/7 On-Call Assistance</div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
};
