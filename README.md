# Makeup combo wheel

Spin wheels over your own makeup, or choose products yourself. Create your own categories and wheel tabs,
track usage, pick the date worn, see it on a calendar and get a profile of what you like most.

    npm install
    npm run dev

Open the address Vite prints (usually http://localhost:5173).

Accounts (email and password) and all data are stored in the browser (localStorage), per browser, with no server.
They do not sync between devices.

## Install on your phone (PWA)

    npm run build
    npm run preview     # test the installable, offline build on localhost

Upload the `dist` folder to Netlify, Vercel or GitHub Pages to get an https link, open it on your phone and
choose "Install app" (Android) or Share, then "Add to Home Screen" (iPhone).
The service worker only runs in the built app, not in `npm run dev`.

## Backup

Profile, then "Backup and move your data": export a JSON file and import it on another device.
