import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppTabId } from '../App';
import intakeLobbyImg from '../assets/images/hero_clinic_intake_lobby_1794421419131.jpg';
import scribeWorkstationImg from '../assets/images/hero_scribe_workstation_1794421417645.jpg';
import smartTerminalImg from '../assets/images/hero_smart_terminal_checkout_1794421419643.jpg';

interface HeroVideoShowcaseProps {
  fallbackEncounterUrl: string;
  onNavigateSection: (tab: AppTabId, sectionId?: string) => void;
  onNotify: (msg: string) => void;
}

interface ReelChapter {
  index: number;
  startSec: number;
  endSec: number;
  code: string;
  title: string;
  pillar: string;
  headline: string;
  detail: string;
  targetTab: AppTabId;
  sectionId: string;
  fallbackImg: string;
}

const REEL_CHAPTERS: ReelChapter[] = [
  {
    index: 0,
    startSec: 0,
    endSec: 4,
    code: '01',
    title: 'Smart Intake & Visual OCR',
    pillar: 'Spoken Intake · Photo ID & Insurance Extraction',
    headline: 'Voice & Digital Intake Forms with Instant Visual OCR',
    detail:
      'Patients complete 33-question intake forms in English, Spanish, or Haitian Kreyòl while Visual OCR extracts insurance cards and IDs directly into the EHR.',
    targetTab: 'ai-scribe',
    sectionId: 'section-voice',
    fallbackImg: intakeLobbyImg,
  },
  {
    index: 1,
    startSec: 4,
    endSec: 8,
    code: '02',
    title: 'Ambient AI Medical Scribe',
    pillar: 'Real-Time Listening · Unified EHR Charting',
    headline: 'Hands-Free Ambient Scribing & Live Clinical Copilot',
    detail:
      'Captures natural doctor-patient conversations, surfaces longitudinal history, and drafts structured SOAP notes without touching a keyboard.',
    targetTab: 'ai-scribe',
    sectionId: 'section-scribe',
    fallbackImg: '',
  },
  {
    index: 2,
    startSec: 8,
    endSec: 12,
    code: '03',
    title: 'Multi-Agent Medical Encoding',
    pillar: '2-Agent & 5-Agent Review · 15,716 Coding Rules',
    headline: 'Multi-Agent Verification & Automated ICD-10 / CPT Encoding',
    detail:
      'Specialist AI agents cross-check clinical notes, flag safety contraindications, and encode high-specificity diagnoses, CPT procedures, and modifiers.',
    targetTab: 'ai-scribe',
    sectionId: 'section-scribe',
    fallbackImg: scribeWorkstationImg,
  },
  {
    index: 3,
    startSec: 12,
    endSec: 16,
    code: '04',
    title: 'AI Billing & Office Ally',
    pillar: 'Clean Claims · Office Ally Integration',
    headline: 'One-Click Sign-Off, AI Medical Billing & Office Ally Sync',
    detail:
      'Scrubs superbills for medical necessity, prepares patient statements, and syncs clean electronic claims directly with Office Ally.',
    targetTab: 'security-hipaa',
    sectionId: 'section-payments',
    fallbackImg: smartTerminalImg,
  },
];

export const HeroVideoShowcase: React.FC<HeroVideoShowcaseProps> = ({
  fallbackEncounterUrl,
  onNavigateSection,
  onNotify,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const lightboxVideoRef = useRef<HTMLVideoElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [videoFailed, setVideoFailed] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(16);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeChapterIdx = Math.min(
    3,
    Math.max(0, Math.floor(((currentTime % 16) / Math.max(duration, 1)) * 4))
  );
  const activeChapter = REEL_CHAPTERS[activeChapterIdx] || REEL_CHAPTERS[0];

  useEffect(() => {
    if (!videoFailed || !isPlaying) return;
    const id = window.setInterval(() => {
      setCurrentTime((t) => (t + 0.25) % 16);
    }, 250);
    return () => window.clearInterval(id);
  }, [videoFailed, isPlaying]);

  const togglePlay = () => {
    const vid = videoRef.current;
    if (!vid || videoFailed) {
      setIsPlaying((p) => !p);
      return;
    }
    if (vid.paused) {
      vid.play().catch(() => {});
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  const seekToChapter = (chapter: ReelChapter) => {
    const target = chapter.startSec + 0.05;
    setCurrentTime(target);
    if (videoRef.current && !videoFailed) {
      videoRef.current.currentTime = target;
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
    onNotify(`Viewing ${chapter.code}: ${chapter.title}`);
  };

  const progressPct = Math.min(100, Math.max(0, (currentTime / Math.max(duration, 1)) * 100));
  const fallbackSrc = activeChapter.fallbackImg || fallbackEncounterUrl;

  return (
    <section
      id="section-home"
      aria-label="AIMS Interface Overview"
      className="relative px-4 sm:px-8 pt-6 pb-8 max-w-7xl mx-auto w-full scroll-mt-24"
    >
      {/* Responsive Hero Video Container with Frosted-Glass Overlay */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-border-subtle shadow-2xl bg-slate-950">
        <div className="relative min-h-[540px] sm:min-h-[580px] lg:min-h-[620px] w-full flex flex-col justify-between p-4 sm:p-8 lg:p-10">
          {/* Background Responsive Video Element (muted, loop, playsInline, autoPlay) */}
          {!videoFailed ? (
            <video
              ref={videoRef}
              src="/videos/aims-hero-reel.mp4"
              poster="/videos/aims-hero-poster.jpg"
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => {
                if (e.currentTarget.duration && Number.isFinite(e.currentTarget.duration)) {
                  setDuration(e.currentTarget.duration);
                }
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={() => setVideoFailed(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <img
              src={fallbackSrc}
              alt={activeChapter.headline}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            />
          )}

          {/* Measured Contrast Scrim for High Legibility */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-slate-950/88 via-slate-950/58 to-slate-950/30 pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/35 pointer-events-none"
          />

          {/* Top Utility Controls Over Video */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs sm:text-sm font-medium text-teal-200/95 tracking-wide">
              AIMS Clinical Platform · Built for HIPAA-Conscious Workflows
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="backdrop-blur-md bg-slate-950/55 hover:bg-slate-900/75 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-medium text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title={isPlaying ? 'Pause interface preview' : 'Play interface preview'}
              >
                <span className="material-symbols-outlined text-sm text-teal-300">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="backdrop-blur-md bg-slate-950/55 hover:bg-slate-900/75 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-medium text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="Expand full-screen walkthrough"
              >
                <span className="material-symbols-outlined text-sm text-teal-300">fullscreen</span>
                <span>Expand Video</span>
              </button>

              <button
                type="button"
                data-ink-toggle="true"
                className="backdrop-blur-md bg-slate-950/55 hover:bg-teal-700/75 border border-white/20 rounded-xl px-3 py-1.5 text-xs font-medium text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="Switch Light / Dark clinical theme"
              >
                <span className="material-symbols-outlined text-sm text-teal-300">contrast</span>
                <span className="hidden sm:inline">Switch Theme</span>
              </button>
            </div>
          </div>

          {/* Primary Frosted-Glass Overlay Introducing the AIMS Interface */}
          <div className="relative z-10 my-auto py-6 max-w-3xl">
            <div className="backdrop-blur-xl bg-slate-950/52 border border-white/20 rounded-2xl p-6 sm:p-8 lg:p-9 shadow-2xl text-white space-y-5">
              <div className="text-xs sm:text-sm font-medium text-teal-300">
                AI Medical Scribe · Unified EHR · Visual OCR · Multi-Agents · Office Ally Billing
              </div>

              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12]"
                style={{ textWrap: 'balance' }}
              >
                One Intelligent Clinical Interface from Patient Intake to Clean Claims.
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-200 leading-relaxed max-w-2xl">
                AIMS brings together ambient AI medical scribing, a complete longitudinal EHR,
                multilingual intake forms, visual OCR card &amp; document extraction, multi-agent
                medical coding and encoding, and AI medical billing integrated with Office Ally.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => onNavigateSection('platform', 'section-contact')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-sm sm:text-base shadow-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">calendar_month</span>
                  <span>Book a Live Demo</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateSection('ai-scribe', 'section-scribe')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/25 text-white font-medium text-sm sm:text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg text-teal-300">mic</span>
                  <span>Explore AI Scribe &amp; Agents</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateSection('7-step-flow', 'section-flow')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/25 text-white font-medium text-sm sm:text-base transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg text-teal-300">
                    clinical_notes
                  </span>
                  <span>Tour EHR &amp; Intake</span>
                </button>
              </div>
            </div>
          </div>

          {/* Synchronized Active Stage Caption + Progress Bar */}
          <div className="relative z-10 space-y-2.5">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeChapter.code}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="backdrop-blur-lg bg-slate-950/60 border border-white/15 rounded-xl px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-white"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="text-xs text-teal-300 font-medium">
                    {activeChapter.code}. {activeChapter.pillar}
                  </div>
                  <div className="text-sm sm:text-base font-semibold text-white truncate">
                    {activeChapter.headline}
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-1">{activeChapter.detail}</p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onNavigateSection(activeChapter.targetTab, activeChapter.sectionId)
                  }
                  className="px-3.5 py-2 rounded-lg bg-white/15 hover:bg-teal-500 hover:text-slate-950 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Open {activeChapter.title}</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </motion.div>
            </AnimatePresence>

            <div className="w-full h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300 transition-[width] duration-150"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4-Stage Interface Chapter Selector Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border-subtle bg-surface-canvas/95">
          {REEL_CHAPTERS.map((chap) => {
            const active = chap.index === activeChapterIdx;
            return (
              <button
                key={chap.code}
                type="button"
                onClick={() => seekToChapter(chap)}
                className={`p-3.5 sm:p-4 text-left transition-colors cursor-pointer flex flex-col gap-1 ${
                  active
                    ? 'bg-clinical-teal-subtle text-text-primary'
                    : 'hover:bg-surface-panel/70 text-text-secondary'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className={active ? 'text-clinical-teal font-semibold' : 'text-text-muted'}>
                    {chap.code}. Workflow Stage
                  </span>
                  <span className="font-mono tabular-nums text-text-muted">
                    0:0{chap.startSec}–0:{chap.endSec < 10 ? `0${chap.endSec}` : chap.endSec}
                  </span>
                </div>
                <div
                  className={`font-section-title truncate ${
                    active ? 'text-clinical-teal' : 'text-text-primary'
                  }`}
                >
                  {chap.title}
                </div>
                <div className="font-caption text-text-muted truncate">{chap.pillar}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fullscreen Walkthrough Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[9994] bg-slate-950/90 flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-6xl rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-slate-950"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-900/95 text-white">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-teal-400">smart_display</span>
                  <span className="font-section-title">
                    AIMS Clinical Interface — Intake, Scribe, Multi-Agent Coding &amp; Office Ally Billing
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 inline-flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                  <span>Close</span>
                </button>
              </div>

              <div className="aspect-[16/9] w-full bg-black">
                <video
                  ref={lightboxVideoRef}
                  src="/videos/aims-hero-reel.mp4"
                  poster="/videos/aims-hero-poster.jpg"
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
