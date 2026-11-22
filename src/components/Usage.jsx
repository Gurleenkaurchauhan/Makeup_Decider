
const fmt = (iso) => (iso ? new Date(iso.length === 10 ? iso + "T00:00:00" : iso).toLocaleDateString() : "never");

export default function Usage({ products, setProducts, cats }) {
  const bump = (id, d) => setProducts(products.map((p) => (p.id === id ? { ...p, uses: Math.max(0, (p.uses || 0) + d) } : p)));
  const reset = (p) => {
    if (window.confirm(`Set ${p.name} back to 0 uses?`)) setProducts(products.map((x) => (x.id === p.id ? { ...x, uses: 0, lastUsed: null } : x)));
  };
  const total = products.reduce((n, p) => n + (p.uses || 0), 0);
  const never = products.filter((p) => !p.uses).length;
  const top = [...products].sort((a, b) => (b.uses || 0) - (a.uses || 0))[0];
  const max = Math.max(1, ...products.map((p) => p.uses || 0));

  if (!products.length) return <p className="muted">Add products first, then your usage shows up here.</p>;

  return (
    <section>
      <div className="stats">
        <div><b>{total}</b><span className="muted">total uses</span></div>
        <div><b>{top && top.uses ? top.name : "-"}</b><span className="muted">most used</span></div>
        <div><b>{never}</b><span className="muted">never used</span></div>
      </div>
      {cats.map((c) => {
        const list = products.filter((p) => p.category === c.id).sort((a, b) => (b.uses || 0) - (a.uses || 0));
        if (!list.length) return null;
        return (
          <div className="combo" key={c.id}>
            <h3>{c.label}</h3>
            {list.map((p) => (
              <div className="urow" key={p.id}>
                <span className="uname"><span className="dot" style={{ background: p.color }} /> {p.name}</span>
                <span className="bar" role="img" aria-label={`${p.uses || 0} uses`}><i style={{ width: `${((p.uses || 0) / max) * 100}%`, background: p.color }} /></span>
                <span className="muted unum">
                  {p.uses || 0}× · {p.uses ? fmt(p.lastUsed) : "never used"}
                  <button className="link" onClick={() => bump(p.id, -1)} disabled={!p.uses} aria-label={`Remove one use of ${p.name}`}>−1</button>
                  <button className="link" onClick={() => reset(p)} disabled={!p.uses} aria-label={`Reset ${p.name} to zero uses`}>Reset</button>
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </section>
  );
}
