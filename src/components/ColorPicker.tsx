interface ColorPickerProps {
  selectedColor: string;
  customColors: string[];
  onColorSelect: (color: string) => void;
  onCustomColorAdd: (color: string) => void;
  onCustomColorRemove: (index: number) => void;
}

const PRESET_COLORS = [
  { name: '红色', value: '#FF0000' },
  { name: '蓝色', value: '#0066CC' },
  { name: '紫色', value: '#800080' },
  { name: '绿色', value: '#006400' },
];

export function ColorPicker({
  selectedColor,
  customColors,
  onColorSelect,
  onCustomColorAdd,
  onCustomColorRemove,
}: ColorPickerProps) {
  return (
    <div className="w-full p-4 card">
      <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--md-sys-color-primary)]"></span>
        选择印章颜色
      </h3>
      
      <div className="space-y-4">
        {/* 预设颜色 */}
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => onColorSelect(color.value)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all
                ${selectedColor === color.value 
                  ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]' 
                  : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]'
                }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border border-[var(--md-sys-color-outline)]/20"
                  style={{ backgroundColor: color.value }}
                />
                {color.name}
              </div>
            </button>
          ))}
        </div>

        {/* 自定义颜色 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-[var(--md-sys-color-on-surface-variant)]">
              自定义颜色
            </span>
            <label className="btn-secondary text-xs py-1 px-3 cursor-pointer">
              取色
              <input
                type="color"
                className="hidden"
                onChange={(e) => onCustomColorAdd(e.target.value)}
              />
            </label>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {customColors.map((color, index) => (
              <div
                key={index}
                className="relative group"
              >
                <button
                  onClick={() => onColorSelect(color)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all
                    ${selectedColor === color 
                      ? 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]' 
                      : 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-[var(--md-sys-color-outline)]/20"
                      style={{ backgroundColor: color }}
                    />
                    自定义 {index + 1}
                  </div>
                </button>
                <button
                  onClick={() => onCustomColorRemove(index)}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--md-sys-color-error)] text-white
                    opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 