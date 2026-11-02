import React from 'react';
import { NFAValidationResult } from '../../core/types';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface NFAValidationAlertProps {
  validation: NFAValidationResult;
}

export const NFAValidationAlert: React.FC<NFAValidationAlertProps> = ({ validation }) => {
  if (validation.isValid && validation.issues.length === 0) {
    return (
      <div className="flex items-center space-x-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-medium">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <span>NFA configuration is mathematically valid and ready for subset construction.</span>
      </div>
    );
  }

  const errors = validation.issues.filter((i) => i.type === 'error');
  const warnings = validation.issues.filter((i) => i.type === 'warning');

  return (
    <div className="space-y-2">
      {errors.length > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-sm">
          <div className="flex items-center space-x-2 font-semibold mb-1">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>Configuration Errors ({errors.length})</span>
          </div>
          <ul className="list-disc list-inside text-xs space-y-0.5 text-rose-700 ml-1">
            {errors.map((err, idx) => (
              <li key={idx}>{err.message}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm">
          <div className="flex items-center space-x-2 font-semibold mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Warnings ({warnings.length})</span>
          </div>
          <ul className="list-disc list-inside text-xs space-y-0.5 text-amber-700 ml-1">
            {warnings.map((warn, idx) => (
              <li key={idx}>{warn.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
