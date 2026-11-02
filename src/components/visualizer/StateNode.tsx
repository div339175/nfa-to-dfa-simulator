import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { AutomatonNodeType } from '../../core/layoutGraph';

export const StateNode: React.FC<NodeProps<AutomatonNodeType>> = ({ data, selected }) => {
  const { label, sublabel, isInitial, isFinal, isCurrent } = data;

  return (
    <div className="relative group">
      {/* Start state incoming indicator */}
      {isInitial && (
        <div className="absolute -left-7 top-1/2 -translate-y-1/2 flex items-center select-none pointer-events-none z-10">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1 py-0.5 rounded border border-blue-300 shadow-xs mr-0.5">
            start
          </span>
          <svg className="w-4 h-4 text-blue-600 -ml-1 fill-current" viewBox="0 0 24 24">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        </div>
      )}

      {/* Main state circle */}
      <div
        className={`
          flex flex-col items-center justify-center rounded-full transition-all duration-300
          ${sublabel ? 'w-24 h-24' : 'w-18 h-18 min-w-[4.5rem] min-h-[4.5rem]'}
          ${
            isCurrent
              ? 'bg-amber-100 border-4 border-amber-500 shadow-xl ring-4 ring-amber-300 scale-105'
              : selected
              ? 'bg-blue-50 border-3 border-blue-600 shadow-md ring-2 ring-blue-300'
              : 'bg-white border-2 border-slate-700 shadow-xs hover:border-blue-500 hover:shadow-md'
          }
          ${isFinal ? 'p-1' : ''}
        `}
      >
        {/* Final state double border ring */}
        {isFinal ? (
          <div
            className={`
              w-full h-full rounded-full border-2 border-slate-700 flex flex-col items-center justify-center
              ${isCurrent ? 'border-amber-600 bg-amber-50' : 'bg-slate-50'}
            `}
          >
            <span className="font-mono font-bold text-slate-900 text-sm md:text-base">
              {label}
            </span>
            {sublabel && (
              <span className="font-mono text-[10px] text-slate-500 px-1 text-center truncate max-w-[80px]">
                {sublabel}
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <span className="font-mono font-bold text-slate-900 text-sm md:text-base">
              {label}
            </span>
            {sublabel && (
              <span className="font-mono text-[10px] text-slate-500 px-1 text-center truncate max-w-[80px]">
                {sublabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Handles for standard and curved connections */}
      {/* Left handle for forward incoming targets */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!opacity-0 !w-2 !h-2"
      />
      {/* Right handle for forward outgoing sources */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!opacity-0 !w-2 !h-2"
      />
      {/* Top handles for self-loops and mutual top curves */}
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="!opacity-0 !w-2 !h-2"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!opacity-0 !w-2 !h-2"
      />
      {/* Bottom handles for mutual bottom curves and backward transitions */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="!opacity-0 !w-2 !h-2"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="!opacity-0 !w-2 !h-2"
      />
    </div>
  );
};
