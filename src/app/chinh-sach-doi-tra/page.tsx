'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import Link from 'next/link';

export default function ChinhSachDoiTraPage() {
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
            Chính Sách Đổi Trả & Hoàn Tiền
          </h1>
          <p className="text-sm text-luxury-muted font-sans">Cập nhật lần cuối: Tháng 4, 2026</p>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-[860px] mx-auto px-4 sm:px-6 py-12 md:py-16 w-full">
        <div className="font-sans leading-relaxed">
          <h1 className="text-center font-bold text-2xl mb-6">CHÍNH SÁCH ĐỔI TRẢ</h1>

          <p className="pl-8 mb-4">
            PAJ Silver hỗ trợ đổi trả sản phẩm trong các trường hợp phù hợp nhằm đảm bảo quyền lợi
            và trải nghiệm mua sắm tốt nhất cho khách hàng.
          </p>

          <h2 className="font-bold text-lg mt-4 mb-2">1. Điều kiện đổi trả</h2>

          <p className="pl-8 mb-2">Sản phẩm được hỗ trợ đổi trả khi:</p>

          <ul className="list-disc pl-16 mb-4">
            <li>Sản phẩm bị lỗi do nhà sản xuất</li>
            <li>Giao sai mẫu, sai size hoặc sai sản phẩm so với đơn hàng</li>
            <li>
              Sản phẩm còn nguyên vẹn, chưa qua sử dụng, không trầy xước hoặc hư hỏng do tác động
              bên ngoài
            </li>
            <li>Còn đầy đủ hộp, phụ kiện, quà tặng kèm nếu có</li>
          </ul>

          <h2 className="font-bold text-lg mt-4 mb-2">2. Thời gian hỗ trợ đổi trả</h2>

          <p className="pl-8 mb-4">
            Khách hàng vui lòng liên hệ PAJ Silver trong vòng 24–48 giờ sau khi nhận hàng nếu phát
            hiện sản phẩm có vấn đề.
          </p>

          <h2 className="font-bold text-lg mt-4 mb-2">3. Trường hợp không hỗ trợ đổi trả</h2>

          <p className="pl-8 mb-2">PAJ Silver không hỗ trợ đổi trả trong các trường hợp:</p>

          <ul className="list-disc pl-16 mb-4">
            <li>Sản phẩm đã qua sử dụng hoặc bị hư hỏng do khách hàng</li>
            <li>
              Sản phẩm bị trầy xước, biến dạng, đứt gãy do va đập hoặc bảo quản không đúng cách
            </li>
            <li>Sản phẩm đặt làm riêng, khắc tên, chỉnh size hoặc thiết kế theo yêu cầu</li>
            <li>Khách hàng thay đổi ý định sau khi đã nhận sản phẩm nhưng sản phẩm không có lỗi</li>
          </ul>

          <h2 className="font-bold text-lg mt-4 mb-2">4. Quy trình đổi trả</h2>

          <p className="pl-8 mb-4">
            Khách hàng vui lòng liên hệ PAJ Silver, cung cấp hình ảnh hoặc video tình trạng sản phẩm
            để được kiểm tra và hỗ trợ nhanh nhất.
          </p>

          <h2 className="font-bold text-lg mt-4 mb-2">5. Chi phí vận chuyển</h2>

          <p className="pl-8 mb-4">
            Trường hợp lỗi từ PAJ Silver, chúng tôi sẽ hỗ trợ chi phí đổi trả. Trường hợp phát sinh
            từ nhu cầu cá nhân của khách hàng, phí vận chuyển sẽ do khách hàng thanh toán.
          </p>

          <h2 className="font-bold text-lg mt-4 mb-2">6. Liên hệ hỗ trợ</h2>

          <p className="pl-8 mb-4">
            Mọi yêu cầu đổi trả vui lòng liên hệ PAJ Silver để được tư vấn và xử lý.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
