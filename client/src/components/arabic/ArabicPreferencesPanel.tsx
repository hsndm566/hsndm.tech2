import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { ArabicMarketSelector } from "@/components/ArabicMarketSelector";
import type { MatchPreferences } from "@/pages/ArabicHome";

export type PreferencesPanelProps = {
  matchPreferences: MatchPreferences;
  setMatchPreferences: React.Dispatch<React.SetStateAction<MatchPreferences>>;
  selectedArabicIndustry: string;
  setSelectedArabicIndustry: (industry: string) => void;
  toMatchIndustry: (industry: string) => MatchPreferences["industry"];
};

export function ArabicPreferencesPanel({
  matchPreferences,
  setMatchPreferences,
  selectedArabicIndustry,
  setSelectedArabicIndustry,
  toMatchIndustry,
}: PreferencesPanelProps) {
  return (
    <div className="match-preferences" aria-label="تفضيلات مطابقة الوظائف في السعودية">
      <div className="preferences-heading">
        <span>
          <SlidersHorizontal size={14} /> تفضيلات المطابقة
        </span>
        <small>تُطبّق محلياً</small>
      </div>
      <div className="preferences-grid">
        <ArabicMarketSelector
          city={matchPreferences.city}
          industry={selectedArabicIndustry}
          onCityChange={(city: string) => setMatchPreferences((current: MatchPreferences) => ({ ...current, city }))}
          onIndustryChange={(industry: string) => {
            setSelectedArabicIndustry(industry);
            setMatchPreferences((current: MatchPreferences) => ({
              ...current,
              industry: toMatchIndustry(industry) as MatchPreferences["industry"],
            }));
          }}
        />
        <label>
          <span>المستوى الوظيفي</span>
          <select
            value={matchPreferences.seniority}
            onChange={(event) => setMatchPreferences((current: MatchPreferences) => ({ ...current, seniority: event.target.value }))}
          >
            <option value="Any level">أي مستوى</option>
            <option value="Entry level">مستوى مبتدئ</option>
            <option value="Mid level">مستوى متوسط</option>
            <option value="Senior level">مستوى متقدم</option>
          </select>
        </label>
        <label>
          <span>لغة التقديم</span>
          <select value="Arabic" disabled aria-label="لغة التقديم العربية">
            <option value="Arabic">العربية</option>
          </select>
        </label>
      </div>
    </div>
  );
}
