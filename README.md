# Interactive NFA to DFA Conversion Simulator using Subset Construction Algorithm

An interactive, university-grade web application for Automata Theory that demonstrates the **Subset Construction Algorithm (Powerset Construction)** converting arbitrary Non-Deterministic Finite Automata (NFA) into equivalent Deterministic Finite Automata (DFA).

Built with **React**, **TypeScript**, **Tailwind CSS**, and **React Flow**.

---

## 1. Problem Statement

In the theory of computation, finite state machines are abstract models of computation:
- A **Non-Deterministic Finite Automaton (NFA)** can reside in multiple states simultaneously and transition to multiple destinations on the same input symbol without prior choice.
- A **Deterministic Finite Automaton (DFA)** has exactly one unambiguous destination for every state and input symbol.

While physical microprocessors and lexical analyzers require deterministic execution, specifying language recognizers as NFAs is often much more intuitive and concise. The subset construction theorem mathematically proves that NFAs and DFAs have equivalent expressive power, recognizing the class of **Regular Languages**. 

This project provides an educational simulation platform that visualizes the theoretical conversion process, step-by-step mathematical set unions, and deterministic string validation.

---

## 2. Objectives and Scope

### Key Objectives
1. **Dynamic Conversion**: Dynamically compute DFA state spaces from arbitrary user-defined NFAs in real time.
2. **Step-by-Step Transparency**: Deconstruct each transition calculation into individual NFA transitions, set unions ($\bigcup \delta(q, a)$), new state discoveries, and incremental transition tables.
3. **Interactive Graph Visualization**: Render state diagrams with double circles for final states, incoming start indicators, and labeled transition edges.
4. **Interactive String Simulation**: Validate any string character-by-character on the DFA with real-time graph node glow and full execution traces.
5. **Academic Export**: Export transition tables to CSV and Markdown.

### System Scope
- Pure browser-side TypeScript computation (no external server or database required).
- Supports arbitrary alphabet symbols (e.g. `0, 1` or `a, b`) and state counts.
- Supports canonical trap/dead state $\emptyset$ generation for incomplete transitions.
- Evaluates language equivalence by simulating both NFA and DFA on test string suites.

---

## 3. System Architecture & UML Component Diagram

```mermaid
graph TD
    subgraph UI ["User Interface Layer"]
        A[Sidebar & Navigation] --> B[Dashboard Overview]
        A --> C[NFA Configuration Form & Matrix]
        A --> D[NFA Graph Visualizer]
        A --> E[Step-by-Step Conversion Stepper]
        A --> F[DFA Graph Visualizer]
        A --> G[Transition Tables & CSV Export]
        A --> H[String Simulator & Batch Suite]
        A --> I[Theory Documentation]
    end

    subgraph Core ["Core Automata Logic Layer (TypeScript)"]
        J[subsetConstruction.ts]
        K[stringSimulator.ts]
        L[layoutGraph.ts]
        M[exportUtils.ts]
        N[presets.ts]
    end

    subgraph Libraries ["External Visualization & Layout Engines"]
        O[@xyflow/react - React Flow]
        P[Dagre Graph Layout]
        Q[Lucide Icons]
    end

    C --> J
    E --> J
    H --> K
    D --> L --> O
    F --> L --> O
    G --> M
    C --> N
```

---

## 4. Subset Construction Algorithm & Flowchart

### Mathematical Formulation
Given an NFA $M = (Q, \Sigma, \delta, q_0, F)$:
1. **Initial DFA State**: $q_0' = \{q_0\}$ (or $\epsilon\text{-closure}(q_0)$).
2. **State Space $Q'$**: Subsets of $Q$ ($Q' \subseteq \mathcal{P}(Q)$).
3. **Transition Function $\delta'$**:
   $$\delta'(S, a) = \bigcup_{q \in S} \delta(q, a) \quad \forall S \subseteq Q, a \in \Sigma$$
4. **Final States $F'$**:
   $$F' = \{ S \in Q' \mid S \cap F \neq \emptyset \}$$

### Conversion Flowchart

```mermaid
flowchart TD
    Start([Start]) --> Init[Initialize queue with start subset S0 = {q0}]
    Init --> LabelStart[Assign label A to S0, add to Q']
    LabelStart --> CheckQueue{Is queue empty?}
    CheckQueue -- Yes --> MarkFinals[Identify DFA final states F' where S ∩ F ≠ ∅]
    MarkFinals --> Complete([Return DFA M' & Conversion Steps])
    
    CheckQueue -- No --> Dequeue[Dequeue state S]
    Dequeue --> ForEachSymbol[For each symbol a in Σ]
    ForEachSymbol --> ComputeUnion["Compute U = ⋃ δ(q, a) for all q ∈ S"]
    ComputeUnion --> CheckEmpty{Is U empty?}
    CheckEmpty -- Yes --> TrapState[Set U = Dead State ∅]
    CheckEmpty -- No --> CheckExists{Is U already in Q'?}
    TrapState --> CheckExists
    CheckExists -- No --> NewState[Assign new label to U, add to Q' and enqueue]
    CheckExists -- Yes --> ExistingState[Map transition to existing state label]
    NewState --> RecordStep[Record step snapshot and update DFA table]
    ExistingState --> RecordStep
    RecordStep --> NextSymbol{More symbols in Σ?}
    NextSymbol -- Yes --> ForEachSymbol
    NextSymbol -- No --> CheckQueue
```

---

## 5. Pseudocode

```text
Algorithm SubsetConstruction(NFA M = (Q, Σ, δ, q0, F)) returns DFA M':
    Input:  NFA M with state set Q, alphabet Σ, transition function δ, start state q0, final states F
    Output: DFA M' = (Q', Σ, δ', A, F', stateSubsets)

    1.  Q' ← ∅
    2.  stateSubsets ← empty map
    3.  δ' ← empty nested map
    4.  s0 ← { q0 }
    5.  Assign label "A" to s0
    6.  stateSubsets["A"] ← s0
    7.  Q' ← Q' ∪ { "A" }
    8.  queue ← [ "A" ]
    9.  labelIndex ← 1

    10. While queue is not empty:
    11.     currentLabel ← queue.dequeue()
    12.     currentSubset ← stateSubsets[currentLabel]
    13.     For each symbol a ∈ Σ:
    14.         targetSubset ← ⋃_{q ∈ currentSubset} δ(q, a)
    15.         If targetSubset is empty:
    16.             targetLabel ← "∅" (Dead/Trap State)
    17.         Else if targetSubset already mapped to existingLabel:
    18.             targetLabel ← existingLabel
    19.         Else:
    20.             targetLabel ← GenerateNextLabel(labelIndex++)
    21.             stateSubsets[targetLabel] ← targetSubset
    22.             Q' ← Q' ∪ { targetLabel }
    23.             queue.enqueue(targetLabel)
    24.         δ'[currentLabel][a] ← targetLabel

    25. F' ← { S ∈ Q' | stateSubsets[S] ∩ F ≠ ∅ }
    26. Return DFA M' = (Q', Σ, δ', "A", F', stateSubsets)
```

---

## 6. Mandatory Validation Example

The simulator implements and validates the exact benchmark example specified in Section 3 of the project requirements:

### NFA Specification
- **States**: $Q = \{q0, q1, q2\}$
- **Alphabet**: $\Sigma = \{0, 1\}$
- **Initial State**: $q0$
- **Final State**: $F = \{q2\}$

**NFA Transition Matrix**:
| State | 0 | 1 |
| :---: | :---: | :---: |
| **q0** | $\{q0, q1\}$ | $\{q0\}$ |
| **q1** | $\emptyset$ | $\{q2\}$ |
| **q2** | $\{q2\}$ | $\emptyset$ |

### Calculated & Expected DFA

| DFA State | Subset | 0 | 1 | Final / Accepting |
| :---: | :---: | :---: | :---: | :---: |
| **A** | $\{q0\}$ | **B** | **A** | **No** |
| **B** | $\{q0, q1\}$ | **B** | **C** | **No** |
| **C** | $\{q0, q2\}$ | **D** | **A** | **Yes** |
| **D** | $\{q0, q1, q2\}$ | **D** | **C** | **Yes** |

### Mathematical Step Verification:
1. **$A = \{q0\}$**:
   - On `0`: $\delta(q0, 0) = \{q0, q1\} \implies \text{New state } B$
   - On `1`: $\delta(q0, 1) = \{q0\} \implies \text{State } A$
2. **$B = \{q0, q1\}$**:
   - On `0`: $\delta(q0, 0) \cup \delta(q1, 0) = \{q0, q1\} \cup \emptyset = \{q0, q1\} \implies B$
   - On `1`: $\delta(q0, 1) \cup \delta(q1, 1) = \{q0\} \cup \{q2\} = \{q0, q2\} \implies \text{New state } C$
3. **$C = \{q0, q2\}$**:
   - On `0`: $\delta(q0, 0) \cup \delta(q2, 0) = \{q0, q1\} \cup \{q2\} = \{q0, q1, q2\} \implies \text{New state } D$
   - On `1`: $\delta(q0, 1) \cup \delta(q2, 1) = \{q0\} \cup \emptyset = \{q0\} \implies A$
4. **$D = \{q0, q1, q2\}$**:
   - On `0`: $\{q0, q1\} \cup \emptyset \cup \{q2\} = \{q0, q1, q2\} \implies D$
   - On `1`: $\{q0\} \cup \{q2\} \cup \emptyset = \{q0, q2\} \implies C$

Final states: Any subset containing $q2$, which yields **$C$** and **$D$**.

---

## 7. Testing & Verification

Automated unit tests are implemented using **Vitest**:
- `src/tests/subsetConstruction.test.ts`:
  - Validates NFA configuration inputs.
  - Verifies the mandatory benchmark algorithm outputs.
  - Checks dead/trap state creation.
  - Verifies complete step-by-step recorded histories.
- `src/tests/stringSimulator.test.ts`:
  - Simulates valid string sequences (`01`, `010`, `001`, `101`).
  - Simulates invalid strings (`0`, `1`, `11`).
  - Simulates empty string ($\epsilon$).
  - Simulates invalid characters outside the alphabet.
  - Tests equivalence between NFA breadth-first execution and DFA transitions.

Run the test suite:
```bash
npm test
```

---

## 8. Installation and Execution

### Prerequisites
- Node.js version 18 or higher
- npm version 9 or higher

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run Unit Tests
```bash
npm test
```

### Step 3: Run the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Step 4: Build for Production
```bash
npm run build
npm run preview
```

---

## 9. Code Quality & Modularity

- **Strict TypeScript**: Full types and interfaces for NFAs, DFAs, steps, and simulation results.
- **Separation of Concerns**: Algorithm computation in `src/core/` is completely decoupled from React presentation components.
- **Responsive Layout**: Designed for laptops, desktops, and mobile viewports.
