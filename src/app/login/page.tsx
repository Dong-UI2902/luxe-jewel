'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import AppLogo from '@/components/ui/AppLogo';
import { useLanguage } from '@/contexts/LanguageContext';

type View = 'login' | 'forgot' | 'forgot-sent';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { t } = useLanguage();

  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.push('/homepage');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/account?tab=settings`,
      });
      if (resetError) throw resetError;
      setView('forgot-sent');
    } catch (err: any) {
      setError(err?.message || 'Không thể gửi email. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const backgroundDecor = (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212,175,55,0.6) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,175,55,0.6) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-gold/20 to-transparent animate-pulse" />
      <div
        className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-gold/10 to-transparent animate-pulse"
        style={{ animationDelay: '1s' }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-4 relative overflow-hidden">
      {backgroundDecor}

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/homepage" className="inline-flex items-center gap-3 group">
            <AppLogo size={36} />
            <span className="font-display text-2xl font-semibold tracking-[0.08em] text-luxury-white group-hover:text-gold transition-colors duration-300">
              LuxeJewel
            </span>
          </Link>
          <p className="mt-3 text-luxury-muted text-sm tracking-widest uppercase">
            {view === 'login' ? t('login.welcome_back') : 'Khôi Phục Mật Khẩu'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-charcoal-light/60 backdrop-blur-md border border-gold/20 rounded-2xl p-8 shadow-[0_0_60px_rgba(212,175,55,0.08)]">
          {/* ── Login View ── */}
          {view === 'login' && (
            <>
              <h1 className="font-display text-2xl font-semibold text-luxury-white mb-1">
                {t('login.sign_in')}
              </h1>
              <p className="text-luxury-muted text-sm mb-8">{t('login.access_account')}</p>

              {error && (
                <div className="mb-6 px-4 py-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm">
                  {t('login.Invalid login credentials')}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium tracking-widest uppercase text-luxury-muted mb-2">
                    {t('login.email_address')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-charcoal border border-gold/20 rounded-lg text-luxury-white placeholder-luxury-muted/50 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium tracking-widest uppercase text-luxury-muted">
                      {t('login.password')}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setError('');
                        setView('forgot');
                      }}
                      className="text-xs text-white/70 hover:text-gold transition-colors duration-200"
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
                      className="w-full px-4 py-3 bg-charcoal border border-gold/20 rounded-lg text-luxury-white placeholder-luxury-muted/50 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-gold transition-colors duration-200 text-xs tracking-wide"
                    >
                      {showPassword ? t('login.hide') : t('login.show')}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gold text-white font-semibold text-sm tracking-widest uppercase rounded-lg hover:bg-gold/90 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2 relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    {loading ? t('login.signing_in') : t('login.sign_in')}
                  </span>
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                </button>
              </form>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gold/15" />
                <span className="text-luxury-muted text-xs tracking-widest uppercase">or</span>
                <div className="flex-1 h-px bg-gold/15" />
              </div>

              <p className="text-center text-sm text-luxury-muted">
                {t('login.new_to')}{' '}
                <Link
                  href="/register"
                  className="text-white/70 hover:text-gold/80 font-medium transition-colors duration-200"
                >
                  {t('login.create_account')}
                </Link>
              </p>
            </>
          )}

          {/* ── Forgot Password View ── */}
          {view === 'forgot' && (
            <>
              <h1 className="font-display text-2xl font-semibold text-luxury-white mb-1">
                Quên Mật Khẩu
              </h1>
              <p className="text-luxury-muted text-sm mb-8">
                Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
              </p>

              {error && (
                <div className="mb-6 px-4 py-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-5">
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
                    className="w-full px-4 py-3 bg-charcoal border border-gold/20 rounded-lg text-luxury-white placeholder-luxury-muted/50 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gold text-white font-semibold text-sm tracking-widest uppercase rounded-lg hover:bg-gold/90 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    {loading ? 'Đang gửi...' : 'Gửi Liên Kết Đặt Lại'}
                  </span>
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setView('login');
                  }}
                  className="text-sm text-luxury-muted hover:text-gold transition-colors duration-200"
                >
                  ← Quay lại đăng nhập
                </button>
              </div>
            </>
          )}

          {/* ── Forgot Sent View ── */}
          {view === 'forgot-sent' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg
                  className="w-7 h-7 text-gold"
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
              <h2 className="font-display text-xl font-semibold text-luxury-white mb-3">
                Kiểm Tra Email Của Bạn
              </h2>
              <p className="text-luxury-muted text-sm mb-2">
                Chúng tôi đã gửi liên kết đặt lại mật khẩu đến
              </p>
              <p className="text-gold text-sm font-medium mb-8">{forgotEmail}</p>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setView('login');
                }}
                className="text-sm text-luxury-muted hover:text-gold transition-colors duration-200"
              >
                ← Quay lại đăng nhập
              </button>
            </div>
          )}
        </div>

        {/* Back to shop */}
        <p className="text-center mt-6">
          <Link
            href="/homepage"
            className="text-luxury-muted text-xs tracking-widest uppercase hover:text-gold transition-colors duration-200"
          >
            {t('login.continue_shopping')}
          </Link>
        </p>
      </div>
    </div>
  );
}
