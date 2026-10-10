"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, ArrowRight, Menu, X, Phone, Volume2, VolumeX, Check, Heart, Plus, Radio, MoveUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Modal, Reveal, Star } from "@/components/ui";
import { moods, stories } from "@/lib/content";

type Note = { name: string; message: string };

function Portrait({ who, className = "" }: { who: "her" | "him"; className?: string }) {
  return <div className={`portrait portrait-${who} ${className}`}><Image src="/images/duo.png" alt={who === "her" ? "Портрет девушки с белым кроксом у уха" : "Портрет парня с белым кроксом у уха"} fill sizes="(max-width: 700px) 90vw, 40vw"/></div>;
}

export default function Home() {
  const [menu, setMenu] = useState(false);
  const [story, setStory] = useState<number | null>(null);
  const [gallery, setGallery] = useState<number | null>(null);
  const [call, setCall] = useState(false);
  const [mood, setMood] = useState(0);
  const [guestbook, setGuestbook] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [saved, setSaved] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [sound, setSound] = useState(false);
  const [soundError, setSoundError] = useState("");
  const [liked, setLiked] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const hero = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 65]);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const tiltX = useSpring(pointerX, { stiffness: 130, damping: 22 });
  const tiltY = useSpring(pointerY, { stiffness: 130, damping: 22 });
  const nav = [{ href: "#about", label: "О нас" }, { href: "#stories", label: "Истории" }, { href: "#moments", label: "Моменты" }];

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("duo-notes") ?? "[]");
      if (Array.isArray(stored)) setNotes(stored.filter(n => typeof n?.name === "string" && typeof n?.message === "string").slice(0, 12));
      setLiked(localStorage.getItem("duo-liked") === "true");
    } catch { /* A browser may disable local storage. The page remains usable. */ }
    return () => { if (timer.current) clearInterval(timer.current); void audio.current?.close(); };
  }, []);

  async function toggleSound() {
    if (sound) {
      if (timer.current) clearInterval(timer.current);
      await audio.current?.suspend(); setSound(false); return;
    }
    try {
      audio.current ??= new AudioContext();
      await audio.current.resume();
      const ctx = audio.current;
      const play = () => {
        const now = ctx.currentTime;
        [261.63, 329.63, 392, 493.88].forEach((frequency, i) => {
          const osc = ctx.createOscillator(); const gain = ctx.createGain();
          osc.type = "sine"; osc.frequency.value = frequency;
          gain.gain.setValueAtTime(0, now + i * 0.32);
          gain.gain.linearRampToValueAtTime(0.045, now + i * 0.32 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.32 + 2.8);
          osc.connect(gain); gain.connect(ctx.destination); osc.start(now + i * 0.32); osc.stop(now + i * 0.32 + 3);
          osc.onended = () => { osc.disconnect(); gain.disconnect(); };
        });
      };
      play(); timer.current = setInterval(play, 4500); setSound(true); setSoundError("");
    } catch { setSoundError("В этом браузере звук недоступен."); }
  }

  function saveNote(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!name || !message) { setStorageError("Добавь имя и послание — одного пробела недостаточно."); return; }
    const next = [{ name, message }, ...notes].slice(0, 12);
    try { localStorage.setItem("duo-notes", JSON.stringify(next)); setNotes(next); setSaved(true); setStorageError(""); }
    catch { setStorageError("Браузер не разрешает сохранение. Разрешите локальное хранилище и попробуйте ещё раз."); }
  }

  return <>
    <a className="skip-link" href="#main">К содержимому</a>
    <header className="header">
      <a href="#" className="brand" aria-label="Двое — на главную">двое<span>.</span><Star className="brand-star"/></a>
      <nav className="desktop-nav" aria-label="Основная навигация">{nav.map(n => <a href={n.href} key={n.href}>{n.label}</a>)}</nav>
      <button className="nav-contact" onClick={() => setCall(true)}>На связи <ArrowUpRight size={16}/></button>
      <button className="mobile-menu icon-button" aria-expanded={menu} aria-controls="mobile-nav" aria-label={menu ? "Закрыть меню" : "Открыть меню"} onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button>
      <AnimatePresence>{menu && <motion.nav id="mobile-nav" className="mobile-nav" aria-label="Мобильная навигация" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>{nav.map(n => <a key={n.href} href={n.href} onClick={() => setMenu(false)}>{n.label}<ArrowUpRight size={19}/></a>)}<button onClick={() => { setMenu(false); setCall(true); }}>На связи <Phone size={18}/></button></motion.nav>}</AnimatePresence>
    </header>

    <main id="main">
      <section className="hero section-shell" ref={hero}>
        <div className="hero-copy">
          <Reveal><div className="eyebrow"><span className="status-dot"/> ЛИЧНЫЙ ЖУРНАЛ ДВОИХ <span className="edition">VOL. 01 / 2026</span></div></Reveal>
          <Reveal delay={0.1}><h1>На одной<br/><span className="italic">волне.</span><Star className="hero-star"/></h1></Reveal>
          <Reveal delay={0.2}><p className="hero-description">Два характера. Один маленький мир.<br/>И связь, которой не нужен Wi-Fi.</p></Reveal>
          <Reveal delay={0.3}><a className="button primary" href="#stories">В нашу историю <ArrowUpRight size={19}/></a><div className="hero-footnote"><span className="tiny-line"/> Немного нежности. Много нас.</div></Reveal>
        </div>
        <Reveal className="hero-visual" delay={0.15}>
          <motion.div className="hero-photo" style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1200 }} onPointerMove={e => { if (reduce || e.pointerType !== "mouse") return; const rect = e.currentTarget.getBoundingClientRect(); pointerX.set((0.5 - (e.clientY - rect.top) / rect.height) * 4); pointerY.set(((e.clientX - rect.left) / rect.width - 0.5) * 4); }} onPointerLeave={() => { pointerX.set(0); pointerY.set(0); }}><motion.div className="hero-photo-inner" style={{ y: imageY }}><Image src="/images/duo.png" alt="Дуэт: девушка и парень разговаривают по белым кроксам как по телефону" fill priority sizes="(max-width: 800px) 100vw, 56vw"/></motion.div>
            <div className="photo-top"><span>ДВА ГОЛОСА. ОДНА ЧАСТОТА.</span><button className="photo-expand" onClick={() => setGallery(0)} aria-label="Открыть портреты"><Plus size={20}/></button></div>
            <div className="photo-caption"><span>Случайный кадр.<br/>Неслучайные люди.</span><span className="photo-coordinate">ОНА / ОН<br/>SOMEWHERE TOGETHER</span></div>
          </motion.div>
          <div className="connection-pill"><span className="status-dot"/> Соединение установлено <span>♡</span></div>
          <button className="round-note" onClick={() => setCall(true)} aria-label="Позвонить дуэту"><span>ALWAYS<br/>CONNECTED</span><Phone size={26}/><span>НА СВЯЗИ</span></button>
        </Reveal>
        <div className="hero-bottom"><a href="#about"><ArrowDown size={16}/> Листай. Дальше — ближе.</a><span>НЕ ИДЕАЛЬНО. ЗАТО ПО-НАСТОЯЩЕМУ.</span><span className="page-count">01 — 05</span></div>
      </section>

      <div className="ticker" aria-hidden="true"><div className="ticker-track">{Array.from({ length: 4 }, (_, i) => <span key={i}>БЫТЬ СОБОЙ <Star/> СМЕЯТЬСЯ ВМЕСТЕ <Star/> ЛОВИТЬ МОМЕНТЫ <Star/> БЫТЬ НА СВЯЗИ <Star/></span>)}</div></div>

      <section id="about" className="about section-shell section-pad">
        <Reveal className="section-label"><span>01 / ЗНАКОМСТВО</span><span>ЛЮДИ, А НЕ ПЕРСОНАЖИ</span></Reveal>
        <div className="about-grid"><Reveal><h2>Хорошо, когда<br/>есть <span className="italic">свой человек.</span></h2></Reveal><Reveal delay={0.12}><p className="body-copy">Тот, кто понимает с полувзгляда. Подхватывает самую странную идею. И отвечает на звонок, даже если твой телефон — это крокс.</p><p className="muted-copy">Это маленькое пространство о большом чувстве: быть собой рядом с другим. Без фильтров, громких обещаний и правильных поз.</p><a className="text-link" href="#moments">Познакомимся поближе <ArrowUpRight size={18}/></a></Reveal></div>
        <div className="values-grid">{[{ icon: <Radio/>, title: "Своя частота", text: "Понимать друг друга даже тогда, когда слова совсем не нужны." }, { icon: <Star/>, title: "Лёгкость быть собой", text: "Серьёзные чувства. Несерьёзный подход ко всему остальному." }, { icon: <Heart/>, title: "Маленькое — важное", text: "Замечать жизнь между планами. И бережно собирать её моменты." }].map((v, i) => <Reveal key={v.title} className="value-card" delay={i * 0.08}><span className="value-icon">{v.icon}</span><span className="value-number">0{i + 1}</span><h3>{v.title}</h3><p>{v.text}</p></Reveal>)}</div>
      </section>

      <section id="stories" className="stories section-shell section-pad">
        <Reveal className="section-label"><span>02 / НАШ ЖУРНАЛ</span><span>ЗАПИСАНО МЕЖДУ ДЕЛОМ</span></Reveal>
        <Reveal className="section-heading"><h2>Из жизни <span className="italic">двоих.</span></h2><p>Истории без громких заголовков.<br/>Только то, что хочется запомнить.</p></Reveal>
        <div className="stories-grid">{stories.map((s, i) => <Reveal key={s.number} delay={i * 0.1}><button className="story-card" onClick={() => setStory(i)} aria-label={`Читать историю «${s.title}»`}>
          <div className={`story-cover ${s.cover}`}>
            {s.cover !== "piano" ? <Portrait who={s.cover}/> : <div className="piano-art"><span className="piano-small">SLOW DAYS, SOFT NOTES</span><span className="piano-word">тише.<Star/></span><div className="piano-keys">{Array.from({ length: 14 }, (_, n) => <span key={n} className={n % 7 === 2 || n % 7 === 6 ? "white-key" : "black-key"}/>)}</div><span className="piano-bottom">PAUSE IS PART OF THE MUSIC</span></div>}
            <span className="story-badge">ЭПИЗОД {s.number}</span><span className="story-arrow"><ArrowUpRight size={22}/></span>
          </div>
          <div className="story-meta"><span>{s.category}</span><span>{s.reading}</span></div><h3>{s.title}</h3><p>{s.subtitle}</p>
        </button></Reveal>)}</div>
      </section>

      <section className="quote-section"><Reveal><span className="quote-mark">“</span><blockquote>Любовь — это когда<br/>даже <span className="italic">крокс</span> становится<br/>средством связи.</blockquote><div className="quote-credit"><span/> ИЗ НАШИХ НЕСЕРЬЁЗНЫХ РАЗГОВОРОВ <span/></div></Reveal><Star className="quote-star"/></section>

      <section id="moments" className="moments section-shell section-pad">
        <Reveal className="section-label"><span>03 / В ГЛАВНЫХ РОЛЯХ</span><span>ДВОЕ. КАК ЕСТЬ.</span></Reveal>
        <Reveal className="section-heading"><h2>Каждый — <span className="italic">целый мир.</span></h2><span className="small-note">А вместе — чуть больше.</span></Reveal>
        <div className="people-grid"><Reveal><button className="person-card" onClick={() => setGallery(0)}><Portrait who="her"/><div className="person-caption"><div><span className="eyebrow">ОНА / ПЕРВЫЙ ГОЛОС</span><h3>Искра момента.</h3></div><span className="person-arrow"><ArrowUpRight/></span></div></button></Reveal><Reveal delay={0.12}><button className="person-card" onClick={() => setGallery(1)}><Portrait who="him"/><div className="person-caption"><div><span className="eyebrow">ОН / ВТОРОЙ ГОЛОС</span><h3>Тепло в ответ.</h3></div><span className="person-arrow"><ArrowUpRight/></span></div></button></Reveal></div>
        <Reveal className="moments-caption"><span><span className="status-dot"/> Два характера. Одна история.</span><span>ПОРТРЕТЫ — ХУДОЖЕСТВЕННАЯ ВЕРСИЯ ВАШИХ ФОТО</span></Reveal>
      </section>

      <section id="connect" className="connect section-shell">
        <Reveal className="connect-copy"><div className="eyebrow"><span className="status-dot"/> ЛИНИЯ СВОБОДНА</div><h2>Ну что,<br/><span className="italic">созвонимся?</span></h2><p>Выбери настроение.<br/>Мы на другом конце крокса.</p><div className="mood-options" role="group" aria-label="Настроение звонка">{moods.map((m, i) => <button key={m.label} className={mood === i ? "selected" : ""} onClick={() => setMood(i)} aria-pressed={mood === i}>{m.symbol} {m.label}</button>)}</div><button className="button cream" onClick={() => setCall(true)}>Набрать нас <Phone size={18}/></button></Reveal>
        <Reveal className="connect-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><Star className="connect-star"/><div className="dial"><Phone size={58} strokeWidth={1}/><span>ЕСТЬ КОНТАКТ</span></div><span className="handwritten">just call. ♡</span><div className="connection-wave">{Array.from({ length: 19 }, (_, i) => <span key={i} style={{ height: `${Math.round(12 + Math.sin(i * 0.8) ** 2 * 34)}px`, animationDelay: `${(i * 0.07).toFixed(2)}s` }}/>)}</div></Reveal>
      </section>

      <section className="guest-section section-shell"><Reveal className="guest-heading"><div><div className="eyebrow">04 / ОСТАВЬ СВОЙ СЛЕД</div><h2>Хорошим словам <span className="italic">здесь рады.</span></h2></div><button className="button outline" onClick={() => { setGuestbook(true); setSaved(false); }}>Оставить послание <MoveUpRight size={18}/></button></Reveal>
        {notes.length > 0 && <div className="notes-grid">{notes.slice(0, 3).map((note, i) => <div className="note-card" key={`${note.name}-${i}`}><Heart size={16}/><p>{note.message}</p><span>— {note.name}</span></div>)}</div>}
      </section>
    </main>

    <footer className="footer section-shell"><div className="footer-top"><a href="#" className="brand footer-brand">двое<span>.</span><Star className="brand-star"/></a><p>Маленький мир.<br/>Большая связь.</p><a href="#main" className="back-top">Наверх <ArrowUpRight size={18}/></a></div><div className="footer-bottom"><span>© 2026 ДВОЕ. СДЕЛАНО С ЧУВСТВОМ.</span><button onClick={() => { const next = !liked; setLiked(next); try { localStorage.setItem("duo-liked", String(next)); } catch {} }} aria-pressed={liked} className={`made-with ${liked ? "liked" : ""}`}><Heart size={14} fill={liked ? "currentColor" : "none"}/>{liked ? "И мы тебя ♡" : "Отправить сердечко"}</button><button className="sound-button" onClick={toggleSound} aria-pressed={sound}>{sound ? <Volume2 size={15}/> : <VolumeX size={15}/>} ЗВУК {sound ? "ВКЛ" : "ВЫКЛ"}</button></div>{soundError && <p role="status">{soundError}</p>}</footer>

    <AnimatePresence>
      {story !== null && <Modal title={stories[story].title} onClose={() => setStory(null)}><div className="eyebrow">ЭПИЗОД {stories[story].number} / {stories[story].reading}</div><h2>{stories[story].title}</h2><p className="modal-subtitle">{stories[story].subtitle}</p><div className="article-body">{stories[story].paragraphs.map(p => <p key={p}>{p}</p>)}</div><div className="article-footer"><span>Из журнала двоих <Heart size={14}/></span><button className="text-link" onClick={() => setStory((story + 1) % stories.length)}>Следующая история <ArrowRight size={18}/></button></div></Modal>}
      {gallery !== null && <Modal title={gallery === 0 ? "Она — первый голос" : "Он — второй голос"} onClose={() => setGallery(null)} className="gallery-modal"><Portrait who={gallery === 0 ? "her" : "him"}/><div className="gallery-bottom"><button className="icon-button" aria-label="Предыдущий портрет" onClick={() => setGallery(gallery === 0 ? 1 : 0)}><ChevronLeft/></button><span>{gallery === 0 ? "Она. Искра момента." : "Он. Тепло в ответ."}<small>{gallery + 1} / 2 · Художественный портрет</small></span><button className="icon-button" aria-label="Следующий портрет" onClick={() => setGallery(gallery === 0 ? 1 : 0)}><ChevronRight/></button></div></Modal>}
      {call && <Modal title="Линия связи" onClose={() => setCall(false)} className="call-modal"><div className="eyebrow"><span className="status-dot"/> СОЕДИНЕНИЕ УСТАНОВЛЕНО</div><div className="call-symbol"><Phone size={38}/></div><h2>Алло, <span className="italic">мы слушаем.</span></h2><div className="mood-options" role="group" aria-label="Настроение разговора">{moods.map((m, i) => <button key={m.label} onClick={() => setMood(i)} className={mood === i ? "selected" : ""} aria-pressed={mood === i}>{m.symbol} {m.label}</button>)}</div><AnimatePresence mode="wait"><motion.div key={mood} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="call-response" aria-live="polite"><p>{moods[mood].response}</p><small>{moods[mood].note}</small></motion.div></AnimatePresence><button className="button primary" onClick={() => { setCall(false); setGuestbook(true); setSaved(false); }}>Оставить нам пару слов <ArrowUpRight size={18}/></button><p className="local-note">Это маленькая игра, без настоящего звонка.</p></Modal>}
      {guestbook && <Modal title="Гостевая книга" onClose={() => setGuestbook(false)}>{saved ? <div className="success-message"><div className="success-icon"><Check size={30}/></div><h2>Слова <span className="italic">остаются.</span></h2><p>Спасибо. Твоё послание уже в этом маленьком мире.</p><p className="local-note">Оно сохранено только в этом браузере, на этом устройстве.</p><button className="button primary" onClick={() => setGuestbook(false)}>Вернуться в журнал <ArrowRight size={17}/></button></div> : <><div className="eyebrow">ГОСТЕВАЯ КНИГА</div><h2>Пара тёплых <span className="italic">слов.</span></h2><p className="modal-subtitle">Напиши что-нибудь, что хочется оставить здесь.</p><form onSubmit={saveNote} className="guest-form"><label>Как к тебе обращаться?<input name="name" required maxLength={40} placeholder="Твоё имя" autoComplete="given-name"/></label><label>Твоё послание<textarea name="message" required maxLength={400} rows={4} placeholder="Привет, двое…"/></label><p className="local-note">Послание сохраняется только в твоём браузере. Данные никуда не отправляются.</p>{storageError && <p role="alert">{storageError}</p>}<button className="button primary" type="submit">Сохранить послание <ArrowUpRight size={18}/></button></form></>}</Modal>}
    </AnimatePresence>
  </>;
}
