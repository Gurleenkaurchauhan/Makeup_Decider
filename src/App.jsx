import { useEffect, useRef, useState } from "react";
import Wheel from "./components/Wheel.jsx";
import ProductManager from "./components/ProductManager.jsx";
import Usage from "./components/Usage.jsx";
import Calendar from "./components/Calendar.jsx";
import Profile from "./components/Profile.jsx";
import Customize from "./components/Customize.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import useLocalStorage from "./useLocalStorage.js";
import { DEFAULT_CATS, DEFAULT_GROUPS, SAMPLE, catColor } from "./data.js";
import { getSession, getUser, logout, updateUser } from "./auth.js";
import { buildBackup, downloadJson, mergeBackup } from "./backup.js";

const pad = (n) => String(n).padStart(2, "0");
const todayStr = () => { const t = new Date(); return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`; };
const SPECIAL = ["home", "products", "usage", "calendar", "saved", "profile", "custom"];

const standalone = () => window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone;

function InstallCard() {
  const [evt, setEvt] = useState(null);
  const [done, setDone] = useState(standalone());
  useEffect(() => {
    const on = (e) => { e.preventDefault(); setEvt(e); };
    const ok = () => setDone(true);
    window.addEventListener("beforeinstallprompt", on);
    window.addEventListener("appinstalled", ok);
    return () => { window.removeEventListener("beforeinstallprompt", on); window.removeEventListener("appinstalled", ok); };
  }, []);
  if (done) return null;
  return (
    <div className="combo install">
      <h3>📲 Put it on your phone</h3>
      {evt
        ? <button onClick={async () => { evt.prompt(); await evt.userChoice; setEvt(null); }}>Install app</button>
        : <p className="muted small">Open this page on your phone. On Android (Chrome) tap ⋮ then “Install app”. On iPhone (Safari) tap Share, then “Add to Home Screen”.</p>}
    </div>
  );
}

const Tile = ({ emoji, title, text, onClick }) => (
  <button className="tile" onClick={onClick}><span className="te">{emoji}</span><b>{title}</b><span className="muted">{text}</span></button>
);

export default function App() {
  const [email, setEmail] = useState(getSession());
  return (
    <>
      <div className="floaties" aria-hidden="true">
        {["🧸", "🎀", "🐰", "☁️", "🦄", "🧁", "💖", "🐻", "⭐", "🌸"].map((e, i) => <span key={i} style={{ "--i": i }}>{e}</span>)}
      </div>
      {email && getUser(email)
        ? <Main key={email} email={email} onLogout={() => { logout(); setEmail(null); }} />
        : <AuthScreen onAuth={setEmail} />}
    </>
  );
}

function Main({ email, onLogout }) {
  const key = (n) => `mc.${email}.${n}`; // every account has its own storage
  const [products, setProducts] = useLocalStorage(key("products"), []);
  const [saved, setSaved] = useLocalStorage(key("saved"), []);
  const [cats, setCats] = useLocalStorage(key("cats"), DEFAULT_CATS);
  const [groups, setGroups] = useLocalStorage(key("groups"), DEFAULT_GROUPS);
  const [user, setUser] = useState(() => getUser(email));
  const patchUser = (p) => { updateUser(email, p); setUser((u) => ({ ...u, ...p })); };

  const [picks, setPicks] = useState({});
  const [locks, setLocks] = useState({});
  const [today, setToday] = useState(todayStr());
  const [useDate, setUseDate] = useState(null); // null = automatic (today)
  const [usedSel, setUsedSel] = useState({}); // false = not worn today (default: worn)
  const [tab, setTab] = useState("home");
  const [open, setOpen] = useState(() => window.innerWidth > 860); // sidebar: open on laptop, closed on phone
  const refs = useRef({});
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true), down = () => setOnline(false);
    window.addEventListener("online", up); window.addEventListener("offline", down);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", down); };
  }, []);

  const exportBackup = () => downloadJson(buildBackup(user, { products, saved, cats, groups }), `makeup-combo-backup-${todayStr()}.json`);
  const importBackup = (b, mode) => {
    const next = mode === "replace" ? { products: b.products, saved: b.saved, cats: b.cats, groups: b.groups } : mergeBackup({ products, saved, cats, groups }, b);
    setProducts(next.products); setSaved(next.saved); setCats(next.cats); setGroups(next.groups);
    if (mode === "replace" && b.profile?.name) patchUser({ name: b.profile.name, avatar: b.profile.avatar || user.avatar });
    setPicks({}); setLocks({});
  };

  useEffect(() => {
    const tick = () => setToday(todayStr());
    const id = setInterval(tick, 30000);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", tick); window.removeEventListener("focus", tick); };
  }, []);

  const label = (id) => cats.find((c) => c.id === id)?.label || "Removed category";
  const group = groups.find((g) => g.id === tab);
  const view = group ? group.id : SPECIAL.includes(tab) ? tab : "products";
  const gcats = group ? group.cats.filter((c) => cats.some((x) => x.id === c)) : [];
  const itemsOf = (cat) => products.filter((p) => p.category === cat);
  const pickOf = (cat) => itemsOf(cat).find((p) => p.id === picks[cat]?.id) || null;
  const complete = gcats.length > 0 && gcats.every(pickOf);
  const go = (t) => { setTab(t); if (window.innerWidth <= 860) setOpen(false); };

  const undo = (entry) => {
    if (!window.confirm("Delete this combo and take back its usage counts?")) return;
    const matches = (p, q) => (q.pid ? p.id === q.pid : p.category === q.cat && p.name === q.name);
    const rest = saved.filter((x) => x.id !== entry.id);
    setProducts(products.map((p) => {
      if (!entry.parts.some((q) => q.used !== false && matches(p, q))) return p;
      const days = rest.filter((s) => s.day && s.parts.some((q) => q.used !== false && matches(p, q))).map((s) => s.day).sort();
      const left = Math.max(0, (p.uses || 0) - 1);
      return { ...p, uses: left, lastUsed: days.length ? days[days.length - 1] : left > 0 ? p.lastUsed : null };
    }));
    setSaved(rest);
  };

  const spinAll = () => gcats.forEach((c) => refs.current[c]?.spin());

  const apply = () => {
    const usedIds = gcats.filter((c) => usedSel[c] !== false).map((c) => pickOf(c).id);
    const day = useDate || todayStr();
    setProducts(products.map((p) => (usedIds.includes(p.id)
      ? { ...p, uses: (p.uses || 0) + 1, lastUsed: day > (p.lastUsed || "").slice(0, 10) ? day : p.lastUsed }
      : p)));
    setSaved([{
      id: crypto.randomUUID(),
      group: group.label,
      day,
      date: new Date(day + "T00:00:00").toLocaleDateString(),
      parts: gcats.map((c) => ({ cat: c, label: label(c), name: pickOf(c).name, color: pickOf(c).color, pid: pickOf(c).id, used: usedSel[c] !== false })),
    }, ...saved]);
    setUsedSel({});
    setUseDate(null);
  };

  const NavBtn = ({ id, children }) => <button className={view === id ? "on" : ""} onClick={() => go(id)}>{children}</button>;

  return (
    <div className={`app${open ? "" : " shut"}`}>
      <button className="menu" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>{open ? "✕" : "☰"}</button>
      <aside className="side" aria-label="Menu">
        <div className="me">
          <span className="av">{user.avatar}</span>
          <b>{user.name}</b>
          <span className="muted small">{email}</span>
        </div>
        <nav>
          <NavBtn id="home">🏠 Home</NavBtn>
          <p className="navh">Spin</p>
          {groups.map((g) => <NavBtn key={g.id} id={g.id}>🎡 {g.label}</NavBtn>)}
          <p className="navh">My space</p>
          <NavBtn id="products">🛍️ My products</NavBtn>
          <NavBtn id="usage">📊 Usage</NavBtn>
          <NavBtn id="calendar">📅 Calendar</NavBtn>
          <NavBtn id="saved">💖 Saved ({saved.length})</NavBtn>
          <NavBtn id="profile">🧸 My profile</NavBtn>
          <NavBtn id="custom">🎨 Customize</NavBtn>
        </nav>
        <button className="ghost out" onClick={onLogout}>Log out</button>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <main>
        <h1>💄 Makeup combo wheel ✨</h1>
        {!online && <p className="offline" role="status">You’re offline. Everything still works 💖</p>}

        {view === "home" && (
          <section>
            <p className="muted tagline">Hi {user.name}! What would you like to do today? 🎀</p>
            <div className="tiles">
              {groups.map((g) => <Tile key={g.id} emoji="🎡" title={`Spin: ${g.label}`} text="Let the wheels pick, or choose yourself" onClick={() => go(g.id)} />)}
              <Tile emoji="🛍️" title="My products" text="Add or remove what you own" onClick={() => go("products")} />
              <Tile emoji="📊" title="Usage" text="See what you use the most" onClick={() => go("usage")} />
              <Tile emoji="📅" title="Calendar" text="What you wore, day by day" onClick={() => go("calendar")} />
              <Tile emoji="💖" title="Saved looks" text={`${saved.length} saved`} onClick={() => go("saved")} />
              <Tile emoji="🧸" title="My profile" text="What you like the most" onClick={() => go("profile")} />
              <Tile emoji="🎨" title="Customize" text="Make your own wheels and colours" onClick={() => go("custom")} />
            </div>
            <InstallCard />
          </section>
        )}

        {group && (
          <section>
            {gcats.length ? (
              <>
                <div className="wheels">
                  {gcats.map((c) => (
                    <Wheel
                      key={c}
                      ref={(el) => (refs.current[c] = el)}
                      label={label(c)}
                      color={catColor(cats.find((x) => x.id === c))}
                      items={itemsOf(c)}
                      result={pickOf(c)}
                      locked={!!locks[c]}
                      onResult={(p) => { setPicks((s) => ({ ...s, [c]: p })); setUsedSel((s) => ({ ...s, [c]: true })); }}
                      onLock={(v) => setLocks((s) => ({ ...s, [c]: v }))}
                    />
                  ))}
                </div>
                <button className="big" onClick={spinAll}>Spin all</button>
                {complete && (
                  <div className="combo pop">
                    <h2>Today’s {group.label.toLowerCase()}</h2>
                    <ol>
                      {gcats.map((c) => (
                        <li key={c}>
                          <label className="usedbox">
                            <input type="checkbox" checked={usedSel[c] !== false} onChange={(e) => setUsedSel((s) => ({ ...s, [c]: e.target.checked }))} />
                            <span className="dot" style={{ background: pickOf(c).color }} /> <b>{label(c)}:</b> {pickOf(c).name}
                            <span className="muted"> · used {pickOf(c).uses || 0}×</span>
                          </label>
                        </li>
                      ))}
                    </ol>
                    <p className="muted small">Tick the products you actually wore. Only ticked ones are counted.</p>
                    <label className="datepick">📅 Date worn
                      <input type="date" value={useDate ?? today} onChange={(e) => setUseDate(e.target.value && e.target.value !== today ? e.target.value : null)} />
                    </label>
                    <p className="muted small">
                      {useDate ? <>Custom date picked. <button type="button" className="link" onClick={() => setUseDate(null)}>Use today</button></> : "Today is picked automatically. Open the calendar to choose another day."}
                    </p>
                    <button onClick={apply}>Save combo and update usage</button>
                  </div>
                )}
              </>
            ) : <p className="muted">This tab has no wheels yet. Open Customize and tick some categories for it.</p>}
          </section>
        )}

        {view === "products" && <ProductManager cats={cats} products={products} setProducts={setProducts} onSample={() => setProducts(SAMPLE)} />}
        {view === "usage" && <Usage cats={cats} products={products} setProducts={setProducts} />}
        {view === "calendar" && <Calendar saved={saved} today={today} onDelete={undo} />}
        {view === "profile" && <Profile user={user} email={email} patchUser={patchUser} products={products} saved={saved} cats={cats} onExport={exportBackup} onImport={importBackup} />}
        {view === "custom" && <Customize cats={cats} setCats={setCats} groups={groups} setGroups={setGroups} products={products} setProducts={setProducts} defaults={{ cats: DEFAULT_CATS, groups: DEFAULT_GROUPS }} />}

        {view === "saved" && (
          <section>
            {!saved.length && <p className="muted">No saved combos yet.</p>}
            {saved.map((s) => (
              <div className="combo" key={s.id}>
                <h3>{s.group} · {s.date}</h3>
                <ul className="plist">{s.parts.map((p) => <li key={p.cat}><span className="dot" style={{ background: p.color }} /> <b>{p.label || label(p.cat)}:</b> {p.name}{p.used === false && <span className="muted"> (not used)</span>}</li>)}</ul>
                <button className="link" onClick={() => undo(s)}>Delete and undo usage</button>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
