import React from 'react';
import {
  DEFAULT_INK_PARAMS,
  InkShaderMode,
  InkTuningParams,
  ThemeMode,
} from '../engine/inkBleedEngine';

interface TuningPanelProps {
  open: boolean;
  onClose: () => void;
  mode: InkShaderMode;
  onSelectMode: (mode: InkShaderMode) => void;
  params: InkTuningParams;
  onChangeParams: (next: InkTuningParams) => void;
  theme: ThemeMode;
  onReplayLastClick: () => void;
  onToggleCenter: () => void;
}

const SHADER_MODES: Array<{ id: InkShaderMode; label: string; desc: string }> = [
  { id: 'sumi', label: 'Sumi', desc: 'Calligraphy tendrils' },
  { id: 'vortex', label: 'Vortex', desc: 'Spiral eddy swirl' },
  { id: 'watercolor', label: 'Watercolor', desc: 'Feathered bloom' },
  { id: 'burst', label: 'Burst', desc: 'Radial ink spikes' },
];

export const TuningPanel: React.FC<TuningPanelProps> = ({
  open,
  onClose,
  mode,
  onSelectMode,
  params,
  onChangeParams,
  theme,
  onReplayLastClick,
  onToggleCenter,
}) => {
  if (!open) return null;

  const update = (key: keyof InkTuningParams, value: number) => {
    onChangeParams({ ...params, [key]: value });
  };

  return (
    <aside
      aria-label="WebGL2 Liquid Ink Shader Tuning"
      className="fixed bottom-5 right-5 z-[9995] w-[340px] max-w-[calc(100vw-2rem)] rounded-xl border border-slate-700/80 bg-[#0c1322] text-slate-100 shadow-2xl p-4 select-none"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="font-code-badge uppercase tracking-wider text-teal-400">
            WebGL2 Domain-Warped Ink Engine
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Theme: <span className="text-slate-200 font-medium capitalize">{theme}</span> • Press{' '}
            <kbd className="px-1 py-0.5 rounded bg-slate-800 font-code-badge text-slate-300">D</kbd> to hide
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 cursor-pointer"
          title="Close panel (D)"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>

      {/* 4 Shader Mode Selector */}
      <div className="pt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-code-badge uppercase text-slate-400">Shader Mode</span>
          <span className="font-caption text-teal-400">
            {SHADER_MODES.find((m) => m.id === mode)?.desc}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1 rounded-lg bg-slate-900 p-1 border border-slate-800">
          {SHADER_MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onSelectMode(m.id)}
              className={`py-1.5 px-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                mode === m.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5 Live Uniform Sliders */}
      <div className="space-y-3 pt-3.5">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="tune-duration" className="text-slate-300">
              Duration
            </label>
            <span className="font-code-clinical text-teal-300">{params.duration} ms</span>
          </div>
          <input
            id="tune-duration"
            type="range"
            min={350}
            max={3200}
            step={50}
            value={params.duration}
            onChange={(e) => update('duration', parseFloat(e.target.value))}
            className="w-full accent-teal-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="tune-tendrils" className="text-slate-300">
              Tendrils (IQ 2-Stage Warp)
            </label>
            <span className="font-code-clinical text-teal-300">{params.tendrils.toFixed(2)}</span>
          </div>
          <input
            id="tune-tendrils"
            type="range"
            min={0.2}
            max={4.0}
            step={0.05}
            value={params.tendrils}
            onChange={(e) => update('tendrils', parseFloat(e.target.value))}
            className="w-full accent-teal-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="tune-scale" className="text-slate-300">
              Noise Scale
            </label>
            <span className="font-code-clinical text-teal-300">{params.noiseScale.toFixed(2)}</span>
          </div>
          <input
            id="tune-scale"
            type="range"
            min={0.4}
            max={4.5}
            step={0.05}
            value={params.noiseScale}
            onChange={(e) => update('noiseScale', parseFloat(e.target.value))}
            className="w-full accent-teal-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="tune-softness" className="text-slate-300">
              Edge Softness (fwidth AA)
            </label>
            <span className="font-code-clinical text-teal-300">{params.edgeSoftness.toFixed(1)} px</span>
          </div>
          <input
            id="tune-softness"
            type="range"
            min={0.4}
            max={6.0}
            step={0.1}
            value={params.edgeSoftness}
            onChange={(e) => update('edgeSoftness', parseFloat(e.target.value))}
            className="w-full accent-teal-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <label htmlFor="tune-drift" className="text-slate-300">
              Drift Speed
            </label>
            <span className="font-code-clinical text-teal-300">{params.driftSpeed.toFixed(2)}</span>
          </div>
          <input
            id="tune-drift"
            type="range"
            min={0.0}
            max={3.0}
            step={0.05}
            value={params.driftSpeed}
            onChange={(e) => update('driftSpeed', parseFloat(e.target.value))}
            className="w-full accent-teal-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Action Buttons & Shortcuts */}
      <div className="flex items-center gap-2 pt-4 mt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={onToggleCenter}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 py-2 px-3 text-xs font-semibold text-white transition-colors whitespace-nowrap cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">contrast</span>
          <span>Toggle (T)</span>
        </button>
        <button
          type="button"
          onClick={onReplayLastClick}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 py-2 px-3 text-xs font-medium text-slate-200 transition-colors whitespace-nowrap cursor-pointer"
        >
          <span className="material-symbols-outlined text-sm">replay</span>
          <span>Replay (R)</span>
        </button>
        <button
          type="button"
          onClick={() => onChangeParams({ ...DEFAULT_INK_PARAMS })}
          className="rounded-lg bg-slate-800 hover:bg-slate-700 py-2 px-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          title="Reset to default parameters"
        >
          Reset
        </button>
      </div>
    </aside>
  );
};
