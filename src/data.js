export const DEFAULT_CATS = [
  { id: "liner", label: "Lip liner", color: "#ffb3d1" },
  { id: "base", label: "Lip base", color: "#ffd1a9" },
  { id: "gloss", label: "Lip gloss", color: "#f7a8d8" },
  { id: "blush", label: "Blush", color: "#ffb0a8" },
  { id: "highlighter", label: "Highlighter", color: "#fff0a8" },
  { id: "kajal", label: "Kajal", color: "#c9b3ff" },
  { id: "mascara", label: "Mascara", color: "#b3d9ff" },
];
// Wheel background colour of a category (older saved categories fall back to the default colour).
export const catColor = (c) => c?.color || DEFAULT_CATS.find((d) => d.id === c?.id)?.color || "#ffb3d1";
export const DEFAULT_GROUPS = [
  { id: "lips", label: "Lip combo", cats: ["liner", "base", "gloss"] },
  { id: "cheeks", label: "Cheek combo", cats: ["blush", "highlighter"] },
  { id: "eyes", label: "Eye combo", cats: ["kajal", "mascara"] },
];
export const SAMPLE = [
  ["liner", "Soft brown", "#9c5b4a"], ["liner", "Rose pink", "#c46a7c"], ["liner", "Deep plum", "#6b2d4a"],
  ["base", "Peach balm", "#f2b49a"], ["base", "Clear primer", "#f6e3dc"], ["base", "Berry tint", "#c9707f"],
  ["gloss", "Clear shine", "#f4d6d0"], ["gloss", "Pink pearl", "#eb9fb3"], ["gloss", "Gold shimmer", "#e8b866"],
  ["blush", "Peach", "#f09a7c"], ["blush", "Rosy pink", "#e57c97"], ["blush", "Berry", "#b14b6a"],
  ["highlighter", "Champagne", "#f1d9a8"], ["highlighter", "Pearl", "#f3e8ec"], ["highlighter", "Rose gold", "#e0a58f"],
].map(([category, name, color], i) => ({ id: "s" + i, category, name, color }));
