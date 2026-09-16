import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

const MOCK_SOCIAL_PROOF = [
  { name: "Khalid", company: "PwC" },
  { name: "Yusuf", company: "Al-Roco" },
  { name: "Yassin", company: "SAVOLA Group" },
  { name: "Renad", company: "Aramco" },
  { name: "Yasmin", company: "STC" },
] as const;

export function SocialProofNotification() {
  const [location] = useLocation();
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const previousIndex = useRef(-1);

  useEffect(() => {
    if (location !== "/") {
      setVisible(false);
      return;
    }

    let hideTimer: number | undefined;
    let nextTimer: number | undefined;
    let cancelled = false;

    const showNotification = () => {
      if (cancelled) return;

      let index = Math.floor(Math.random() * MOCK_SOCIAL_PROOF.length);
      while (index === previousIndex.current && MOCK_SOCIAL_PROOF.length > 1) {
        index = Math.floor(Math.random() * MOCK_SOCIAL_PROOF.length);
      }

      previousIndex.current = index;
      setCurrentIndex(index);
      setVisible(true);

      hideTimer = window.setTimeout(() => {
        if (!cancelled) setVisible(false);
      }, 5000);

      const nextDelay = 60000 + Math.random() * 30000;
      nextTimer = window.setTimeout(showNotification, nextDelay);
    };

    const firstTimer = window.setTimeout(showNotification, 10000);

    return () => {
      cancelled = true;
      window.clearTimeout(firstTimer);
      if (hideTimer) window.clearTimeout(hideTimer);
      if (nextTimer) window.clearTimeout(nextTimer);
    };
  }, [location]);

  if (location !== "/") return null;

  const current = currentIndex === null ? null : MOCK_SOCIAL_PROOF[currentIndex];

  return (
    <>
      <style>{`
        #autoapply-social-proof {
          position: fixed;
          left: 20px;
          bottom: 20px;
          z-index: 70;
          width: min(340px, calc(100vw - 40px));
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: #fff;
          color: #151515;
          border: 1px solid rgba(0,0,0,.08);
          border-radius: 12px;
          box-shadow: 0 12px 35px rgba(0,0,0,.14);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          opacity: 0;
          transform: translateX(-120%);
          pointer-events: none;
          transition: transform .45s cubic-bezier(.22,1,.36,1), opacity .35s ease;
        }

        #autoapply-social-proof.show {
          opacity: 1;
          transform: translateX(0);
        }

        #autoapply-social-proof.hide {
          opacity: 0;
          transform: translateX(-15px);
        }

        #autoapply-social-proof .asp-avatar {
          width: 42px;
          height: 42px;
          min-width: 42px;
          border-radius: 50%;
          background: #f1f1f1;
          display: grid;
          place-items: center;
          font-weight: 700;
          font-size: 15px;
          color: #555;
        }

        #autoapply-social-proof .asp-content {
          flex: 1;
          min-width: 0;
        }

        #autoapply-social-proof .asp-name {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 3px;
        }

        #autoapply-social-proof .asp-action {
          font-size: 13px;
          line-height: 1.4;
          color: #555;
        }

        #autoapply-social-proof .asp-action strong {
          color: #151515;
          font-weight: 600;
        }

        #autoapply-social-proof .asp-check {
          width: 24px;
          height: 24px;
          min-width: 24px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #e8f7ee;
          color: #168a45;
          font-size: 14px;
          font-weight: 800;
        }

        @media (max-width: 520px) {
          #autoapply-social-proof {
            left: 12px;
            bottom: 76px;
            width: calc(100vw - 24px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          #autoapply-social-proof {
            transition: opacity .2s ease;
            transform: none;
          }
        }
      `}</style>
      <div
        id="autoapply-social-proof"
        className={visible ? "show" : current ? "hide" : ""}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="asp-avatar">{current?.name.charAt(0).toUpperCase() ?? ""}</div>
        <div className="asp-content">
          <div className="asp-name">{current?.name ?? ""}</div>
          <div className="asp-action">
            {current ? (
              <>
                Just Auto-Applied to <strong>{current.company}</strong>
              </>
            ) : null}
          </div>
        </div>
        <div className="asp-check">✓</div>
      </div>
    </>
  );
}
