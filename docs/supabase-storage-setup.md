# Supabase Storage setup — Portfolio Apps LCR

The application keeps **Firebase Authentication + Firestore** and uses **Supabase only for files**.

## 1. Create/open a Supabase project

Copy from Project Settings → API:

- Project URL → `VITE_SUPABASE_URL`
- anon / publishable key → `VITE_SUPABASE_ANON_KEY`

The bucket name used by the app is `portfolio-media`.

## 2. Connect Firebase Authentication to Supabase

In Supabase Dashboard open **Authentication → Third-Party Auth** and add **Firebase Auth**.
Use the same Firebase Project ID already used by the portfolio.

The web client sends the current Firebase ID token to Supabase automatically. React components do not call Supabase directly.

## 3. Create the bucket and policies

Open Supabase **SQL Editor** and run the complete file:

`supabase/storage-policies.sql`

It creates/updates a public bucket with these allowed types:

- PNG
- JPG/JPEG
- WEBP
- PDF

Maximum size at bucket level: 12 MB.

## 4. Admin authorization

Uploads, updates and deletes are allowed only when the Firebase JWT received by Supabase contains:

`email = leo.c.rossato@gmail.com`

The policies apply to both `anon` and `authenticated` database roles because Firebase JWTs may use the `anon` Postgres role when no custom `role` claim is present. The Firebase Third-Party Auth integration still verifies the token before it reaches Storage.

The public anon key by itself does **not** satisfy the email policy and therefore cannot write files.

## 5. Environment variables

Copy `.env.example` to `.env` and fill:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SUPABASE_MEDIA_BUCKET=portfolio-media
```

Then run:

```bash
npm install
npm run build
npm run dev
```

## Storage paths used by the app

- `projects/<project-slug>/...`
- `profile/...`
- `cv/...`
- `misc/...`

Media metadata and public URLs continue to be stored in Firestore. The file bytes are stored only in Supabase Storage.
