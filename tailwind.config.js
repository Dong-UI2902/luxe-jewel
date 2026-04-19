/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // --- CHUYỂN ĐỔI HỆ MÀU GOLD SANG TÔNG TEAL TỪ LOGO ---
        gold: {
          // Lấy màu đậm nhất từ chữ PAJ của logo làm màu chủ đạo (Primary)
          DEFAULT: '#336666',

          // Các mức độ sáng khác để dùng cho Hover/Active
          light: '#4d8c8c', // Sáng hơn một chút
          dark: '#1f3d3d', // Đậm hơn

          // Nút bấm sẽ dùng tông teal chuẩn để nổi bật
          button: '#336666',

          // Subtle: màu nền nhạt nhất (pha với trắng) để tạo ô Grid, Dot
          // Tương đương rgba(51, 102, 102, 0.08)
          subtle: '#eaf1f1',
        },

        // --- CHUYỂN ĐỔI HỆ CHARCOAL (ĐEN) SANG TÔNG TEAL ĐẬM MỜ ---
        charcoal: {
          DEFAULT: '#1a3333' /* Màu Teal rất đậm cho tiêu đề */,
          mid: '#336666' /* Màu Teal chuẩn cho văn bản thường */,
          light: '#4d8c8c' /* Màu Teal nhạt cho phụ đề */,
        },

        // --- CHUYỂN ĐỔI HỆ LUXURY (TRẮNG/BỘI) SANG TÔNG NỀN KEM NHẠT TỪ LOGO ---
        luxury: {
          // Lấy màu nền kem ấm áp từ logo làm màu nền web (Luxury White)
          white: '#faf9f6',

          // Màu kem hơi đậm hơn một chút cho các ô card
          warm: '#f3f1eb',

          // Các tông mờ và border chuyển sang Teal pha xám nhẹ
          muted: '#80a0a0',
          border: '#ced9d9',
          'border-dark': '#b3c6c6',
        },
      },
      // ... các cấu hình font, fontSize, letterSpacing giữ nguyên
      boxShadow: {
        // Cập nhật lại đổ bóng sang tông teal mờ cho đồng bộ
        product: '0 4px 24px rgba(51, 102, 102, 0.06)',
        'product-hover': '0 12px 40px rgba(51, 102, 102, 0.12)',
        gold: '0 4px 24px rgba(51, 102, 102, 0.15)',
        drawer: '-4px 0 40px rgba(51, 102, 102, 0.1)',
      },
    },
  },
  plugins: [],
};
