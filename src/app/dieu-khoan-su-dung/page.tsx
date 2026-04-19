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
            Bằng việc truy cập và sử dụng website PAJ Silver, Quý khách đồng ý tuân thủ và chịu ràng buộc bởi các điều khoản và điều kiện được quy định dưới đây. Vui lòng đọc kỹ trước khi tiếp tục sử dụng dịch vụ của chúng tôi.
          </p>

          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-charcoal uppercase tracking-widest mb-4 font-sans flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">1</span>
              Chấp Nhận Điều Khoản
            </h2>
            <div className="space-y-3 text-sm text-charcoal-light leading-relaxed font-sans pl-10">
              <p>Khi truy cập vào website PAJ Silver (pajsilver.vn), Quý khách xác nhận rằng mình đã đủ 18 tuổi hoặc đang được sự giám sát của người giám hộ hợp pháp, và đồng ý bị ràng buộc bởi toàn bộ các điều khoản sử dụng này.</p>
              <p>PAJ Silver có quyền cập nhật, sửa đổi các điều khoản này vào bất kỳ thời điểm nào mà không cần thông báo trước. Việc tiếp tục sử dụng website sau khi có thay đổi đồng nghĩa với việc Quý khách chấp nhận các điều khoản mới.</p>
            </div>
          </section>

          <div className="border-t border-luxury-border"></div>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-bold text-charcoal uppercase tracking-widest mb-4 font-sans flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">2</span>
              Quyền Sở Hữu Trí Tuệ
            </h2>
            <div className="space-y-3 text-sm text-charcoal-light leading-relaxed font-sans pl-10">
              <p>Toàn bộ nội dung trên website PAJ Silver, bao gồm nhưng không giới hạn ở:</p>
              <ul className="space-y-2 list-none mt-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span>Thiết kế trang sức, hình ảnh sản phẩm và bộ sưu tập</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span>Logo, thương hiệu, tên gọi và nhận diện thương hiệu PAJ Silver</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span>Văn bản, mô tả sản phẩm, nội dung biên tập và tài liệu marketing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span>Giao diện, bố cục và thiết kế website</span>
                </li>
              </ul>
              <p className="mt-3">— đều là tài sản độc quyền của PAJ Silver và được bảo hộ theo Luật Sở hữu trí tuệ Việt Nam. Mọi hành vi sao chép, phân phối, sửa đổi hoặc sử dụng thương mại mà không có sự cho phép bằng văn bản của PAJ Silver đều bị nghiêm cấm và có thể bị xử lý theo quy định pháp luật.</p>
            </div>
          </section>

          <div className="border-t border-luxury-border"></div>

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-bold text-charcoal uppercase tracking-widest mb-4 font-sans flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">3</span>
              Độ Chính Xác Của Mô Tả Sản Phẩm
            </h2>
            <div className="space-y-3 text-sm text-charcoal-light leading-relaxed font-sans pl-10">
              <p>PAJ Silver nỗ lực đảm bảo tính chính xác của tất cả thông tin sản phẩm được hiển thị trên website. Tuy nhiên, Quý khách cần lưu ý:</p>
              <ul className="space-y-2 list-none mt-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span>Trọng lượng bạc có thể dao động nhẹ (±0.05g) do đặc tính của quy trình chế tác thủ công tinh xảo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span>Độ sáng và màu sắc của đá quý có thể có sự khác biệt nhỏ tùy theo điều kiện ánh sáng và màn hình hiển thị của từng thiết bị.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span>Hình ảnh sản phẩm được chụp trong điều kiện chuyên nghiệp nhằm thể hiện vẻ đẹp tốt nhất, màu sắc thực tế có thể có sự khác biệt nhỏ.</span>
                </li>
              </ul>
              <p className="mt-3">Những sai lệch nhỏ này không được coi là lỗi sản phẩm và không ảnh hưởng đến chất lượng hay giá trị của trang sức PAJ Silver.</p>
            </div>
          </section>

          <div className="border-t border-luxury-border"></div>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-bold text-charcoal uppercase tracking-widest mb-4 font-sans flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">4</span>
              Giá Cả & Bảo Mật Thanh Toán
            </h2>
            <div className="space-y-3 text-sm text-charcoal-light leading-relaxed font-sans pl-10">
              <p>Tất cả giá niêm yết trên website PAJ Silver được tính bằng Đồng Việt Nam (VNĐ) và đã bao gồm thuế VAT theo quy định hiện hành.</p>
              <ul className="space-y-2 list-none mt-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span>PAJ Silver có quyền điều chỉnh giá sản phẩm mà không cần thông báo trước. Giá áp dụng là giá tại thời điểm Quý khách hoàn tất đặt hàng.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span>Mọi giao dịch thanh toán được bảo mật bằng công nghệ mã hóa SSL và xử lý qua cổng thanh toán đạt chuẩn quốc tế.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span>PAJ Silver không chịu trách nhiệm về các khoản phí phát sinh từ ngân hàng hoặc tổ chức tài chính của Quý khách.</span>
                </li>
              </ul>
            </div>
          </section>

          <div className="border-t border-luxury-border"></div>

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-bold text-charcoal uppercase tracking-widest mb-4 font-sans flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">5</span>
              Giới Hạn Trách Nhiệm
            </h2>
            <div className="space-y-3 text-sm text-charcoal-light leading-relaxed font-sans pl-10">
              <p>Trong phạm vi tối đa được pháp luật cho phép, PAJ Silver không chịu trách nhiệm về:</p>
              <ul className="space-y-2 list-none mt-2">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span>Thiệt hại gián tiếp, ngẫu nhiên hoặc hậu quả phát sinh từ việc sử dụng hoặc không thể sử dụng website.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span>Sự gián đoạn dịch vụ do các nguyên nhân ngoài tầm kiểm soát của PAJ Silver (thiên tai, sự cố kỹ thuật, v.v.).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span>Nội dung của các website bên thứ ba được liên kết từ website PAJ Silver.</span>
                </li>
              </ul>
              <p className="mt-3">Trách nhiệm tối đa của PAJ Silver trong mọi trường hợp không vượt quá giá trị đơn hàng thực tế mà Quý khách đã thanh toán.</p>
            </div>
          </section>

          <div className="border-t border-luxury-border"></div>

          {/* Section 6 */}
          <section>
            <h2 className="text-lg font-bold text-charcoal uppercase tracking-widest mb-4 font-sans flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">6</span>
              Luật Điều Chỉnh
            </h2>
            <div className="space-y-3 text-sm text-charcoal-light leading-relaxed font-sans pl-10">
              <p>Các điều khoản sử dụng này được điều chỉnh và giải thích theo pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.</p>
              <p>Mọi tranh chấp phát sinh từ hoặc liên quan đến các điều khoản này sẽ được giải quyết trước tiên thông qua thương lượng thiện chí. Nếu không đạt được thỏa thuận, tranh chấp sẽ được đưa ra Tòa án nhân dân có thẩm quyền tại Hà Nội, Việt Nam để giải quyết.</p>
            </div>
          </section>

          {/* Contact box */}
          <div className="bg-luxury-warm border border-luxury-border rounded-sm p-6 mt-4">
            <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-2 font-sans">Liên hệ hỗ trợ</p>
            <p className="text-sm text-charcoal-light font-sans leading-relaxed">
              Nếu Quý khách có câu hỏi về các điều khoản sử dụng, vui lòng liên hệ:{' '}
              <a href="mailto:cskh@pajsilver.vn" className="text-gold hover:text-gold-dark transition-colors">cskh@pajsilver.vn</a>{' '}
              hoặc hotline <a href="tel:0965154099" className="text-gold hover:text-gold-dark transition-colors">0965.154.099</a>.
            </p>
          </div>

          {/* Back links */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/chinh-sach-bao-mat" className="text-xs text-luxury-muted hover:text-gold transition-colors font-sans underline underline-offset-2">
              Chính sách bảo mật →
            </Link>
            <Link href="/chinh-sach-doi-tra" className="text-xs text-luxury-muted hover:text-gold transition-colors font-sans underline underline-offset-2">
              Chính sách đổi trả →
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
