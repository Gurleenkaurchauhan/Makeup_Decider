import { useState } from "react";

export default function ProductManager({ products, setProducts, onSample, cats }) {
  const [sel, setSel] = useState(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#c46a7c");
  const cat = cats.some((c) => c.id === sel) ? sel : cats[0]?.id;
  const list = products.filter((p) => p.category === cat);

  if (!cats.length) return <p className="muted">Create a category first in Customize.</p>;

  const add = (e) => {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    setProducts([...products, { id: crypto.randomUUID(), category: cat, name: clean, color, uses: 0, lastUsed: null }]);
    setName("");
  };
  const bump = (id, d) =>
    setProducts(products.map((p) => (p.id === id ? { ...p, uses: Math.max(0, (p.uses || 0) + d), lastUsed: d > 0 ? new Date().toISOString() : p.lastUsed } : p)));
  const remove = (id) => setProducts(products.filter((p) => p.id !== id));

  return (
    <section>
      <div className="tabs" role="tablist">
        {cats.map((c) => (
          <button key={c.id} role="tab" aria-selected={cat === c.id} className={cat === c.id ? "on" : ""} onClick={() => setSel(c.id)}>
            {c.label} ({products.filter((p) => p.category === c.id).length})
          </button>
        ))}
      </div>
      <form className="add" onSubmit={add}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name, e.g. MAC Whirl" aria-label="Product name" />
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} aria-label="Product colour" />
        <button type="submit">Add</button>
      </form>
      <ul className="plist">
        {list.map((p) => (
          <li key={p.id}>
            <span className="dot" style={{ background: p.color }} /> {p.name}
            <span className="muted"> · {p.uses || 0} uses</span>
            <button className="link" onClick={() => bump(p.id, -1)} disabled={!p.uses} aria-label={`Remove one use of ${p.name}`}>−1</button>
            <button className="link" onClick={() => bump(p.id, 1)} aria-label={`Add one use of ${p.name}`}>+1</button>
            <button className="link" onClick={() => remove(p.id)} aria-label={`Remove ${p.name}`}>Remove</button>
          </li>
        ))}
        {!list.length && <li className="muted">Nothing here yet.</li>}
      </ul>
      {!products.length && <button className="ghost" onClick={onSample}>Load sample products</button>}
    </section>
  );
}
