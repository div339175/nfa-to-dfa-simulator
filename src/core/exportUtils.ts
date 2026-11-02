import { DFA, NFA } from './types';
import { formatSubset } from './subsetConstruction';

/**
 * Converts a DFA transition table to CSV format.
 */
export function dfaToCSV(dfa: DFA): string {
  const headers = ['DFA State', 'Subset', ...dfa.alphabet, 'Initial State', 'Final State'];
  const rows: string[][] = [];

  for (const state of dfa.states) {
    const subsetStr = formatSubset(dfa.stateSubsets[state] || []);
    const row = [
      state,
      `"${subsetStr}"`,
      ...dfa.alphabet.map((sym) => dfa.transitions[state]?.[sym] || '∅'),
      state === dfa.initialState ? 'Yes' : 'No',
      dfa.finalStates.includes(state) ? 'Yes' : 'No',
    ];
    rows.push(row);
  }

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Converts an NFA transition table to CSV format.
 */
export function nfaToCSV(nfa: NFA): string {
  const headers = ['State', ...nfa.alphabet, 'Initial State', 'Final State'];
  const rows: string[][] = [];

  for (const state of nfa.states) {
    const row = [
      state,
      ...nfa.alphabet.map((sym) => {
        const dests = nfa.transitions[state]?.[sym] || [];
        return `"${formatSubset(dests)}"`;
      }),
      state === nfa.initialState ? 'Yes' : 'No',
      nfa.finalStates.includes(state) ? 'Yes' : 'No',
    ];
    rows.push(row);
  }

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Converts DFA transition table to GitHub Flavored Markdown table.
 */
export function dfaToMarkdown(dfa: DFA): string {
  const headers = ['DFA State', 'Subset', ...dfa.alphabet, 'Initial', 'Final'];
  const separator = headers.map(() => '---');

  const rows: string[][] = [];
  for (const state of dfa.states) {
    const subsetStr = formatSubset(dfa.stateSubsets[state] || []);
    rows.push([
      state,
      subsetStr,
      ...dfa.alphabet.map((sym) => dfa.transitions[state]?.[sym] || '∅'),
      state === dfa.initialState ? '→ Yes' : 'No',
      dfa.finalStates.includes(state) ? '* Yes' : 'No',
    ]);
  }

  return [
    `| ${headers.join(' | ')} |`,
    `| ${separator.join(' | ')} |`,
    ...rows.map((r) => `| ${r.join(' | ')} |`),
  ].join('\n');
}

/**
 * Triggers a browser download of a text/csv file.
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
