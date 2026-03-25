'use client';

import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CartDrawer() {
  const { items, cartCount, cartTotal, isOpen, removeFromCart, updateQuantity, closeCart } = useCart();
  const { t } = useLanguage();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-charcoal/40 z-50 animate-fade-in"
          onClick={closeCart}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-drawer flex flex-col transition-transform duration-500 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-luxury-border">
          <h2 className="font-display text-xl font-medium text-charcoal">
            {t('product_detail.cart_label')} ({cartCount})
          </h2>
          <button onClick={closeCart} aria-label="Close cart" className="text-charcoal hover:text-gold transition-colors">
            <Icon name="XMarkIcon" size={20} />
          </button>
        </div>

        {items?.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items?.map((item) => (
                <div key={item?.id} className="flex gap-4 p-4 border border-luxury-border bg-luxury-warm">
                  <div className="relative w-20 h-24 flex-shrink-0">
                    <AppImage src={item?.image} alt={item?.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {item?.material && (
                      <p className="text-xs text-luxury-muted mb-0.5 font-sans">{item?.material}</p>
                    )}
                    <p className="font-display text-sm font-medium text-charcoal leading-snug">{item?.name}</p>
                    {item?.size && (
                      <p className="text-xs text-luxury-muted mt-1 font-sans">
                        {t('product_detail.us_size')}: {item?.size}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-luxury-border bg-white">
                        <button
                          onClick={() => updateQuantity(item?.id, item?.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-charcoal hover:text-gold transition-colors"
                        >
                          <Icon name="MinusIcon" size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-medium font-sans">{item?.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item?.id, item?.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-charcoal hover:text-gold transition-colors"
                        >
                          <Icon name="PlusIcon" size={12} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item?.id)}
                        className="text-luxury-muted hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Icon name="TrashIcon" size={14} />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-gold mt-2 font-sans" suppressHydrationWarning>
                      {(item?.price * item?.quantity)?.toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-luxury-border bg-white">
              <div className="flex justify-between text-sm mb-5">
                <span className="text-charcoal-light font-sans">{t('product_detail.subtotal')}</span>
                <span className="font-semibold text-charcoal font-sans" suppressHydrationWarning>
                  {cartTotal?.toLocaleString('vi-VN')}₫
                </span>
              </div>
              <Link
                href="/shopping-cart-checkout"
                onClick={closeCart}
                className="block w-full py-3.5 bg-gold text-white text-sm font-semibold text-center tracking-widest hover:bg-gold-dark transition-colors font-sans uppercase"
              >
                {t('product_detail.proceed_to_checkout')}
              </Link>
              <Link
                href="/product-listing"
                onClick={closeCart}
                className="block w-full py-3 border border-luxury-border text-charcoal text-sm font-medium text-center mt-2 hover:border-gold hover:text-gold transition-colors font-sans"
              >
                {t('product_detail.continue_shopping')}
              </Link>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <Icon name="ShoppingBagIcon" size={32} className="text-luxury-muted mb-4" />
            <p className="font-display text-lg font-light text-charcoal mb-2">
              {t('product_detail.cart_empty')}
            </p>
            <p className="text-xs text-luxury-muted mb-6 font-sans">
              {t('product_listing.empty_cart_desc')}
            </p>
            <button
              onClick={closeCart}
              className="px-8 py-3 bg-gold-button text-white text-sm font-semibold hover:bg-gold-dark transition-colors font-sans uppercase tracking-widest"
            >
              {t('product_detail.continue_shopping')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
