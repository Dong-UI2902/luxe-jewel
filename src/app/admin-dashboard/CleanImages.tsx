import { createClient } from '@/lib/supabase/client';

export const cleanOrphanImages = async (): Promise<{
  success: boolean;
  deletedCount: number;
  message: string;
}> => {
  const supabase = createClient();

  try {
    // 1. Lấy danh sách tất cả các file có trong Storage Bucket 'product-images'
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('product-images')
      .list('', { limit: 1000 });

    if (storageError) throw storageError;
    if (!storageFiles || storageFiles.length === 0) {
      return { success: true, deletedCount: 0, message: 'Không có file nào trong Storage.' };
    }

    // 2. Lấy danh sách URL ảnh từ Database (cột image_url và gallery_urls)
    const { data: products, error: dbError } = await supabase
      .from('products')
      .select('image_url, gallery_urls');

    if (dbError) throw dbError;

    // 3. Gom tất cả tên file đang được sử dụng trong Database vào một Set
    const usedFiles = new Set<string>();

    products?.forEach((product) => {
      // Bóc tách ảnh đại diện (image_url)
      if (product.image_url && typeof product.image_url === 'string') {
        const fileName = product.image_url.split('/product-images/')[1];
        if (fileName) usedFiles.add(fileName);
      }

      // Bóc tách mảng ảnh bộ sưu tập (gallery_urls)
      if (Array.isArray(product.gallery_urls)) {
        product.gallery_urls.forEach((url: unknown) => {
          if (typeof url === 'string') {
            const fileName = url.split('/product-images/')[1];
            if (fileName) usedFiles.add(fileName);
          }
        });
      }
    });

    // 4. Lọc ra danh sách các file rác (Có trong Storage nhưng không có trong Database)
    const orphanFiles: string[] = storageFiles
      .map((file) => file.name)
      .filter((fileName): fileName is string => Boolean(fileName) && !usedFiles.has(fileName));

    if (orphanFiles.length === 0) {
      return {
        success: true,
        deletedCount: 0,
        message: 'Hệ thống sạch sẻ, không tìm thấy ảnh rác nào!',
      };
    }

    // 5. Gọi Storage API để xóa toàn bộ các file rác tìm được
    const { error: deleteError } = await supabase.storage
      .from('product-images')
      .remove(orphanFiles);

    if (deleteError) throw deleteError;

    return {
      success: true,
      deletedCount: orphanFiles.length,
      message: `✅ Đã xóa thành công ${orphanFiles.length} ảnh rác!`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định';
    console.error('Lỗi khi dọn dẹp ảnh rác:', errorMessage);
    return { success: false, deletedCount: 0, message: `Lỗi: ${errorMessage}` };
  }
};
