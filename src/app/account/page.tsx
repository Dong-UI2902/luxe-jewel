'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

import Icon from '@/components/ui/AppIcon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  shipping_name: string;
  payment_method?: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  processing: { label: 'Đang xử lý', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  shipped: { label: 'Đang giao', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800 border-red-200' },
  refunded: { label: 'Đã hoàn tiền', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  paid: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800 border-green-200' },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ─── Login Form ────────────────────────────────────────────────────────────────
function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { signIn } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotView, setForgotView] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Email hoặc mật khẩu không đúng.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/account?tab=settings`,
      });
      if (resetError) throw resetError;
      setForgotSent(true);
    } catch (err: any) {
      setError(err?.message || 'Không thể gửi email. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (forgotSent) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-gold"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>
        <h3 className="font-display text-lg font-semibold text-charcoal mb-2">Kiểm Tra Email</h3>
        <p className="text-luxury-muted text-sm mb-1">Liên kết đặt lại đã gửi đến</p>
        <p className="text-gold-dark text-sm font-medium mb-6">{forgotEmail}</p>
        <button
          type="button"
          onClick={() => {
            setForgotView(false);
            setForgotSent(false);
            setError('');
          }}
          className="text-sm text-luxury-muted hover:text-gold-dark transition-colors"
        >
          ← Quay lại đăng nhập
        </button>
      </div>
    );
  }

  if (forgotView) {
    return (
      <div className="space-y-5">
        <div>
          <h3 className="font-display text-lg font-semibold text-charcoal mb-1">Quên Mật Khẩu</h3>
          <p className="text-luxury-muted text-sm mb-5">
            Nhập email để nhận liên kết đặt lại mật khẩu.
          </p>
        </div>
        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium tracking-widest uppercase text-luxury-muted mb-2">
              Địa Chỉ Email
            </label>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-luxury-warm border border-luxury-border rounded-lg text-charcoal placeholder-luxury-muted/60 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gold text-charcoal font-semibold text-sm tracking-widest uppercase rounded-lg hover:bg-gold/90 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            <span className="relative z-10">{loading ? 'Đang gửi...' : 'Gửi Liên Kết'}</span>
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
          </button>
        </form>
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setForgotView(false);
              setError('');
            }}
            className="text-sm text-luxury-muted hover:text-gold-dark transition-colors"
          >
            ← Quay lại đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-medium tracking-widest uppercase text-luxury-muted mb-2">
          Địa Chỉ Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
          className="w-full px-4 py-3 bg-luxury-warm border border-luxury-border rounded-lg text-charcoal placeholder-luxury-muted/60 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium tracking-widest uppercase text-luxury-muted">
            Mật Khẩu
          </label>
          <button
            type="button"
            onClick={() => {
              setForgotEmail(email);
              setForgotView(true);
              setError('');
            }}
            className="text-xs text-gold-dark hover:text-gold-dark/80 transition-colors"
          >
            Quên mật khẩu?
          </button>
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-luxury-warm border border-luxury-border rounded-lg text-charcoal placeholder-luxury-muted/60 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-muted hover:text-gold transition-colors text-xs tracking-wide"
          >
            {showPassword ? 'Ẩn' : 'Hiện'}
          </button>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-gold text-charcoal font-semibold text-sm tracking-widest uppercase rounded-lg hover:bg-gold/90 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
      >
        <span className="relative z-10">{loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}</span>
        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
      </button>
      <p className="text-center text-sm text-luxury-muted">
        Chưa có tài khoản?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-gold-dark hover:text-gold-dark/80 font-medium transition-colors"
        >
          Tạo tài khoản
        </button>
      </p>
    </form>
  );
}

// ─── Register Form ─────────────────────────────────────────────────────────────
function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { signUp } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, { fullName });
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-medium tracking-widest uppercase text-luxury-muted mb-2">
          Họ Và Tên
        </label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="Tên đầy đủ của bạn"
          className="w-full px-4 py-3 bg-luxury-warm border border-luxury-border rounded-lg text-charcoal placeholder-luxury-muted/60 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
        />
      </div>
      <div>
        <label className="block text-xs font-medium tracking-widest uppercase text-luxury-muted mb-2">
          Địa Chỉ Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
          className="w-full px-4 py-3 bg-luxury-warm border border-luxury-border rounded-lg text-charcoal placeholder-luxury-muted/60 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
        />
      </div>
      <div>
        <label className="block text-xs font-medium tracking-widest uppercase text-luxury-muted mb-2">
          Mật Khẩu
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Tối thiểu 6 ký tự"
            className="w-full px-4 py-3 bg-luxury-warm border border-luxury-border rounded-lg text-charcoal placeholder-luxury-muted/60 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-muted hover:text-gold transition-colors text-xs tracking-wide"
          >
            {showPassword ? 'Ẩn' : 'Hiện'}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium tracking-widest uppercase text-luxury-muted mb-2">
          Xác Nhận Mật Khẩu
        </label>
        <input
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Nhập lại mật khẩu"
          className="w-full px-4 py-3 bg-luxury-warm border border-luxury-border rounded-lg text-charcoal placeholder-luxury-muted/60 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-gold text-charcoal font-semibold text-sm tracking-widest uppercase rounded-lg hover:bg-gold/90 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
      >
        <span className="relative z-10">{loading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản'}</span>
        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
      </button>
      <p className="text-center text-sm text-luxury-muted">
        Đã có tài khoản?{' '}
        <button
          type="button"
          onClick={onSwitch}
          className="text-gold-dark hover:text-gold-dark/80 font-medium transition-colors"
        >
          Đăng nhập
        </button>
      </p>
    </form>
  );
}

// ─── Order History ─────────────────────────────────────────────────────────────
function OrderHistory({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, status, total_amount, created_at, shipping_name, payment_method')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data as Order[]);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-luxury-warm rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="ShoppingBagIcon" size={28} className="text-luxury-muted" />
        </div>
        <h3 className="font-display text-lg font-semibold text-charcoal mb-2">
          Chưa có đơn hàng nào
        </h3>
        <p className="text-luxury-muted text-sm mb-6">
          Khám phá bộ sưu tập của chúng tôi và đặt hàng đầu tiên.
        </p>
        <Link
          href="/product-listing"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gold text-charcoal text-sm font-semibold tracking-wide rounded-lg hover:bg-gold/90 transition-colors"
        >
          Mua Sắm Ngay
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-charcoal mb-6">Lịch Sử Đơn Hàng</h2>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-luxury-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-luxury-warm border-b border-luxury-border">
              <th className="text-left px-5 py-3.5 text-xs font-semibold tracking-widest uppercase text-luxury-muted">
                Mã Đơn
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold tracking-widest uppercase text-luxury-muted">
                Ngày Đặt
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold tracking-widest uppercase text-luxury-muted">
                Trạng Thái
              </th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold tracking-widest uppercase text-luxury-muted">
                Tổng Tiền
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-luxury-border bg-white">
            {orders.map((order) => {
              const statusInfo = STATUS_LABELS[order.status] || {
                label: order.status,
                color: 'bg-gray-100 text-gray-700 border-gray-200',
              };
              return (
                <tr key={order.id} className="hover:bg-luxury-warm/50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono font-semibold text-charcoal text-xs tracking-wider">
                      #{order.order_number}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-charcoal-light">{formatDate(order.created_at)}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-charcoal">
                    {formatCurrency(order.total_amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {orders.map((order) => {
          const statusInfo = STATUS_LABELS[order.status] || {
            label: order.status,
            color: 'bg-gray-100 text-gray-700 border-gray-200',
          };
          return (
            <div key={order.id} className="bg-white border border-luxury-border rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <span className="font-mono font-semibold text-charcoal text-xs tracking-wider">
                  #{order.order_number}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                >
                  {statusInfo.label}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-luxury-muted">{formatDate(order.created_at)}</span>
                <span className="font-semibold text-charcoal">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Account Settings ──────────────────────────────────────────────────────────
function AccountSettings({ userEmail }: { userEmail: string }) {
  const supabase = createClient();

  // Email change state
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailError, setEmailError] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');
    if (!newEmail || newEmail === userEmail) {
      setEmailError('Vui lòng nhập địa chỉ email mới khác với email hiện tại.');
      return;
    }
    setEmailLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      setEmailSuccess('Email xác nhận đã được gửi đến địa chỉ mới. Vui lòng kiểm tra hộp thư.');
      setNewEmail('');
    } catch (err: any) {
      setEmailError(err?.message || 'Không thể cập nhật email. Vui lòng thử lại.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setPasswordLoading(true);
    try {
      // Re-authenticate first to verify current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });
      if (signInError) {
        setPasswordError('Mật khẩu hiện tại không đúng.');
        setPasswordLoading(false);
        return;
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordSuccess('Mật khẩu đã được cập nhật thành công.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPasswordError(err?.message || 'Không thể cập nhật mật khẩu. Vui lòng thử lại.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-semibold text-charcoal mb-6">Cài Đặt Tài Khoản</h2>

      {/* Change Email */}
      <div className="border border-luxury-border rounded-xl p-6">
        <h3 className="font-semibold text-charcoal mb-1 flex items-center gap-2">
          <Icon name="EnvelopeIcon" size={18} className="text-gold" />
          Thay Đổi Email
        </h3>
        <p className="text-luxury-muted text-sm mb-5">
          Email hiện tại: <span className="text-charcoal font-medium">{userEmail}</span>
        </p>

        {emailSuccess && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {emailSuccess}
          </div>
        )}
        {emailError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {emailError}
          </div>
        )}

        <form onSubmit={handleEmailChange} className="space-y-4">
          <div>
            <label className="block text-xs font-medium tracking-widest uppercase text-luxury-muted mb-2">
              Email Mới
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              placeholder="newemail@example.com"
              className="w-full px-4 py-3 bg-luxury-warm border border-luxury-border rounded-lg text-charcoal placeholder-luxury-muted/60 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
            />
          </div>
          <button
            type="submit"
            disabled={emailLoading}
            className="px-6 py-2.5 bg-gold text-white font-semibold text-sm tracking-wide rounded-lg hover:bg-gold/90 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {emailLoading ? 'Đang cập nhật...' : 'Cập Nhật Email'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="border border-luxury-border rounded-xl p-6">
        <h3 className="font-semibold text-charcoal mb-1 flex items-center gap-2">
          <Icon name="LockClosedIcon" size={18} className="text-gold" />
          Đổi Mật Khẩu
        </h3>
        <p className="text-luxury-muted text-sm mb-5">
          Cập nhật mật khẩu để bảo mật tài khoản của bạn.
        </p>

        {passwordSuccess && (
          <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {passwordSuccess}
          </div>
        )}
        {passwordError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-medium tracking-widest uppercase text-luxury-muted mb-2">
              Mật Khẩu Hiện Tại
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-luxury-warm border border-luxury-border rounded-lg text-charcoal placeholder-luxury-muted/60 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium tracking-widest uppercase text-luxury-muted mb-2">
              Mật Khẩu Mới
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Tối thiểu 6 ký tự"
                className="w-full px-4 py-3 bg-luxury-warm border border-luxury-border rounded-lg text-charcoal placeholder-luxury-muted/60 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-muted hover:text-gold transition-colors text-xs tracking-wide"
              >
                {showNewPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium tracking-widest uppercase text-luxury-muted mb-2">
              Xác Nhận Mật Khẩu Mới
            </label>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              placeholder="Nhập lại mật khẩu mới"
              className="w-full px-4 py-3 bg-luxury-warm border border-luxury-border rounded-lg text-charcoal placeholder-luxury-muted/60 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="px-6 py-2.5 bg-gold text-white font-semibold text-sm tracking-wide rounded-lg hover:bg-gold/90 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {passwordLoading ? 'Đang cập nhật...' : 'Đổi Mật Khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Account Page ─────────────────────────────────────────────────────────
function AccountPageInner() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams?.get('tab') === 'settings' ? 'settings' : 'orders';
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loggedInTab, setLoggedInTab] = useState<'orders' | 'settings'>(
    initialTab as 'orders' | 'settings'
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      router.refresh();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-warm">
      <Header />
      <main className="pt-20 md:pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          {/* Page Header */}
          <div className="text-center mb-10 pt-8">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gold mb-2">
              LuxeJewel
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-charcoal">
              {user ? 'Tài Khoản Của Tôi' : 'Tài Khoản'}
            </h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : user ? (
            /* ── Logged-in view ── */
            <div className="space-y-8">
              {/* Profile Card */}
              <div className="bg-white border border-luxury-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center">
                      <Icon name="UserIcon" size={22} className="text-gold" />
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal">
                        {user.user_metadata?.full_name || 'Khách hàng'}
                      </p>
                      <p className="text-sm text-luxury-muted">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-light border border-luxury-border rounded-lg hover:border-gold hover:text-gold transition-colors duration-200"
                  >
                    <Icon name="ArrowRightOnRectangleIcon" size={16} />
                    Đăng Xuất
                  </button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex bg-white border border-luxury-border rounded-xl p-1 shadow-sm">
                <button
                  onClick={() => setLoggedInTab('orders')}
                  className={`flex-1 py-2.5 text-sm font-semibold tracking-wide rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                    loggedInTab === 'orders'
                      ? 'bg-gold text-white shadow-sm'
                      : 'text-luxury-muted hover:text-charcoal'
                  }`}
                >
                  <Icon name="ShoppingBagIcon" size={16} />
                  Đơn Hàng
                </button>
                <button
                  onClick={() => setLoggedInTab('settings')}
                  className={`flex-1 py-2.5 text-sm font-semibold tracking-wide rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                    loggedInTab === 'settings'
                      ? 'bg-gold text-white shadow-sm'
                      : 'text-luxury-muted hover:text-charcoal'
                  }`}
                >
                  <Icon name="Cog6ToothIcon" size={16} />
                  Cài Đặt
                </button>
              </div>

              {/* Tab Content */}
              <div className="bg-white border border-luxury-border rounded-2xl p-6 shadow-sm">
                {loggedInTab === 'orders' ? (
                  <OrderHistory userId={user.id} />
                ) : (
                  <AccountSettings userEmail={user.email || ''} />
                )}
              </div>
            </div>
          ) : (
            /* ── Auth view ── */
            <div className="max-w-md mx-auto">
              {/* Tabs */}
              <div className="flex bg-white border border-luxury-border rounded-xl p-1 mb-6 shadow-sm">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-2.5 text-sm font-semibold tracking-wide rounded-lg transition-all duration-200 ${
                    activeTab === 'login'
                      ? 'bg-gold text-charcoal shadow-sm'
                      : 'text-luxury-muted hover:text-charcoal'
                  }`}
                >
                  Đăng Nhập
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 py-2.5 text-sm font-semibold tracking-wide rounded-lg transition-all duration-200 ${
                    activeTab === 'register'
                      ? 'bg-gold text-charcoal shadow-sm'
                      : 'text-luxury-muted hover:text-charcoal'
                  }`}
                >
                  Tạo Tài Khoản
                </button>
              </div>

              {/* Form Card */}
              <div className="bg-white border border-luxury-border rounded-2xl p-8 shadow-sm">
                {activeTab === 'login' ? (
                  <>
                    <h2 className="font-display text-xl font-semibold text-charcoal mb-1">
                      Đăng Nhập
                    </h2>
                    <p className="text-luxury-muted text-sm mb-6">
                      Truy cập tài khoản và lịch sử đơn hàng
                    </p>
                    <LoginForm onSwitch={() => setActiveTab('register')} />
                  </>
                ) : (
                  <>
                    <h2 className="font-display text-xl font-semibold text-charcoal mb-1">
                      Tạo Tài Khoản
                    </h2>
                    <p className="text-luxury-muted text-sm mb-6">
                      Khám phá sản phẩm độc quyền và theo dõi đơn hàng
                    </p>
                    <RegisterForm onSwitch={() => setActiveTab('login')} />
                  </>
                )}
              </div>

              <p className="text-center mt-6">
                <Link
                  href="/homepage"
                  className="text-luxury-muted text-xs tracking-widest uppercase hover:text-gold transition-colors duration-200"
                >
                  ← Tiếp Tục Mua Sắm
                </Link>
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-luxury-warm flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AccountPageInner />
    </Suspense>
  );
}
