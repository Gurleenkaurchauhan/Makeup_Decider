// Your own products. category ids match src/data.js. "short" is the label shown on the wheel.
export const MY_PRODUCTS = [
  // Lip liner
  { category: "liner", name: "Maybelline Lifter Liner – Big Lift", short: "Big Lift", color: "#b3685e" },
  { category: "liner", name: "Maybelline Lifter Liner – Let’s Bounce", short: "Let’s Bounce", color: "#c0776c" },
  { category: "liner", name: "e.l.f. Lip Liner – Mauve Aside", short: "Mauve Aside", color: "#a56b7b" },
  { category: "liner", name: "e.l.f. Lip Liner – Espresso Martini", short: "Espresso", color: "#6b4036" },
  { category: "liner", name: "Nykaa Lip Liner – Chai", short: "Chai", color: "#a46a55" },
  // Lip base (only these three)
  { category: "gloss", name: "e.l.f. Lip Balm – Vanilla Toffee", short: "Van. Toffee", color: "#e8c5a0" },
  { category: "gloss", name: "Laneige Lip Balm", short: "Laneige", color: "#f3c5cf" },
  { category: "gloss", name: "Rom&nd Glasting Melting Balm – Kaya Fig", short: "Kaya Fig", color: "#b9707d" },
  { category: "base", name: "Rom&nd Zero Velvet Tint – Vintage Taupe", short: "Vintage Taupe", color: "#a0786c" },
  { category: "base", name: "Rom&nd Zero Velvet Tint – Villain Vest", short: "Villain Vest", color: "#8f3b4b" },
  { category: "gloss", name: "Judydoll Stay Shine Lipstick – Calm Nude", short: "Calm Nude", color: "#c9907f" },
  { category: "base", name: "Benefit Benetint", short: "Benetint", color: "#d9576f" },
  // Lip gloss (glosses, balms and the lipstick)
  { category: "gloss", name: "Fenty Beauty Gloss Bomb Stick – Lust Bunny", short: "Lust Bunny", color: "#e5a9a0" },
  { category: "gloss", name: "MAC Lipglass – Casual", short: "Casual", color: "#e8b3b0" },
  { category: "gloss", name: "Rom&nd Gloss – Dim Mauve", short: "Dim Mauve", color: "#b88a94" },
  // Blush
  { category: "blush", name: "House of Hur Blush – Ruby Red", short: "Ruby Red", color: "#b3263e" },
  { category: "blush", name: "MAC Blush – Ginger Luck", short: "Ginger Luck", color: "#d9805f" },
  { category: "blush", name: "PAC Blush – Retake", short: "Retake", color: "#e08a8a" },
  // Highlighter
  { category: "highlighter", name: "MAC Highlighter", short: "MAC", color: "#f1d9b5" },
  { category: "highlighter", name: "Fae Beauty Highlighter", short: "Fae Beauty", color: "#f2dfc8" },
  { category: "highlighter", name: "No highlighter", short: "No Highlight", color: "#fde2ec" },
  // Eyes
  { category: "kajal", name: "Fae Beauty Kajal – Black", short: "Fae Black", color: "#2a2326" },
  { category: "kajal", name: "Fae Beauty Kajal – Brown", short: "Fae Brown", color: "#6a4331" },
  { category: "mascara", name: "Maybelline Sky High Mascara", short: "Sky High", color: "#3a2d31" },
];

const STOP = new Set(["shade", "in", "lip", "liner", "by", "the", "of", "a"]);
const toks = (s) =>
  s.toLowerCase().replace(/\./g, "").replace(/&/g, "a").replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((t) => t && !STOP.has(t));
const same = (a, b) => {
  const A = toks(a), B = toks(b);
  const [s, l] = A.length <= B.length ? [A, B] : [B, A];
  return s.length > 0 && s.every((t) => l.includes(t));
};

// Adds the list above. Products you already typed in by hand are matched, renamed
// to the corrected spelling and keep their usage counts. Safe to run more than once.
export function mergeProducts(existing) {
  const out = [...existing];
  const used = new Set();
  for (const item of MY_PRODUCTS) {
    // Prefer a match in the same category, then fall back to any category so moved products keep their usage counts.
    let i = out.findIndex((p) => !used.has(p.id) && p.category === item.category && same(p.name, item.name));
    if (i < 0) i = out.findIndex((p) => !used.has(p.id) && same(p.name, item.name));
    if (i >= 0) {
      used.add(out[i].id);
      out[i] = { ...out[i], category: item.category, name: item.name, short: item.short, color: item.color };
    } else {
      const p = { id: crypto.randomUUID(), ...item, uses: 0, lastUsed: null };
      used.add(p.id);
      out.push(p);
    }
  }
  return out;
}
