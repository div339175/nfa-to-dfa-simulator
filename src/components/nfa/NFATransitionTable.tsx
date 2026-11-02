import React from 'react';
import { NFA } from '../../core/types';
import { formatSubset } from '../../core/subsetConstruction';
import { X } from 'lucide-react';

interface NFATransitionTableProps {
  nfa: NFA;
  onChange: (updatedNfa: NFA) => void;
}

export const NFATransitionTable: React.FC<NFATransitionTableProps> = ({ nfa, onChange }) => {
  const toggleDestination = (fromState: string, symbol: string, targetState: string) => {
    const currentTargets = nfa.transitions[fromState]?.[symbol] || [];
    let updatedTargets: string[];

    if (currentTargets.includes(targetState)) {
      updatedTargets = currentTargets.filter((s) => s !== targetState);
    } else {
      updatedTargets = [...currentTargets, targetState].sort();
    }

    const updatedTransitions = {
      ...nfa.transitions,
      [fromState]: {
        ...(nfa.transitions[fromState] || {}),
        [symbol]: updatedTargets,
      },
    };

    onChange({
      ...nfa,
      transitions: updatedTransitions,
    });
  };

  const clearCell = (fromState: string, symbol: string) => {
    const updatedTransitions = {
      ...nfa.transitions,
      [fromState]: {
        ...(nfa.transitions[fromState] || {}),
        [symbol]: [],
      },
    };
    onChange({
      ...nfa,
      transitions: updatedTransitions,
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">NFA Transition Matrix δ(q, a)</h4>
          <p className="text-xs text-slate-500">
            Click any state badge in a cell to toggle it in or out of the destination set.
          </p>
        </div>
        <div className="text-xs text-slate-500 flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="text-blue-600 font-bold">→</span> <span>Initial State</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="text-emerald-600 font-bold">*</span> <span>Final State</span>
          </span>
        </div>
      </div>

      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50/80">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-700 w-36">
              State (q)
            </th>
            {nfa.alphabet.map((sym) => (
              <th
                key={sym}
                scope="col"
                className="px-4 py-3 text-left font-semibold text-slate-800 font-mono bg-blue-50/50 border-l border-slate-200"
              >
                Input: <span className="text-blue-700 font-bold">'{sym}'</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {nfa.states.map((state) => {
            const isInitial = state === nfa.initialState;
            const isFinal = nfa.finalStates.includes(state);

            return (
              <tr key={state} className="hover:bg-slate-50/50 transition-colors">
                {/* State Column with initial and final indicators */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 text-center font-mono font-bold text-xs">
                      {isInitial && <span className="text-blue-600 font-bold" title="Initial State">→</span>}
                      {isFinal && <span className="text-emerald-600 font-bold" title="Final State">*</span>}
                    </span>
                    <span
                      className={`font-mono font-semibold px-2.5 py-1 rounded-md text-xs border ${
                        isFinal
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : isInitial
                          ? 'border-blue-300 bg-blue-50 text-blue-800'
                          : 'border-slate-300 bg-slate-100 text-slate-800'
                      }`}
                    >
                      {state}
                    </span>
                  </div>
                </td>

                {/* Transition Cells for each symbol */}
                {nfa.alphabet.map((sym) => {
                  const destinations = nfa.transitions[state]?.[sym] || [];
                  return (
                    <td
                      key={sym}
                      className="px-4 py-3 border-l border-slate-100 align-top"
                    >
                      <div className="space-y-2">
                        {/* Selected chips representation */}
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span
                            className={
                              destinations.length > 0
                                ? 'text-slate-900 font-bold'
                                : 'text-slate-400 italic'
                            }
                          >
                            {formatSubset(destinations)}
                          </span>
                          {destinations.length > 0 && (
                            <button
                              onClick={() => clearCell(state, sym)}
                              className="text-slate-400 hover:text-rose-500 p-0.5 rounded"
                              title="Clear all destinations for this cell"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Interactive pills to toggle any state */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {nfa.states.map((candidateState) => {
                            const isSelected = destinations.includes(candidateState);
                            return (
                              <button
                                key={candidateState}
                                type="button"
                                onClick={() => toggleDestination(state, sym, candidateState)}
                                className={`px-2 py-0.5 rounded text-xs font-mono font-medium transition-all ${
                                  isSelected
                                    ? 'bg-blue-600 text-white shadow-2xs ring-1 ring-blue-700'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                                }`}
                              >
                                {candidateState}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
