# M1 Individual Contribution Report: Member 5

**Student Name / Role**: Member 5 — Algorithm Engineering & Correctness Verification Specialist  
**Assigned Evaluation Criterion**: Criterion 4 — Algorithm Selection, Correctness & Complexity  
**Marks Weightage**: 1.0 / 5.0 Marks  
**Project Title**: Interactive NFA to DFA Conversion Simulator using Subset Construction Algorithm  

---

## 1. Algorithm Selection & Technical Justification

To convert an arbitrary Non-Deterministic Finite Automaton into an equivalent Deterministic Finite Automaton, computer science provides the **Subset Construction Algorithm** (also known as **Rabin-Scott Powerset Construction**).

### Why Subset Construction Was Chosen
1. **Mathematical Completeness**: It is the only universally complete algorithm guaranteed to convert any arbitrary NFA into an equivalent DFA without altering the recognized regular language ($L(M) = L(M')$).
2. **Deterministic Parallel Simulation**: Rather than non-deterministically guessing computational paths, each generated DFA state directly represents the mathematical set of all possible NFA states reachable after consuming a string prefix.
3. **Canonical Determinism**: The resulting automaton contains exactly one unique transition for every state and alphabet symbol, satisfying the requirements of physical digital lexical analyzers.

---

## 2. Mathematical Foundation & Step-by-Step Logic

Given an NFA $M = (Q, \Sigma, \delta, q_0, F)$:

### Step 1: Initial Subset Creation
The algorithm begins by creating the initial DFA state $S_0$ as the singleton subset containing the NFA's start state:
$$q_0' = \{ q_0 \}$$
In our implementation, this subset is assigned sequential label **`A`** via `getStateLabel(0)`.

### Step 2: Queue-Based Breadth-First Reachability Search
To avoid generating useless unreachable combinations from the theoretical $2^{|Q|}$ powerset, the algorithm operates via a FIFO queue:
- `queue = ['A']`
- Discovered states are tracked in a dictionary: `stateSubsets['A'] = ['q0']`.

### Step 3: Transition Computation & Set Union
While the queue is not empty, dequeue current state label $L$, retrieving its subset $S = stateSubsets[L]$.
For each alphabet symbol $a \in \Sigma$, compute the union of all NFA transitions originating from any state in $S$:
$$\delta'(S, a) = \bigcup_{q \in S} \delta(q, a)$$

### Step 4: Duplicate Subset Prevention via Canonical Key Sorting
Because mathematical sets are unordered ($\{q_0, q_1\} = \{q_1, q_0\}$), our algorithm prevents duplicate state generation by passing every union result through `getCanonicalSubsetKey()`:
```typescript
export function getCanonicalSubsetKey(states: string[]): string {
  const unique = Array.from(new Set(states)).filter(Boolean);
  unique.sort();
  return unique.join(',');
}
```
A fast lookup against `subsetToLabel[canonicalKey]` verifies in $O(1)$ time if this exact subset has already been discovered:
- If discovered: reuse existing label.
- If new: assign sequential label (e.g. `B`, `C`, `D`), add to `dfaStates`, and enqueue into `queue`.

### Step 5: Empty Set & Dead/Trap State Handling
If for any subset $S$ and symbol $a$, all NFA transitions are empty ($\bigcup_{q \in S} \delta(q, a) = \emptyset$):
- In a strict DFA, incomplete transitions are illegal.
- The algorithm routes this transition to a designated **Dead State** labeled **`∅`**.
- When state `∅` is evaluated, it transitions to itself on all symbols in $\Sigma$:
  $$\delta'(\emptyset, a) = \emptyset \quad \forall a \in \Sigma$$
- The dead state is non-accepting because $\emptyset \cap F = \emptyset$.

### Step 6: Final / Accepting State Identification
In an NFA, a string is accepted if *at least one* parallel execution path terminates in a final state.
Therefore, in the DFA, any subset $S$ is marked accepting if its intersection with $F_{NFA}$ is non-empty:
$$F' = \{ S \in Q' \mid S \cap F \neq \emptyset \}$$

### Step 7: Termination
Because the state set $Q$ is finite, its powerset $\mathcal{P}(Q)$ has a finite maximum of $2^{|Q|}$ subsets. Since each reachable subset is enqueued at most once, the FIFO queue must eventually empty, guaranteeing 100% algorithmic termination.

---

## 3. Algorithmic Pseudocode

```text
Algorithm SubsetConstruction(NFA M = (Q, Σ, δ, q0, F)) returns DFA M':
    Input:  NFA M = (Q, Σ, δ, q0, F)
    Output: DFA M' = (Q', Σ, δ', A, F', stateSubsets)

    1.  Initialize Q' ← ∅, F' ← ∅
    2.  Initialize stateSubsets ← empty map, subsetToLabel ← empty map
    3.  Initialize δ' ← empty nested map
    4.  
    5.  // Step 1: Initialize start subset
    6.  s0 ← { q0 }
    7.  labelA ← "A"
    8.  RegisterSubset(labelA, s0)
    9.  Q' ← Q' ∪ { labelA }
    10. queue ← [ labelA ]
    11. labelIndex ← 1
    12. 
    13. // Step 2: Breadth-first queue processing
    14. While queue is not empty:
    15.     currentLabel ← queue.dequeue()
    16.     currentSubset ← stateSubsets[currentLabel]
    17.     
    18.     // Handle dead state self-loops
    19.     If currentSubset is empty (∅):
    20.         For each symbol a ∈ Σ:
    21.             δ'[currentLabel][a] ← currentLabel
    22.         Continue
    23.     
    24.     For each symbol a ∈ Σ:
    25.         // Compute union of NFA transitions
    26.         targetSubset ← ⋃_{q ∈ currentSubset} δ(q, a)
    27.         canonicalKey ← SortAndDeduplicate(targetSubset)
    28.         
    29.         If targetSubset is empty:
    30.             targetLabel ← "∅"
    31.             If "∅" not in Q':
    32.                 RegisterSubset("∅", ∅)
    33.                 Q' ← Q' ∪ { "∅" }
    34.                 queue.enqueue("∅")
    35.         Else if canonicalKey in subsetToLabel:
    36.             targetLabel ← subsetToLabel[canonicalKey]
    37.         Else:
    38.             targetLabel ← GenerateNextLabel(labelIndex++)
    39.             RegisterSubset(targetLabel, targetSubset)
    40.             Q' ← Q' ∪ { targetLabel }
    41.             queue.enqueue(targetLabel)
    42.             
    43.             // Check if subset contains an accepting state
    44.             If (targetSubset ∩ F) ≠ ∅:
    45.                 F' ← F' ∪ { targetLabel }
    46.                 
    47.         δ'[currentLabel][a] ← targetLabel
    48.         
    49. Return DFA M' = (Q', Σ, δ', "A", F', stateSubsets)
```

---

## 4. Mandatory Benchmark: Manually Solved Verification

### Benchmark Problem Definition
- **NFA States**: $Q = \{q0, q1, q2\}$
- **Alphabet**: $\Sigma = \{0, 1\}$
- **Start State**: $q0$
- **Final States**: $F = \{q2\}$
- **NFA Transition Matrix**:
  - $\delta(q0, 0) = \{q0, q1\}$, $\delta(q0, 1) = \{q0\}$
  - $\delta(q1, 0) = \emptyset$, $\delta(q1, 1) = \{q2\}$
  - $\delta(q2, 0) = \{q2\}$, $\delta(q2, 1) = \emptyset$

---

### Step-by-Step Mathematical Derivation

#### Step 1: Start State Initialization
- $S_0 = \{q0\}$
- Assign label **A** = $\{q0\}$.
- Is $A$ final? $\{q0\} \cap \{q2\} = \emptyset \implies$ **No**.
- Queue = `['A']`.

#### Step 2: Processing State A = $\{q0\}$
- **On Input '0'**:
  $$\delta'(A, 0) = \delta(q0, 0) = \{q0, q1\}$$
  Subset $\{q0, q1\}$ is new $\implies$ Assign label **B** = $\{q0, q1\}$.  
  Is $B$ final? $\{q0, q1\} \cap \{q2\} = \emptyset \implies$ **No**.  
  Enqueue `B`. $\delta'(A, 0) = B$.
- **On Input '1'**:
  $$\delta'(A, 1) = \delta(q0, 1) = \{q0\} = A$$
  $\delta'(A, 1) = A$.  
  Queue = `['B']`.

#### Step 3: Processing State B = $\{q0, q1\}$
- **On Input '0'**:
  $$\delta'(B, 0) = \delta(q0, 0) \cup \delta(q1, 0) = \{q0, q1\} \cup \emptyset = \{q0, q1\} = B$$
  $\delta'(B, 0) = B$.
- **On Input '1'**:
  $$\delta'(B, 1) = \delta(q0, 1) \cup \delta(q1, 1) = \{q0\} \cup \{q2\} = \{q0, q2\}$$
  Subset $\{q0, q2\}$ is new $\implies$ Assign label **C** = $\{q0, q2\}$.  
  Is $C$ final? $q2 \in \{q0, q2\} \implies$ **YES (Accepting State)**.  
  Enqueue `C`. $\delta'(B, 1) = C$.  
  Queue = `['C']`.

#### Step 4: Processing State C = $\{q0, q2\}$
- **On Input '0'**:
  $$\delta'(C, 0) = \delta(q0, 0) \cup \delta(q2, 0) = \{q0, q1\} \cup \{q2\} = \{q0, q1, q2\}$$
  Subset $\{q0, q1, q2\}$ is new $\implies$ Assign label **D** = $\{q0, q1, q2\}$.  
  Is $D$ final? $q2 \in \{q0, q1, q2\} \implies$ **YES (Accepting State)**.  
  Enqueue `D`. $\delta'(C, 0) = D$.
- **On Input '1'**:
  $$\delta'(C, 1) = \delta(q0, 1) \cup \delta(q2, 1) = \{q0\} \cup \emptyset = \{q0\} = A$$
  $\delta'(C, 1) = A$.  
  Queue = `['D']`.

#### Step 5: Processing State D = $\{q0, q1, q2\}$
- **On Input '0'**:
  $$\delta'(D, 0) = \delta(q0, 0) \cup \delta(q1, 0) \cup \delta(q2, 0) = \{q0, q1\} \cup \emptyset \cup \{q2\} = \{q0, q1, q2\} = D$$
  $\delta'(D, 0) = D$.
- **On Input '1'**:
  $$\delta'(D, 1) = \delta(q0, 1) \cup \delta(q1, 1) \cup \delta(q2, 1) = \{q0\} \cup \{q2\} \cup \emptyset = \{q0, q2\} = C$$
  $\delta'(D, 1) = C$.  
  Queue = `[]` (Empty $\implies$ Termination).

---

### Resulting DFA Transition Matrix

| DFA State | Subset Mapping | Input '0' | Input '1' | Final / Accepting? |
| :---: | :---: | :---: | :---: | :---: |
| **→ A** | $\{q0\}$ | **B** | **A** | **No** |
| **B** | $\{q0, q1\}$ | **B** | **C** | **No** |
| **\* C** | $\{q0, q2\}$ | **D** | **A** | **Yes** |
| **\* D** | $\{q0, q1, q2\}$ | **D** | **C** | **Yes** |

*(This matches the expected benchmark table with 100% precision).*

---

## 5. String Execution Traces & Verification

### Test Case 1: Accepted String $w_1 = "010"$

| Step | Current State | Subset | Character Read | Next State | Action Taken |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **0** | **A** | $\{q0\}$ | *(Start)* | - | Machine initializes at start state A. |
| **1** | **A** | $\{q0\}$ | `'0'` | **B** | $\delta'(A, 0) = B$. Reads '0', moves to subset $\{q0, q1\}$. |
| **2** | **B** | $\{q0, q1\}$ | `'1'` | **C** | $\delta'(B, 1) = C$. Reads '1', moves to subset $\{q0, q2\}$. |
| **3** | **C** | $\{q0, q2\}$ | `'0'` | **D** | $\delta'(C, 0) = D$. Reads '0', moves to subset $\{q0, q1, q2\}$. |
| **Verdict**| **D** | $\{q0, q1, q2\}$ | - | - | **ACCEPTED** (State D is in $F'$, containing $q2$). |

### Test Case 2: Rejected String $w_2 = "11"$

| Step | Current State | Subset | Character Read | Next State | Action Taken |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **0** | **A** | $\{q0\}$ | *(Start)* | - | Machine initializes at start state A. |
| **1** | **A** | $\{q0\}$ | `'1'` | **A** | $\delta'(A, 1) = A$. Reads '1', loops on start state A. |
| **2** | **A** | $\{q0\}$ | `'1'` | **A** | $\delta'(A, 1) = A$. Reads '1', loops on start state A. |
| **Verdict**| **A** | $\{q0\}$ | - | - | **REJECTED** (State A is not in $F'$). |

---

## 6. Time and Space Complexity Analysis

### Time Complexity
- In the theoretical worst case, an NFA with $n = |Q|$ states generates all $2^n$ subsets in powerset $\mathcal{P}(Q)$.
- For each generated subset $S$, the algorithm iterates through each symbol $a \in \Sigma$ ($k = |\Sigma|$).
- For each symbol, the algorithm unions transitions across all states in $S$ (at most $n$ states).
- Deduplicating and canonical string sorting takes $O(n \log n)$.
- **Total Worst-Case Time Complexity**:
  $$O(k \cdot n \log n \cdot 2^n)$$

### Space Complexity
- Storing $2^n$ DFA states with subset lists of size $n$: $O(n \cdot 2^n)$.
- Storing the transition table ($2^n$ rows $\times k$ columns): $O(k \cdot 2^n)$.
- **Total Worst-Case Space Complexity**:
  $$O((k + n) \cdot 2^n)$$

### Practical Performance
Because our algorithm uses a **queue-based reachability search (BFS)**, it only instantiates subsets reachable from $q_0$. In our benchmark example, the theoretical powerset $2^3 = 8$ subsets was reduced to exactly **4 reachable states** ($A, B, C, D$). Unreachable subsets ($\emptyset, \{q1\}, \{q2\}, \{q1, q2\}$) were never instantiated, proving optimal space efficiency.

---

## 7. Conclusion of Member 5 Contribution
Member 5 proves the algorithmic correctness, termination guarantees, and computational complexity of the Subset Construction engine. The mathematical derivation of the mandatory benchmark matches the simulator's automated Vitest test suite with 100% precision.

---

## 8. Teacher Viva Questions for Member 5

1. **Why does canonical subset sorting (`getCanonicalSubsetKey`) prevent infinite loops?**  
   *Answer*: In JavaScript, `['q0', 'q1'] !== ['q1', 'q0']`. By sorting state names alphabetically, every permutation of a subset produces the identical string key `"q0,q1"`. The algorithm checks a lookup map to guarantee each subset is visited and enqueued exactly once.
2. **What is the mathematical condition for a DFA subset to be an accepting state?**  
   *Answer*: A DFA subset $S$ is accepting if and only if it contains at least one NFA final state: $F_{DFA} = \{ S \in Q_{DFA} \mid S \cap F_{NFA} \neq \emptyset \}$.
3. **What is the time complexity of running string simulation on the resulting DFA?**  
   *Answer*: $O(|w|)$, where $|w|$ is string length. Each character requires exactly one $O(1)$ table lookup, eliminating backtracking.
4. **How does the algorithm handle missing transitions in the NFA?**  
   *Answer*: When an NFA subset has no transition on a symbol, the union is empty ($\emptyset$). The algorithm instantiates the canonical dead state `∅`, which loops back to itself on all symbols in $\Sigma$, ensuring strict DFA determinism.
