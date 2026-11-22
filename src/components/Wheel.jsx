import { forwardRef, useImperativeHandle, useMemo, useState } from "react";

const R = 100;
const point = (deg) => { const t = ((deg - 90) * Math.PI) / 180; return [R * Math.cos(t), R * Math.sin(t)]; };
const textOn = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const y = (((n >> 16) & 255) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000;
  return y > 150 ? "#222" : "#fff";
};

const Wheel = forwardRef(function Wheel({ items, label, color, result, locked, onResult, onLock }, ref) {
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [burst, setBurst] = useState(0);
  const bits = useMemo(() => Array.from({ length: 16 }, (_, i) => ({
    e: ["✨", "💖", "🌸", "⭐", "🎀"][i % 5], dx: (Math.random() - 0.5) * 300, dy: -(70 + Math.random() * 150),
    r: (Math.random() - 0.5) * 400, d: Math.random() * 0.2,
  })), [burst]);
  const n = items.length;
  const seg = 360 / (n || 1);

  const spin = () => {
    if (spinning || locked || !n) return;
    const idx = Math.floor(Math.random() * n);
    const center = idx * seg + seg / 2 + (Math.random() - 0.5) * seg * 0.7;
    const cur = ((rot % 360) + 360) % 360;
    const delta = (((360 - center - cur) % 360) + 360) % 360;
    setSpinning(true);
    setRot(rot + 360 * (5 + Math.floor(Math.random() * 3)) + delta);
    setTimeout(() => { setSpinning(false); setBurst(Date.now()); onResult(items[idx]); }, 4200);
  };
  useImperativeHandle(ref, () => ({ spin }));

  return (
    <div className={`wheel-card${spinning ? " spinning" : ""}`} style={{ "--wc": color || "#ffb3d1" }}>
      <h3>{label}</h3>
      {n === 0 ? (
        <p className="muted empty">No {label.toLowerCase()} products yet. Add some in My products.</p>
      ) : (
        <div className="wheel-wrap">
          <div className="pointer" aria-hidden="true" />
          <div className="wheel" style={{ transform: `rotate(${rot}deg)`, transition: spinning ? "transform 4s cubic-bezier(.12,.7,.1,1)" : "none" }}>
            <svg viewBox="-104 -104 208 208" role="img" aria-label={`${label} wheel with ${n} products`}>
              {items.map((p, i) => {
                const c = i * seg + seg / 2;
                const fs = n === 1 ? 14 : n > 8 ? 8 : n > 5 ? 10 : 11;
                const nm = p.short || p.name;
                const txt = nm.length > 13 ? nm.slice(0, 12) + "…" : nm;
                let shape;
                if (n === 1) shape = <circle r={R} fill={p.color} />;
                else {
                  const [x1, y1] = point(i * seg), [x2, y2] = point((i + 1) * seg);
                  shape = <path d={`M0 0 L${x1} ${y1} A${R} ${R} 0 ${seg > 180 ? 1 : 0} 1 ${x2} ${y2}Z`} fill={p.color} stroke="#fff" strokeWidth="1.5" />;
                }
                return (
                  <g key={p.id}>
                    {shape}
                    <text transform={n === 1 ? "translate(0,-52)" : `rotate(${c - 90}) translate(24,0)`} fill={textOn(p.color)} fontSize={fs} dominantBaseline="middle" textAnchor={n === 1 ? "middle" : "start"}>{txt}</text>
                  </g>
                );
              })}
              <circle r="12" fill="#fff" stroke="#ff9ec7" strokeWidth="3" />
            </svg>
          </div>
          {burst > 0 && (
            <div className="confetti" key={burst} aria-hidden="true">
              {bits.map((b, i) => <span key={i} style={{ "--dx": b.dx + "px", "--dy": b.dy + "px", "--r": b.r + "deg", animationDelay: b.d + "s" }}>{b.e}</span>)}
            </div>
          )}
        </div>
      )}
      <div className="result pop" key={result?.id || "none"} aria-live="polite">
        {result ? (<><span className="dot" style={{ background: result.color }} /> <b>{result.name}</b></>) : <span className="muted">Not picked yet</span>}
      </div>
      {n > 0 && (
        <label className="choose">
          <span>Or choose it yourself</span>
          <select value={result?.id || ""} disabled={spinning} onChange={(e) => { const p = items.find((x) => x.id === e.target.value); if (p) onResult(p); }}>
            <option value="" disabled>Pick one…</option>
            {items.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
      )}
      <div className="row">
        <button onClick={spin} disabled={spinning || locked || !n}>{spinning ? "Spinning…" : "SPIN!"}</button>
        <label className="lock"><input type="checkbox" checked={locked} disabled={!result} onChange={(e) => onLock(e.target.checked)} /> Keep</label>
      </div>
    </div>
  );
});
export default Wheel;
