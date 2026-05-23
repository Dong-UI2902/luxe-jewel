'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import Link from 'next/link';

export default function ChinhSachBaoMatPage() {
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
            Chính Sách Bảo Mật
          </h1>
          <p className="text-sm text-luxury-muted font-sans">Cập nhật lần cuối: Tháng 4, 2026</p>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-[860px] mx-auto px-4 sm:px-6 py-12 md:py-16 w-full">
        <div className="font-sans leading-relaxed">
          <h1 className="text-center font-bold text-2xl mb-6">CHÍNH SÁCH BẢO MẬT</h1>

          <p className="pl-8 mb-4">
            PAJ Silver cam kết bảo mật thông tin cá nhân của khách hàng trong quá trình mua sắm và
            sử dụng dịch vụ tại website.
          </p>

          <h2 className="font-bold text-lg mt-4 mb-2">1. Thông tin thu thập</h2>

          <p className="pl-8 mb-4">
            Chúng tôi có thể thu thập các thông tin cần thiết như: họ tên, số điện thoại, địa chỉ
            giao hàng, email và thông tin đơn hàng nhằm phục vụ việc tư vấn, xác nhận và giao sản
            phẩm.
          </p>

          <h2 className="font-bold text-lg mt-4 mb-2">2. Mục đích sử dụng thông tin</h2>

          <p className="pl-8 mb-2">Thông tin khách hàng được sử dụng để:</p>

          <ul className="list-disc pl-16 mb-4">
            <li>Xác nhận và xử lý đơn hàng</li>
            <li>Giao hàng đến đúng địa chỉ</li>
            <li>Hỗ trợ chăm sóc khách hàng</li>
            <li>Cung cấp thông tin về sản phẩm, ưu đãi hoặc chương trình mới của PAJ Silver</li>
          </ul>

          <h2 className="font-bold text-lg mt-4 mb-2">3. Bảo mật thông tin</h2>

          <p className="pl-8 mb-4">
            PAJ Silver không bán, trao đổi hoặc chia sẻ thông tin cá nhân của khách hàng cho bên thứ
            ba, trừ trường hợp cần thiết để giao hàng hoặc theo yêu cầu của cơ quan có thẩm quyền.
          </p>

          <h2 className="font-bold text-lg mt-4 mb-2">4. Quyền của khách hàng</h2>

          <p className="pl-8 mb-4">
            Khách hàng có quyền yêu cầu chỉnh sửa, cập nhật hoặc xoá thông tin cá nhân bằng cách
            liên hệ trực tiếp với PAJ Silver.
          </p>

          <h2 className="font-bold text-lg mt-4 mb-2">5. Liên hệ</h2>

          <p className="pl-8 mb-4">
            Mọi thắc mắc về chính sách bảo mật, vui lòng liên hệ PAJ Silver để được hỗ trợ.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
