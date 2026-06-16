'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { createClient } from '@/lib/supabase/client';
import CartDrawer from '@/components/CartDrawer';
import Skeleton from '../product/[id]/Skeleton';
import Title from './Title';
import ButtonSection from './ButtonSection';
import TopBar from '@/components/TopBar';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  material?: string;
  price: number;
  original_price?: number;
  image_url?: string;
  hover_image_url?: string;
  is_new?: boolean;
  is_best_seller?: boolean;
  category_id?: string;
}

// ─── Data ───────────────────────────────────────────────────────────────────

const heroSlides = [
  {
    id: 1,
    image: '/assets/images/header-background.png',
    mobileImage: '/assets/images/header-background-mobile.png',
    labelKey: 'hero.new_arrival',
    title: 'Celestial Ring',
    subtitle: '18K Gold · Diamond Pavé',
    tag: 'Rings',
  },
  // {
  //   id: 2,
  //   image: 'https://pos.nvncdn.com/211f76-106986/bn/20260416_5RDwA8I2.png?v=1776327227&w=1200&q=90',
  //   labelKey: 'hero.bestseller',
  //   title: 'Lumière Necklace',
  //   subtitle: 'White Gold · Sapphire',
  //   tag: 'Necklaces',
  // },
  // {
  //   id: 3,
  //   image: 'https://pos.nvncdn.com/211f76-106986/bn/20260416_5RDwA8I2.png?v=1776327227&w=1200&q=90',
  //   labelKey: 'hero.limited_edition',
  //   title: 'Aurora Bracelet',
  //   subtitle: '18K Gold · Pearl',
  //   tag: 'Bracelets',
  // },
];

const categories = [
  {
    id: 1,
    nameKey: '',
    slug: 'rings',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=85',
    span: 'col-span-1 row-span-2 rounded-md',
    href: '/product-listing',
  },
  {
    id: 2,
    nameKey: '',
    slug: 'necklaces',
    image: 'https://images.unsplash.com/photo-1701739590682-c79a8d369b05',
    span: 'col-span-1 row-span-1 md:row-span-2 rounded-md',
    href: '/product-listing',
  },
  {
    id: 3,
    nameKey: '',
    slug: 'bracelets',
    image: 'https://images.unsplash.com/photo-1674397719234-bfb44152e27f',
    span: 'col-span-1 row-span-1 rounded-md',
    href: '/product-listing',
  },
  {
    id: 4,
    nameKey: '',
    slug: 'earrings',
    image: 'https://images.unsplash.com/photo-1682822801057-d05f74a07a2f',
    span: 'col-span-2 md:col-span-1 row-span-1 rounded-md',
    href: '/product-listing',
  },
];

const testimonials = [
  {
    id: 1,
    quote:
      "The craftsmanship is unlike anything I've seen at this price point. My engagement ring arrived in the most beautiful packaging and the diamond sparkles magnificently.",
    name: 'Sophia Chen',
    title: 'Verified Buyer · Diamond Solitaire Ring',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_188eb08c6-1765769440426.png',
    rating: 5,
  },
  {
    id: 2,
    quote:
      "I purchased the Lumière necklace for my wife's anniversary gift. The quality is exceptional and the customer service was impeccable. Will definitely return.",
    name: 'Marcus Williams',
    title: 'Verified Buyer · Lumière Necklace',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_19c780f18-1772771443574.png',
    rating: 5,
  },
  {
    id: 3,
    quote:
      "The Cascade bracelet is absolutely stunning in person. Photos don't do it justice. The 18K gold has a warmth and depth that I've never seen in other pieces.",
    name: 'Isabella Martinez',
    title: 'Verified Buyer · Cascade Bracelet',
    avatar: 'https://img.rocket.new/generatedImages/rocket_gen_img_1dc0ce601-1764777996164.png',
    rating: 5,
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

// ─── Dynamic Product Card ────────────────────────────────────────────────────

export const DynamicProductCard: React.FC<{
  product: Product;
  index: number;
  styles?: string;
}> = ({ product, index, styles }) => {
  const [hovered, setHovered] = useState(false);
  const { t } = useLanguage();
  const discountPct =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null;

  return (
    <Link
      href={`/product/${product.id}`}
      className="product-card group animate-fade-up"
      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`relative aspect-[1/1] overflow-hidden border border-luxury-border mb-4 shadow-product ${styles} rounded-md`}
      >
        <AppImage
          src={
            product.image_url ||
            'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=85'
          }
          alt={product.name}
          fill
          // sizes="(max-width: 400px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover transition-all duration-700 ${hovered && product.hover_image_url ? 'opacity-0' : hovered ? 'scale-105' : 'opacity-100 scale-100'}`}
        />

        {product.hover_image_url && (
          <AppImage
            src={product.hover_image_url}
            alt={`${product.name} alternate view`}
            fill
            className={`object-cover transition-all duration-700 absolute inset-0 z-10 ${hovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
          />
        )}
        {product.is_new && (
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.15em] font-semibold text-white bg-gold px-2.5 py-1">
            {t('latest_arrivals.new_badge')}
          </span>
        )}
        {discountPct && (
          <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.15em] font-semibold text-white bg-red-500 px-2.5 py-1">
            -{discountPct}%
          </span>
        )}
      </div>
      <div className="px-1">
        {product.material && (
          <p className="text-[10px] uppercase tracking-[0.15em] text-luxury-muted mb-1 font-paj">
            {product.material}
          </p>
        )}
        <h3 className="font-paj text-charcoal text-base font-medium mb-2 group-hover:text-gold transition-colors duration-300 leading-snug">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <p className="text-gold-dark font-semibold text-sm" suppressHydrationWarning>
            {Number(product.price).toLocaleString('vi-VN')}₫
          </p>
          {product.original_price && product.original_price > product.price && (
            <p
              className="text-luxury-muted text-sm line-through font-normal"
              suppressHydrationWarning
            >
              {Number(product.original_price).toLocaleString('vi-VN')}₫
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

// ─── All Product Card ───────────────────────────────────────────────────────────
const AllProductsSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          // .eq('is_new', true)
          .order('created_at', { ascending: false })
          .limit(6);
        if (!error && data) setProducts(data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 md:py-10 bg-white">
      <div className="w-fullmax-w-[1950px] mx-auto px-4 sm:px-6 md:px-10">
        <div className="text-center mb-8 sm:mb-12 md:mb-14">
          <Title>
            <span className="font-display"> Tất Cả Sản Phẩm</span>
          </Title>
          {/* <Link
            href="/product-listing?filter=new"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-charcoal-light hover:text-gold transition-colors gold-underline font-sans"
          >
            {t('new_arrivals.view_all')}
            <Icon name="ArrowRightIcon" size={14} />
          </Link> */}
        </div>

        {loading ? (
          <Skeleton styles="grid grid-cols-2 md:grid-cols-6 gap-4 sm:gap-6 md:gap-8" length={6} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 sm:gap-6 md:gap-8">
            {products.map((product, i) => (
              <DynamicProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}

        <div className="hidden md:flex justify-center mt-10 mb-16">
          <Link
            href="/product-listing"
            className="group relative px-12 py-4 bg-gold text-white transition-all duration-500 hover:bg-charcoal hover:shadow-lg flex items-center justify-center min-w-[280px]"
          >
            <span className="font-paj text-sm tracking-[0.3em] uppercase font-medium">
              Xem tất cả sản phẩm
            </span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-2 transform transition-transform duration-300 group-hover:translate-x-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        <div className="flex justify-center mt-8 md:hidden">
          <Link
            href="/product-listing?filter=new"
            className="flex items-center gap-2 text-sm font-medium text-charcoal-light hover:text-gold transition-colors gold-underline font-sans"
          >
            {t('new_arrivals.view_all')}
            <Icon name="ArrowRightIcon" size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

// ─── New Arrivals Section ────────────────────────────────────────────────────

const NewArrivalsSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_new', true)
          .order('created_at', { ascending: false })
          .limit(4);
        if (!error && data) setProducts(data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 md:py-10 bg-white">
      <div className="max-w-[1700px] mx-auto pl-4 sm:px-6 md:px-10 md:pr-4">
        <div className="text-center mb-8 sm:mb-12 md:mb-14">
          <div>
            <Title>
              <span className="uppercase text-2xl font-medium"> {t('new_arrivals.title')}</span>
            </Title>
          </div>
          {/* <Link
            href="/product-listing?filter=new"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-charcoal-light hover:text-gold transition-colors gold-underline font-sans"
          >
            {t('new_arrivals.view_all')}
            <Icon name="ArrowRightIcon" size={14} />
          </Link> */}
        </div>

        {loading ? (
          <Skeleton styles="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-6" length={4} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-6 ">
            {products.map((product, i) => (
              <DynamicProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}

        <ButtonSection url="/product-listing?filter=bestseller">
          {t('best_sellers.view_all')}
        </ButtonSection>

        <div className="flex justify-center mt-8 md:hidden">
          <Link
            href="/product-listing?filter=new"
            className="flex items-center gap-2 text-sm font-medium text-charcoal-light hover:text-gold transition-colors gold-underline font-sans"
          >
            {t('new_arrivals.view_all')}
            <Icon name="ArrowRightIcon" size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

// ─── Best Sellers Section ────────────────────────────────────────────────────

const BestSellersSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_best_seller', true)
          .limit(4);
        if (!error && data) setProducts(data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 md:py-10 bg-white">
      <div className="max-w-[1700px] mx-auto pr-4 sm:px-6 md:px-10 md:pl-4">
        <div className="text-center mb-8 sm:mb-12 md:mb-14">
          <div>
            <Title>
              <span className="uppercase text-2xl font-medium"> {t('best_sellers.title')}</span>
            </Title>
          </div>
          {/* <Link
            href="/product-listing?filter=new"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-charcoal-light hover:text-gold transition-colors gold-underline font-sans"
          >
            {t('new_arrivals.view_all')}
            <Icon name="ArrowRightIcon" size={14} />
          </Link> */}
        </div>
        {loading ? (
          <Skeleton styles="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-6" length={4} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-6">
            {products.map((product, i) => (
              <DynamicProductCard
                key={product.id}
                product={product}
                styles="rounded-t-[50%]"
                index={i}
              />
            ))}
          </div>
        )}
        <ButtonSection url="/product-listing?filter=bestseller">
          {t('best_sellers.view_all')}
        </ButtonSection>

        <div className="flex justify-center mt-8 md:hidden">
          <Link
            href="/product-listing?filter=new"
            className="flex items-center gap-2 text-sm font-medium text-charcoal-light hover:text-gold transition-colors gold-underline font-sans"
          >
            {t('new_arrivals.view_all')}
            <Icon name="ArrowRightIcon" size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

// ─── Best Sellers Section ────────────────────────────────────────────────────

// const BestSellersSection: React.FC = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const { t } = useLanguage();

//   useEffect(() => {
//     const fetchBestSellers = async () => {
//       try {
//         const supabase = createClient();
//         const { data, error } = await supabase
//           .from('products')
//           .select('*')
//           .eq('is_best_seller', true)
//           .limit(4);
//         if (!error && data) setProducts(data);
//       } catch {
//         // silently fail
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBestSellers();
//   }, []);

//   if (!loading && products.length === 0) return null;

//   return (
//     <section className="py-14 sm:py-20 md:py-24 bg-luxury-warm">
//       <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
//         <div className="flex items-end justify-between mb-8 sm:mb-12 md:mb-14">
//           <div>
//             <Title>{t('best_sellers.title')}</Title>
//           </div>
//           <Link
//             href="/product-listing?filter=bestseller"
//             className="hidden md:flex items-center gap-2 text-sm font-medium text-charcoal-light hover:text-gold transition-colors gold-underline font-sans"
//           >
//             {t('best_sellers.view_all')}
//             <Icon name="ArrowRightIcon" size={14} />
//           </Link>
//         </div>

//         {loading ? (
//           <Skeleton styles="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8" length={4} />
//         ) : (
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
//             {products.map((product, i) => (
//               <DynamicProductCard key={product.id} product={product} index={i} />
//             ))}
//           </div>
//         )}

//         <div className="flex justify-center mt-8 md:hidden">
//           <Link
//             href="/product-listing?filter=bestseller"
//             className="flex items-center gap-2 text-sm font-medium text-charcoal-light hover:text-gold transition-colors gold-underline font-sans"
//           >
//             {t('best_sellers.view_all')}
//             <Icon name="ArrowRightIcon" size={14} />
//           </Link>
//         </div>
//       </div>
//     </section>
//   );
// };

// ─── Gift Boxes Section ──────────────────────────────────────────────────────

const GiftBoxesSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchGiftBoxes = async () => {
      try {
        const supabase = createClient();
        const { data: catData } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', '%gift%')
          .limit(1)
          .single();

        if (catData?.id) {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('category_id', catData.id)
            .limit(3);
          if (!error && data) setProducts(data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchGiftBoxes();
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-14 sm:py-20 md:py-24 bg-white relative overflow-hidden">
      {/* Subtle decorative border top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
        <div className="flex items-end justify-between mb-8 sm:mb-12 md:mb-14">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold-dark font-semibold mb-2 sm:mb-3 font-sans">
              {t('gift_boxes.label')}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-charcoal uppercase tracking-wide">
              {t('gift_boxes.title')}
            </h2>
          </div>
          <Link
            href="/product-listing?category=gift-boxes"
            className="hidden md:flex items-center gap-2 text-sm font-medium text-charcoal-light hover:text-gold transition-colors gold-underline font-sans"
          >
            {t('gift_boxes.view_all')}
            <Icon name="ArrowRightIcon" size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-luxury-border mb-4" />
                <div className="h-3 bg-luxury-border rounded mb-2 w-2/3" />
                <div className="h-4 bg-luxury-border rounded mb-2" />
                <div className="h-4 bg-luxury-border rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {products.map((product, i) => {
              const discountPct =
                product.original_price && product.original_price > product.price
                  ? Math.round(
                      ((product.original_price - product.price) / product.original_price) * 100
                    )
                  : null;
              return (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group cursor-pointer animate-fade-up"
                  style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-luxury-warm border border-luxury-border mb-4 shadow-product">
                    <AppImage
                      src={
                        product.image_url ||
                        'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&q=85'
                      }
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {discountPct && (
                      <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.15em] font-semibold text-white bg-red-500 px-2.5 py-1">
                        -{discountPct}%
                      </span>
                    )}
                  </div>
                  <div className="px-1">
                    {product.material && (
                      <p className="text-[10px] uppercase tracking-[0.15em] text-luxury-muted mb-1 font-sans">
                        {product.material}
                      </p>
                    )}
                    <h3 className="font-display text-charcoal text-base font-medium mb-2 group-hover:text-gold transition-colors duration-300 leading-snug">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-gold-dark font-semibold text-sm" suppressHydrationWarning>
                        {Number(product.price).toLocaleString('vi-VN')}₫
                      </p>
                      {product.original_price && product.original_price > product.price && (
                        <p
                          className="text-luxury-muted text-sm line-through font-normal"
                          suppressHydrationWarning
                        >
                          {Number(product.original_price).toLocaleString('vi-VN')}₫
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex justify-center mt-10 sm:mt-14">
          <Link
            href="/product-listing?category=gift-box"
            className="inline-flex items-center gap-3 px-8 sm:px-10 py-3.5 border border-gold text-gold text-sm font-semibold tracking-widest hover:bg-gold-dark hover:text-white transition-colors duration-300 font-sans uppercase min-h-[48px]"
          >
            {t('gift_boxes.view_all')}
            <Icon name="ArrowRightIcon" size={16} />
          </Link>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </section>
  );
};

// ─── Hero Section ────────────────────────────────────────────────────────────

const HeroSection: React.FC<{ onCartOpen: () => void }> = ({ onCartOpen }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { t } = useLanguage();

  const goToSlide = useCallback(
    (index: number) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setCurrentSlide(index);
      setTimeout(() => setIsAnimating(false), 700);
    },
    [isAnimating]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      goToSlide((currentSlide + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentSlide, goToSlide]);

  return (
    <section className="relative w-full h-auto flex items-center overflow-hidden">
      {/* Subtle warm tint overlay */}
      {/* <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-[#FAFAFA] via-white to-[#F9F6F1] opacity-60" /> */}

      {/* <div
        className="relative w-full h-auto flex items-center overflow-hidden"
        suppressHydrationWarning
      > */}
      {/* <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center"> */}
      {/* Left: Brand text — hidden on mobile, shown on md+ */}
      {/* <div className="hidden md:flex md:col-span-3 flex-col justify-between h-full py-8">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold-dark font-semibold mb-6 font-sans">
                {t('hero.tagline')}
              </p>
              <div className="overflow-hidden">
                <h1
                  className="font-display text-charcoal-light leading-none"
                  style={{
                    fontSize: 'clamp(3rem, 6vw, 5rem)',
                    fontWeight: 400,
                    letterSpacing: '0.12em',
                  }}
                >
                  LUXE
                </h1>
              </div>
              <div className="overflow-hidden">
                <h1
                  className="font-display text-gold-dark leading-none"
                  style={{
                    fontSize: 'clamp(3rem, 6vw, 5rem)',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                  }}
                >
                  JEWEL
                </h1>
              </div>
              <div className="w-12 h-px bg-gold/50 my-6" />
              <p className="text-charcoal-light text-sm leading-relaxed font-light max-w-[200px] font-sans">
                {t('hero.brand_desc')}
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-8">
              <div className="group">
                <p className="text-[9px] uppercase tracking-[0.2em] text-luxury-muted mb-1 font-sans">
                  {t('hero.collections_label')}
                </p>
                <div className="flex flex-col gap-1">
                  {[t('nav.rings'), t('nav.necklaces'), t('nav.bracelets')].map((item) => (
                    <Link
                      key={item}
                      href="/product-listing"
                      className="text-sm text-charcoal-light hover:text-gold transition-colors flex items-center gap-2 group/link font-sans"
                    >
                      <span className="w-3 h-px bg-gold/40 group-hover/link:w-5 transition-all duration-300" />
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div> */}

      {/* Center: Image slider — full width on mobile */}
      <div className="relative w-full">
        {/* Mobile brand text overlay */}
        {/* <div className="md:hidden flex items-center justify-between mb-4 px-1">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold-dark font-semibold font-sans">
                {t('hero.tagline')}
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display text-charcoal-light text-3xl sm:text-4xl font-normal tracking-[0.12em]">
                  LUXE
                </span>
                <span className="font-display text-gold-dark text-3xl sm:text-4xl font-semibold tracking-[0.12em]">
                  JEWEL
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="border-l-2 border-gold/50 pl-3">
                <p className="text-2xl font-display text-charcoal font-light">148+</p>
                <p className="text-[10px] text-luxury-muted tracking-wide font-sans">
                  {t('hero.unique_designs')}
                </p>
              </div>
            </div>
          </div> */}

        <div className="relative w-full aspect-[16/10] md:aspect-[21/9] lg:aspect-[25/9] md:min-h-[900px] min-h-[400px] flex items-center">
          {heroSlides.map((slide, i) => (
            <div
              key={slide.id}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: i === currentSlide ? 1 : 0 }}
            >
              {/*1. ẢNH DÀNH CHO PC: Mặc định ẩn trên Mobile (hidden), hiện từ màn hình md trở lên (md:block) */}
              <div className="hidden md:block w-full h-full relative">
                <AppImage
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={i === 0}
                />
              </div>

              {/*2. ẢNH DÀNH CHO MOBILE: Mặc định hiện (block), ẩn từ màn hình md trở lên (md:hidden) */}
              <div className="block md:hidden w-full h-full relative">
                <AppImage
                  src={slide.mobileImage || slide.image} // Nếu slide nào quên không cài ảnh mobile thì tự lấy ảnh PC làm fallback
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={i === 0}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Slide info overlay */}
              {/* <div className="absolute bottom-8 left-0 p-5 sm:p-8 md:bottom-0">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white border border-white/50 px-2.5 py-1 font-sans">
                      {t(slide.labelKey)}
                    </span>
                  </div>
                  <h3 className="font-display text-white text-xl sm:text-3xl font-light mb-1">
                    {slide.title}
                  </h3>
                  <p className="text-white/80 text-sm font-sans">{slide.subtitle}</p>
                </div> */}
            </div>
          ))}

          {/* Navigation */}
          {/* <div className="absolute bottom-5 right-5 hidden md:flex items-center gap-2 z-10">
            <div className="px-2.5 py-1 bg-white/80 backdrop-blur-md border border-luxury-border text-xs font-mono text-charcoal">
              {String(currentSlide + 1).padStart(2, '0')} /{' '}
              {String(heroSlides.length).padStart(2, '0')}
            </div>
            <button
              aria-label="Previous slide"
              onClick={() => goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)}
              className="w-9 h-9 border border-white/60 bg-white/70 backdrop-blur-md flex items-center justify-center text-charcoal hover:bg-gold hover:text-white hover:border-gold transition-all duration-300 min-w-[44px] min-h-[44px]"
            >
              <Icon name="ChevronLeftIcon" size={16} />
            </button>
            <button
              aria-label="Next slide"
              onClick={() => goToSlide((currentSlide + 1) % heroSlides.length)}
              className="w-9 h-9 border border-white/60 bg-white/70 backdrop-blur-md flex items-center justify-center text-charcoal hover:bg-gold hover:text-white hover:border-gold transition-all duration-300 min-w-[44px] min-h-[44px]"
            >
              <Icon name="ChevronRightIcon" size={16} />
            </button>
          </div> */}
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex gap-1 justify-center items-center">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                // padding rộng giúp user dễ bấm trúng trên điện thoại mà không làm ảnh hưởng đến kích thước thực tế của dot bên trong
                className="p-1.5 flex items-center justify-center transition-all duration-300 active:scale-95"
                aria-label={`Go to slide ${i + 1}`}
              >
                <span
                  className={`
            /* Cấu hình hiệu ứng chuyển động mượt mà giữa các trạng thái */
            transition-all duration-300 ease-in-out block
            
            /* Tạo hình tròn và bo góc tối đa */
            rounded-full 
            
            /* Trạng thái hoạt động (Active Pill) và không hoạt động */
            ${
              i === currentSlide
                ? 'w-6 h-2 bg-white' // Khi Active: hình viên thuốc dài 24px, cao 8px, màu trắng
                : 'w-2 h-2 bg-transparent border border-white/80' // Khi không active: hình tròn nhỏ 8x8px, viền trắng mờ, trong suốt
            }
          `}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Mobile CTA buttons */}
        {/* <div className="md:hidden flex flex-col sm:flex-row gap-3 mt-5">
            <Link
              href="/product-listing"
              className="flex-1 px-6 py-3.5 bg-gold-button text-white text-sm font-semibold tracking-widest hover:bg-gold-dark transition-colors duration-300 text-center font-sans uppercase"
            >
              {t('hero.shop_collection')}
            </Link>
            <button
              onClick={onCartOpen}
              className="flex-1 px-6 py-3.5 border border-charcoal/20 text-charcoal text-sm font-medium tracking-wide hover:border-gold hover:text-gold transition-colors duration-300 font-sans"
            >
              {t('hero.view_lookbook')}
            </button>
          </div> */}
      </div>

      {/* Right: Stats + CTA — desktop only */}
      {/* <div className="hidden md:flex md:col-span-3 flex-col justify-between h-full py-8">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-luxury-muted mb-1 font-sans">
                Year
              </p>
              <span
                className="font-display text-charcoal-light leading-none select-none"
                style={{ fontSize: 'clamp(3rem, 5vw, 6rem)', fontWeight: 700 }}
              >
                26
              </span>
            </div>

            <div className="space-y-6 mt-8">
              <div className="border-l-2 border-gold/50 pl-4">
                <p className="text-2xl font-display text-charcoal font-light">148+</p>
                <p className="text-xs text-luxury-muted tracking-wide mt-0.5 font-sans">
                  {t('hero.unique_designs')}
                </p>
              </div>
              <div className="border-l-2 border-gold/30 pl-4">
                <p className="text-2xl font-display text-charcoal font-light">4,200+</p>
                <p className="text-xs text-luxury-muted tracking-wide mt-0.5 font-sans">
                  {t('hero.happy_clients')}
                </p>
              </div>
              <div className="border-l-2 border-gold/15 pl-4">
                <p className="text-2xl font-display text-charcoal font-light">12</p>
                <p className="text-xs text-luxury-muted tracking-wide mt-0.5 font-sans">
                  {t('hero.countries_shipped')}
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/product-listing"
                className="px-6 py-3 bg-gold text-white text-sm font-semibold tracking-widest hover:bg-gold-dark transition-colors duration-300 text-center font-sans uppercase"
              >
                {t('hero.shop_collection')}
              </Link>
              <button
                onClick={onCartOpen}
                className="px-6 py-3 border border-charcoal/20 text-charcoal text-sm font-medium tracking-wide hover:border-gold hover:text-gold transition-colors duration-300 font-sans"
              >
                {t('hero.view_lookbook')}
              </button>
            </div>
          </div> */}
      {/* </div> */}

      {/* Bottom scroll indicator */}
      {/* <div className="hidden sm:flex items-center justify-center gap-3 mt-6 md:mt-8 text-luxury-muted">
          <div className="w-px h-8 bg-luxury-border" />
          <p className="text-[10px] uppercase tracking-[0.3em] font-sans">
            {t('hero.scroll_to_explore')}
          </p>
          <div className="w-px h-8 bg-luxury-border" />
        </div> */}
      {/* </div> */}
    </section>
    // <section className="relative w-full h-auto flex items-center overflow-hidden">
    //   <div className="relative w-full aspect-[16/10] md:aspect-[21/9] lg:aspect-[25/9] md:min-h-[1000px] min-h-[400px] flex items-center">
    //     <div className="absolute inset-0 z-0">
    //       <img
    //         src="https://pos.nvncdn.com/211f76-106986/bn/20260416_5RDwA8I2.png?v=1776327227"
    //         alt="PAJ Silver"
    //         className="w-full h-auto block"
    //       />
    //     </div>
    //   </div>
    // </section>
  );
};

const CategoriesSection: React.FC = () => {
  const { t } = useLanguage();
  // const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  // const [countsLoading, setCountsLoading] = useState(true);

  // useEffect(() => {
  //   const fetchCounts = async () => {
  //     try {
  //       const supabase = createClient();
  //       const { data, error } = await supabase
  //         .from('products')
  //         .select('category_id, categories!inner(slug)');
  //       if (!error && data) {
  //         const counts: Record<string, number> = {};
  //         data.forEach((row: any) => {
  //           const slug = row.categories?.slug;
  //           if (slug) {
  //             counts[slug] = (counts[slug] || 0) + 1;
  //           }
  //         });
  //         setCategoryCounts(counts);
  //       }
  //     } catch {
  //       // silently fail
  //     } finally {
  //       setCountsLoading(false);
  //     }
  //   };
  //   fetchCounts();
  // }, []);

  return (
    <section className="py-14 sm:py-20 md:py-24 px-4 sm:px-6 md:px-10 max-w-[1950px] mx-auto">
      <div className="text-center mb-8 sm:mb-12 md:mb-14">
        <Title>
          <span className="font-display">{t('categories.our_collections')}</span>
        </Title>
        <div className="relative flex items-center justify-center w-40 h-4 mt-2 justify-self-center">
          <div className="flex-1 h-[1px] bg-[gold]"></div>

          <div className="px-2 text-[gold]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>

          <div className="flex-1 h-[1px] bg-[gold]"></div>
        </div>
        {/* <Link
          href="/product-listing"
          className="hidden md:flex items-center gap-2 text-sm font-medium text-charcoal-light hover:text-gold transition-colors gold-underline font-sans"
        >
          {t('categories.view_all')}
          <Icon name="ArrowRightIcon" size={14} />
        </Link> */}
      </div>

      {/* Asymmetric bento grid — simplified on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2 gap-2 sm:gap-3 h-[400px] sm:h-[450px] ">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={cat.href}
            className={`${cat.span} relative overflow-hidden group cursor-pointer`}
          >
            <AppImage
              src={cat.image}
              alt={t(cat.nameKey)}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/10 to-transparent transition-opacity duration-300 group-hover:from-charcoal/75" /> */}

            {/* Content */}
            {/* <div className="absolute bottom-0 left-0 p-3 sm:p-5 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="font-display text-white text-base sm:text-xl md:text-2xl font-light mb-1">
                {t(cat.nameKey)}
              </h3>
              <p className="text-white text-xs tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-sans">
                {countsLoading ? '...' : `${categoryCounts[cat.slug] ?? 0} sản phẩm`} →
              </p>
            </div> */}

            {/* Gold corner accent */}
            {/* <div className="absolute top-3 right-3 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-full h-px bg-gold" />
              <div className="w-px h-full bg-gold ml-auto" />
            </div> */}
          </Link>
        ))}
      </div>

      {/* Mobile view all link */}
      <div className="flex justify-center mt-6 md:hidden">
        <Link
          href="/product-listing"
          className="flex items-center gap-2 text-sm font-medium text-charcoal-light hover:text-gold transition-colors gold-underline font-sans"
        >
          {t('categories.view_all')}
          <Icon name="ArrowRightIcon" size={14} />
        </Link>
      </div>
    </section>
  );
};

const CraftsmanshipSection: React.FC = () => {
  const { t } = useLanguage();
  return (
    <section className="w-full max-w-[1950px] mx-auto px-4 py-4 sm:px-6 md:px-10 overflow-hidden bg-luxury-white">
      <div className=" mx-auto px-4 sm:px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-20 items-center">
          {/* Image */}
          <div className="relative">
            <div className="aspect-[16/9] overflow-hidden">
              <AppImage
                src="https://images.unsplash.com/photo-1654076847645-b72b3b66d576"
                alt="Master jeweler crafting a piece"
                fill
                className="object-cover rounded-md"
              />
            </div>
            {/* Floating stat card */}
            <div className="absolute -bottom-4 right-4 sm:-bottom-6 sm:right-0 bg-white border border-luxury-border p-4 sm:p-6 shadow-product w-40 sm:w-48">
              <p className="text-2xl sm:text-3xl font-display font-light text-charcoal mb-1">8+</p>
              <p className="text-xs text-luxury-muted tracking-wide">
                {t('craftsmanship.years_label')}
              </p>
              <div className="w-8 h-px bg-gold mt-3" />
            </div>
          </div>

          {/* Text */}
          <div className="md:pl-8 mt-6 sm:mt-8 md:mt-0 max-w-[750px]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold-dark font-semibold mb-4 sm:mb-6 font-sans">
              {t('craftsmanship.our_story')}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-charcoal leading-tight mb-4 sm:mb-6">
              {t('craftsmanship.title_line1')}
              <br />
              <em className="font-medium not-italic">{t('craftsmanship.title_line2')}</em>
            </h2>
            <p className="text-charcoal-light leading-relaxed mb-4 sm:mb-6 text-sm md:text-base font-sans">
              Tại PAJ Silver, mỗi món trang sức không chỉ được tạo ra để làm đẹp, mà còn để lưu giữ
              một câu chuyện. Từ những đường nét đầu tiên đến khi hoàn thiện, từng chi tiết đều được
              chăm chút tỉ mỉ bằng sự chỉn chu, kiên nhẫn và tình yêu với nghề bạc.
            </p>
            <p className="text-charcoal-light leading-relaxed mb-6 sm:mb-8 text-sm md:text-base font-sans">
              Chúng tôi tin rằng một chiếc nhẫn, một sợi dây chuyền hay một món quà nhỏ đều có thể
              trở thành kỷ niệm theo bạn thật lâu. Vì vậy, PAJ Silver luôn đặt tâm huyết vào từng
              sản phẩm, để khi đến tay khách hàng, mỗi món trang sức đều mang theo sự tinh tế, chân
              thành và một dấu ấn riêng.
            </p>

            {/* <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 pt-6 sm:pt-8 border-t border-luxury-border">
              {[
                { value: '18K', labelKey: 'craftsmanship.gold_alloy' },
                { value: 'GIA', labelKey: 'craftsmanship.certified_stones' },
                { value: '100%', labelKey: 'craftsmanship.ethically_sourced' },
              ].map((stat) => (
                <div key={stat.labelKey}>
                  <p className="font-display text-xl sm:text-2xl font-semibold text-gold-dark mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-luxury-muted tracking-wide font-sans">
                    {t(stat.labelKey)}
                  </p>
                </div>
              ))}
            </div> */}

            <Link
              href="/product-listing"
              className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-3.5 border border-charcoal text-charcoal text-sm font-semibold tracking-widest hover:bg-charcoal hover:text-white transition-colors duration-300 font-sans uppercase min-h-[48px]"
            >
              {t('craftsmanship.explore_btn')}
              <Icon name="ArrowRightIcon" size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

const TestimonialsSection: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);
  const { t } = useLanguage();

  return (
    <section className="py-14 sm:py-16 md:py-18 bg-[#1a3333] relative overflow-hidden">
      {/* Subtle top/bottom borders */}
      <div className="absolute top-0 left-0 right-0 h-px bg-luxury-border" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-luxury-border" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
        {/* <div className="text-center mb-10 sm:mb-14 md:mb-16">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gold-dark font-semibold mb-3 sm:mb-4 font-sans">
            {t('testimonials.what_clients_say')}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-charcoal">
            {t('testimonials.stories_of_joy')}
          </h2>
        </div> */}

        {/* Mobile: single card with dots; tablet+: grid */}
        <div className="md:hidden">
          <div className="p-6 border bg-white border-gold/40 shadow-product">
            <div className="flex gap-1 mb-5">
              {Array.from({ length: testimonials[activeIdx].rating }).map((_, si) => (
                <Icon key={si} name="StarIcon" size={14} className="text-gold" variant="solid" />
              ))}
            </div>
            <blockquote className="font-display text-charcoal text-base font-light leading-relaxed mb-6 italic">
              &ldquo;{testimonials[activeIdx].quote}&rdquo;
            </blockquote>
            <div className="flex items-center gap-4 pt-6 border-t border-luxury-border">
              <AppImage
                src={testimonials[activeIdx].avatar}
                alt={testimonials[activeIdx].name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <div>
                <p className="text-charcoal font-semibold text-sm font-sans">
                  {testimonials[activeIdx].name}
                </p>
                <p className="text-luxury-muted text-xs mt-0.5 font-sans">
                  {testimonials[activeIdx].title}
                </p>
              </div>
            </div>
          </div>
          {/* Dots */}
          <div className="flex justify-center gap-2 mt-5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 min-w-[24px] min-h-[24px] flex items-center justify-center`}
                aria-label={`View testimonial ${i + 1}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${i === activeIdx ? 'bg-gold' : 'bg-luxury-border'}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:grid grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <div
              key={testimonial.id}
              className={`p-8 transition-all duration-500 cursor-pointer shadow-product`}
              onClick={() => setActiveIdx(i)}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: testimonial.rating }).map((_, si) => (
                  <Icon
                    key={si}
                    name="StarIcon"
                    size={14}
                    className="text-[gold]"
                    variant="solid"
                  />
                ))}
              </div>
              <blockquote className="font-paj text-white text-base font-light leading-relaxed mb-8 italic">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-4">
                <AppImage
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
                <div>
                  <p className="text-white font-semibold text-sm font-sans">{testimonial.name}</p>
                  <p className="text-luxury-muted text-xs mt-0.5 font-sans">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="py-14 sm:py-20 md:py-24 bg-white border-t border-luxury-border">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        {/* <p className="text-[10px] uppercase tracking-[0.3em] text-gold-dark font-semibold mb-3 sm:mb-4 font-sans">
          {t('newsletter.exclusive_access')}
        </p> */}
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-charcoal mb-3 sm:mb-4">
          {t('newsletter.title')}
        </h2>
        <p className="text-charcoal-light text-sm md:text-base mb-8 sm:mb-10 leading-relaxed font-sans">
          {t('newsletter.desc')}
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-3 text-gold">
            <Icon name="CheckCircleIcon" size={20} />
            <p className="font-semibold font-sans">{t('newsletter.thank_you')}</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('newsletter.placeholder')}
              className="flex-1 px-4 py-3.5 bg-luxury-warm border border-luxury-border text-sm focus:outline-none focus:border-gold transition-colors font-sans min-h-[48px]"
              required
            />
            <button
              type="submit"
              className="px-8 py-3.5 bg-gold-button text-white text-sm font-semibold tracking-widest hover:bg-gold-dark transition-colors duration-300 whitespace-nowrap font-sans uppercase min-h-[48px]"
            >
              {t('newsletter.subscribe')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { openCart } = useCart();

  return (
    <div className="min-h-screen bg-white" suppressHydrationWarning>
      <TopBar />
      <Header transparent={true} />
      <CartDrawer />

      <main suppressHydrationWarning>
        <HeroSection onCartOpen={openCart} />
        <div className="max-w-[1770px] mx-auto">
          <CategoriesSection />
          <AllProductsSection />
          <div className="grid grid-cols-1 md:grid-cols-2 ">
            <NewArrivalsSection />
            <BestSellersSection />
          </div>
          <GiftBoxesSection />
        </div>
        <CraftsmanshipSection />
        <TestimonialsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}
