import { describe, it, expect } from 'vitest';
import { simulateDFA, simulateNFA } from '../core/stringSimulator';
import { convertNFAtoDFA } from '../core/subsetConstruction';
import { PRESET_AUTOMATA } from '../core/presets';

describe('String Simulator & Equivalence Verification', () => {
  const mandatoryPreset = PRESET_AUTOMATA.find((p) => p.id === 'mandatory-validation')!;
  const dfa = convertNFAtoDFA(mandatoryPreset.nfa).dfa;

  it('correctly accepts strings ending in valid transition sequence', () => {
    // Path: q0 --0--> {q0, q1} --1--> {q0, q2} (C is final)
    const res1 = simulateDFA(dfa, '01');
    expect(res1.accepted).toBe(true);
    expect(res1.finalState).toBe('C');

    // Path: q0 --0--> {q0, q1} --1--> {q0, q2} --0--> {q0, q1, q2} (D is final)
    const res2 = simulateDFA(dfa, '010');
    expect(res2.accepted).toBe(true);
    expect(res2.finalState).toBe('D');
  });

  it('correctly rejects strings not reaching an accepting state', () => {
    const res1 = simulateDFA(dfa, '0');
    expect(res1.accepted).toBe(false);
    expect(res1.finalState).toBe('B');

    const res2 = simulateDFA(dfa, '1');
    expect(res2.accepted).toBe(false);
    expect(res2.finalState).toBe('A');

    const res3 = simulateDFA(dfa, '11');
    expect(res3.accepted).toBe(false);
    expect(res3.finalState).toBe('A');
  });

  it('evaluates strings containing substring "11"', () => {
    const preset11 = PRESET_AUTOMATA.find((p) => p.id === 'contains-11')!;
    const dfa11 = convertNFAtoDFA(preset11.nfa).dfa;

    for (const tc of preset11.testStrings) {
      const dfaRes = simulateDFA(dfa11, tc.input);
      const nfaRes = simulateNFA(preset11.nfa, tc.input);

      expect(dfaRes.accepted).toBe(tc.expected);
      expect(nfaRes).toBe(tc.expected);
    }
  });

  it('handles empty string epsilon behavior consistently', () => {
    const emptySim = simulateDFA(dfa, '');
    expect(emptySim.accepted).toBe(false);
    expect(emptySim.inputString).toBe('ε');
    expect(emptySim.trace.length).toBe(2);
  });

  it('handles error gracefully when character is not in alphabet', () => {
    const invalidCharSim = simulateDFA(dfa, '01a');
    expect(invalidCharSim.accepted).toBe(false);
    expect(invalidCharSim.error).toContain("Symbol 'a' is not in alphabet");
  });
});
