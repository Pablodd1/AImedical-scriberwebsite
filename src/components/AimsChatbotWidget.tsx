import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppTabId } from '../App';

interface AimsChatbotWidgetProps {
  onNavigateSection: (tab: AppTabId, sectionId?: string) => void;
  tuningOpen: boolean;
}

interface SuggestedNavAction {
  tab: string;
  sectionId: string;
  label: string;
}

interface ChatTurn {
  id: string;
  role: 'user' | 'model';
  text: string;
  suggestedNav?: SuggestedNavAction | null;
  notice?: string;
}

const STARTER_PROMPTS = [
  'How do the AI Medical Scribe & Multi-Agents work?',
  'How does AI medical billing integrate with Office Ally?',
  'How do Smart Intake Forms & Visual OCR extract data?',
  'How do I book a live demo or clinic sandbox?',
];

const INITIAL_TURN: ChatTurn = {
  id: 'welcome-turn',
  role: 'model',
  text: 'Welcome to AIMS (aimedicalscriber.com). Ask me about our Ambient AI Medical Scribe, Unified EHR, Smart Intake Form, Visual OCR extraction, Multi-Agent medical encoding, or AI Medical Billing with Office Ally!',
  suggestedNav: {
    tab: 'platform',
    sectionId: 'section-contact',
    label: 'Open Contact & Demo Hub',
  },
};

export const AimsChatbotWidget: React.FC<AimsChatbotWidgetProps> = ({
  onNavigateSection,
  tuningOpen,
}) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([INITIAL_TURN]);

  const scrollBoxRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open && scrollBoxRef.current) {
      scrollBoxRef.current.scrollTop = scrollBoxRef.current.scrollHeight;
    }
  }, [turns, loading, open]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  const sendPrompt = async (promptText: string) => {
    const clean = promptText.trim();
    if (!clean || loading) return;

    const userTurn: ChatTurn = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: clean,
    };

    const updatedHistory = [...turns, userTurn];
    setTurns(updatedHistory);
    setInput('');
    setLoading(true);

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });
      const data = await resp.json();
      const replyTurn: ChatTurn = {
        id: `m-${Date.now()}`,
        role: 'model',
        text:
          data.reply ||
          'AIMS unifies Ambient AI Medical Scribing, a longitudinal EHR, multilingual Intake & Visual OCR, Multi-Agent ICD-10/CPT encoding, and AI Medical Billing with Office Ally.',
        suggestedNav: data.suggestedNav || null,
        notice: data.notice,
      };
      setTurns((prev) => [...prev, replyTurn]);
    } catch {
      setTurns((prev) => [
        ...prev,
        {
          id: `m-${Date.now()}`,
          role: 'model',
          text: 'Explore our AI Medical Scribe, 7-Step EHR, Visual OCR, and Office Ally billing modules, or submit an inquiry in the Contact Hub for a personalized walkthrough.',
          suggestedNav: {
            tab: 'platform',
            sectionId: 'section-contact',
            label: 'Open Contact & Demo Hub',
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendPrompt(input);
  };

  const handleJump = (nav: SuggestedNavAction) => {
    const validTabs: AppTabId[] = ['platform', 'ai-scribe', '7-step-flow', 'security-hipaa'];
    const targetTab: AppTabId = validTabs.includes(nav.tab as AppTabId)
      ? (nav.tab as AppTabId)
      : 'platform';
    onNavigateSection(targetTab, nav.sectionId);
  };

  const positionClass = tuningOpen
    ? 'right-5 sm:right-[372px] bottom-5'
    : 'right-5 bottom-5';

  return (
    <div
      className={`fixed z-[9993] ${positionClass} transition-all duration-200 flex flex-col items-end`}
    >
      <AnimatePresence>
        {open && (
          <motion.section
            key="aims-chat-window"
            aria-label="AIMS Clinical Assistant"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 w-[370px] max-w-[calc(100vw-2.5rem)] h-[520px] max-h-[72vh] rounded-2xl glass-surface border border-border-strong shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="px-4 py-3.5 bg-clinical-teal text-on-primary flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">smart_toy</span>
                </div>
                <div className="min-w-0">
                  <div className="font-section-title leading-tight truncate">
                    AIMS Concierge Assistant
                  </div>
                  <div className="font-caption opacity-90 truncate">
                    AI Scribe · EHR · OCR · Coding · Office Ally
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setTurns([INITIAL_TURN])}
                  title="Reset conversation"
                  className="w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  title="Minimize assistant"
                  className="w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
            </div>

            <div
              ref={scrollBoxRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-canvas/70"
            >
              {turns.map((turn) => {
                const isUser = turn.role === 'user';
                return (
                  <div
                    key={turn.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1.5`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 font-body-sm leading-relaxed whitespace-pre-line ${
                        isUser
                          ? 'bg-clinical-teal text-on-primary rounded-br-sm shadow-sm'
                          : 'bg-surface-panel text-text-primary border border-border-subtle rounded-bl-sm shadow-sm'
                      }`}
                    >
                      {turn.text}
                    </div>

                    {turn.suggestedNav && !isUser && (
                      <button
                        type="button"
                        onClick={() => handleJump(turn.suggestedNav!)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-clinical-teal-subtle hover:bg-clinical-teal hover:text-on-primary border border-clinical-teal/30 font-caption text-clinical-teal transition-colors cursor-pointer"
                      >
                        <span>{turn.suggestedNav.label}</span>
                        <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </button>
                    )}

                    {turn.notice && (
                      <span className="font-caption text-text-muted px-1">{turn.notice}</span>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-surface-panel border border-border-subtle w-fit text-text-secondary font-caption">
                  <span className="material-symbols-outlined text-sm text-clinical-teal animate-spin">
                    progress_activity
                  </span>
                  <span>Preparing clinical platform answer...</span>
                </div>
              )}

              {turns.length <= 2 && !loading && (
                <div className="pt-2 space-y-1.5">
                  <div className="font-caption text-text-muted">Suggested questions:</div>
                  <div className="flex flex-col gap-1.5">
                    {STARTER_PROMPTS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => sendPrompt(q)}
                        className="text-left px-3 py-2 rounded-xl bg-surface-panel/90 hover:bg-clinical-teal-subtle border border-border-subtle hover:border-clinical-teal/40 font-caption text-text-primary transition-colors cursor-pointer"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-border-subtle bg-surface-panel/95 flex items-center gap-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about Scribe, EHR, OCR, Office Ally..."
                className="flex-1 h-10 px-3.5 rounded-xl bg-surface-canvas border border-border-subtle font-body-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-clinical-teal"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="w-10 h-10 rounded-xl bg-clinical-teal hover:bg-primary-container text-on-primary flex items-center justify-center transition-colors disabled:opacity-45 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Open AIMS Concierge Chatbot"
        className="group inline-flex items-center gap-2.5 pl-3.5 pr-4 py-3 rounded-2xl bg-clinical-teal hover:bg-primary-container text-on-primary shadow-xl border border-white/25 transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer"
      >
        <span className="material-symbols-outlined text-xl">
          {open ? 'keyboard_arrow_down' : 'chat'}
        </span>
        <span className="font-section-title whitespace-nowrap">
          {open ? 'Hide Assistant' : 'Ask AIMS Concierge'}
        </span>
      </button>
    </div>
  );
};
