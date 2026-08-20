import React from "react";
import { Paperclip, ArrowUpRight, MessageCircle, ShieldCheck } from "lucide-react";
import type { MatchPreferences } from "@/pages/ArabicHome";
import { ArabicPreferencesPanel } from "./ArabicPreferencesPanel";
import { ArabicUploadDropZone } from "./ArabicUploadDropZone";
import { ArabicScanProgress } from "./ArabicScanProgress";
import { ArabicMatchedResults } from "./ArabicMatchedResults";
import { ArabicFallbackState } from "./ArabicFallbackState";
import { HomepageMediaImage } from "@/components/HomepageMediaImage";

type ScanResultType = {
  field: string;
  confidence: string;
  roles: string[];
  rationale: string;
  keySkills?: string[];
  topDomain?: string;
} | null;

export type ArabicIntakeProps = {
  matchPreferences: MatchPreferences;
  setMatchPreferences: React.Dispatch<React.SetStateAction<MatchPreferences>>;
  selectedArabicIndustry: string;
  setSelectedArabicIndustry: (industry: string) => void;
  selectedFile: string | null;
  scanState: "idle" | "scanning" | "matched" | "fallback";
  scanProgress: number;
  scanResult: ScanResultType;
  selectedSuggestedRole: string | null;
  setSelectedSuggestedRole: (role: string | null) => void;
  briefStatus: "idle" | "submitting" | "success";
  backendAvailable: boolean;
  onFileDrop: (event: React.DragEvent<HTMLLabelElement>) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  resetScan: () => void;
  shareArabicBrief: () => void;
  roleLabel: (role: string) => string;
  cityLabel: (city: string) => string;
  industryLabels: Record<string, string>;
  seniorityLabel: (seniority: string) => string;
  toMatchIndustry: (industry: string) => MatchPreferences["industry"];
  makeArabicWhatsAppHref: (roles: string[]) => string;
  WHATSAPP_URL: string;
};

export function ArabicIntakeSection({
  matchPreferences,
  setMatchPreferences,
  selectedArabicIndustry,
  setSelectedArabicIndustry,
  selectedFile,
  scanState,
  scanProgress,
  scanResult,
  selectedSuggestedRole,
  setSelectedSuggestedRole,
  briefStatus,
  backendAvailable,
  onFileDrop,
  onFileChange,
  resetScan,
  shareArabicBrief,
  roleLabel,
  cityLabel,
  industryLabels,
  seniorityLabel,
  toMatchIndustry,
  makeArabicWhatsAppHref,
  WHATSAPP_URL,
}: ArabicIntakeProps) {
  return (
    <section id="upload" className="upload-section section-paper">
      <div className="page-frame upload-grid">
        <div className="upload-image-wrap">
          <HomepageMediaImage src="/manus-storage/autoapply-desk_635170b2.jpg" alt="مساحة عمل جاهزة لبدء البحث عن وظيفة" width={1536} height={1920} />
          <div className="image-stamp">
            <span>ابدأ / 60 ثانية</span>
            <ArrowUpRight size={17} />
          </div>
        </div>
        <div className="upload-copy">
          <div className="section-kicker">
            <Paperclip size={15} /> استلام السيرة الذاتية
          </div>
          <h2>
            أضف سيرتك الذاتية. <i>اكتشف مساراتك.</i>
          </h2>
          <p className="section-summary">
            اختر أحدث نسخة من سيرتك الذاتية وحدّد تفضيلاتك للحملة داخل السعودية. تتم القراءة والمطابقة في متصفحك فقط، ولا يُرسل أي طلب تقديم في هذه المعاينة.
          </p>

          <ArabicPreferencesPanel
            matchPreferences={matchPreferences}
            setMatchPreferences={setMatchPreferences}
            selectedArabicIndustry={selectedArabicIndustry}
            setSelectedArabicIndustry={setSelectedArabicIndustry}
            toMatchIndustry={toMatchIndustry}
          />

          <ArabicUploadDropZone
            selectedFile={selectedFile}
            scanState={scanState}
            onFileDrop={onFileDrop}
            onFileChange={onFileChange}
          />

          {scanState === "scanning" && <ArabicScanProgress scanProgress={scanProgress} />}

          {scanState === "matched" && (
            <ArabicMatchedResults
              scanResult={scanResult}
              selectedSuggestedRole={selectedSuggestedRole}
              setSelectedSuggestedRole={setSelectedSuggestedRole}
              resetScan={resetScan}
              roleLabel={roleLabel}
              cityLabel={cityLabel}
              industryLabels={industryLabels}
              seniorityLabel={seniorityLabel}
              matchPreferences={matchPreferences}
              briefStatus={briefStatus}
              backendAvailable={backendAvailable}
              shareArabicBrief={shareArabicBrief}
              makeArabicWhatsAppHref={makeArabicWhatsAppHref}
            />
          )}

          {scanState === "fallback" && (
            <ArabicFallbackState WHATSAPP_URL={WHATSAPP_URL} resetScan={resetScan} />
          )}

          <p className="privacy-note">
            <ShieldCheck size={16} /> يبقي هذا الفحص نص السيرة واختيار الملف داخل متصفحك. لا يُرسل سوى ملخص حملة اختياري عند اختيار WhatsApp.
          </p>
          <a className="button button-ink" href={WHATSAPP_URL} target="_blank" rel="noreferrer">
            تابع عبر WhatsApp <MessageCircle size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
