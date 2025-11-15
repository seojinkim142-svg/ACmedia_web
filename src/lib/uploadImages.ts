import { supabase } from "../supabaseClient";

export async function uploadImage(file: File) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = fileName;

  const { error } = await supabase.storage
    .from("images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    console.error("Upload Error:", error);
    return null;
  }

  const { data: publicUrl } = supabase.storage
    .from("images")
    .getPublicUrl(filePath);

  return publicUrl.publicUrl;
}
