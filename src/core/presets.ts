import { PresetAutomaton } from './types';

export const PRESET_AUTOMATA: PresetAutomaton[] = [
  {
    id: 'mandatory-validation',
    name: 'Mandatory Validation Example (User Specification)',
    category: 'Benchmark',
    description:
      'The reference textbook example specified in the project requirements. Tests non-determinism on state q0 with symbol 0 branching to {q0, q1}. Generates a 4-state DFA (A, B, C, D).',
    nfa: {
      states: ['q0', 'q1', 'q2'],
      alphabet: ['0', '1'],
      initialState: 'q0',
      finalStates: ['q2'],
      transitions: {
        q0: {
          '0': ['q0', 'q1'],
          '1': ['q0'],
        },
        q1: {
          '0': [],
          '1': ['q2'],
        },
        q2: {
          '0': ['q2'],
          '1': [],
        },
      },
    },
    testStrings: [
      { input: '01', expected: true, description: 'Path: q0 --0--> q1 --1--> q2 (Accept)' },
      { input: '010', expected: true, description: 'Path: q0 --0--> q1 --1--> q2 --0--> q2 (Accept)' },
      { input: '001', expected: true, description: 'Path: q0 --0--> q0 --0--> q1 --1--> q2 (Accept)' },
      { input: '101', expected: true, description: 'Path: q0 --1--> q0 --0--> q1 --1--> q2 (Accept)' },
      { input: '0', expected: false, description: 'Ends at {q0, q1}, none is final (Reject)' },
      { input: '1', expected: false, description: 'Ends at {q0}, not final (Reject)' },
      { input: '11', expected: false, description: 'Ends at {q0}, not final (Reject)' },
      { input: '011', expected: false, description: 'Ends at {q0}, not final (Reject)' },
    ],
  },
  {
    id: 'ends-with-01',
    name: 'Strings Ending with "01"',
    category: 'Pattern Matching',
    description:
      'Recognizes the regular language L = { w ∈ {0, 1}* | w ends with "01" }. NFA loops on start state q0 until non-deterministically guessing the suffix "01".',
    nfa: {
      states: ['q0', 'q1', 'q2'],
      alphabet: ['0', '1'],
      initialState: 'q0',
      finalStates: ['q2'],
      transitions: {
        q0: {
          '0': ['q0', 'q1'],
          '1': ['q0'],
        },
        q1: {
          '0': [],
          '1': ['q2'],
        },
        q2: {
          '0': [],
          '1': [],
        },
      },
    },
    testStrings: [
      { input: '01', expected: true, description: 'Exact suffix 01' },
      { input: '1001', expected: true, description: 'Ends with 01' },
      { input: '001', expected: true, description: 'Ends with 01' },
      { input: '111', expected: false, description: 'Does not end with 01' },
      { input: '10', expected: false, description: 'Ends with 10' },
      { input: '', expected: false, description: 'Empty string' },
    ],
  },
  {
    id: 'contains-11',
    name: 'Strings Containing Substring "11"',
    category: 'Substring Search',
    description:
      'Language of all binary strings that contain at least one occurrence of consecutive ones "11".',
    nfa: {
      states: ['q0', 'q1', 'q2'],
      alphabet: ['0', '1'],
      initialState: 'q0',
      finalStates: ['q2'],
      transitions: {
        q0: {
          '0': ['q0'],
          '1': ['q0', 'q1'],
        },
        q1: {
          '0': [],
          '1': ['q2'],
        },
        q2: {
          '0': ['q2'],
          '1': ['q2'],
        },
      },
    },
    testStrings: [
      { input: '11', expected: true, description: 'Minimal matching string' },
      { input: '0110', expected: true, description: 'Embedded 11' },
      { input: '10101', expected: false, description: 'Alternating without consecutive ones' },
      { input: '0000', expected: false, description: 'No ones' },
      { input: '01011', expected: true, description: 'Ends with 11' },
    ],
  },
  {
    id: 'dead-state-demo',
    name: 'NFA with Incomplete Transitions (Dead State Generator)',
    category: 'Trap State Validation',
    description:
      'Demonstrates subset construction when certain inputs lead to no transition, requiring the algorithm to construct the empty trap/dead state ∅.',
    nfa: {
      states: ['q0', 'q1'],
      alphabet: ['a', 'b'],
      initialState: 'q0',
      finalStates: ['q1'],
      transitions: {
        q0: {
          a: ['q1'],
          b: [],
        },
        q1: {
          a: [],
          b: ['q1'],
        },
      },
    },
    testStrings: [
      { input: 'a', expected: true, description: 'q0 --a--> q1 (Accept)' },
      { input: 'ab', expected: true, description: 'q0 --a--> q1 --b--> q1 (Accept)' },
      { input: 'abb', expected: true, description: 'q0 --a--> q1 --b--> q1 --b--> q1 (Accept)' },
      { input: 'b', expected: false, description: 'q0 on b leads to Dead State ∅ (Reject)' },
      { input: 'ba', expected: false, description: 'Starts with b, trapped in Dead State (Reject)' },
    ],
  },
];
