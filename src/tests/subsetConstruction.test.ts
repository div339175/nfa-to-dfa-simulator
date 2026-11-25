import { describe, it, expect } from 'vitest';
import { convertNFAtoDFA, validateNFA, computeSubsetTransition } from '../core/subsetConstruction';
import { simulateDFA, simulateNFA } from '../core/stringSimulator';
import { PRESET_AUTOMATA } from '../core/presets';
import { NFA } from '../core/types';

describe('Subset Construction Algorithm - Mandatory Validation Example', () => {
  const mandatoryPreset = PRESET_AUTOMATA.find((p) => p.id === 'mandatory-validation')!;
  const nfa = mandatoryPreset.nfa;

  it('validates the NFA configuration correctly', () => {
    const val = validateNFA(nfa);
    expect(val.isValid).toBe(true);
    expect(val.issues.filter((i) => i.type === 'error').length).toBe(0);
  });

  it('computes subset transitions accurately', () => {
    // q0 on 0 -> {q0, q1}
    const t0 = computeSubsetTransition(nfa, ['q0'], '0');
    expect(t0.unionResult).toEqual(['q0', 'q1']);

    // q0 on 1 -> {q0}
    const t1 = computeSubsetTransition(nfa, ['q0'], '1');
    expect(t1.unionResult).toEqual(['q0']);

    // {q0, q1} on 1 -> {q0, q2}
    const t2 = computeSubsetTransition(nfa, ['q0', 'q1'], '1');
    expect(t2.unionResult).toEqual(['q0', 'q2']);
  });

  it('produces the exact expected DFA from requirements specification', () => {
    const result = convertNFAtoDFA(nfa);
    expect(result.success).toBe(true);
    const dfa = result.dfa;

    // States: A={q0}, B={q0,q1}, C={q0,q2}, D={q0,q1,q2}
    expect(dfa.states).toEqual(['A', 'B', 'C', 'D']);
    expect(dfa.initialState).toBe('A');

    // Subsets mapping check
    expect(dfa.stateSubsets['A']).toEqual(['q0']);
    expect(dfa.stateSubsets['B']).toEqual(['q0', 'q1']);
    expect(dfa.stateSubsets['C']).toEqual(['q0', 'q2']);
    expect(dfa.stateSubsets['D']).toEqual(['q0', 'q1', 'q2']);

    // Transitions check
    // | State | 0 | 1 | Final |
    // | A={q0} | B | A | No |
    expect(dfa.transitions['A']['0']).toBe('B');
    expect(dfa.transitions['A']['1']).toBe('A');
    expect(dfa.finalStates.includes('A')).toBe(false);

    // | B={q0,q1} | B | C | No |
    expect(dfa.transitions['B']['0']).toBe('B');
    expect(dfa.transitions['B']['1']).toBe('C');
    expect(dfa.finalStates.includes('B')).toBe(false);

    // | C={q0,q2} | D | A | Yes |
    expect(dfa.transitions['C']['0']).toBe('D');
    expect(dfa.transitions['C']['1']).toBe('A');
    expect(dfa.finalStates.includes('C')).toBe(true);

    // | D={q0,q1,q2} | D | C | Yes |
    expect(dfa.transitions['D']['0']).toBe('D');
    expect(dfa.transitions['D']['1']).toBe('C');
    expect(dfa.finalStates.includes('D')).toBe(true);

    // Final states must be exactly C and D
    expect(dfa.finalStates.sort()).toEqual(['C', 'D'].sort());
  });

  it('generates rich, complete step-by-step conversion history', () => {
    const result = convertNFAtoDFA(nfa);
    expect(result.steps.length).toBeGreaterThan(0);

    const firstStep = result.steps[0];
    expect(firstStep.type).toBe('INITIALIZE');
    expect(firstStep.currentDfaState).toBe('A');

    const lastStep = result.steps[result.steps.length - 1];
    expect(lastStep.type).toBe('COMPLETE');
    expect(lastStep.unprocessedQueue.length).toBe(0);
  });

  it('simulates strings and matches NFA acceptance exactly', () => {
    const result = convertNFAtoDFA(nfa);
    const dfa = result.dfa;

    for (const testCase of mandatoryPreset.testStrings) {
      const dfaRes = simulateDFA(dfa, testCase.input);
      const nfaRes = simulateNFA(nfa, testCase.input);

      expect(dfaRes.accepted).toBe(testCase.expected);
      expect(nfaRes).toBe(testCase.expected);
    }
  });
});

describe('Subset Construction Edge Cases', () => {
  it('creates a dead/trap state when transitions produce empty subsets', () => {
    const deadPreset = PRESET_AUTOMATA.find((p) => p.id === 'dead-state-demo')!;
    const result = convertNFAtoDFA(deadPreset.nfa);
    expect(result.success).toBe(true);

    const dfa = result.dfa;
    // Should include dead state ∅
    expect(dfa.states).toContain('∅');
    expect(dfa.transitions['∅']['a']).toBe('∅');
    expect(dfa.transitions['∅']['b']).toBe('∅');

    // String starting with 'b' leads to ∅ and is rejected
    const sim = simulateDFA(dfa, 'b');
    expect(sim.accepted).toBe(false);
    expect(sim.finalState).toBe('∅');
  });

  it('handles empty input string correctly', () => {
    const mandatoryPreset = PRESET_AUTOMATA.find((p) => p.id === 'mandatory-validation')!;
    const result = convertNFAtoDFA(mandatoryPreset.nfa);
    const sim = simulateDFA(result.dfa, '');
    expect(sim.accepted).toBe(false);
    expect(sim.trace[0].currentState).toBe('A');
  });

  it('detects invalid alphabet characters in simulation', () => {
    const mandatoryPreset = PRESET_AUTOMATA.find((p) => p.id === 'mandatory-validation')!;
    const result = convertNFAtoDFA(mandatoryPreset.nfa);
    const sim = simulateDFA(result.dfa, '012');
    expect(sim.accepted).toBe(false);
    expect(sim.error).toBeDefined();
    expect(sim.trace.some((t) => t.status === 'INVALID_CHAR')).toBe(true);
  });

  it('rejects invalid NFA configuration', () => {
    const invalidNfa: NFA = {
      states: [],
      alphabet: ['0'],
      initialState: 'q0',
      finalStates: ['q0'],
      transitions: {},
    };
    const val = validateNFA(invalidNfa);
    expect(val.isValid).toBe(false);
    expect(val.issues.some((i) => i.type === 'error')).toBe(true);

    const conv = convertNFAtoDFA(invalidNfa);
    expect(conv.success).toBe(false);
    expect(conv.error).toBeDefined();
  });

  it('handles NFA where initial state is also accepting (accepts empty string)', () => {
    const nfaInitialAccept: NFA = {
      states: ['q0', 'q1'],
      alphabet: ['0', '1'],
      initialState: 'q0',
      finalStates: ['q0'],
      transitions: {
        q0: { '0': ['q1'], '1': [] },
        q1: { '0': [], '1': ['q0'] },
      },
    };
    const res = convertNFAtoDFA(nfaInitialAccept);
    expect(res.success).toBe(true);
    // DFA start state 'A' contains q0, so A must be in finalStates
    expect(res.dfa.finalStates).toContain(res.dfa.initialState);

    // Empty string must be accepted
    const sim = simulateDFA(res.dfa, '');
    expect(sim.accepted).toBe(true);
  });

  it('prunes unreachable NFA states from generated DFA state space', () => {
    const nfaWithUnreachable: NFA = {
      states: ['q0', 'q1', 'q_ghost'],
      alphabet: ['a'],
      initialState: 'q0',
      finalStates: ['q1'],
      transitions: {
        q0: { a: ['q1'] },
        q1: { a: ['q1'] },
        q_ghost: { a: ['q1'] }, // No transitions lead to q_ghost
      },
    };
    const res = convertNFAtoDFA(nfaWithUnreachable);
    expect(res.success).toBe(true);
    // None of the DFA states should contain q_ghost
    for (const state of res.dfa.states) {
      const subset = res.dfa.stateSubsets[state];
      expect(subset).not.toContain('q_ghost');
    }
  });

  it('handles single-state NFA properly', () => {
    const singleStateNFA: NFA = {
      states: ['q0'],
      alphabet: ['0', '1'],
      initialState: 'q0',
      finalStates: ['q0'],
      transitions: {
        q0: { '0': ['q0'], '1': ['q0'] },
      },
    };
    const res = convertNFAtoDFA(singleStateNFA);
    expect(res.success).toBe(true);
    expect(res.dfa.states.length).toBe(1);
    expect(res.dfa.transitions['A']['0']).toBe('A');
    expect(res.dfa.transitions['A']['1']).toBe('A');
    expect(res.dfa.finalStates).toContain('A');
  });

  it('handles NFA with multiple final states correctly', () => {
    const multiFinalNFA: NFA = {
      states: ['q0', 'q1', 'q2'],
      alphabet: ['a'],
      initialState: 'q0',
      finalStates: ['q1', 'q2'],
      transitions: {
        q0: { a: ['q1', 'q2'] },
        q1: { a: [] },
        q2: { a: [] },
      },
    };
    const res = convertNFAtoDFA(multiFinalNFA);
    expect(res.success).toBe(true);
    // B = {q1, q2} contains both final states, so B must be marked final
    expect(res.dfa.finalStates).toContain('B');
  });
});
