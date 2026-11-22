import { useState } from "react";
import { catColor } from "../data.js";

const hsl = (h, sat, l) => {
  l /= 100; const a = (sat * Math.min(l, 1 - l)) / 100;
  const f = (n) => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))).toString(16).padStart(2, "0"); };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const newId = () => "c" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

export default function Customize({ cats, setCats, groups, setGroups, products, setProducts, defaults }) {
  const [cname, setCname] = useState("");
  const [ccolor, setCcolor] = useState("#ffb3d1");
  const [own, setOwn] = useState(true);
  const [gname, setGname] = useState("");

  const addCat = (e) => {
    e.preventDefault();
    const label = cname.trim();
    if (!label) return;
    const c = { id: newId(), label, color: ccolor };
    setCats([...cats, c]);
    if (own) setGroups([...groups, { id: newId(), label: label + " combo", cats: [c.id] }]);
    setCname("");
  };
  const delCat = (c) => {
    if (!window.confirm(`Delete "${c.label}" and all products in it?`)) return;
    setCats(cats.filter((x) => x.id !== c.id));
    setProducts(products.filter((p) => p.category !== c.id));
    setGroups(groups.map((g) => ({ ...g, cats: g.cats.filter((x) => x !== c.id) })));
  };
  const addGroup = (e) => {
    e.preventDefault();
    const label = gname.trim();
    if (!label) return;
    setGroups([...groups, { id: newId(), label, cats: [] }]);
    setGname("");
  };
  const delGroup = (g) => { if (window.confirm(`Delete the "${g.label}" tab? Your products stay.`)) setGroups(groups.filter((x) => x.id !== g.id)); };
  const toggle = (g, cid) => setGroups(groups.map((x) => (x.id !== g.id ? x : { ...x, cats: x.cats.includes(cid) ? x.cats.filter((y) => y !== cid) : [...x.cats, cid] })));
  const setColor = (id, color) => setProducts(products.map((p) => (p.id === id ? { ...p, color } : p)));
  // Gives every product in a category its own distinct pastel colour so neighbouring slices never match.
  const spread = (cid) => {
    if (!window.confirm("Give every product in this category a different colour? You can still change each one afterwards.")) return;
    const ids = products.filter((p) => p.category === cid).map((p) => p.id);
    setProducts(products.map((p) => (ids.includes(p.id) ? { ...p, color: hsl(Math.round((ids.indexOf(p.id) * 360) / ids.length) % 360, 70, 78) } : p)));
  };
  const restore = () => {
    setCats([...defaults.cats.filter((d) => !cats.some((c) => c.id === d.id)), ...cats]);
    setGroups([...defaults.groups.filter((d) => !groups.some((g) => g.id === d.id)), ...groups]);
  };

  return (
    <section>
      <div className="combo">
        <h2>New category</h2>
        <p className="muted small">A category is a type of product, like eyeshadow or perfume. It gets its own wheel. Pick the wheel’s background colour with the colour box. You can change it later from the list below.</p>
        <form className="add" onSubmit={addCat}>
          <input value={cname} onChange={(e) => setCname(e.target.value)} placeholder="e.g. Eyeshadow" aria-label="Category name" />
          <input type="color" className="cpick" value={ccolor} onChange={(e) => setCcolor(e.target.value)} aria-label="Wheel background colour" title="Wheel background colour" />
          <button type="submit">Add category</button>
        </form>
        <label className="usedbox"><input type="checkbox" checked={own} onChange={(e) => setOwn(e.target.checked)} /> Also make it a tab of its own</label>
        <ul className="plist">
          {cats.map((c) => (
            <li key={c.id}><input type="color" className="cpick" value={catColor(c)} onChange={(e) => setCats(cats.map((x) => (x.id === c.id ? { ...x, color: e.target.value } : x)))} aria-label={`Wheel colour for ${c.label}`} title="Change wheel colour" /> {c.label} <span className="muted">· {products.filter((p) => p.category === c.id).length} products</span>
              <button className="link" onClick={() => delCat(c)}>Delete</button></li>
          ))}
          {!cats.length && <li className="muted">No categories yet.</li>}
        </ul>
      </div>

      <div className="combo">
        <h2>Wheel tabs</h2>
        <p className="muted small">A tab is a set of wheels that spin together. Tick the categories each tab should have.</p>
        <form className="add" onSubmit={addGroup}>
          <input value={gname} onChange={(e) => setGname(e.target.value)} placeholder="e.g. Full face look" aria-label="Tab name" />
          <button type="submit">Add tab</button>
        </form>
        {groups.map((g) => (
          <div key={g.id} className="grow">
            <h3>{g.label} <button className="link" onClick={() => delGroup(g)}>Delete</button></h3>
            <div className="opts">
              {cats.map((c) => (
                <label key={c.id}><input type="checkbox" checked={g.cats.includes(c.id)} onChange={() => toggle(g, c.id)} /><span>{c.label}</span></label>
              ))}
            </div>
          </div>
        ))}
        <button className="ghost" onClick={restore}>Add back the original categories and tabs</button>
      </div>

      <div className="combo">
        <h2>Product colours 🎨</h2>
        <p className="muted small">Each product’s slice on the wheel uses its own colour. Change it here any time. If two slices look alike, use “Make colours different”.</p>
        {cats.map((c) => {
          const list = products.filter((p) => p.category === c.id);
          if (!list.length) return null;
          return (
            <div key={c.id} className="grow">
              <h3>{c.label} <button className="link" onClick={() => spread(c.id)}>Make colours different</button></h3>
              <ul className="plist">
                {list.map((p) => (
                  <li key={p.id}>
                    <input type="color" className="cpick" value={p.color || "#ffb3d1"} onChange={(e) => setColor(p.id, e.target.value)} aria-label={`Slice colour for ${p.name}`} title="Change slice colour" /> {p.name}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {!products.length && <p className="muted">Add products first, then their colours show up here.</p>}
      </div>
    </section>
  );
}
