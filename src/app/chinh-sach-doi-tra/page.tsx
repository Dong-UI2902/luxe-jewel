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
          <p className="text-sm text-luxury-muted font-sans">
            Cập nhật lần cuối: Tháng 4, 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-[860px] mx-auto px-4 sm:px-6 py-12 md:py-16 w-full">
        <div className="space-y-10">

          {/* Intro */}
          <p className="text-base text-charcoal-light leading-relaxed font-sans border-l-2 border-gold pl-5 italic">
            Tại PAJ Silver, sự hài lòng của Quý khách là ưu tiên hàng đầu. Chúng tôi cam kết mang đến quy trình đổi trả minh bạch, nhanh chóng và thuận tiện nhất — bởi mỗi món trang sức PAJ Silver đều xứng đáng được trân trọng đúng cách.
          </p>

          {/* Quick summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-luxury-border rounded-sm p-4 text-center bg-luxury-warm">
              <p className="text-2xl font-bold text-gold font-sans mb-1">7</p>
              <p className="text-xs font-semibold text-charcoal uppercase tracking-widest font-sans">Ngày đổi trả</p>
              <p className="text-xs text-luxury-muted mt-1 font-sans">Kể từ ngày nhận hàng</p>
            </div>
            <div className="border border-luxury-border rounded-sm p-4 text-center bg-luxury-warm">
              <p className="text-2xl font-bold text-gold font-sans mb-1">100%</p>
              <p className="text-xs font-semibold text-charcoal uppercase tracking-widest font-sans">Miễn phí</p>
              <p className="text-xs text-luxury-muted mt-1 font-sans">Đổi hàng lỗi sản xuất</p>
            </div>
            <div className="border border-luxury-border rounded-sm p-4 text-center bg-luxury-warm">
              <p className="text-2xl font-bold text-gold font-sans mb-1">24h</p>
              <p className="text-xs font-semibold text-charcoal uppercase tracking-widest font-sans">Phản hồi</p>
              <p className="text-xs text-luxury-muted mt-1 font-sans">Xử lý yêu cầu đổi trả</p>
            </div>
          </div>

          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-charcoal uppercase tracking-widest mb-4 font-sans flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">1</span>
              Thời Gian & Điều Kiện Đổi Trả
            </h2>
            <div className="space-y-3 text-sm text-charcoal-light leading-relaxed font-sans pl-10">
              <p>PAJ Silver chấp nhận yêu cầu đổi trả trong vòng <strong className="text-charcoal">7 ngày kể từ ngày Quý khách nhận được hàng</strong>. Để được chấp nhận đổi trả, sản phẩm phải đáp ứng đầy đủ các điều kiện sau:</p>
              <ul className="space-y-2 list-none mt-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span>Sản phẩm còn nguyên vẹn, chưa qua sử dụng, không có dấu hiệu trầy xước hay biến dạng.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span>Còn đầy đủ hộp đựng, túi vải, giấy chứng nhận chất lượng và thẻ bảo hành gốc của PAJ Silver.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span>Kèm theo hóa đơn mua hàng hoặc xác nhận đơn hàng từ hệ thống PAJ Silver.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span>Không có mùi nước hoa, mỹ phẩm hoặc các chất tẩy rửa.</span>
                </li>
              </ul>
            </div>
          </section>

          <div className="border-t border-luxury-border"></div>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-bold text-charcoal uppercase tracking-widest mb-4 font-sans flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">2</span>
              Đổi Miễn Phí Cho Lỗi Sản Xuất
            </h2>
            <div className="space-y-3 text-sm text-charcoal-light leading-relaxed font-sans pl-10">
              <p>PAJ Silver cam kết <strong className="text-charcoal">đổi sản phẩm mới hoàn toàn miễn phí</strong> trong trường hợp sản phẩm có lỗi kỹ thuật từ nhà sản xuất, bao gồm:</p>
              <ul className="space-y-2 list-none mt-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Bạc bị xỉn màu bất thường:</strong> Hiện tượng oxy hóa hoặc đổi màu xảy ra trong điều kiện bảo quản và sử dụng bình thường.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Lỗi kết cấu:</strong> Khóa cài bị hỏng, mối hàn bị nứt, đá bị lỏng hoặc rơi ra do lỗi gia công.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Sai thông số kỹ thuật:</strong> Sản phẩm nhận được không đúng với mô tả về chất liệu, kích thước hoặc thiết kế đã đặt hàng.</span>
                </li>
              </ul>
              <p className="mt-3">Chi phí vận chuyển đổi hàng lỗi sản xuất sẽ do PAJ Silver chi trả toàn bộ.</p>
            </div>
          </section>

          <div className="border-t border-luxury-border"></div>

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-bold text-charcoal uppercase tracking-widest mb-4 font-sans flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">3</span>
              Trường Hợp Không Áp Dụng Đổi Trả
            </h2>
            <div className="space-y-3 text-sm text-charcoal-light leading-relaxed font-sans pl-10">
              <p>Vì tính chất đặc thù của sản phẩm, PAJ Silver <strong className="text-charcoal">không chấp nhận đổi trả</strong> trong các trường hợp sau:</p>
              <ul className="space-y-2 list-none mt-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Sản phẩm cá nhân hóa:</strong> Trang sức được khắc tên, ngày tháng, thông điệp riêng hoặc thiết kế theo yêu cầu đặc biệt của Quý khách — trừ trường hợp có lỗi kỹ thuật từ phía PAJ Silver.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span>Sản phẩm đã qua sử dụng, có dấu hiệu mài mòn hoặc bị hư hỏng do tác động bên ngoài.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span>Sản phẩm không còn đầy đủ bao bì, phụ kiện đi kèm hoặc giấy tờ gốc.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span>Yêu cầu đổi trả được gửi sau 7 ngày kể từ ngày nhận hàng.</span>
                </li>
              </ul>
            </div>
          </section>

          <div className="border-t border-luxury-border"></div>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-bold text-charcoal uppercase tracking-widest mb-4 font-sans flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">4</span>
              Quy Trình Đổi Trả
            </h2>
            <div className="space-y-4 text-sm text-charcoal-light leading-relaxed font-sans pl-10">
              <p>Để thực hiện yêu cầu đổi trả, Quý khách vui lòng thực hiện theo các bước sau:</p>

              <div className="space-y-4 mt-2">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border border-gold/40 bg-gold/5 flex items-center justify-center text-gold text-xs font-bold font-sans">B1</div>
                  <div>
                    <p className="font-semibold text-charcoal mb-1">Liên hệ PAJ Silver</p>
                    <p>Gọi hotline <a href="tel:0965154099" className="text-gold hover:text-gold-dark transition-colors font-medium">0965.154.099</a> hoặc đến trực tiếp boutique tại <strong className="text-charcoal">Yên Lãng, Hà Nội</strong> trong giờ làm việc (8:00 – 21:00, tất cả các ngày trong tuần).</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border border-gold/40 bg-gold/5 flex items-center justify-center text-gold text-xs font-bold font-sans">B2</div>
                  <div>
                    <p className="font-semibold text-charcoal mb-1">Cung cấp thông tin</p>
                    <p>Chuẩn bị mã đơn hàng, ảnh chụp sản phẩm (nếu có lỗi) và mô tả ngắn gọn lý do đổi trả. Đội ngũ tư vấn sẽ xác nhận yêu cầu trong vòng 24 giờ.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border border-gold/40 bg-gold/5 flex items-center justify-center text-gold text-xs font-bold font-sans">B3</div>
                  <div>
                    <p className="font-semibold text-charcoal mb-1">Gửi sản phẩm về PAJ Silver</p>
                    <p>Đóng gói sản phẩm cẩn thận cùng toàn bộ phụ kiện và gửi về địa chỉ boutique Yên Lãng, Hà Nội. Đối với lỗi sản xuất, PAJ Silver sẽ sắp xếp nhân viên đến lấy hàng tận nơi.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border border-gold/40 bg-gold/5 flex items-center justify-center text-gold text-xs font-bold font-sans">B4</div>
                  <div>
                    <p className="font-semibold text-charcoal mb-1">Nhận sản phẩm mới / hoàn tiền</p>
                    <p>Sau khi kiểm tra và xác nhận, PAJ Silver sẽ gửi sản phẩm thay thế hoặc thực hiện hoàn tiền trong vòng 3–5 ngày làm việc.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact highlight box */}
          <div className="bg-luxury-warm border border-gold/30 rounded-sm p-6 mt-4">
            <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-3 font-sans">Liên hệ đổi trả</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="tel:0965154099" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.61 21 3 13.39 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.58a1 1 0 01-.25 1.01l-2.2 2.2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-luxury-muted font-sans">Hotline đổi trả</p>
                  <p className="text-sm font-bold text-gold group-hover:text-gold-dark transition-colors font-sans">0965.154.099</p>
                </div>
              </a>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-luxury-muted font-sans">Boutique</p>
                  <p className="text-sm font-semibold text-charcoal font-sans">Yên Lãng, Hà Nội</p>
                </div>
              </div>
            </div>
          </div>

          {/* Back links */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/chinh-sach-bao-mat" className="text-xs text-luxury-muted hover:text-gold transition-colors font-sans underline underline-offset-2">
              Chính sách bảo mật →
            </Link>
            <Link href="/dieu-khoan-su-dung" className="text-xs text-luxury-muted hover:text-gold transition-colors font-sans underline underline-offset-2">
              Điều khoản sử dụng →
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
