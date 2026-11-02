import React from 'react';
import { SimulationResult } from '../../core/types';
import { formatSubset } from '../../core/subsetConstruction';
import { CheckCircle2, XCircle, AlertCircle, ArrowRight } from 'lucide-react';

interface ExecutionTraceProps {
  simulationResult: SimulationResult;
  currentPlaybackIndex?: number;
}

export const ExecutionTrace: React.FC<ExecutionTraceProps> = ({
  simulationResult,
  currentPlaybackIndex,
}) => {
  const { trace, accepted, inputString, error } = simulationResult;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
      {/* Simulation Result Banner */}
      <div
        className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
          error
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : accepted
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}
      >
        <div className="flex items-center space-x-3">
          {error ? (
            <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
          ) : accepted ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0" />
          )}

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Evaluation Result:
              </span>
              <span
                className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                  error
                    ? 'bg-rose-200 text-rose-800'
                    : accepted
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-rose-200 text-rose-800'
                }`}
              >
                {error ? 'SYNTAX ERROR' : accepted ? 'ACCEPTED' : 'REJECTED'}
              </span>
            </div>
            <p className="text-xs mt-0.5 opacity-90">
              String <span className="font-mono font-bold">"{inputString}"</span> ended at state{' '}
              <span className="font-mono font-bold">
                {simulationResult.finalState || 'None'}
              </span>{' '}
              ({formatSubset(simulationResult.finalSubset)}).
            </p>
          </div>
        </div>

        {error && (
          <div className="text-xs font-medium text-rose-700 bg-white/70 px-3 py-1.5 rounded-lg border border-rose-200">
            {error}
          </div>
        )}
      </div>

      {/* Execution Trace Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-700 w-16">
                Step
              </th>
              <th className="px-4 py-2.5 text-center font-semibold text-slate-700 w-24">
                Input Read
              </th>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-700">
                Current DFA State &amp; Subset
              </th>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-700">
                Next State
              </th>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-700">
                Execution Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white font-mono">
            {trace.map((step, idx) => {
              const isHighlighted = currentPlaybackIndex !== undefined && currentPlaybackIndex === idx;

              return (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    isHighlighted
                      ? 'bg-amber-100 font-semibold ring-1 ring-amber-300'
                      : 'hover:bg-slate-50/70'
                  }`}
                >
                  {/* Step Index */}
                  <td className="px-4 py-2.5 text-slate-500 font-bold">
                    #{step.stepIndex}
                  </td>

                  {/* Input Character */}
                  <td className="px-4 py-2.5 text-center">
                    {step.char !== null ? (
                      <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                        '{step.char}'
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Start</span>
                    )}
                  </td>

                  {/* Current State & Subset */}
                  <td className="px-4 py-2.5">
                    <span className="font-bold text-slate-900">{step.currentState}</span>{' '}
                    <span className="text-slate-500 font-normal">
                      = {formatSubset(step.currentSubset)}
                    </span>
                  </td>

                  {/* Next State */}
                  <td className="px-4 py-2.5">
                    {step.nextState ? (
                      <span className="text-blue-700 font-bold flex items-center space-x-1">
                        <ArrowRight className="w-3.5 h-3.5 inline text-slate-400" />
                        <span>{step.nextState}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">-</span>
                    )}
                  </td>

                  {/* Natural Language Explanation */}
                  <td className="px-4 py-2.5 font-sans text-slate-700 text-xs">
                    {step.explanation}
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
