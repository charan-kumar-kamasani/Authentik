const supabase = require('../config/supabase');

/**
 * Uploads a file buffer to a Supabase Storage bucket.
 * @param {Buffer} fileBuffer - The file data as a buffer
 * @param {string} fileName - The destination file name (e.g. 'qrs/my-file.pdf')
 * @param {string} bucket - The Supabase Storage bucket name
 * @param {string} contentType - The MIME type of the file
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
const uploadToSupabaseStorage = async (fileBuffer, fileName, bucket = 'certificates_and_labtests', contentType = 'application/pdf') => {
  if (!supabase) {
    throw new Error("Supabase client is not configured.");
  }

  // Upload file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};

module.exports = {
  uploadToSupabaseStorage
};
