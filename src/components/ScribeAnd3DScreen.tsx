import { ReviewContact, siteReview } from './ReviewContact';
import React, { useMemo, useState } from 'react';
import { ThemeMode } from '../engine/inkBleedEngine';
import {
  AI_TOOLS_CATALOG,
  AiToolSpec,
} from '../data/aimsSpecData';
import { ClinicalNodeScene3D } from './ClinicalNodeScene3D';
import { BookDemoSection } from './BookDemoSection';
import { GlassCard } from './GlassCard';

interface ScribeAnd3DScreenProps {
  theme: ThemeMode;
  onNotify: (msg: string) => void;
  onOpenFullContact: () => void;
}

const TOOL_CATEGORIES: Array<'All' | AiToolSpec['category']> = [
  'All',
  'Scribe & Notes',
  'Voice & Intake',
  'Coding & Safety',
  'Hub & QA',
];

const HANDS_FREE_VOICE_ACTIONS = [
  { command: 'Search Patient Chart', desc: 'Locate any patient record by spoken name or chart ID' },
  { command: 'Review Patient Calendar', desc: 'Read upcoming and historical patient appointments' },
  { command: 'Schedule Follow-Up', desc: 'Book or reschedule clinic appointments hands-free' },
  { command: 'Launch Ambient Scribe', desc: 'Start live encounter capture & SOAP charting on command' },
  { command: 'Prepare Visit Superbill', desc: 'Generate encoded ICD-10 / CPT billing summary' },
  { command: 'Read Clinical Summary', desc: 'Hear allergies, active diagnoses, and visit history' },
  { command: 'Open Today’s Schedule', desc: 'Review the provider’s complete daily patient lineup' },
];

export const ScribeAnd3DScreen: React.FC<ScribeAnd3DScreenProps> = ({
  theme,
  onNotify,
  onOpenFullContact,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | AiToolSpec['category']>('All');
  const [toolSearch, setToolSearch] = useState('');
  const [showAllTools, setShowAllTools] = useState(false);


  const filteredTools = useMemo(() => {
    const q = toolSearch.trim().toLowerCase();
    return AI_TOOLS_CATALOG.filter((tool) => {
      const catMatch = selectedCategory === 'All' || tool.category === selectedCategory;
      if (!catMatch) return false;
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.summary.toLowerCase().includes(q) ||
        tool.detail.toLowerCase().includes(q) ||
        tool.api.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, toolSearch]);

  const isFilteredView = selectedCategory !== 'All' || Boolean(toolSearch.trim());
  const visibleTools =
    isFilteredView || showAllTools ? filteredTools : filteredTools.slice(0, 6);
  const hiddenCount = Math.max(0, filteredTools.length - visibleTools.length);

  const scrollToDemo = () => {
    document.getElementById('book-demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-10 flex flex-col gap-12">
        {/* AI Scribe, Review & 3D Clinical Visualizer */}
        <section id="section-scribe" className="flex flex-col gap-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="font-caption text-clinical-teal font-semibold">
                AI Medical Scribe · Verification · Medical Encoding
              </div>
              <h1 className="font-display-hero text-text-primary mt-1">
                See how a conversation becomes a draft note
              </h1>
              <p className="font-body-lg text-text-secondary max-w-3xl mt-2">
                Explore a sample conversation and draft SOAP note. Review the suggested codes,
                and see where the clinician would check and sign off.
              </p>
            </div>

            <button
              type="button"
              onClick={scrollToDemo}
              className="inline-flex items-center gap-2 rounded-xl bg-clinical-teal hover:bg-primary-container text-on-primary px-5 py-2.5 font-body-md font-semibold shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">science</span>
              <span>Request a scribe walkthrough</span>
            </button>
          </div>

          <ClinicalNodeScene3D theme={theme} />

        </section>

        {/* Smart Intake Form, Visual OCR Extraction & Hands-Free Voice Control */}
        <section id="section-voice" className="flex flex-col gap-6 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-caption text-clinical-teal font-semibold">
                Intake Forms · Visual OCR · Clinical Extraction · Voice Navigation
              </span>
              <h2 className="font-headline-lg text-text-primary mt-1">
                Multilingual Intake Forms, Visual OCR &amp; Hands-Free EHR
              </h2>
            </div>
            <span className="font-body-sm text-text-secondary">
              English · Español · Kreyòl Ayisyen + Optical Card &amp; Document Extraction
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <GlassCard className="p-6 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-clinical-teal">
                    record_voice_over
                  </span>
                  <span className="font-caption text-clinical-teal font-semibold">
                    Spoken &amp; Mobile Intake
                  </span>
                </div>
                <h3 className="font-headline-sm text-text-primary">
                  33-Question Spoken &amp; Digital Intake Form
                </h3>
                <p className="font-body-sm text-text-secondary leading-relaxed">
                  Patients complete demographics, insurance, medical history, current symptoms, and
                  review of systems by speaking or tapping in English, Spanish, or Haitian Kreyòl.
                  AI extracts clinical entities and pre-populates the physician&rsquo;s chart.
                </p>
              </div>
              <div className="pt-3 border-t border-border-subtle font-caption text-text-muted">
                Customizable per specialty · Bidirectional medical translation
              </div>
            </GlassCard>

            <GlassCard className="p-6 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-clinical-teal">
                    document_scanner
                  </span>
                  <span className="font-caption text-clinical-teal font-semibold">
                    Optical Extraction
                  </span>
                </div>
                <h3 className="font-headline-sm text-text-primary">
                  Visual OCR &amp; Insurance / ID Extraction
                </h3>
                <p className="font-body-sm text-text-secondary leading-relaxed">
                  Snap or upload photos of insurance cards, driver&rsquo;s licenses, paper referrals,
                  and external lab sheets. Visual AI extracts subscriber IDs, group numbers,
                  demographics, and clinical findings straight into the EHR and Office Ally profile.
                </p>
              </div>
              <div className="pt-3 border-t border-border-subtle font-caption text-text-muted">
                Eliminates manual front-desk typing &amp; transcription errors
              </div>
            </GlassCard>

            <GlassCard className="p-6 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-clinical-teal">
                    mic_external_on
                  </span>
                  <span className="font-caption text-clinical-teal font-semibold">
                    Hands-Free Control
                  </span>
                </div>
                <h3 className="font-headline-sm text-text-primary">
                  Hands-Free EHR Voice Navigation
                </h3>
                <p className="font-body-sm text-text-secondary leading-relaxed">
                  Navigate schedules, open patient charts, launch scribing, and prepare superbills
                  without touching a keyboard—say <em>&ldquo;open today&rsquo;s appointments&rdquo;</em>,{' '}
                  <em>&ldquo;search patient Morales&rdquo;</em>, or{' '}
                  <em>&ldquo;start scribe&rdquo;</em> in sterile exam rooms.
                </p>
              </div>
              <div className="pt-3 border-t border-border-subtle font-caption text-text-muted">
                Zero-keyboard sterile exam-room workflow
              </div>
            </GlassCard>
          </div>

          {/* 7 Hands-Free Clinical Voice Actions */}
          <GlassCard interactive={false} className="p-6 sm:p-8 flex flex-col gap-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="font-caption text-clinical-teal font-semibold">
                  Conversational Clinical Voice AI
                </span>
                <h3 className="font-headline-md text-text-primary mt-1">
                  7 Live EHR &amp; Billing Actions Executed Strictly by Voice
                </h3>
              </div>
              <span className="font-caption text-text-muted">
                Natural, interruptible voice control for busy clinicians
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {HANDS_FREE_VOICE_ACTIONS.map((act) => (
                <div
                  key={act.command}
                  className="p-3.5 rounded-lg bg-surface-canvas border border-border-subtle flex flex-col gap-1"
                >
                  <span className="font-section-title text-clinical-teal">{act.command}</span>
                  <span className="font-body-sm text-text-secondary">{act.desc}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        {/* AI Clinical Workflows Catalog (Progressive Disclosure: Top 6 Default, Expandable to All 18) */}
        <section id="section-ai-tools" className="flex flex-col gap-6 scroll-mt-24">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <span className="font-caption text-clinical-teal font-semibold">
                Clinical AI Capabilities Catalog
              </span>
              <h2 className="font-headline-lg text-text-primary mt-1">
                AI Scribe, Intake, OCR, Coding &amp; Billing Workflows
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {TOOL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-body-sm font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-clinical-teal text-on-primary border-clinical-teal'
                      : 'bg-surface-container-lowest text-text-secondary border-border-subtle hover:text-text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <input
              type="search"
              value={toolSearch}
              onChange={(e) => setToolSearch(e.target.value)}
              placeholder="Filter workflows (e.g. Scribe, OCR, CPT encoding, Office Ally, intake)..."
              className="w-full sm:max-w-md h-10 px-3.5 rounded-lg bg-surface-container-lowest border border-border-subtle font-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-clinical-teal"
            />
            <span className="font-caption text-text-muted tabular-nums">
              Showing {visibleTools.length} of {filteredTools.length} AI clinical workflows
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleTools.map((tool) => (
              <GlassCard key={tool.num} className="p-5 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="font-caption text-clinical-teal font-semibold">
                    {tool.num}. {tool.category}
                  </div>
                  <h3 className="font-headline-sm text-text-primary">{tool.name}</h3>
                  <p className="font-body-sm text-text-primary font-medium">{tool.summary}</p>
                  <p className="font-body-sm text-text-secondary leading-relaxed">{tool.detail}</p>
                </div>

                <div className="pt-3 border-t border-border-subtle flex items-center justify-between font-caption text-text-muted">
                  <span className="truncate">{tool.api}</span>
                </div>
              </GlassCard>
            ))}
          </div>

          {!isFilteredView && filteredTools.length > 6 && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowAllTools((v) => !v)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-canvas hover:bg-clinical-teal-subtle border border-border-subtle text-clinical-teal font-body-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-base">
                  {showAllTools ? 'expand_less' : 'expand_more'}
                </span>
                <span>
                  {showAllTools
                    ? 'Show Top 6 Flagship Workflows'
                    : `Show All ${filteredTools.length} AI Workflows (+${hiddenCount} More)`}
                </span>
              </button>
            </div>
          )}
        </section>
      </div>

      {siteReview ? <ReviewContact id="book-demo" /> : <BookDemoSection
        onNotify={onNotify}
        onOpenFullContact={onOpenFullContact}
        contextLabel="AI Medical Scribe · · Visual OCR · Medical Encoding"
      />}
    </div>
  );
};
