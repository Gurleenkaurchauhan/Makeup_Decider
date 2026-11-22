import { useState } from "react";

const pad = (n) => String(n).padStart(2, "0");
const DOW = ["S", "M", "T", "W", "T", "F", "S"];

export default function Calendar({ saved, today, onDelete }) {
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [sel, setSel] = useState(today);

  const first = new Date(ym.y, ym.m, 1).getDay();
  const dim = new Date(ym.y, ym.m + 1, 0).getDate();
  const key = (d) => `${ym.y}-${pad(ym.m + 1)}-${pad(d)}`;
  const byDay = {};
  saved.forEach((s) => { if (s.day) (byDay[s.day] = byDay[s.day] || []).push(s); });
  const cells = [...Array(first).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
  const move = (d) => { const x = new Date(ym.y, ym.m + d, 1); setYm({ y: x.getFullYear(), m: x.getMonth() }); setSel(null); };
  const list = sel ? byDay[sel] || [] : [];

  return (
    <section>
      <div className="combo">
        <div className="calhead">
          <button onClick={() => move(-1)} aria-label="Previous month">‹</button>
          <h3>{new Date(ym.y, ym.m, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h3>
          <button onClick={() => move(1)} aria-label="Next month">›</button>
        </div>
        <p style={{ textAlign: "center", margin: "0 0 8px" }}>
          <button type="button" className="link" onClick={() => { const t = new Date(today + "T00:00:00"); setYm({ y: t.getFullYear(), m: t.getMonth() }); setSel(today); }}>Jump to today</button>
        </p>
        <div className="calgrid">
          {DOW.map((d, i) => <b key={i} className="dow">{d}</b>)}
          {cells.map((d, i) =>
            d === null ? <span key={i} /> : (
              <button key={i} className={`day${byDay[key(d)] ? " has" : ""}${key(d) === today ? " today" : ""}${sel === key(d) ? " sel" : ""}`} onClick={() => setSel(key(d))}>
                {d}{byDay[key(d)] && <i>💄</i>}
              </button>
            )
          )}
        </div>
        {sel && (
          <div className="daylist">
            <h3>{new Date(sel + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}{sel === today ? " (today)" : ""}</h3>
            {list.length ? list.map((s) => (
              <p key={s.id}><b>{s.group}:</b> {s.parts.filter((p) => p.used !== false).map((p) => p.name).join(" · ") || "nothing marked as used"} <button type="button" className="link" onClick={() => onDelete(s)}>Delete</button></p>
            )) : <p className="muted">Nothing saved for this day.</p>}
          </div>
        )}
        {!sel && <p className="muted small">Pick a day to see what you wore. Days with a 💄 have a saved combo.</p>}
      </div>
    </section>
  );
}
