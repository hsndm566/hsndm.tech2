import React from "react";
import { ShieldCheck, ArrowUpRight } from "lucide-react";

export type FallbackStateProps = {
  WHATSAPP_URL: string;
  resetScan: () => void;
};

export function ArabicFallbackState({ WHATSAPP_URL, resetScan }: FallbackStateProps) {
  return (
    <div className="scan-fallback" role="status" aria-live="polite">
      <div>
        <ShieldCheck size={16} />
        <span>
          <b>نحتاج إلى إلقاء نظرة أقرب.</b> تعذر قراءة هذا الملف بوضوح في المتصفح، لذلك لن نخمن الوظائف المناسبة.
        </span>
      </div>
      <a href={WHATSAPP_URL} target="_blank" rel="noreferrer">
        أرسلها عبر WhatsApp <ArrowUpRight size={15} />
      </a>
      <button onClick={resetScan}>جرّب سيرة أخرى</button>
    </div>
  );
}
