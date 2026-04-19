'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';

interface HeaderProps {
  cartCount?: number;
  onCartOpen?: () => void;
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const { user, signOut, loading, isAdmin } = useAuth();
  const { t } = useLanguage();
  const { cartCount, openCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setAccountMenuOpen(false);
      setMobileMenuOpen(false);
      router.push('/homepage');
      router.refresh();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/product-listing?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e as any);
    }
  };

  const navLinks = [
    { label: t('nav.rings'), href: '/product-listing?category=rings' },
    { label: t('nav.necklaces'), href: '/product-listing?category=necklaces' },
    { label: t('nav.bracelets'), href: '/product-listing?category=bracelets' },
    { label: t('nav.earrings'), href: '/product-listing?category=earrings' },
    { label: t('nav.gift_boxes'), href: '/product-listing?category=gift-boxes' },
  ];

  const collectionsSubMenu = [
    { label: 'Tất cả Bộ Sưu Tập', href: '/product-listing' },
    { label: 'Trang sức Nam', href: '/product-listing?gender=Nam' },
    { label: 'Trang sức Nữ', href: '/product-listing?gender=N%E1%BB%AF' },
    { label: 'Trang sức Unisex', href: '/product-listing?gender=Unisex' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || !transparent
            ? 'bg-white backdrop-blur-md border-b border-luxury-border shadow-none'
            : 'bg-white backdrop-blur-sm border-b border-luxury-border'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
            {/* Logo */}
            <Link
              href="/homepage"
              className="flex items-center gap-2 group min-h-[44px]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {/* <AppLogo size={40} /> */}
              <span className="tracking-[0.08em] duration-300 w-40">
                <img src="/assets/images/app_logo_header2.png" />
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {/* Bộ Sưu Tập dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setCollectionsOpen(true)}
                onMouseLeave={() => setCollectionsOpen(false)}
              >
                <Link
                  href="/product-listing"
                  className="text-sm font-medium tracking-wide text-charcoal hover:text-gold transition-colors duration-300 gold-underline flex items-center gap-1 font-sans"
                >
                  {t('nav.collections')}
                  <svg
                    className="w-3 h-3 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
                {collectionsOpen && (
                  <div className="absolute left-0 top-full w-52 pt-1 z-50">
                    <div className="bg-white border border-luxury-border rounded-sm shadow-product py-1 animate-fade-up">
                      {collectionsSubMenu.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block px-4 py-2.5 text-sm text-charcoal hover:text-gold hover:bg-luxury-warm transition-colors font-sans"
                          onClick={() => setCollectionsOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium tracking-wide text-charcoal hover:text-gold transition-colors duration-300 gold-underline font-sans"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-charcoal hover:text-gold transition-colors duration-300"
                aria-label="Search"
              >
                <Icon name="MagnifyingGlassIcon" size={20} />
              </button>

              {/* Account — auth-aware, desktop only */}
              {!loading && (
                <div className="relative hidden md:block">
                  {user ? (
                    <>
                      <button
                        onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                        className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-charcoal hover:text-gold transition-colors duration-300"
                        aria-label="Account menu"
                      >
                        <Icon name="UserIcon" size={20} />
                      </button>
                      {accountMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-luxury-border rounded-sm shadow-product py-1 z-50 animate-fade-up">
                          <div className="px-4 py-2 border-b border-luxury-border">
                            <p className="text-xs text-luxury-muted truncate font-sans">
                              {user.email}
                            </p>
                          </div>
                          <Link
                            href="/account"
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal hover:text-gold hover:bg-luxury-warm transition-colors font-sans"
                            onClick={() => setAccountMenuOpen(false)}
                          >
                            <Icon name="UserIcon" size={16} />
                            {t('nav.my_account')}
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin-dashboard"
                              className="flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal hover:text-gold hover:bg-luxury-warm transition-colors font-sans"
                              onClick={() => setAccountMenuOpen(false)}
                            >
                              <Icon name="Squares2X2Icon" size={16} />
                              {t('nav.dashboard')}
                            </Link>
                          )}
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal hover:text-gold hover:bg-luxury-warm transition-colors font-sans"
                          >
                            <Icon name="ArrowRightOnRectangleIcon" size={16} />
                            {t('nav.sign_out')}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-charcoal hover:text-gold transition-colors duration-300"
                      aria-label="Sign in"
                    >
                      <Icon name="UserIcon" size={20} />
                    </Link>
                  )}
                </div>
              )}

              {/* Cart */}
              <button
                onClick={openCart}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-charcoal hover:text-gold transition-colors duration-300 relative"
                aria-label="Shopping cart"
              >
                <Icon name="ShoppingBagIcon" size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-gold-button text-white text-[10px] font-bold rounded-full flex items-center justify-center font-sans">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-charcoal hover:text-gold transition-colors duration-300 md:hidden"
                aria-label="Menu"
                aria-expanded={mobileMenuOpen}
              >
                <Icon name={mobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={22} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="pb-3 border-t border-luxury-border animate-fade-up">
              <form onSubmit={handleSearchSubmit} className="relative mt-3">
                <Icon
                  name="MagnifyingGlassIcon"
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-muted"
                />
                <input
                  type="text"
                  placeholder={t('nav.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  autoFocus
                  className="w-full pl-9 pr-4 py-3 bg-luxury-warm border border-luxury-border text-sm text-charcoal placeholder:text-luxury-muted focus:outline-none focus:border-gold transition-colors font-sans"
                />
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-charcoal/40 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-[85vw] max-w-[320px] bg-white z-50 flex flex-col shadow-2xl transition-transform duration-400 md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-luxury-border h-14 sm:h-16">
          <Link
            href="/homepage"
            className="flex items-center gap-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            <AppLogo size={22} />
            <span className="font-display text-base font-semibold tracking-[0.08em] text-charcoal">
              LuxeJewel
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-charcoal hover:text-gold transition-colors"
            aria-label="Close menu"
          >
            <Icon name="XMarkIcon" size={22} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          {/* Collections section */}
          <div className="px-5 py-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-luxury-muted font-semibold mb-2 font-sans">
              {t('nav.collections')}
            </p>
            {collectionsSubMenu.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 py-3 text-sm font-medium text-charcoal hover:text-gold transition-colors border-b border-luxury-border/50 font-sans"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold/50 flex-shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Category links */}
          <div className="px-5 py-3 mt-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-luxury-muted font-semibold mb-2 font-sans">
              Danh mục
            </p>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="flex items-center gap-3 py-3 text-sm font-medium text-charcoal hover:text-gold transition-colors border-b border-luxury-border/50 font-sans"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold/30 flex-shrink-0" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Account section */}
          {!loading && (
            <div className="px-5 py-3 mt-2 border-t border-luxury-border">
              {user ? (
                <>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-luxury-muted font-semibold mb-2 font-sans">
                    Tài khoản
                  </p>
                  <p className="text-xs text-luxury-muted mb-3 truncate font-sans">{user.email}</p>
                  <Link
                    href="/account"
                    className="flex items-center gap-3 py-3 text-sm font-medium text-charcoal hover:text-gold transition-colors border-b border-luxury-border/50 font-sans"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="UserIcon" size={16} className="flex-shrink-0" />
                    {t('nav.my_account')}
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin-dashboard"
                      className="flex items-center gap-3 py-3 text-sm font-medium text-charcoal hover:text-gold transition-colors border-b border-luxury-border/50 font-sans"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon name="Squares2X2Icon" size={16} className="flex-shrink-0" />
                      {t('nav.dashboard')}
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 py-3 text-sm font-medium text-charcoal hover:text-gold transition-colors w-full font-sans"
                  >
                    <Icon name="ArrowRightOnRectangleIcon" size={16} className="flex-shrink-0" />
                    {t('nav.sign_out')}
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 py-3 bg-gold-button text-white text-sm font-semibold tracking-wide rounded-sm font-sans"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon name="UserIcon" size={16} />
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-2 py-3 border border-luxury-border text-charcoal text-sm font-medium rounded-sm font-sans"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </>
  );
};

export default Header;
