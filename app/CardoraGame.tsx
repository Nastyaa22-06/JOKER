"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bot, ChevronRight, CircleHelp, LogIn, RotateCcw, Sparkles, Trophy, UserRound, UsersRound, X } from "lucide-react";

type Suit = "♠" | "♥" | "♦" | "♣" | "★";
type Card = { id: string; suit: Suit; rank: string; value: number };
type AuthMode = "google" | "facebook" | "guest";

const suits: Suit[] = ["♠", "♥", "♦", "♣"];
const ranks = [
  ["6", 6], ["7", 7], ["8", 8], ["9", 9], ["10", 10],
  ["J", 11], ["Q", 12], ["K", 13], ["A", 14],
] as const;

function makeDeck(): Card[] {
  const cards: Card[] = suits.flatMap((suit) => ranks.map(([rank, value]) => ({ id: `${suit}-${rank}`, suit, rank, value })));
  cards.push({ id: "joker-blue", suit: "★", rank: "JOKER", value: 16 }, { id: "joker-coral", suit: "★", rank: "JOKER", value: 15 });
  return cards.sort(() => Math.random() - 0.5);
}

function CardFace({ card, small = false }: { card: Card; small?: boolean }) {
  const red = card.suit === "♥" || card.suit === "♦";
  const joker = card.suit === "★";
  return (
    <div className={`playing-card ${small ? "playing-card--small" : ""} ${red ? "is-red" : ""} ${joker ? "is-joker" : ""}`}>
      <span className="card-rank">{joker ? "J" : card.rank}</span>
      <span className="card-suit">{card.suit}</span>
      {joker && <span className="joker-word">joker</span>}
    </div>
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`} aria-label="Cardora">
      <span className="brand-mark"><Sparkles size={compact ? 17 : 22} strokeWidth={2.4} /></span>
      <span>CARDORA</span>
    </div>
  );
}

function AuthModal({ onClose, onContinue }: { onClose: () => void; onContinue: (mode: AuthMode) => void }) {
  const [busy, setBusy] = useState<AuthMode | null>(null);
  const continueAs = (mode: AuthMode) => {
    setBusy(mode);
    window.setTimeout(() => onContinue(mode), 650);
  };
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="auth-card" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="icon-button auth-close" onClick={onClose} aria-label="დახურვა"><X size={19} /></button>
        <Logo compact />
        <div className="auth-copy">
          <span className="eyebrow">კეთილი იყოს შენი დაბრუნება</span>
          <h2 id="auth-title">თამაშში შესვლა</h2>
          <p>შენი შედეგები და თამაშის პროგრესი ამ მოწყობილობაზე შეინახება.</p>
        </div>
        <div className="auth-actions">
          <button className="social-button" onClick={() => continueAs("google")} disabled={busy !== null}>
            <span className="google-g">G</span><span>{busy === "google" ? "ვაერთებთ…" : "Continue with Google"}</span>
          </button>
          <button className="social-button" onClick={() => continueAs("facebook")} disabled={busy !== null}>
            <span className="facebook-f">f</span><span>{busy === "facebook" ? "ვაერთებთ…" : "Continue with Facebook"}</span>
          </button>
          <div className="or"><span>ან</span></div>
          <button className="guest-button" onClick={() => continueAs("guest")} disabled={busy !== null}>
            <UserRound size={19} /> სტუმრად თამაში <ChevronRight size={18} />
          </button>
        </div>
        <p className="demo-note">სოციალური შესვლა დემო რეჟიმშია — რეალური ანგარიშების დასაკავშირებლად საჭიროა Google/Facebook app credentials.</p>
      </section>
    </div>
  );
}

function Lobby({ onPlay }: { onPlay: () => void }) {
  return (
    <main className="lobby-shell">
      <header className="topbar">
        <Logo />
        <div className="topbar-actions">
          <div className="online-pill"><span className="pulse-dot" /> 1,284 ონლაინ</div>
          <button className="login-button" onClick={onPlay}><LogIn size={18} /> შესვლა</button>
        </div>
      </header>
      <section className="lobby-content">
        <div className="section-heading">
          <div><span className="eyebrow">ქართული სამაგიდო თამაშები</span><h1>აირჩიე თამაში</h1></div>
          <div className="players-card"><UsersRound size={19} /><span><strong>48</strong> აქტიური მაგიდა</span></div>
        </div>
        <div className="games-grid">
          <button className="game-card game-card--hero" onClick={onPlay}>
            <div className="card-art" aria-hidden="true">
              <div className="floating-card floating-card--one"><span>★</span></div>
              <div className="floating-card floating-card--two"><span>♥</span></div>
              <div className="floating-card floating-card--three"><span>A</span></div>
              <div className="art-glow" />
            </div>
            <div className="game-card-copy">
              <span className="live-badge"><span /> LIVE</span>
              <h2>ჯოკერი</h2>
              <p>კლასიკური კარტის თამაში — ითამაშე სამ მეტოქესთან.</p>
              <span className="play-cta">თამაშის დაწყება <ChevronRight size={20} /></span>
            </div>
          </button>
          <article className="game-card game-card--mini mini-blue">
            <span className="soon-badge">მალე</span><div className="mini-icon domino-icon"><i /><i /><i /><i /></div>
            <div><h3>დომინო</h3><p>პარტნიორული თამაში</p></div>
          </article>
          <article className="game-card game-card--mini mini-violet">
            <span className="soon-badge">მალე</span><div className="mini-icon dice-icon">⚄</div>
            <div><h3>ნარდი</h3><p>სწრაფი დუელი</p></div>
          </article>
        </div>
      </section>
      <footer className="lobby-footer"><span>© 2026 Cardora · მხოლოდ გასართობად</span><button><CircleHelp size={16} /> როგორ ვითამაშო?</button></footer>
    </main>
  );
}

function Game({ playerName, onExit }: { playerName: string; onExit: () => void }) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [tableCards, setTableCards] = useState<{ name: string; card: Card }[]>([]);
  const [score, setScore] = useState({ you: 0, bots: 0 });
  const [round, setRound] = useState(1);
  const [message, setMessage] = useState("აირჩიე კარტი");
  const [locked, setLocked] = useState(false);
  const [finished, setFinished] = useState(false);

  const startGame = () => {
    const fresh = makeDeck();
    setHand(fresh.slice(0, 7)); setDeck(fresh.slice(7)); setTableCards([]);
    setScore({ you: 0, bots: 0 }); setRound(1); setMessage("აირჩიე კარტი"); setLocked(false); setFinished(false);
  };
  useEffect(() => { startGame(); }, []);

  const playCard = (card: Card) => {
    if (locked || finished) return;
    setLocked(true);
    const nextHand = hand.filter((item) => item.id !== card.id);
    const botCards = deck.slice(0, 3);
    setHand(nextHand); setDeck(deck.slice(3)); setTableCards([{ name: playerName, card }]); setMessage("მეტოქეები თამაშობენ…");
    window.setTimeout(() => setTableCards((current) => [...current, { name: "ნიკა", card: botCards[0] }]), 320);
    window.setTimeout(() => setTableCards((current) => [...current, { name: "მარი", card: botCards[1] }]), 650);
    window.setTimeout(() => setTableCards((current) => [...current, { name: "ლუკა", card: botCards[2] }]), 980);
    window.setTimeout(() => {
      const all = [{ name: playerName, card }, { name: "ნიკა", card: botCards[0] }, { name: "მარი", card: botCards[1] }, { name: "ლუკა", card: botCards[2] }];
      const winner = all.reduce((best, item) => item.card.value > best.card.value ? item : best);
      const youWon = winner.name === playerName;
      setScore((current) => ({ you: current.you + (youWon ? 1 : 0), bots: current.bots + (youWon ? 0 : 1) }));
      setMessage(youWon ? "ეს ხელი შენია!" : `${winner.name} იგებს ხელს`);
      window.setTimeout(() => {
        if (nextHand.length === 0) { setFinished(true); setLocked(false); setTableCards([]); }
        else { setTableCards([]); setRound((current) => current + 1); setMessage("აირჩიე კარტი"); setLocked(false); }
      }, 900);
    }, 1200);
  };

  const avatarLetters = useMemo(() => playerName.slice(0, 2).toUpperCase(), [playerName]);
  return (
    <main className="game-shell">
      <header className="game-topbar">
        <button className="back-button" onClick={onExit}><ArrowLeft size={19} /> ლობი</button><Logo compact />
        <div className="round-counter">ხელი <strong>{Math.min(round, 7)}</strong>/7</div>
      </header>
      <section className="game-stage">
        <div className="scoreboard"><span>შენ <strong>{score.you}</strong></span><i /><span>მეტოქეები <strong>{score.bots}</strong></span></div>
        <div className="opponent opponent--top"><div className="avatar avatar--violet"><Bot size={19} /></div><span>მარი</span><small>6 კარტი</small></div>
        <div className="opponent opponent--left"><div className="avatar avatar--blue">ნ</div><span>ნიკა</span><small>6 კარტი</small></div>
        <div className="opponent opponent--right"><div className="avatar avatar--coral">ლ</div><span>ლუკა</span><small>6 კარტი</small></div>
        <div className="table-center">
          <div className="message-pill">{message}</div>
          <div className="played-cards">{tableCards.map((item, index) => <div className={`played-card played-card--${index}`} key={`${item.name}-${item.card.id}`}><CardFace card={item.card} small /><span>{item.name}</span></div>)}</div>
        </div>
        <div className="player-zone">
          <div className="player-label"><div className="avatar avatar--player">{avatarLetters}</div><div><strong>{playerName}</strong><small>შენი სვლა</small></div></div>
          <div className="hand" aria-label="შენი კარტები">{hand.map((card) => <button key={card.id} onClick={() => playCard(card)} disabled={locked} aria-label={`${card.rank} ${card.suit}`}><CardFace card={card} /></button>)}</div>
        </div>
        {finished && <div className="result-backdrop"><section className="result-card">
          <div className="trophy"><Trophy size={32} /></div><span className="eyebrow">პარტია დასრულდა</span>
          <h2>{score.you >= 4 ? "გილოცავ, შენ მოიგე!" : "კარგი თამაში იყო"}</h2><p>საბოლოო ანგარიში <strong>{score.you} : {score.bots}</strong></p>
          <button className="primary-button" onClick={startGame}><RotateCcw size={18} /> ხელახლა თამაში</button><button className="text-button" onClick={onExit}>ლობიში დაბრუნება</button>
        </section></div>}
      </section>
    </main>
  );
}

export default function CardoraGame() {
  const [screen, setScreen] = useState<"lobby" | "game">("lobby");
  const [showAuth, setShowAuth] = useState(false);
  const [playerName, setPlayerName] = useState("სტუმარი");
  const continueToGame = (mode: AuthMode) => {
    setPlayerName(mode === "google" ? "Google Player" : mode === "facebook" ? "Facebook Player" : "სტუმარი");
    setShowAuth(false); setScreen("game");
  };
  return <>{screen === "lobby" ? <Lobby onPlay={() => setShowAuth(true)} /> : <Game playerName={playerName} onExit={() => setScreen("lobby")} />}{showAuth && <AuthModal onClose={() => setShowAuth(false)} onContinue={continueToGame} />}</>;
}
