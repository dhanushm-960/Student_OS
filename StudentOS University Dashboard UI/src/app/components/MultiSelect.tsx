import { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

interface MultiSelectProps {
  options: { label: string; value: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ options, selectedValues, onChange, placeholder = "Select options..." }: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (value: string) => {
    if (value === "ALL") {
      onChange(["ALL"]);
      return;
    }

    let newSelected = selectedValues.filter(v => v !== "ALL");
    
    if (newSelected.includes(value)) {
      newSelected = newSelected.filter(v => v !== value);
    } else {
      newSelected = [...newSelected, value];
    }
    
    if (newSelected.length === 0) {
      newSelected = ["ALL"];
    }

    onChange(newSelected);
  };

  const selectedOptions = options.filter(opt => selectedValues.includes(opt.value));

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        className="min-h-[42px] w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 flex flex-wrap gap-2 items-center cursor-pointer hover:border-indigo-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-sm text-slate-400 pl-1">{placeholder}</span>
        ) : (
          selectedOptions.map(opt => (
            <span 
              key={opt.value} 
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-500"
              onClick={(e) => {
                e.stopPropagation();
                if (selectedValues.length > 1 || selectedValues[0] !== "ALL") {
                  handleToggle(opt.value);
                }
              }}
            >
              {opt.label}
              {opt.value !== "ALL" && (
                <X size={12} className="cursor-pointer hover:text-indigo-900" />
              )}
            </span>
          ))
        )}
        <div className="ml-auto flex items-center text-slate-400">
          <ChevronDown size={16} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1">
          {options.map(opt => {
            const isSelected = selectedValues.includes(opt.value);
            return (
              <div 
                key={opt.value}
                className={`px-3 py-2 text-sm rounded-lg cursor-pointer flex items-center gap-2 ${
                  isSelected ? "bg-indigo-50 text-indigo-700 font-500" : "hover:bg-slate-50 text-slate-700"
                }`}
                onClick={() => handleToggle(opt.value)}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                  isSelected ? "bg-indigo-500 border-indigo-500" : "border-slate-300"
                }`}>
                  {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
