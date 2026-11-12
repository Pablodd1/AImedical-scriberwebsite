import React, { useMemo, useState } from 'react';
import { ThemeMode } from '../engine/inkBleedEngine';
import {
  AI_TOOLS_CATALOG,
  AiToolSpec,
  FIVE_SPECIALIST_AGENTS,
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
  'Scribe & Agents',
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
  const [selectedAgent, setSelectedAgent] = useState(FIVE_SPECIALIST_AGENTS[0].id);
  const [selectedCategory, setSelectedCategory] = useState<'All' | AiToolSpec['category']>('All');
  const [toolSearch, setToolSearch] = useState('');
  const [showAllTools, setShowAllTools] = useState(false);

  const activeAgent =
    FIVE_SPECIALIST_AGENTS.find((a) => a.id === selectedAgent) || FIVE_SPECIALIST_AGENTS[0];

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
        {/* AI Scribe, Multi-Agent Review & 3D Clinical Visualizer */}
        <section id="section-scribe" className="flex flex-col gap-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="font-caption text-clinical-teal font-semibold">
                AI Medical Scribe · Multi-Agent Verification · Medical Encoding
              </div>
              <h1 className="font-display-hero text-text-primary mt-1">
                Ambient AI Scribe, Multi-Agent Review &amp; Coding.
              </h1>
              <p className="font-body-lg text-text-secondary max-w-3xl mt-2">
                Focus completely on your patient while AIMS captures the conversation, answers
                mid-visit clinical questions, verifies every SOAP note with specialist AI agents,
                and encodes clean ICD-10 &amp; CPT billing codes ready for Office Ally.
              </p>
            </div>

            <button
              type="button"
              onClick={scrollToDemo}
              className="inline-flex items-center gap-2 rounded-xl bg-clinical-teal hover:bg-primary-container text-on-primary px-5 py-2.5 font-body-md font-semibold shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">science</span>
              <span>Try Scribe Simulator</span>
            </button>
          </div>

          {/* Dual-Agent vs Five-Agent Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <GlassCard className="p-6 flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-caption text-clinical-teal font-semibold">
                    Daily Encounter Standard
                  </span>
                  <span className="font-caption text-alert-success font-semibold">
                    Wake-Lock + Simulator
                  </span>
                </div>
                <h2 className="font-headline-sm text-text-primary">
                  Dual-Agent Clinical Review (Builder + Reviewer)
                </h2>
                <p className="font-body-sm text-text-secondary leading-relaxed">
                  <strong>Agent 1 &ldquo;Builder&rdquo;</strong> synthesizes the complete SOAP note,
                  ICD-10 diagnosis codes, CPT procedure codes, severity-graded red flags, missing
                  exam details, and recommended follow-ups.{' '}
                  <strong>Agent 2 &ldquo;Reviewer&rdquo;</strong> audits the draft against the
                  encounter transcript and clinical coding rules—flagging omissions before sign-off.
                </p>
              </div>
              <div className="pt-3 border-t border-border-subtle flex items-center justify-between font-caption text-text-muted">
                <span>Saves directly to the longitudinal EHR chart</span>
                <button
                  type="button"
                  onClick={scrollToDemo}
                  className="text-clinical-teal font-semibold hover:underline cursor-pointer"
                >
                  Request Scribe Demo →
                </button>
              </div>
            </GlassCard>

            <GlassCard className="p-6 flex flex-col justify-between gap-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-caption text-clinical-teal font-semibold">
                    Complex &amp; Multi-System Visits
                  </span>
                  <span className="font-caption text-alert-success font-semibold">
                    Parallel Multi-Agent AI
                  </span>
                </div>
                <h2 className="font-headline-sm text-text-primary">
                  Five-Agent Specialist Consensus Board
                </h2>
                <p className="font-body-sm text-text-secondary leading-relaxed">
                  For multi-system or high-complexity visits, five specialist AI agents evaluate the
                  live encounter simultaneously: Clinical Assessment, AI Medical Encoding, Red-Flag
                  Safety, AI Medical Billing &amp; Office Ally Readiness, and our{' '}
                  <span className="font-semibold text-text-primary">15,716-rule CPT &amp; ICD-10</span>{' '}
                  coding knowledge base.
                </p>
              </div>
              <div className="pt-3 border-t border-border-subtle flex items-center justify-between font-caption text-text-muted">
                <span>Real-time clinical &amp; coding consensus</span>
                <button
                  type="button"
                  onClick={scrollToDemo}
                  className="text-clinical-teal font-semibold hover:underline cursor-pointer"
                >
                  See 5-Agent Walkthrough →
                </button>
              </div>
            </GlassCard>
          </div>

          {/* Interactive 3D Acoustic Scribe Array & Multi-Agent Visualizer */}
          <ClinicalNodeScene3D theme={theme} />

          {/* Interactive 5-Agent Consensus Board Explorer */}
          <GlassCard interactive={false} className="p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="font-caption text-clinical-teal font-semibold">
                  Multi-Agent Clinical Intelligence
                </span>
                <h2 className="font-headline-lg text-text-primary mt-1">
                  Inspect the 5-Agent Consensus Board (Alpha – Epsilon)
                </h2>
              </div>
              <span className="font-caption text-text-secondary">
                Select any specialist agent to inspect its live clinical output
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 flex flex-col gap-2">
                {FIVE_SPECIALIST_AGENTS.map((agent) => {
                  const isSelected = agent.id === selectedAgent;
                  return (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => setSelectedAgent(agent.id)}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-clinical-teal-subtle border-clinical-teal/50 shadow-sm'
                          : 'bg-surface-canvas border-border-subtle hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-code-badge text-clinical-teal font-bold">
                          {agent.code}
                        </span>
                        <span className="font-caption text-text-muted">{agent.latency}</span>
                      </div>
                      <div className="font-section-title text-text-primary mt-1">{agent.name}</div>
                    </button>
                  );
                })}
              </div>

              <div className="lg:col-span-7 p-6 rounded-xl bg-surface-canvas border border-border-subtle flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border-subtle">
                    <div>
                      <span className="font-code-badge text-clinical-teal">{activeAgent.code}</span>
                      <h3 className="font-headline-md text-text-primary mt-0.5">
                        {activeAgent.name}
                      </h3>
                    </div>
                    <span className="font-caption text-alert-success font-semibold">
                      Consensus Active
                    </span>
                  </div>

                  <div className="p-4 rounded-lg bg-surface-panel border border-border-subtle">
                    <div className="font-caption text-text-muted mb-1">Live Specialist Output</div>
                    <div className="font-code-clinical text-base text-text-primary font-semibold">
                      {activeAgent.verdict}
                    </div>
                  </div>

                  <p className="font-body-lg text-text-secondary">{activeAgent.detail}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border-subtle">
                  <span className="font-caption text-text-muted">
                    Grounded on encounter transcript, patient history &amp; 15,716 coding rules
                  </span>
                  <button
                    type="button"
                    onClick={scrollToDemo}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-clinical-teal hover:bg-primary-container text-on-primary px-4 py-2 font-body-sm font-medium transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">calendar_month</span>
                    <span>Test With Your Specialty</span>
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
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

      <BookDemoSection
        onNotify={onNotify}
        onOpenFullContact={onOpenFullContact}
        contextLabel="AI Medical Scribe · Multi-Agents · Visual OCR · Medical Encoding"
      />
    </div>
  );
};
