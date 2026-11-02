# Practical Classroom Demonstration Plan

**Demonstration Duration**: ~3 to 4 Minutes (embedded within or immediately following the slide presentation)  
**Objective**: Demonstrate working proof of design for the M1 milestone without technical hitches.  

---

## 1. Pre-Demonstration Checklist (Do This 10 Minutes Before Class)

1. **Start the Local Development Server**:
   ```bash
   cd /Users/divakarmaurya/automata
   npm run dev
   ```
2. **Open Browser Tabs**:
   - Tab 1: `http://localhost:5173/` (Active application window).
   - Tab 2: `http://localhost:5173/` (Clean backup tab in case of accidental navigation).
   - Tab 3: Slide Presentation (`SLIDE_CONTENT.md` or exported slide deck).
3. **Verify Local Network / Airplane Mode**:
   - Test that the application works seamlessly with Wi-Fi turned off. Because the simulator is 100% client-side, it requires **zero internet connection**.
4. **Window Layout**:
   - Set browser zoom to 100% or 110% for optimal projection visibility in lecture halls.
   - Enter full-screen mode (`F11` or `Cmd+Shift+F`).

---

## 2. Step-by-Step Live Demonstration Walkthrough

### Step 1: Establish Initial State (Dashboard & Preset)
- **Time**: 0:00 – 0:30
- **Action**:
  1. Click **"Dashboard & Overview"** in the sidebar.
  2. Point out the metric cards ($|Q|=3$ states, $|Q'|=4$ states, 6 conversion steps).
  3. Show the **Formal 5-Tuple Specification Box** comparing NFA $M$ to DFA $M'$.
- **What to Say**:
  > *"As shown on our dashboard, the simulator immediately analyzes the active NFA and presents its formal 5-tuple specification alongside the generated DFA."*

### Step 2: Show NFA Configuration & Dual Editors
- **Time**: 0:30 – 1:00
- **Action**:
  1. In the sidebar, click **"NFA Configuration"**.
  2. Click **"Load Mandatory Example"** in the top banner.
  3. Scroll down to show the **NFA Transition Matrix**.
  4. Click a state pill to demonstrate how toggling works in real time, then click it back to restore the benchmark.
  5. In the sidebar, click **"NFA Visualization"** to show the state diagram with start indicator and double-ring final state $q_2$.
- **What to Say**:
  > *"In Module 1, users can edit transitions visually by clicking state chips in the matrix. Notice our NFA visualization: state $q_0$ has an incoming start arrow, and final state $q_2$ has a concentric double circle."*

### Step 3: Demonstrate the Step-by-Step Stepper
- **Time**: 1:00 – 2:00
- **Action**:
  1. In the sidebar, click **"Step-by-Step Conversion"**.
  2. Click the **"|<<" (First)** button to reset to Step 1.
  3. Click **"Next"** twice to reach Step 3.
  4. Point to the **StepExplanationCard**:
     - Current subset: $B = \{q_0, q_1\}$
     - Symbol: `'1'`
     - Mathematical equation: $\delta'(B, 1) = \delta(q_0, 1) \cup \delta(q_1, 1) = \{q_0\} \cup \{q_2\} = \{q_0, q_2\} = C$
  5. Point to the **IntermediateDFATable** below to show the active row and glowing amber cell.
  6. Click **"Auto-Play"** at 1x speed to let it advance through remaining steps to completion.
- **What to Say**:
  > *"Here is our core pedagogical stepper. At Step 3, the engine computes the set union of transitions from $q_0$ and $q_1$ on input '1', discovering new state $C = \{q_0, q_2\}$. The live intermediate table highlights the exact cell being populated in real time."*

### Step 4: Show Generated DFA & CSV Export
- **Time**: 2:00 – 2:40
- **Action**:
  1. In the sidebar, click **"DFA Visualization"**.
  2. Show the 4-node diagram ($A=\{q_0\}$, $B=\{q_0, q_1\}$, $C=\{q_0, q_2\}$, $D=\{q_0, q_1, q_2\}$).
  3. Point out that nodes **C** and **D** have double circles because they contain original final state $q_2$.
  4. In the sidebar, click **"Transition Tables"** and click **"Download CSV"** to demonstrate instant file generation.
- **What to Say**:
  > *"In Module 5, the complete DFA is rendered. States C and D are double-ringed because they contain NFA final state $q_2$. In Module 6, the table can be exported directly to CSV or Markdown for academic lab reports."*

### Step 5: Test Accepted & Rejected Strings on the Tape
- **Time**: 2:40 – 3:30
- **Action**:
  1. In the sidebar, click **"String Testing & Simulation"**.
  2. Click the quick input chip `"010"`.
  3. Click **"Animate"**.
  4. Point to the **Input Tape** consuming characters, and watch node **D** pulse in glowing amber on the graph canvas.
  5. Show the green **"ACCEPTED"** verdict banner and execution trace table.
  6. Now click quick chip `"11"` and click **"Animate"**.
  7. Show that the machine loops on start state A, resulting in the red **"REJECTED"** banner.
- **What to Say**:
  > *"Finally, in Module 7, we test input strings. For string '010', the tape consumes characters while the active node pulses live on the diagram, landing on accepting state D with an ACCEPTED verdict. For string '11', the machine remains in non-accepting state A, correctly outputting REJECTED."*

---

## 3. Contingency & Failsafe Plan (What to do if anything fails)

| Potential Issue | Immediate Remediation Action |
| :--- | :--- |
| **No Projector / HDMI Cable Issue** | Present directly from the laptop screen; team members stand around the professor's desk. |
| **No Internet Connection in Classroom** | No impact whatsoever! The application runs completely offline on `http://localhost:5173/`. |
| **Accidental Browser Tab Closure** | Re-open browser, press `Cmd+Shift+T` (or type `http://localhost:5173/`). The mandatory benchmark loads automatically by default. |
| **Accidental Bad NFA Input** | Click the **"Reset to Mandatory"** button in the top navigation header; it instantly restores the pristine benchmark in 1 click. |
| **Terminal Crash / Dev Server Stops** | Have a backup production preview ready: run `npm run preview` in a separate terminal tab, or present the high-resolution wireframes in `MEMBER_4_UI_DESIGN_METHODOLOGY.md`. |

---

## 4. Academic Alignment: M1 Deliverables vs. Later Milestones

It is critical during the viva to remind the professor that:
- **M1 Evaluates Problem Analysis & Project Design (5.0 Marks)**: Our primary submission is the complete architectural specification, formal 5-tuple models, feasibility analysis, UI wireframes, and algorithmic pseudocode.
- **Our Working Prototype is an Accelerated Proof-of-Design**: Demonstrating the live simulator proves that our proposed architecture is not theoretical conjecture, but a verified, functional software system backed by 14 automated unit tests.
- **Planned for Later Milestones (M2/Final)**:
  - Integration of $\epsilon$-closure handling.
  - DFA State Minimization via Hopcroft's partition-refinement algorithm.
  - Thompson's Construction for direct regular expression input.
