import { Mic, FileText, ClipboardCheck, PlayCircle, Sparkles } from 'lucide-react';
import type { AppTabId } from '../App';
import type { SandboxMode } from './InteractiveScribeSandbox';

interface HeroWorkflowProps {
  onNavigateSection: (tab: AppTabId, sectionId?: string) => void;
  onOpenSandbox?: (mode: SandboxMode) => void;
}

export function HeroWorkflow({ onNavigateSection, onOpenSandbox }: HeroWorkflowProps) {
  return (
    <section
      id="section-home"
      aria-labelledby="hero-heading"
      className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 pb-8 pt-6 sm:px-8"
    >
      <div className="grid items-center gap-8 rounded-3xl border border-border-subtle bg-surface-panel p-5 shadow-xl sm:p-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10 lg:p-10">
        <div>
          <p className="mb-3 text-sm font-semibold text-clinical-teal">AIMS Clinical Platform</p>
          <h1
            id="hero-heading"
            className="text-balance text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl"
          >
            Focus on the patient in front of you.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-text-secondary">
            Patients can speak or type their symptoms, recent tests, and family history before they arrive. Your front desk starts with those details in hand. During the visit, AIMS drafts the note so you can listen, then review and sign.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (onOpenSandbox) {
                  onOpenSandbox('scribe');
                } else {
                  onNavigateSection('platform', 'section-sandbox');
                }
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-clinical-teal px-4 py-2.5 font-semibold text-on-primary shadow-sm hover:opacity-90 cursor-pointer"
            >
              <Sparkles size={18} aria-hidden="true" />
              <span>Try Scribe Simulator</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (onOpenSandbox) {
                  onOpenSandbox('video');
                } else {
                  onNavigateSection('platform', 'section-sandbox');
                }
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border-subtle bg-surface-canvas px-4 py-2.5 font-semibold text-text-primary hover:border-clinical-teal cursor-pointer"
            >
              <PlayCircle size={18} className="text-clinical-teal" aria-hidden="true" />
              <span>Watch Recorded Walkthrough</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateSection('platform', 'section-contact')}
              className="min-h-11 px-2 font-semibold text-clinical-teal underline underline-offset-4 cursor-pointer"
            >
              Request a walkthrough (we&rsquo;ll agree on a time)
            </button>
          </div>

          <p className="mt-3 text-xs text-text-muted">
            Interactive Scribe &amp; Billing Sandbox and recorded video walkthrough are available right below without signing in. For a live walkthrough, send a request and we&rsquo;ll agree on a time.
          </p>
        </div>

        <figure className="relative isolate min-w-0 overflow-hidden rounded-3xl border border-white/15 bg-[#16283d] p-5 text-white sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,#3a5b7d,transparent_68%)]"
          />
          <img
            src="/images/consultation-recording.webp"
            alt="A phone displaying an active microphone and waveform during an office consultation"
            width={1200}
            height={900}
            fetchPriority="high"
            className="mb-4 h-auto w-full rounded-2xl"
          />
          <figcaption className="mb-6 text-sm font-semibold text-blue-100">
            A sample clinic visit
          </figcaption>
          <ol className="space-y-3">
            <li className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4">
              <Mic size={22} className="shrink-0 text-blue-200" aria-hidden="true" />
              <div>
                <p className="font-semibold">Visit conversation</p>
              </div>
            </li>
            <li className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4">
              <FileText size={22} className="shrink-0 text-blue-200" aria-hidden="true" />
              <div>
                <p className="font-semibold">Draft note</p>
              </div>
            </li>
            <li className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-4">
              <ClipboardCheck size={22} className="shrink-0 text-blue-200" aria-hidden="true" />
              <div>
                <p className="font-semibold">Clinician review</p>
              </div>
            </li>
          </ol>
        </figure>
      </div>
    </section>
  );
}
