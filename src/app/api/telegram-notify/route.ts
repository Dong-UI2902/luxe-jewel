import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payment_method, customer_name, phone, total_amount, order_id } = body;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn('Telegram credentials not configured');
      return NextResponse.json({ ok: false, error: 'Telegram not configured' }, { status: 200 });
    }

    const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/admin-dashboard`;

    const message = `🛍️ ĐƠN HÀNG MỚI!\n\nPhương thức: ${payment_method === 'bank_transfer' ? 'Chuyển khoản Ngân hàng' : 'Thanh toán khi nhận hàng (COD)'}\nKhách hàng: ${customer_name}\nSố điện thoại: ${phone}\nTổng tiền: ${Number(total_amount).toLocaleString('vi-VN')}đ\nMã đơn: ${order_id}\n\n🔗 Xem đơn hàng: ${adminUrl}`;

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      }
    );

    const data = await telegramRes.json();

    if (!data.ok) {
      console.error('Telegram API error:', JSON.stringify(data));
      return NextResponse.json({ ok: false, telegram_error: data }, { status: 200 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Telegram notify error:', err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
