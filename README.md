# Royal Hospital, Kota

A responsive website for Royal Hospital ENT & Multispeciality and Dr. Imran Khan. It is served entirely as static HTML, CSS, local images, fonts and vanilla JavaScript. There are no runtime dependencies, API routes, forms that collect patient data, or database.

## Run locally

```sh
npm run dev       # http://localhost:5173 (requires Python 3)
npm run build     # copies the static site to dist/ (requires Node.js 20+)
npm run preview   # serves dist/ at http://localhost:4173
```

Upload `dist/` to any static host, or point a static host directly at `public/`. For a Vercel project connected to this repository, the included `vercel.json` uses `npm run build` and `dist/`; no environment variables are required.

## Editing the site

- `public/index.html`: main page, contact information, consultation hours, photos, review excerpts and FAQ.
- `public/styles.css`: responsive styles, colours and self-hosted fonts.
- `public/main.js`: compact navigation, appointment and specialty dialogs, photo viewer and click-to-load map. Core content and direct call, photo and directions links also work without JavaScript.
- [Research and photo sources](docs/sources.md): public sources, details to confirm with reception and asset credit.

Appointment links connect patients to reception by phone or WhatsApp; they do not reserve a slot. Google Maps is not loaded until a visitor chooses to view it.
