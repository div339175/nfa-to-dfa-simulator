import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';

export interface AutomatonGraphNodeData extends Record<string, unknown> {
  label: string;
  sublabel?: string;
  isInitial: boolean;
  isFinal: boolean;
  isCurrent?: boolean;
  isVisited?: boolean;
}

export type AutomatonNodeType = Node<AutomatonGraphNodeData, 'stateNode'>;

export function layoutAutomatonGraph(
  nodes: AutomatonNodeType[],
  edges: Edge[],
  direction: 'LR' | 'TB' = 'LR'
): { nodes: AutomatonNodeType[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    nodesep: 80,
    ranksep: 120,
    marginx: 40,
    marginy: 40,
  });

  nodes.forEach((node) => {
    const isDfaWithSub = Boolean(node.data?.sublabel);
    const width = isDfaWithSub ? 100 : 76;
    const height = isDfaWithSub ? 100 : 76;
    g.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    if (edge.source !== edge.target) {
      g.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(g);

  const layoutedNodes: AutomatonNodeType[] = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    const isDfaWithSub = Boolean(node.data?.sublabel);
    const width = isDfaWithSub ? 100 : 76;
    const height = isDfaWithSub ? 100 : 76;

    return {
      ...node,
      position: {
        x: nodeWithPosition ? nodeWithPosition.x - width / 2 : Math.random() * 300,
        y: nodeWithPosition ? nodeWithPosition.y - height / 2 : Math.random() * 300,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
