import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Play,
  Pause,
} from 'lucide-react';

interface ConversionStepperProps {
  currentStepIndex: number;
  totalSteps: number;
  onStepChange: React.Dispatch<React.SetStateAction<number>>;
}

export const ConversionStepper: React.FC<ConversionStepperProps> = ({
  currentStepIndex,
  totalSteps,
  onStepChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1000); // ms per step

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        onStepChange((prev: number) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, totalSteps, onStepChange]);

  const handleFirst = () => {
    setIsPlaying(false);
    onStepChange(0);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    onStepChange(Math.max(0, currentStepIndex - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    onStepChange(Math.min(totalSteps - 1, currentStepIndex + 1));
  };

  const handleLast = () => {
    setIsPlaying(false);
    onStepChange(totalSteps - 1);
  };

  const progressPct = totalSteps > 1 ? ((currentStepIndex + 1) / totalSteps) * 100 : 100;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-medium">
          <span>Conversion Progress</span>
          <span className="font-mono">
            Step {currentStepIndex + 1} of {totalSteps} ({Math.round(progressPct)}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Control Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Playback navigation buttons */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={handleFirst}
            disabled={currentStepIndex === 0}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent text-slate-700 transition-colors"
            title="First Step"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="flex items-center space-x-1 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent text-slate-700 text-xs font-medium transition-colors"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-colors ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Auto-Play</span>
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={currentStepIndex >= totalSteps - 1}
            className="flex items-center space-x-1 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent text-slate-700 text-xs font-medium transition-colors"
            title="Next Step"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleLast}
            disabled={currentStepIndex >= totalSteps - 1}
            className="flex items-center space-x-1 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent text-slate-700 text-xs font-medium transition-colors"
            title="Show All Steps (Jump to Finish)"
          >
            <span className="hidden sm:inline">Show All</span>
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector & Direct Jump */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {[
              { label: '0.5x', ms: 1800 },
              { label: '1x', ms: 1000 },
              { label: '2x', ms: 500 },
            ].map((spd) => (
              <button
                key={spd.label}
                onClick={() => setSpeed(spd.ms)}
                className={`px-2 py-0.5 rounded font-mono font-medium transition-colors ${
                  speed === spd.ms
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {spd.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1 text-slate-600">
            <span>Jump to:</span>
            <select
              value={currentStepIndex}
              onChange={(e) => {
                setIsPlaying(false);
                onStepChange(Number(e.target.value));
              }}
              className="px-2 py-1 rounded border border-slate-300 bg-white font-mono text-xs focus:ring-1 focus:ring-blue-500"
            >
              {Array.from({ length: totalSteps }).map((_, i) => (
                <option key={i} value={i}>
                  Step {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
