import { Info, MessageCircle, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import React, { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type ChatRole = "assistant" | "visitor";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

const CHAT_ENDPOINT = "https://saudi-whatsapp-chatbot-production.up.railway.app/web-chat";
const SESSION_STORAGE_KEY = "autoapply_sa_web_chat_session";
const REQUEST_TIMEOUT_MS = 15_000;

const SUGGESTIONS = [
  { label: "Start a campaign / ابدأ", message: "start", primary: true },
  { label: "How it works / كيف نعمل", message: "how it works", primary: false },
  { label: "Pricing / الأسعار", message: "pricing", primary: false },
  { label: "Privacy / الخصوصية", message: "privacy", primary: false },
  { label: "Cities / المدن", message: "cities", primary: false },
];

type QuickRepliesProps = {
  compact?: boolean;
  disabled: boolean;
  onSelect: (message: string) => void;
};

function QuickReplies({ compact = false, disabled, onSelect }: QuickRepliesProps) {
  return (
    <div aria-label="Quick chat replies" className={compact ? "mt-4 border-t border-slate-200 pt-3" : "mt-5"} role="group">
      {compact ? <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500">Quick replies / ردود سريعة</p> : null}
      <div className={compact ? "flex flex-wrap gap-2" : "flex flex-col gap-2"}>
        {SUGGESTIONS.map((suggestion) => (
          <button
            className={
              compact
                ? suggestion.primary
                  ? "rounded-full bg-[#2563eb] px-3 py-1.5 text-left text-xs font-bold text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[.97]"
                  : "rounded-full border border-blue-100 bg-white px-3 py-1.5 text-left text-xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] disabled:cursor-not-allowed disabled:opacity-60 active:scale-[.97]"
                : suggestion.primary
                  ? "rounded-2xl bg-[#2563eb] px-3 py-3 text-left text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  : "rounded-2xl border border-blue-100 bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] disabled:cursor-not-allowed disabled:opacity-60"
            }
            disabled={disabled}
            key={suggestion.message}
            onClick={() => onSelect(suggestion.message)}
            type="button"
          >
            {suggestion.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div aria-label="AutoApply SA is typing" className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-600 shadow-sm" role="status">
      <span aria-hidden="true" className="flex items-center gap-1">
        {[0, 1, 2].map((index) => (
          <span
            className="size-1.5 rounded-full bg-[#2563eb] motion-safe:animate-[pulse_1s_cubic-bezier(0.4,0,0.6,1)_infinite] motion-reduce:opacity-100"
            data-testid="chat-typing-dot"
            key={index}
            style={{ animationDelay: `${index * 140}ms` }}
          />
        ))}
      </span>
      <span>Typing… / جاري الكتابة…</span>
    </div>
  );
}

function createSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `autoapply-${crypto.randomUUID()}`;
  }
  return `autoapply-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionId() {
  if (typeof window === "undefined") return createSessionId();
  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;
  const sessionId = createSessionId();
  window.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}

function extractReply(value: unknown) {
  if (
    typeof value === "object" &&
    value !== null &&
    "reply" in value &&
    typeof value.reply === "string" &&
    value.reply.trim()
  ) {
    return value.reply.trim();
  }
  return null;
}

export function AutoApplyChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const activeElement = document.activeElement;
      returnFocusRef.current = activeElement instanceof HTMLElement ? activeElement : launcherRef.current;
      const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
      return () => window.cancelAnimationFrame(frame);
    }

    const returnFocus = returnFocusRef.current;
    if (returnFocus?.isConnected) returnFocus.focus();
  }, [isOpen]);

  useEffect(() => {
    const scrollTarget = messagesEndRef.current;
    if (scrollTarget && typeof scrollTarget.scrollIntoView === "function") {
      scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && !event.isComposing) {
        event.preventDefault();
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  const sendMessage = async (rawMessage: string) => {
    const message = rawMessage.trim();
    if (!message || isLoading) return;

    setError(null);
    setInput("");
    setMessages((current) => [...current, { id: `visitor-${Date.now()}`, role: "visitor", text: message }]);
    setIsLoading(true);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, session_id: getSessionId() }),
      });
      const reply = extractReply(await response.json().catch(() => null));
      if (!response.ok || !reply) throw new Error("Chat response was unavailable");
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: "assistant", text: reply }]);
    } catch {
      setError("Chat is temporarily unavailable. Please try again or continue on WhatsApp.");
    } finally {
      window.clearTimeout(timeout);
      setIsLoading(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[70] sm:bottom-5 sm:right-5">
      {isOpen ? (
        <section
          aria-label="AutoApply SA chat"
          aria-describedby="autoapply-chat-guidance"
          aria-modal="true"
          className="mb-3 flex h-[min(640px,calc(100dvh-6.75rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-[0_24px_70px_rgba(37,99,235,0.24)] sm:w-[390px]"
          role="dialog"
        >
          <header className="flex items-start justify-between gap-3 bg-[#2563eb] px-4 py-3.5 text-white">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-white/15" aria-hidden="true">
                <Sparkles className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold leading-tight">AutoApply SA</h2>
                <p className="mt-0.5 text-xs text-blue-100">مساعد التقديم الوظيفي / Job application assistant</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-2 py-1 text-[10px] font-semibold text-white">
                    <ShieldCheck className="size-3" aria-hidden="true" />
                    Private by design / الخصوصية أولاً
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        aria-label="How AutoApply SA protects chat privacy"
                        className="inline-flex size-6 items-center justify-center rounded-full text-blue-50 transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        type="button"
                      >
                        <Info className="size-3.5" aria-hidden="true" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="z-[90] max-w-[18rem] bg-slate-950 px-3 py-2 text-left text-xs leading-5 text-white" side="bottom" sideOffset={8}>
                      Candidate dashboard records are isolated by signed-in account, and CV files are not retained in chat. / تُعزل سجلات لوحة المرشح بحسب الحساب المسجّل، ولا تُحتفَظ ملفات السيرة في المحادثة.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
            <button
              aria-label="Close AutoApply SA chat"
              className="rounded-xl p-2 transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              <X className="size-4" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto bg-slate-50 px-3 py-4">
            {messages.length === 0 ? (
              <div className="mx-auto flex min-h-full max-w-sm flex-col justify-center py-5">
                <p className="text-center text-sm font-semibold text-slate-900">Start a Saudi job campaign or choose a question.</p>
                <p className="mt-1 text-center text-sm leading-6 text-slate-600" dir="rtl">ابدأ حملة توظيف في السعودية أو اختر سؤالك.</p>
                <QuickReplies disabled={isLoading} onSelect={(message) => void sendMessage(message)} />
              </div>
            ) : (
              <div className="space-y-3" aria-live="polite">
                {messages.map((message) => (
                  <div className={`flex ${message.role === "visitor" ? "justify-end" : "justify-start"}`} key={message.id}>
                    <p
                      className={
                        message.role === "visitor"
                          ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[#2563eb] px-3.5 py-2.5 text-sm leading-6 text-white"
                          : "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-6 text-slate-800 shadow-sm"
                      }
                    >
                      {message.text}
                    </p>
                  </div>
                ))}
                <QuickReplies compact disabled={isLoading} onSelect={(message) => void sendMessage(message)} />
                {isLoading ? <div className="flex justify-start"><TypingIndicator /></div> : null}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <footer className="border-t border-slate-200 bg-white px-3 py-3">
            <p id="autoapply-chat-guidance" className="mb-2 text-center text-[11px] leading-4 text-slate-500">
              Start here, then use the secure CV intake for PDF or Word files. CV files are not retained in chat. / ابدأ هنا، ثم استخدم قسم رفع السيرة الآمن لملفات PDF أو Word. لا تُحفظ ملفات السيرة في الدردشة.
            </p>
            {error ? (
              <div className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700" role="status">
                <span>{error}</span>
                <a className="shrink-0 font-semibold underline" href="https://wa.me/966571448656" rel="noreferrer" target="_blank">WhatsApp</a>
              </div>
            ) : null}
            <div className="mb-2 flex items-center justify-between gap-2 text-xs">
              <a className="font-semibold text-[#2563eb] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]" href="/#upload">
                Upload CV / رفع السيرة الذاتية
              </a>
              <span className="text-slate-500">English &amp; العربية</span>
            </div>
            <form className="flex items-end gap-2" onSubmit={submit}>
              <textarea
                aria-label="Message AutoApply SA"
                className="min-h-10 flex-1 resize-none rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
                disabled={isLoading}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about job applications… / اسأل عن التقديم"
                ref={inputRef}
                rows={1}
                value={input}
              />
              <button
                aria-label="Send message"
                className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#2563eb] text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!input.trim() || isLoading}
                type="submit"
              >
                <Send className="size-4" />
              </button>
            </form>
          </footer>
        </section>
      ) : null}

      <button
        aria-label="Open AutoApply SA chat"
        className="group flex h-14 items-center gap-2 rounded-full bg-[#2563eb] px-4 text-sm font-bold text-white shadow-[0_12px_28px_rgba(37,99,235,0.32)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
        onClick={() => setIsOpen((open) => !open)}
        ref={launcherRef}
        type="button"
      >
        <MessageCircle className="size-5" />
        <span>Chat / دردشة</span>
      </button>
    </div>
  );
}
