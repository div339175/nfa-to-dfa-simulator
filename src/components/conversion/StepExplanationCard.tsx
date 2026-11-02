import React from 'react';
import { ConversionStep } from '../../core/types';
import { formatSubset } from '../../core/subsetConstruction';
import {
  Sparkles,
  GitMerge,
  Info,
} from 'lucide-react';

interface StepExplanationCardProps {
  step: ConversionStep;
  totalSteps: number;
}

export const StepExplanationCard: React.FC<StepExplanationCardProps> = ({
  step,
  totalSteps,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
      {/* Header with Step Type and Number */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2.5">
          <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold font-mono text-sm flex items-center justify-center">
            {step.stepNumber}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {step.type === 'INITIALIZE' && 'Initialization: Start State'}
              {step.type === 'NEW_STATE_DISCOVERED' && 'New DFA State Discovered'}
              {step.type === 'PROCESS_SYMBOL' && 'Transition Calculation'}
              {step.type === 'COMPLETE' && 'Subset Construction Finished'}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Step {step.stepNumber} of {totalSteps}
            </p>
          </div>
        </div>

        <div>
          {step.isNewState && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>New State: {step.targetDfaState}</span>
            </span>
          )}
        </div>
      </div>

      {/* Mathematical Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* 1 & 2: Current Subset */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Current Subset (S)
          </span>
          <div className="flex items-center space-x-1.5">
            <span className="font-mono font-bold text-blue-700 text-base">
              {step.currentDfaState}
            </span>
            <span className="font-mono text-xs text-slate-600">
              = {formatSubset(step.currentSubset)}
            </span>
          </div>
        </div>

        {/* 3: Input Symbol */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Input Symbol (a)
          </span>
          <div className="font-mono text-base font-bold text-slate-800">
            {step.symbol ? `'${step.symbol}'` : 'N/A (Start)'}
          </div>
        </div>

        {/* 5 & 6: Union Result & Target State */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Union Result δ'(S, a)
          </span>
          <div className="flex items-center space-x-1.5">
            {step.targetDfaState ? (
              <>
                <span className="font-mono font-bold text-emerald-700 text-base">
                  {step.targetDfaState}
                </span>
                <span className="font-mono text-xs text-slate-600">
                  = {formatSubset(step.unionResult)}
                </span>
              </>
            ) : (
              <span className="font-mono text-xs text-slate-400">
                {formatSubset(step.unionResult)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4: Individual NFA Transitions & Union Details */}
      {step.individualTransitions && step.individualTransitions.length > 0 && (
        <div className="bg-blue-50/50 p-3.5 rounded-lg border border-blue-100 space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-blue-900">
            <GitMerge className="w-4 h-4 text-blue-600" />
            <span>NFA Component Transitions (Individual State Outputs):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono">
            {step.individualTransitions.map((it, idx) => (
              <div
                key={idx}
                className="bg-white p-2 rounded border border-blue-200/70 shadow-2xs flex items-center justify-between"
              >
                <span className="text-slate-700">
                  δ({it.nfaState}, '{step.symbol}')
                </span>
                <span className="font-bold text-blue-700">
                  {formatSubset(it.destinations)}
                </span>
              </div>
            ))}
          </div>

          {/* Mathematical Union Equation */}
          <div className="pt-1 text-xs font-mono text-slate-800 bg-white/70 p-2 rounded border border-blue-200/50">
            <span className="font-semibold text-blue-900">Formula: </span>
            <span>{step.formula}</span>
          </div>
        </div>
      )}

      {/* Natural Language Explanation */}
      <div className="flex items-start space-x-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">{step.explanation}</div>
      </div>

      {/* Unprocessed Queue & Processed State Monitor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
        <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/60">
          <span className="font-semibold text-amber-900 block mb-1">
            Pending Queue ({step.unprocessedQueue.length}):
          </span>
          <div className="flex flex-wrap gap-1 font-mono">
            {step.unprocessedQueue.length > 0 ? (
              step.unprocessedQueue.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded bg-white border border-amber-300 text-amber-800 font-bold"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-slate-400 italic">Empty queue (Finished)</span>
            )}
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-200">
          <span className="font-semibold text-slate-700 block mb-1">
            Processed States ({step.processedStates.length}):
          </span>
          <div className="flex flex-wrap gap-1 font-mono">
            {step.processedStates.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
