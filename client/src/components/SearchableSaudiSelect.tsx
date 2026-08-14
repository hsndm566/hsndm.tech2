import React, { useMemo, useState } from "react";
import { CircleHelp } from "lucide-react";
import type { Option } from "@/lib/saudiTaxonomy";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function SearchableSaudiSelect({ options, value, onChange, language = "en", placeholder }: { options: Option[]; value: string; onChange: (value: string) => void; language?: "en" | "ar"; placeholder: string }) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => options.filter(o => `${o.en} ${o.ar}`.toLowerCase().includes(query.toLowerCase())).slice(0, 12), [options, query]);
  const help = language === "ar"
    ? "اختر مدينة ومجالاً داخل السعودية لتوجيه المطابقة محلياً وإضافة السياق نفسه إلى ملخص الحملة في WhatsApp. لا يبدأ ذلك طلب تقديم."
    : "Choose a Saudi city and industry to guide local matching and add the same context to your WhatsApp campaign brief. This does not submit an application.";
  const helpLabel = language === "ar" ? "كيف تعمل اختيارات المطابقة؟" : "How do these matching choices work?";
  return <div className="space-y-2"><div className="flex items-center justify-end"><Tooltip><TooltipTrigger asChild><button type="button" aria-label={helpLabel} className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[#151515]/60 transition-colors hover:bg-[#151515] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e5482a]"><CircleHelp size={15} aria-hidden="true" /></button></TooltipTrigger><TooltipContent side="top" sideOffset={6} className="max-w-64 leading-relaxed">{help}</TooltipContent></Tooltip></div><input className="w-full border border-black/20 p-2 text-sm" value={query} onChange={e => setQuery(e.target.value)} placeholder={placeholder} /><select className="w-full border border-black/20 p-2" value={value} onChange={e => onChange(e.target.value)}>{matches.map(o => <option key={o.id} value={o.en}>{language === "ar" ? o.ar : o.en}</option>)}</select></div>;
}
