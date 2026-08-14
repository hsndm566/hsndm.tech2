import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SearchableSaudiSelect } from "@/components/SearchableSaudiSelect";
import { saudiCities, saudiIndustries } from "@/lib/saudiTaxonomy";

/** Renders canonical Arabic market controls directly inside the CV-upload preference grid. */
export function ArabicMarketSelector({ city, industry, onCityChange, onIndustryChange }: { city: string; industry: string; onCityChange: (value: string) => void; onIndustryChange: (value: string) => void }) {
  const [target, setTarget] = useState<Element | null>(null);

  useEffect(() => {
    setTarget(document.querySelector('.site-shell[lang="ar"] #upload .preferences-grid'));
  }, []);

  if (!target) return null;

  return createPortal(
    <>
      <label className="arabic-canonical-preference"><span>المدينة</span><SearchableSaudiSelect options={saudiCities} value={city} onChange={onCityChange} language="ar" placeholder="ابحث عن مدينة سعودية…" /></label>
      <label className="arabic-canonical-preference"><span>المجال</span><SearchableSaudiSelect options={saudiIndustries} value={industry} onChange={onIndustryChange} language="ar" placeholder="ابحث عن مجال…" /></label>
    </>,
    target,
  );
}
