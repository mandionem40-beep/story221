import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * FormSelect — custom popover-based replacement for native <select>.
 * Uses radix Select primitives styled to match the app's dark theme.
 */
export default function FormSelect({ value, onValueChange, options = [], placeholder, className = "", contentClassName = "" }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`h-11 rounded-xl bg-card border border-border px-3 text-sm text-white ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={`bg-popover border-border max-h-[60vh] ${contentClassName}`}>
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="text-white focus:bg-primary/20 focus:text-white cursor-pointer"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}