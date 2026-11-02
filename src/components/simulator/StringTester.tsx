import React, { useState, useEffect } from 'react';
import { DFA, NFA, SimulationResult } from '../../core/types';
import { simulateDFA } from '../../core/stringSimulator';
import { ExecutionTrace } from './ExecutionTrace';
import { BatchTestRunner } from './BatchTestRunner';
import { AutomatonGraph } from '../visualizer/AutomatonGraph';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface StringTesterProps {
  dfa: DFA;
  nfa: NFA;
  defaultTestStrings?: Array<{ input: string; expected: boolean; description: string }>;
}

export const StringTester: React.FC<StringTesterProps> = ({
  dfa,
  nfa,
  defaultTestStrings,
}) => {
  const [inputString, setInputString] = useState<string>('010');
  const [simResult, setSimResult] = useState<SimulationResult>(() => simulateDFA(dfa, '010'));
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1000);
  const [viewMode, setViewMode] = useState<'single' | 'batch'>('single');

  // Re-run simulation when dfa or inputString changes
  useEffect(() => {
    const res = simulateDFA(dfa, inputString);
    setSimResult(res);
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [dfa, inputString]);

  // Handle animation timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying && simResult.trace.length > 0) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= simResult.trace.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, simResult.trace.length, speed]);

  const activeTraceStep = simResult.trace[currentStepIndex];
  const activeStateId = activeTraceStep ? activeTraceStep.currentState : dfa.initialState;

  const handleStepForward = () => {
    setIsPlaying(false);
    if (currentStepIndex < simResult.trace.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  return (
    <div className="space-y-6">
      {/* View Switcher: Interactive String Trace vs Batch Suite */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-800">
            DFA String Validator &amp; Execution Simulator
          </h3>
          <p className="text-xs text-slate-500">
            Trace string execution through state transitions and evaluate language membership.
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setViewMode('single')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'single'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Interactive Trace
          </button>
          <button
            onClick={() => setViewMode('batch')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              viewMode === 'batch'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Batch Test Suite
          </button>
        </div>
      </div>

      {viewMode === 'batch' ? (
        <BatchTestRunner
          dfa={dfa}
          nfa={nfa}
          initialTestStrings={defaultTestStrings}
          onSelectStringForTrace={(str) => {
            setInputString(str);
            setViewMode('single');
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* String Input Control Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Enter Input String (w) over Σ = {'{' + dfa.alphabet.join(', ') + '}'}:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputString}
                    onChange={(e) => setInputString(e.target.value)}
                    placeholder="Enter string (e.g. 010) or leave empty for ε"
                    className="w-full px-3.5 py-2 font-mono text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {inputString === '' && (
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400 italic pointer-events-none">
                      (ε empty string)
                    </span>
                  )}
                </div>
              </div>

              {/* Quick sample chips */}
              <div className="sm:w-64">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Quick Inputs:
                </span>
                <div className="flex flex-wrap gap-1">
                  {['01', '010', '001', '101', '0', '1', '11'].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setInputString(sample)}
                      className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                    >
                      "{sample}"
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setInputString('')}
                    className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                  >
                    ε
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Tape Display: Current Character Highlighter */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-600">Input Tape:</span>
                <div className="flex items-center space-x-1 font-mono text-sm bg-white p-1 rounded border border-slate-300">
                  {inputString.length === 0 ? (
                    <span className="px-2 py-0.5 text-slate-400 italic">ε</span>
                  ) : (
                    inputString.split('').map((char, idx) => {
                      const isBeingRead =
                        currentStepIndex > 0 && currentStepIndex - 1 === idx;
                      const hasBeenRead = currentStepIndex - 1 > idx;

                      return (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded transition-all ${
                            isBeingRead
                              ? 'bg-amber-400 text-amber-950 font-bold ring-2 ring-amber-300 scale-105'
                              : hasBeenRead
                              ? 'bg-slate-100 text-slate-400 line-through'
                              : 'bg-white text-slate-800'
                          }`}
                        >
                          {char}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Playback Controls & Speed */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs mr-1">
                  {[
                    { label: '0.5x', ms: 1800 },
                    { label: '1x', ms: 1000 },
                    { label: '2x', ms: 500 },
                  ].map((s) => (
                    <button
                      key={s.label}
                      onClick={() => setSpeed(s.ms)}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                        speed === s.ms ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                  title="Reset to start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleStepBackward}
                  disabled={currentStepIndex === 0}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 transition-colors"
                  title="Step back"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 text-white transition-colors ${
                    isPlaying ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Animate</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleStepForward}
                  disabled={currentStepIndex >= simResult.trace.length - 1}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-slate-700 transition-colors"
                  title="Step forward"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Live DFA Diagram with Pulsing Active State */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 font-medium px-1">
              <span>Interactive DFA State Flow</span>
              <span>
                Active State:{' '}
                <strong className="text-amber-700 font-mono text-sm">
                  {activeStateId}
                </strong>
              </span>
            </div>
            <AutomatonGraph
              type="DFA"
              dfa={dfa}
              activeStateId={activeStateId}
              className="h-[360px] w-full"
            />
          </div>

          {/* Execution Trace Table */}
          <ExecutionTrace
            simulationResult={simResult}
            currentPlaybackIndex={currentStepIndex}
          />
        </div>
      )}
    </div>
  );
};
