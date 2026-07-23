import React, { useState } from 'react';
import { cleanOrphanImages } from './cleanImages';

export const AdminCleanupButton = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleCleanup = async () => {
    if (!confirm('Bạn có chắc chắn muốn quét và xóa toàn bộ ảnh rác không dùng?')) return;

    setLoading(true);
    const result = await cleanOrphanImages();
    alert(result.message);
    setLoading(false);
  };

  return (
    <button
      onClick={handleCleanup}
      disabled={loading}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
    >
      {loading ? 'Đang dọn dẹp...' : '🧹 Dọn dẹp ảnh rác'}
    </button>
  );
};
