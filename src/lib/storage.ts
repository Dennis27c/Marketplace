import { supabase } from './supabase';

const BUCKET_NAME = 'marketplace-images';

/**
 * Upload an image file to Supabase Storage
 * @param file - The image file to upload
 * @param folder - The folder path (e.g., 'products', 'businesses')
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  folder: 'products' | 'businesses'
): Promise<string> {
  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = fileName;

    // Upload the file
    const { error: uploadError, data } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw new Error(`Error al subir la imagen: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('No se pudo obtener la URL pública de la imagen');
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadImage:', error);
    throw error;
  }
}

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The public URL of the image to delete
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract the file path from the URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === BUCKET_NAME);
    
    if (bucketIndex === -1) {
      console.warn('Image URL does not belong to our bucket, skipping deletion');
      return;
    }

    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
      // Don't throw, just log the error
    }
  } catch (error) {
    console.error('Error in deleteImage:', error);
    // Don't throw, just log the error
  }
}

/**
 * Validate if a file is a valid image
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, WEBP, GIF)'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'La imagen es demasiado grande. El tamaño máximo es 5MB'
    };
  }

  return { valid: true };
}
