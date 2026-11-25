
# Portfólio Apps LCR — Supabase-only

## Final architecture

- Supabase Auth: administrator email + password
- Supabase PostgreSQL: all editable content
- Supabase Storage: all uploaded files
- GitHub Pages: static React/Vite hosting

Firebase and Google OAuth are not used.

## Environment

Create `.env.local`:

```env
VITE_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_SUPABASE_MEDIA_BUCKET=portfolio-media
```

Do not put passwords, service-role keys or secret keys in Vite.

## Database and Storage

Run `supabase/migration.sql` in Supabase SQL Editor.

It creates the portfolio tables, enables RLS, creates the public
`portfolio-media` bucket and restricts INSERT/UPDATE/DELETE to the authenticated
user whose JWT email is `leo.c.rossato@gmail.com`.

## Admin authentication

In Supabase Dashboard:

1. Go to Authentication > Providers.
2. Keep Email enabled.
3. Google provider is not needed.
4. Go to Authentication > Users.
5. Add the user `leo.c.rossato@gmail.com`.
6. Set a strong password.
7. Confirm the user/email if your project requires confirmation.
8. Recommended: disable public user sign-ups because this portfolio has one admin.

The password is never stored in source code.

## Admin flow

`/#/admin` presents email + password.

The app calls:

```ts
supabase.auth.signInWithPassword({ email, password })
```

The Supabase client persists and refreshes its own session.

Storage and PostgreSQL requests automatically use the same Supabase session.
There are no custom Authorization headers and no external JWTs.

## Public fallback

`defaultContent.ts` and `defaultProjects.ts` remain only as read fallback, so
the public site does not become blank if Supabase is temporarily unavailable.

Writes never silently fall back to memory.
