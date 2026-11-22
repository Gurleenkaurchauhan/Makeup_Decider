import { useRef, useState } from "react";
import { parseBackup } from "../backup.js";

const AV = ["🧸", "🐰", "🦄", "🐻", "🎀", "🌸", "🐱", "🍓"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Profile({ user, email, patchUser, products, saved, cats, onExport, onImport }) {
  const [name, setName] = useState(user.name);
  const [pending, setPending] = useState(null);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);
  const pick = async (e) => {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    setMsg("");
    try { setPending(parseBackup(await f.text())); } catch (x) { setPending(null); setMsg(x.message); }
  };
  const doImport = (mode) => {
    if (mode === "replace" && !window.confirm("This replaces all products, combos and settings in this account with the backup. Continue?")) return;
    onImport(pending, mode);
    setMsg(`Backup imported (${mode === "replace" ? "replaced" : "added to your data"}).`);
    setPending(null);
  };
  const used = products.filter((p) => p.uses > 0).sort((a, b) => b.uses - a.uses);
  const total = products.reduce((n, p) => n + (p.uses || 0), 0);
  const favPer = cats.map((c) => ({ c, p: used.find((p) => p.category === c.id) })).filter((x) => x.p);

  const combos = {};
  saved.forEach((s) => {
    const parts = s.parts.filter((p) => p.used !== false);
    if (!parts.length) return;
    const text = parts.map((p) => p.name).join(" + ");
    const k = s.group + "|" + text;
    combos[k] = combos[k] || { n: 0, group: s.group, text };
    combos[k].n++;
  });
  const top = Object.values(combos).sort((a, b) => b.n - a.n)[0];
  const wd = [0, 0, 0, 0, 0, 0, 0];
  saved.forEach((s) => { if (s.day) wd[new Date(s.day + "T00:00:00").getDay()]++; });
  const best = Math.max(...wd) > 0 ? DAYS[wd.indexOf(Math.max(...wd))] : null;

  return (
    <section>
      <div className="combo">
        <div className="profhead">
          <span className="av">{user.avatar}</span>
          <div>
            <label className="field">Name
              <input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => name.trim() && patchUser({ name: name.trim() })} />
            </label>
            <span className="muted small">{email}</span>
          </div>
        </div>
        <p className="muted small">Pick your avatar</p>
        <div className="opts">
          {AV.map((a) => <button key={a} type="button" className={`avbtn${user.avatar === a ? " on" : ""}`} onClick={() => patchUser({ avatar: a })} aria-label={`Avatar ${a}`}>{a}</button>)}
        </div>
      </div>

      <div className="stats" style={{ marginTop: 16 }}>
        <div><b>{total}</b><span className="muted">total uses</span></div>
        <div><b>{saved.length}</b><span className="muted">looks saved</span></div>
        <div><b>{best || "-"}</b><span className="muted">favourite day</span></div>
        <div><b>{products.filter((p) => !p.uses).length}</b><span className="muted">never tried</span></div>
      </div>

      <div className="combo">
        <h3>Your colour palette</h3>
        {used.length ? (
          <div className="palette">{used.slice(0, 8).map((p) => <span key={p.id} title={`${p.name} · ${p.uses}×`} style={{ background: p.color }} />)}</div>
        ) : <p className="muted">Wear a few combos and your favourite shades show up here.</p>}
      </div>

      <div className="combo">
        <h3>What you like most</h3>
        {favPer.length ? (
          <ul className="plist">{favPer.map(({ c, p }) => (
            <li key={c.id}><span className="dot" style={{ background: p.color }} /> <b>{c.label}:</b> {p.name} <span className="muted">· {p.uses}×</span></li>
          ))}</ul>
        ) : <p className="muted">Nothing yet. Save a combo with the products you wore.</p>}
        {top && top.n > 1 && <p><b>Most repeated combo:</b> {top.text} <span className="muted">· {top.n} times</span></p>}
      </div>

      <div className="combo">
        <h3>Backup and move your data 💾</h3>
        <p className="muted small">Save your products, combos and settings to a file, then import it on your phone or laptop. The file never contains your password.</p>
        <div className="row" style={{ justifyContent: "flex-start", flexWrap: "wrap" }}>
          <button onClick={onExport}>Export backup</button>
          <button className="ghost" onClick={() => fileRef.current.click()}>Import backup</button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={pick} hidden />
        </div>
        {pending && (
          <div className="grow">
            <p>Found <b>{pending.products.length}</b> products and <b>{pending.saved.length}</b> saved combos{pending.exportedAt ? ` from ${new Date(pending.exportedAt).toLocaleDateString()}` : ""}.</p>
            <div className="row" style={{ justifyContent: "flex-start", flexWrap: "wrap" }}>
              <button onClick={() => doImport("replace")}>Replace my data</button>
              <button className="ghost" onClick={() => doImport("merge")}>Add to my data</button>
              <button className="link" onClick={() => setPending(null)}>Cancel</button>
            </div>
          </div>
        )}
        {msg && <p role="status" className="muted">{msg}</p>}
      </div>
    </section>
  );
}
