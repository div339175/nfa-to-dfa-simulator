# Classroom Presentation: Verbatim Speaker Notes (8–10 Minutes)

This document contains exact spoken scripts and presentation cues for each of the five team members during the classroom evaluation.

---

### SLIDE 1: Project Title & Team Introduction
- **Presenter**: Member 1
- **Time**: 0:00 – 0:45 (45s)
- **Spoken Script**:
  > *"Good morning, respected Professor and fellow classmates. Today, our team is presenting the M1 Project Analysis and Design Documentation for our Automata Theory project titled: **Interactive NFA to DFA Conversion Simulator using Subset Construction Algorithm**.*
  >
  > *Our team consists of five members, each specializing in a core project domain:*
  > - *I am Member 1, leading Problem Definition and Automata Specifications.*
  > - *Member 2 has conducted the Comparative Tool Analysis and Feasibility Study.*
  > - *Member 3 is our Software Architect, covering Component Design and Data Flow.*
  > - *Member 4 is our UI/UX Specialist, detailing Screen Methodology and Wireframes.*
  > - *And Member 5 leads Algorithm Engineering and Mathematical Verification.*
  >
  > *Let us examine why this problem is vital in Computer Science."*

---

### SLIDE 2: Problem Statement & Motivation
- **Presenter**: Member 1
- **Time**: 0:45 – 1:30 (45s)
- **Spoken Script**:
  > *"In theoretical computer science, Non-Deterministic Finite Automata (NFAs) offer an intuitive way to model patterns and regular expressions because a state can branch to multiple destinations simultaneously. However, physical computer hardware, lexical scanners, and digital parsers cannot execute non-deterministic guessing without massive backtracking penalties. They require Deterministic Finite Automata (DFAs), where every transition is unambiguous and runs in $O(1)$ time per character.*
  >
  > *In academic curricula, students learning powerset construction on paper frequently make arithmetic errors—forgetting to take the union across all states in a subset, missing new states, or omitting the dead state $\emptyset$. Existing desktop tools like JFLAP often act as black boxes, jumping directly to the final DFA without explaining the algebraic steps.*
  >
  > *Our problem statement is to build an interactive, browser-native simulator that bridges this gap by calculating powerset conversions dynamically, decomposing set unions step-by-step, and synchronizing string validation live on state diagrams."*

---

### SLIDE 3: Objectives, Input/Output & Formal Specification
- **Presenter**: Member 1
- **Time**: 1:30 – 2:20 (50s)
- **Spoken Script**:
  > *"Mathematically, we model the input NFA as a 5-tuple: $M = (Q, \Sigma, \delta, q_0, F)$, where $\delta$ maps a state and symbol to an element of the powerset $2^Q$.*
  >
  > *Our engine transforms this into an equivalent DFA: $M' = (Q', \Sigma, \delta', q_0', F')$, where each DFA state is an aggregated subset of NFA states. The initial state is the singleton subset containing start state $q_0$, and the transition function computes the mathematical union $\bigcup_{q \in S} \delta(q, a)$ across all states in the subset.*
  >
  > *Our inputs include arbitrary state sets, alphabet symbols, and transitions defined via a matrix or rule form. The outputs are the converted DFA, step-by-step snapshot arrays, React Flow planar diagrams, and downloadable CSV/Markdown tables.*
  >
  > *I will now hand over to Member 2 to present the Existing Tools Analysis and Feasibility Study."*

---

### SLIDE 4: Existing Tools & Comparative Analysis
- **Presenter**: Member 2
- **Time**: 2:20 – 3:05 (45s)
- **Spoken Script**:
  > *"Thank you, Member 1. To justify our project, we evaluated existing academic tools, primarily JFLAP from Duke University, Automata Tutor from UPenn and TU Munich, and Evan Wallace's FSM Designer.*
  >
  > *While JFLAP has historical breadth, it is a desktop Java Swing application requiring local JRE installation, which frequently encounters security and installation friction on modern operating systems. Furthermore, its conversion feature is modal-based and does not show mathematical union formulas alongside an evolving table.*
  >
  > *Automata Tutor is an automated homework grading system rather than an interactive step-by-step learning simulator, requiring course logins and teacher setups. Evan Wallace's tool is purely for drawing diagrams without any conversion engine.*
  >
  > *Our simulator fills this critical educational gap: it requires zero installation, runs anonymously in any modern browser, computes conversions in pure client-side TypeScript, and explicitly displays the mathematical union formulas at each step."*

---

### SLIDE 5: Multi-Dimensional Feasibility Study
- **Presenter**: Member 2
- **Time**: 3:05 – 3:50 (45s)
- **Spoken Script**:
  > *"We conducted a 4-pillar feasibility analysis:*
  > - *Technically, React 18, TypeScript, React Flow, and Dagre provide high-performance reactive updates and automated planar graph layouts.*
  > - *Economically, 100% of our dependencies use permissive MIT licenses, and the application compiles to static web bundles, resulting in zero server hosting costs.*
  > - *Operationally, zero-install browser accessibility allows students and professors to launch demonstrations instantly on any device.*
  >
  > *Regarding project boundaries: our M1 baseline focuses on standard NFAs without $\epsilon$-transitions, and generates the direct powerset DFA. Extensions like $\epsilon$-closure and Hopcroft minimization are designated for future milestones.*
  >
  > *Member 3 will now explain our System Architecture and Component Design."*

---

### SLIDE 6: System Architecture & Technology Stack
- **Presenter**: Member 3
- **Time**: 3:50 – 4:40 (50s)
- **Spoken Script**:
  > *"Thank you, Member 2. Our software architecture is organized into a clean 4-tier decoupled model completely contained within the client browser:*
  > - *Tier 1 is the Presentation Layer, built with React 18, Tailwind CSS, and Lucide icons.*
  > - *Tier 2 is the State Coordination Layer in `App.tsx`, which uses React's `useMemo` hook to automatically re-run powerset construction whenever the user edits the NFA.*
  > - *Tier 3 is our Pure Computational Core in `src/core/`. This TypeScript engine contains zero UI dependencies, allowing our mathematical conversion, validation, and string simulation to be tested independently.*
  > - *Tier 4 is the Layout and Visualization Layer, where Dagre calculates planar $(x, y)$ coordinates in $O(|V| \cdot |E|)$, and React Flow renders interactive SVG nodes and curved edges.*
  >
  > *This architecture guarantees sub-15ms computation speeds with zero server roundtrips."*

---

### SLIDE 7: UML Design & Application Data Flow
- **Presenter**: Member 3
- **Time**: 4:40 – 5:25 (45s)
- **Spoken Script**:
  > *"Looking at our UML and Data Flow models: when a student inputs an NFA in `NFAConfigForm`, the raw configuration is validated by `validateNFA()`. If valid, `convertNFAtoDFA()` initializes a BFS queue.*
  >
  > *At every step, our engine captures an immutable `ConversionStep` snapshot containing the current subset, the input symbol, the union calculation, and the state of the intermediate table. These snapshots populate our Stepper components.*
  >
  > *Simultaneously, the resulting DFA object is passed to Dagre for hierarchical left-to-right positioning, and to `DFATransitionTable` for CSV export.*
  >
  > *Member 4 will now present our UI Design and Screen Methodology."*

---

### SLIDE 8: UI Wireframes & Screen Methodology
- **Presenter**: Member 4
- **Time**: 5:25 – 6:10 (45s)
- **Spoken Script**:
  > *"Thank you, Member 3. Our user interface is structured around an academic workflow with eight dedicated screens accessible via the sidebar navigation.*
  >
  > *In the NFA Configuration screen, students can load pre-configured benchmarks like our required university example, or manually define custom alphabets and states.*
  >
  > *A key innovation is our dual-mode transition editor: students can toggle transitions visually using state pills in an interactive 2D matrix table, or add single rules through a structured form.*
  >
  > *On the visual canvas, states are rendered adhering strictly to automata conventions: starting states feature an incoming 'start' indicator, and final states feature concentric double circles."*

---

### SLIDE 9: Conversion Stepper & Interactive Simulator Modules
- **Presenter**: Member 4
- **Time**: 6:10 – 7:00 (50s)
- **Spoken Script**:
  > *"Here are the wireframes for our two most interactive screens:*
  >
  > *On the left is the Step-by-Step Conversion Stepper. It includes a playback control bar with Auto-Play, variable animation speeds, and a progress bar. Above is our 7-part Step Explanation Card showing the exact mathematical union formula $\delta'(S, a) = \delta(q_0, a) \cup \delta(q_1, a) = \dots$ alongside a live Intermediate DFA Table that builds row-by-row with glowing amber cell indicators.*
  >
  > *On the right is our String Testing Simulator. As characters are consumed from the tape, the active DFA node on the diagram pulses with an amber glow in real time, accompanied by a full execution trace log and an immediate ACCEPTED or REJECTED verdict.*
  >
  > *Member 5 will now demonstrate the Subset Construction Algorithm and our manually verified benchmark."*

---

### SLIDE 10: Subset Construction Algorithm & Pseudocode
- **Presenter**: Member 5
- **Time**: 7:00 – 7:50 (50s)
- **Spoken Script**:
  > *"Thank you, Member 4. The Subset Construction Algorithm operates by maintaining a queue of discovered subsets.*
  >
  > *It begins by taking start subset $S_0 = \{q_0\}$, assigning it label 'A', and enqueuing it. While the queue is not empty, it dequeues a subset $S$ and calculates $\delta'(S, a) = \bigcup_{q \in S} \delta(q, a)$ for every symbol $a \in \Sigma$.*
  >
  > *A critical design feature in our implementation is `getCanonicalSubsetKey()`. Because sets in mathematics are unordered, our engine sorts state IDs alphabetically, ensuring $\{q_0, q_1\}$ and $\{q_1, q_0\}$ produce the identical hash key `"q0,q1"`, preventing infinite loops and duplicate states.*
  >
  > *If a transition yields an empty set, our engine routes it to the canonical dead state $\emptyset$ with self-loops on all symbols.*
  >
  > *The algorithm terminates when no unprocessed subsets remain in the queue, running in worst-case time $O(k \cdot n \log n \cdot 2^n)$."*

---

### SLIDE 11: Manually Solved Benchmark Verification
- **Presenter**: Member 5
- **Time**: 7:50 – 8:40 (50s)
- **Spoken Script**:
  > *"To verify correctness, we manually solved the university benchmark NFA: states $q_0, q_1, q_2$, alphabet $0$ and $1$, start state $q_0$, and final state $q_2$.*
  >
  > *Walking through the derivations:*
  > - *State A = $\{q_0\}$ on 0 yields $\{q_0, q_1\} \implies \text{State B}$; on 1 yields $\{q_0\} \implies \text{State A}$.*
  > - *State B = $\{q_0, q_1\}$ on 0 yields $\{q_0, q_1\} \implies \text{State B}$; on 1 yields $\{q_0\} \cup \{q_2\} = \{q_0, q_2\} \implies \text{State C}$.*
  > - *State C = $\{q_0, q_2\}$ on 0 yields $\{q_0, q_1\} \cup \{q_2\} = \{q_0, q_1, q_2\} \implies \text{State D}$; on 1 loops back to A.*
  > - *State D = $\{q_0, q_1, q_2\}$ on 0 yields State D; on 1 yields State C.*
  >
  > *Since original state $q_2$ is final, subsets containing $q_2$ become accepting states—meaning States C and D are final.*
  >
  > *We verified string '010', which traverses $A \to B \to C \to D$, ending in final state D and correctly resulting in ACCEPTED. String '11' loops on A and is REJECTED. This matches our simulator's automated Vitest tests with 100% precision."*

---

### SLIDE 12: Conclusion, Limitations & Future Scope
- **Presenter**: Member 5 (All members assemble for Q&A)
- **Time**: 8:40 – 9:20 (40s)
- **Spoken Script**:
  > *"In conclusion, our team has satisfied all M1 evaluation criteria: from rigorous mathematical specification and comparative feasibility to full component architecture and verified algorithmic execution.*
  >
  > *We have also built a fully working prototype backed by 14 automated unit tests.*
  >
  > *For future milestones, we will integrate $\epsilon$-closure handling, DFA minimization via Hopcroft's algorithm, and regular expression compilers.*
  >
  > *Thank you, Professor. Our team is now ready to answer any questions or demonstrate the working simulator."*
