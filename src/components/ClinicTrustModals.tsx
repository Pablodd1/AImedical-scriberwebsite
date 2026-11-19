import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { FieldCheckmark } from './FieldCheckmark';
import { AimsBrandLogo } from './GlassCard';

export type LegalModalTab = 'baa' | 'privacy' | 'terms';

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
  onRequestSandbox: () => void;
  onNotify: (msg: string) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  open,
  onClose,
  onRequestSandbox,
  onNotify,
}) => {
  const [portalType, setPortalType] = useState<'provider' | 'patient'>('provider');
  const [clinicEmail, setClinicEmail] = useState('');
  const [clinicCode, setClinicCode] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicEmail.trim()) return;
    setStatusMessage(
      portalType === 'provider'
        ? `Single-sign-on verification link sent to ${clinicEmail.trim()} for aimedicalscriber.com.`
        : `Patient Portal magic sign-in link sent to ${clinicEmail.trim()}.`
    );
    onNotify(
      portalType === 'provider'
        ? 'Provider sign-in link dispatched'
        : 'Patient Portal sign-in link dispatched'
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-[9995] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-surface border border-border-subtle shadow-2xl overflow-hidden text-text-primary"
          >
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-canvas">
              <div className="flex items-center gap-2.5">
                <AimsBrandLogo className="h-8" />
                <span className="font-section-title text-text-primary">
                  AIMS Account Sign-In
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-surface-panel flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer"
                aria-label="Close sign-in modal"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Role Segmented Control */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-surface-canvas border border-border-subtle">
                <button
                  type="button"
                  onClick={() => {
                    setPortalType('provider');
                    setStatusMessage(null);
                  }}
                  className={`py-2 px-3 rounded-lg font-body-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    portalType === 'provider'
                      ? 'bg-clinical-teal text-on-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Provider &amp; Staff
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPortalType('patient');
                    setStatusMessage(null);
                  }}
                  className={`py-2 px-3 rounded-lg font-body-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    portalType === 'patient'
                      ? 'bg-clinical-teal text-on-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Patient Portal
                </button>
              </div>

              <p className="font-body-sm text-text-secondary">
                {portalType === 'provider'
                  ? 'Sign in to your clinic workspace for Ambient AI Medical Scribe, Unified EHR charts, coding, and Office Ally billing.'
                  : 'Access your upcoming appointments, mobile intake & insurance upload, telehealth visit link, and care summaries.'}
              </p>

              {statusMessage && (
                <div className="p-3.5 rounded-xl bg-alert-success-subtle border border-alert-success/35 flex items-start gap-2.5 font-body-sm text-text-primary">
                  <FieldCheckmark visible={true} delayIndex={0} className="mt-0.5" />
                  <span>{statusMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label
                    htmlFor="signin-email"
                    className="font-caption text-text-secondary block mb-1"
                  >
                    {portalType === 'provider' ? 'Clinic Work Email *' : 'Patient Email Address *'}
                  </label>
                  <div className="relative">
                    <input
                      id="signin-email"
                      type="email"
                      required
                      value={clinicEmail}
                      onChange={(e) => {
                        setClinicEmail(e.target.value);
                        setStatusMessage(null);
                      }}
                      placeholder={
                        portalType === 'provider'
                          ? 'doctor@yourclinic.com'
                          : 'patient@email.com'
                      }
                      className="w-full h-10 px-3.5 rounded-lg bg-surface-panel border border-border-subtle font-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-clinical-teal"
                    />
                    <FieldCheckmark
                      visible={Boolean(statusMessage && clinicEmail.trim())}
                      delayIndex={1}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>

                {portalType === 'provider' && (
                  <div>
                    <label
                      htmlFor="signin-clinic-id"
                      className="font-caption text-text-secondary block mb-1"
                    >
                      Practice Identifier (Optional)
                    </label>
                    <input
                      id="signin-clinic-id"
                      type="text"
                      value={clinicCode}
                      onChange={(e) => setClinicCode(e.target.value)}
                      placeholder="e.g. biscayne-rehab"
                      className="w-full h-10 px-3.5 rounded-lg bg-surface-panel border border-border-subtle font-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-clinical-teal"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-clinical-teal hover:bg-primary-container text-on-primary font-body-md font-semibold transition-colors cursor-pointer"
                >
                  {portalType === 'provider'
                    ? 'Send Workspace Sign-In Link'
                    : 'Send Patient Portal Link'}
                </button>
              </form>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-between gap-2 font-caption text-text-secondary">
                <span>Evaluating AIMS for your practice?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequestSandbox();
                  }}
                  className="text-clinical-teal font-semibold hover:underline cursor-pointer whitespace-nowrap"
                >
                  Request Training Sandbox →
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface LegalPolicyModalProps {
  activePolicy: LegalModalTab | null;
  onSelectPolicy: (tab: LegalModalTab) => void;
  onClose: () => void;
  onRequestBaa: () => void;
}

export const LegalPolicyModal: React.FC<LegalPolicyModalProps> = ({
  activePolicy,
  onSelectPolicy,
  onClose,
  onRequestBaa,
}) => {
  return (
    <AnimatePresence>
      {activePolicy && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="fixed inset-0 z-[9995] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl bg-surface border border-border-subtle shadow-2xl overflow-hidden text-text-primary max-h-[85vh] flex flex-col"
          >
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between bg-surface-canvas shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-clinical-teal">verified_user</span>
                <span className="font-section-title text-text-primary">
                  AIMS Clinical Trust, BAA &amp; Legal Policies
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-surface-panel flex items-center justify-center text-text-secondary hover:text-text-primary cursor-pointer"
                aria-label="Close legal policy dialog"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="px-6 pt-4 shrink-0">
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-surface-canvas border border-border-subtle">
                {[
                  { id: 'baa' as LegalModalTab, label: 'HIPAA & BAA' },
                  { id: 'privacy' as LegalModalTab, label: 'Privacy Policy' },
                  { id: 'terms' as LegalModalTab, label: 'Terms of Service' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onSelectPolicy(tab.id)}
                    className={`py-2 px-3 rounded-lg font-body-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      activePolicy === tab.id
                        ? 'bg-clinical-teal text-on-primary shadow-sm'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 font-body-sm text-text-secondary leading-relaxed">
              {activePolicy === 'baa' && (
                <>
                  <h3 className="font-headline-sm text-text-primary">
                    Business Associate Agreement (BAA) &amp; HIPAA-Conscious Architecture
                  </h3>
                  <p>
                    AIMS (Artificial Intelligence Medical Scribe) is built from the ground up for
                    HIPAA-conscious clinical workflows and executes a formal{' '}
                    <strong className="text-text-primary">
                      Business Associate Agreement (BAA)
                    </strong>{' '}
                    with onboarding healthcare practices prior to live Protected Health Information
                    (PHI) use.
                  </p>
                  <ul className="space-y-2 text-text-primary">
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-sm text-clinical-teal mt-0.5">
                        check_circle
                      </span>
                      <span>
                        <strong>Patientless Training Sandbox First:</strong> Clinics evaluate and
                        train staff using synthetic encounters before importing real patient records.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-sm text-clinical-teal mt-0.5">
                        check_circle
                      </span>
                      <span>
                        <strong>Role-Scoped Access &amp; Audit Trails:</strong> Separate permission
                        boundaries across Clinic Owners, Providers, Front-Desk Staff, and Portal
                        Patients, plus countersigned consent verification seals.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-sm text-clinical-teal mt-0.5">
                        check_circle
                      </span>
                      <span>
                        <strong>Protected Clearinghouse Connectivity:</strong> Scrubbed claims flow
                        solely to your authorized Office Ally clearinghouse account.
                      </span>
                    </li>
                  </ul>
                </>
              )}

              {activePolicy === 'privacy' && (
                <>
                  <h3 className="font-headline-sm text-text-primary">
                    Website &amp; Clinical Data Privacy Policy
                  </h3>
                  <p>
                    We never sell, rent, or share physician or patient data with advertising
                    networks. Inquiries submitted on <code className="font-code-clinical">aimedicalscriber.com</code>{' '}
                    are used strictly to coordinate live demonstrations, sandbox provisioning, EHR
                    migration, and Office Ally billing support.
                  </p>
                  <p>
                    Clinical audio, spoken intake responses, and visual OCR insurance/ID uploads
                    inside active clinic workspaces remain isolated to the treating practice and are
                    never used to market third-party products.
                  </p>
                </>
              )}

              {activePolicy === 'terms' && (
                <>
                  <h3 className="font-headline-sm text-text-primary">
                    Clinical Decision Support &amp; Platform Terms
                  </h3>
                  <p>
                    AIMS provides ambient clinical documentation, visual OCR extraction, SOAP review, and ICD-10 / CPT medical encoding suggestions to assist licensed
                    healthcare professionals.
                  </p>
                  <p>
                    The treating provider retains full clinical authority and reviews and signs every
                    chart note, prescription/care handout, and encoded superbill prior to permanent
                    EHR lock or Office Ally claim submission.
                  </p>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border-subtle bg-surface-canvas flex flex-wrap items-center justify-between gap-3 shrink-0">
              <span className="font-caption text-text-muted">
                For questions about privacy, call Jasmel at (786) 643-2099.
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestBaa();
                }}
                className="px-4 py-2 rounded-xl bg-clinical-teal hover:bg-primary-container text-on-primary font-body-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                Request BAA &amp; Clinic Onboarding
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
