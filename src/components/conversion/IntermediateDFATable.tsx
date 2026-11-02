import React from 'react';
import { ConversionStep } from '../../core/types';
import { formatSubset } from '../../core/subsetConstruction';

interface IntermediateDFATableProps {
  step: ConversionStep;
  alphabet: string[];
}

export const IntermediateDFATable: React.FC<IntermediateDFATableProps> = ({
  step,
  alphabet,
}) => {
  const { knownStatesSnapshot, dfaTransitionsSnapshot, currentDfaState, symbol } = step;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">
            DFA Transition Table (Live Step {step.stepNumber} Snapshot)
          </h4>
          <p className="text-xs text-slate-500">
            Dynamically constructed row-by-row as subsets are resolved.
          </p>
        </div>
        <div className="text-xs text-slate-500 flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Active Row</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Active Cell</span>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3.5 py-2.5 text-left font-semibold text-slate-700 w-28">
                DFA State
              </th>
              <th className="px-3.5 py-2.5 text-left font-semibold text-slate-700">
                Subset of NFA States
              </th>
              {alphabet.map((sym) => (
                <th
                  key={sym}
                  className={`px-3.5 py-2.5 text-center font-mono font-bold border-l border-slate-200 ${
                    symbol === sym ? 'bg-amber-50 text-amber-900' : 'text-slate-800'
                  }`}
                >
                  Input '{sym}'
                </th>
              ))}
              <th className="px-3 py-2.5 text-center font-semibold text-slate-700 w-20 border-l border-slate-200">
                Accepting?
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white font-mono">
            {knownStatesSnapshot.map((st) => {
              const isRowActive = st.label === currentDfaState;
              const transitions = dfaTransitionsSnapshot[st.label] || {};

              return (
                <tr
                  key={st.label}
                  className={`transition-colors ${
                    isRowActive ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50/50'
                  }`}
                >
                  {/* State Name */}
                  <td className="px-3.5 py-2.5 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5">
                      {st.isInitial && (
                        <span className="text-blue-600 font-bold" title="Initial State">
                          →
                        </span>
                      )}
                      {st.isFinal && (
                        <span className="text-emerald-600 font-bold" title="Accepting State">
                          *
                        </span>
                      )}
                      <span className="font-bold text-slate-900">{st.label}</span>
                    </div>
                  </td>

                  {/* Subset Content */}
                  <td className="px-3.5 py-2.5 text-slate-600 font-normal">
                    {formatSubset(st.subset)}
                  </td>

                  {/* Columns for each symbol */}
                  {alphabet.map((sym) => {
                    const target = transitions[sym];
                    const isCellActive = isRowActive && symbol === sym;

                    return (
                      <td
                        key={sym}
                        className={`px-3.5 py-2.5 text-center border-l border-slate-100 ${
                          isCellActive
                            ? 'bg-amber-100 text-amber-950 font-bold ring-2 ring-amber-400 inset-0'
                            : ''
                        }`}
                      >
                        {target ? (
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                            {target}
                          </span>
                        ) : (
                          <span className="text-slate-300 italic">-</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Final State Status */}
                  <td className="px-3 py-2.5 text-center border-l border-slate-100">
                    {st.isFinal ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                        Yes
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">No</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
