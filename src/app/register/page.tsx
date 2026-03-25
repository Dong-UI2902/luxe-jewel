'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLogo from '@/components/ui/AppLogo';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { t } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await signUp(email, password, { fullName });
      router.push('/homepage');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: `linear-gradient(rgba(212,175,55,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.6) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />
        <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-gold/20 to-transparent animate-pulse" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-gold/10 to-transparent animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link href="/homepage" className="inline-flex items-center gap-3 group">
            <AppLogo size={36} />
            <span className="font-display text-2xl font-semibold tracking-[0.08em] text-luxury-white group-hover:text-gold transition-colors duration-300">LuxeJewel</span>
          </Link>
          <p className="mt-3 text-luxury-muted text-sm tracking-widest uppercase">{t('register.join_collection')}</p>
        </div>

        <div className="bg-charcoal-light/60 backdrop-blur-md border border-gold/20 rounded-2xl p-8 shadow-[0_0_60px_rgba(212,175,55,0.08)]">
          <h1 className="font-display text-2xl font-semibold text-luxury-white mb-1">{t('register.create_account')}</h1>
          <p className="text-luxury-muted text-sm mb-8">{t('register.discover_exclusive')}</p>

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium tracking-widest uppercase text-luxury-muted mb-2">{t('register.full_name')}</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Your full name"
                className="w-full px-4 py-3 bg-charcoal border border-gold/20 rounded-lg text-luxury-white placeholder-luxury-muted/50 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300" />
            </div>
            <div>
              <label className="block text-xs font-medium tracking-widest uppercase text-luxury-muted mb-2">{t('register.email_address')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com"
                className="w-full px-4 py-3 bg-charcoal border border-gold/20 rounded-lg text-luxury-white placeholder-luxury-muted/50 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300" />
            </div>
            <div>
              <label className="block text-xs font-medium tracking-widest uppercase text-luxury-muted mb-2">{t('register.password')}</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder={t('register.min_chars')}
                  className="w-full px-4 py-3 bg-charcoal border border-gold/20 rounded-lg text-luxury-white placeholder-luxury-muted/50 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300 pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-luxury-muted hover:text-gold transition-colors duration-200 text-xs tracking-wide">
                  {showPassword ? t('register.hide') : t('register.show')}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium tracking-widest uppercase text-luxury-muted mb-2">{t('register.confirm_password')}</label>
              <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder={t('register.repeat_password')}
                className="w-full px-4 py-3 bg-charcoal border border-gold/20 rounded-lg text-luxury-white placeholder-luxury-muted/50 text-sm focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/20 transition-all duration-300" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-gold text-charcoal font-semibold text-sm tracking-widest uppercase rounded-lg hover:bg-gold/90 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2 relative overflow-hidden group">
              <span className="relative z-10">{loading ? t('register.creating') : t('register.create_account')}</span>
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gold/15" />
            <span className="text-luxury-muted text-xs tracking-widest uppercase">or</span>
            <div className="flex-1 h-px bg-gold/15" />
          </div>

          <p className="text-center text-sm text-luxury-muted">
            {t('register.already_account')}{' '}
            <Link href="/login" className="text-gold hover:text-gold/80 font-medium transition-colors duration-200">{t('register.sign_in')}</Link>
          </p>
        </div>

        <p className="text-center mt-6">
          <Link href="/homepage" className="text-luxury-muted text-xs tracking-widest uppercase hover:text-gold transition-colors duration-200">
            {t('register.continue_shopping')}
          </Link>
        </p>
      </div>
    </div>
  );
}
