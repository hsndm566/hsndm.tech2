import React from "react";
import { SearchableSaudiSelect } from "@/components/SearchableSaudiSelect";
import { saudiCities, saudiIndustries } from "@/lib/saudiTaxonomy";

/** Renders canonical Arabic market controls directly inside the CV-upload preference grid. */
export function ArabicMarketSelector({ city, industry, onCityChange, onIndustryChange }: { city: string; industry: string; onCityChange: (value: string) => void; onIndustryChange: (value: string) => void }) {
  return (
    <>
      <label className="arabic-canonical-preference">
        <span>المدينة</span>
        <SearchableSaudiSelect options={saudiCities} value={city} onChange={onCityChange} language="ar" placeholder="ابحث عن مدينة سعودية…" />
      </label>
      <label className="arabic-canonical-preference">
        <span>المجال</span>
        <SearchableSaudiSelect options={saudiIndustries} value={industry} onChange={onIndustryChange} language="ar" placeholder="ابحث عن مجال…" />
      </label>
    </>
  );
}
