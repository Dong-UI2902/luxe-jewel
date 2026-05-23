'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import Link from 'next/link';

export default function DieuKhoanSuDungPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <CartDrawer />

      {/* Hero Banner */}
      <div className="bg-luxury-warm border-b border-luxury-border py-10 md:py-14">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 text-center">
          <p className="text-[10px] font-semibold text-gold uppercase tracking-[0.25em] mb-3 font-sans">
            PAJ SILVER
          </p>
          <h1 className="text-2xl md:text-4xl font-bold text-charcoal tracking-tight font-sans mb-3">
            Điều Khoản Sử Dụng
          </h1>
          <p className="text-sm text-luxury-muted font-sans">Cập nhật lần cuối: Tháng 4, 2026</p>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-[860px] mx-auto px-4 sm:px-6 py-12 md:py-16 w-full">
        <div className="font-sans leading-relaxed">
          <h1 className="text-center font-bold text-2xl mb-6">ĐIỀU KHOẢN SỬ DỤNG</h1>

          <p className="pl-8 mb-4">
            Khi truy cập và mua sắm tại website của PAJ Silver, khách hàng đồng ý với các điều khoản
            sử dụng dưới đây.
          </p>

          <h2 className="font-bold text-lg mt-4 mb-2">1. Thông tin sản phẩm</h2>

          <p className="pl-8 mb-4">
            PAJ Silver luôn cố gắng cung cấp thông tin sản phẩm chính xác nhất, bao gồm hình ảnh,
            chất liệu, kích thước, mô tả và giá bán. Tuy nhiên, màu sắc sản phẩm có thể chênh lệch
            nhẹ do ánh sáng chụp hoặc thiết bị hiển thị.
          </p>

          <h2 className="font-bold text-lg mt-4 mb-2">2. Giá bán và thanh toán</h2>

          <p className="pl-8 mb-4">
            Giá sản phẩm được niêm yết trên website hoặc thông báo trực tiếp bởi PAJ Silver. Khách
            hàng có thể thanh toán theo các phương thức được PAJ Silver hỗ trợ tại thời điểm mua
            hàng.
          </p>

          <h2 className="font-bold text-lg mt-4 mb-2">3. Xác nhận đơn hàng</h2>

          <p className="pl-8 mb-4">
            Đơn hàng chỉ được xem là hợp lệ sau khi PAJ Silver xác nhận thông tin sản phẩm, số
            lượng, giá bán và địa chỉ giao hàng với khách hàng.
          </p>

          <h2 className="font-bold text-lg mt-4 mb-2">4. Trách nhiệm của khách hàng</h2>

          <p className="pl-8 mb-4">
            Khách hàng cần cung cấp thông tin chính xác khi đặt hàng, bao gồm họ tên, số điện thoại
            và địa chỉ nhận hàng. PAJ Silver không chịu trách nhiệm với các trường hợp giao hàng sai
            do thông tin khách hàng cung cấp không chính xác.
          </p>

          <h2 className="font-bold text-lg mt-4 mb-2">5. Quyền thay đổi nội dung</h2>

          <p className="pl-8 mb-4">
            PAJ Silver có quyền cập nhật, chỉnh sửa nội dung website, giá bán, chính sách hoặc
            chương trình ưu đãi mà không cần thông báo trước.
          </p>

          <h2 className="font-bold text-lg mt-4 mb-2">6. Liên hệ hỗ trợ</h2>

          <p className="pl-8 mb-4">
            Mọi thắc mắc trong quá trình sử dụng website hoặc mua hàng, khách hàng vui lòng liên hệ
            PAJ Silver để được hỗ trợ.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
