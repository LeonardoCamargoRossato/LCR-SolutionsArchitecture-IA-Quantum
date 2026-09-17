-- Portfolio media bucket. Run once in Supabase SQL Editor.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  12582912,
  array['image/png','image/jpeg','image/webp','application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Clean re-runs.
drop policy if exists "Portfolio media public read" on storage.objects;
drop policy if exists "Portfolio admin upload" on storage.objects;
drop policy if exists "Portfolio admin update" on storage.objects;
drop policy if exists "Portfolio admin delete" on storage.objects;

-- Public images/PDFs are readable. The bucket is also marked public for public URLs.
create policy "Portfolio media public read"
on storage.objects for select
to public
using (bucket_id = 'portfolio-media');

-- Firebase Auth is configured in Supabase as Third-Party Auth.
-- A valid Firebase ID token is passed by the Supabase client.
-- The email check means the anon key alone cannot upload files.
create policy "Portfolio admin upload"
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = 'portfolio-media'
  and (auth.jwt() ->> 'email') = 'leo.c.rossato@gmail.com'
);

create policy "Portfolio admin update"
on storage.objects for update
to anon, authenticated
using (
  bucket_id = 'portfolio-media'
  and (auth.jwt() ->> 'email') = 'leo.c.rossato@gmail.com'
)
with check (
  bucket_id = 'portfolio-media'
  and (auth.jwt() ->> 'email') = 'leo.c.rossato@gmail.com'
);

create policy "Portfolio admin delete"
on storage.objects for delete
to anon, authenticated
using (
  bucket_id = 'portfolio-media'
  and (auth.jwt() ->> 'email') = 'leo.c.rossato@gmail.com'
);
