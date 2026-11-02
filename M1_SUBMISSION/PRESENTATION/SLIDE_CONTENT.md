# Classroom Presentation Slides: M1 Evaluation (12 Slides)

**Target Presentation Duration**: 8 to 10 Minutes Total  
**Target Audience**: Academic Faculty & Student Peers  
**Evaluation Stage**: M1 — Problem Analysis & Project Design  

---

## Slide 1: Project Title & Team Introduction
- **Presenter**: Member 1
- **Allocated Time**: 45 seconds
- **Slide Title**: Interactive NFA to DFA Conversion Simulator using Subset Construction Algorithm
- **Bullet Points to Display**:
  - Course: Automata Theory & Formal Languages (CS301)
  - Evaluation Milestone: M1 — Problem Analysis & Project Design (5.0 Marks)
  - Team of Five Members:
    - Member 1: Problem Definition & Automata Specification
    - Member 2: Competitive Tool Analysis & Feasibility Study
    - Member 3: System Architecture & Data Flow Design
    - Member 4: UI/UX Design & Screen Methodology
    - Member 5: Algorithm Engineering & Correctness Verification
- **Suggested Visual**: Clean university banner with title and automata logo (state circles with arrows).

---

## Slide 2: Problem Statement & Motivation
- **Presenter**: Member 1
- **Allocated Time**: 45 seconds
- **Slide Title**: Problem Statement & Academic Motivation
- **Bullet Points to Display**:
  - **The Computational Dilemma**: NFAs allow intuitive parallel state modeling, but physical hardware and lexical scanners require deterministic $O(1)$ state lookups.
  - **The Educational Challenge**: Powerset construction taught on paper leads to frequent student errors in set unions ($\bigcup \delta$), missed states, and trap state omissions.
  - **The "Black Box" Defect**: Existing desktop tools jump directly to the final DFA without explaining intermediate mathematical steps.
  - **Project Problem Statement**: To build an interactive, zero-backend web simulator that dynamically converts arbitrary NFAs into DFAs, exposes set-union calculations step-by-step, and verifies string execution live.
- **Suggested Visual**: Visual contrast graphic: *NFA (Branching/Guessing) $\to$ Powerset Conversion $\to$ DFA (Deterministic Execution)*.

---

## Slide 3: Objectives, Input/Output & Formal Specification
- **Presenter**: Member 1
- **Allocated Time**: 50 seconds
- **Slide Title**: Project Objectives & Formal 5-Tuple Models
- **Bullet Points to Display**:
  - **NFA Formal Model**: $M = (Q, \Sigma, \delta, q_0, F)$ where $\delta : Q \times \Sigma \to 2^Q$.
  - **DFA Formal Model**: $M' = (Q', \Sigma, \delta', q_0', F')$ where $\delta'(S, a) = \bigcup_{q \in S} \delta(q, a)$.
  - **Input Specifications**: States list ($Q$), Alphabet ($\Sigma$), Start state ($q_0$), Final states ($F$), and Transition Matrix ($\delta$).
  - **Output Artifacts**: Converted DFA, Step Snapshots array, Interactive React Flow Graphs, CSV/Markdown Tables.
  - **Initial & Final Conditions**: Start subset $q_0' = \{q_0\}$; Accepting subsets $F' = \{S \in Q' \mid S \cap F \neq \emptyset\}$.
- **Suggested Visual**: Side-by-side formal 5-tuple specification comparison card.

---

## Slide 4: Existing Tools & Comparative Analysis
- **Presenter**: Member 2
- **Allocated Time**: 45 seconds
- **Slide Title**: Existing Automata Tools Analysis
- **Bullet Points to Display**:
  - **JFLAP (Duke University)**: Comprehensive desktop Java application, but requires legacy JRE, has a dated Swing UI, and features a modal conversion black box.
  - **Automata Tutor (UPenn / TU Munich)**: Excellent cloud-based grading platform, but requires login accounts and lacks real-time interactive conversion steppers.
  - **Evan Wallace FSM**: Clean web canvas for drawing diagrams and exporting to TikZ, but has zero algorithm conversion engine.
  - **Our Unique Contribution**: Zero-installation, pure client-side web execution, step-by-step mathematical union breakdowns, and live string tape node pulsing.
- **Suggested Visual**: High-level comparison matrix highlighting our simulator's advantages.

---

## Slide 5: Multi-Dimensional Feasibility Study
- **Presenter**: Member 2
- **Allocated Time**: 45 seconds
- **Slide Title**: Feasibility Analysis & Boundary Scope
- **Bullet Points to Display**:
  - **Technical Feasibility**: Built with React 18, TypeScript, and React Flow. Dagre calculates planar coordinates in $O(|V| \cdot |E|)$. Verified by 14 Vitest unit tests.
  - **Economic Feasibility**: 100% open-source MIT-licensed stack. Static asset deployment with zero server infrastructure costs.
  - **Operational Feasibility**: Zero-installation browser URL access; accessible on laptops, Chromebooks, and tablets.
  - **Technical Disclosures**: Standard NFAs supported in M1 baseline; $\epsilon$-transitions and DFA minimization identified as future scope.
- **Suggested Visual**: 4-Pillar Feasibility diagram (Technical, Economic, Operational, Implementation).

---

## Slide 6: System Architecture & Technology Stack
- **Presenter**: Member 3
- **Allocated Time**: 50 seconds
- **Slide Title**: 4-Tier Client-Side System Architecture
- **Bullet Points to Display**:
  - **Tier 1 (Presentation)**: React Flow canvas, Tailwind CSS responsive cards, Lucide icons.
  - **Tier 2 (State Coordination)**: `App.tsx` root state with `useMemo` for instant conversion recalculation.
  - **Tier 3 (Computational Core)**: Pure TypeScript algorithms in `src/core/` decoupled from UI (`convertNFAtoDFA`, `simulateDFA`).
  - **Tier 4 (Layout & Geometry)**: Dagre hierarchical layout engine + Custom `AutomatonEdge` bezier curves.
  - **Technology Stack**: React 18, TypeScript 5.6, Vite 6, Tailwind CSS 3.4, React Flow v12, Dagre 0.8.5, Vitest 2.1.
- **Suggested Visual**: 4-Tier System Architecture Diagram (from `M1_SUBMISSION/DIAGRAMS/SYSTEM_ARCHITECTURE.mmd`).

---

## Slide 7: UML Design & Application Data Flow
- **Presenter**: Member 3
- **Allocated Time**: 45 seconds
- **Slide Title**: Component Relationships & Data Pipeline
- **Bullet Points to Display**:
  - **UML Component Architecture**: Strict encapsulation separating NFA configuration, algorithm execution, visualization, and simulation.
  - **Data Flow Pipeline**: User Matrix Input $\to$ `validateNFA()` $\to$ `convertNFAtoDFA()` $\to$ Step Snapshots Array + DFA Object $\to$ React Flow Render $\to$ String Tape Simulation.
  - **Immutable Step Recording**: Every union calculation captures a snapshot of current subsets, active queue, and intermediate matrix.
- **Suggested Visual**: UML Component and Data Flow Diagrams.

---

## Slide 8: UI Wireframes & Screen Methodology
- **Presenter**: Member 4
- **Allocated Time**: 45 seconds
- **Slide Title**: User Interface Design & Screen Layout
- **Bullet Points to Display**:
  - **Academic Design System**: Clean typography, low cognitive load, slate/indigo high-contrast palette.
  - **Automata Visual Conventions**:
    - Incoming start arrow badge (`start →`).
    - Concentric double-circle for accepting states.
    - Curved directional arrows for mutual transitions.
  - **Dual NFA Input Modes**: Interactive 2D matrix table with click-to-toggle state pills + single-rule form editor.
- **Suggested Visual**: Annotated wireframe of the NFA Configuration & Matrix Editor screen.

---

## Slide 9: Conversion Stepper & Interactive Simulator Modules
- **Presenter**: Member 4
- **Allocated Time**: 50 seconds
- **Slide Title**: Pedagogical Conversion Stepper & Tape Simulator
- **Bullet Points to Display**:
  - **7-Part Step Explanation Card**: Displays current subset, symbol, component transitions, mathematical union formula, and queue monitor.
  - **Live Intermediate DFA Table**: Assembles the DFA matrix row-by-row with glowing amber cell indicators.
  - **Interactive String Tape**: Visual tape consuming characters sequentially, cross-checking against alphabet $\Sigma$.
  - **Real-Time Diagram Synchronization**: The active DFA state node pulses in glowing amber on the graph canvas as characters are read.
- **Suggested Visual**: Annotated wireframes of the Step-by-Step Conversion and String Testing screens.

---

## Slide 10: Subset Construction Algorithm & Pseudocode
- **Presenter**: Member 5
- **Allocated Time**: 50 seconds
- **Slide Title**: Subset Construction Algorithm Engine
- **Bullet Points to Display**:
  - **Queue-Based BFS Reachability**: Starts at $S_0 = \{q_0\} \implies \text{State A}$; processes subsets via FIFO queue to avoid generating unreachable combinations.
  - **Set Union Computation**: $\delta'(S, a) = \bigcup_{q \in S} \delta(q, a)$ for all $a \in \Sigma$.
  - **Canonical Deduplication**: `getCanonicalSubsetKey()` sorts state IDs alphabetically, preventing infinite loops and duplicate states.
  - **Dead State ($\emptyset$) Handling**: Generates trap state $\emptyset$ with self-loops on all symbols when transitions are empty.
  - **Complexity**: Time $O(k \cdot n \log n \cdot 2^n)$; Space $O((k + n) \cdot 2^n)$.
- **Suggested Visual**: Algorithm Flowchart (from `M1_SUBMISSION/DIAGRAMS/ALGORITHM_FLOWCHART.mmd`).

---

## Slide 11: Manually Solved Benchmark Verification
- **Presenter**: Member 5
- **Allocated Time**: 50 seconds
- **Slide Title**: Benchmark NFA-to-DFA Mathematical Verification
- **Bullet Points to Display**:
  - **NFA Input**: $Q=\{q0, q1, q2\}$, $\Sigma=\{0, 1\}$, Start=$q0$, Final=$\{q2\}$.
    - $\delta(q0, 0)=\{q0, q1\}, \delta(q0, 1)=\{q0\}$; $\delta(q1, 1)=\{q2\}$; $\delta(q2, 0)=\{q2\}$.
  - **Computed DFA**:
    - $A=\{q0\}$: on $0 \to B$, on $1 \to A$ (Non-accepting)
    - $B=\{q0, q1\}$: on $0 \to B$, on $1 \to C$ (Non-accepting)
    - $C=\{q0, q2\}$: on $0 \to D$, on $1 \to A$ (**Accepting: contains $q2$**)
    - $D=\{q0, q1, q2\}$: on $0 \to D$, on $1 \to C$ (**Accepting: contains $q2$**)
  - **Verified String Traces**:
    - String `"010"`: Path $A \xrightarrow{0} B \xrightarrow{1} C \xrightarrow{0} D \implies$ **ACCEPTED**.
    - String `"11"`: Path $A \xrightarrow{1} A \xrightarrow{1} A \implies$ **REJECTED**.
- **Suggested Visual**: Verified DFA transition table and 4-node state diagram graphic.

---

## Slide 12: Conclusion, Limitations & Future Scope
- **Presenter**: Member 5 (with all members available for Q&A)
- **Allocated Time**: 40 seconds
- **Slide Title**: Conclusion & Project Roadmap
- **Bullet Points to Display**:
  - **M1 Milestones Achieved**: Full architectural specification, mathematical formalization, component design, and proven working prototype with 14 automated unit tests.
  - **Identified Boundaries**: Current focus on standard NFAs without $\epsilon$-moves; worst-case theoretical bound of $O(2^n)$.
  - **Future Scope (M2/M3 Roadmap)**:
    - Epsilon ($\epsilon$) closure integration.
    - DFA State Minimization using Hopcroft's partition-refinement algorithm.
    - Thompson's Construction (Regular Expression to NFA converter).
  - **Ready for Faculty Questions & Live Demonstration**.
- **Suggested Visual**: Summary badge showing "All M1 Criteria Satisfied (5.0 / 5.0 Marks)".
