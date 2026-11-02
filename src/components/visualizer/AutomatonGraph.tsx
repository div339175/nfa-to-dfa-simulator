import React, { useMemo, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  Edge,
  MarkerType,
  NodeTypes,
  EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StateNode } from './StateNode';
import { AutomatonEdge } from './AutomatonEdge';
import { NFA, DFA } from '../../core/types';
import { layoutAutomatonGraph, AutomatonNodeType } from '../../core/layoutGraph';
import { formatSubset } from '../../core/subsetConstruction';
import { RotateCcw, Compass } from 'lucide-react';

interface AutomatonGraphProps {
  type: 'NFA' | 'DFA';
  nfa?: NFA;
  dfa?: DFA;
  activeStateId?: string;
  className?: string;
}

const nodeTypes: NodeTypes = {
  stateNode: StateNode,
};

const edgeTypes: EdgeTypes = {
  automatonEdge: AutomatonEdge,
};

export const AutomatonGraph: React.FC<AutomatonGraphProps> = ({
  type,
  nfa,
  dfa,
  activeStateId,
  className = 'h-[500px] w-full',
}) => {
  const [layoutDirection, setLayoutDirection] = useState<'LR' | 'TB'>('LR');
  const [layoutKey, setLayoutKey] = useState(0);

  // Build raw nodes and edges based on whether this is NFA or DFA
  const { rawNodes, rawEdges } = useMemo(() => {
    if (type === 'NFA' && nfa) {
      const stateIndexMap = new Map<string, number>();
      nfa.states.forEach((s, i) => stateIndexMap.set(s, i));

      const nodes: AutomatonNodeType[] = nfa.states.map((state) => ({
        id: state,
        type: 'stateNode' as const,
        data: {
          label: state,
          isInitial: state === nfa.initialState,
          isFinal: nfa.finalStates.includes(state),
          isCurrent: state === activeStateId,
        },
        position: { x: 0, y: 0 },
      }));

      // Aggregate transitions by (fromState, target) to group symbols: e.g. "0, 1"
      const edgeMap = new Map<string, { source: string; target: string; symbols: Set<string> }>();

      for (const [fromState, symbolMap] of Object.entries(nfa.transitions)) {
        for (const [symbol, targets] of Object.entries(symbolMap)) {
          for (const target of targets) {
            const edgeKey = `${fromState}->${target}`;
            if (!edgeMap.has(edgeKey)) {
              edgeMap.set(edgeKey, { source: fromState, target, symbols: new Set() });
            }
            edgeMap.get(edgeKey)!.symbols.add(symbol);
          }
        }
      }

      const edges: Edge[] = [];
      edgeMap.forEach((entry, key) => {
        const isSelfLoop = entry.source === entry.target;
        const reverseKey = `${entry.target}->${entry.source}`;
        const hasMutual = !isSelfLoop && edgeMap.has(reverseKey);
        const sourceIdx = stateIndexMap.get(entry.source) ?? 0;
        const targetIdx = stateIndexMap.get(entry.target) ?? 0;
        const isBackward = !isSelfLoop && !hasMutual && sourceIdx > targetIdx;

        const symbolsLabel = Array.from(entry.symbols).sort().join(', ');

        let sourceHandle = 'right';
        let targetHandle = 'left';
        let curvatureOffset = 0;

        if (isSelfLoop) {
          sourceHandle = 'top-source';
          targetHandle = 'top-target';
        } else if (hasMutual) {
          // Break tie so forward curves top and reverse curves bottom
          if (entry.source < entry.target) {
            sourceHandle = 'top-source';
            targetHandle = 'top-target';
            curvatureOffset = -38;
          } else {
            sourceHandle = 'bottom-source';
            targetHandle = 'bottom-target';
            curvatureOffset = 38;
          }
        } else if (isBackward) {
          sourceHandle = 'bottom-source';
          targetHandle = 'bottom-target';
          curvatureOffset = 70;
        }

        edges.push({
          id: `edge-${key}`,
          source: entry.source,
          target: entry.target,
          sourceHandle,
          targetHandle,
          type: 'automatonEdge',
          data: {
            symbolsLabel,
            isSelfLoop,
            hasMutual,
            isBackward,
            curvatureOffset,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 16,
            color: '#334155',
          },
          style: {
            strokeWidth: 2,
            stroke: '#334155',
          },
        });
      });

      return { rawNodes: nodes, rawEdges: edges };
    }

    if (type === 'DFA' && dfa) {
      const stateIndexMap = new Map<string, number>();
      dfa.states.forEach((s, i) => stateIndexMap.set(s, i));

      const nodes: AutomatonNodeType[] = dfa.states.map((state) => {
        const subset = dfa.stateSubsets[state] || [];
        const subsetStr = formatSubset(subset);
        return {
          id: state,
          type: 'stateNode' as const,
          data: {
            label: state,
            sublabel: subsetStr,
            isInitial: state === dfa.initialState,
            isFinal: dfa.finalStates.includes(state),
            isCurrent: state === activeStateId,
          },
          position: { x: 0, y: 0 },
        };
      });

      const edgeMap = new Map<string, { source: string; target: string; symbols: Set<string> }>();

      for (const [fromState, symbolMap] of Object.entries(dfa.transitions)) {
        for (const [symbol, target] of Object.entries(symbolMap)) {
          if (!target) continue;
          const edgeKey = `${fromState}->${target}`;
          if (!edgeMap.has(edgeKey)) {
            edgeMap.set(edgeKey, { source: fromState, target, symbols: new Set() });
          }
          edgeMap.get(edgeKey)!.symbols.add(symbol);
        }
      }

      const edges: Edge[] = [];
      edgeMap.forEach((entry, key) => {
        const isSelfLoop = entry.source === entry.target;
        const reverseKey = `${entry.target}->${entry.source}`;
        const hasMutual = !isSelfLoop && edgeMap.has(reverseKey);
        const sourceIdx = stateIndexMap.get(entry.source) ?? 0;
        const targetIdx = stateIndexMap.get(entry.target) ?? 0;
        const isBackward = !isSelfLoop && !hasMutual && sourceIdx > targetIdx;

        const symbolsLabel = Array.from(entry.symbols).sort().join(', ');

        let sourceHandle = 'right';
        let targetHandle = 'left';
        let curvatureOffset = 0;

        if (isSelfLoop) {
          sourceHandle = 'top-source';
          targetHandle = 'top-target';
        } else if (hasMutual) {
          if (entry.source < entry.target) {
            sourceHandle = 'top-source';
            targetHandle = 'top-target';
            curvatureOffset = -38;
          } else {
            sourceHandle = 'bottom-source';
            targetHandle = 'bottom-target';
            curvatureOffset = 38;
          }
        } else if (isBackward) {
          sourceHandle = 'bottom-source';
          targetHandle = 'bottom-target';
          curvatureOffset = 70;
        }

        edges.push({
          id: `edge-${key}`,
          source: entry.source,
          target: entry.target,
          sourceHandle,
          targetHandle,
          type: 'automatonEdge',
          data: {
            symbolsLabel,
            isSelfLoop,
            hasMutual,
            isBackward,
            curvatureOffset,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 16,
            height: 16,
            color: '#1e293b',
          },
          style: {
            strokeWidth: 2,
            stroke: '#1e293b',
          },
        });
      });

      return { rawNodes: nodes, rawEdges: edges };
    }

    return { rawNodes: [], rawEdges: [] };
  }, [type, nfa, dfa, activeStateId]);

  // Compute Dagre layout
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    return layoutAutomatonGraph(rawNodes, rawEdges, layoutDirection);
  }, [rawNodes, rawEdges, layoutDirection, layoutKey]);

  return (
    <div className={`relative border border-slate-200 rounded-xl bg-slate-50/50 shadow-inner overflow-hidden ${className}`}>
      {/* Visualizer Toolbar */}
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-2 bg-white/90 backdrop-blur-xs p-1.5 rounded-lg border border-slate-200 shadow-xs text-xs text-slate-700">
        <button
          onClick={() => {
            setLayoutDirection((prev) => (prev === 'LR' ? 'TB' : 'LR'));
          }}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded hover:bg-slate-100 font-medium transition-colors"
          title="Toggle layout direction (Horizontal / Vertical)"
        >
          <Compass className="w-3.5 h-3.5 text-blue-600" />
          <span>{layoutDirection === 'LR' ? 'Horizontal (L→R)' : 'Vertical (T→B)'}</span>
        </button>

        <button
          onClick={() => setLayoutKey((k) => k + 1)}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded hover:bg-slate-100 font-medium transition-colors"
          title="Recalculate layout"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
          <span>Reset Layout</span>
        </button>
      </div>

      {/* Legend Badge */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-xs p-2 rounded-lg border border-slate-200 shadow-xs text-xs text-slate-600 flex items-center space-x-3 pointer-events-none select-none">
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded-full border border-blue-500 bg-blue-100 inline-block"></span>
          <span>Start State</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-800 p-0.5 inline-flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full border border-slate-800"></span>
          </span>
          <span>Final State</span>
        </div>
        {activeStateId && (
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 ring-2 ring-amber-300 animate-pulse"></span>
            <span>Active State</span>
          </div>
        )}
      </div>

      <ReactFlow
        nodes={layoutedNodes}
        edges={layoutedEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.2}
        maxZoom={2.5}
        defaultEdgeOptions={{
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1.2} color="#cbd5e1" />
        <Controls showInteractive={false} className="!bg-white !border !border-slate-200 !shadow-xs !rounded-lg" />
        <MiniMap
          nodeColor={(node) => (node.data?.isFinal ? '#0284c7' : '#94a3b8')}
          maskColor="rgba(241, 245, 249, 0.7)"
          className="!bottom-3 !right-3 !border !border-slate-200 !rounded-lg !overflow-hidden !shadow-xs"
          style={{ width: 110, height: 80 }}
        />
      </ReactFlow>
    </div>
  );
};
