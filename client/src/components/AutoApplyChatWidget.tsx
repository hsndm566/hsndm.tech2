import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useLocation } from "wouter";
import { AIChatBox, type Message } from "./AIChatBox";

type HealthResponse = { status?: string };
type ChatResponse = { reply?: string; error?: string };

export function AutoApplyChatWidget() {
  const [location] = useLocation();
  const arabic = location.startsWith("/ar");
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const check = async () => {
      try {
        const response = await fetch("/api/chat/health", {
          signal: controller.signal,
          headers: { accept: "application/json" },
        });
        if (!response.ok) return;
        const payload = (await response.json()) as HealthResponse;
        if (payload.status === "ready") setReady(true);
      } catch {
        // Fail closed: an unavailable bot should not leave a broken launcher.
      }
    };
    void check();
    return () => controller.abort();
  }, []);

  const sendMessage = async (content: string) => {
    if (loading) return;
    const userMessage: Message = { role: "user", content };
    const nextMessages = [...messages, userMessage].slice(-15);
    setMessages(nextMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content: value }) => ({ role, content: value })),
        }),
      });
      const payload = (await response.json()) as ChatResponse;
      if (!response.ok || !payload.reply) throw new Error(payload.error || "chat unavailable");
      const assistantMessage: Message = { role: "assistant", content: payload.reply };
      setMessages((current) => [...current, assistantMessage].slice(-16));
    } catch {
      const errorMessage: Message = {
        role: "assistant",
        content: arabic
          ? "تعذر الاتصال بالمساعد الآن. جرّب مرة أخرى بعد قليل."
          : "I couldn't reach the assistant just now. Please try again shortly.",
      };
      setMessages((current) => [...current, errorMessage].slice(-16));
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return null;

  const title = arabic ? "مساعد AutoApply SA" : "AutoApply SA Assistant";
  const closeLabel = arabic ? "إغلاق المحادثة" : "Close chat";
  const openLabel = arabic ? "اسأل المساعد" : "Ask AutoApply";

  return (
    <div className="fixed bottom-5 right-5 z-[70]" dir={arabic ? "rtl" : "ltr"}>
      {open ? (
        <div className="w-[min(25rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-background/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                <MessageCircle className="size-4 text-primary" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">
                  {arabic ? "متصل وآمن عبر الخادم" : "Connected securely server-side"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex size-9 items-center justify-center rounded-full hover:bg-muted"
              aria-label={closeLabel}
            >
              <X className="size-4" />
            </button>
          </div>
          <AIChatBox
            messages={messages}
            onSendMessage={(value) => void sendMessage(value)}
            isLoading={loading}
            height="430px"
            className="rounded-none border-0 shadow-none"
            placeholder={arabic ? "اكتب سؤالك..." : "Ask about AutoApply SA..."}
            emptyStateMessage={
              arabic
                ? "اسأل عن الخدمة، السيرة الذاتية، أو طريقة بدء حملتك."
                : "Ask about the service, your CV, or how to get started."
            }
            suggestedPrompts={
              arabic
                ? ["كيف تعمل الخدمة؟", "كيف أبدأ؟", "هل يمكنكم مساعدتي في السيرة؟"]
                : ["How does AutoApply work?", "How do I get started?", "Can you help with my CV?"]
            }
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/95 px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-primary/60"
          aria-label={openLabel}
        >
          <MessageCircle className="size-5 text-primary" aria-hidden="true" />
          <span>{openLabel}</span>
        </button>
      )}
    </div>
  );
}
