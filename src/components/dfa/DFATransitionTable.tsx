import React, { useState } from 'react';
import { DFA } from '../../core/types';
import { formatSubset } from '../../core/subsetConstruction';
import { dfaToCSV, dfaToMarkdown, downloadFile } from '../../core/exportUtils';
import { Download, Copy, Check } from 'lucide-react';

interface DFATransitionTableProps {
  dfa: DFA;
}

export const DFATransitionTable: React.FC<DFATransitionTableProps> = ({ dfa }) => {
  const [copied, setCopied] = useState(false);

  const handleDownloadCSV = () => {
    const csvContent = dfaToCSV(dfa);
    downloadFile(csvContent, 'dfa_transition_table.csv', 'text/csv;charset=utf-8;');
  };

  const handleCopyMarkdown = () => {
    const md = dfaToMarkdown(dfa);
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
      {/* Table Header and Action Toolbar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            DFA Transition Table δ_DFA(S, a)
          </h3>
          <p className="text-xs text-slate-500">
            Complete transition specification for the converted deterministic finite automaton.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-2xs"
            title="Copy Markdown Table to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Markdown</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-2xs"
            title="Download CSV table"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50/70">
            <tr>
              <th className="px-5 py-3 text-left font-semibold text-slate-700 w-32">
                DFA State
              </th>
              <th className="px-5 py-3 text-left font-semibold text-slate-700">
                NFA State Subset
              </th>
              {dfa.alphabet.map((sym) => (
                <th
                  key={sym}
                  className="px-5 py-3 text-center font-mono font-bold text-slate-800 border-l border-slate-200 bg-blue-50/30"
                >
                  Input: <span className="text-blue-700">'{sym}'</span>
                </th>
              ))}
              <th className="px-5 py-3 text-center font-semibold text-slate-700 w-28 border-l border-slate-200">
                Final / Accept
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white font-mono">
            {dfa.states.map((state) => {
              const isInitial = state === dfa.initialState;
              const isFinal = dfa.finalStates.includes(state);
              const subset = dfa.stateSubsets[state] || [];

              return (
                <tr
                  key={state}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    isFinal ? 'bg-emerald-50/20' : ''
                  }`}
                >
                  {/* State Name with Indicators */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 text-center font-mono font-bold text-xs">
                        {isInitial && (
                          <span className="text-blue-600 font-bold" title="Initial State">
                            →
                          </span>
                        )}
                        {isFinal && (
                          <span className="text-emerald-600 font-bold" title="Final State">
                            *
                          </span>
                        )}
                      </span>
                      <span
                        className={`font-mono font-bold px-2.5 py-1 rounded-md text-xs border ${
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

                  {/* Subset Notation: e.g. {q0, q1} */}
                  <td className="px-5 py-3.5 text-slate-700 text-xs font-semibold">
                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                      {state} = {formatSubset(subset)}
                    </span>
                  </td>

                  {/* Transitions */}
                  {dfa.alphabet.map((sym) => {
                    const target = dfa.transitions[state]?.[sym];
                    return (
                      <td
                        key={sym}
                        className="px-5 py-3.5 text-center border-l border-slate-100 text-xs"
                      >
                        {target ? (
                          <span className="inline-block px-2.5 py-1 rounded font-bold bg-blue-50 border border-blue-200 text-blue-800 shadow-2xs">
                            {target}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">∅</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Final / Accept Badge */}
                  <td className="px-5 py-3.5 text-center border-l border-slate-100">
                    {isFinal ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Yes
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">No</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer with Summary Stats */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-4">
          <span>
            Total DFA States: <strong className="text-slate-900">{dfa.states.length}</strong>
          </span>
          <span>
            Accepting States:{' '}
            <strong className="text-emerald-700">{dfa.finalStates.length}</strong>
          </span>
          <span>
            Alphabet Symbols:{' '}
            <strong className="text-slate-900">{dfa.alphabet.length}</strong>
          </span>
        </div>
        <div className="text-slate-500 font-mono text-[11px]">
          Notation: → Initial state, * Final/Accepting state
        </div>
      </div>
    </div>
  );
};
