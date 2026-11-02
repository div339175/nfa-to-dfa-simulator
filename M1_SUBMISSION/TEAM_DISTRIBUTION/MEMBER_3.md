# M1 Individual Contribution Report: Member 3

**Student Name / Role**: Member 3 — System Architecture & Engine Design Specialist  
**Assigned Evaluation Criterion**: Criterion 3 (Part A) — System Architecture, Data Flow & Component Design  
**Marks Weightage**: 1.0 / 5.0 Marks (Half of Criterion 3)  
**Project Title**: Interactive NFA to DFA Conversion Simulator using Subset Construction Algorithm  

---

## 1. High-Level System Architecture

The simulator utilizes a **Modern Decoupled Client-Side Architecture** built upon React 18, TypeScript, and Vite. The system is completely self-contained within the client browser, requiring no backend server, API gateway, or persistent database.

```
+---------------------------------------------------------------------------------------------------+
|                                  HIGH-LEVEL SYSTEM ARCHITECTURE                                   |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|   +-------------------------------------------------------------------------------------------+   |
|   |                              LAYER 1: USER INTERFACE & PRESENTATION                       |   |
|   |   Sidebar Navigation | Top Header | Dashboard Overview | NFA/DFA Canvas | String Tester   |   |
|   +---------------------------------------------▲---------------------------------------------+   |
|                                                 │ Props & Event Callbacks                         |
|   +---------------------------------------------▼---------------------------------------------+   |
|   |                              LAYER 2: STATE COORDINATION (App.tsx)                        |   |
|   |   Root State: nfa, activeTab, stepIndex | Memoized Hook: convertNFAtoDFA(nfa)             |   |
|   +---------------------------------------------▲---------------------------------------------+   |
|                                                 │ Dynamic Function Invocations                    |
|   +---------------------------------------------▼---------------------------------------------+   |
|   |                       LAYER 3: PURE COMPUTATIONAL CORE (TypeScript Engine)                |   |
|   |   validateNFA() | computeSubsetTransition() | convertNFAtoDFA() | simulateDFA()           |   |
|   +---------------------------------------------▲---------------------------------------------+   |
|                                                 │ Graph Elements & Layout Calls                   |
|   +---------------------------------------------▼---------------------------------------------+   |
|   |                       LAYER 4: GRAPH LAYOUT & VISUALIZATION ENGINES                       |   |
|   |   Dagre Layout Engine (layoutGraph.ts) | React Flow Node Canvas (AutomatonGraph.tsx)      |   |
|   +-------------------------------------------------------------------------------------------+   |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

### Architectural Principles Applied
1. **Separation of Concerns**: Mathematical automata models in `src/core/` are pure TypeScript functions containing zero UI code, allowing them to be unit tested in isolation using Vitest.
2. **Unidirectional Reactive Data Flow**: State flows strictly downward from `App.tsx` through component props. Child components emit events (`onChange`, `onSelectPreset`, `onStepChange`) upward via callbacks.
3. **Memoized Computation**: Re-computation of the DFA and all conversion snapshots is guarded by React's `useMemo` hook, ensuring instantaneous updates when the NFA changes while avoiding redundant re-renders.

---

## 2. Source Files & Architectural Responsibilities

| Source File | Module Responsibility | Key Exports & Data Handled |
| :--- | :--- | :--- |
| `src/core/types.ts` | Type Safety Contract | Interfaces for `NFA`, `DFA`, `ConversionStep`, `SimulationResult`, `SimulationTraceStep`. |
| `src/core/subsetConstruction.ts` | Mathematical Conversion Engine | `validateNFA()`, `convertNFAtoDFA()`, `computeSubsetTransition()`, `getCanonicalSubsetKey()`. |
| `src/core/stringSimulator.ts` | String Execution & Verification | `simulateDFA()`, `simulateNFA()`. |
| `src/core/layoutGraph.ts` | Graph Geometry & Layout | `layoutAutomatonGraph()` using the Dagre library. |
| `src/core/exportUtils.ts` | File Exporters | `dfaToCSV()`, `dfaToMarkdown()`, `downloadFile()`. |
| `src/core/presets.ts` | Benchmark Configuration Library | `PRESET_AUTOMATA` (including the Mandatory Benchmark). |
| `src/App.tsx` | Master State Coordinator | Holds root state (`nfa`, `stepIndex`, `activeTab`), memoizes conversion, orchestrates views. |
| `src/components/visualizer/AutomatonGraph.tsx` | Visual Canvas Wrapper | Maps automata to React Flow nodes/edges with custom layout toggles. |
| `src/components/visualizer/StateNode.tsx` | Custom Circular State Node | Renders single circles, double circles (final), start indicators, and pulse animations. |
| `src/components/visualizer/AutomatonEdge.tsx` | Custom Curved Edge Renderer | Computes SVG cubic bezier arcs for self-loops, mutual curves, and backward transitions. |

---

## 3. Core Data Structures (`src/core/types.ts`)

### 1. NFA Data Structure
```typescript
export interface NFA {
  states: string[];                                   // Q: e.g. ['q0', 'q1', 'q2']
  alphabet: string[];                                 // Σ: e.g. ['0', '1']
  initialState: string;                               // q0: e.g. 'q0'
  finalStates: string[];                              // F: e.g. ['q2']
  transitions: Record<string, Record<string, string[]>>; // δ: state -> symbol -> array of target states
}
```

### 2. DFA Data Structure
```typescript
export interface DFA {
  states: string[];                                   // Q': e.g. ['A', 'B', 'C', 'D']
  alphabet: string[];                                 // Σ: e.g. ['0', '1']
  initialState: string;                               // q0': 'A'
  finalStates: string[];                              // F': e.g. ['C', 'D']
  transitions: Record<string, Record<string, string>>;// δ': state -> symbol -> single target state
  stateSubsets: Record<string, string[]>;             // Map: 'B' -> ['q0', 'q1']
  subsetToLabel: Record<string, string>;              // Reverse Map: 'q0,q1' -> 'B'
  deadStateId?: string;                               // '∅' if dead state is generated
}
```

### 3. ConversionStep Data Structure (Snapshot Pattern)
```typescript
export interface ConversionStep {
  stepNumber: number;
  type: 'INITIALIZE' | 'PROCESS_SYMBOL' | 'NEW_STATE_DISCOVERED' | 'COMPLETE';
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
  dfaTransitionsSnapshot: Record<string, Record<string, string>>;
  knownStatesSnapshot: Array<{ label: string; subset: string[]; isFinal: boolean; isInitial: boolean }>;
}
```

---

## 4. End-to-End Workflow & Data Flow

```
+---------------------------------------------------------------------------------------------+
|                                    APPLICATION DATA FLOW                                    |
+---------------------------------------------------------------------------------------------+
|                                                                                             |
| 1. User Input         ──► In NFAConfigForm: User modifies states, alphabet, or matrix.      |
|                                                                                             |
| 2. State Mutation     ──► App.tsx receives updatedNfa via handleNfaChange(updatedNfa).       |
|                                                                                             |
| 3. Dynamic Conversion ──► App.tsx useMemo calls convertNFAtoDFA(nfa):                       |
|                           - Validates NFA via validateNFA(nfa).                             |
|                           - If valid: initializes queue with S0 = {q0} -> 'A'.              |
|                           - Iterates BFS queue, computes unions via computeSubsetTransition.|
|                           - Records atomic ConversionStep snapshots.                        |
|                           - Returns { dfa: DFA, steps: ConversionStep[], success: true }.   |
|                                                                                             |
| 4. Visual Layout      ──► AutomatonGraph calls layoutAutomatonGraph(nodes, edges) in Dagre: |
|                           - Calculates 2D (x, y) coordinates for L->R hierarchy.            |
|                           - Connects edges to top, bottom, left, and right node handles.    |
|                                                                                             |
| 5. Stepper Navigation ──► User clicks Next/AutoPlay in ConversionStepper:                   |
|                           - Updates stepIndex in App.tsx.                                   |
|                           - StepExplanationCard renders current formula & union.            |
|                           - IntermediateDFATable displays live matrix snapshot.             |
|                                                                                             |
| 6. String Simulation  ──► User inputs string w in StringTester:                             |
|                           - simulateDFA(dfa, w) computes sequential state trace.            |
|                           - Active state ID is passed to AutomatonGraph to pulse node.      |
|                           - Tape highlights current symbol and displays ACCEPTED / REJECTED.|
|                                                                                             |
+---------------------------------------------------------------------------------------------+
```

---

## 5. Technology Stack Justification

| Technology | Role in Project | Engineering Justification |
| :--- | :--- | :--- |
| **React 18** | UI Framework | Declarative component model, virtual DOM diffing, and fast reactive updates. |
| **TypeScript (v5.6)** | Programming Language | Compile-time strict type checking, preventing undefined object access in transitions. |
| **Vite (v6.0)** | Build Tool & Bundler | Lightning-fast Hot Module Replacement (HMR) and optimized rollup production bundles. |
| **Tailwind CSS (v3.4)**| Styling Framework | Utility-first styling enabling a clean, responsive academic theme without CSS bloat. |
| **React Flow (@xyflow/react v12)** | Node-Edge Graph Renderer | Specialized canvas for smooth zoom/pan, custom SVG nodes, and custom curved edges. |
| **Dagre (v0.8.5)** | Graph Layout Engine | Mathematical implementation of the Sugiyama layout for automated planar positioning. |
| **Vitest (v2.1)** | Test Runner | Blazing-fast unit testing running in native ES module environment. |
| **Lucide React** | Iconography | Clean, accessible vector icons for playback, navigation, and export actions. |

---

## 6. Architecture & Flowchart Diagrams

Member 3 generated the master diagram specifications in `M1_SUBMISSION/DIAGRAMS/`:
- **`SYSTEM_ARCHITECTURE.mmd`**: 4-tier layer diagram detailing presentation, state coordination, core computation, and vendor libraries.
- **`UML_COMPONENT.mmd`**: Class and component relationship model demonstrating encapsulation.
- **`DATA_FLOW.mmd`**: Step-by-step pipeline from input through powerset construction to export.
- **`PROJECT_FLOWCHART.mmd`**: Complete application-level decision tree and tab transitions.

---

## 7. Conclusion of Member 3 Contribution
Member 3 establishes the architectural integrity of the application. By decoupling mathematical automata operations from React presentation and using strict TypeScript interfaces, the simulator achieves high execution speed, zero server costs, and complete maintainability.

---

## 8. Teacher Viva Questions for Member 3

1. **How is the application state structured to prevent unnecessary re-computations?**  
   *Answer*: In `App.tsx`, the conversion engine is wrapped in `useMemo(() => convertNFAtoDFA(nfa), [nfa])`. Recalculation only triggers when the underlying `nfa` object changes, while view switching or stepper navigation reuses the memoized result.
2. **How does the system automatically arrange states so they don't overlap on the canvas?**  
   *Answer*: We use **Dagre**, a directed graph layout engine that implements the Sugiyama hierarchical layout algorithm. It assigns discrete horizontal ranks and vertical separations to nodes, calculating exact $(x, y)$ coordinates in $O(|V| \cdot |E|)$ time.
3. **How does your custom edge component (`AutomatonEdge.tsx`) solve edge overlapping?**  
   *Answer*: When two states have mutual transitions (e.g. $C \to D$ on '0' and $D \to C$ on '1'), standard straight lines overlap. Our custom edge assigns the forward transition to top handles with a negative curvature offset, and the return transition to bottom handles with a positive curvature offset, rendering two distinct curved arcs.
4. **Why is pure client-side processing advantageous for this project?**  
   *Answer*: Zero network latency, complete offline operability, zero server hosting costs, and no user session fragility. The browser's V8 engine evaluates powerset construction in under 10 milliseconds.
