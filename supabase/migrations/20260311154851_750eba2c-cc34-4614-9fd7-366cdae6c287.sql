
-- Create storage bucket for technician resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

-- Allow anyone to upload resumes
CREATE POLICY "Anyone can upload resumes"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'resumes');

-- Allow anyone to read resumes (for admin to download)
CREATE POLICY "Anyone can read resumes"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'resumes');
