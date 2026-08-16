import React, { type FormEvent, useState } from "react";
import { ArrowUpRight, Check, MessageCircle } from "lucide-react";

type FooterEnquiryFormProps = { locale: "en" | "ar" };

const copy = {
  en: {
    eyebrow: "Quick enquiry",
    heading: "Ask about your next campaign.",
    name: "Name",
    email: "Email address",
    message: "What would you like help with?",
    namePlaceholder: "Your name",
    emailPlaceholder: "name@example.com",
    messagePlaceholder: "Target role, city, or question",
    submit: "Open WhatsApp",
    preparing: "Preparing chat…",
    note: "Your details stay in this browser until you choose to send the prepared WhatsApp message.",
    ready: "Your enquiry is ready. WhatsApp should open in a new tab.",
    thankYou: "Thank you — your enquiry is ready to send.",
    fallback: "WhatsApp did not open? Use this secure link.",
    fallbackAction: "Open WhatsApp",
    whatsappMessage: (name: string, email: string, message: string) => [
      "Hi AutoApply SA, I have a quick enquiry.",
      `Name: ${name}`,
      `Email: ${email}`,
      `Message: ${message}`,
    ].join("\n"),
  },
  ar: {
    eyebrow: "استفسار سريع",
    heading: "اسأل عن حملتك القادمة.",
    name: "الاسم",
    email: "البريد الإلكتروني",
    message: "كيف يمكننا مساعدتك؟",
    namePlaceholder: "اسمك",
    emailPlaceholder: "name@example.com",
    messagePlaceholder: "الوظيفة المستهدفة أو المدينة أو سؤالك",
    submit: "افتح WhatsApp",
    preparing: "جارٍ تجهيز المحادثة…",
    note: "تبقى بياناتك في هذا المتصفح حتى تختار إرسال رسالة WhatsApp المُعدّة.",
    ready: "استفسارك جاهز. من المفترض أن يُفتح WhatsApp في علامة تبويب جديدة.",
    thankYou: "شكراً لك — أصبح استفسارك جاهزاً للإرسال.",
    fallback: "لم يُفتح WhatsApp؟ استخدم هذا الرابط الآمن.",
    fallbackAction: "فتح WhatsApp",
    whatsappMessage: (name: string, email: string, message: string) => [
      "مرحباً AutoApply SA، لدي استفسار سريع.",
      `الاسم: ${name}`,
      `البريد الإلكتروني: ${email}`,
      `الرسالة: ${message}`,
    ].join("\n"),
  },
} as const;

export function FooterEnquiryForm({ locale }: FooterEnquiryFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [handoffHref, setHandoffHref] = useState("");
  const [status, setStatus] = useState<"idle" | "preparing" | "ready" | "blocked">("idle");
  const text = copy[locale];

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "preparing") return;

    const whatsappHref = `https://wa.me/966571448656?text=${encodeURIComponent(text.whatsappMessage(name, email, message))}`;
    const handoffWindow = window.open("about:blank", "autoapply-footer-enquiry");
    if (handoffWindow) handoffWindow.opener = null;

    setHandoffHref(whatsappHref);
    setStatus(handoffWindow ? "preparing" : "blocked");
    window.setTimeout(() => {
      if (handoffWindow) {
        handoffWindow.location.replace(whatsappHref);
        setStatus("ready");
      }
    }, 450);
  };

  return (
    <form className="footer-enquiry" onSubmit={submit} aria-busy={status === "preparing"} dir={locale === "ar" ? "rtl" : undefined}>
      <div className="footer-enquiry-heading"><span>{text.eyebrow}</span><b>{text.heading}</b></div>
      <div className="footer-enquiry-fields">
        <label><span>{text.name}</span><input required value={name} onChange={(event) => setName(event.target.value)} placeholder={text.namePlaceholder} autoComplete="name" /></label>
        <label><span>{text.email}</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={text.emailPlaceholder} autoComplete="email" /></label>
        <label className="footer-enquiry-message"><span>{text.message}</span><textarea required rows={2} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={text.messagePlaceholder} /></label>
      </div>
      <div className="footer-enquiry-actions"><button className="footer-enquiry-submit" type="submit" disabled={status === "preparing"}>{status === "preparing" ? text.preparing : <>{text.submit} <ArrowUpRight size={15} /></>}</button><small><Check size={13} /> {text.note}</small></div>
      {status === "ready" && (
        <p className="footer-enquiry-status footer-enquiry-success" role="status" aria-live="polite">
          <span className="footer-enquiry-success-icon" aria-hidden="true"><Check size={17} strokeWidth={2.4} /></span>
          <span>
            <strong>{text.thankYou}</strong>
            <small>{text.ready}</small>
          </span>
          <MessageCircle size={15} aria-hidden="true" />
        </p>
      )}
      {status === "blocked" && handoffHref && <p className="footer-enquiry-status" role="status"><span>{text.fallback}</span><a href={handoffHref} target="_blank" rel="noreferrer">{text.fallbackAction} <ArrowUpRight size={13} /></a></p>}
    </form>
  );
}
