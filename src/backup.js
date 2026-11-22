import { DEFAULT_CATS, DEFAULT_GROUPS } from "./data.js";

// A backup holds your data, never your password.
export function buildBackup(user, { products, saved, cats, groups }) {
  return { app: "makeup-combo-wheel", version: 1, exportedAt: new Date().toISOString(), profile: { name: user.name, avatar: user.avatar }, products, saved, cats, groups };
}

export function downloadJson(obj, filename) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseBackup(text) {
  let b;
  try { b = JSON.parse(text); } catch { throw new Error("That file isn’t a valid backup."); }
  if (b?.app !== "makeup-combo-wheel" || !Array.isArray(b.products) || !Array.isArray(b.saved)) throw new Error("That file isn’t a Makeup combo wheel backup.");
  return {
    ...b,
    cats: Array.isArray(b.cats) && b.cats.length ? b.cats : DEFAULT_CATS,
    groups: Array.isArray(b.groups) ? b.groups : DEFAULT_GROUPS,
  };
}

// Merge: keep everything you have and add what's new. Same id, or same name in the same category, counts as the same product.
export function mergeBackup(cur, b) {
  const byId = (a, extra) => [...a, ...extra.filter((x) => !a.some((y) => y.id === x.id))];
  const products = [...cur.products, ...b.products.filter((x) => !cur.products.some((y) => y.id === x.id || (y.category === x.category && y.name.toLowerCase() === x.name.toLowerCase())))];
  return { products, saved: byId(cur.saved, b.saved), cats: byId(cur.cats, b.cats), groups: byId(cur.groups, b.groups) };
}
