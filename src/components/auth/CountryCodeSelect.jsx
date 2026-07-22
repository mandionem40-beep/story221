import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { countryPrefixes } from "@/lib/phone-utils";

export default function CountryCodeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);
  const searchRef = useRef(null);

  const selected = countryPrefixes.find((c) => c.prefix === value) || countryPrefixes[0];

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    setTimeout(() => searchRef.current?.focus(), 50);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const filtered = countryPrefixes.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return c.country.toLowerCase().includes(q) || c.prefix.includes(q);
  });

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-12 px-3 rounded-md border border-input bg-transparent text-sm font-medium text-white hover:bg-secondary/50 transition-colors whitespace-nowrap"
      >
        <span className="text-lg leading-none">{selected.flag}</span>
        <span>{selected.prefix}</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 w-72 max-h-72 rounded-xl bg-popover border border-border shadow-xl overflow-hidden flex flex-col">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un pays..."
                className="w-full h-9 pl-8 pr-3 rounded-lg bg-secondary text-sm text-white placeholder:text-muted-foreground outline-none"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.map((c) => (
              <button
                key={c.prefix}
                type="button"
                onClick={() => {
                  onChange(c.prefix);
                  setOpen(false);
                  setSearch("");
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-secondary/70 transition-colors ${
                  c.prefix === value ? "bg-primary/10" : ""
                }`}
              >
                <span className="text-lg leading-none flex-shrink-0">{c.flag}</span>
                <span className="flex-1 text-left text-white truncate">{c.country}</span>
                <span className="text-muted-foreground text-xs">{c.prefix}</span>
                {c.prefix === value && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun pays trouvé</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}