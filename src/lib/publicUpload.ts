import { supabase } from '@/integrations/supabase/client';

/** Uploads a file through the validated public-upload server function. */
export const publicUpload = async (bucket: 'device-images' | 'resumes', file: File): Promise<string> => {
  const form = new FormData();
  form.append('bucket', bucket);
  form.append('file', file);
  const { data, error } = await supabase.functions.invoke('public-upload', { body: form });
  if (error || !data?.publicUrl) throw error || new Error(data?.error || 'upload_failed');
  return data.publicUrl as string;
};
