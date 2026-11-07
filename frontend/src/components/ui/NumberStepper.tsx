import React from "react";

interface NumberStepperProps {
  value: number;
  onChange: (nextValue: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  label?: string;
  disabled?: boolean;
}

/**
 * NumberStepper Component
 * 
 * Custom dark-themed numeric control with increment/decrement steppers,
 * direct numeric editing, and boundary enforcement.
 */
export const NumberStepper: React.FC<NumberStepperProps> = ({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  unit,
  label,
  disabled = false,
}) => {
  const handleDecrement = (): void => {
    if (disabled) return;
    const nextValue = Math.max(min, value - step);
    onChange(nextValue);
  };

  const handleIncrement = (): void => {
    if (disabled) return;
    const nextValue = Math.min(max, value + step);
    onChange(nextValue);
  };

  const handleInputChange = (changeEvent: React.ChangeEvent<HTMLInputElement>): void => {
    const rawNumber = Number(changeEvent.target.value);
    if (!Number.isNaN(rawNumber)) {
      const clampedValue = Math.min(max, Math.max(min, rawNumber));
      onChange(clampedValue);
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <span className="text-[11px] font-medium text-slate-400 block">
          {label}
        </span>
      )}
      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden focus-within:border-cyan-500/80 transition-colors shadow-inner">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          aria-label="Decrement value"
          className="px-2.5 py-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors text-xs font-bold cursor-pointer select-none"
        >
          −
        </button>

        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={handleInputChange}
          onWheel={(wheelEvent) => wheelEvent.currentTarget.blur()}
          className="w-full bg-transparent text-center text-xs font-mono font-medium text-white focus:outline-none py-1.5"
        />

        {unit && (
          <span className="text-[10px] text-slate-500 pr-1 select-none font-mono">
            {unit}
          </span>
        )}

        <button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          aria-label="Increment value"
          className="px-2.5 py-2 text-slate-400 hover:text-cyan-300 hover:bg-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors text-xs font-bold cursor-pointer select-none"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default NumberStepper;
