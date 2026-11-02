import {
  NFA,
  DFA,
  ConversionStep,
  ConversionResult,
  NFAValidationResult,
  IndividualTransition,
} from './types';

/**
 * Creates a canonical string key for a set of states.
 * Sorts state names to ensure set equality regardless of ordering.
 */
export function getCanonicalSubsetKey(states: string[]): string {
  const unique = Array.from(new Set(states)).filter(Boolean);
  unique.sort();
  return unique.join(',');
}

/**
 * Returns formatted subset representation like "{q0, q1}" or "∅"
 */
export function formatSubset(states: string[]): string {
  if (!states || states.length === 0) {
    return '∅';
  }
  const sorted = [...states].sort();
  return `{${sorted.join(', ')}}`;
}

/**
 * Generates sequential state labels: A, B, C, ..., Z, S27, S28, ...
 */
export function getStateLabel(index: number): string {
  if (index < 26) {
    return String.fromCharCode(65 + index);
  }
  return `S${index + 1}`;
}

/**
 * Validates an NFA configuration.
 */
export function validateNFA(nfa: NFA): NFAValidationResult {
  const issues: NFAValidationResult['issues'] = [];

  // Validate states
  if (!nfa.states || nfa.states.length === 0) {
    issues.push({
      type: 'error',
      field: 'states',
      message: 'At least one state must be defined.',
    });
  } else {
    const stateSet = new Set<string>();
    for (const s of nfa.states) {
      const trimmed = s.trim();
      if (!trimmed) {
        issues.push({
          type: 'error',
          field: 'states',
          message: 'State names cannot be empty.',
        });
      } else if (stateSet.has(trimmed)) {
        issues.push({
          type: 'error',
          field: 'states',
          message: `Duplicate state name "${trimmed}" found.`,
        });
      }
      stateSet.add(trimmed);
    }
  }

  // Validate alphabet
  if (!nfa.alphabet || nfa.alphabet.length === 0) {
    issues.push({
      type: 'error',
      field: 'alphabet',
      message: 'Alphabet must contain at least one symbol.',
    });
  } else {
    const alphabetSet = new Set<string>();
    for (const sym of nfa.alphabet) {
      const trimmed = sym.trim();
      if (!trimmed) {
        issues.push({
          type: 'error',
          field: 'alphabet',
          message: 'Alphabet symbols cannot be empty.',
        });
      } else if (alphabetSet.has(trimmed)) {
        issues.push({
          type: 'error',
          field: 'alphabet',
          message: `Duplicate alphabet symbol "${trimmed}" found.`,
        });
      }
      alphabetSet.add(trimmed);
    }
  }

  // Validate initial state
  if (!nfa.initialState) {
    issues.push({
      type: 'error',
      field: 'initialState',
      message: 'Initial state must be specified.',
    });
  } else if (!nfa.states.includes(nfa.initialState)) {
    issues.push({
      type: 'error',
      field: 'initialState',
      message: `Initial state "${nfa.initialState}" is not in the states list.`,
    });
  }

  // Validate final states
  if (!nfa.finalStates || nfa.finalStates.length === 0) {
    issues.push({
      type: 'warning',
      field: 'finalStates',
      message: 'No final states selected. The automaton will reject all strings.',
    });
  } else {
    for (const fs of nfa.finalStates) {
      if (!nfa.states.includes(fs)) {
        issues.push({
          type: 'error',
          field: 'finalStates',
          message: `Final state "${fs}" is not in the states list.`,
        });
      }
    }
  }

  // Validate transitions
  if (nfa.transitions) {
    for (const [fromState, symbolMap] of Object.entries(nfa.transitions)) {
      if (!nfa.states.includes(fromState)) {
        issues.push({
          type: 'error',
          field: 'transitions',
          message: `Transition source state "${fromState}" does not exist in states list.`,
        });
      }
      for (const [symbol, targets] of Object.entries(symbolMap)) {
        if (!nfa.alphabet.includes(symbol)) {
          issues.push({
            type: 'warning',
            field: 'transitions',
            message: `Transition uses symbol "${symbol}" which is not in defined alphabet.`,
          });
        }
        for (const target of targets) {
          if (!nfa.states.includes(target)) {
            issues.push({
              type: 'error',
              field: 'transitions',
              message: `Transition destination "${target}" does not exist in states list.`,
            });
          }
        }
      }
    }
  }

  const isValid = !issues.some((i) => i.type === 'error');
  return { isValid, issues };
}

/**
 * Computes transition for a single NFA state and symbol.
 */
export function getNFATransition(
  nfa: NFA,
  state: string,
  symbol: string
): string[] {
  if (!nfa.transitions[state] || !nfa.transitions[state][symbol]) {
    return [];
  }
  return [...nfa.transitions[state][symbol]];
}

/**
 * Computes the union of transitions for a subset of NFA states under a given symbol:
 * δ_DFA(S, a) = ⋃_{q ∈ S} δ_NFA(q, a)
 */
export function computeSubsetTransition(
  nfa: NFA,
  subset: string[],
  symbol: string
): {
  individualTransitions: IndividualTransition[];
  unionResult: string[];
} {
  const individualTransitions: IndividualTransition[] = [];
  const resultSet = new Set<string>();

  for (const q of subset) {
    const destinations = getNFATransition(nfa, q, symbol);
    individualTransitions.push({
      nfaState: q,
      destinations: destinations.sort(),
    });
    for (const dest of destinations) {
      resultSet.add(dest);
    }
  }

  const unionResult = Array.from(resultSet).sort();
  return {
    individualTransitions,
    unionResult,
  };
}

export interface ConvertOptions {
  includeDeadState?: boolean;
}

/**
 * Executes the mathematically rigorous Subset Construction Algorithm (also known as powerset construction)
 * converting an NFA to an equivalent DFA, and tracking every intermediate step with full mathematical explanations.
 */
export function convertNFAtoDFA(
  nfa: NFA,
  options: ConvertOptions = { includeDeadState: true }
): ConversionResult {
  const validation = validateNFA(nfa);
  if (!validation.isValid) {
    const errorMsg = validation.issues
      .filter((i) => i.type === 'error')
      .map((i) => i.message)
      .join(' ');
    return {
      dfa: {
        states: [],
        alphabet: nfa.alphabet,
        initialState: '',
        finalStates: [],
        transitions: {},
        stateSubsets: {},
        subsetToLabel: {},
      },
      steps: [],
      success: false,
      error: `Validation failed: ${errorMsg}`,
    };
  }

  const steps: ConversionStep[] = [];
  let stepCounter = 1;

  // Track discovered DFA states
  const dfaStates: string[] = [];
  const stateSubsets: Record<string, string[]> = {};
  const subsetToLabel: Record<string, string> = {};
  const dfaTransitions: Record<string, Record<string, string>> = {};
  const dfaFinalStates: string[] = [];

  let nextLabelIndex = 0;
  let deadStateLabel: string | undefined;

  const getOrCreateState = (
    subset: string[]
  ): { label: string; isNew: boolean } => {
    const sortedSubset = Array.from(new Set(subset)).sort();
    const key = getCanonicalSubsetKey(sortedSubset);

    if (subsetToLabel[key] !== undefined) {
      return { label: subsetToLabel[key], isNew: false };
    }

    let label: string;
    if (sortedSubset.length === 0) {
      // Empty set dead/trap state
      label = '∅';
      deadStateLabel = label;
    } else {
      label = getStateLabel(nextLabelIndex++);
    }

    dfaStates.push(label);
    stateSubsets[label] = sortedSubset;
    subsetToLabel[key] = label;
    dfaTransitions[label] = {};

    // Check if this subset contains any NFA final state
    const isFinal = sortedSubset.some((s) => nfa.finalStates.includes(s));
    if (isFinal) {
      dfaFinalStates.push(label);
    }

    return { label, isNew: true };
  };

  const getKnownStatesSnapshot = () => {
    return dfaStates.map((lbl) => ({
      label: lbl,
      subset: [...stateSubsets[lbl]],
      isFinal: dfaFinalStates.includes(lbl),
      isInitial: lbl === dfaStates[0],
    }));
  };

  const getTransitionsSnapshot = () => {
    const copy: Record<string, Record<string, string>> = {};
    for (const [s, symMap] of Object.entries(dfaTransitions)) {
      copy[s] = { ...symMap };
    }
    return copy;
  };

  // Step 1: Start with the subset containing the NFA initial state
  const initialSubset = [nfa.initialState];
  const { label: initialLabel } = getOrCreateState(initialSubset);

  const queue: string[] = [initialLabel];
  const processed: string[] = [];

  steps.push({
    stepNumber: stepCounter++,
    type: 'INITIALIZE',
    currentDfaState: initialLabel,
    currentSubset: initialSubset,
    unionResult: initialSubset,
    isNewState: true,
    explanation: `Initialize DFA with start state ${initialLabel} = ${formatSubset(
      initialSubset
    )} corresponding to NFA initial state ${nfa.initialState}.`,
    formula: `q₀' = {${nfa.initialState}} = ${initialLabel}`,
    unprocessedQueue: [...queue],
    processedStates: [...processed],
    dfaTransitionsSnapshot: getTransitionsSnapshot(),
    knownStatesSnapshot: getKnownStatesSnapshot(),
  });

  // Step 2: Process subsets in the queue
  while (queue.length > 0) {
    const currentLabel = queue.shift()!;
    const currentSubset = stateSubsets[currentLabel];
    processed.push(currentLabel);

    // If this is the dead state (empty set)
    if (currentSubset.length === 0) {
      for (const symbol of nfa.alphabet) {
        dfaTransitions[currentLabel][symbol] = currentLabel;
        steps.push({
          stepNumber: stepCounter++,
          type: 'PROCESS_SYMBOL',
          currentDfaState: currentLabel,
          currentSubset: [],
          symbol,
          individualTransitions: [],
          unionResult: [],
          targetDfaState: currentLabel,
          isNewState: false,
          explanation: `The trap/empty state ∅ transitions to itself on symbol '${symbol}'.`,
          formula: `δ'(${currentLabel}, '${symbol}') = ∅ = ${currentLabel}`,
          unprocessedQueue: [...queue],
          processedStates: [...processed],
          dfaTransitionsSnapshot: getTransitionsSnapshot(),
          knownStatesSnapshot: getKnownStatesSnapshot(),
        });
      }
      continue;
    }

    for (const symbol of nfa.alphabet) {
      const { individualTransitions, unionResult } = computeSubsetTransition(
        nfa,
        currentSubset,
        symbol
      );

      // Only skip empty set if options.includeDeadState is false
      if (unionResult.length === 0 && !options.includeDeadState) {
        // no transition or implicit reject
        continue;
      }

      const { label: targetLabel, isNew } = getOrCreateState(unionResult);
      dfaTransitions[currentLabel][symbol] = targetLabel;

      if (isNew) {
        queue.push(targetLabel);
      }

      // Build readable formula string
      // e.g. δ'(A, 0) = δ(q0, 0) = {q0, q1} = B
      const indParts = individualTransitions.map(
        (it) => `δ(${it.nfaState}, '${symbol}')=${formatSubset(it.destinations)}`
      );
      const formula =
        indParts.length > 1
          ? `δ'(${currentLabel}, '${symbol}') = ${indParts.join(' ∪ ')} = ${formatSubset(
              unionResult
            )} = ${targetLabel}`
          : `δ'(${currentLabel}, '${symbol}') = ${indParts[0] || '∅'} = ${formatSubset(
              unionResult
            )} = ${targetLabel}`;

      const explanation = isNew
        ? `From state ${currentLabel} = ${formatSubset(
            currentSubset
          )} on symbol '${symbol}', the union of NFA transitions is ${formatSubset(
            unionResult
          )}. This forms a new DFA state ${targetLabel}. Added to queue.`
        : `From state ${currentLabel} = ${formatSubset(
            currentSubset
          )} on symbol '${symbol}', the union of NFA transitions is ${formatSubset(
            unionResult
          )}, which corresponds to existing DFA state ${targetLabel}.`;

      steps.push({
        stepNumber: stepCounter++,
        type: isNew ? 'NEW_STATE_DISCOVERED' : 'PROCESS_SYMBOL',
        currentDfaState: currentLabel,
        currentSubset,
        symbol,
        individualTransitions,
        unionResult,
        targetDfaState: targetLabel,
        isNewState: isNew,
        explanation,
        formula,
        unprocessedQueue: [...queue],
        processedStates: [...processed],
        dfaTransitionsSnapshot: getTransitionsSnapshot(),
        knownStatesSnapshot: getKnownStatesSnapshot(),
      });
    }
  }

  // Final Completion Step
  steps.push({
    stepNumber: stepCounter++,
    type: 'COMPLETE',
    currentDfaState: initialLabel,
    currentSubset: initialSubset,
    unionResult: [],
    isNewState: false,
    explanation: `Subset construction complete! Generated ${
      dfaStates.length
    } DFA states (${dfaFinalStates.length} accepting). All subsets have been fully processed.`,
    formula: `|Q_DFA| = ${dfaStates.length}, |F_DFA| = ${dfaFinalStates.length}`,
    unprocessedQueue: [],
    processedStates: [...processed],
    dfaTransitionsSnapshot: getTransitionsSnapshot(),
    knownStatesSnapshot: getKnownStatesSnapshot(),
  });

  const dfa: DFA = {
    states: dfaStates,
    alphabet: [...nfa.alphabet],
    initialState: initialLabel,
    finalStates: dfaFinalStates,
    transitions: dfaTransitions,
    stateSubsets,
    subsetToLabel,
    deadStateId: deadStateLabel,
  };

  return {
    dfa,
    steps,
    success: true,
  };
}
