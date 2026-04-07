import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://pcyfldexcptscqxstvzl.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeWZsZGV4Y3B0c2NxeHN0dnpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTYzNjUsImV4cCI6MjA5MTA5MjM2NX0.Arpy6GbY8-EwFI_JgYRGfoByu1tbDsNA0i_DrLZI0uE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function uploadPostImage(file: Blob, fileName: string): Promise<string> {
  const path = `posts/${Date.now()}_${fileName}`;

  const { error } = await supabase.storage
    .from('post-images')
    .upload(path, file, { contentType: 'image/jpeg', upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from('post-images').getPublicUrl(path);
  return data.publicUrl;
}
