import { Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import React, { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

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
  "How does AutoApply SA work?",
  "I want help applying for jobs",
  "How do I send my CV?",
];

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

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const scrollTarget = messagesEndRef.current;
    if (scrollTarget && typeof scrollTarget.scrollIntoView === "function") {
      scrollTarget.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

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
          aria-modal="false"
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
                <p className="text-center text-sm font-semibold text-slate-900">How can we help with your Saudi job search?</p>
                <p className="mt-1 text-center text-sm leading-6 text-slate-600" dir="rtl">كيف يمكننا مساعدتك في رحلتك الوظيفية في السعودية؟</p>
                <div className="mt-5 flex flex-col gap-2" aria-label="Suggested chat questions">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      className="rounded-2xl border border-blue-100 bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isLoading}
                      key={suggestion}
                      onClick={() => void sendMessage(suggestion)}
                      type="button"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
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
                {isLoading ? (
                  <div className="flex justify-start" aria-label="AutoApply SA is replying">
                    <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-600 shadow-sm">
                      <Loader2 className="size-4 animate-spin text-[#2563eb]" />
                      <span>Thinking… / جاري الرد…</span>
                    </div>
                  </div>
                ) : null}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <footer className="border-t border-slate-200 bg-white px-3 py-3">
            <p className="mb-2 text-center text-[11px] leading-4 text-slate-500">
              For a CV file, use the secure CV upload section. Chat accepts a short summary.
            </p>
            {error ? (
              <div className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700" role="status">
                <span>{error}</span>
                <a className="shrink-0 font-semibold underline" href="https://wa.me/966571448656" rel="noreferrer" target="_blank">WhatsApp</a>
              </div>
            ) : null}
            <div className="mb-2 flex items-center justify-between gap-2 text-xs">
              <a className="font-semibold text-[#2563eb] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]" href="/#cv-intake">
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
        type="button"
      >
        <MessageCircle className="size-5" />
        <span>Chat / دردشة</span>
      </button>
    </div>
  );
}
