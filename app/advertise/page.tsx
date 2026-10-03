"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Globe2, LayoutPanelTop, ShieldCheck, Sparkles, Target } from "lucide-react";
import "./advertise.css";

type Lang = "ka" | "en";
type Placement = "lobby_week" | "table_week" | "sponsor_month";

const copy = {
  ka: {
    back: "თამაშში დაბრუნება", kicker: "რეკლამა JOKER-ზე", title: "აჩვენე შენი ბრენდი მოთამაშეებს",
    intro: "აირჩიე განთავსება და გამოგვიგზავნე მოთხოვნა. ხელმისაწვდომობას ერთ სამუშაო დღეში დაგიდასტურებთ და გამოგიგზავნით ინვოისსა და უსაფრთხო გადახდის დეტალებს.",
    choose: "აირჩიე განთავსება", popular: "პოპულარული", week: "კვირა", month: "თვე",
    plans: {
      lobby_week: ["ლობი ბანერი", "150", "მთავარი ლობის ფართო, კლიკებადი სარეკლამო სივრცე."],
      table_week: ["მაგიდის რეკლამა", "250", "კომპაქტური განთავსება თამაშის ეკრანზე."],
      sponsor_month: ["მთავარი სპონსორი", "700", "პრემიუმ ბრენდინგი ლობიში და სათამაშო მაგიდაზე."],
    },
    included: ["კლიკი პირდაპირ თქვენს გვერდზე", "მობილურსა და კომპიუტერზე მორგებული", "განთავსებამდე კრეატივის შემოწმება"],
    formTitle: "რეკლამის შეძენის მოთხოვნა", formCopy: "გადახდა ამ ფორმაში არ ხდება. დადასტურების შემდეგ მიიღებ ოფიციალურ ინვოისს.",
    name: "სახელი ან კომპანიის სახელი", email: "ელფოსტა", url: "ბრენდის ვებსაიტი", message: "დამატებითი ინფორმაცია", send: "მოთხოვნის გაგზავნა",
    success: "მოთხოვნა მიღებულია", successCopy: "დეტალებს ელფოსტაზე გამოგიგზავნით ერთ სამუშაო დღეში.", reference: "მოთხოვნის ნომერი", another: "კიდევ ერთი მოთხოვნა",
  },
  en: {
    back: "Back to the game", kicker: "Advertise on JOKER", title: "Put your brand in front of players",
    intro: "Choose a placement and send a purchase request. We confirm availability within one business day, then send your invoice and secure payment details.",
    choose: "Choose a placement", popular: "Popular", week: "week", month: "month",
    plans: {
      lobby_week: ["Lobby banner", "150", "A wide, clickable placement in the main game lobby."],
      table_week: ["Table placement", "250", "A compact brand placement inside the game screen."],
      sponsor_month: ["Main sponsor", "700", "Premium branding across the lobby and game table."],
    },
    included: ["Direct click-through to your page", "Responsive desktop and mobile placement", "Creative review before publication"],
    formTitle: "Advertising purchase request", formCopy: "No payment is taken in this form. You receive an official invoice after availability is confirmed.",
    name: "Name or company", email: "Email", url: "Brand website", message: "Additional details", send: "Send purchase request",
    success: "Request received", successCopy: "We will email the next steps within one business day.", reference: "Request number", another: "Send another request",
  },
} as const;

const planIcons = { lobby_week: LayoutPanelTop, table_week: Target, sponsor_month: Sparkles };

export default function AdvertisePage() {
  const [lang, setLang] = useState<Lang>("ka");
  const [placement, setPlacement] = useState<Placement>("lobby_week");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [brandUrl, setBrandUrl] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState<number | null>(null);
  const t = copy[lang];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/advertising", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ placement, contactName, email, brandUrl, message }) });
      const data = await response.json() as { error?: string; reference?: number };
      if (!response.ok || !data.reference) throw new Error(data.error || "Request failed");
      setReference(data.reference);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Request failed");
    } finally { setBusy(false); }
  };

  return <main className="ads-page">
    <header className="ads-header"><Link href="/"><ArrowLeft />{t.back}</Link><div className="ads-logo"><span><img src="/brand/jokera-logo.jpg" alt="" /></span><b>JOKER</b></div><div className="ads-lang"><button className={lang === "ka" ? "active" : ""} onClick={() => setLang("ka")}>ქარ</button><button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button></div></header>
    <section className="ads-hero"><div><p>{t.kicker}</p><h1>{t.title}</h1><span>{t.intro}</span></div><aside><Globe2 /><b>JOKER Ads</b><small>Georgian gaming audience</small><i>AD</i></aside></section>
    <section className="ads-content">
      <div className="ads-plans"><h2>{t.choose}</h2><div>{(Object.keys(t.plans) as Placement[]).map((id) => { const Icon = planIcons[id]; const plan = t.plans[id]; return <button key={id} className={placement === id ? "active" : ""} onClick={() => setPlacement(id)}><Icon />{id === "table_week" && <em>{t.popular}</em>}<b>{plan[0]}</b><span><strong>₾{plan[1]}</strong> / {id === "sponsor_month" ? t.month : t.week}</span><small>{plan[2]}</small><i><Check /></i></button>; })}</div><ul>{t.included.map((item) => <li key={item}><ShieldCheck />{item}</li>)}</ul></div>
      <section className="ads-form-card">{reference ? <div className="ads-success"><span><Check /></span><p>{t.kicker}</p><h2>{t.success}</h2><b>{t.successCopy}</b><small>{t.reference}: #{reference}</small><button onClick={() => setReference(null)}>{t.another}</button></div> : <form onSubmit={submit}><p>{t.kicker}</p><h2>{t.formTitle}</h2><span>{t.formCopy}</span><label>{t.name}<input required minLength={2} value={contactName} onChange={(event) => setContactName(event.target.value)} /></label><label>{t.email}<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>{t.url}<input type="url" placeholder="https://" value={brandUrl} onChange={(event) => setBrandUrl(event.target.value)} /></label><label>{t.message}<textarea rows={4} value={message} onChange={(event) => setMessage(event.target.value)} /></label>{error && <strong className="ads-error">{error}</strong>}<button disabled={busy}>{t.send}<ArrowRight /></button></form>}</section>
    </section>
  </main>;
}
