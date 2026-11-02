import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';

export interface AutomatonEdgeData extends Record<string, unknown> {
  symbolsLabel: string;
  isSelfLoop?: boolean;
  hasMutual?: boolean;
  isBackward?: boolean;
  curvatureOffset?: number;
}

export const AutomatonEdge: React.FC<EdgeProps> = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  markerEnd,
  style,
}) => {
  const edgeData = (data as AutomatonEdgeData) || {};
  const isSelfLoop = source === target || edgeData.isSelfLoop;
  const symbolsLabel = edgeData.symbolsLabel || '';

  // 1. SELF-LOOP RENDERING
  if (isSelfLoop) {
    // Generate an upward arc above the node
    // Node radius is ~38-48px (diameter ~76-96px)
    const loopRadiusX = 28;
    const loopHeight = 55;
    const startX = sourceX - 16;
    const startY = sourceY - 32;
    const endX = sourceX + 16;
    const endY = sourceY - 32;

    const path = `M ${startX} ${startY} C ${startX - loopRadiusX} ${startY - loopHeight}, ${endX + loopRadiusX} ${startY - loopHeight}, ${endX} ${endY}`;
    const labelX = sourceX;
    const labelY = startY - loopHeight + 4;

    return (
      <>
        <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
        {symbolsLabel && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'all',
              }}
              className="bg-white px-2 py-0.5 rounded-md border border-slate-300 shadow-xs text-xs font-mono font-bold text-slate-900 select-none z-20"
            >
              {symbolsLabel}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  }

  // 2. MUTUAL OR REVERSE EDGES
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Normal vector perpendicular to the line between source and target
  let nx = -dy / (dist || 1);
  let ny = dx / (dist || 1);

  // Determine curvature direction
  let curvature = 0;
  if (edgeData.hasMutual) {
    // Forward edge curves to one side, reverse edge curves to the other
    curvature = (edgeData.curvatureOffset ?? 38);
  } else if (edgeData.isBackward) {
    // Backward jump (e.g. C -> A) curves gracefully below intermediate nodes
    curvature = (edgeData.curvatureOffset ?? 65);
    // Ensure it curves downward below the graph
    if (ny < 0) {
      nx = -nx;
      ny = -ny;
    }
  }

  let path: string;
  let labelX: number;
  let labelY: number;

  if (curvature !== 0) {
    // Midpoint displaced along normal vector
    const midX = (sourceX + targetX) / 2 + nx * curvature;
    const midY = (sourceY + targetY) / 2 + ny * curvature;

    path = `M ${sourceX} ${sourceY} Q ${midX} ${midY} ${targetX} ${targetY}`;
    // Point on quadratic curve at t=0.5: B(0.5) = 0.25*P0 + 0.5*P1 + 0.25*P2
    labelX = 0.25 * sourceX + 0.5 * midX + 0.25 * targetX;
    labelY = 0.25 * sourceY + 0.5 * midY + 0.25 * targetY;
  } else {
    // Standard bezier
    const [bezierPath, bx, by] = getBezierPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });
    path = bezierPath;
    labelX = bx;
    labelY = by;
  }

  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} />
      {symbolsLabel && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-300 shadow-xs text-xs font-mono font-bold text-slate-900 select-none z-20"
          >
            {symbolsLabel}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
