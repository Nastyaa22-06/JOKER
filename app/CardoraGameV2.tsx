"use client";

import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { Avatar as DiceAvatar, Style as DiceStyle } from "@dicebear/core";
import avatarDefinition from "@dicebear/styles/avataaars.json" with { type: "json" };
import { ArrowLeft, BookOpen, CheckCircle2, ChevronDown, ChevronRight, ClipboardList, Coins, Crown, Dices, Globe2, KeyRound, Lock, LogOut, Mail, Maximize2, MessageCircle, Minimize2, Palette, Plus, RotateCcw, Send, Sparkles, UserRound, UsersRound, Volume2, VolumeX, X, Zap } from "lucide-react";

type Suit = "♠" | "♥" | "♦" | "♣";
type Theme = "purple" | "blue" | "green" | "red" | "custom";
type Lang = "ka" | "en";
type GameMode = "full" | "nines4" | "nines2";
type Card = { id: string; suit: Suit | "★"; rank: string; value: number; joker?: boolean };
type Played = { player: number; card: Card; jokerMode?: "high" | "low"; calledSuit?: Suit };
type Phase = "choosing-trump" | "revealing" | "bidding" | "playing" | "hand-over" | "game-over";
type AuthMode = "google" | "facebook" | "email" | "guest";
type Auth0Config = { domain: string; clientId: string; emailConnection: string };
type EconomyResult = { coins: number; delta: number; tier: number };
type AvatarGender = "woman" | "man" | "neutral";
type AvatarFaceShape = "oval" | "round" | "angular" | "soft";
type AvatarEyes = "round" | "bright" | "calm" | "bold" | "wink" | "dreamy";
type AvatarNose = "small" | "soft" | "straight" | "button" | "fine" | "rounded";
type AvatarHair = "short" | "wave" | "long" | "curls" | "bun" | "braids" | "afro" | "frida" | "bob" | "ponytail" | "pixie" | "locs";
type AvatarHairColor = "ink" | "brown" | "gold" | "copper" | "blue" | "pink";
type AvatarGlasses = "none" | "round" | "square" | "sun";
type AvatarClothes = "blazerShirt" | "blazerSweater" | "collarSweater" | "graphicTee" | "hoodie" | "overall" | "crew" | "scoop" | "vneck" | "kimono" | "chokha";
type AvatarTheme = "classic" | "japanese" | "street" | "royal";
type AvatarAccessory = "none" | "flower" | "crown" | "cat" | "star" | "bow";
type AvatarHat = "none" | "cap" | "beanie" | "turban" | "hijab" | "kasa" | "papakha" | "crown";
type AvatarFacialHair = "none" | "stubble" | "beard" | "moustache";
type AvatarMouth = "smile" | "soft" | "confident" | "surprised" | "grin" | "serious";
type AvatarBrows = "natural" | "bold" | "soft" | "arched" | "straight" | "lifted";
type AvatarPattern = "plain" | "floral" | "botanical" | "diamond";
type AvatarEarrings = "none" | "stud" | "hoop" | "drop";
type AvatarStyle = { seed: string; skin: string; gender: AvatarGender; face: AvatarFaceShape; eyes: AvatarEyes; nose: AvatarNose; hair: AvatarHair; hairColor: AvatarHairColor; glasses: AvatarGlasses; earrings: AvatarEarrings; freckles: boolean; clothes: AvatarClothes; clothesColor: string; clothesPattern: AvatarPattern; mouth: AvatarMouth; brows: AvatarBrows; style: AvatarTheme; accessory: AvatarAccessory; hat: AvatarHat; facialHair: AvatarFacialHair };
type Message = { key: "chooseBid" | "chooseTrump" | "waitingTrump" | "reviewCards" | "yourTurn" | "playerStarts" | "playerPlays" | "youTake" | "playerTakes" | "handOver"; player?: number };
type ChatMessage = { id: number; player: number; text: string };
type RoomSummary = { id: number; code: string; name: string; visibility: "public" | "private"; mode: GameMode; playerCount: number };

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const MODE_HANDS: Record<GameMode, number[]> = {
  full: [1,2,3,4,5,6,7,8, 9,9,9,9, 8,7,6,5,4,3,2,1, 9,9,9,9],
  nines4: [9,9,9,9],
  nines2: [9,9],
};
const THEMES: Exclude<Theme, "custom">[] = ["blue", "purple", "green", "red"];
const AD_EMAIL_HREF = "mailto:anastasia.ioselianii@yahoo.com?subject=JOKER%20advertising%20inquiry";

const UI = {
  ka: {
    you: "შენ", lobby: "ლობი", rules: "წესები", signIn: "შესვლა", games: "თამაშები", online: "ონლაინ მოთამაშე",
    club: "ქართული ონლაინ თამაში", start: "თამაშის დაწყება", soon: "მალე", activeTables: "აქტიური მოთამაშე",
    playOnly: "მხოლოდ play-money გასართობი თამაში", profile: "მოთამაშის პროფილი", enterGame: "თამაშში შესვლა",
    enterCopy: "შედი Google-ით, Facebook-ით ან ელფოსტით — ან გააგრძელე სტუმრად და პირდაპირ გამოცადე თამაში.", or: "ან", guest: "სტუმრად გაგრძელება",
    authDemo: "ანგარიშის კარიბჭე აქტიურია; სრულ გაშვებამდე საჭიროა ოფიციალური OAuth კავშირის დამატება.", color: "ეკრანის ფერი",
    theme: { purple: "მუქი იასამნისფერი", blue: "მუქი ლურჯი", green: "მუქი მწვანე", red: "ბორდოსფერი" },
    scoreTable: "ქულების ცხრილი", collapseTable: "ცხრილის შემცირება", expandTable: "სრული ცხრილის ნახვა",
    firstHand: "პირველი დარიგება მიმდინარეობს", set: "სეტი", hand: "ხელი", cards: "კარტი", trump: "კოზირი",
    none: "—", noTrump: "ბეზი", bid: "ფსონი", took: "აიღო", take: "აიღე", points: "ქულა",
    lastFour: "ბოლო 4 კარტი", player: "მოთამაშე", pass: "პასი", turn: "სვლა",
    chooseBid: "აირჩიე ფსონი", chooseTrump: "აირჩიე კოზირი", waitingTrump: "ირჩევს კოზირს", reviewCards: "კოზირი გამოცხადდა — ნახე ყველა კარტი", yourTurn: "შენი სვლაა",
    starts: "იწყებს", plays: "თამაშობს", takesHand: "იღებს ხელს", youTake: "შენ იღებ ხელს", handOver: "დარიგება დასრულდა",
    jokerChoice: "ჯოკერის არჩევანი", leadJoker: "რა გამოაცხადო?", followJoker: "როგორ ითამაშებ?",
    high: "მაღალი", letTake: "წაიღოს", jokerIt: "მოჯოკრა", under: "ნიჟე", callSuit: "გამოაცხადე მასტი",
    highHint: "ყველა დებს არჩეული მასტის უმაღლეს კარტს; ვისაც არ აქვს, კოზირს დებს და უმაღლესი კოზირი იღებს.",
    letTakeHint: "ყველა მიჰყვება არჩეულ მასტს და მისი უმაღლესი კარტი იღებს ხელს.",
    dealFinished: "დარიგება", nextDeal: "შემდეგი დარიგება იწყება…", gameFinished: "პარტია დასრულდა",
    finalResult: "საბოლოო შედეგი", newGame: "ახალი პარტია", lastTrick: "ბოლო გათამაშებული ხელი", takesFour: "იღებს ოთხ კარტს",
    sound: "ხმა", hurry: "იჩქარე!", what: "რას აკეთებ?!", goodJob: "ყოჩაღ", premium: "პრემია", premiumWon: "პრემია მოიგო",
    time: "დრო", exact: "ზუსტად", failed: "ვეღარ ასრულებს", winner: "ხელის გამარჯვებული", chooseMode: "აირჩიე რეჟიმი",
    chat: "ჩატი", chatPlaceholder: "დაწერე შეტყობინება…", send: "გაგზავნა", bidScore: "ნათქვამი · ქულა", stuffing: "შეტენვა", snatching: "წაგლეჯვა",
    publicTables: "საჯარო თამაში", privateTables: "პირადი მაგიდა", createTable: "პირადი მაგიდის შექმნა", join: "შესვლა",
    openSeats: "თავისუფალი ადგილი", tableCode: "მაგიდის კოდი", password: "პაროლი", tableName: "მაგიდის სახელი",
    noTables: "ღია მაგიდა ჯერ არ არის", shareCode: "გაუზიარე ეს კოდი და პაროლი მოთამაშეებს", enterTable: "მაგიდაზე გადასვლა",
    adSpace: "რეკლამა JOKER-ზე", advertise: "განათავსე რეკლამა", adCopy: "განათავსე რეკლამა",
    chooseSeat: "აირჩიე თავისუფალი ადგილი", waitingPlayers: "ველოდებით მოთამაშეებს", tableFull: "მაგიდა შეივსო — თამაში იწყება", standUp: "ადგომა", backToCards: "კარტებთან დაბრუნება",
    expandChat: "ჩატის გაშლა", collapseChat: "ჩატის დაკეცვა", signedIn: "შესული ხარ", banTitle: "დროებითი ბლოკი", banCopy: "თამაში დასრულებამდე დატოვე. შენს ადგილას ძლიერი ბოტი ჩაერთო.", banRemaining: "დარჩა", chooseAvatar: "შექმენი შენი ავატარი", skin: "კანის ფერი", features: "სტილი", gender: "სქესი", face: "სახის ფორმა", eyes: "თვალები", nose: "ცხვირი", hair: "თმა", hairColor: "თმის ფერი", glasses: "სათვალე", clothes: "ტანსაცმელი", avatarStyle: "თემატური სტილი", accessory: "აქსესუარი", hat: "ქუდი", facialHair: "წვერი და ულვაში", randomize: "ახალი სახე", avatarEngine: "DiceBear Avataaars · ზუსტად მორგებული", bidTookScore: "ნათქვამი · ქულა", profileSaved: "პროფილი ავტომატურად ინახება",
  },
  en: {
    you: "You", lobby: "Lobby", rules: "Rules", signIn: "Sign in", games: "Games", online: "players online",
    club: "Georgian online game", start: "Start game", soon: "Soon", activeTables: "active players",
    playOnly: "Play-money entertainment only", profile: "Player profile", enterGame: "Enter the game",
    enterCopy: "Sign in with Google, Facebook, or email — or continue as a guest and start testing immediately.", or: "or", guest: "Continue as guest",
    authDemo: "The account gate is active; official OAuth connection is still required before launch.", color: "Table color",
    theme: { purple: "Dark purple", blue: "Dark blue", green: "Dark green", red: "Burgundy pink" },
    scoreTable: "Score table", collapseTable: "Collapse table", expandTable: "View full table",
    firstHand: "First deal in progress", set: "Set", hand: "Deal", cards: "cards", trump: "Trump",
    none: "None", noTrump: "No trump", bid: "Bid", took: "Won", take: "Won", points: "points",
    lastFour: "Last 4 cards", player: "Player", pass: "Pass", turn: "TURN",
    chooseBid: "Choose your bid", chooseTrump: "Choose trump", waitingTrump: "is choosing trump", reviewCards: "Trump announced — view your full hand", yourTurn: "Your turn",
    starts: "leads", plays: "is playing", takesHand: "takes the trick", youTake: "You take the trick", handOver: "Deal finished",
    jokerChoice: "Joker choice", leadJoker: "What do you call?", followJoker: "How will you play it?",
    high: "Highest", letTake: "Let them take", jokerIt: "Joker it", under: "Under", callSuit: "Choose a suit",
    highHint: "Everyone plays their highest card of the chosen suit; without it they must play trump, and the highest trump takes it.",
    letTakeHint: "Everyone follows the chosen suit and its highest card takes the trick.",
    dealFinished: "Deal", nextDeal: "Next deal starts automatically…", gameFinished: "Game finished",
    finalResult: "Final result", newGame: "New game", lastTrick: "Last played trick", takesFour: "takes the four cards",
    sound: "Sound", hurry: "Hurry up!", what: "What are you doing?!", goodJob: "Good job!", premium: "Perfect Game", premiumWon: "earned Perfect Game",
    time: "Time", exact: "On target", failed: "Cannot make bid", winner: "Trick winner", chooseMode: "Choose a mode",
    chat: "Table chat", chatPlaceholder: "Write a message…", send: "Send", bidScore: "Bid · score", stuffing: "extra in play", snatching: "over the limit",
    publicTables: "Public game", privateTables: "Private table", createTable: "Create private table", join: "Join",
    openSeats: "open seats", tableCode: "Table code", password: "Password", tableName: "Table name",
    noTables: "No open tables yet", shareCode: "Share this code and password with your players", enterTable: "Enter table",
    adSpace: "Advertising space", advertise: "Advertise here", adCopy: "Put your brand in front of JOKER players",
    chooseSeat: "Choose an empty seat", waitingPlayers: "Waiting for players", tableFull: "Table full — game starting", standUp: "Stand up", backToCards: "Back to cards",
    expandChat: "Expand chat", collapseChat: "Collapse chat", signedIn: "Signed in", banTitle: "Temporary game ban", banCopy: "You left before the game ended. A strong bot took your seat.", banRemaining: "Time remaining", chooseAvatar: "Build your avatar", skin: "Skin tone", features: "Style", gender: "Gender", face: "Face shape", eyes: "Eyes", nose: "Nose", hair: "Hair", hairColor: "Hair colour", glasses: "Glasses", clothes: "Clothes", avatarStyle: "Theme", accessory: "Accessory", hat: "Hat", facialHair: "Beard & moustache", randomize: "New face", avatarEngine: "DiceBear Avataaars · fully fitted", bidTookScore: "Bid · points", profileSaved: "Profile saves automatically",
  },
} as const;

function setBounds(mode: GameMode, handIndex: number) {
  if (mode !== "full") return { start: 0, end: MODE_HANDS[mode].length - 1, number: 1, total: 1 };
  if (handIndex < 8) return { start: 0, end: 7, number: 1, total: 4 };
  if (handIndex < 12) return { start: 8, end: 11, number: 2, total: 4 };
  if (handIndex < 20) return { start: 12, end: 19, number: 3, total: 4 };
  return { start: 20, end: 23, number: 4, total: 4 };
}

const BOT_NAME_POOLS = [
  [],
  [{ ka: "გიორგი", en: "Giorgi" }, { ka: "ლუკა", en: "Luka" }, { ka: "ნიკა", en: "Nika" }, { ka: "სანდრო", en: "Sandro" }, { ka: "ირაკლი", en: "Irakli" }, { ka: "დათა", en: "Data" }],
  [{ ka: "ნინო", en: "Nino" }, { ka: "მარიამი", en: "Mariam" }, { ka: "თამარი", en: "Tamari" }, { ka: "სალომე", en: "Salome" }, { ka: "ანა", en: "Ana" }, { ka: "ელენე", en: "Elene" }],
  [{ ka: "საბა", en: "Saba" }, { ka: "თეკლა", en: "Tekla" }, { ka: "ანდრია", en: "Andria" }, { ka: "ლიზა", en: "Liza" }, { ka: "ალექსი", en: "Alexi" }, { ka: "ქეთი", en: "Keti" }],
] as const;

function playerNames(lang: Lang, choices: number[] = [0, 0, 0]) {
  return [UI[lang].you, ...([1,2,3] as const).map((player, index) => BOT_NAME_POOLS[player][choices[index] % BOT_NAME_POOLS[player].length][lang])];
}

const HAND_SUIT_ORDER: Record<Card["suit"], number> = { "♥": 0, "♦": 1, "♣": 2, "♠": 3, "★": 4 };
function groupedHand(cards: Card[]) {
  return [...cards].sort((a, b) => HAND_SUIT_ORDER[a.suit] - HAND_SUIT_ORDER[b.suit] || b.value - a.value);
}

function messageText(message: Message, lang: Lang, names = playerNames(lang)) {
  const copy = UI[lang];
  if (message.key === "playerStarts") return `${names[message.player ?? 1]} ${copy.starts}`;
  if (message.key === "playerPlays") return `${names[message.player ?? 1]} ${copy.plays}`;
  if (message.key === "playerTakes") return `${names[message.player ?? 1]} ${copy.takesHand}`;
  if (message.key === "waitingTrump") return `${names[message.player ?? 1]} ${copy.waitingTrump}`;
  return copy[message.key];
}

function bidBalance(cards: number, bids: (number | null)[], lang: Lang) {
  if (bids.some((bid) => bid === null)) return null;
  const difference = cards - bids.reduce<number>((sum, bid) => sum + (bid ?? 0), 0);
  if (difference > 0) return { kind: "stuffing", value: difference, text: lang === "ka" ? `შეტენვა ${difference}` : `${difference} extra in play` };
  if (difference < 0) return { kind: "snatching", value: Math.abs(difference), text: lang === "ka" ? `წაგლეჯვა ${Math.abs(difference)}` : `${Math.abs(difference)} over the limit` };
  return { kind: "blocked", value: 0, text: lang === "ka" ? "ჯამი დაემთხვა — ბოლო მოთამაშემ შეცვალოს" : "Exact total — the final bidder must change" };
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeDeck(): Card[] {
  const ranks = [["6",6],["7",7],["8",8],["9",9],["10",10],["J",11],["Q",12],["K",13],["A",14]] as const;
  const deck: Card[] = SUITS.flatMap((suit) => ranks
    .filter(([rank]) => !(rank === "6" && (suit === "♠" || suit === "♣")))
    .map(([rank,value]) => ({ id: `${suit}-${rank}`, suit, rank, value })));
  deck.push(
    { id: "joker-sky", suit: "★", rank: "JOKER", value: 20, joker: true },
    { id: "joker-gold", suit: "★", rank: "JOKER", value: 20, joker: true },
  );
  return shuffle(deck);
}

function dealHand(count: number, handIndex: number, firstDealer: number) {
  const deck = makeDeck();
  const dealer = (firstDealer + handIndex) % 4;
  const hands: Card[][] = [[],[],[],[]];
  let cursor = 0;
  for (let round = 0; round < count; round++) {
    for (let offset = 1; offset <= 4; offset++) {
      const player = (dealer + offset) % 4;
      hands[player].push(deck[cursor++]);
    }
  }
  const indicator = count === 9 ? null : deck[cursor];
  const trump = indicator?.joker ? null : (indicator?.suit as Suit);
  return { hands, dealer, indicator, trump };
}

function biddingOrder(dealer: number) {
  return [1,2,3,4].map((step) => (dealer + step) % 4);
}

function estimatedBid(hand: Card[], trump: Suit | null, excluded?: number) {
  const suitCounts = Object.fromEntries(SUITS.map((suit) => [suit, hand.filter((card) => !card.joker && card.suit === suit).length])) as Record<Suit, number>;
  let strength = hand.filter((card) => card.joker).length * .94;
  hand.filter((card) => !card.joker).forEach((card) => {
    const isTrump = trump !== null && card.suit === trump;
    const support = suitCounts[card.suit as Suit];
    if (isTrump) strength += card.value === 14 ? .92 : card.value === 13 ? .72 : card.value === 12 ? .5 : card.value === 11 ? .34 : card.value >= 9 ? .2 : .1;
    else strength += card.value === 14 ? .72 : card.value === 13 ? (support <= 2 ? .34 : .48) : card.value === 12 ? .19 : card.value === 11 && support >= 3 ? .1 : 0;
  });
  if (trump) {
    const trumpCount = suitCounts[trump];
    const voids = SUITS.filter((suit) => suit !== trump && suitCounts[suit] === 0).length;
    strength += Math.max(0, trumpCount - 2) * .16 + Math.min(voids, trumpCount) * .12;
  }
  // Small confidence variation prevents identical hands from producing a mechanical pattern.
  const preferred = Math.max(0, Math.min(hand.length, Math.round(strength + (Math.random() - .5) * .5)));
  if (preferred !== excluded) return preferred;
  const alternatives = [preferred - 1, preferred + 1].filter((value) => value >= 0 && value <= hand.length && value !== excluded);
  return alternatives.length === 1 ? alternatives[0] : alternatives[Math.random() < .58 ? 0 : 1];
}

function initialBotBids(dealer: number, count: number, hands: Card[][], trump: Suit | null) {
  const bids: (number | null)[] = [null,null,null,null];
  for (const player of biddingOrder(dealer)) {
    if (player === 0) break;
    const sum = bids.reduce<number>((total, bid) => total + (bid ?? 0), 0);
    const excluded = player === dealer ? count - sum : undefined;
    bids[player] = estimatedBid(hands[player], trump, excluded);
  }
  return bids;
}

function completeBids(partial: (number | null)[], playerBid: number, dealer: number, count: number, hands: Card[][], trump: Suit | null) {
  const bids = [...partial];
  bids[0] = playerBid;
  let afterPlayer = false;
  for (const player of biddingOrder(dealer)) {
    if (player === 0) { afterPlayer = true; continue; }
    if (!afterPlayer || bids[player] !== null) continue;
    const sum = bids.reduce<number>((total, bid) => total + (bid ?? 0), 0);
    const excluded = player === dealer ? count - sum : undefined;
    bids[player] = estimatedBid(hands[player], trump, excluded);
  }
  return bids as number[];
}

function ledSuit(table: Played[]): Suit | null {
  if (!table.length) return null;
  return table[0].card.joker ? (table[0].calledSuit ?? null) : table[0].card.suit as Suit;
}

function legalCards(hand: Card[], table: Played[], trump: Suit | null) {
  if (!table.length) return hand;
  const lead = ledSuit(table);
  const jokerLead = table[0].card.joker;
  if (jokerLead) {
    const jokers = hand.filter((card) => card.joker);
    const calledCards = hand.filter((card) => !card.joker && card.suit === lead);
    if (calledCards.length) {
      if (table[0].jokerMode === "low") return [...calledCards, ...jokers];
      const highest = Math.max(...calledCards.map((card) => card.value));
      return [...calledCards.filter((card) => card.value === highest), ...jokers];
    }
    const trumpCards = trump ? hand.filter((card) => !card.joker && card.suit === trump) : [];
    if (trumpCards.length) return [...trumpCards, ...jokers];
    return hand;
  }
  const follow = hand.filter((card) => card.joker || card.suit === lead);
  if (hand.some((card) => !card.joker && card.suit === lead)) return follow;
  if (trump && hand.some((card) => !card.joker && card.suit === trump)) {
    return hand.filter((card) => card.joker || card.suit === trump);
  }
  return hand;
}

function trickWinner(table: Played[], trump: Suit | null) {
  const lead = ledSuit(table);
  const highJokers = table.filter((played) => played.card.joker && played.jokerMode !== "low");
  const first = table[0];
  if (highJokers.length) {
    // When a high Joker leads and someone cannot follow the called suit, a forced trump wins.
    if (first.card.joker && first.jokerMode === "high" && highJokers.length === 1 && trump && lead !== trump) {
      const forcedTrumps = table.filter((played) => !played.card.joker && played.card.suit === trump);
      if (forcedTrumps.length) return forcedTrumps.reduce((best, item) => item.card.value > best.card.value ? item : best).player;
    }
    return highJokers[highJokers.length - 1].player;
  }
  if (first.card.joker && first.jokerMode === "low") {
    const calledCards = table.filter((played) => !played.card.joker && played.card.suit === lead);
    const ordinaryCards = table.filter((played) => !played.card.joker);
    const candidates = calledCards.length ? calledCards : ordinaryCards;
    if (candidates.length) return candidates.reduce((best, item) => item.card.value > best.card.value ? item : best).player;
  }
  const trumps = trump ? table.filter((played) => !played.card.joker && played.card.suit === trump) : [];
  if (trumps.length) return trumps.reduce((best, item) => item.card.value > best.card.value ? item : best).player;
  const leadCards = table.filter((played) => !played.card.joker && played.card.suit === lead);
  if (leadCards.length) return leadCards.reduce((best, item) => item.card.value > best.card.value ? item : best).player;
  return first.player;
}

function scoreHand(bid: number, won: number, cards: number, khishtiPenalty: -200 | -500 = -200) {
  if (bid === won && bid === cards) return bid * 100;
  if (bid === won) return bid * 50 + 50;
  if (bid > 0 && won === 0) return khishtiPenalty;
  return won * 10;
}

function formatScore(value: number, signed = false) {
  return `${signed && value > 0 ? "+" : ""}${(value / 100).toFixed(1)}`;
}

function applyPremium(history: number[][], exactHistory: boolean[][], start: number, end: number) {
  const adjusted = history.map((row) => [...row]);
  const premiumPlayers = [0,1,2,3].filter((player) => exactHistory.slice(start, end + 1).every((row) => row?.[player]));
  if (!premiumPlayers.length) return { history: adjusted, premiumPlayers };
  const highestRow = (player: number) => {
    let best = start;
    for (let row = start + 1; row <= end; row++) if (adjusted[row][player] > adjusted[best][player]) best = row;
    return best;
  };
  [0,1,2,3].forEach((player) => {
    const row = highestRow(player);
    if (premiumPlayers.length === 1 && premiumPlayers[0] === player) adjusted[row][player] *= 2;
    else if (!premiumPlayers.includes(player)) adjusted[row][player] = 0;
  });
  return { history: adjusted, premiumPlayers };
}

function historyTotals(history: number[][]) {
  return [0,1,2,3].map((player) => history.reduce((sum, row) => sum + (row[player] ?? 0), 0));
}

type BotMove = { card: Card; mode: "high" | "low"; suit?: Suit };

function chooseAmong<T>(items: T[], score: (item: T) => number, tolerance = 1.25) {
  const ranked = items.map((item) => ({ item, score: score(item) })).sort((a, b) => b.score - a.score);
  const nearBest = ranked.filter((entry) => ranked[0].score - entry.score <= tolerance).slice(0, 3);
  return nearBest[Math.floor(Math.random() * nearBest.length)].item;
}

function chooseBotMove(player: number, hand: Card[], table: Played[], trump: Suit | null, bid: number, won: number): BotMove | null {
  const legal = legalCards(hand, table, trump);
  if (!legal.length) return null;
  const needed = Math.max(0, bid - won);
  const remaining = hand.length;
  const urgency = remaining ? needed / remaining : 0;
  const wantsTrick = needed > 0;
  const strength = (card: Card) => card.joker ? 80 : card.value + (trump && card.suit === trump ? 22 : 0);
  const modeFor = (card: Card) => card.joker && !wantsTrick ? "low" as const : "high" as const;
  const wouldWin = (card: Card, mode = modeFor(card)) => trickWinner([...table, { player, card, ...(card.joker ? { jokerMode: mode } : {}) }], trump) === player;

  if (!table.length) {
    const nonJokers = legal.filter((card) => !card.joker);
    if (!wantsTrick) {
      const pool = nonJokers.length ? nonJokers : legal;
      const card = chooseAmong(pool, (candidate) => {
        const trumpCost = trump && candidate.suit === trump ? 18 : 0;
        return candidate.joker ? 100 : 28 - candidate.value - trumpCost;
      });
      return { card, mode: card.joker ? "low" : "high", suit: card.joker ? (trump ?? SUITS[Math.floor(Math.random() * SUITS.length)]) : undefined };
    }

    // Preserve a Joker while there is enough ordinary strength left to meet the target.
    const canSaveJoker = nonJokers.length > 0 && remaining > 2 && urgency < .76;
    const pool = canSaveJoker ? nonJokers : legal;
    const card = chooseAmong(pool, (candidate) => {
      const topCard = candidate.value >= 13 ? 5 : 0;
      const trumpLead = trump && candidate.suit === trump ? (urgency > .55 ? 5 : -2) : 0;
      return strength(candidate) + topCard + trumpLead - (candidate.joker && canSaveJoker ? 70 : 0);
    }, 2.2);
    // Calling trump protects a leading high Joker from an opponent's forced trump.
    const suit = card.joker ? (trump ?? chooseAmong(SUITS, (candidate) => hand.filter((held) => held.suit === candidate).length, .1)) : undefined;
    return { card, mode: "high", suit };
  }

  const ordinaryWinners = legal.filter((card) => !card.joker && wouldWin(card));
  const jokerWinners = legal.filter((card) => card.joker && wouldWin(card, "high"));
  if (wantsTrick && (ordinaryWinners.length || jokerWinners.length)) {
    const jokerIsJustified = remaining <= 2 || urgency >= .72 || needed >= remaining;
    const pool = ordinaryWinners.length && !jokerIsJustified ? ordinaryWinners : [...ordinaryWinners, ...jokerWinners];
    const card = chooseAmong(pool, (candidate) => 90 - strength(candidate) - (candidate.joker && !jokerIsJustified ? 80 : 0), 1.8);
    return { card, mode: "high" };
  }

  const losing = legal.filter((card) => card.joker ? !wouldWin(card, "low") : !wouldWin(card));
  if (losing.length) {
    // If the trick is already lost, shed a dangerous high non-trump card but keep control cards for later.
    const card = chooseAmong(losing, (candidate) => {
      if (candidate.joker) return -100;
      const trumpCost = trump && candidate.suit === trump ? 24 : 0;
      return candidate.value - trumpCost;
    }, 1.6);
    return { card, mode: card.joker ? "low" : "high" };
  }

  // A forced win: spend the cheapest legal control card.
  const card = chooseAmong(legal, (candidate) => 70 - strength(candidate) - (candidate.joker && remaining > 1 ? 35 : 0), 1.4);
  return { card, mode: card.joker && !wantsTrick ? "low" : "high" };
}

const CARD_FILE_RANKS = ["6", "7", "8", "9", "10", "j", "q", "k", "a"] as const;
const CARD_FILE_SUITS = ["s", "h", "d", "c"] as const;
const preloadedCardAssets = new Set<string>();

function preloadCardAssets() {
  if (typeof window === "undefined") return;
  const urls = [
    "/card-sprites/blue.webp",
    "/card-sprites/green.webp",
    "/cards/joker-modern.webp",
    ...THEMES.map((theme) => `/card-backs/${theme}-full-v2.webp`),
  ];
  urls.forEach((url) => {
    if (preloadedCardAssets.has(url)) return;
    preloadedCardAssets.add(url);
    const image = new Image();
    image.decoding = "sync";
    image.loading = "eager";
    image.fetchPriority = "high";
    image.src = url;
  });
}

function CardFace({ card, theme = "purple", small = false, hidden = false }: { card: Card; theme?: Theme; small?: boolean; hidden?: boolean }) {
  const activeTheme = theme === "custom" ? "purple" : theme;
  if (hidden) return <div className={`v2-card v2-card-back ${small ? "v2-card-small" : ""}`} aria-hidden="true">
    <img className={`v2-back-art back-${activeTheme}`} src={`/card-backs/${activeTheme}-full-v2.webp`} alt="" draggable={false} loading="eager" decoding="sync" fetchPriority="high" />
  </div>;
  if (card.joker) return <div className={`v2-card v2-joker-card ${small ? "v2-card-small" : ""} ${card.id === "joker-sky" ? "joker-sky" : "joker-gold"}`}><img className="v2-joker-art" src="/cards/joker-modern.webp" alt="Joker" loading="eager" decoding="sync" fetchPriority="high" /></div>;
  const red = card.suit === "♥" || card.suit === "♦";
  const rankCode = card.rank === "A" ? "a" : card.rank === "J" ? "j" : card.rank === "Q" ? "q" : card.rank === "K" ? "k" : card.rank;
  const suitCode = card.suit === "♥" ? "h" : card.suit === "♦" ? "d" : card.suit === "♣" ? "c" : "s";
  const spriteIndex = CARD_FILE_SUITS.indexOf(suitCode as (typeof CARD_FILE_SUITS)[number]) * CARD_FILE_RANKS.length + CARD_FILE_RANKS.indexOf(rankCode as (typeof CARD_FILE_RANKS)[number]);
  const spriteColumn = spriteIndex % 6;
  const spriteRow = Math.floor(spriteIndex / 6);
  const spriteStyle = {
    "--sprite-image": `url(/card-sprites/${theme === "green" ? "green" : "blue"}.webp)`,
    "--sprite-x": `${spriteColumn * 20}%`,
    "--sprite-y": `${spriteRow * 20}%`,
  } as CSSProperties;
  return <div className={`v2-card v2-modern-card v2-card-sprite ${small ? "v2-card-small" : ""} ${red ? "red" : "black"}`} style={spriteStyle} aria-label={`${card.rank} ${card.suit}`} />;
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <div className={`v2-brand ${compact ? "compact" : ""}`} aria-label="JOKER"><span><img src="/brand/jokera-logo.jpg" alt="" /></span><b>JOKER</b></div>;
}

const AVATAR_SKINS = ["#f5d0b5", "#e7b98d", "#c98b61", "#965d3d", "#603a2b"];
const AVATAR_GENDERS: AvatarGender[] = ["woman", "man", "neutral"];
const AVATAR_FACES: AvatarFaceShape[] = ["oval", "round", "angular", "soft"];
const AVATAR_EYES: AvatarEyes[] = ["round", "bright", "calm", "bold", "wink", "dreamy"];
const AVATAR_NOSES: AvatarNose[] = ["small", "soft", "straight", "button", "fine", "rounded"];
const AVATAR_HAIR: AvatarHair[] = ["short", "wave", "long", "curls", "bun", "braids", "afro", "frida", "bob", "ponytail", "pixie", "locs"];
const AVATAR_HAIR_COLORS: AvatarHairColor[] = ["ink", "brown", "gold", "copper", "blue", "pink"];
const AVATAR_GLASSES: AvatarGlasses[] = ["none", "round", "square", "sun"];
const AVATAR_CLOTHES: AvatarClothes[] = ["blazerShirt", "blazerSweater", "collarSweater", "graphicTee", "hoodie", "overall", "crew", "scoop", "vneck", "kimono", "chokha"];
const AVATAR_STYLES: AvatarTheme[] = ["classic", "japanese", "street", "royal"];
const AVATAR_ACCESSORIES: AvatarAccessory[] = ["none", "flower", "crown", "cat", "star", "bow"];
const AVATAR_HATS: AvatarHat[] = ["none", "cap", "beanie", "turban", "hijab", "kasa", "papakha", "crown"];
const AVATAR_FACIAL_HAIR: AvatarFacialHair[] = ["none", "stubble", "beard", "moustache"];
const AVATAR_MOUTHS: AvatarMouth[] = ["smile", "soft", "confident", "surprised", "grin", "serious"];
const AVATAR_BROWS: AvatarBrows[] = ["natural", "bold", "soft", "arched", "straight", "lifted"];
const AVATAR_EARRINGS: AvatarEarrings[] = ["none", "stud", "hoop", "drop"];
const AVATAR_PATTERNS: AvatarPattern[] = ["plain", "floral", "botanical", "diamond"];
const AVATAR_CLOTHES_COLORS = ["#263e8a", "#7b2d45", "#356859", "#a65f36", "#6d46d7", "#d09a3a", "#252936", "#d98aa4"];
const DEFAULT_AVATAR: AvatarStyle = { seed: "joker-player", skin: "#c98b61", gender: "woman", face: "oval", eyes: "bright", nose: "soft", hair: "wave", hairColor: "brown", glasses: "none", earrings: "none", freckles: false, clothes: "blazerShirt", clothesColor: "#263e8a", clothesPattern: "plain", mouth: "smile", brows: "natural", style: "classic", accessory: "none", hat: "none", facialHair: "none" };
const AVATAR_PRESETS: { key: string; avatar: Partial<AvatarStyle> }[] = [
  { key: "Kartli", avatar: { gender: "man", face: "angular", eyes: "bold", hair: "short", hairColor: "ink", earrings: "none", freckles: false, clothes: "chokha", clothesColor: "#252936", clothesPattern: "plain", mouth: "confident", brows: "bold", style: "royal", hat: "papakha", facialHair: "beard" } },
  { key: "Kyoto", avatar: { gender: "woman", face: "round", eyes: "calm", hair: "bun", hairColor: "brown", earrings: "none", freckles: false, clothes: "kimono", clothesColor: "#a93752", clothesPattern: "plain", mouth: "soft", brows: "arched", style: "japanese", accessory: "flower", hat: "kasa", facialHair: "none" } },
  { key: "Neon", avatar: { gender: "neutral", face: "soft", eyes: "bright", hair: "afro", hairColor: "blue", glasses: "sun", clothes: "hoodie", clothesColor: "#6d46d7", clothesPattern: "plain", mouth: "smile", brows: "soft", style: "street", accessory: "star", hat: "beanie" } },
  { key: "Hippie", avatar: { gender: "woman", face: "oval", eyes: "dreamy", hair: "long", hairColor: "copper", earrings: "hoop", freckles: true, clothes: "vneck", clothesColor: "#356859", clothesPattern: "floral", mouth: "smile", brows: "natural", style: "classic", glasses: "round", hat: "none", accessory: "flower" } },
];
const REWARD_SKINS: { coins: number; en: string; ka: string; avatar: Partial<AvatarStyle> }[] = [
  { coins: 500, en: "Sapphire", ka: "საფირონი", avatar: { clothes: "blazerSweater", clothesColor: "#263e8a", clothesPattern: "diamond", style: "classic", hat: "none", accessory: "star" } },
  { coins: 1000, en: "Emerald", ka: "ზურმუხტი", avatar: { clothes: "kimono", clothesColor: "#356859", clothesPattern: "botanical", style: "japanese", hat: "none", accessory: "flower" } },
  { coins: 1500, en: "Burgundy", ka: "ბორდო", avatar: { clothes: "vneck", clothesColor: "#7b2d45", clothesPattern: "floral", style: "classic", hat: "none", accessory: "bow" } },
  { coins: 2000, en: "Royal Chokha", ka: "სამეფო ჩოხა", avatar: { clothes: "chokha", clothesColor: "#252936", clothesPattern: "diamond", style: "royal", hat: "papakha", accessory: "none" } },
  { coins: 10000, en: "Georgian Monarch", ka: "ქართული მონარქი", avatar: { clothes: "chokha", clothesColor: "#d09a3a", clothesPattern: "floral", style: "royal", hat: "crown", accessory: "crown", mouth: "confident", brows: "bold" } },
];
const BOT_AVATARS: AvatarStyle[] = [
  DEFAULT_AVATAR,
  { ...DEFAULT_AVATAR, seed: "qartli-grandmaster", skin: "#e7b98d", gender: "man", face: "angular", eyes: "bold", nose: "straight", hair: "short", hairColor: "ink", glasses: "none", clothes: "chokha", clothesColor: "#252936", clothesPattern: "plain", mouth: "confident", brows: "bold", style: "royal", accessory: "none", hat: "papakha", facialHair: "beard" },
  { ...DEFAULT_AVATAR, seed: "kyoto-tactician", skin: "#f1c7a5", gender: "woman", face: "round", eyes: "calm", nose: "button", hair: "bun", hairColor: "brown", glasses: "round", clothes: "kimono", clothesColor: "#a93752", clothesPattern: "plain", mouth: "soft", brows: "arched", style: "japanese", accessory: "flower", hat: "kasa", facialHair: "none" },
  { ...DEFAULT_AVATAR, seed: "neon-cardshark", skin: "#603a2b", gender: "neutral", face: "soft", eyes: "bright", nose: "small", hair: "afro", hairColor: "blue", glasses: "sun", clothes: "hoodie", clothesColor: "#6d46d7", clothesPattern: "plain", mouth: "smile", brows: "soft", style: "street", accessory: "star", hat: "beanie", facialHair: "moustache" },
];

function normalizeAvatar(value: unknown): AvatarStyle {
  const parsed = value && typeof value === "object" ? value as Partial<AvatarStyle> : {};
  return {
    seed: typeof parsed.seed === "string" && parsed.seed ? parsed.seed.slice(0, 48) : DEFAULT_AVATAR.seed,
    skin: parsed.skin && AVATAR_SKINS.includes(parsed.skin) ? parsed.skin : DEFAULT_AVATAR.skin,
    gender: parsed.gender && AVATAR_GENDERS.includes(parsed.gender) ? parsed.gender : DEFAULT_AVATAR.gender,
    face: parsed.face && AVATAR_FACES.includes(parsed.face) ? parsed.face : DEFAULT_AVATAR.face,
    eyes: parsed.eyes && AVATAR_EYES.includes(parsed.eyes) ? parsed.eyes : DEFAULT_AVATAR.eyes,
    nose: parsed.nose && AVATAR_NOSES.includes(parsed.nose) ? parsed.nose : DEFAULT_AVATAR.nose,
    hair: parsed.hair && AVATAR_HAIR.includes(parsed.hair) ? parsed.hair : DEFAULT_AVATAR.hair,
    hairColor: parsed.hairColor && AVATAR_HAIR_COLORS.includes(parsed.hairColor) ? parsed.hairColor : DEFAULT_AVATAR.hairColor,
    glasses: parsed.glasses && AVATAR_GLASSES.includes(parsed.glasses) ? parsed.glasses : DEFAULT_AVATAR.glasses,
    earrings: parsed.earrings && AVATAR_EARRINGS.includes(parsed.earrings) ? parsed.earrings : DEFAULT_AVATAR.earrings,
    freckles: typeof parsed.freckles === "boolean" ? parsed.freckles : DEFAULT_AVATAR.freckles,
    clothes: parsed.clothes && AVATAR_CLOTHES.includes(parsed.clothes) ? parsed.clothes : DEFAULT_AVATAR.clothes,
    clothesColor: typeof parsed.clothesColor === "string" && /^#[0-9a-f]{6}$/i.test(parsed.clothesColor) ? parsed.clothesColor : DEFAULT_AVATAR.clothesColor,
    clothesPattern: parsed.clothesPattern && AVATAR_PATTERNS.includes(parsed.clothesPattern) ? parsed.clothesPattern : DEFAULT_AVATAR.clothesPattern,
    mouth: parsed.mouth && AVATAR_MOUTHS.includes(parsed.mouth) ? parsed.mouth : DEFAULT_AVATAR.mouth,
    brows: parsed.brows && AVATAR_BROWS.includes(parsed.brows) ? parsed.brows : DEFAULT_AVATAR.brows,
    style: parsed.style && AVATAR_STYLES.includes(parsed.style) ? parsed.style : DEFAULT_AVATAR.style,
    accessory: parsed.accessory && AVATAR_ACCESSORIES.includes(parsed.accessory) ? parsed.accessory : DEFAULT_AVATAR.accessory,
    hat: parsed.hat && AVATAR_HATS.includes(parsed.hat) ? parsed.hat : DEFAULT_AVATAR.hat,
    facialHair: parsed.facialHair && AVATAR_FACIAL_HAIR.includes(parsed.facialHair) ? parsed.facialHair : DEFAULT_AVATAR.facialHair,
  };
}

function randomizeAvatar(avatar: AvatarStyle): AvatarStyle {
  const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];
  return {
    ...avatar,
    seed: Math.random().toString(36).slice(2, 10),
    face: pick(AVATAR_FACES), eyes: pick(AVATAR_EYES), nose: pick(AVATAR_NOSES), mouth: pick(AVATAR_MOUTHS), brows: pick(AVATAR_BROWS),
    hair: pick(AVATAR_HAIR), hairColor: pick(AVATAR_HAIR_COLORS), glasses: pick(AVATAR_GLASSES), earrings: pick(AVATAR_EARRINGS), freckles: Math.random() > .55,
    hat: pick(AVATAR_HATS), accessory: pick(AVATAR_ACCESSORIES), facialHair: avatar.gender === "woman" ? "none" : pick(AVATAR_FACIAL_HAIR),
    clothes: pick(AVATAR_CLOTHES), clothesColor: pick(AVATAR_CLOTHES_COLORS), clothesPattern: pick(AVATAR_PATTERNS),
  };
}

function applyAvatarGender(avatar: AvatarStyle, gender: AvatarGender): AvatarStyle {
  if (gender === "woman") return { ...avatar, gender, hair: avatar.hair === "short" ? "wave" : avatar.hair, facialHair: "none" };
  if (gender === "man") return { ...avatar, gender, hair: avatar.hair === "long" ? "short" : avatar.hair };
  return { ...avatar, gender, facialHair: "none" };
}

function applyAvatarStyle(avatar: AvatarStyle, style: AvatarTheme): AvatarStyle {
  const looks: Record<AvatarTheme, Partial<AvatarStyle>> = {
    classic: { style, clothes: "blazerShirt", clothesColor: "#356859", hairColor: "brown", glasses: "round", hat: "none", mouth: "smile", brows: "natural" },
    japanese: { style, clothes: "kimono", clothesColor: "#7b2d45", hair: "bun", hairColor: "ink", hat: "kasa", glasses: "none", accessory: "flower", mouth: "soft", brows: "arched" },
    street: { style, clothes: "hoodie", clothesColor: "#6d46d7", hairColor: "blue", hat: "beanie", glasses: "sun", accessory: "star", mouth: "grin", brows: "soft" },
    royal: { style, clothes: "chokha", clothesColor: "#252936", hairColor: "ink", hat: "crown", glasses: "none", accessory: "crown", mouth: "confident", brows: "bold" },
  };
  return { ...avatar, ...looks[style] };
}

const DICEBEAR_STYLE = new DiceStyle(avatarDefinition);
const avatarCache = new Map<string, string>();
const hairColors: Record<AvatarHairColor, string> = { ink: "211b2b", brown: "4a281d", gold: "d6a64e", copper: "a94b2f", blue: "2459a9", pink: "c64d89" };
const hairVariants: Record<AvatarHair, string> = { short: "shortFlat", wave: "longButNotTooLong", long: "straight02", curls: "curly", bun: "bun", braids: "dreads02", afro: "fro", frida: "frida", bob: "bob", ponytail: "straightAndStrand", pixie: "shortCurly", locs: "dreads01" };
const eyeVariants: Record<AvatarEyes, string> = { round: "default", bright: "happy", calm: "squint", bold: "side", wink: "wink", dreamy: "hearts" };
const glassesVariants: Record<Exclude<AvatarGlasses, "none">, string> = { round: "round", square: "prescription01", sun: "sunglasses" };
const mouthVariants: Record<AvatarMouth, string> = { smile: "smile", soft: "twinkle", confident: "default", surprised: "screamOpen", grin: "tongue", serious: "serious" };
const browVariants: Record<AvatarBrows, string> = { natural: "defaultNatural", bold: "flatNatural", soft: "default", arched: "raisedExcitedNatural", straight: "upDownNatural", lifted: "raisedExcited" };
const clothesVariants: Record<AvatarClothes, string> = { blazerShirt: "blazerAndShirt", blazerSweater: "blazerAndSweater", collarSweater: "collarAndSweater", graphicTee: "graphicShirt", hoodie: "hoodie", overall: "overall", crew: "shirtCrewNeck", scoop: "shirtScoopNeck", vneck: "shirtVNeck", kimono: "shirtVNeck", chokha: "collarAndSweater" };
const facialHairVariants: Record<Exclude<AvatarFacialHair, "none">, string> = { stubble: "beardLight", beard: "beardMajestic", moustache: "moustacheFancy" };
const hatVariants: Partial<Record<AvatarHat, string>> = { cap: "hat", beanie: "winterHat1", turban: "turban", hijab: "hijab" };

function avatarDataUri(avatar: AvatarStyle) {
  const key = JSON.stringify(avatar);
  const cached = avatarCache.get(key);
  if (cached) return cached;
  const uri = new DiceAvatar(DICEBEAR_STYLE, {
    seed: `${avatar.seed}-${avatar.gender}`,
    size: 256,
    topVariant: hatVariants[avatar.hat] ?? hairVariants[avatar.hair],
    hairColor: hairColors[avatar.hairColor],
    skinColor: avatar.skin.slice(1),
    eyesVariant: eyeVariants[avatar.eyes],
    mouthVariant: mouthVariants[avatar.mouth],
    eyebrowsVariant: browVariants[avatar.brows],
    accessoriesVariant: avatar.glasses === "none" ? "round" : glassesVariants[avatar.glasses],
    accessoriesProbability: avatar.glasses === "none" ? 0 : 100,
    clothesVariant: clothesVariants[avatar.clothes],
    clothesColor: avatar.clothesColor.slice(1),
    clothesGraphicVariant: avatar.clothes === "graphicTee" ? "deer" : "bat",
    facialHairVariant: avatar.facialHair === "none" ? "beardLight" : facialHairVariants[avatar.facialHair],
    facialHairColor: hairColors[avatar.hairColor],
    facialHairProbability: avatar.facialHair === "none" ? 0 : 100,
  } as never).toDataUri();
  avatarCache.set(key, uri);
  return uri;
}

function AvatarLayers({ avatar }: { avatar: AvatarStyle }) {
  return <svg className="v2-avatar-layers" viewBox="0 0 120 120" aria-hidden="true">
    {avatar.clothes === "kimono" && <g className="avatar-garment avatar-kimono"><path d="M10 120v-15q1-20 30-28l20 12l20-12q29 8 30 28v15Z"/><path className="kimono-panel" d="M40 77l20 12l-14 31H22l7-35m51-8L60 89l14 31h24l-7-35"/><path className="trim" d="M40 77l20 12l20-12M60 89v31"/><path className="obi" d="M27 105h66v10H27z"/><path className="flower" d="M32 91c4-7 9-2 6 3c7-4 10 3 4 6c7 1 5 8-1 7c2 7-6 8-8 2c-4 6-10 1-6-4c-7 1-8-7-2-9c-5-4 1-10 7-5Z"/></g>}
    {avatar.clothes === "chokha" && <g className="avatar-garment avatar-chokha"><path d="M9 120v-16q1-20 31-28l20 11l20-11q30 8 31 28v16Z"/><path className="chokha-panel" d="M40 76l20 11l20-11l-5 44H45Z"/><path className="trim" d="M40 76l20 11l20-11M60 87v33M29 113h62"/><path className="belt" d="M28 108h64v8H28z"/><g className="gazyr"><path d="M26 90h22M24 95h24M23 100h25M72 90h22M72 95h24M72 100h25"/></g><circle className="buckle" cx="60" cy="112" r="4"/></g>}
    {avatar.hat === "kasa" && <g className="avatar-hat kasa"><path d="M7 36Q60-5 113 36Q60 52 7 36Z"/><path className="hat-line" d="M17 35Q60 43 103 35M31 30Q60 38 89 30M60 3v37"/></g>}
    {avatar.hat === "papakha" && <path className="avatar-hat papakha" d="M25 36q-4-26 35-29q39 3 35 29q-8 10-70 0Z"/>}
    {avatar.hat === "crown" && <path className="avatar-hat crown" d="M32 30l7-22l19 16L75 7l13 24q-28 12-56-1Z"/>}
  </svg>;
}

const AVATAR_ACCESSORY_MARK: Record<Exclude<AvatarAccessory, "none">, string> = { flower: "✿", crown: "♛", cat: "◆", star: "★", bow: "⋈" };

function AvatarPortrait({ avatar, compact = false, hideAccessory = false }: { avatar: AvatarStyle; compact?: boolean; hideAccessory?: boolean }) {
  const source = avatarDataUri(avatar);
  return <span className={`v2-avatar-portrait style-${avatar.style} face-${avatar.face} clothes-${avatar.clothes} ${compact ? "compact" : ""}`} style={{ "--avatar-clothes": avatar.clothesColor, "--avatar-hair": `#${hairColors[avatar.hairColor]}` } as CSSProperties}><span className="v2-avatar-aura" /><img key={source} className="v2-dicebear-face" src={source} alt="" aria-hidden="true" />{!hideAccessory && avatar.accessory !== "none" && <span className={`v2-avatar-accessory accessory-${avatar.accessory}`}>{AVATAR_ACCESSORY_MARK[avatar.accessory]}</span>}<AvatarLayers avatar={avatar} /></span>;
}

function TablePlayerPortrait({ player }: { player: number }) {
  return <span className={`v2-bot-portrait player-${player}`}><AvatarPortrait avatar={BOT_AVATARS[player]} /></span>;
}

function TopDownTablePortrait({ avatar }: { avatar: AvatarStyle }) {
  return <span className="v2-table-face-icon" aria-hidden="true"><AvatarPortrait avatar={avatar} hideAccessory /></span>;
}

function customThemeStyle(color: string): CSSProperties {
  const red = Number.parseInt(color.slice(1, 3), 16);
  const green = Number.parseInt(color.slice(3, 5), 16);
  const blue = Number.parseInt(color.slice(5, 7), 16);
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  const contrast = luminance > .58 ? "#10131c" : "#ffffff";
  return {
    "--base": color,
    "--panel": color,
    "--panel2": color,
    "--glow": color,
    "--accent": contrast,
    "--text": contrast,
    "--muted": `color-mix(in srgb, ${contrast} 72%, transparent)`,
    "--soft": `color-mix(in srgb, ${contrast} 14%, transparent)`,
    "--line": `color-mix(in srgb, ${contrast} 24%, transparent)`,
  } as CSSProperties;
}

function ThemePicker({ theme, setTheme, customColor, setCustomColor, lang, compact = false }: { theme: Theme; setTheme: (t: Theme) => void; customColor: string; setCustomColor: (color: string) => void; lang: Lang; compact?: boolean }) {
  return <div className={`v2-theme-picker ${compact ? "compact" : ""}`} aria-label={UI[lang].color}>
    {!compact && <Palette size={16} />}
    {THEMES.map((item) => <button key={item} className={`${item} ${theme === item ? "active" : ""}`} onClick={() => setTheme(item)} aria-label={UI[lang].theme[item]} title={UI[lang].theme[item]} />)}
    <label className={`v2-custom-colour ${theme === "custom" ? "active" : ""}`} style={theme === "custom" ? { background: customColor } : undefined} title={UI[lang].color}><input type="color" value={customColor} onChange={(event) => setCustomColor(event.target.value)} aria-label={UI[lang].color} /><Palette /></label>
  </div>;
}

function LanguageToggle({ lang, setLang }: { lang: Lang; setLang: (lang: Lang) => void }) {
  return <div className="v2-language" aria-label="Language"><button className={lang === "ka" ? "active" : ""} onClick={() => setLang("ka")}>ქარ</button><button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button></div>;
}

function AuthModal({ close, login, logout, authenticated = false, coins = 0, lang, setLang, avatar, setAvatar }: { close: () => void; login?: (mode: AuthMode) => void; logout?: () => void; authenticated?: boolean; coins?: number; lang: Lang; setLang: (lang: Lang) => void; avatar: AvatarStyle; setAvatar: (avatar: AvatarStyle) => void }) {
  const copy = UI[lang];
  const [showRules, setShowRules] = useState(false);
  const [avatarTab, setAvatarTab] = useState<"face" | "hair" | "outfit" | "extras">("face");
  const labels = lang === "ka" ? {
    gender: { woman: "ქალი", man: "კაცი", neutral: "ნეიტრალური" }, face: { oval: "ოვალური", round: "მრგვალი", angular: "კუთხოვანი", soft: "რბილი" }, eyes: { round: "მრგვალი", bright: "ნათელი", calm: "მშვიდი", bold: "მკვეთრი", wink: "ჩაკვრა", dreamy: "მეოცნებე" }, nose: { small: "პატარა", soft: "რბილი", straight: "სწორი", button: "ღილაკი", fine: "თხელი", rounded: "მომრგვალო" }, hair: { short: "მოკლე", wave: "ტალღა", long: "გრძელი", curls: "ხვეული", bun: "კოსა", braids: "ნაწნავი", afro: "აფრო", frida: "ფრიდა", bob: "ბობი", ponytail: "ცხენის კუდი", pixie: "პიქსი", locs: "ლოკები" }, hairColor: { ink: "შავი", brown: "ყავისფერი", gold: "ოქროსფერი", copper: "სპილენძი", blue: "ლურჯი", pink: "ვარდისფერი" }, glasses: { none: "არა", round: "მრგვალი", square: "კვადრატი", sun: "მუქი" }, earrings: { none: "არა", stud: "პატარა", hoop: "რგოლი", drop: "გრძელი" }, clothes: { blazerShirt: "ბლეიზერი + პერანგი", blazerSweater: "ბლეიზერი + სვიტერი", collarSweater: "საყელოიანი სვიტერი", graphicTee: "პრინტიანი მაისური", hoodie: "ჰუდი", overall: "კომბინეზონი", crew: "კლასიკური მაისური", scoop: "ღია ყელი", vneck: "V-ყელი", kimono: "კიმონო", chokha: "ჩოხა" }, style: { classic: "კლასიკური", japanese: "იაპონური", street: "ქუჩის", royal: "სამეფო" }, accessory: { none: "არა", flower: "ყვავილი", crown: "გვირგვინი", cat: "კატის ყურები", star: "ვარსკვლავი", bow: "ბაფთა" }, hat: { none: "არა", cap: "კეპი", beanie: "ბინი", turban: "ტურბანი", hijab: "ჰიჯაბი", kasa: "ბამბუკის კასა", papakha: "ფაფახი", crown: "გვირგვინი" }, facialHair: { none: "არა", stubble: "მსუბუქი", beard: "წვერი", moustache: "ულვაში" }, mouth: { smile: "ღიმილი", soft: "რბილი", confident: "თავდაჯერებული", surprised: "გაკვირვებული", grin: "ფართო ღიმილი", serious: "სერიოზული" }, brows: { natural: "ბუნებრივი", bold: "მკვეთრი", soft: "რბილი", arched: "აწეული", straight: "სწორი", lifted: "მაღალი" }, pattern: { plain: "სადა", floral: "ყვავილები", botanical: "ფოთლები", diamond: "ორნამენტი" },
  } : {
    gender: { woman: "Woman", man: "Man", neutral: "Neutral" }, face: { oval: "Oval", round: "Round", angular: "Angular", soft: "Soft" }, eyes: { round: "Round", bright: "Bright", calm: "Calm", bold: "Bold", wink: "Wink", dreamy: "Dreamy" }, nose: { small: "Small", soft: "Soft", straight: "Straight", button: "Button", fine: "Fine", rounded: "Rounded" }, hair: { short: "Short", wave: "Wave", long: "Long", curls: "Curls", bun: "Bun", braids: "Braids", afro: "Afro", frida: "Frida", bob: "Bob", ponytail: "Ponytail", pixie: "Pixie", locs: "Locs" }, hairColor: { ink: "Ink", brown: "Brown", gold: "Gold", copper: "Copper", blue: "Blue", pink: "Pink" }, glasses: { none: "None", round: "Round", square: "Square", sun: "Sun" }, earrings: { none: "None", stud: "Stud", hoop: "Hoop", drop: "Drop" }, clothes: { blazerShirt: "Blazer + shirt", blazerSweater: "Blazer + sweater", collarSweater: "Collared sweater", graphicTee: "Graphic tee", hoodie: "Hoodie", overall: "Overalls", crew: "Crew neck", scoop: "Scoop neck", vneck: "V-neck", kimono: "Kimono", chokha: "Chokha" }, style: { classic: "Classic", japanese: "Japanese", street: "Street", royal: "Royal" }, accessory: { none: "None", flower: "Flower", crown: "Crown", cat: "Cat ears", star: "Star", bow: "Bow" }, hat: { none: "None", cap: "Cap", beanie: "Beanie", turban: "Turban", hijab: "Hijab", kasa: "Bamboo Kasa", papakha: "Papakhi", crown: "Crown" }, facialHair: { none: "None", stubble: "Stubble", beard: "Beard", moustache: "Moustache" }, mouth: { smile: "Smile", soft: "Soft", confident: "Confident", surprised: "Surprised", grin: "Grin", serious: "Serious" }, brows: { natural: "Natural", bold: "Bold", soft: "Soft", arched: "Arched", straight: "Straight", lifted: "Lifted" }, pattern: { plain: "Plain", floral: "Vintage floral", botanical: "Botanical", diamond: "Diamond" },
  };
  return <div className="v2-modal-bg" onMouseDown={(e) => e.target === e.currentTarget && close()}>
    <section className={`v2-auth ${authenticated ? "is-profile" : "is-login"}`} role="dialog" aria-modal="true"><div className="v2-auth-heading"><button className="v2-auth-back" onClick={close}><ArrowLeft /><span>{lang === "ka" ? "უკან" : "Back"}</span></button><Logo compact /><div><button className="v2-auth-rules" onClick={() => setShowRules(true)}><BookOpen />{copy.rules}</button><LanguageToggle lang={lang} setLang={setLang} /></div></div>
      <p className="v2-kicker">{authenticated ? (lang === "ka" ? "შენი პროფილი" : "Your profile") : copy.profile}</p><h2>{authenticated ? (lang === "ka" ? "შეცვალე ავატარი" : "Edit your avatar") : copy.enterGame}</h2><p>{authenticated ? (lang === "ka" ? "არჩეული სახე ავტომატურად ინახება და ყოველთვის გამოჩნდება ზედა მარჯვენა კუთხეში." : "Your selected look saves automatically and always appears in the top-right corner.") : copy.enterCopy}</p>
      {!authenticated && <button type="button" className="v2-login-scroll-hint" onClick={() => document.getElementById("v2-login-options")?.scrollIntoView({ behavior: "smooth", block: "start" })}><span>{lang === "ka" ? "ჩამოსქროლე შესასვლელად" : "Scroll down to sign in"}</span><ChevronDown /></button>}
      {authenticated && <div className="v2-selected-avatar-corner"><AvatarPortrait avatar={avatar} compact /><span>{lang === "ka" ? "არჩეული ავატარი" : "Selected avatar"}</span></div>}
      {authenticated && <><div className="v2-avatar-editor">
        <div className="v2-avatar-preview">
          <div className="v2-avatar-showcase" aria-hidden="true"><span /><span /><span /><i /><i /><i /></div>
          <AvatarPortrait avatar={avatar} />
          <div className="v2-avatar-live-colors" aria-label={lang === "ka" ? "არჩეული ფერები" : "Selected colours"}><i style={{ background: avatar.skin }} /><i style={{ background: `#${hairColors[avatar.hairColor]}` }} /><i style={{ background: avatar.clothesColor }} /></div>
          <b>{copy.chooseAvatar}</b><small><Sparkles />{copy.profileSaved}</small><small className="v2-avatar-engine">{copy.avatarEngine}</small>
          <div className="v2-avatar-presets">{AVATAR_PRESETS.map((preset) => <button type="button" key={preset.key} onClick={() => setAvatar(normalizeAvatar({ ...avatar, ...preset.avatar, seed: `${preset.key}-${Math.random().toString(36).slice(2, 6)}` }))}>{preset.key}</button>)}</div>
          <button type="button" className="v2-random-avatar" onClick={() => setAvatar(randomizeAvatar(avatar))}><Dices />{copy.randomize}</button>
        </div>
        <div className="v2-avatar-workbench" data-tab={avatarTab}>
          <nav className="v2-avatar-tabs" aria-label={lang === "ka" ? "ავატარის ნაწილები" : "Avatar sections"}>{(["face","hair","outfit","extras"] as const).map((tabName) => <button type="button" key={tabName} className={avatarTab === tabName ? "active" : ""} onClick={() => setAvatarTab(tabName)}>{lang === "ka" ? ({ face: "სახე", hair: "თმა", outfit: "სამოსი", extras: "დეტალები" } as const)[tabName] : ({ face: "Face", hair: "Hair", outfit: "Outfit", extras: "Extras" } as const)[tabName]}</button>)}</nav>
          <div className="v2-avatar-controls">
            <label className="tab-face"><span>{copy.skin}</span><div className="v2-skin-options">{AVATAR_SKINS.map((skin) => <button type="button" key={skin} className={avatar.skin === skin ? "active" : ""} style={{ background: skin }} onClick={() => setAvatar({ ...avatar, skin })} aria-label={`${copy.skin} ${skin}`} />)}</div></label>
            <label className="tab-face"><span>{copy.gender}</span><div>{AVATAR_GENDERS.map((gender) => <button type="button" key={gender} className={avatar.gender === gender ? "active" : ""} onClick={() => setAvatar(applyAvatarGender(avatar, gender))}>{labels.gender[gender]}</button>)}</div></label>
            <label className="tab-face"><span>{copy.eyes}</span><div>{AVATAR_EYES.map((eyes) => <button type="button" key={eyes} className={avatar.eyes === eyes ? "active" : ""} onClick={() => setAvatar({ ...avatar, eyes })}>{labels.eyes[eyes]}</button>)}</div></label>
            <label className="tab-face"><span>{lang === "ka" ? "პირი" : "Mouth"}</span><div>{AVATAR_MOUTHS.map((mouth) => <button type="button" key={mouth} className={avatar.mouth === mouth ? "active" : ""} onClick={() => setAvatar({ ...avatar, mouth })}>{labels.mouth[mouth]}</button>)}</div></label>
            <label className="tab-face"><span>{lang === "ka" ? "წარბები" : "Eyebrows"}</span><div>{AVATAR_BROWS.map((brows) => <button type="button" key={brows} className={avatar.brows === brows ? "active" : ""} onClick={() => setAvatar({ ...avatar, brows })}>{labels.brows[brows]}</button>)}</div></label>
            <label className="tab-hair"><span>{copy.hair}</span><div>{AVATAR_HAIR.map((hair) => <button type="button" key={hair} className={avatar.hair === hair ? "active" : ""} onClick={() => setAvatar({ ...avatar, hair, hat: "none" })}>{labels.hair[hair]}</button>)}</div></label>
            <label className="tab-hair"><span>{copy.hairColor}</span><div className="v2-hair-color-options">{AVATAR_HAIR_COLORS.map((hairColor) => <button type="button" key={hairColor} className={avatar.hairColor === hairColor ? `active hair-${hairColor}` : `hair-${hairColor}`} onClick={() => setAvatar({ ...avatar, hairColor })}>{labels.hairColor[hairColor]}</button>)}</div></label>
            <label className="tab-hair"><span>{copy.facialHair}</span><div>{AVATAR_FACIAL_HAIR.map((facialHair) => <button type="button" key={facialHair} className={avatar.facialHair === facialHair ? "active" : ""} onClick={() => setAvatar({ ...avatar, facialHair })}>{labels.facialHair[facialHair]}</button>)}</div></label>
            <label className="tab-outfit v2-wardrobe-control"><span>{copy.clothes}</span><div className="v2-wardrobe-grid">{AVATAR_CLOTHES.map((clothes) => <button type="button" key={clothes} className={avatar.clothes === clothes ? "active" : ""} onClick={() => setAvatar({ ...avatar, clothes })}><i style={{ background: avatar.clothesColor }} /><b>{labels.clothes[clothes]}</b></button>)}</div></label>
            <label className="tab-outfit"><span>{lang === "ka" ? "ტანსაცმლის ფერი" : "Clothing colour"}</span><div className="v2-clothes-colors">{AVATAR_CLOTHES_COLORS.map((clothesColor) => <button type="button" key={clothesColor} className={avatar.clothesColor === clothesColor ? "active" : ""} style={{ background: clothesColor }} onClick={() => setAvatar({ ...avatar, clothesColor })} aria-label={clothesColor} />)}</div></label>
            <label className="tab-outfit v2-look-control"><span>{copy.avatarStyle}</span><div className="v2-look-grid">{AVATAR_STYLES.map((style) => <button type="button" key={style} className={avatar.style === style ? "active" : ""} onClick={() => setAvatar(applyAvatarStyle(avatar, style))}><b>{labels.style[style]}</b><small>{style === "classic" ? "◆" : style === "japanese" ? "◉" : style === "street" ? "✦" : "♛"}</small></button>)}</div></label>
            <label className="tab-extras"><span>{copy.glasses}</span><div>{AVATAR_GLASSES.map((glasses) => <button type="button" key={glasses} className={avatar.glasses === glasses ? "active" : ""} onClick={() => setAvatar({ ...avatar, glasses })}>{labels.glasses[glasses]}</button>)}</div></label>
            <label className="tab-extras"><span>{copy.hat}</span><div className="v2-six-options">{AVATAR_HATS.map((hat) => <button type="button" key={hat} className={avatar.hat === hat ? "active" : ""} onClick={() => setAvatar({ ...avatar, hat })}>{labels.hat[hat]}</button>)}</div></label>
            <label className="tab-extras"><span>{copy.accessory}</span><div className="v2-six-options">{AVATAR_ACCESSORIES.map((accessory) => <button type="button" key={accessory} className={avatar.accessory === accessory ? "active" : ""} onClick={() => setAvatar({ ...avatar, accessory })}>{labels.accessory[accessory]}</button>)}</div></label>
          </div>
        </div>
      </div>
      <section className="v2-reward-skins"><header><span><Coins />{coins}</span><b>{lang === "ka" ? "გასახსნელი სკინები" : "Unlockable skins"}</b></header><div>{REWARD_SKINS.map((reward) => { const unlocked = coins >= reward.coins; return <button type="button" key={reward.coins} disabled={!unlocked} className={unlocked ? "unlocked" : "locked"} onClick={() => setAvatar(normalizeAvatar({ ...avatar, ...reward.avatar, seed: `reward-${reward.coins}-${avatar.gender}` }))}><span>{unlocked ? <Sparkles /> : <Lock />}</span><b>{lang === "ka" ? reward.ka : reward.en}</b><small>{reward.coins.toLocaleString()} <Coins /></small></button>; })}</div></section>
      <button type="button" className="v2-avatar-done" onClick={close}><CheckCircle2 />{lang === "ka" ? "მზადაა · მაგიდებთან დაბრუნება" : "Done · Return to tables"}</button></>}
      {!authenticated ? <section id="v2-login-options" className="v2-login-options"><button className="v2-social" onClick={() => login?.("google")}><i className="google">G</i>Continue with Google</button>
      <button className="v2-social" onClick={() => login?.("facebook")}><i className="facebook">f</i>Continue with Facebook</button>
      <button className="v2-social" onClick={() => login?.("email")}><Mail />Continue with Email</button>
      <div className="v2-or"><span>{copy.or}</span></div>
      <button className="v2-guest" onClick={() => login?.("guest")}><UserRound />{copy.guest}<ChevronRight /></button>
      <small>{lang === "ka" ? "ავტორიზაცია დაცულია Auth0 Universal Login-ით." : "Authentication is secured by Auth0 Universal Login."}</small></section> : <button className="v2-social v2-logout" onClick={logout}><LogOut />{lang === "ka" ? "ანგარიშიდან გასვლა" : "Sign out"}</button>}
    </section>
    {showRules && <RulesPanel close={() => setShowRules(false)} lang={lang} />}
  </div>;
}

function gameTiles(lang: Lang) { return lang === "ka" ? [
  { mode: "full" as GameMode, name: "სრული ჯოკერი", copy: "24 დარიგება · სრული პარტია", cls: "joker-tile", icon: "★" },
  { mode: "nines4" as GameMode, name: "ცხრიანები ×4", copy: "9 კარტი · 4 დარიგება", cls: "japan-tile", icon: "9×4" },
  { mode: "nines2" as GameMode, name: "ცხრიანები ×2", copy: "9 კარტი · 2 დარიგება", cls: "bura-tile", icon: "9×2" },
] : [
  { mode: "full" as GameMode, name: "Full Joker", copy: "24 deals · complete game", cls: "joker-tile", icon: "★" },
  { mode: "nines4" as GameMode, name: "Nines ×4", copy: "9 cards · 4 deals", cls: "japan-tile", icon: "9×4" },
  { mode: "nines2" as GameMode, name: "Nines ×2", copy: "9 cards · 2 deals", cls: "bura-tile", icon: "9×2" },
]; }

function Lobby({ theme, setTheme, customColor, setCustomColor, play, openScorePad, lang, setLang, authMode, hasAccess, resumeMode, avatar, avatarBuilt, coins, onAccount }: { theme: Theme; setTheme: (t: Theme) => void; customColor: string; setCustomColor: (color: string) => void; play: (mode: GameMode, room?: RoomSummary) => void; openScorePad: () => void; lang: Lang; setLang: (lang: Lang) => void; authMode: AuthMode; hasAccess: boolean; resumeMode: GameMode | null; avatar: AvatarStyle; avatarBuilt: boolean; coins: number; onAccount: () => void }) {
  const copy = UI[lang];
  const tiles = gameTiles(lang);
  const [selectedMode, setSelectedMode] = useState<GameMode>("full");
  const [roomView, setRoomView] = useState<"public" | "private">("public");
  const [roomError, setRoomError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [createName, setCreateName] = useState(lang === "ka" ? "ჩემი ჯოკერის მაგიდა" : "My Joker table");
  const [createPassword, setCreatePassword] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [createdRoom, setCreatedRoom] = useState<RoomSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [startingMode, setStartingMode] = useState<GameMode | null>(null);
  const [seatedAt, setSeatedAt] = useState<{ mode: GameMode; seat: number } | null>(null);
  const startTimerRef = useRef<number | null>(null);
  const [publicSeats, setPublicSeats] = useState<Record<GameMode, boolean[]>>({
    full: [true, true, true, false],
    nines4: [true, false, false, false],
    nines2: [false, false, false, false],
  });

  const roomRequest = async (payload: Record<string, unknown>) => {
    setBusy(true); setRoomError("");
    try {
      const response = await fetch("/api/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as { room?: RoomSummary; error?: string };
      if (!response.ok || !data.room) throw new Error(data.error || "Table request failed");
      return data.room;
    } catch (error) {
      setRoomError(error instanceof Error ? error.message : "Table request failed");
      return null;
    } finally { setBusy(false); }
  };

  const createRoom = async () => {
    const room = await roomRequest({ action: "create", name: createName, visibility: "private", mode: selectedMode, password: createPassword });
    if (room) setCreatedRoom(room);
  };

  const joinPublicSeat = (mode: GameMode, seat: number) => {
    if (!hasAccess) { onAccount(); return; }
    if (resumeMode === mode) { play(mode); return; }
    if (seatedAt || publicSeats[mode][seat]) return;
    const updated = [...publicSeats[mode]]; updated[seat] = true;
    setSelectedMode(mode); setSeatedAt({ mode, seat }); setPublicSeats((current) => ({ ...current, [mode]: updated }));
    if (updated.every(Boolean)) { setStartingMode(mode); startTimerRef.current = window.setTimeout(() => play(mode), 880); }
  };

  const leavePublicSeat = () => {
    if (!seatedAt) return;
    if (startTimerRef.current !== null) window.clearTimeout(startTimerRef.current);
    const { mode, seat } = seatedAt;
    setPublicSeats((current) => ({ ...current, [mode]: current[mode].map((occupied, index) => index === seat ? false : occupied) }));
    setStartingMode(null); setSeatedAt(null); startTimerRef.current = null;
  };

  return <main className={`v2-lobby theme-${theme}`} style={theme === "custom" ? customThemeStyle(customColor) : undefined}>
    <header className="v2-top"><Logo /><div className="v2-top-actions"><LanguageToggle lang={lang} setLang={setLang} /><ThemePicker theme={theme} setTheme={setTheme} customColor={customColor} setCustomColor={setCustomColor} lang={lang} /><button className="v2-lobby-rules" onClick={() => setShowRules(true)}><BookOpen />{copy.rules}</button>{hasAccess && <span className="v2-coin-pill"><Coins />{coins.toLocaleString()}</span>}<button className={`v2-login v2-account ${hasAccess && !avatarBuilt ? "needs-avatar" : ""}`} onClick={onAccount}>{hasAccess ? <><AvatarPortrait avatar={avatar} compact /><span className="v2-account-copy"><b>{authMode === "google" ? "Google" : authMode === "facebook" ? "Facebook" : authMode === "guest" ? (lang === "ka" ? "სტუმარი" : "Guest") : "Email"}</b><small>{avatarBuilt ? (lang === "ka" ? "ავატარის შეცვლა" : "Edit avatar") : (lang === "ka" ? "შექმენი ავატარი" : "Build your avatar")}</small></span>{!avatarBuilt && <Sparkles className="v2-avatar-hint" />}</> : <><UserRound />{copy.signIn}</>}</button></div></header>
    <section className="v2-lobby-main v2-room-lobby"><div className="v2-lobby-hero"><div className="v2-hero-copy"><p className="v2-kicker">{copy.club}</p><h1>{lang === "ka" ? "აირჩიე ადგილი" : "Choose a seat"}</h1></div><div className="v2-hero-card-fan" aria-hidden="true">{(["purple", "blue", "green", "red"] as const).map((back, index) => <img key={back} src={`/card-backs/${back}-full-v2.webp`} alt="" style={{ "--card-index": index } as CSSProperties} />)}</div><button className="v2-hero-rules" onClick={() => setShowRules(true)}><span><BookOpen /></span><div><small>{lang === "ka" ? "პირველად თამაშობ?" : "New to Joker?"}</small><b>{lang === "ka" ? "ისწავლე 6 მოძრავ ნაბიჯში" : "Learn in 6 animated steps"}</b></div><ChevronRight /></button></div><div className="v2-title-row"><div><p className="v2-kicker">LIVE TABLES</p><h2>{copy.games}</h2><span className="v2-underline" /></div><div className="v2-online"><i />48 {copy.activeTables}</div></div>
      <a className="v2-ad-slot" href={AD_EMAIL_HREF}><span>AD</span><div><small>{copy.adSpace}</small><b>{copy.adCopy}</b></div><strong>{copy.advertise}<ChevronRight /></strong></a>
      <section className="v2-room-board">
        <header><div className="v2-room-tabs"><button className={roomView === "public" ? "active" : ""} onClick={() => setRoomView("public")}><Globe2 />{copy.publicTables}</button><button className={roomView === "private" ? "active" : ""} onClick={() => setRoomView("private")}><Lock />{copy.privateTables}</button></div>{roomView === "private" && <button className="v2-create-room" onClick={() => { if (!hasAccess) { onAccount(); return; } setShowCreate(true); setCreatedRoom(null); }}><Plus />{copy.createTable}</button>}</header>
        {roomView === "public" ? <div className="v2-public-tables" aria-label={copy.chooseSeat}>{tiles.map((tile) => { const seats = publicSeats[tile.mode]; const full = seats.every(Boolean); const atThisTable = seatedAt?.mode === tile.mode; const canResume = resumeMode === tile.mode; return <article key={tile.mode} className={`${full ? "full" : ""} ${atThisTable ? "seated" : ""} ${canResume ? "resume-game" : ""}`}><div className="v2-table-game-icon">{tile.icon}</div><div className="v2-table-game-name"><b>{tile.name}</b><small>{tile.copy}</small></div><div className="v2-seat-icons">{seats.map((occupied, seat) => { const mine = atThisTable && seatedAt?.seat === seat; return <button key={seat} className={`${occupied ? "occupied" : "empty"} ${mine ? "mine" : ""}`} disabled={occupied || Boolean(seatedAt) || (resumeMode !== null && resumeMode !== tile.mode)} onClick={() => joinPublicSeat(tile.mode, seat)} aria-label={mine ? copy.you : occupied ? `${seat + 1}/4` : `${copy.chooseSeat} ${seat + 1}`}><UserRound /></button>; })}</div><span className="v2-seat-status"><b>{seats.filter(Boolean).length}/4</b>{canResume ? (lang === "ka" ? "თამაშში დაბრუნება" : "Return to game") : full ? copy.tableFull : copy.waitingPlayers}</span>{atThisTable && <button className="v2-stand-up" onClick={leavePublicSeat}>{copy.standUp}</button>}</article>; })}</div> : <form className="v2-private-join" onSubmit={async (event) => { event.preventDefault(); if (!hasAccess) { onAccount(); return; } const joined = await roomRequest({ action: "join", code: joinCode, password: joinPassword }); if (joined) play(joined.mode, joined); }}><div className="v2-private-icon"><KeyRound /></div><div><p className="v2-kicker">{copy.privateTables}</p><h2>{lang === "ka" ? "შედი კოდით და პაროლით" : "Join with code and password"}</h2></div><label><span>{copy.tableCode}</span><input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} maxLength={6} placeholder="ABC123" /></label><label><span>{copy.password}</span><input type="password" value={joinPassword} onChange={(event) => setJoinPassword(event.target.value)} placeholder="••••••" /></label><button disabled={busy || !joinCode || !joinPassword}>{copy.join}<ChevronRight /></button></form>}
        {roomError && <p className="v2-room-error">{roomError}</p>}
      </section>
      <button className="v2-scorepad-card" onClick={openScorePad}><span><ClipboardList /></span><div><small>{lang === "ka" ? "ფიზიკური თამაშისთვის" : "For your physical game"}</small><b>{lang === "ka" ? "ქაღალდის გარეშე ქულების ცხრილი" : "Paperless score sheet"}</b><p>{lang === "ka" ? "შეიყვანე 4 სახელი, ნათქვამი და აღებული — ქულებსა და პრემიას ავტომატურად დავითვლით." : "Enter four names, bids and tricks won — scores and Perfect Game are calculated automatically."}</p></div><strong>{lang === "ka" ? "გახსნა" : "Open"}<ChevronRight /></strong></button>
    </section>
    <footer className="v2-footer"><span>© 2026 JOKER · {copy.playOnly}</span><span><UsersRound /> 48 {copy.activeTables}</span></footer>
    {showCreate && <div className="v2-modal-bg" onMouseDown={(event) => event.target === event.currentTarget && setShowCreate(false)}><section className="v2-create-dialog"><button className="v2-close" onClick={() => setShowCreate(false)}><X /></button>{createdRoom ? <div className="v2-created-room"><Sparkles /><p className="v2-kicker">{copy.createTable}</p><h2>{createdRoom.name}</h2><span>{copy.tableCode}</span><strong>{createdRoom.code}</strong><small>{copy.shareCode}</small><button onClick={() => play(createdRoom.mode, createdRoom)}>{copy.enterTable}<ChevronRight /></button></div> : <><p className="v2-kicker">{copy.privateTables}</p><h2>{lang === "ka" ? "ახალი პირადი მაგიდა" : "New private table"}</h2><label><span>{copy.tableName}</span><input value={createName} maxLength={32} onChange={(event) => setCreateName(event.target.value)} /></label><label><span>{copy.chooseMode}</span><select value={selectedMode} onChange={(event) => setSelectedMode(event.target.value as GameMode)}>{tiles.map((tile) => <option value={tile.mode} key={tile.mode}>{tile.name}</option>)}</select></label><label><span>{copy.password}</span><input type="password" minLength={4} value={createPassword} onChange={(event) => setCreatePassword(event.target.value)} placeholder="••••••" /></label><button className="v2-confirm" disabled={busy || !createName.trim() || createPassword.length < 4} onClick={createRoom}><Lock />{copy.createTable}</button>{roomError && <p className="v2-room-error">{roomError}</p>}</>}</section></div>}
    {showRules && <RulesPanel close={() => setShowRules(false)} lang={lang} />}
    {startingMode && <div className="v2-start-sequence"><div className="v2-start-table"><span>{[0,1,2,3].map((player) => <i key={player}><AvatarPortrait avatar={player === 0 ? avatar : BOT_AVATARS[player]} /></i>)}</span><b>JOKER</b></div><p>{copy.tableFull}</p><div className="v2-start-countdown"><i>3</i><i>2</i><i>1</i></div></div>}
  </main>;
}

type ScorePadRow = { bids: (number | null)[]; won: (number | null)[]; done: boolean };
type ScorePadStage = "bids" | "results";

function emptyScoreRows(mode: GameMode): ScorePadRow[] {
  return MODE_HANDS[mode].map(() => ({ bids: [null,null,null,null], won: [null,null,null,null], done: false }));
}

function ScorePad({ theme, customColor, lang, setLang, exit }: { theme: Theme; customColor: string; lang: Lang; setLang: (lang: Lang) => void; exit: () => void }) {
  const tiles = gameTiles(lang);
  const copy = lang === "ka" ? {
    title: "ქაღალდის გარეშე ცხრილი", subtitle: "ზუსტად ისეთი, როგორსაც ფურცელზე ავსებთ — გამოთვლების გარეშე", names: "მოთამაშეების სახელები", bid: "ნათქვამი", won: "რეალურად აიღო", saveBids: "დააფიქსირე ნათქვამი", saveResults: "დათვალე ქულები", editBids: "ნათქვამის შეცვლა", total: "ჯამი", deal: "დარიგება", cards: "კარტი", bidGuide: "ჯერ მონიშნე, რამდენ ხელს ამბობს თითოეული მოთამაშე.", resultGuide: "დარიგების დასრულების შემდეგ მონიშნე, რამდენი ხელი აიღო თითოეულმა.", missing: "შეავსე ოთხივე მოთამაშის მნიშვნელობა.", equalError: "ნათქვამების ჯამი კარტების რაოდენობას ვერ გაუტოლდება — ბოლო მოთამაშემ შეცვალოს.", error: "აღებული ხელების ჯამი დარიგებულ კარტებს უნდა უდრიდეს.", complete: "პარტიის ცხრილი დასრულებულია", reset: "ახალი ცხრილი", score: "ნათქვამი | ქულა", back: "ლობი", start: "ცხრილის დაწყება", chooseNames: "ჯერ ჩაწერე ოთხივე მოთამაშის სახელი", chooseGame: "აირჩიე თამაშის ფორმატი", setup: "მომზადება", results: "შედეგების შეყვანა", saidShort: "თქვა", pointsShort: "ქულა", khishti: "ხიშტი", khishtiHelp: "თუ მოთამაშემ თქვა, მაგრამ ვერცერთი ხელი ვერ აიღო",
  } : {
    title: "Paperless score sheet", subtitle: "The familiar paper layout, with every calculation handled for you", names: "Player names", bid: "Said", won: "Actually won", saveBids: "Lock in bids", saveResults: "Calculate scores", editBids: "Edit bids", total: "Total", deal: "Deal", cards: "cards", bidGuide: "First record how many tricks each player says they will take.", resultGuide: "When the physical deal ends, record how many tricks each player actually took.", missing: "Choose a value for all four players.", equalError: "Total bids cannot equal the cards in the deal — the final bidder must change.", error: "The tricks won must add up to the number of cards in this deal.", complete: "The game score sheet is complete", reset: "New sheet", score: "Bid | points", back: "Lobby", start: "Start score sheet", chooseNames: "First enter all four player names", chooseGame: "Choose the game format", setup: "Setup", results: "Enter results", saidShort: "Said", pointsShort: "Points", khishti: "Khishti", khishtiHelp: "When a player bids above zero but wins no tricks",
  };
  const [mode, setMode] = useState<GameMode>("full");
  const [names, setNames] = useState(lang === "ka" ? ["მოთამაშე 1", "მოთამაშე 2", "მოთამაშე 3", "მოთამაშე 4"] : ["Player 1", "Player 2", "Player 3", "Player 4"]);
  const [rows, setRows] = useState<ScorePadRow[]>(() => emptyScoreRows("full"));
  const [activeDeal, setActiveDeal] = useState(0);
  const [started, setStarted] = useState(false);
  const [entryStage, setEntryStage] = useState<ScorePadStage>("bids");
  const [khishtiPenalty, setKhishtiPenalty] = useState<-200 | -500>(-200);
  const [error, setError] = useState("");
  const cards = MODE_HANDS[mode][activeDeal];
  const changeMode = (next: GameMode) => { setMode(next); setRows(emptyScoreRows(next)); setActiveDeal(0); setEntryStage("bids"); setError(""); };
  const setValue = (field: "bids" | "won", player: number, value: number | null) => {
    setRows((current) => current.map((row, index) => index === activeDeal ? { ...row, done: false, [field]: row[field].map((item, itemIndex) => itemIndex === player ? value : item) } : row));
    setError("");
  };
  const rawHistory = rows.map((row, deal) => row.done ? row.bids.map((bid, player) => scoreHand(bid ?? 0, row.won[player] ?? 0, MODE_HANDS[mode][deal], khishtiPenalty)) : [0,0,0,0]);
  const exactRows = rows.map((row) => row.bids.map((bid, player) => row.done && bid === row.won[player]));
  let adjustedHistory = rawHistory.map((row) => [...row]);
  rows.forEach((row, deal) => {
    const bounds = setBounds(mode, deal);
    if (row.done && deal === bounds.end && rows.slice(bounds.start, bounds.end + 1).every((item) => item.done)) adjustedHistory = applyPremium(adjustedHistory, exactRows, bounds.start, bounds.end).history;
  });
  const totals = historyTotals(adjustedHistory);
  const lockBids = () => {
    const row = rows[activeDeal];
    if (row.bids.some((value) => value === null)) { setError(copy.missing); return; }
    if (row.bids.reduce<number>((sum, value) => sum + (value ?? 0), 0) === cards) { setError(copy.equalError); return; }
    setEntryStage("results"); setError("");
  };
  const saveResults = () => {
    const row = rows[activeDeal];
    if (row.won.some((value) => value === null)) { setError(copy.missing); return; }
    if (row.won.reduce<number>((sum, value) => sum + (value ?? 0), 0) !== cards) { setError(copy.error); return; }
    const nextRows = rows.map((item, index) => index === activeDeal ? { ...item, done: true } : item);
    setRows(nextRows); setError("");
    const nextOpen = nextRows.findIndex((item, index) => index > activeDeal && !item.done);
    if (nextOpen >= 0) { setActiveDeal(nextOpen); setEntryStage("bids"); }
  };
  const openDeal = (deal: number) => { setActiveDeal(deal); setEntryStage(rows[deal].bids.every((value) => value !== null) ? "results" : "bids"); setError(""); };
  const reset = () => { setRows(emptyScoreRows(mode)); setActiveDeal(0); setEntryStage("bids"); setStarted(false); setError(""); };
  const currentValues = entryStage === "bids" ? rows[activeDeal].bids : rows[activeDeal].won;
  const activeBidBalance = bidBalance(cards, rows[activeDeal].bids, lang);
  return <main className={`v2-scorepad-page v2-lobby theme-${theme}`} style={theme === "custom" ? customThemeStyle(customColor) : undefined}>
    <header className="v2-scorepad-top"><button className="v2-back" onClick={exit}><ArrowLeft />{copy.back}</button><Logo compact /><LanguageToggle lang={lang} setLang={setLang} /></header>
    <section className="v2-scorepad-shell">
      <div className="v2-scorepad-heading"><div><p className="v2-kicker">JOKER TABLE</p><h1>{copy.title}</h1><p>{copy.subtitle}</p></div><div className="v2-scorepad-mode">{tiles.map((tile) => <button key={tile.mode} disabled={started} className={mode === tile.mode ? "active" : ""} onClick={() => changeMode(tile.mode)}><b>{tile.icon}</b><span>{tile.name}</span></button>)}</div></div>
      {!started ? <section className="v2-scorepad-setup"><div className="v2-scorepad-setup-icon"><ClipboardList /></div><p className="v2-kicker">01 · {copy.setup}</p><h2>{copy.chooseNames}</h2><p>{copy.chooseGame}: <b>{tiles.find((tile) => tile.mode === mode)?.name}</b></p><div>{names.map((name, player) => <label key={player}><span>{player + 1}</span><input value={name} maxLength={16} onFocus={(event) => event.currentTarget.select()} onChange={(event) => setNames((current) => current.map((item, index) => index === player ? event.target.value : item))} aria-label={`${copy.names} ${player + 1}`} /></label>)}</div><fieldset className="v2-khishti-choice"><legend>{copy.khishti}</legend><small>{copy.khishtiHelp}</small><div><button type="button" className={khishtiPenalty === -200 ? "active" : ""} onClick={() => setKhishtiPenalty(-200)}>{copy.khishti} −200</button><button type="button" className={khishtiPenalty === -500 ? "active" : ""} onClick={() => setKhishtiPenalty(-500)}>{copy.khishti} −500</button></div></fieldset><button disabled={names.some((name) => !name.trim())} onClick={() => setStarted(true)}>{copy.start}<ChevronRight /></button></section> : <div className="v2-scorepad-grid">
        <aside className="v2-scorepad-entry">
          <div className="v2-scorepad-deal"><span>{copy.deal}</span><strong>{activeDeal + 1}/{rows.length}</strong><b>{cards} {copy.cards}</b></div>
          <div className="v2-scorepad-flow"><span className="done"><i>1</i>{copy.setup}</span><span className={entryStage === "bids" ? "active" : "done"}><i>2</i>{copy.bid}</span><span className={entryStage === "results" ? "active" : ""}><i>3</i>{copy.won}</span></div>
          <div className="v2-entry-state"><b>{entryStage === "bids" ? copy.bid : copy.results}</b><span>{entryStage === "bids" ? copy.bidGuide : copy.resultGuide}</span></div>
          {entryStage === "results" && activeBidBalance && <div className={`v2-bid-balance ${activeBidBalance.kind}`}><strong>{activeBidBalance.text}</strong><span>{lang === "ka" ? (activeBidBalance.kind === "stuffing" ? "ამდენი დამატებითი ხელი დარჩა თამაშში" : activeBidBalance.kind === "snatching" ? "ამდენი ხელი ზედმეტად არის ნათქვამი" : "ასეთი ჯამი წესით დაუშვებელია") : (activeBidBalance.kind === "stuffing" ? "Someone will take these additional tricks" : activeBidBalance.kind === "snatching" ? "This many promised tricks cannot all be taken" : "This total is not allowed by the rules")}</span></div>}
          <div className="v2-scorepad-players">{names.map((name, player) => <article key={player}><header><span>{player + 1}</span><b>{name}</b>{entryStage === "results" && <small>{copy.bid}: {rows[activeDeal].bids[player] === 0 ? "−" : rows[activeDeal].bids[player]}</small>}</header><div className="v2-number-picker">{Array.from({ length: cards + 1 }, (_, value) => <button type="button" key={value} className={currentValues[player] === value ? "active" : ""} onClick={() => setValue(entryStage === "bids" ? "bids" : "won", player, value)}>{entryStage === "bids" && value === 0 ? "−" : value}</button>)}</div></article>)}</div>
          {error && <p className="v2-scorepad-error">{error}</p>}
          {entryStage === "results" && <button className="v2-edit-bids" onClick={() => setEntryStage("bids")}>{copy.editBids}</button>}
          <button className="v2-scorepad-save" onClick={entryStage === "bids" ? lockBids : saveResults}><CheckCircle2 />{entryStage === "bids" ? copy.saveBids : copy.saveResults}<ChevronRight /></button>
          {rows.every((row) => row.done) && <div className="v2-scorepad-complete"><Sparkles /><b>{copy.complete}</b></div>}
        </aside>
        <section className="v2-scorepad-table"><header><div><ClipboardList /><b>{copy.title}</b><small>{copy.score}</small></div><button onClick={reset}><RotateCcw />{copy.reset}</button></header><div className="v2-scorepad-scroll"><table><thead><tr><th>№</th><th>{copy.cards}</th>{names.map((name, player) => <th key={player}><b>{name || `${player + 1}`}</b><small><span>{copy.saidShort}</span><span>{copy.pointsShort}</span></small></th>)}</tr></thead><tbody>{rows.map((row, deal) => { const setBreak = mode === "full" && [7,11,19,23].includes(deal); return <tr key={deal} className={`${deal === activeDeal ? "active" : ""} ${row.done ? "done" : ""} ${setBreak ? "set-break" : ""}`} onClick={() => openDeal(deal)}><td>{deal + 1}</td><td>{MODE_HANDS[mode][deal]}</td>{row.bids.map((bid, player) => <td key={player}>{bid === null ? <span className="empty-score">·</span> : <span className={`paper-score ${row.done ? (exactRows[deal][player] ? "exact" : "missed") : "pending"}`}><b>{bid === 0 ? "−" : bid}</b><i>{row.done ? adjustedHistory[deal][player] : "…"}</i></span>}</td>)}</tr>; })}</tbody><tfoot><tr><td colSpan={2}>{copy.total}</td>{totals.map((total, player) => <td key={player}>{formatScore(total)}</td>)}</tr></tfoot></table></div></section>
      </div>}
    </section>
  </main>;
}

function RulesPanel({ close, lang }: { close: () => void; lang: Lang }) {
  const english = lang === "en";
  const [active, setActive] = useState(0);
  const steps = english ? [
    { icon: "36", title: "Deck & four players", text: "Use cards 6 through Ace, excluding the black sixes, plus two Jokers. Four players receive the same number of cards.", demo: "6  7  8  9  10  J  Q  K  A  ★" },
    { icon: "24", title: "Deals", text: "Full Joker has 24 deals: 1→8 cards, four 9-card deals, 8→1 cards, then four more 9-card deals. The dealer rotates every deal.", demo: "1 → 8   ·   9 × 4   ·   8 → 1   ·   9 × 4" },
    { icon: "✋", title: "Bid", text: "After seeing your cards, predict how many tricks you will take. The dealer cannot make total bids equal the cards dealt.", demo: "Bid:  −  1  2  3  4  5  6  7  8  9" },
    { icon: "♣", title: "Trump & play", text: "Follow the led suit. Without it, play trump. Only without both may you play any card. In a 9-card deal, the player after the dealer chooses trump from their first three cards or chooses No trump.", demo: "Led ♥  →  no ♥  →  play trump ♣" },
    { icon: "★", title: "Joker", text: "Leading: Highest + a suit demands each player's highest card in that suit; without it they play trump. Let them take lets the highest eligible card win. Following: choose Joker it or Under.", demo: "Highest ♥   ·   Let them take   ·   Joker it   ·   Under" },
    { icon: "Σ", title: "Scoring & Perfect Game", text: "Exact pass = 50. Other exact bid = bid × 50 + 50. Taking every trick exactly = 100 each. A miss = 10 per trick taken. A positive bid with zero tricks is Khishti: −200 in the online game.", demo: "2 exact → 2–150   ·   bid 2, take 0 → 2 | −200" },
  ] : [
    { icon: "36", title: "დასტა და 4 მოთამაშე", text: "თამაშშია 6-დან ტუზამდე ყველა კარტი, ორი შავი ექვსიანის გარეშე, და ორი ჯოკერი. ოთხივე მოთამაშე თანაბარ რაოდენობას იღებს.", demo: "6  7  8  9  10  J  Q  K  A  ★" },
    { icon: "24", title: "დარიგებები", text: "სრული ჯოკერი 24 დარიგებაა: 1→8 კარტი, ოთხჯერ 9, 8→1 და ბოლოს ისევ ოთხჯერ 9. დილერი ყოველი დარიგების შემდეგ იცვლება.", demo: "1 → 8   ·   9 × 4   ·   8 → 1   ·   9 × 4" },
    { icon: "✋", title: "ნათქვამი", text: "კარტების ნახვის შემდეგ ამბობ რამდენ ხელს აიღებ. დილერს არ შეუძლია საერთო ნათქვამი დარიგებული კარტების რაოდენობას გაუტოლოს.", demo: "ნათქვამი:  −  1  2  3  4  5  6  7  8  9" },
    { icon: "♣", title: "კოზირი და სვლა", text: "წამოსულ მასტს მიჰყვები. თუ არ გაქვს, კოზირს დებ. ნებისმიერი კარტი მხოლოდ მაშინ შეგიძლია, როცა არც წამოსული მასტი გაქვს და არც კოზირი. ცხრიანში პირველი 3 კარტით ირჩევენ კოზირს ან ბეზს.", demo: "წამოვიდა ♥  →  ♥ არ გაქვს  →  დადე კოზირი ♣" },
    { icon: "★", title: "ჯოკერი", text: "დაწყებისას „მაღალი“ + მასტი ყველას აიძულებს ამ მასტის უმაღლესი კარტი დადოს; ვისაც არ აქვს, კოზირს დებს. „წაიღოს“ შემთხვევაში უმაღლესი დასაშვები კარტი იგებს. მიყოლისას აირჩიე „მოჯოკრა“ ან „ნიჟე“.", demo: "მაღალი ♥   ·   წაიღოს   ·   მოჯოკრა   ·   ნიჟე" },
    { icon: "Σ", title: "ქულები და პრემია", text: "ზუსტი პასი = 50. სხვა ზუსტი ნათქვამი = ნათქვამი × 50 + 50. ყველა ხელის ზუსტად აღება = 100 თითო ხელზე. აცდენა = 10 თითო აღებულზე. დადებითი ნათქვამით ნულის აღება არის ხიშტი: ონლაინ თამაშში −200.", demo: "2 ზუსტად → 2–150   ·   თქვი 2, აიღე 0 → 2 | −200" },
  ];
  const step = steps[active];
  return <div className="v2-modal-bg"><section className="v2-rules v2-rules-interactive"><button className="v2-close" onClick={close}><X /></button><p className="v2-kicker">{english ? "Georgian Joker" : "ქართული ჯოკერი"}</p><h2>{english ? "Learn the game in six steps" : "ისწავლე თამაში 6 ნაბიჯში"}</h2>
    <div className="v2-rule-steps">{steps.map((item, index) => <button key={item.title} className={active === index ? "active" : ""} onClick={() => setActive(index)}><span>{item.icon}</span><b>{index + 1}</b></button>)}</div>
    <article className="v2-rule-stage" key={active}><div className="v2-rule-visual"><span>{step.icon}</span><i /><i /><i /></div><div><small>{english ? `Step ${active + 1} of 6` : `ნაბიჯი ${active + 1} / 6`}</small><h3>{step.title}</h3><p>{step.text}</p><strong>{step.demo}</strong></div></article>
    <div className="v2-rule-nav"><button disabled={active === 0} onClick={() => setActive((value) => Math.max(0, value - 1))}>← {english ? "Back" : "უკან"}</button><button disabled={active === steps.length - 1} onClick={() => setActive((value) => Math.min(steps.length - 1, value + 1))}>{english ? "Next" : "შემდეგი"} →</button></div>
  </section></div>;
}

function Match({ theme, setTheme, customColor, setCustomColor, playerName, avatar, coins, awardCoins, exit, lang, setLang, mode, room }: { theme: Theme; setTheme: (t: Theme) => void; customColor: string; setCustomColor: (color: string) => void; playerName: string; avatar: AvatarStyle; coins: number; awardCoins: (eventId: string, action: "finish" | "leave", placement?: number) => Promise<EconomyResult | null>; exit: (early: boolean, gameId: string) => void; lang: Lang; setLang: (lang: Lang) => void; mode: GameMode; room?: RoomSummary | null }) {
  const copy = UI[lang];
  const botNameChoices = useRef(BOT_NAME_POOLS.slice(1).map((pool) => Math.floor(Math.random() * pool.length))).current;
  const names = playerNames(lang, botNameChoices);
  const handPlan = MODE_HANDS[mode];
  const cardWord = (count: number) => lang === "en" && count === 1 ? "card" : copy.cards;
  const trickWord = (count: number) => lang === "en" ? (count === 1 ? "trick" : "tricks") : copy.hand;
  const [handIndex, setHandIndex] = useState(0);
  const [dealer, setDealer] = useState(0);
  const [hands, setHands] = useState<Card[][]>([[],[],[],[]]);
  const [indicator, setIndicator] = useState<Card | null>(null);
  const [trump, setTrump] = useState<Suit | null>(null);
  const [bids, setBids] = useState<(number | null)[]>([null,null,null,null]);
  const [tricks, setTricks] = useState([0,0,0,0]);
  const [scores, setScores] = useState([0,0,0,0]);
  const [scoreHistory, setScoreHistory] = useState<number[][]>([]);
  const [bidHistory, setBidHistory] = useState<number[][]>([]);
  const [exactHistory, setExactHistory] = useState<boolean[][]>([]);
  const [premiumPlayers, setPremiumPlayers] = useState<number[]>([]);
  const [table, setTable] = useState<Played[]>([]);
  const [takingWinner, setTakingWinner] = useState<number | null>(null);
  const [lastTrick, setLastTrick] = useState<{ cards: Played[]; winner: number } | null>(null);
  const [showLastTrick, setShowLastTrick] = useState(false);
  const [scoreExpanded, setScoreExpanded] = useState(false);
  const [turn, setTurn] = useState(0);
  const [phase, setPhase] = useState<Phase>("bidding");
  const [message, setMessage] = useState<Message>({ key: "chooseBid" });
  const [pendingJoker, setPendingJoker] = useState<Card | null>(null);
  const [jokerMode, setJokerMode] = useState<"high" | "low">("high");
  const [calledSuit, setCalledSuit] = useState<Suit>("♠");
  const [showRules, setShowRules] = useState(false);
  const [timeLeft, setTimeLeft] = useState(18);
  const [soundOn, setSoundOn] = useState(true);
  const [reaction, setReaction] = useState<{ player: number; text: string } | null>(null);
  const [winnerPulse, setWinnerPulse] = useState<number | null>(null);
  const [trumpChooser, setTrumpChooser] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatExpanded, setChatExpanded] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const firstDealer = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);
  const announcedOpeningBids = useRef<number | null>(null);
  const gameId = useRef(crypto.randomUUID());
  const rewarded = useRef(false);
  const [gameReward, setGameReward] = useState<EconomyResult | null>(null);

  const ensureAudioContext = () => {
    if (typeof window === "undefined") return null;
    const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return null;
    const context = audioRef.current ?? new AudioContextConstructor();
    audioRef.current = context;
    if (context.state === "suspended") void context.resume();
    return context;
  };

  const primeAudioContext = (audible = false) => {
    const context = ensureAudioContext();
    if (!context) return null;
    try {
      // iOS must see a source created and started inside the original touch event.
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(audible ? 660 : 220, context.currentTime);
      gain.gain.setValueAtTime(audible ? .0001 : .000001, context.currentTime);
      if (audible) {
        gain.gain.exponentialRampToValueAtTime(.045, context.currentTime + .008);
        gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .09);
      }
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.start(context.currentTime); oscillator.stop(context.currentTime + (audible ? .1 : .02));
      if (context.state === "suspended") void context.resume().catch(() => {});
    } catch { /* Audio remains optional when the browser blocks it. */ }
    return context;
  };

  useEffect(() => {
    let unlocked = false;
    const unlock = () => {
      if (unlocked) return;
      const context = primeAudioContext();
      if (context) unlocked = true;
    };
    const resumeVisibleAudio = () => { if (document.visibilityState === "visible") unlock(); };
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("touchend", unlock, { passive: true });
    window.addEventListener("click", unlock, { passive: true });
    document.addEventListener("visibilitychange", resumeVisibleAudio);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("touchend", unlock);
      window.removeEventListener("click", unlock);
      document.removeEventListener("visibilitychange", resumeVisibleAudio);
    };
  }, []);

  const playCardSound = () => {
    if (!soundOn) return;
    try {
      const context = ensureAudioContext();
      if (!context) return;
      const now = context.currentTime;
      const master = context.createGain();
      const compressor = context.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, now); compressor.ratio.setValueAtTime(4, now);
      master.gain.setValueAtTime(.9, now); master.connect(compressor); compressor.connect(context.destination);
      const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * .15), context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < data.length; index++) {
        const progress = index / data.length;
        const paper = (Math.random() * 2 - 1) * Math.pow(1 - progress, 3.6);
        const slap = index < context.sampleRate * .012 ? (Math.random() * 2 - 1) * (1 - index / (context.sampleRate * .012)) : 0;
        data[index] = paper * .72 + slap * .48;
      }
      const source = context.createBufferSource();
      const high = context.createBiquadFilter();
      const low = context.createBiquadFilter();
      const gain = context.createGain();
      source.buffer = buffer;
      high.type = "highpass"; high.frequency.setValueAtTime(180, now);
      low.type = "lowpass"; low.frequency.setValueAtTime(4200, now); low.frequency.exponentialRampToValueAtTime(1200, now + .13);
      gain.gain.setValueAtTime(.18, now); gain.gain.exponentialRampToValueAtTime(.0001, now + .15);
      source.connect(high); high.connect(low); low.connect(gain); gain.connect(master);
      source.start(now); source.stop(now + .16);
    } catch { /* Sound is optional when the browser blocks audio. */ }
  };

  const playBidSound = () => {
    if (!soundOn) return;
    try {
      const context = ensureAudioContext();
      if (!context) return;
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(620, now);
      oscillator.frequency.exponentialRampToValueAtTime(470, now + .065);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.045, now + .006);
      gain.gain.exponentialRampToValueAtTime(.0001, now + .075);
      oscillator.connect(gain); gain.connect(context.destination);
      oscillator.start(now); oscillator.stop(now + .08);
    } catch { /* Sound is optional when the browser blocks audio. */ }
  };

  const playTimerTick = (urgent: boolean) => {
    if (!soundOn) return;
    try {
      const context = ensureAudioContext();
      if (!context) return;
      const now = context.currentTime;
      const tone = context.createOscillator(); const gain = context.createGain();
      tone.type = "sine";
      tone.frequency.setValueAtTime(urgent ? 1080 : 790, now);
      tone.frequency.exponentialRampToValueAtTime(urgent ? 860 : 650, now + .055);
      gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(urgent ? .055 : .038, now + .006); gain.gain.exponentialRampToValueAtTime(.0001, now + .075);
      tone.connect(gain); gain.connect(context.destination); tone.start(now); tone.stop(now + .08);
    } catch { /* Sound is optional when the browser blocks audio. */ }
  };

  const playReactionSound = (kind: "hurry" | "what" | "good") => {
    if (!soundOn) return;
    try {
      const context = ensureAudioContext();
      if (!context) return;
      const now = context.currentTime;
      const notes = kind === "good" ? [440, 554, 659] : kind === "hurry" ? [520, 520, 620] : [156, 118];
      notes.forEach((frequency, index) => {
        const delay = index * (kind === "hurry" ? .075 : .11);
        const tone = context.createOscillator(); const gain = context.createGain();
        tone.type = kind === "good" ? "triangle" : kind === "hurry" ? "square" : "sawtooth";
        tone.frequency.setValueAtTime(frequency, now + delay);
        if (kind === "what") tone.frequency.exponentialRampToValueAtTime(frequency * .7, now + delay + .1);
        gain.gain.setValueAtTime(.0001, now + delay); gain.gain.exponentialRampToValueAtTime(kind === "good" ? .035 : .045, now + delay + .008); gain.gain.exponentialRampToValueAtTime(.0001, now + delay + .1);
        tone.connect(gain); gain.connect(context.destination); tone.start(now + delay); tone.stop(now + delay + .12);
      });
    } catch { /* Sound is optional when the browser blocks audio. */ }
  };

  const setupHand = (index: number) => {
    const next = dealHand(handPlan[index], index, firstDealer.current);
    setHandIndex(index); setDealer(next.dealer); setHands(next.hands); setIndicator(next.indicator); setTrump(next.trump);
    setBids(initialBotBids(next.dealer, handPlan[index], next.hands, next.trump)); setTricks([0,0,0,0]); setTable([]);
    const chooser = (next.dealer + 1) % 4;
    setTrumpChooser(chooser);
    setPhase(handPlan[index] === 9 ? "choosing-trump" : "revealing");
    setMessage(handPlan[index] === 9 ? (chooser === 0 ? { key: "chooseTrump" } : { key: "waitingTrump", player: chooser }) : { key: "reviewCards" });
    const nextBounds = setBounds(mode, index);
    setPendingJoker(null); setTakingWinner(null); setShowLastTrick(false); setSelectedPlayer(null);
    if (index === nextBounds.start) setPremiumPlayers([]);
  };
  useEffect(() => { firstDealer.current = Math.floor(Math.random() * 4); setupHand(0); }, []);
  useEffect(() => {
    if (phase !== "revealing") return;
    const timer = window.setTimeout(() => { setPhase("bidding"); setMessage({ key: "chooseBid" }); }, 90);
    return () => window.clearTimeout(timer);
  }, [phase, handIndex]);

  useEffect(() => {
    if (phase !== "bidding" || announcedOpeningBids.current === handIndex) return;
    announcedOpeningBids.current = handIndex;
    const players = biddingOrder(dealer).filter((player) => player !== 0 && bids[player] !== null);
    players.forEach((_, index) => window.setTimeout(() => playBidSound(), 120 * (index + 1)));
  }, [phase, handIndex, dealer, bids]);

  const chooseNineTrump = (choice: Suit | null) => {
    setTrump(choice); setBids(initialBotBids(dealer, handPlan[handIndex], hands, choice)); setPhase("revealing"); setMessage({ key: "reviewCards" });
  };

  useEffect(() => {
    if (phase !== "choosing-trump" || trumpChooser === 0) return;
    const timer = window.setTimeout(() => {
      const firstThree = hands[trumpChooser].slice(0, 3).filter((card) => !card.joker);
      const choices = SUITS.map((suit) => {
        const suited = firstThree.filter((card) => card.suit === suit);
        const highCards = suited.reduce((value, card) => value + Math.max(0, card.value - 10) * .22, 0);
        return { suit, score: suited.length * 1.4 + highCards };
      }).sort((a, b) => b.score - a.score);
      const best = choices[0];
      chooseNineTrump(best.score >= 2.5 || (best.score >= 1.6 && Math.random() < .42) ? best.suit : null);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [phase, trumpChooser, hands]);
  useEffect(() => {
    if (phase !== "hand-over") return;
    const timer = window.setTimeout(() => setupHand(handIndex + 1), 360);
    return () => window.clearTimeout(timer);
  }, [phase, handIndex]);

  const invalidBid = useMemo(() => {
    if (dealer !== 0) return -1;
    const sum = bids.reduce<number>((total, bid, player) => total + (player === 0 ? 0 : (bid ?? 0)), 0);
    return handPlan[handIndex] - sum;
  }, [dealer, bids, handIndex, handPlan]);

  const placeBid = (bid: number) => {
    playBidSound();
    const finalBids = completeBids(bids, bid, dealer, handPlan[handIndex], hands, trump);
    const remainingPlayers = biddingOrder(dealer).filter((player) => player !== 0 && bids[player] === null && finalBids[player] !== null);
    remainingPlayers.forEach((_, index) => window.setTimeout(() => playBidSound(), 120 * (index + 1)));
    setBids(finalBids); setPhase("playing");
    const leader = (dealer + 1) % 4; setTurn(leader); setMessage(leader === 0 ? { key: "yourTurn" } : { key: "playerStarts", player: leader });
  };

  const finishTrick = (completed: Played[], nextHands: Card[][]) => {
    const winner = trickWinner(completed, trump);
    const nextTricks = tricks.map((value, player) => value + (player === winner ? 1 : 0));
    setTable(completed); setTricks(nextTricks); setTakingWinner(null); setLastTrick({ cards: completed, winner }); setMessage(winner === 0 ? { key: "youTake" } : { key: "playerTakes", player: winner }); setWinnerPulse(winner);
    window.setTimeout(() => setTakingWinner(winner), 120);
    window.setTimeout(() => {
      setTable([]); setTakingWinner(null); setWinnerPulse(null);
      if (nextHands.every((hand) => hand.length === 0)) {
        const points = nextTricks.map((won, player) => scoreHand(bids[player] ?? 0, won, handPlan[handIndex]));
        const exactRow = nextTricks.map((won, player) => won === (bids[player] ?? 0));
        const rawHistory = [...scoreHistory, points];
        const rawBids = [...bidHistory, bids.map((bid) => bid ?? 0)];
        const rawExact = [...exactHistory, exactRow];
        const bounds = setBounds(mode, handIndex);
        const premiumResult = handIndex === bounds.end ? applyPremium(rawHistory, rawExact, bounds.start, bounds.end) : { history: rawHistory, premiumPlayers: [] as number[] };
        setScoreHistory(premiumResult.history); setBidHistory(rawBids); setExactHistory(rawExact); setScores(historyTotals(premiumResult.history));
        const exactPlayers = exactRow.map((exact, player) => exact ? player : -1).filter((player) => player >= 0);
        setPremiumPlayers((current) => handIndex === bounds.start ? exactPlayers : current.filter((player) => exactRow[player]));
        setPhase(handIndex === handPlan.length - 1 ? "game-over" : "hand-over"); setMessage({ key: "handOver" });
      } else { setTurn(winner); setMessage(winner === 0 ? { key: "yourTurn" } : { key: "playerPlays", player: winner }); }
    }, 560);
  };

  const play = (player: number, card: Card, mode: "high" | "low" = "high", suit?: Suit) => {
    const nextHands = hands.map((hand, index) => index === player ? hand.filter((item) => item.id !== card.id) : hand);
    const played: Played = { player, card, ...(card.joker ? { jokerMode: mode, calledSuit: table.length ? undefined : suit } : {}) };
    const completed = [...table, played];
    setHands(nextHands); setPendingJoker(null); playCardSound();
    if (completed.length === 4) finishTrick(completed, nextHands);
    else { const nextTurn = (player + 1) % 4; setTable(completed); setTurn(nextTurn); setMessage(nextTurn === 0 ? { key: "yourTurn" } : { key: "playerPlays", player: nextTurn }); }
  };

  useEffect(() => {
    if (phase !== "playing" || turn === 0 || table.length === 4) return;
    const timer = window.setTimeout(() => {
      const move = chooseBotMove(turn, hands[turn], table, trump, bids[turn] ?? 0, tricks[turn]);
      if (!move) return;
      play(turn, move.card, move.mode, move.suit);
    }, 110 + Math.random() * 90);
    return () => window.clearTimeout(timer);
  }, [turn, phase, table, hands]);

  const playerLegal = legalCards(hands[0], table, trump);
  const canPlay = (card: Card) => turn === 0 && phase === "playing" && playerLegal.some((item) => item.id === card.id);
  const choosePlayerCard = (card: Card) => card.joker ? setPendingJoker(card) : play(0, card);
  const bounds = setBounds(mode, handIndex);
  const setNumber = bounds.number;
  const scoreWindow = bounds.end - bounds.start + 1;
  const scoreSetStart = bounds.start;
  const visibleScores = scoreExpanded ? scoreHistory : scoreHistory.slice(scoreSetStart, scoreSetStart + scoreWindow);
  const firstVisibleScore = scoreExpanded ? 1 : scoreSetStart + 1;
  const showLiveScoreRow = phase === "playing" && bids.every((bid) => bid !== null) && scoreHistory.length === handIndex;
  const liveBidBalance = bidBalance(handPlan[handIndex], bids, lang);
  const progressState = (player: number) => {
    const bid = bids[player];
    if (bid === null) return "waiting";
    if (tricks[player] > bid || tricks[player] + hands[player].length < bid) return "failed";
    if (tricks[player] === bid) return "exact";
    return "chasing";
  };
  // Perfect Game belongs to the whole set and disappears as soon as the current bid becomes impossible.
  const perfectGamePlayers = premiumPlayers.filter((player) => progressState(player) !== "failed");
  const sendReaction = (text: string) => {
    if (selectedPlayer === null) return;
    const target = selectedPlayer;
    playReactionSound(text === copy.what ? "what" : text === copy.goodJob ? "good" : "hurry");
    setReaction({ player: target, text });
    setChatMessages((current) => [...current.slice(-19), { id: Date.now(), player: 0, text: `→ ${names[target]}: ${text}` }]);
    setSelectedPlayer(null);
  };
  const sendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatMessages((current) => [...current.slice(-19), { id: Date.now(), player: 0, text }]);
    setChatInput("");
  };

  useEffect(() => {
    if (phase !== "playing") return;
    setTimeLeft(18);
    const timer = window.setInterval(() => setTimeLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [turn, phase, table.length, handIndex]);

  useEffect(() => {
    if (phase !== "playing" || turn !== 0 || timeLeft !== 0) return;
    const card = playerLegal[0];
    if (card) play(0, card, card.joker ? "low" : "high", calledSuit);
  }, [timeLeft, turn, phase]);

  useEffect(() => {
    if (phase === "playing" && timeLeft > 0 && timeLeft <= 5) playTimerTick(timeLeft <= 2);
  }, [timeLeft, turn, phase, soundOn]);

  useEffect(() => {
    if (!reaction) return;
    const timer = window.setTimeout(() => setReaction(null), 1200);
    return () => window.clearTimeout(timer);
  }, [reaction]);

  const standings = useMemo(() => [0,1,2,3].sort((a, b) => scores[b] - scores[a]), [scores]);
  const placement = standings.indexOf(0) + 1;
  const visibleHand = phase === "choosing-trump" ? (trumpChooser === 0 ? hands[0].slice(0,3) : []) : groupedHand(hands[0]);
  useEffect(() => {
    if (phase !== "game-over" || rewarded.current) return;
    rewarded.current = true;
    void awardCoins(`finish-${gameId.current}`, "finish", placement).then((result) => result && setGameReward(result));
  }, [phase, placement, awardCoins]);

  return <main className={`v2-match theme-${theme}`} style={theme === "custom" ? customThemeStyle(customColor) : undefined}>
    <header className="v2-match-top"><button className="v2-back" onClick={() => exit(phase !== "game-over", gameId.current)}><ArrowLeft /> {copy.lobby}</button><div className="v2-match-brand"><Logo compact />{room && <span className="v2-match-room">{room.visibility === "private" ? <Lock /> : <Globe2 />}<b>{room.code}</b></span>}</div><div className="v2-match-tools"><span className="v2-coin-pill compact"><Coins />{coins.toLocaleString()}</span><LanguageToggle lang={lang} setLang={setLang} /><button className={`v2-sound ${soundOn ? "is-on" : "is-off"}`} onPointerDown={() => primeAudioContext()} onClick={() => { const next = !soundOn; setSoundOn(next); if (next) primeAudioContext(true); }} aria-label={copy.sound} aria-pressed={soundOn} title={copy.sound}>{soundOn ? <Volume2 /> : <VolumeX />}</button><button onClick={() => setShowRules(true)}><BookOpen /> {copy.rules}</button><ThemePicker compact theme={theme} setTheme={setTheme} customColor={customColor} setCustomColor={setCustomColor} lang={lang} /></div></header>
    <a href={AD_EMAIL_HREF} className="v2-ad-rail" aria-label={copy.advertise}><span>AD</span><b>{copy.advertise}</b><Plus /></a>
    <section className={`v2-table ${chatExpanded ? "chat-open" : ""}`}>
      <div className="v2-table-arena" aria-hidden="true"><span className="v2-table-rim" /><span className="v2-table-monogram">JOKER</span><i className="seat-mark seat-north" /><i className="seat-mark seat-east" /><i className="seat-mark seat-south" /><i className="seat-mark seat-west" /></div>
      <aside className={`v2-scoreboard ${scoreExpanded ? "expanded" : ""}`} aria-label={copy.scoreTable}><div className="v2-scoreboard-title"><span>{copy.scoreTable}</span><small>{copy.bidTookScore}</small><b>{mode === "full" ? `${setNumber}/4` : `${handIndex + 1}/${handPlan.length}`}</b><button onClick={() => setScoreExpanded((value) => !value)} aria-label={scoreExpanded ? copy.collapseTable : copy.expandTable} aria-expanded={scoreExpanded}>{scoreExpanded ? <Minimize2 /> : <Maximize2 />}</button></div><div className="v2-score-summary">{names.map((name, player) => <span key={name} className={player === 0 ? "you" : ""}><b>{player === 0 ? copy.you : name}</b><strong>{formatScore(scores[player])}</strong></span>)}</div><table><thead><tr><th>№</th>{names.map((name) => <th key={name}>{name}</th>)}</tr></thead><tbody>{visibleScores.map((row, rowIndex) => { const historyIndex = (scoreExpanded ? 0 : scoreSetStart) + rowIndex; const setBreak = mode === "full" && [7,11,19,23].includes(historyIndex); return <tr className={setBreak ? "set-break" : "deal-divider"} key={firstVisibleScore + rowIndex}><td>{firstVisibleScore + rowIndex}</td>{row.map((value, player) => { const bid = bidHistory[historyIndex]?.[player] ?? 0; const exact = exactHistory[historyIndex]?.[player]; return <td key={player} className={`${value < 0 ? "negative " : ""}${exact ? "deal-perfect" : "deal-missed"}`}><span><b>{bid === 0 ? "−" : bid}</b><i>–</i>{value < 0 ? `−${Math.abs(value)}` : value}</span></td>; })}</tr>; })}{showLiveScoreRow && <tr className="live-deal"><td>{handIndex + 1}</td>{bids.map((bid, player) => <td key={player}><span><b>{bid === 0 ? "−" : bid}</b><i>–</i><em>…</em></span></td>)}</tr>}{!visibleScores.length && !showLiveScoreRow && <tr className="empty"><td colSpan={5}>{copy.firstHand}</td></tr>}</tbody><tfoot><tr><td>Σ</td>{scores.map((value, player) => <td key={player}>{formatScore(value)}</td>)}</tr></tfoot></table></aside>
      <div className="v2-progress"><span>{copy.set} {setNumber}/{bounds.total}</span><div><i style={{ width: `${((handIndex + 1) / handPlan.length) * 100}%` }} /></div><b>{copy.hand} {handIndex - bounds.start + 1}/{bounds.end - bounds.start + 1} · {handPlan[handIndex]} {cardWord(handPlan[handIndex])}</b></div>
      <div className="v2-trump"><span>{copy.trump}</span>{indicator && <CardFace card={indicator} theme={theme} small />}{handPlan[handIndex] === 9 && phase === "choosing-trump" ? <b>?</b> : trump ? <b className={`v2-trump-suit ${trump === "♥" || trump === "♦" ? "red" : "black"}`}>{trump}</b> : <b className="v2-no-trump">{copy.noTrump}</b>}</div>
      {[1,2,3].map((player) => <div key={player} role="button" tabIndex={0} aria-label={`${names[player]} · ${copy.hurry} / ${copy.what}`} onClick={() => setSelectedPlayer((current) => current === player ? null : player)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedPlayer((current) => current === player ? null : player); }} data-turn={copy.turn} className={`v2-player v2-player-${player} ${turn === player && phase === "playing" ? "active-turn" : ""} ${winnerPulse === player ? "trick-winner" : ""} ${selectedPlayer === player ? "reaction-selected" : ""}`}>{turn === player && phase === "playing" && <div className="v2-seat-timer" aria-label={`${copy.time}: ${timeLeft}`}><span>{timeLeft}</span><i style={{ "--timer": `${(timeLeft / 18) * 360}deg` } as CSSProperties} /></div>}<div className={`v2-avatar a${player}`}><TopDownTablePortrait avatar={BOT_AVATARS[player]} /></div><b>{names[player]}</b><span>{phase === "choosing-trump" ? (player === trumpChooser ? 3 : 0) : hands[player].length} {cardWord(phase === "choosing-trump" ? (player === trumpChooser ? 3 : 0) : hands[player].length)}</span><div className={`v2-target ${progressState(player)}`} title={progressState(player) === "failed" ? copy.failed : progressState(player) === "exact" ? copy.exact : ""}>{bids[player] === null ? "—" : `${tricks[player]}/${bids[player]}`}</div>{perfectGamePlayers.includes(player) && <small className="v2-premium-badge"><Zap />{copy.premium}</small>}{reaction?.player === player && <div className={`v2-reaction-bubble ${reaction.text === copy.what ? "angry" : ""}`}>{reaction.text}</div>}{turn === player && phase === "playing" && timeLeft <= 5 && <div className="v2-hurry-bubble">{copy.hurry}</div>}</div>)}
      {phase !== "hand-over" && phase !== "game-over" && winnerPulse === null && <div className="v2-center-message">{messageText(message, lang, names)}</div>}
      {phase === "playing" && liveBidBalance && <div className={`v2-bid-balance v2-live-balance ${liveBidBalance.kind}`}><strong>{liveBidBalance.text}</strong></div>}
      <div className={`v2-trick ${takingWinner !== null ? `taking-player-${takingWinner}` : ""}`}>{table.map((item, index) => <div className={`v2-played seat-${item.player} from-player-${item.player}`} key={`${item.player}-${item.card.id}`}><CardFace card={item.card} theme={theme} small />{item.card.joker && <span>{index === 0 ? (item.jokerMode === "high" ? copy.high : copy.letTake) : (item.jokerMode === "high" ? copy.jokerIt : copy.under)}{item.calledSuit ? ` ${item.calledSuit}` : ""}</span>}</div>)}</div>
      {lastTrick && <button className="v2-last-trick-strip" onClick={() => setShowLastTrick(true)} aria-label={copy.lastFour}>{lastTrick.cards.map((item) => <CardFace key={`${item.player}-${item.card.id}`} card={item.card} theme={theme} small hidden />)}</button>}
      <div className={`v2-you ${turn === 0 && phase === "playing" ? "active-turn" : ""} ${winnerPulse === 0 ? "trick-winner" : ""}`}><div className="v2-you-info">{turn === 0 && phase === "playing" && <div className="v2-seat-timer" aria-label={`${copy.time}: ${timeLeft}`}><span>{timeLeft}</span><i style={{ "--timer": `${(timeLeft / 18) * 360}deg` } as CSSProperties} /></div>}<div className="v2-avatar you"><TopDownTablePortrait avatar={avatar} /></div><div><b>{playerName}</b><span>{turn === 0 && phase === "playing" ? copy.yourTurn : copy.player}</span></div><div className={`v2-target ${progressState(0)}`}>{bids[0] === null ? "—" : `${tricks[0]}/${bids[0]}`}</div>{perfectGamePlayers.includes(0) && <small className="v2-premium-badge"><Zap />{copy.premium}</small>}</div>
        {turn === 0 && phase === "playing" && timeLeft <= 5 && <div className="v2-hurry-bubble v2-you-hurry">{copy.hurry}</div>}
        <div className="v2-hand">{visibleHand.map((card, index) => <button className={index > 0 && visibleHand[index - 1].suit !== card.suit ? "suit-start" : ""} data-suit={card.suit} key={card.id} disabled={!canPlay(card)} onClick={() => choosePlayerCard(card)}><CardFace card={card} theme={theme} /></button>)}</div>
      </div>

      {phase === "playing" && selectedPlayer !== null && <div className={`v2-direct-reactions target-${selectedPlayer}`}><button onClick={() => sendReaction(copy.hurry)}>{copy.hurry}</button><button className="angry" onClick={() => sendReaction(copy.what)}>{copy.what}</button><button className="positive" onClick={() => sendReaction(copy.goodJob)}>{copy.goodJob}</button></div>}

      <aside className={`v2-chat ${chatExpanded ? "expanded" : ""}`}><header><span><MessageCircle />{copy.chat}</span><button onClick={() => setChatExpanded((value) => !value)} aria-label={chatExpanded ? copy.collapseChat : copy.expandChat} aria-expanded={chatExpanded}>{chatExpanded ? <Minimize2 /> : <MessageCircle />}</button></header><div className="v2-chat-feed">{chatMessages.length ? chatMessages.map((item) => <p key={item.id} className={item.player === 0 ? "mine" : ""}><b>{names[item.player]}</b><span>{item.text}</span></p>) : <p className="v2-chat-empty">{copy.chat}</p>}</div><form onSubmit={(event) => { event.preventDefault(); sendChat(); }}><input value={chatInput} onChange={(event) => setChatInput(event.target.value)} maxLength={120} placeholder={copy.chatPlaceholder} aria-label={copy.chatPlaceholder} /><button type="submit" aria-label={copy.send}><Send /></button></form></aside>

      {phase === "choosing-trump" && trumpChooser === 0 && <section className="v2-trump-chooser"><div><p className="v2-kicker">{copy.chooseTrump}</p><div className="v2-first-three">{hands[0].slice(0,3).map((card) => <CardFace key={card.id} card={card} theme={theme} small />)}</div></div><div className="v2-trump-options">{SUITS.map((suit) => <button key={suit} className={suit === "♥" || suit === "♦" ? "red" : ""} onClick={() => chooseNineTrump(suit)}>{suit}</button>)}<button className="no-trump" onClick={() => chooseNineTrump(null)}>{copy.noTrump}</button></div></section>}

      {phase === "bidding" && <section className="v2-bid-dock" aria-label={copy.chooseBid}><div className="v2-bid-grid">{Array.from({length:10},(_,i)=>i).map((bid) => <button key={bid} aria-label={bid === 0 ? copy.pass : `${bid} ${trickWord(bid)}`} disabled={bid > handPlan[handIndex] || bid === invalidBid} onClick={() => placeBid(bid)}>{bid === 0 ? "−" : bid}</button>)}</div></section>}

      {pendingJoker && <div className="v2-action-bg"><section className="v2-joker-choice"><CardFace card={pendingJoker} theme={theme} /><div><button className="v2-joker-back" onClick={() => setPendingJoker(null)}><ArrowLeft />{copy.backToCards}</button><p className="v2-kicker">{copy.jokerChoice}</p><h2>{table.length ? copy.followJoker : copy.leadJoker}</h2><div className="v2-segment"><button className={jokerMode === "high" ? "active" : ""} onClick={() => setJokerMode("high")}><Crown /> {table.length ? copy.jokerIt : copy.high}</button><button className={jokerMode === "low" ? "active" : ""} onClick={() => setJokerMode("low")}>↓ {table.length ? copy.under : copy.letTake}</button></div>{!table.length && <><p className="v2-joker-hint">{jokerMode === "high" ? copy.highHint : copy.letTakeHint}</p><div className="v2-suit-choice"><span>{copy.callSuit}</span>{SUITS.map((s) => <button key={s} className={calledSuit === s ? "active" : ""} onClick={() => setCalledSuit(s)}>{s}</button>)}</div></>}<button className="v2-confirm" onClick={() => play(0,pendingJoker,jokerMode,calledSuit)}>{table.length ? (jokerMode === "high" ? copy.jokerIt : copy.under) : (jokerMode === "high" ? copy.high : copy.letTake)}</button></div></section></div>}

      {phase === "game-over" && <div className="v2-game-over-screen" role="dialog" aria-modal="true" aria-labelledby="game-winner-title">
        <div className="v2-fireworks" aria-hidden="true"><i className="burst-one" /><i className="burst-two" /><i className="burst-three" />{Array.from({ length: 42 }, (_, index) => <span key={index} style={{ "--piece": index, "--piece-x": `${(index * 37) % 100}%`, "--piece-delay": `${(index % 9) * .07}s`, "--piece-drift": `${((index % 5) - 2) * 24}px` } as CSSProperties} />)}</div>
        <section className="v2-game-result"><Crown /><p>{lang === "ka" ? "პარტია დასრულდა" : "Game complete"}</p><h2 id="game-winner-title">{lang === "ka" ? `${names[standings[0]]} იმარჯვებს!` : `${names[standings[0]]} wins!`}</h2>
          <div className="v2-final-standings">{standings.map((player, index) => <div key={player} className={`${player === 0 ? "is-you" : ""} place-${index + 1}`}><strong>{index + 1}</strong><span>{player === 0 ? <AvatarPortrait avatar={avatar} compact /> : <TablePlayerPortrait player={player} />}</span><b>{names[player]}</b><em>{formatScore(scores[player])}</em>{index === 0 && <Crown />}</div>)}</div>
          <div className="v2-result-reward"><Coins /><b>{gameReward ? (gameReward.delta > 0 ? `+${gameReward.delta}` : gameReward.delta) : placement <= 2 ? (placement === 1 ? "+100" : "+50") : "+0"}</b><small>{lang === "ka" ? `შენი ბალანსი: ${(gameReward?.coins ?? coins).toLocaleString()}` : `Your balance: ${(gameReward?.coins ?? coins).toLocaleString()}`}</small></div>
          <button onClick={() => exit(false, gameId.current)}>{copy.lobby}<ChevronRight /></button>
        </section>
      </div>}

    </section>
    {showRules && <RulesPanel close={() => setShowRules(false)} lang={lang} />}
    {showLastTrick && lastTrick && <div className="v2-modal-bg" onMouseDown={(event) => event.target === event.currentTarget && setShowLastTrick(false)}><section className="v2-last-trick" role="dialog" aria-modal="true"><button className="v2-close" onClick={() => setShowLastTrick(false)}><X /></button><p className="v2-kicker">{copy.lastTrick}</p><h2>{lastTrick.winner === 0 ? `${copy.you} ${copy.takesFour}` : `${names[lastTrick.winner]} ${copy.takesFour}`}</h2><div>{lastTrick.cards.map((item) => <figure key={`${item.player}-${item.card.id}`}><CardFace card={item.card} theme={theme} small /><figcaption>{names[item.player]}</figcaption></figure>)}</div></section></div>}
  </main>;
}

function AuthenticatedJoker({ emailConnection }: { emailConnection: string }) {
  const { isAuthenticated, user, loginWithRedirect, logout, getAccessTokenSilently } = useAuth0();
  const [guestMode, setGuestMode] = useState(false);
  const [theme, setThemeState] = useState<Theme>("red");
  const [customColor, setCustomColorState] = useState("#7c3aed");
  const [lang, setLangState] = useState<Lang>("ka");
  const [screen, setScreen] = useState<"lobby" | "match" | "scorepad">("lobby");
  const [showAuth, setShowAuth] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode>("full");
  const [selectedRoom, setSelectedRoom] = useState<RoomSummary | null>(null);
  const [activeMatch, setActiveMatch] = useState(false);
  const [matchLeftAt, setMatchLeftAt] = useState<number | null>(null);
  const [avatar, setAvatarState] = useState<AvatarStyle>(DEFAULT_AVATAR);
  const [avatarBuilt, setAvatarBuilt] = useState(false);
  const [coins, setCoins] = useState(0);
  const leaveTimerRef = useRef<number | null>(null);
  const authMode: AuthMode = guestMode ? "guest" : user?.sub?.startsWith("google-oauth2|") ? "google" : user?.sub?.startsWith("facebook|") ? "facebook" : "email";
  const hasAccess = isAuthenticated || guestMode;

  useEffect(() => { preloadCardAssets(); }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("jokera-theme") as Theme | null;
    const savedCustomColor = window.localStorage.getItem("jokera-custom-color");
    const savedLang = window.localStorage.getItem("cardora-language") as Lang | null;
    const savedAvatar = window.localStorage.getItem("joker-avatar");
    const savedGuest = window.localStorage.getItem("joker-guest-session") === "active";
    if (savedTheme && [...THEMES, "custom"].includes(savedTheme)) setThemeState(savedTheme);
    if (savedCustomColor && /^#[0-9a-f]{6}$/i.test(savedCustomColor)) setCustomColorState(savedCustomColor);
    if (savedLang === "ka" || savedLang === "en") setLangState(savedLang);
    window.localStorage.removeItem("jokera-ban-until");
    if (savedGuest) {
      setGuestMode(true);
      const savedGuestCoins = Number(window.localStorage.getItem("joker-guest-coins") || "0");
      setCoins(Number.isFinite(savedGuestCoins) ? savedGuestCoins : 0);
    }
    if (savedAvatar) {
      try {
        setAvatarState(normalizeAvatar(JSON.parse(savedAvatar)));
        setAvatarBuilt(window.localStorage.getItem("joker-avatar-built") === "1");
      } catch { /* keep the default avatar */ }
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || guestMode) return;
    let active = true;
    void (async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch(`/api/profile?provider=${authMode}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!response.ok || !active) return;
        const profile = await response.json() as { avatar?: unknown; coins?: number };
        if (profile.avatar) {
          const saved = normalizeAvatar(profile.avatar);
          setAvatarState(saved);
          window.localStorage.setItem("joker-avatar", JSON.stringify(saved));
          if (window.localStorage.getItem("joker-avatar-built") === "1") setAvatarBuilt(true);
        } else {
          await fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ provider: authMode, avatar }),
          });
        }
        setCoins(typeof profile.coins === "number" ? profile.coins : 0);
      } catch { /* The gate remains signed in while a profile request is retried later. */ }
    })();
    return () => { active = false; };
  }, [isAuthenticated, guestMode, user?.sub]);

  useEffect(() => {
    if (!isAuthenticated || !guestMode) return;
    window.localStorage.removeItem("joker-guest-session");
    setGuestMode(false);
  }, [isAuthenticated, guestMode]);

  useEffect(() => () => {
    if (leaveTimerRef.current !== null) window.clearTimeout(leaveTimerRef.current);
  }, []);

  const setTheme = (next: Theme) => { setThemeState(next); window.localStorage.setItem("jokera-theme", next); };
  const setCustomColor = (next: string) => { setCustomColorState(next); setThemeState("custom"); window.localStorage.setItem("jokera-custom-color", next); window.localStorage.setItem("jokera-theme", "custom"); };
  const setLang = (next: Lang) => { setLangState(next); window.localStorage.setItem("cardora-language", next); };
  const saveProfile = async (next: AvatarStyle) => {
    if (!isAuthenticated || guestMode) return;
    try {
      const token = await getAccessTokenSilently();
      await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ provider: authMode, avatar: next }) });
    } catch { /* Local avatar remains usable if persistence is temporarily unavailable. */ }
  };
  const setAvatar = (next: AvatarStyle) => { setAvatarState(next); setAvatarBuilt(true); window.localStorage.setItem("joker-avatar", JSON.stringify(next)); window.localStorage.setItem("joker-avatar-built", "1"); void saveProfile(next); };
  const playerName = guestMode ? (lang === "ka" ? "სტუმარი" : "Guest") : user?.name || user?.email || (authMode === "google" ? "Google Player" : authMode === "facebook" ? "Facebook Player" : "Email Player");
  const login = (mode: AuthMode) => {
    if (mode === "guest") {
      window.localStorage.setItem("joker-guest-session", "active");
      setGuestMode(true);
      setShowAuth(false);
      return;
    }
    const connection = mode === "google" ? "google-oauth2" : mode === "facebook" ? "facebook" : emailConnection;
    void loginWithRedirect({ authorizationParams: { connection, redirect_uri: window.location.origin, scope: "openid profile email" } });
  };
  const signOut = () => {
    if (guestMode) {
      window.localStorage.removeItem("joker-guest-session");
      setGuestMode(false);
      setShowAuth(false);
      setScreen("lobby");
      return;
    }
    void logout({ logoutParams: { returnTo: window.location.origin } });
  };
  const chooseMode = (mode: GameMode, room?: RoomSummary) => {
    if (!hasAccess) { setShowAuth(true); return; }
    if (activeMatch) {
      const sameTable = mode === selectedMode && (room?.code ?? null) === (selectedRoom?.code ?? null);
      if (sameTable) {
        if (leaveTimerRef.current !== null) window.clearTimeout(leaveTimerRef.current);
        leaveTimerRef.current = null;
        setMatchLeftAt(null);
        setScreen("match");
      }
      return;
    }
    setSelectedMode(mode); setSelectedRoom(room ?? null); setScreen("match");
    setActiveMatch(true);
  };
  const awardCoins = async (eventId: string, action: "finish" | "leave", placement?: number) => {
    if (guestMode) {
      let savedEvents: unknown = [];
      try { savedEvents = JSON.parse(window.localStorage.getItem("joker-guest-events") || "[]") as unknown; } catch { /* Start a clean guest reward history. */ }
      const usedEvents = new Set(Array.isArray(savedEvents) ? savedEvents.filter((item): item is string => typeof item === "string") : []);
      const tier = (value: number) => value >= 10000 ? 5 : value >= 2000 ? 4 : value >= 1500 ? 3 : value >= 1000 ? 2 : value >= 500 ? 1 : 0;
      if (usedEvents.has(eventId)) return { coins, delta: 0, tier: tier(coins) };
      const delta = action === "leave" ? -500 : placement === 1 ? 100 : placement === 2 ? 50 : 0;
      const nextCoins = coins + delta;
      usedEvents.add(eventId);
      window.localStorage.setItem("joker-guest-events", JSON.stringify([...usedEvents].slice(-100)));
      window.localStorage.setItem("joker-guest-coins", String(nextCoins));
      setCoins(nextCoins);
      return { coins: nextCoins, delta, tier: tier(nextCoins) };
    }
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch("/api/economy", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ eventId, action, placement }) });
      if (!response.ok) return null;
      const result = await response.json() as EconomyResult;
      setCoins(result.coins);
      return result;
    } catch { return null; }
  };
  const exitMatch = (early: boolean, gameId: string) => {
    if (!early) {
      if (leaveTimerRef.current !== null) window.clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
      setMatchLeftAt(null);
      setActiveMatch(false);
      setScreen("lobby");
      return;
    }
    if (leaveTimerRef.current !== null) window.clearTimeout(leaveTimerRef.current);
    setMatchLeftAt(Date.now());
    leaveTimerRef.current = window.setTimeout(() => {
      void awardCoins(`leave-${gameId}`, "leave");
      setActiveMatch(false);
      setMatchLeftAt(null);
      leaveTimerRef.current = null;
    }, 120_000);
    setScreen("lobby");
  };

  return <>{screen === "lobby" && <Lobby theme={theme} setTheme={setTheme} customColor={customColor} setCustomColor={setCustomColor} play={chooseMode} openScorePad={() => setScreen("scorepad")} lang={lang} setLang={setLang} authMode={authMode} hasAccess={hasAccess} resumeMode={activeMatch && matchLeftAt !== null && !selectedRoom ? selectedMode : null} avatar={avatar} avatarBuilt={avatarBuilt} coins={coins} onAccount={() => setShowAuth(true)} />}{screen === "scorepad" && <ScorePad theme={theme} customColor={customColor} lang={lang} setLang={setLang} exit={() => setScreen("lobby")} />}{activeMatch && <div hidden={screen !== "match"}><Match key={`${selectedMode}-${selectedRoom?.code ?? "solo"}`} theme={theme} setTheme={setTheme} customColor={customColor} setCustomColor={setCustomColor} playerName={playerName} avatar={avatar} coins={coins} awardCoins={awardCoins} exit={exitMatch} lang={lang} setLang={setLang} mode={selectedMode} room={selectedRoom} /></div>}{showAuth && <AuthModal close={() => setShowAuth(false)} login={!hasAccess ? login : undefined} authenticated={hasAccess} logout={hasAccess ? signOut : undefined} coins={coins} lang={lang} setLang={setLang} avatar={avatar} setAvatar={setAvatar} />}</>;
}

export default function CardoraGameV2() {
  const [config, setConfig] = useState<Auth0Config | null>(null);
  const [configurationError, setConfigurationError] = useState(false);
  useEffect(() => {
    void fetch("/api/auth0-config").then(async (response) => {
      if (!response.ok) throw new Error("Auth0 is not configured");
      return response.json() as Promise<Auth0Config>;
    }).then(setConfig).catch(() => setConfigurationError(true));
  }, []);

  if (!config) return <main className="v2-auth-loading theme-purple"><Logo /><span />{configurationError ? <><h1>JOKER</h1><p>Authentication setup is being completed.</p></> : <p>Loading secure sign-in…</p>}</main>;
  return <Auth0Provider domain={config.domain} clientId={config.clientId} authorizationParams={{ redirect_uri: typeof window === "undefined" ? undefined : window.location.origin, scope: "openid profile email" }} cacheLocation="localstorage"><AuthenticatedJoker emailConnection={config.emailConnection} /></Auth0Provider>;
}
