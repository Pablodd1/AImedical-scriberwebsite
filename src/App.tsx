import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  DEFAULT_INK_PARAMS,
  inkBleedController,
  InkShaderMode,
  InkTuningParams,
  ThemeMode,
} from './engine/inkBleedEngine';
import { PlatformScreen } from './components/PlatformScreen';
import { ScribeAnd3DScreen } from './components/ScribeAnd3DScreen';
import { PatientFlowScreen } from './components/PatientFlowScreen';
import { SecurityAndBillingScreen } from './components/SecurityAndBillingScreen';
import { TuningPanel } from './components/TuningPanel';
import { AimsChatbotWidget } from './components/AimsChatbotWidget';
import { AimsBrandLogo } from './components/GlassCard';
import {
  LegalModalTab,
  LegalPolicyModal,
  SignInModal,
} from './components/ClinicTrustModals';

export type AppTabId = 'platform' | 'ai-scribe' | '7-step-flow' | 'security-hipaa';

export const TAB_SHADER_MAP: Record<AppTabId, InkShaderMode> = {
  platform: 'sumi',
  'ai-scribe': 'vortex',
  '7-step-flow': 'watercolor',
  'security-hipaa': 'burst',
};

const NAV_TABS: Array<{ id: AppTabId; label: string; mode: InkShaderMode }> = [
  { id: 'platform', label: 'Overview', mode: 'sumi' },
  { id: '7-step-flow', label: 'EHR & Portal', mode: 'watercolor' },
  { id: 'ai-scribe', label: 'AI Scribe & Voice', mode: 'vortex' },
  { id: 'security-hipaa', label: 'Billing & Security', mode: 'burst' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTabId>('platform');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [shaderMode, setShaderMode] = useState<InkShaderMode>('sumi');
  const [tuningParams, setTuningParams] = useState<InkTuningParams>(() => ({
    ...DEFAULT_INK_PARAMS,
  }));
  const [tuningOpen, setTuningOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [activeLegalPolicy, setActiveLegalPolicy] = useState<LegalModalTab | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const headerToggleBtnRef = useRef<HTMLButtonElement | null>(null);
  const themeRef = useRef<ThemeMode>(theme);
  const modeRef = useRef<InkShaderMode>(shaderMode);
  const paramsRef = useRef<InkTuningParams>(tuningParams);
  const lastPairRef = useRef<{ from: ThemeMode; to: ThemeMode }>({
    from: 'light',
    to: 'dark',
  });
  const toastTimerRef = useRef<number>(0);

  useEffect(() => {
    themeRef.current = theme;
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    modeRef.current = shaderMode;
  }, [shaderMode]);

  useEffect(() => {
    paramsRef.current = tuningParams;
  }, [tuningParams]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  }, []);

  const handleNavigateSection = useCallback((tab: AppTabId, sectionId?: string) => {
    setActiveTab(tab);
    const mappedMode = TAB_SHADER_MAP[tab];
    setShaderMode(mappedMode);
    modeRef.current = mappedMode;

    if (sectionId) {
      window.setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleOpenContactHub = useCallback(() => {
    handleNavigateSection('platform', 'section-contact');
  }, [handleNavigateSection]);

  const applyThemeSynchronously = useCallback((nextTheme: ThemeMode) => {
    themeRef.current = nextTheme;
    document.documentElement.setAttribute('data-theme', nextTheme);
    const root = document.getElementById('page-root');
    if (root) {
      root.setAttribute('data-theme', nextTheme);
    }
    setTheme(nextTheme);
  }, []);

  const runInkTransition = useCallback(
    (originX: number, originY: number, fromTheme: ThemeMode, toTheme: ThemeMode) => {
      lastPairRef.current = { from: fromTheme, to: toTheme };
      inkBleedController.trigger({
        originX,
        originY,
        oldTheme: fromTheme,
        newTheme: toTheme,
        getMode: () => modeRef.current,
        getParams: () => paramsRef.current,
        applyThemeToLiveDOM: applyThemeSynchronously,
      });
    },
    [applyThemeSynchronously]
  );

  const triggerToggleFromPoint = useCallback(
    (originX?: number, originY?: number) => {
      const current = themeRef.current;
      const next: ThemeMode = current === 'light' ? 'dark' : 'light';
      let x = originX;
      let y = originY;
      if (typeof x !== 'number' || typeof y !== 'number') {
        const btn = headerToggleBtnRef.current;
        if (btn) {
          const rect = btn.getBoundingClientRect();
          x = rect.left + rect.width * 0.5;
          y = rect.top + rect.height * 0.5;
        } else {
          const fallback = inkBleedController.getLastOrigin();
          x = fallback.x;
          y = fallback.y;
        }
      }
      runInkTransition(x, y, current, next);
    },
    [runInkTransition]
  );

  const replayLastClick = useCallback(() => {
    const origin = inkBleedController.getLastOrigin();
    const { from, to } = lastPairRef.current;
    applyThemeSynchronously(from);
    runInkTransition(origin.x, origin.y, from, to);
  }, [applyThemeSynchronously, runInkTransition]);

  // Delegated click listener for any [data-ink-toggle] element across the entire document
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const toggleEl = target.closest('[data-ink-toggle]') as HTMLElement | null;
      if (!toggleEl) return;

      e.preventDefault();
      let clickX = e.clientX;
      let clickY = e.clientY;
      if (clickX === 0 && clickY === 0) {
        const rect = toggleEl.getBoundingClientRect();
        clickX = rect.left + rect.width * 0.5;
        clickY = rect.top + rect.height * 0.5;
      }
      triggerToggleFromPoint(clickX, clickY);
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [triggerToggleFromPoint]);

  // Global keyboard shortcuts: T (toggle), R (replay last click), D (live tuning panel)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        triggerToggleFromPoint();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        replayLastClick();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setTuningOpen((open) => !open);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [replayLastClick, triggerToggleFromPoint]);

  return (
    <>
      <div
        id="page-root"
        data-theme={theme}
        className="relative min-h-screen w-full flex flex-col bg-surface text-text-primary overflow-x-clip"
      >
        {/* Ambient Refractive Aurora Orbs Behind Glassmorphic Surfaces */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        >
          <div className="aurora-orb-a absolute -top-28 -left-24 w-[520px] h-[520px] rounded-full" />
          <div className="aurora-orb-b absolute top-[32%] -right-32 w-[480px] h-[480px] rounded-full" />
          <div className="aurora-orb-c absolute -bottom-36 left-[28%] w-[560px] h-[560px] rounded-full" />
        </div>

        {/* Frosted Crystal Glass Top Navigation Header */}
        <header className="sticky top-0 z-40 w-full glass-header">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
            {/* Zone 1: Clean Brand Wordmark */}
            <button
              type="button"
              onClick={() => handleNavigateSection('platform')}
              className="flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <AimsBrandLogo className="h-9 sm:h-10" />
              <span className="font-section-title text-text-primary tracking-tight font-bold">
                AIMS
              </span>
            </button>

            {/* Zone 2: 5 Concise Single-Line Primary Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6" aria-label="Primary">
              {NAV_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleNavigateSection(tab.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative py-1 font-body-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'text-clinical-teal font-semibold after:content-[""] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-clinical-teal'
                        : 'text-on-surface-variant hover:text-text-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleOpenContactHub}
                className="relative py-1 font-body-md text-on-surface-variant hover:text-clinical-teal transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Contact
              </button>
            </nav>

            {/* Zone 3: Sign In + Theme Switch + Primary Demo CTA */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setSignInOpen(true)}
                className="hidden sm:inline-flex items-center py-1 px-2 font-body-sm font-medium text-on-surface-variant hover:text-clinical-teal transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sign In
              </button>

              <button
                ref={headerToggleBtnRef}
                type="button"
                data-ink-toggle="true"
                title="Switch Light / Dark clinical theme (Shortcut: T)"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-canvas hover:bg-surface-container border border-border-subtle text-text-primary font-body-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base text-clinical-teal">
                  {theme === 'light' ? 'dark_mode' : 'light_mode'}
                </span>
                <span className="hidden md:inline">
                  {theme === 'light' ? 'Dark' : 'Light'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTuningOpen((v) => !v)}
                title="Ink Transition Settings (Shortcut: D)"
                aria-label="Ink Transition Settings"
                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                  tuningOpen
                    ? 'bg-clinical-teal text-on-primary border-clinical-teal'
                    : 'bg-surface-canvas hover:bg-surface-container border-border-subtle text-text-secondary hover:text-text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-base">tune</span>
              </button>

              <button
                type="button"
                onClick={handleOpenContactHub}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-clinical-teal hover:bg-primary-container text-on-primary font-body-md font-semibold transition-colors shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Book a Demo</span>
              </button>
            </div>
          </div>

          {/* Mobile-Only Compact Page Switcher (< lg) */}
          <div className="w-full lg:hidden glass-subbar border-t border-border-subtle">
            <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between gap-1.5 overflow-x-auto">
              <div className="flex items-center gap-1 shrink-0">
                {NAV_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleNavigateSection(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-clinical-teal text-on-primary'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleOpenContactHub}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-text-secondary hover:text-clinical-teal whitespace-nowrap cursor-pointer"
                >
                  Contact
                </button>
              </div>
              <button
                type="button"
                onClick={() => setSignInOpen(true)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-clinical-teal whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        </header>

        {/* Main Website Page Viewport with Dynamic Motion Transitions */}
        <main className="relative z-10 w-full flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'platform' && (
                <PlatformScreen
                  onNavigateSection={handleNavigateSection}
                  onNotify={showToast}
                />
              )}
              {activeTab === 'ai-scribe' && (
                <ScribeAnd3DScreen
                  theme={theme}
                  onNotify={showToast}
                  onOpenFullContact={handleOpenContactHub}
                />
              )}
              {activeTab === '7-step-flow' && (
                <PatientFlowScreen
                  onNotify={showToast}
                  onOpenFullContact={handleOpenContactHub}
                />
              )}
              {activeTab === 'security-hipaa' && (
                <SecurityAndBillingScreen
                  onNotify={showToast}
                  onOpenFullContact={handleOpenContactHub}
                  onOpenLegalPolicy={(policy) => setActiveLegalPolicy(policy)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Official Frosted Glass Website Footer */}
        <footer className="relative z-10 w-full glass-surface border-t border-border-subtle pt-12 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-8">
              <div className="md:col-span-4 lg:col-span-2 flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <AimsBrandLogo className="h-12" />
                  <span className="font-headline-sm text-text-primary font-bold">
                    AIMS — Clinic Operating System
                  </span>
                </div>
                <p className="font-body-sm text-text-secondary max-w-sm">
                  Artificial Intelligence Medical Scribe: unified longitudinal EHR, smart intake
                  forms, visual OCR extraction, multi-agent medical encoding, and AI medical billing
                  integrated with Office Ally.
                </p>
                <div className="font-caption text-alert-success font-medium">
                  Live at aimedicalscriber.com · Built for HIPAA-conscious workflows · BAA Available
                </div>
                <div className="font-code-clinical text-xs text-text-secondary pt-1 flex flex-wrap items-center gap-2">
                  <a
                    href="tel:+13055550194"
                    className="text-clinical-teal hover:underline whitespace-nowrap"
                  >
                    (305) 555-0194
                  </a>
                  <span>·</span>
                  <span>demos@aimedicalscriber.com</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-caption font-semibold text-text-muted">
                  EHR &amp; Patient Care
                </span>
                <ul className="flex flex-col gap-1.5 font-body-sm text-text-secondary">
                  <li>
                    <button
                      type="button"
                      onClick={() => handleNavigateSection('7-step-flow', 'section-flow')}
                      className="hover:text-text-primary transition-colors cursor-pointer"
                    >
                      7-Step Patient Flow
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleNavigateSection('7-step-flow', 'section-ehr')}
                      className="hover:text-text-primary transition-colors cursor-pointer"
                    >
                      Unified Clinical EHR
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleNavigateSection('7-step-flow', 'section-labs')}
                      className="hover:text-text-primary transition-colors cursor-pointer"
                    >
                      Labs &amp; Biomarkers
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleNavigateSection('7-step-flow', 'section-portal')}
                      className="hover:text-text-primary transition-colors cursor-pointer"
                    >
                      Patient Portal &amp; Telehealth
                    </button>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-caption font-semibold text-text-muted">
                  AI Scribe &amp; Extraction
                </span>
                <ul className="flex flex-col gap-1.5 font-body-sm text-text-secondary">
                  <li>
                    <button
                      type="button"
                      onClick={() => handleNavigateSection('ai-scribe', 'section-scribe')}
                      className="hover:text-text-primary transition-colors cursor-pointer"
                    >
                      AI Medical Scribe &amp; Agents
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleNavigateSection('ai-scribe', 'section-voice')}
                      className="hover:text-text-primary transition-colors cursor-pointer"
                    >
                      Intake Forms &amp; Visual OCR
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleNavigateSection('ai-scribe', 'section-ai-tools')}
                      className="hover:text-text-primary transition-colors cursor-pointer"
                    >
                      AI Medical Encoding
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setSignInOpen(true)}
                      className="hover:text-clinical-teal font-medium transition-colors cursor-pointer"
                    >
                      Provider &amp; Portal Sign-In
                    </button>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-caption font-semibold text-text-muted">
                  AI Billing &amp; Plans
                </span>
                <ul className="flex flex-col gap-1.5 font-body-sm text-text-secondary">
                  <li>
                    <button
                      type="button"
                      onClick={() => handleNavigateSection('security-hipaa', 'section-payments')}
                      className="hover:text-text-primary transition-colors cursor-pointer"
                    >
                      AI Billing &amp; Office Ally
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleNavigateSection('security-hipaa', 'section-automation')}
                      className="hover:text-text-primary transition-colors cursor-pointer"
                    >
                      Automation &amp; 24/7 Reception
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleNavigateSection('security-hipaa', 'section-pricing')}
                      className="hover:text-text-primary transition-colors cursor-pointer"
                    >
                      Clinic Plans &amp; Sandbox
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleNavigateSection('security-hipaa', 'section-faq')}
                      className="hover:text-text-primary transition-colors cursor-pointer"
                    >
                      Clinical &amp; Billing FAQ
                    </button>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-caption font-semibold text-text-muted">
                  Trust, BAA &amp; Legal
                </span>
                <ul className="flex flex-col gap-1.5 font-body-sm text-text-secondary">
                  <li>
                    <button
                      type="button"
                      onClick={handleOpenContactHub}
                      className="hover:text-clinical-teal font-medium transition-colors cursor-pointer"
                    >
                      Contact Hub &amp; Onboarding
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setActiveLegalPolicy('baa')}
                      className="hover:text-text-primary transition-colors cursor-pointer"
                    >
                      HIPAA &amp; BAA Overview
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setActiveLegalPolicy('privacy')}
                      className="hover:text-text-primary transition-colors cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => setActiveLegalPolicy('terms')}
                      className="hover:text-text-primary transition-colors cursor-pointer"
                    >
                      Terms of Service
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border-subtle text-text-muted font-caption">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-code-clinical text-text-secondary">
                  https://aimedicalscriber.com
                </span>
                <span>·</span>
                <span>Biscayne Medical Corridor, Miami FL</span>
                <span>·</span>
                <span>Shortcuts: [T] Theme · [R] Replay · [D] Shader</span>
              </div>
              <span>© 2026 AIMS (Artificial Intelligence Medical Scribe). All rights reserved.</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Global AI Concierge Chatbot Widget (Persists Across Entire Website) */}
      <AimsChatbotWidget
        onNavigateSection={handleNavigateSection}
        tuningOpen={tuningOpen}
      />

      {/* Provider & Patient Portal Sign-In Modal */}
      <SignInModal
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        onRequestSandbox={handleOpenContactHub}
        onNotify={showToast}
      />

      {/* HIPAA / BAA, Privacy Policy & Terms Modal */}
      <LegalPolicyModal
        activePolicy={activeLegalPolicy}
        onSelectPolicy={(tab) => setActiveLegalPolicy(tab)}
        onClose={() => setActiveLegalPolicy(null)}
        onRequestBaa={handleOpenContactHub}
      />

      {/* Live Tuning Panel (Shortcut: D) */}
      <TuningPanel
        open={tuningOpen}
        onClose={() => setTuningOpen(false)}
        mode={shaderMode}
        onSelectMode={(m) => setShaderMode(m)}
        params={tuningParams}
        onChangeParams={setTuningParams}
        theme={theme}
        onReplayLastClick={replayLastClick}
        onToggleCenter={() => triggerToggleFromPoint()}
      />

      {/* Interactive Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9996] rounded-xl glass-cinema-hud text-slate-100 px-4 py-2.5 shadow-xl flex items-center gap-2 font-body-sm"
        >
          <span className="material-symbols-outlined text-sm text-teal-400">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
}
