import React, { useState } from 'react';
import { DFA, NFA } from '../../core/types';
import { simulateDFA, simulateNFA } from '../../core/stringSimulator';
import { CheckCircle2, XCircle, Plus, Trash2 } from 'lucide-react';

interface BatchTestItem {
  input: string;
  expected?: boolean;
  description?: string;
}

interface BatchTestRunnerProps {
  dfa: DFA;
  nfa: NFA;
  initialTestStrings?: BatchTestItem[];
  onSelectStringForTrace?: (inputStr: string) => void;
}

export const BatchTestRunner: React.FC<BatchTestRunnerProps> = ({
  dfa,
  nfa,
  initialTestStrings,
  onSelectStringForTrace,
}) => {
  const [testCases, setTestCases] = useState<BatchTestItem[]>(
    initialTestStrings && initialTestStrings.length > 0
      ? initialTestStrings
      : [
          { input: '01', expected: true, description: 'Sample matching' },
          { input: '010', expected: true, description: 'Sample matching' },
          { input: '0', expected: false, description: 'Sample non-matching' },
          { input: '11', expected: false, description: 'Sample non-matching' },
          { input: '', expected: false, description: 'Empty string epsilon' },
        ]
  );

  const [newString, setNewString] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleAddTestCase = (e: React.FormEvent) => {
    e.preventDefault();
    setTestCases([...testCases, { input: newString, description: newDesc || 'User test string' }]);
    setNewString('');
    setNewDesc('');
  };

  const handleRemoveTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-sm font-semibold text-slate-800">
            Batch Test Suite &amp; NFA vs DFA Equivalence Verifier
          </h4>
          <p className="text-xs text-slate-500">
            Simulates strings across both NFA and converted DFA to verify identical language recognition.
          </p>
        </div>
      </div>

      {/* Add Custom Test String Form */}
      <form onSubmit={handleAddTestCase} className="flex flex-wrap gap-2 text-xs">
        <input
          type="text"
          value={newString}
          onChange={(e) => setNewString(e.target.value)}
          placeholder="Enter test string (or leave empty for ε)"
          className="flex-1 min-w-[200px] px-3 py-1.5 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="text"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="Description / note (optional)"
          className="w-48 px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium flex items-center space-x-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Test</span>
        </button>
      </form>

      {/* Test Cases Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-xs">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3.5 py-2 text-left font-semibold text-slate-700">
                Input String (w)
              </th>
              <th className="px-3.5 py-2 text-left font-semibold text-slate-700">
                Description
              </th>
              <th className="px-3.5 py-2 text-center font-semibold text-slate-700">
                DFA Result
              </th>
              <th className="px-3.5 py-2 text-center font-semibold text-slate-700">
                NFA Result
              </th>
              <th className="px-3.5 py-2 text-center font-semibold text-slate-700">
                Equivalence
              </th>
              <th className="px-3.5 py-2 text-right font-semibold text-slate-700">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white font-mono">
            {testCases.map((tc, idx) => {
              const dfaSim = simulateDFA(dfa, tc.input);
              const nfaAccepted = simulateNFA(nfa, tc.input);
              const isEquivalent = dfaSim.accepted === nfaAccepted;

              return (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="px-3.5 py-2 font-bold text-slate-900">
                    {tc.input === '' ? (
                      <span className="text-slate-400 italic font-normal">ε (empty)</span>
                    ) : (
                      `"${tc.input}"`
                    )}
                  </td>
                  <td className="px-3.5 py-2 font-sans text-slate-500 text-[11px]">
                    {tc.description || '-'}
                  </td>
                  <td className="px-3.5 py-2 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        dfaSim.accepted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {dfaSim.accepted ? 'ACCEPTED' : 'REJECTED'}
                    </span>
                  </td>
                  <td className="px-3.5 py-2 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        nfaAccepted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {nfaAccepted ? 'ACCEPTED' : 'REJECTED'}
                    </span>
                  </td>
                  <td className="px-3.5 py-2 text-center">
                    {isEquivalent ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Match</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-rose-700 font-semibold text-[11px]">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Mismatch</span>
                      </span>
                    )}
                  </td>
                  <td className="px-3.5 py-2 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {onSelectStringForTrace && (
                        <button
                          type="button"
                          onClick={() => onSelectStringForTrace(tc.input)}
                          className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-sans text-[11px] font-medium"
                          title="Simulate step-by-step on DFA graph"
                        >
                          Step Trace
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveTestCase(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove test case"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
