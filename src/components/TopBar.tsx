import { ADDRESS, PHONE_NUMBER } from '@/contexts/Constain';
import React from 'react';

const TopBar: React.FC = () => {
  return (
    <div className="w-full font-sans text-[#1a3333]">
      {/* 1. Dải màu xanh rêu (Announcement Bar) */}
      <div className="w-full bg-[#1a3333] text-white text-[11px] font-medium tracking-[0.15em] py-2 px-4 text-center uppercase">
        Miễn phí giao hàng toàn quốc.
      </div>

      {/* 2. Dải thông tin nền kem nhạt (Top Info Bar) - Ẩn trên mobile, hiện từ md */}
      <div className="hidden md:block w-full bg-[#f9f8f4] border-b border-[#ced9d9]/30 py-2.5 px-6 md:px-10">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between text-[11px] tracking-wide font-medium text-[#1a3333]/80">
          {/* Bên trái: Các thông tin cam kết */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              {/* Icon Xe giao hàng */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span>Miễn phí giao hàng toàn quốc</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Icon Khiên bảo hành */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Bảo hành làm sáng trọn đời</span>
            </div>
          </div>

          {/* Bên phải: Các link điều hướng phụ (Đã bỏ Tài khoản) */}
          <div className="flex items-center gap-5">{`${PHONE_NUMBER} - ${ADDRESS}`}</div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
