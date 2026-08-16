import React from "react";
import { ScanSearch } from "lucide-react";

export type ScanProgressProps = {
  scanProgress: number;
};

export function ArabicScanProgress({ scanProgress }: ScanProgressProps) {
  return (
    <div className="role-scan" role="status" aria-live="polite">
      <div className="scan-meta">
        <span>
          <ScanSearch size={14} /> جارٍ العثور على مسارات مناسبة لك…
        </span>
        <span className="text-[11px] font-mono opacity-75 mr-2">الفحص محلياً</span>
        <b>{scanProgress}%</b>
      </div>
      <div className="scan-track" role="progressbar" aria-label="جارٍ العثور على وظائف مناسبة" aria-valuemin={0} aria-valuemax={100} aria-valuenow={scanProgress}>
        <span style={{ width: `${scanProgress}%` }} />
      </div>
      <p>نقرأ المهارات والخبرة والإشارات المهنية محلياً.</p>
    </div>
  );
}
