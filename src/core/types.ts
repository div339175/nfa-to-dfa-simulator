export interface NFA {
  states: string[];
  alphabet: string[];
  initialState: string;
  finalStates: string[];
  /** transitions[state][symbol] = array of target states */
  transitions: Record<string, Record<string, string[]>>;
}

export interface DFA {
  states: string[];
  alphabet: string[];
  initialState: string;
  finalStates: string[];
  /** transitions[state][symbol] = target state */
  transitions: Record<string, Record<string, string>>;
  /** Mapping from DFA state name (e.g. 'A') to sorted list of NFA states (e.g. ['q0', 'q1']) */
  stateSubsets: Record<string, string[]>;
  /** Reverse mapping from canonical subset string (e.g. 'q0,q1') to DFA state label (e.g. 'B') */
  subsetToLabel: Record<string, string>;
  /** ID of dead/trap state if generated */
  deadStateId?: string;
}

export type StepType =
  | 'INITIALIZE'
  | 'PROCESS_SYMBOL'
  | 'NEW_STATE_DISCOVERED'
  | 'COMPLETE';

export interface IndividualTransition {
  nfaState: string;
  destinations: string[];
}

export interface ConversionStep {
  stepNumber: number;
  type: StepType;
  currentDfaState: string;
  currentSubset: string[];
  symbol?: string;
  individualTransitions?: IndividualTransition[];
  unionResult: string[];
  targetDfaState?: string;
  isNewState: boolean;
  explanation: string;
  formula: string;
  unprocessedQueue: string[];
  processedStates: string[];
  /** Snapshot of DFA transitions defined up to this step */
  dfaTransitionsSnapshot: Record<string, Record<string, string>>;
  /** All DFA states known up to this step */
  knownStatesSnapshot: Array<{
    label: string;
    subset: string[];
    isFinal: boolean;
    isInitial: boolean;
  }>;
}

export interface ConversionResult {
  dfa: DFA;
  steps: ConversionStep[];
  success: boolean;
  error?: string;
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  field?: string;
  message: string;
}

export interface NFAValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

export interface SimulationTraceStep {
  stepIndex: number;
  char: string | null;
  currentState: string;
  currentSubset: string[];
  nextState?: string;
  nextSubset?: string[];
  isFinal: boolean;
  status: 'START' | 'STEP' | 'ACCEPTED' | 'REJECTED' | 'INVALID_CHAR';
  explanation: string;
}

export interface SimulationResult {
  inputString: string;
  accepted: boolean;
  trace: SimulationTraceStep[];
  finalState: string;
  finalSubset: string[];
  error?: string;
}

export interface PresetAutomaton {
  id: string;
  name: string;
  category: string;
  description: string;
  nfa: NFA;
  testStrings: Array<{
    input: string;
    expected: boolean;
    description: string;
  }>;
}
