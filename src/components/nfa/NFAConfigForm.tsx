import React, { useState } from 'react';
import { NFA, PresetAutomaton } from '../../core/types';
import { PRESET_AUTOMATA } from '../../core/presets';
import { NFATransitionTable } from './NFATransitionTable';
import { NFAValidationAlert } from './NFAValidationAlert';
import { validateNFA } from '../../core/subsetConstruction';
import {
  Sparkles,
  Plus,
  Trash2,
  Table as TableIcon,
  ListPlus,
  Check,
} from 'lucide-react';

interface NFAConfigFormProps {
  nfa: NFA;
  onChange: (nfa: NFA) => void;
  onApplyPreset: (preset: PresetAutomaton) => void;
}

export const NFAConfigForm: React.FC<NFAConfigFormProps> = ({
  nfa,
  onChange,
  onApplyPreset,
}) => {
  const [editorMode, setEditorMode] = useState<'matrix' | 'form'>('matrix');
  const [newStateInput, setNewStateInput] = useState('');
  const [newSymbolInput, setNewSymbolInput] = useState('');

  // Form mode single transition inputs
  const [formFromState, setFormFromState] = useState(nfa.states[0] || '');
  const [formSymbol, setFormSymbol] = useState(nfa.alphabet[0] || '');
  const [formToState, setFormToState] = useState(nfa.states[0] || '');

  const validation = validateNFA(nfa);

  // Add state
  const handleAddState = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newStateInput.trim();
    if (!trimmed || nfa.states.includes(trimmed)) return;

    const updatedStates = [...nfa.states, trimmed];
    const updatedTransitions: Record<string, Record<string, string[]>> = {
      ...nfa.transitions,
      [trimmed]: {},
    };
    for (const sym of nfa.alphabet) {
      updatedTransitions[trimmed][sym] = [];
    }

    onChange({
      ...nfa,
      states: updatedStates,
      transitions: updatedTransitions,
      initialState: nfa.initialState || trimmed,
    });
    setNewStateInput('');
  };

  // Remove state
  const handleRemoveState = (stateToRemove: string) => {
    if (nfa.states.length <= 1) return; // Keep at least one
    const updatedStates = nfa.states.filter((s) => s !== stateToRemove);
    const updatedFinals = nfa.finalStates.filter((s) => s !== stateToRemove);
    const updatedInitial =
      nfa.initialState === stateToRemove ? updatedStates[0] || '' : nfa.initialState;

    const updatedTransitions: Record<string, Record<string, string[]>> = {};
    for (const s of updatedStates) {
      updatedTransitions[s] = {};
      for (const sym of nfa.alphabet) {
        const dests = (nfa.transitions[s]?.[sym] || []).filter(
          (d) => d !== stateToRemove
        );
        updatedTransitions[s][sym] = dests;
      }
    }

    onChange({
      ...nfa,
      states: updatedStates,
      finalStates: updatedFinals,
      initialState: updatedInitial,
      transitions: updatedTransitions,
    });
  };

  // Add alphabet symbol
  const handleAddSymbol = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSymbolInput.trim();
    if (!trimmed || nfa.alphabet.includes(trimmed)) return;

    const updatedAlphabet = [...nfa.alphabet, trimmed];
    const updatedTransitions: Record<string, Record<string, string[]>> = { ...nfa.transitions };
    for (const s of nfa.states) {
      if (!updatedTransitions[s]) updatedTransitions[s] = {};
      updatedTransitions[s][trimmed] = [];
    }

    onChange({
      ...nfa,
      alphabet: updatedAlphabet,
      transitions: updatedTransitions,
    });
    setNewSymbolInput('');
  };

  // Remove alphabet symbol
  const handleRemoveSymbol = (symToRemove: string) => {
    if (nfa.alphabet.length <= 1) return;
    const updatedAlphabet = nfa.alphabet.filter((sym) => sym !== symToRemove);
    const updatedTransitions: Record<string, Record<string, string[]>> = {};
    for (const s of nfa.states) {
      updatedTransitions[s] = {};
      for (const sym of updatedAlphabet) {
        updatedTransitions[s][sym] = nfa.transitions[s]?.[sym] || [];
      }
    }

    onChange({
      ...nfa,
      alphabet: updatedAlphabet,
      transitions: updatedTransitions,
    });
  };

  // Toggle final state
  const handleToggleFinalState = (state: string) => {
    const isFinal = nfa.finalStates.includes(state);
    const updatedFinals = isFinal
      ? nfa.finalStates.filter((s) => s !== state)
      : [...nfa.finalStates, state];

    onChange({
      ...nfa,
      finalStates: updatedFinals,
    });
  };

  // Form mode add transition rule
  const handleAddFormTransition = () => {
    if (!formFromState || !formSymbol || !formToState) return;
    const currentTargets = nfa.transitions[formFromState]?.[formSymbol] || [];
    if (!currentTargets.includes(formToState)) {
      const updatedTargets = [...currentTargets, formToState].sort();
      onChange({
        ...nfa,
        transitions: {
          ...nfa.transitions,
          [formFromState]: {
            ...(nfa.transitions[formFromState] || {}),
            [formSymbol]: updatedTargets,
          },
        },
      });
    }
  };

  // Form mode remove transition rule
  const handleRemoveFormTransition = (from: string, sym: string, to: string) => {
    const currentTargets = nfa.transitions[from]?.[sym] || [];
    const updatedTargets = currentTargets.filter((t) => t !== to);
    onChange({
      ...nfa,
      transitions: {
        ...nfa.transitions,
        [from]: {
          ...(nfa.transitions[from] || {}),
          [sym]: updatedTargets,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Preset Quick Select Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <h3 className="text-sm font-semibold text-slate-800">
              Benchmark &amp; Textbook Presets
            </h3>
          </div>
          <span className="text-xs text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full font-medium">
            1-Click Load
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_AUTOMATA.map((preset) => {
            const isMandatory = preset.id === 'mandatory-validation';
            return (
              <button
                key={preset.id}
                onClick={() => onApplyPreset(preset)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  isMandatory
                    ? 'border-blue-400 bg-white shadow-xs ring-2 ring-blue-500/20 hover:border-blue-600'
                    : 'border-slate-200 bg-white/80 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isMandatory ? 'text-blue-700' : 'text-slate-500'
                    }`}
                  >
                    {preset.category}
                  </span>
                  {isMandatory && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                      REQUIRED
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold text-slate-800 truncate">
                  {preset.name}
                </div>
                <div className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {preset.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Validation Alert */}
      <NFAValidationAlert validation={validation} />

      {/* Basic Configuration: States, Alphabet, Start, Final */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* States Section */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 flex items-center space-x-2">
              <span>NFA States (Q)</span>
              <span className="text-xs font-normal text-slate-500">
                ({nfa.states.length} defined)
              </span>
            </label>
          </div>

          {/* Existing states chips */}
          <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-slate-50 rounded-lg border border-slate-200">
            {nfa.states.map((st) => (
              <span
                key={st}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-300 text-xs font-mono font-medium text-slate-800 shadow-2xs"
              >
                <span>{st}</span>
                {nfa.states.length > 1 && (
                  <button
                    onClick={() => handleRemoveState(st)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                    title={`Remove state ${st}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </span>
            ))}
          </div>

          {/* Add State Input */}
          <form onSubmit={handleAddState} className="flex space-x-2">
            <input
              type="text"
              value={newStateInput}
              onChange={(e) => setNewStateInput(e.target.value)}
              placeholder="e.g. q3, s0, trap"
              className="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newStateInput.trim()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add State</span>
            </button>
          </form>
        </div>

        {/* Alphabet Section */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 flex items-center space-x-2">
              <span>Input Alphabet (Σ)</span>
              <span className="text-xs font-normal text-slate-500">
                ({nfa.alphabet.length} symbols)
              </span>
            </label>
          </div>

          {/* Existing symbols chips */}
          <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-slate-50 rounded-lg border border-slate-200">
            {nfa.alphabet.map((sym) => (
              <span
                key={sym}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white border border-blue-200 text-xs font-mono font-bold text-blue-700 shadow-2xs"
              >
                <span>'{sym}'</span>
                {nfa.alphabet.length > 1 && (
                  <button
                    onClick={() => handleRemoveSymbol(sym)}
                    className="text-slate-400 hover:text-rose-600 transition-colors"
                    title={`Remove symbol ${sym}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </span>
            ))}
          </div>

          {/* Add Symbol Input */}
          <form onSubmit={handleAddSymbol} className="flex space-x-2">
            <input
              type="text"
              value={newSymbolInput}
              onChange={(e) => setNewSymbolInput(e.target.value)}
              placeholder="e.g. 0, 1, a, b"
              maxLength={3}
              className="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newSymbolInput.trim()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Symbol</span>
            </button>
          </form>
        </div>

        {/* Initial State Selector */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <label className="text-sm font-semibold text-slate-800 block">
            Initial State (q₀)
          </label>
          <p className="text-xs text-slate-500">
            Select the designated start state for the NFA.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {nfa.states.map((st) => {
              const isSelected = nfa.initialState === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => onChange({ ...nfa, initialState: st })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <span>→ {st}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Final States Selector */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <label className="text-sm font-semibold text-slate-800 block">
            Final / Accepting States (F)
          </label>
          <p className="text-xs text-slate-500">
            Select one or multiple accepting states (rendered with double circles).
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {nfa.states.map((st) => {
              const isFinal = nfa.finalStates.includes(st);
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleToggleFinalState(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center space-x-1.5 ${
                    isFinal
                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <span>* {st}</span>
                  {isFinal && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Transition Editor Switcher: Matrix vs Form-based */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              State Transitions (δ)
            </h3>
            <p className="text-xs text-slate-500">
              Specify non-deterministic transitions (a state can have zero, one, or multiple destinations per symbol).
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setEditorMode('matrix')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                editorMode === 'matrix'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Transition Matrix</span>
            </button>
            <button
              onClick={() => setEditorMode('form')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                editorMode === 'form'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span>Form-Based Editor</span>
            </button>
          </div>
        </div>

        {editorMode === 'matrix' ? (
          <NFATransitionTable nfa={nfa} onChange={onChange} />
        ) : (
          /* Form-based Transition Editor */
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-5">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-800 mb-2">
                Add Transition Rule
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    From State
                  </label>
                  <select
                    value={formFromState}
                    onChange={(e) => setFormFromState(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {nfa.states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    Input Symbol
                  </label>
                  <select
                    value={formSymbol}
                    onChange={(e) => setFormSymbol(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {nfa.alphabet.map((sym) => (
                      <option key={sym} value={sym}>
                        '{sym}'
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    To Target State
                  </label>
                  <select
                    value={formToState}
                    onChange={(e) => setFormToState(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {nfa.states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleAddFormTransition}
                    className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Rule</span>
                  </button>
                </div>
              </div>
            </div>

            {/* List of currently defined transitions */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Active Transition Rules
              </h4>
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {Object.entries(nfa.transitions).flatMap(([from, symMap]) =>
                  Object.entries(symMap).flatMap(([sym, targets]) =>
                    targets.map((to) => (
                      <div
                        key={`${from}-${sym}-${to}`}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800">{from}</span>
                          <span className="text-slate-400">──'{sym}'──&gt;</span>
                          <span className="font-bold text-blue-700">{to}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFormTransition(from, sym, to)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Delete rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
