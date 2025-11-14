import { supabase } from "../supabaseClient";

export async function uploadImage(file: File) {
  const fileName = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("images")
    .upload(fileName, file);

  if (error) {
    console.error("Upload Error:", error);
    return null;
  }

  const { data: publicUrl } = supabase.storage
    .from("images")
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
}
