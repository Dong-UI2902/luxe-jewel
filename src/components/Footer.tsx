'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EMAIL, FACEBOOK, INSTAGRAM, PHONE_NUMBER, TIKTOK } from '@/contexts/Constain';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-luxury-border bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {/* Column 1: Contact / Hotline */}
          <div className="flex flex-col gap-5 sm:col-span-2 md:col-span-1">
            {/* Order hotline */}
            <div>
              <p className="text-[10px] font-semibold text-charcoal uppercase tracking-widest mb-3 font-sans">
                GỌI MUA HÀNG <span className="font-normal text-luxury-muted"> (8:00 - 22:00)</span>
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-luxury-warm border border-luxury-border flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-gold"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
                  </svg>
                </div>
                <div>
                  <a
                    href={`tel:${PHONE_NUMBER}`}
                    className="text-xl sm:text-2xl font-bold text-gold tracking-wide font-sans hover:text-gold-dark transition-colors"
                  >
                    {PHONE_NUMBER}
                  </a>
                  <p className="text-xs text-luxury-muted mt-0.5 font-sans">
                    Tất cả các ngày trong tuần
                  </p>
                </div>
              </div>
            </div>

            {/* Feedback hotline */}
            <div>
              <p className="text-[10px] font-semibold text-charcoal uppercase tracking-widest mb-3 font-sans">
                GÓP Ý, KHIẾU NẠI{' '}
                <span className="font-normal text-luxury-muted">(8:00 - 21:00)</span>
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-luxury-warm border border-luxury-border flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-gold"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
                  </svg>
                </div>
                <div>
                  <a
                    href={`tel:${PHONE_NUMBER}`}
                    className="text-xl sm:text-2xl font-bold text-gold tracking-wide font-sans hover:text-gold-dark transition-colors"
                  >
                    {PHONE_NUMBER}
                  </a>
                  <p className="text-xs text-luxury-muted mt-0.5 font-sans">
                    Tất cả các ngày trong tuần
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Showroom System */}
          <div>
            <p className="text-[10px] font-semibold text-gold-dark uppercase tracking-widest mb-4 font-sans">
              SỰ KIỆN NỔI BẬT
            </p>
            <div className="relative w-full aspect-[16/9] rounded-sm overflow-hidden border border-luxury-border">
              <Image
                src="https://img.rocket.new/generatedImages/rocket_gen_img_1d6ccea9d-1772062651624.png"
                alt="Hệ thống cửa hàng PAJ Silver toàn quốc với không gian trưng bày sang trọng"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-charcoal/30 flex items-center justify-center">
                <p className="text-white text-center text-sm font-medium leading-snug drop-shadow font-sans">
                  Ảnh sự kiện
                </p>
              </div>
            </div>
          </div>

          {/* Column 3: Fanpage */}
          <div>
            <p className="text-[10px] font-semibold text-gold-dark uppercase tracking-widest mb-4 font-sans">
              FANPAGE CỦA CHÚNG TÔI
            </p>

            {/* Banner image */}
            <div className="relative w-full aspect-[16/9] rounded-sm overflow-hidden mb-4 border border-luxury-border">
              <Link href={FACEBOOK} target="_blank">
                <Image
                  src="/assets/images/header-background.png"
                  alt="Banner fanpage PAJ Silver - trang sức cao cấp"
                  fill
                  className="object-cover"
                />
              </Link>
            </div>
          </div>
          {/* Company info */}
          <div className="text-xs text-charcoal-light space-y-1.5 font-sans">
            <p className="text-[10px] font-semibold text-gold-dark uppercase tracking-widest mb-4 font-sans">
              Thông tin về chúng tôi
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-5 mb-5">
              <Link
                href={FACEBOOK}
                target="_blank"
                aria-label="Facebook"
                className="text-charcoal-light hover:text-gold transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </Link>
              <Link
                href={INSTAGRAM}
                target="_blank"
                aria-label="Instagram"
                className="text-charcoal-light hover:text-gold transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Link>
              {/* <Link
                href="#"
                aria-label="YouTube"
                className="text-charcoal-light hover:text-gold transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </Link> */}
              <Link
                href={TIKTOK}
                target="_blank"
                aria-label="TikTok"
                className="text-charcoal-light hover:text-gold transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
                </svg>
              </Link>
            </div>
            <p className="font-semibold text-sm text-charcoal uppercase tracking-wide">
              PAJ Silver Jewel Store
            </p>
            <p className="text-luxury-muted">
              Cửa hàng: Vinhome Grand Park, P. Long Bình, Hồ Chí Minh, Việt Nam
            </p>
            <p className="text-luxury-muted">
              Điện thoại: {PHONE_NUMBER} - Fax: 7338656 - Email:{' '}
              <a href={`mailto:${EMAIL}`} className="hover:text-gold transition-colors">
                {EMAIL}
              </a>
            </p>

            {/* Da Thong Bao Bo Cong Thuong badge */}
            {/* <div className="flex justify-end mt-4">
                <div className="inline-flex items-center gap-1.5 border border-blue-500 rounded px-2.5 py-1.5">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-left leading-tight">
                    <p className="text-blue-600 font-bold text-xs">ĐÃ THÔNG BÁO</p>
                    <p className="text-blue-500 text-xs">BỘ CÔNG THƯƠNG</p>
                  </div>
                </div>
              </div> */}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 md:mt-10 pt-5 md:pt-6 border-t border-luxury-border flex flex-col items-center gap-3 md:flex-row md:justify-between">
          <p className="text-xs text-luxury-muted font-sans">
            © 2026 PAJ Silver. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {/* <Link
              href="#"
              className="text-xs text-luxury-muted hover:text-gold transition-colors font-sans min-h-[44px] flex items-center"
            >
              Chính sách bảo mật
            </Link>
            <Link
              href="#"
              className="text-xs text-luxury-muted hover:text-gold transition-colors font-sans min-h-[44px] flex items-center"
            >
              Điều khoản sử dụng
            </Link>
            <Link
              href="#"
              className="text-xs text-luxury-muted hover:text-gold transition-colors font-sans min-h-[44px] flex items-center"
            >
              Chính sách đổi trả
            </Link> */}
            <Link
              href="/chinh-sach-bao-mat"
              className="text-xs text-luxury-muted hover:text-gold transition-colors font-sans min-h-[44px] flex items-center"
            >
              Chính sách bảo mật
            </Link>
            <Link
              href="/dieu-khoan-su-dung"
              className="text-xs text-luxury-muted hover:text-gold transition-colors font-sans min-h-[44px] flex items-center"
            >
              Điều khoản sử dụng
            </Link>
            <Link
              href="/chinh-sach-doi-tra"
              className="text-xs text-luxury-muted hover:text-gold transition-colors font-sans min-h-[44px] flex items-center"
            >
              Chính sách đổi trả
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
