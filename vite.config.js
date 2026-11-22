import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// base "./" lets the built app work from any address or sub-folder (Netlify, Vercel, GitHub Pages).
export default defineConfig({ base: "./", plugins: [react()] });
