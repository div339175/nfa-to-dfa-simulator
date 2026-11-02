import React from 'react';
import { PRESET_AUTOMATA } from '../../core/presets';
import { PresetAutomaton, NFA, DFA } from '../../core/types';
import { RotateCw } from 'lucide-react';

interface HeaderProps {
  nfa: NFA;
  dfa: DFA;
  currentPresetId: string | null;
  onSelectPreset: (preset: PresetAutomaton) => void;
  onResetToMandatory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  nfa,
  dfa,
  currentPresetId,
  onSelectPreset,
  onResetToMandatory,
}) => {
  const currentPreset = PRESET_AUTOMATA.find((p) => p.id === currentPresetId);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4">
      {/* Active Model Indicator */}
      <div className="flex items-center space-x-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Configuration:
            </span>
            <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {currentPreset ? currentPreset.name : 'Custom Defined NFA'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-2">
            <span>
              NFA: <strong className="text-slate-800">{nfa.states.length}</strong> states, Σ = {'{' + nfa.alphabet.join(',') + '}'}
            </span>
            <span>•</span>
            <span>
              DFA: <strong className="text-blue-700">{dfa.states.length}</strong> states ({dfa.finalStates.length} final)
            </span>
          </div>
        </div>
      </div>

      {/* Quick Preset Selector & Reset */}
      <div className="flex items-center space-x-2.5">
        <select
          value={currentPresetId || ''}
          onChange={(e) => {
            const found = PRESET_AUTOMATA.find((p) => p.id === e.target.value);
            if (found) onSelectPreset(found);
          }}
          className="text-xs font-medium px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>
            Switch Preset Automaton...
          </option>
          {PRESET_AUTOMATA.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <button
          onClick={onResetToMandatory}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors shadow-2xs"
          title="Load Mandatory Reference Example"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Load Mandatory Example</span>
        </button>
      </div>
    </header>
  );
};
