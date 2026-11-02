import { DFA, NFA, SimulationResult, SimulationTraceStep } from './types';
import { formatSubset } from './subsetConstruction';

/**
 * Simulates an input string on a DFA step-by-step.
 */
export function simulateDFA(dfa: DFA, inputString: string): SimulationResult {
  const trace: SimulationTraceStep[] = [];

  if (!dfa.initialState || dfa.states.length === 0) {
    return {
      inputString,
      accepted: false,
      trace: [],
      finalState: '',
      finalSubset: [],
      error: 'DFA is empty or has no initial state.',
    };
  }

  let currentState = dfa.initialState;
  let currentSubset = dfa.stateSubsets[currentState] || [];
  let isCurrentFinal = dfa.finalStates.includes(currentState);

  // Initial step before consuming any characters
  trace.push({
    stepIndex: 0,
    char: null,
    currentState,
    currentSubset,
    isFinal: isCurrentFinal,
    status: 'START',
    explanation: `Start at initial DFA state ${currentState} = ${formatSubset(
      currentSubset
    )}.`,
  });

  // Handle empty string epsilon
  if (inputString.length === 0) {
    const accepted = isCurrentFinal;
    trace.push({
      stepIndex: 1,
      char: 'ε',
      currentState,
      currentSubset,
      isFinal: isCurrentFinal,
      status: accepted ? 'ACCEPTED' : 'REJECTED',
      explanation: accepted
        ? `Empty string ε accepted: start state ${currentState} is a final state.`
        : `Empty string ε rejected: start state ${currentState} is not a final state.`,
    });
    return {
      inputString: 'ε',
      accepted,
      trace,
      finalState: currentState,
      finalSubset: currentSubset,
    };
  }

  // Process each character
  for (let i = 0; i < inputString.length; i++) {
    const char = inputString[i];

    // Check if character is in alphabet
    if (!dfa.alphabet.includes(char)) {
      trace.push({
        stepIndex: i + 1,
        char,
        currentState,
        currentSubset,
        isFinal: false,
        status: 'INVALID_CHAR',
        explanation: `Invalid symbol '${char}': not in alphabet Σ = {${dfa.alphabet.join(
          ', '
        )}}. Simulation halted.`,
      });
      return {
        inputString,
        accepted: false,
        trace,
        finalState: currentState,
        finalSubset: currentSubset,
        error: `Symbol '${char}' is not in alphabet Σ = {${dfa.alphabet.join(', ')}}.`,
      };
    }

    const nextState = dfa.transitions[currentState]?.[char];

    if (!nextState) {
      trace.push({
        stepIndex: i + 1,
        char,
        currentState,
        currentSubset,
        isFinal: false,
        status: 'REJECTED',
        explanation: `No transition defined from ${currentState} on symbol '${char}'. String rejected.`,
      });
      return {
        inputString,
        accepted: false,
        trace,
        finalState: currentState,
        finalSubset: currentSubset,
      };
    }

    const nextSubset = dfa.stateSubsets[nextState] || [];
    const isNextFinal = dfa.finalStates.includes(nextState);

    trace.push({
      stepIndex: i + 1,
      char,
      currentState,
      currentSubset,
      nextState,
      nextSubset,
      isFinal: isNextFinal,
      status: 'STEP',
      explanation: `Read '${char}': transition from ${currentState} ${formatSubset(
        currentSubset
      )} ──'${char}'──> ${nextState} ${formatSubset(nextSubset)}.`,
    });

    currentState = nextState;
    currentSubset = nextSubset;
    isCurrentFinal = isNextFinal;
  }

  const accepted = isCurrentFinal;
  trace.push({
    stepIndex: trace.length,
    char: null,
    currentState,
    currentSubset,
    isFinal: isCurrentFinal,
    status: accepted ? 'ACCEPTED' : 'REJECTED',
    explanation: accepted
      ? `Final state ${currentState} is in F_DFA (${formatSubset(
          currentSubset
        )} contains an NFA accept state). STRING ACCEPTED.`
      : `Final state ${currentState} is NOT in F_DFA (${formatSubset(
          currentSubset
        )} contains no NFA accept states). STRING REJECTED.`,
  });

  return {
    inputString,
    accepted,
    trace,
    finalState: currentState,
    finalSubset: currentSubset,
  };
}

/**
 * Simulates string on the NFA directly using standard breadth-first search / active set tracking,
 * used to double-check and verify that NFA and DFA decisions are identical.
 */
export function simulateNFA(nfa: NFA, inputString: string): boolean {
  if (!nfa.initialState) return false;
  let activeStates = new Set<string>([nfa.initialState]);

  if (inputString.length === 0 || inputString === 'ε') {
    return Array.from(activeStates).some((s) => nfa.finalStates.includes(s));
  }

  for (const char of inputString) {
    if (!nfa.alphabet.includes(char)) return false;
    const nextStates = new Set<string>();
    for (const s of activeStates) {
      const targets = nfa.transitions[s]?.[char] || [];
      for (const t of targets) {
        nextStates.add(t);
      }
    }
    activeStates = nextStates;
    if (activeStates.size === 0) return false;
  }

  return Array.from(activeStates).some((s) => nfa.finalStates.includes(s));
}
