// Local accounts: stored in THIS browser only (no server). Passwords are salted and hashed, never saved as text.
import { mergeProducts } from "./myProducts.js";

const enc = new TextEncoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const read = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

async function hash(password, salt) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  return b64(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 }, key, 256));
}
const needSecure = () => {
  if (!globalThis.crypto?.subtle) throw new Error("Sign-in needs a secure page. Open the app on localhost or an https link.");
};

export const getUsers = () => read("mc.users", []);
export const getUser = (email) => getUsers().find((u) => u.email === email);
export const getSession = () => read("mc.session", null);
export const logout = () => localStorage.removeItem("mc.session");
export const updateUser = (email, patch) => write("mc.users", getUsers().map((u) => (u.email === email ? { ...u, ...patch } : u)));

export async function signUp({ name, email, password }) {
  needSecure();
  email = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Enter a valid email address.");
  if (password.length < 6) throw new Error("Password needs at least 6 characters.");
  if (getUser(email)) throw new Error("That email already has an account. Try logging in.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  write("mc.users", [...getUsers(), { email, name: name.trim() || email.split("@")[0], avatar: "🧸", salt: b64(salt), hash: await hash(password, salt) }]);
  // The first account made in this browser inherits the products and combos saved before accounts existed.
  if (!read("mc.legacyClaimed", false)) {
    write("mc.legacyClaimed", true);
    const lp = read("mc.products", null), ls = read("mc.saved", null);
    if (lp) write(`mc.${email}.products`, mergeProducts(lp));
    if (ls) write(`mc.${email}.saved`, ls);
  }
  write("mc.session", email);
  return email;
}

export async function logIn({ email, password }) {
  needSecure();
  email = email.trim().toLowerCase();
  const u = getUser(email);
  if (!u || (await hash(password, unb64(u.salt))) !== u.hash) throw new Error("Wrong email or password.");
  write("mc.session", email);
  return email;
}
