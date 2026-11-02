import React from 'react';
import { NFA, DFA, ConversionResult } from '../../core/types';
import { formatSubset } from '../../core/subsetConstruction';
import { NavTabId } from '../layout/Sidebar';
import {
  Sparkles,
  Network,
  GitCommit,
  Share2,
  PlaySquare,
  CheckCircle2,
  ArrowRight,
  Layers,
  BookOpen,
} from 'lucide-react';

interface DashboardOverviewProps {
  nfa: NFA;
  dfa: DFA;
  conversionResult: ConversionResult;
  onNavigate: (tab: NavTabId) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  nfa,
  dfa,
  conversionResult,
  onNavigate,
}) => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold backdrop-blur-xs border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Subset Construction Engine Active</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            NFA to DFA Conversion Simulator
          </h1>

          <p className="text-sm text-blue-100 leading-relaxed">
            Construct, visualize, step through, and verify the equivalence of non-deterministic and
            deterministic finite automata. Dynamically converts arbitrary state transitions into canonical
            powerset subsets with step-by-step mathematical proofs.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigate('conversion')}
              className="px-4 py-2 bg-white text-blue-900 hover:bg-blue-50 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-2 shadow-sm"
            >
              <span>Explore Step-by-Step Conversion</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('simulator')}
              className="px-4 py-2 bg-blue-600/60 hover:bg-blue-600 text-white font-medium text-xs rounded-lg transition-colors flex items-center space-x-2 border border-blue-400/30"
            >
              <span>Test Input Strings</span>
            </button>
          </div>
        </div>

        {/* Decorative background grid pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Share2 className="w-96 h-96 -mr-20 text-white" />
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* NFA States Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>NFA State Space</span>
            <Network className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            |Q| = {nfa.states.length}
          </div>
          <div className="text-xs text-slate-500 font-mono truncate">
            States: {formatSubset(nfa.states)}
          </div>
        </div>

        {/* DFA States Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>DFA Generated Subsets</span>
            <Share2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-700 font-mono">
            |Q'| = {dfa.states.length}
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Theoretical max: 2^{nfa.states.length} = {Math.pow(2, nfa.states.length)}
          </div>
        </div>

        {/* Steps Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Conversion Steps</span>
            <GitCommit className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {conversionResult.steps.length} Steps
          </div>
          <div className="text-xs text-emerald-700 font-medium flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Algorithm Converged</span>
          </div>
        </div>

        {/* Accepting States Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Accepting States</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 font-mono">
            |F'| = {dfa.finalStates.length}
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {formatSubset(dfa.finalStates)}
          </div>
        </div>
      </div>

      {/* Modules Quick Launch Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Module 1 & 2 Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              NFA Configuration &amp; Diagram
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Define arbitrary states, alphabet symbols, and non-deterministic transitions with both matrix
              and form editors. Visualizes circular states, double rings, and initial arrows.
            </p>
          </div>
          <button
            onClick={() => onNavigate('config')}
            className="w-full mt-3 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 flex items-center justify-between transition-colors"
          >
            <span>Open NFA Editor</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Module 4 Card */}
        <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm space-y-3 flex flex-col justify-between ring-2 ring-blue-500/10">
          <div>
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <GitCommit className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              Step-by-Step Conversion
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Inspect each individual transition union, new subset discovery, queue evolution, and live
              incremental transition table with auto-play and step controls.
            </p>
          </div>
          <button
            onClick={() => onNavigate('conversion')}
            className="w-full mt-3 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-between transition-colors shadow-xs"
          >
            <span>Launch Conversion Stepper</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Module 7 Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <PlaySquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              String Testing &amp; Simulator
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Test input strings over the defined alphabet. Features live DFA diagram animation with glowing
              current state, character-by-character trace logs, and batch testing.
            </p>
          </div>
          <button
            onClick={() => onNavigate('simulator')}
            className="w-full mt-3 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 flex items-center justify-between transition-colors"
          >
            <span>Launch String Simulator</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Automata Formal 5-Tuple Definition Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Formal 5-Tuple Specification: M = (Q, Σ, δ, q₀, F)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          {/* NFA Tuple */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <span className="font-sans font-bold text-slate-800 block text-xs">
              Current NFA Specification:
            </span>
            <div>Q = {formatSubset(nfa.states)}</div>
            <div>Σ = {'{' + nfa.alphabet.map((s) => `'${s}'`).join(', ') + '}'}</div>
            <div>q₀ = {nfa.initialState}</div>
            <div>F = {formatSubset(nfa.finalStates)}</div>
            <div>δ : Q × Σ → 2^Q</div>
          </div>

          {/* DFA Tuple */}
          <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-200 space-y-1.5">
            <span className="font-sans font-bold text-blue-900 block text-xs">
              Computed DFA Specification:
            </span>
            <div>Q' = {formatSubset(dfa.states)}</div>
            <div>Σ = {'{' + dfa.alphabet.map((s) => `'${s}'`).join(', ') + '}'}</div>
            <div>q₀' = {dfa.initialState}</div>
            <div>F' = {formatSubset(dfa.finalStates)}</div>
            <div>δ' : Q' × Σ → Q'</div>
          </div>
        </div>
      </div>
    </div>
  );
};
