-- Create storage bucket for new arrivals images
insert into storage.buckets (id, name, public)
values ('new-arrivals', 'new-arrivals', true);

-- Set storage policies for public access
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'new-arrivals' );

-- Allow authenticated users to upload images
create policy "Authenticated users can upload"
on storage.objects for insert
with check ( bucket_id = 'new-arrivals' AND auth.role() = 'authenticated' );

-- Allow authenticated users to update images
create policy "Authenticated users can update"
on storage.objects for update
using ( bucket_id = 'new-arrivals' AND auth.role() = 'authenticated' );

-- Allow authenticated users to delete images
create policy "Authenticated users can delete"
on storage.objects for delete
using ( bucket_id = 'new-arrivals' AND auth.role() = 'authenticated' );
