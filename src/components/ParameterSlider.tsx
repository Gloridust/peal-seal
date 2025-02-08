interface ParameterSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  info: string;
}

export function ParameterSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  info
}: ParameterSliderProps) {
  return (
    <div className="w-full group relative">
      <div className="flex justify-between mb-2">
        <label className="text-sm text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1">
          {label}
          <span className="relative">
            <span className="w-4 h-4 inline-flex items-center justify-center rounded-full text-xs border border-[var(--md-sys-color-outline)] cursor-help">
              i
            </span>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 text-xs 
              bg-[var(--md-sys-color-surface-container-high)] rounded-lg shadow-lg
              invisible group-hover:visible transition-opacity opacity-0 group-hover:opacity-100
              border border-[var(--md-sys-color-outline)]/10">
              {info}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2
                bg-[var(--md-sys-color-surface-container-high)] border-r border-b border-[var(--md-sys-color-outline)]/10">
              </div>
            </div>
          </span>
        </label>
        <span className="text-sm font-mono">
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[var(--md-sys-color-primary)]"
      />
    </div>
  );
} 