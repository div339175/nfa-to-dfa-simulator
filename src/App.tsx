import { useState, useMemo } from 'react';
import { Sidebar, NavTabId } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { NFAConfigForm } from './components/nfa/NFAConfigForm';
import { NFATransitionTable } from './components/nfa/NFATransitionTable';
import { AutomatonGraph } from './components/visualizer/AutomatonGraph';
import { ConversionStepper } from './components/conversion/ConversionStepper';
import { StepExplanationCard } from './components/conversion/StepExplanationCard';
import { IntermediateDFATable } from './components/conversion/IntermediateDFATable';
import { DFATransitionTable } from './components/dfa/DFATransitionTable';
import { StringTester } from './components/simulator/StringTester';
import { TheoryDocumentation } from './components/docs/TheoryDocumentation';
import { PRESET_AUTOMATA } from './core/presets';
import { NFA, PresetAutomaton } from './core/types';
import { convertNFAtoDFA, formatSubset } from './core/subsetConstruction';
import { nfaToCSV, downloadFile } from './core/exportUtils';
import { Download, AlertCircle, ArrowRight } from 'lucide-react';

export function App() {
  // Initialize with Mandatory Reference Preset
  const defaultPreset = PRESET_AUTOMATA[0];
  const [nfa, setNfa] = useState<NFA>(defaultPreset.nfa);
  const [currentPresetId, setCurrentPresetId] = useState<string | null>(defaultPreset.id);
  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');
  const [stepIndex, setStepIndex] = useState<number>(0);

  // Compute DFA and intermediate steps dynamically from NFA state
  const conversionResult = useMemo(() => {
    return convertNFAtoDFA(nfa);
  }, [nfa]);

  // Keep step index within valid bounds whenever NFA updates
  const safeStepIndex = Math.min(
    stepIndex,
    Math.max(0, conversionResult.steps.length - 1)
  );
  const currentStep = conversionResult.steps[safeStepIndex];

  // Preset switchers
  const handleSelectPreset = (preset: PresetAutomaton) => {
    setNfa(preset.nfa);
    setCurrentPresetId(preset.id);
    setStepIndex(0);
  };

  const handleResetToMandatory = () => {
    handleSelectPreset(PRESET_AUTOMATA[0]);
  };

  const handleNfaChange = (updatedNfa: NFA) => {
    setNfa(updatedNfa);
    setCurrentPresetId(null); // marked as custom
    setStepIndex(0);
  };

  const handleDownloadNFACSV = () => {
    const csv = nfaToCSV(nfa);
    downloadFile(csv, 'nfa_transition_table.csv', 'text/csv;charset=utf-8;');
  };

  return (
    <div className="flex min-h-screen bg-slate-100/70 font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        nfaStateCount={nfa.states.length}
        dfaStateCount={conversionResult.dfa.states.length}
        stepCount={conversionResult.steps.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          nfa={nfa}
          dfa={conversionResult.dfa}
          currentPresetId={currentPresetId}
          onSelectPreset={handleSelectPreset}
          onResetToMandatory={handleResetToMandatory}
        />

        <main className="flex-1 p-6 overflow-y-auto">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardOverview
              nfa={nfa}
              dfa={conversionResult.dfa}
              conversionResult={conversionResult}
              onNavigate={setActiveTab}
            />
          )}

          {/* TAB 2: NFA CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    NFA Configuration &amp; Editor
                  </h2>
                  <p className="text-xs text-slate-500">
                    Define states, alphabet, initial state, accepting states, and transitions.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('conversion')}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  <span>Run Subset Construction</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <NFAConfigForm
                nfa={nfa}
                onChange={handleNfaChange}
                onApplyPreset={handleSelectPreset}
              />
            </div>
          )}

          {/* TAB 3: NFA VISUALIZATION */}
          {activeTab === 'nfa-graph' && (
            <div className="max-w-6xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    NFA State Transition Diagram
                  </h2>
                  <p className="text-xs text-slate-500">
                    Interactive state diagram with circles for states, double circles for final states, and start arrow.
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  Initial: <strong className="text-blue-700">{nfa.initialState}</strong> | Final:{' '}
                  <strong className="text-emerald-700">{formatSubset(nfa.finalStates)}</strong>
                </div>
              </div>

              <AutomatonGraph type="NFA" nfa={nfa} className="h-[580px] w-full" />
            </div>
          )}

          {/* TAB 4: STEP-BY-STEP CONVERSION */}
          {activeTab === 'conversion' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Step-by-Step Subset Construction
                  </h2>
                  <p className="text-xs text-slate-500">
                    Inspect the mathematical union operations and queue state progression at every step.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('dfa-graph')}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
                >
                  <span>View Complete DFA Diagram</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {!conversionResult.success ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{conversionResult.error}</span>
                </div>
              ) : currentStep ? (
                <>
                  {/* Stepper Controls Bar */}
                  <ConversionStepper
                    currentStepIndex={safeStepIndex}
                    totalSteps={conversionResult.steps.length}
                    onStepChange={setStepIndex}
                  />

                  {/* Mathematical Explanation Card */}
                  <StepExplanationCard
                    step={currentStep}
                    totalSteps={conversionResult.steps.length}
                  />

                  {/* Live Intermediate DFA Transition Table */}
                  <IntermediateDFATable
                    step={currentStep}
                    alphabet={nfa.alphabet}
                  />
                </>
              ) : null}
            </div>
          )}

          {/* TAB 5: DFA VISUALIZATION */}
          {activeTab === 'dfa-graph' && (
            <div className="max-w-6xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    DFA State Diagram (Generated Powerset Automaton)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Distinct subset state labels (e.g. A={'{q0}'}, B={'{q0,q1}'}). Final states highlighted with double rings.
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  DFA States: <strong className="text-blue-700">{conversionResult.dfa.states.length}</strong> | Accepting:{' '}
                  <strong className="text-emerald-700">
                    {formatSubset(conversionResult.dfa.finalStates)}
                  </strong>
                </div>
              </div>

              <AutomatonGraph
                type="DFA"
                dfa={conversionResult.dfa}
                className="h-[580px] w-full"
              />
            </div>
          )}

          {/* TAB 6: TRANSITION TABLES */}
          {activeTab === 'tables' && (
            <div className="max-w-5xl mx-auto space-y-8">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Transition Tables &amp; CSV Export
                </h2>
                <p className="text-xs text-slate-500">
                  Side-by-side transition tables for the original non-deterministic and resulting deterministic automata.
                </p>
              </div>

              {/* DFA Transition Table Component */}
              <DFATransitionTable dfa={conversionResult.dfa} />

              {/* Original NFA Transition Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                      Original NFA Transition Table δ_NFA(q, a)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Non-deterministic mapping to powerset elements 2^Q.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadNFACSV}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download NFA CSV</span>
                  </button>
                </div>
                <div className="p-4">
                  <NFATransitionTable nfa={nfa} onChange={handleNfaChange} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: STRING TESTING & SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <StringTester
                dfa={conversionResult.dfa}
                nfa={nfa}
                defaultTestStrings={
                  currentPresetId
                    ? PRESET_AUTOMATA.find((p) => p.id === currentPresetId)?.testStrings
                    : undefined
                }
              />
            </div>
          )}

          {/* TAB 8: THEORY & DOCUMENTATION */}
          {activeTab === 'docs' && <TheoryDocumentation />}
        </main>
      </div>
    </div>
  );
}

export default App;
