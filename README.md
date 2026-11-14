# Ilm World Quran Academy

Public website and studio for [Ilm World Quran Academy](https://ilmworldacademy.com): online Quran classes with certified male and female teachers. Pages, posts, menus, and settings are read from MongoDB. Images are served from Cloudinary (`hbrxiqcq`, folder `ilmworld/`).

The live WordPress site is only a design reference. This app does not write to it.

## Stack

- Next.js (App Router) and TypeScript
- Tailwind CSS
- MongoDB driver (`lib/mongodb.ts`)
- TinyMCE for rich text (`@tinymce/tinymce-react`)
- Cloudinary signed uploads

## Setup

Works on Windows PowerShell (Node 24) and macOS/Linux. Every npm script is a Node or Next command, with no shell-specific syntax.

```powershell
npm install
Copy-Item .env.example .env.local
```

On macOS or Linux, `cp .env.example .env.local` does the same copy.

Fill in `MONGODB_URI`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `AUTH_SECRET`. Add Cloudinary credentials before using image upload. Leave `NEXT_PUBLIC_TINYMCE_API_KEY` empty to use the self-hosted GPL TinyMCE build. `postinstall` copies it to `public/tinymce`.

### MongoDB SRV fallback

You can keep the Atlas `mongodb+srv://` URI. The app and `npm run seed` try it first. If Node fails with a `querySrv` DNS error, they look up the cluster's SRV and TXT records through DNS-over-HTTPS (`https://dns.google/resolve`) and retry with the equivalent standard seed-list URI (`tls=true`, plus `authSource` and `replicaSet` from the TXT record).

If that HTTPS lookup is blocked too, paste Atlas's standard connection string into `MONGODB_URI`:

```text
mongodb://USER:PASSWORD@host1:27017,host2:27017,host3:27017/ilmworld?tls=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin
```

Set `MONGODB_DB=ilmworld` either way. The database name in the URI path and `MONGODB_DB` should agree.

### Local database without Atlas

```bash
npm run mongo:memory
```

Leave that process running. It listens on `mongodb://127.0.0.1:27018/`. Point `.env.local` at:

```text
MONGODB_URI=mongodb://127.0.0.1:27018/ilmworld
MONGODB_DB=ilmworld
```

`mongodb-memory-server` downloads a MongoDB binary the first time it starts.

## Seed

`data/seed/` holds the imported documents (`pages`, `posts`, `categories`, `media`, `menus`, `settings`). Seeding is idempotent: each document is upserted by `path`, `slug`, `publicId`, or `key`, and unique indexes are created for slug and path.

```bash
npm run seed
```

Pricing plans are not in the WordPress export. The public pricing page uses editable plans stored on the site settings document (defaults: $29, $59, and $99 per month, matching the homepage FAQ range). Saving settings writes them. Re-seeding does not remove `pricingPlans` if they are already stored.

## Develop

```bash
npm run dev
```

The app is served at [http://127.0.0.1:43123](http://127.0.0.1:43123).

| Route | What it is |
| --- | --- |
| `/` | Home |
| `/about-us` | About |
| `/quran-courses` | Course index |
| `/quran-courses/noorani-qaida-online` | Noorani Qaida |
| `/quran-courses/learn-quran-with-tajweed-online` | Tajweed |
| `/quran-courses/learn-quran-tafseer-online` | Tafseer |
| `/quran-courses/hifz-quran-online-quran-memorization` | Hifz |
| `/quran-courses/basic-islamic-education-for-kids-daily-duas` | Basic Islamic education |
| `/quran-courses/arabic-language-course` | Arabic |
| `/academic-tuition` | Academic subjects |
| `/contact-us` | Free-trial form |
| `/pricing` | Editable class plans |
| `/blog` | Post archive |
| `/blog/[slug]` | Three seeded articles |
| `/privacy-policy`, `/terms-conditions` | Policies |
| `/sitemap.xml`, `/robots.txt` | SEO |
| `/admin` | Studio (login required) |

Trial and contact submissions are stored in the `leads` collection.

The studio lives at `/admin`. Next.js 16 protects it with `middleware.ts` (the request interceptor; the framework also documents this file as Proxy). Sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`. From there you can edit pages, posts, categories, menus, settings, pricing plans, and leads. Rich text uses TinyMCE. Section fields have a form editor and a JSON editor. The media library lists the `media` collection and uploads new images to Cloudinary, then inserts them into `media`. Saving a document revalidates the affected paths.

## Production build

```bash
npm run lint
npm run build
npm start
```

`npm run build` reads MongoDB while it prerenders public pages, so the database should already be seeded.

## Deploy on Vercel

1. Push the repository and import it in Vercel.
2. Set every variable from `.env.example`. Use the non-SRV MongoDB URI if the build logs a DNS SRV error.
3. Set `NEXT_PUBLIC_SITE_URL` to the production origin, for example `https://ilmworldacademy.com`.
4. Deploy. The build runs `postinstall`, which copies TinyMCE into `public/tinymce`.
5. Open a one-off shell or run `npm run seed` against the Atlas database once. Unique indexes are created by that script.
6. Confirm `/`, a course page, `/contact-us`, `/sitemap.xml`, and `/admin` after the deploy.

Do not commit `.env.local` or Cloudinary secrets.
