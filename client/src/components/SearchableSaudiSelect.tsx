import React, { useMemo, useState } from "react";
import type { Option } from "@/lib/saudiTaxonomy";

export function SearchableSaudiSelect({ options, value, onChange, language = "en", placeholder }: { options: Option[]; value: string; onChange: (value: string) => void; language?: "en" | "ar"; placeholder: string }) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => options.filter(o => `${o.en} ${o.ar}`.toLowerCase().includes(query.toLowerCase())).slice(0, 12), [options, query]);
  return <div className="space-y-2"><input className="w-full border border-black/20 p-2 text-sm" value={query} onChange={e => setQuery(e.target.value)} placeholder={placeholder} /><select className="w-full border border-black/20 p-2" value={value} onChange={e => onChange(e.target.value)}>{matches.map(o => <option key={o.id} value={o.en}>{language === "ar" ? o.ar : o.en}</option>)}</select></div>;
}
