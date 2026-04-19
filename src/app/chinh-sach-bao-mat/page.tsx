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
          <p className="text-sm text-luxury-muted font-sans">
            Cập nhật lần cuối: Tháng 4, 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-[860px] mx-auto px-4 sm:px-6 py-12 md:py-16 w-full">
        <div className="prose-policy space-y-10">

          {/* Intro */}
          <p className="text-base text-charcoal-light leading-relaxed font-sans border-l-2 border-gold pl-5 italic">
            Tại PAJ Silver, chúng tôi trân trọng sự tin tưởng mà Quý khách dành cho thương hiệu. Chính sách bảo mật này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của Quý khách khi sử dụng dịch vụ của PAJ Silver.
          </p>

          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-charcoal uppercase tracking-widest mb-4 font-sans flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">1</span>
              Thu Thập Thông Tin
            </h2>
            <div className="space-y-3 text-sm text-charcoal-light leading-relaxed font-sans pl-10">
              <p>Chúng tôi thu thập các thông tin cần thiết nhằm mang đến trải nghiệm mua sắm hoàn hảo nhất cho Quý khách, bao gồm:</p>
              <ul className="space-y-2 list-none">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Thông tin cá nhân:</strong> Họ và tên, địa chỉ email, số điện thoại, địa chỉ giao hàng khi Quý khách đặt hàng hoặc tạo tài khoản.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Thông tin thanh toán:</strong> Dữ liệu thẻ tín dụng/ghi nợ hoặc thông tin ví điện tử được xử lý qua cổng thanh toán bảo mật. PAJ Silver không lưu trữ trực tiếp thông tin thẻ của Quý khách.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Dữ liệu duyệt web:</strong> Địa chỉ IP, loại trình duyệt, trang đã xem và thời gian truy cập nhằm cải thiện trải nghiệm người dùng.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Thông tin đăng ký nhận tin:</strong> Địa chỉ email khi Quý khách đăng ký nhận bản tin hoặc ưu đãi từ PAJ Silver.</span>
                </li>
              </ul>
            </div>
          </section>

          <div className="border-t border-luxury-border"></div>

          {/* Section 2 */}
          <section>
            <h2 className="text-lg font-bold text-charcoal uppercase tracking-widest mb-4 font-sans flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">2</span>
              Mục Đích Sử Dụng Thông Tin
            </h2>
            <div className="space-y-3 text-sm text-charcoal-light leading-relaxed font-sans pl-10">
              <p>Thông tin Quý khách cung cấp được sử dụng cho các mục đích sau:</p>
              <ul className="space-y-2 list-none">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Xử lý đơn hàng:</strong> Xác nhận, đóng gói và giao hàng đến địa chỉ Quý khách chỉ định một cách an toàn và đúng hạn.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Vận chuyển:</strong> Chia sẻ thông tin cần thiết với đơn vị vận chuyển để đảm bảo giao hàng thành công.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Chăm sóc khách hàng:</strong> Liên hệ hỗ trợ, giải quyết khiếu nại và cập nhật tình trạng đơn hàng.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Bản tin & Ưu đãi:</strong> Gửi thông tin về bộ sưu tập mới, chương trình khuyến mãi và sự kiện đặc biệt — chỉ khi Quý khách đã đăng ký nhận tin. Quý khách có thể hủy đăng ký bất kỳ lúc nào.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Cải thiện dịch vụ:</strong> Phân tích hành vi duyệt web để nâng cao trải nghiệm mua sắm và cá nhân hóa nội dung.</span>
                </li>
              </ul>
            </div>
          </section>

          <div className="border-t border-luxury-border"></div>

          {/* Section 3 */}
          <section>
            <h2 className="text-lg font-bold text-charcoal uppercase tracking-widest mb-4 font-sans flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">3</span>
              Biện Pháp Bảo Vệ Dữ Liệu
            </h2>
            <div className="space-y-3 text-sm text-charcoal-light leading-relaxed font-sans pl-10">
              <p>PAJ Silver áp dụng các tiêu chuẩn bảo mật cao nhất để bảo vệ thông tin của Quý khách:</p>
              <ul className="space-y-2 list-none">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Mã hóa SSL:</strong> Toàn bộ dữ liệu truyền tải giữa trình duyệt và máy chủ của chúng tôi được mã hóa bằng giao thức SSL/TLS 256-bit.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Thanh toán bảo mật:</strong> Mọi giao dịch thanh toán được xử lý qua cổng thanh toán đạt chuẩn PCI-DSS. PAJ Silver không lưu trữ thông tin thẻ thanh toán trên hệ thống của mình.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Kiểm soát truy cập:</strong> Chỉ nhân viên được ủy quyền mới có quyền truy cập vào dữ liệu cá nhân của Quý khách, và chỉ trong phạm vi cần thiết để thực hiện công việc.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Lưu trữ an toàn:</strong> Dữ liệu được lưu trữ trên máy chủ bảo mật với các lớp tường lửa và hệ thống phát hiện xâm nhập.</span>
                </li>
              </ul>
            </div>
          </section>

          <div className="border-t border-luxury-border"></div>

          {/* Section 4 */}
          <section>
            <h2 className="text-lg font-bold text-charcoal uppercase tracking-widest mb-4 font-sans flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">4</span>
              Chia Sẻ Với Bên Thứ Ba
            </h2>
            <div className="space-y-3 text-sm text-charcoal-light leading-relaxed font-sans pl-10">
              <p>PAJ Silver cam kết không bán, trao đổi hay chuyển nhượng thông tin cá nhân của Quý khách cho bên thứ ba vì mục đích thương mại. Tuy nhiên, chúng tôi có thể chia sẻ thông tin với:</p>
              <ul className="space-y-2 list-none">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Đơn vị vận chuyển:</strong> Tên, địa chỉ và số điện thoại được cung cấp cho đối tác giao hàng (như GHN, GHTK, ViettelPost) để thực hiện giao hàng.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Cổng thanh toán:</strong> Thông tin thanh toán được xử lý bởi các đối tác cổng thanh toán uy tín (như VNPay, MoMo, Stripe) theo tiêu chuẩn bảo mật quốc tế.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Yêu cầu pháp lý:</strong> Trong trường hợp được yêu cầu bởi cơ quan nhà nước có thẩm quyền theo quy định pháp luật Việt Nam.</span>
                </li>
              </ul>
              <p className="mt-2">Tất cả các đối tác đều cam kết bảo mật thông tin và chỉ sử dụng dữ liệu cho mục đích được chỉ định.</p>
            </div>
          </section>

          <div className="border-t border-luxury-border"></div>

          {/* Section 5 */}
          <section>
            <h2 className="text-lg font-bold text-charcoal uppercase tracking-widest mb-4 font-sans flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">5</span>
              Quyền Của Quý Khách
            </h2>
            <div className="space-y-3 text-sm text-charcoal-light leading-relaxed font-sans pl-10">
              <p>Quý khách có đầy đủ các quyền sau đối với dữ liệu cá nhân của mình:</p>
              <ul className="space-y-2 list-none">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Quyền truy cập:</strong> Yêu cầu xem toàn bộ thông tin cá nhân mà PAJ Silver đang lưu trữ về Quý khách.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Quyền chỉnh sửa:</strong> Cập nhật hoặc sửa đổi thông tin không chính xác thông qua trang tài khoản hoặc liên hệ trực tiếp với chúng tôi.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Quyền xóa:</strong> Yêu cầu xóa tài khoản và dữ liệu cá nhân, ngoại trừ các thông tin cần thiết theo quy định pháp luật.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold mt-2 flex-shrink-0"></span>
                  <span><strong className="text-charcoal">Quyền từ chối tiếp thị:</strong> Hủy đăng ký nhận bản tin bất kỳ lúc nào qua liên kết trong email hoặc liên hệ trực tiếp với chúng tôi.</span>
                </li>
              </ul>
              <p className="mt-3">Để thực hiện các quyền trên, vui lòng liên hệ: <a href="mailto:cskh@pajsilver.vn" className="text-gold hover:text-gold-dark transition-colors font-medium">cskh@pajsilver.vn</a> hoặc gọi hotline <a href="tel:0965154099" className="text-gold hover:text-gold-dark transition-colors font-medium">0965.154.099</a>.</p>
            </div>
          </section>

          {/* Contact box */}
          <div className="bg-luxury-warm border border-luxury-border rounded-sm p-6 mt-4">
            <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-2 font-sans">Liên hệ về quyền riêng tư</p>
            <p className="text-sm text-charcoal-light font-sans leading-relaxed">
              Nếu Quý khách có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ với chúng tôi qua email{' '}
              <a href="mailto:cskh@pajsilver.vn" className="text-gold hover:text-gold-dark transition-colors">cskh@pajsilver.vn</a>{' '}
              hoặc hotline <a href="tel:0965154099" className="text-gold hover:text-gold-dark transition-colors">0965.154.099</a>.
            </p>
          </div>

          {/* Back links */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/dieu-khoan-su-dung" className="text-xs text-luxury-muted hover:text-gold transition-colors font-sans underline underline-offset-2">
              Điều khoản sử dụng →
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
