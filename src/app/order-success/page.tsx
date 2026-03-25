'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { createClient } from '@/lib/supabase/client';

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  total_amount: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  created_at: string;
  order_items: OrderItem[];
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'awaiting' | 'paid'>('awaiting');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Fetch order details
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, order_number, status, payment_method, total_amount,
          shipping_name, shipping_phone, shipping_address, shipping_city, created_at,
          order_items (id, product_name, product_image, quantity, unit_price, total_price)
        `)
        .eq('id', orderId)
        .single();

      if (!error && data) {
        setOrder(data as Order);
        if (data.status === 'paid') {
          setPaymentStatus('paid');
        }
      }
      setLoading(false);
    };

    fetchOrder();

    // Only set up realtime listener for bank transfer orders
    const channel = supabase
      .channel(`order-status-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const newStatus = (payload.new as { status: string }).status;
          if (newStatus === 'paid') {
            setPaymentStatus('paid');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-white flex items-center justify-center">
        <div className="animate-pulse text-luxury-muted text-sm">Đang tải...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-luxury-white">
        <Header />
        <main className="pt-24 pb-16 max-w-lg mx-auto px-6 text-center">
          <Icon name="ExclamationCircleIcon" size={48} className="text-luxury-muted mx-auto mb-4" />
          <h2 className="font-display text-2xl font-light text-charcoal mb-3">Không tìm thấy đơn hàng</h2>
          <Link href="/homepage" className="inline-block px-8 py-3 bg-gold text-charcoal text-sm font-semibold">
            Về trang chủ
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isBankTransfer = order.payment_method === 'bank_transfer';

  return (
    <div className="min-h-screen bg-luxury-white">
      <Header />

      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-4 shadow-lg flex items-center gap-3 animate-fade-up">
          <Icon name="CheckCircleIcon" size={20} />
          <span className="text-sm font-semibold">Thanh toán đã được xác nhận!</span>
        </div>
      )}

      <main className="pt-20 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          {/* Header */}
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <Icon name="CheckIcon" size={32} className="text-gold" />
            </div>
            <h1 className="font-display text-3xl font-light text-charcoal mb-2">
              Đặt hàng thành công!
            </h1>
            <p className="text-luxury-muted text-sm">
              Mã đơn hàng: <span className="font-semibold text-charcoal">{order.order_number}</span>
            </p>
          </div>

          {/* Payment Status Badge (Bank Transfer only) */}
          {isBankTransfer && (
            <div className="mb-6 flex justify-center">
              {paymentStatus === 'awaiting' ? (
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-50 border border-amber-300 text-amber-700 text-sm font-semibold rounded-full">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Đang chờ xác minh thanh toán
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-50 border border-green-300 text-green-700 text-sm font-semibold rounded-full">
                  <Icon name="CheckCircleIcon" size={16} />
                  Đã xác nhận thanh toán
                </span>
              )}
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-luxury-warm border border-luxury-border p-6 mb-6">
            <h3 className="font-semibold text-sm text-charcoal uppercase tracking-wide mb-5">
              Chi tiết đơn hàng
            </h3>

            <div className="space-y-4 mb-5 pb-5 border-b border-luxury-border">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex gap-4">
                  {item.product_image && (
                    <div className="relative w-14 h-18 flex-shrink-0 bg-luxury-white">
                      <AppImage
                        src={item.product_image}
                        alt={item.product_name}
                        width={56}
                        height={72}
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-charcoal">{item.product_name}</p>
                    <p className="text-xs text-luxury-muted mt-0.5">Số lượng: {item.quantity}</p>
                    <p className="text-sm font-semibold text-charcoal mt-1">
                      {Number(item.total_price).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-luxury-muted">Khách hàng</span>
                <span className="text-charcoal font-medium">{order.shipping_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-muted">Số điện thoại</span>
                <span className="text-charcoal font-medium">{order.shipping_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-muted">Địa chỉ</span>
                <span className="text-charcoal font-medium text-right max-w-[60%]">
                  {order.shipping_address}, {order.shipping_city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-muted">Phương thức thanh toán</span>
                <span className="text-charcoal font-medium">
                  {isBankTransfer ? 'Chuyển khoản Ngân hàng' : 'Thanh toán khi nhận hàng'}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-luxury-border">
                <span className="font-semibold text-charcoal">Tổng cộng</span>
                <span className="font-bold text-charcoal text-lg">
                  {Number(order.total_amount).toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>

          {/* Zalo Confirmation Button (Bank Transfer only) */}
          {isBankTransfer && (
            <div className="mb-6 p-5 bg-blue-50 border border-blue-200 rounded-sm">
              <div className="flex items-start gap-3 mb-4">
                <Icon name="InformationCircleIcon" size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-800 mb-1">Xác nhận thanh toán qua Zalo</p>
                  <p className="text-xs text-blue-700">
                    Sau khi chuyển khoản, vui lòng chụp màn hình giao dịch và gửi vào Zalo để được xác nhận đơn hàng nhanh nhất.
                  </p>
                </div>
              </div>
              <a
                href={`https://zalo.me/${process.env.NEXT_PUBLIC_ZALO_PHONE || '0000000000'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
              >
                <Icon name="ChatBubbleLeftRightIcon" size={18} />
                Xác nhận qua Zalo
              </a>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/product-listing"
              className="flex-1 py-3 bg-gold text-charcoal text-sm font-semibold tracking-wide hover:bg-gold-light transition-colors text-center"
            >
              Tiếp tục mua sắm
            </Link>
            <Link
              href="/homepage"
              className="flex-1 py-3 border border-luxury-border text-charcoal text-sm font-medium hover:border-gold hover:text-gold transition-colors text-center"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-luxury-white flex items-center justify-center">
        <div className="text-luxury-muted text-sm">Đang tải...</div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
