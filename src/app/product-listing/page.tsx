'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { createClient } from '@/lib/supabase/client';
import { DynamicProductCard } from '../homepage/page';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  material: string;
  metalType: string;
  category: string;
  categorySlug: string;
  price: number;
  original_price?: number;
  image_url: string;
  hoverImage: string;
  is_new: boolean;
  stock_quantity: boolean;
  slug: string;
  gender?: string;
}

const ITEMS_PER_PAGE = 20;

const metalTypes = ['Vàng 18K', 'Vàng Trắng', 'Bạc', 'Mạ Vàng 18K', 'Bạch kim'];
const categoryTypes = [
  'All',
  'Rings',
  'Couple-Rings',
  'Necklaces',
  'Bracelets',
  'Earrings',
  'Gift-Boxes',
];
const genderTypes = ['Nam', 'Nữ', 'Unisex'];

const categoryLabels: Record<string, string> = {
  All: 'Tất cả',
  Rings: 'Nhẫn',
  'Couple-Rings': 'Nhẫn cặp',
  Necklaces: 'Dây chuyền',
  Bracelets: 'Lắc tay',
  Earrings: 'Bông tai',
  'Gift-Boxes': 'Box quà tặng',
};

// ─── Category slug → DB slug mapping ─────────────────────────────────────────
const categorySlugMap: Record<string, string> = {
  Rings: 'rings',
  'Couple-Rings': 'couple-rings',
  Necklaces: 'necklaces',
  Bracelets: 'bracelets',
  Earrings: 'earrings',
  'Gift-Boxes': 'gift-boxes',
};

function mapProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    material: p.material || '',
    metalType: p.material?.includes('White Gold')
      ? 'White Gold'
      : p.material?.includes('18K Gold Plating')
        ? '18K Gold Plating'
        : p.material?.includes('Silver')
          ? 'Silver'
          : p.material?.includes('Gold')
            ? '18K Gold'
            : '',
    category: p.categories?.name || '',
    categorySlug: p.categories?.slug || '',
    price: Number(p.price),
    original_price: p.original_price ? Number(p.original_price) : undefined,
    image_url:
      p.image_url || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=85',
    hoverImage:
      p.gallery_urls?.[0] ||
      p.image_url ||
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&q=85',
    is_new: p.is_new || false,
    stock_quantity: (p.stock_quantity || 0) > 0,
    slug: p.slug,
    gender: p.gender || 'Unisex',
  };
}

// const discountPct = (p: Product) => {
//   return p.original_price && p.original_price > p.price
//     ? Math.round(((p.original_price - p.price) / p.original_price) * 100)
//     : null;
// };

function ProductListingContent() {
  const { t } = useLanguage();
  const { openCart, cartCount } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const gridTopRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    t('product_listing.featured'),
    t('product_listing.price_low_high'),
    t('product_listing.price_high_low'),
    t('product_listing.newest'),
    t('product_listing.best_rated'),
  ];

  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedMetals, setSelectedMetals] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState(sortOptions[0]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [maxPriceInit, setMaxPriceInit] = useState(100000000);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000]);
  const [searchQuery, setSearchQuery] = useState('');

  // Derive selectedCategory directly from URL — no separate state needed
  const catMap: Record<string, string> = {
    rings: 'Rings',
    'couple-rings': 'Couple-Rings',
    necklaces: 'Necklaces',
    bracelets: 'Bracelets',
    earrings: 'Earrings',
    'gift-boxes': 'Gift-Boxes',
  };
  const categoryParam = searchParams.get('category');
  const selectedCategory = categoryParam ? catMap[categoryParam.toLowerCase()] || 'All' : 'All';

  // Derive gender from URL
  const genderParam = searchParams.get('gender');

  // Current page from URL
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // On desktop, default sidebar open
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when mobile filter is open
  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFilterOpen]);

  // ── Sync gender from URL to state ─────────────────────────────────────────
  useEffect(() => {
    if (genderParam) {
      setSelectedGenders([genderParam]);
    } else {
      setSelectedGenders([]);
    }
  }, [genderParam]);

  // ── Update URL page param ──────────────────────────────────────────────────
  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(page));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      setTimeout(() => {
        gridTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    },
    [searchParams, router, pathname]
  );

  // ── Reset page to 1 when filters change ───────────────────────────────────
  const resetPage = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // ── Read URL params on mount ───────────────────────────────────────────────
  useEffect(() => {
    const filter = searchParams.get('filter');
    const search = searchParams.get('search');

    if (search) setSearchQuery(search);
    void filter; // handled in fetch
  }, [searchParams]);

  // ── Fetch products with pagination ────────────────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;

        let query = supabase
          .from('products')
          .select('*, categories(name, slug)', { count: 'exact' })
          .eq('is_active', true);

        // Category filter — resolve category_id from slug first
        if (selectedCategory !== 'All') {
          const slug = categorySlugMap[selectedCategory];
          if (slug) {
            const { data: catData } = await supabase
              .from('categories')
              .select('id')
              .eq('slug', slug)
              .single();
            if (catData?.id) {
              query = query.eq('category_id', catData.id);
            }
          }
        }

        // URL filter=new
        const urlFilter = searchParams.get('filter');
        if (urlFilter === 'new') {
          query = query.eq('is_new', true);
        }

        // In-stock filter — server-side
        if (inStockOnly) {
          query = query.gt('stock_quantity', 0);
        }

        // Metal type filter — server-side using material column
        if (selectedMetals.length > 0) {
          const metalConditions = selectedMetals.map((metal) => {
            if (metal === 'White Gold') return 'material.ilike.%White Gold%';
            if (metal === '18K Gold Plating') return 'material.ilike.%18K Gold Plating%';
            if (metal === 'Silver') return 'material.ilike.%Silver%';
            if (metal === '18K Gold') return 'material.ilike.%Gold%';
            return `material.ilike.%${metal}%`;
          });
          query = query.or(metalConditions.join(','));
        }

        // Gender filter — server-side
        if (selectedGenders.length > 0) {
          query = query.in('gender', selectedGenders);
        }

        // Search filter — server-side
        if (searchQuery.trim()) {
          const q = searchQuery.trim();
          query = query.or(`name.ilike.%${q}%,material.ilike.%${q}%`);
        }

        // Price filter — server-side so pagination counts are accurate
        if (priceRange[0] > 0) {
          query = query.gte('price', priceRange[0]);
        }
        if (priceRange[1] < maxPriceInit) {
          query = query.lte('price', priceRange[1]);
        }

        // Sort
        if (sortBy === t('product_listing.price_low_high')) {
          query = query.order('price', { ascending: true });
        } else if (sortBy === t('product_listing.price_high_low')) {
          query = query.order('price', { ascending: false });
        } else if (sortBy === t('product_listing.newest')) {
          query = query
            .order('is_new', { ascending: false })
            .order('created_at', { ascending: false });
        } else {
          query = query.order('created_at', { ascending: false });
        }

        // Apply pagination AFTER all filters
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (!error && data) {
          const mapped: Product[] = data.map(mapProduct);

          setProducts(mapped);
          setTotalCount(count ?? 0);

          // Init max price on first load
          if (maxPriceInit === 100000000 && mapped.length > 0) {
            const max = Math.max(...mapped.map((p) => p.price));
            if (max > 0) {
              setMaxPriceInit(max);
              setPriceRange([0, max]);
            }
          }
        }
      } catch {
        // silently fail
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [
    currentPage,
    selectedCategory,
    selectedMetals,
    selectedGenders,
    inStockOnly,
    sortBy,
    searchQuery,
    searchParams,
    priceRange,
    maxPriceInit,
    t,
  ]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMetal = (metal: string) => {
    setSelectedMetals((prev) =>
      prev.includes(metal) ? prev.filter((m) => m !== metal) : [...prev, metal]
    );
    resetPage();
  };

  const toggleGender = (gender: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const newGenders = selectedGenders.includes(gender)
      ? selectedGenders.filter((g) => g !== gender)
      : [...selectedGenders, gender];

    if (newGenders.length === 0) {
      params.delete('gender');
    } else if (newGenders.length === 1) {
      params.set('gender', newGenders[0]);
    } else {
      params.set('gender', newGenders[0]);
    }
    params.set('page', '1');
    setSelectedGenders(newGenders);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setSelectedMetals([]);
    setSelectedGenders([]);
    setInStockOnly(false);
    setSearchQuery('');
    setPriceRange([0, maxPriceInit]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    params.delete('gender');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // ── Pagination helpers ─────────────────────────────────────────────────────
  const getPageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(
        1,
        '...',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  // Active filter count for mobile badge
  const activeFilterCount = selectedMetals.length + selectedGenders.length + (inStockOnly ? 1 : 0);

  // ── Skeletons ──────────────────────────────────────────────────────────────
  const ProductCardSkeleton = () => (
    <div className="animate-pulse">
      <div className="aspect-[4/3] bg-luxury-warm mb-4" />
      <div className="h-2.5 bg-luxury-warm rounded w-3/4 mb-2" />
      <div className="h-3.5 bg-luxury-warm rounded w-full mb-2" />
      <div className="flex items-center justify-between">
        <div className="h-3.5 bg-luxury-warm rounded w-1/4" />
        <div className="h-2.5 bg-luxury-warm rounded w-1/4" />
      </div>
    </div>
  );

  const ProductListSkeleton = () => (
    <div className="flex gap-6 p-4 border border-luxury-border animate-pulse">
      <div className="w-24 h-32 flex-shrink-0 bg-luxury-warm" />
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="h-2 bg-luxury-warm rounded w-1/3 mb-2" />
          <div className="h-4 bg-luxury-warm rounded w-2/3 mb-2" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-4 bg-luxury-warm rounded w-1/5" />
          <div className="h-3 bg-luxury-warm rounded w-1/6" />
        </div>
      </div>
    </div>
  );

  // ── Shared filter panel content ────────────────────────────────────────────
  const FilterPanelContent = () => (
    <div className="space-y-7 ">
      {/* Category filter */}
      <div>
        <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-charcoal mb-4">
          {t('product_listing.category')}
        </h3>
        <div className="space-y-1">
          {categoryTypes.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                if (cat === 'All') {
                  params.delete('category');
                  params.delete('gender');
                } else {
                  params.set('category', categorySlugMap[cat] || cat.toLowerCase());
                }
                params.set('page', '1');
                router.push(`${pathname}?${params.toString()}`, { scroll: false });
                setMobileFilterOpen(false);
              }}
              className={`block w-full text-left text-sm py-2 transition-colors min-h-[44px] ${selectedCategory === cat ? 'text-gold font-semibold' : 'text-charcoal-light hover:text-charcoal'}`}
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gender filter */}
      <div>
        <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-charcoal mb-4">
          GIỚI TÍNH
        </h3>
        <div className="space-y-1">
          {genderTypes.map((gender) => (
            <label key={gender} className="flex items-center gap-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={selectedGenders.includes(gender)}
                onChange={() => toggleGender(gender)}
                className="accent-gold w-4 h-4"
              />
              <span className="text-sm text-charcoal-light">{gender}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Metal filter */}
      <div>
        <h3 className="text-xs uppercase tracking-[0.2em] font-semibold text-charcoal mb-4">
          {t('product_listing.metal_type')}
        </h3>
        <div className="space-y-1">
          {metalTypes.map((metal) => (
            <label key={metal} className="flex items-center gap-3 cursor-pointer min-h-[44px]">
              <input
                type="checkbox"
                checked={selectedMetals.includes(metal)}
                onChange={() => toggleMetal(metal)}
                className="accent-gold w-4 h-4"
              />
              <span className="text-sm text-charcoal-light">{metal}</span>
            </label>
          ))}
        </div>
      </div>

      {/* In stock */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={() => {
              setInStockOnly(!inStockOnly);
              resetPage();
            }}
            className="accent-gold w-4 h-4"
          />
          <span className="text-sm text-charcoal-light">{t('product_listing.in_stock_only')}</span>
        </label>
      </div>

      <button
        onClick={() => {
          clearFilters();
          setMobileFilterOpen(false);
        }}
        className="text-xs text-luxury-muted hover:text-gold transition-colors underline min-h-[44px] flex items-center"
      >
        {t('product_listing.clear_all_filters')}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-luxury-white">
      <Header cartCount={cartCount} onCartOpen={openCart} />
      <CartDrawer />

      {/* Mobile filter drawer overlay */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 bg-charcoal/40 z-40 md:hidden"
          onClick={() => setMobileFilterOpen(false)}
        />
      )}

      {/* Mobile filter drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-[85vw] max-w-[320px] bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300 md:hidden ${
          mobileFilterOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-luxury-border">
          <h2 className="font-display text-lg font-medium text-charcoal">Bộ lọc</h2>
          <button
            onClick={() => setMobileFilterOpen(false)}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-charcoal hover:text-gold transition-colors"
            aria-label="Close filters"
          >
            <Icon name="XMarkIcon" size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <FilterPanelContent />
        </div>
        <div className="px-5 py-4 border-t border-luxury-border">
          <button
            onClick={() => setMobileFilterOpen(false)}
            className="w-full py-3.5 bg-gold-button text-white text-sm font-semibold tracking-wide font-sans min-h-[48px]"
          >
            Xem {totalCount} sản phẩm
          </button>
        </div>
      </div>

      <main className="pt-14 sm:pt-16 md:pt-20">
        <div className="bg-luxury-warm border-b border-luxury-border py-6 sm:py-8 md:py-10 px-4 sm:px-6 md:px-10">
          <div className="max-w-[1770px] mx-auto">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gold-dark font-semibold mb-2">
              {t('product_listing.discover')}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-light text-charcoal mb-3 sm:mb-4">
              {t('product_listing.all_collections')}
            </h1>
            {searchQuery && (
              <p className="text-sm text-charcoal-light">
                Kết quả tìm kiếm cho:{' '}
                <span className="font-semibold text-charcoal">&ldquo;{searchQuery}&rdquo;</span>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    resetPage();
                  }}
                  className="ml-2 text-gold hover:text-gold-dark text-xs underline"
                >
                  Xóa
                </button>
              </p>
            )}
          </div>
        </div>

        <div className="max-w-[1770px] mx-auto px-4 sm:px-6 md:px-10 py-6 sm:py-8 md:py-10 flex gap-8">
          {/* Desktop Sidebar */}
          <aside
            className={`hidden md:block ${sidebarOpen ? 'w-64 flex-shrink-0' : 'w-0 overflow-hidden'} transition-all duration-300`}
          >
            <FilterPanelContent />
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div
              ref={gridTopRef}
              className="flex items-center justify-between mb-5 sm:mb-6 scroll-mt-24 gap-3"
            >
              <div className="flex items-center gap-3">
                {/* Desktop filter toggle */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hidden md:flex items-center gap-2 text-sm text-charcoal-light hover:text-charcoal transition-colors min-h-[44px]"
                >
                  <Icon name="AdjustmentsHorizontalIcon" size={16} />
                  {sidebarOpen
                    ? t('product_listing.hide_filters')
                    : t('product_listing.show_filters')}
                </button>
                {/* Mobile filter button */}
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="md:hidden flex items-center gap-2 text-sm text-charcoal-light hover:text-charcoal transition-colors min-h-[44px] relative"
                >
                  <Icon name="AdjustmentsHorizontalIcon" size={16} />
                  Bộ lọc
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 bg-gold-button text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <span className="text-xs text-luxury-muted">
                  {totalCount} {t('product_listing.pieces')}
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="hidden sm:flex gap-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center ${viewMode === 'grid' ? 'text-charcoal' : 'text-luxury-muted'}`}
                  >
                    <Icon name="Squares2X2Icon" size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center ${viewMode === 'list' ? 'text-charcoal' : 'text-luxury-muted'}`}
                  >
                    <Icon name="ListBulletIcon" size={16} />
                  </button>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    resetPage();
                  }}
                  className="text-xs border border-luxury-border px-2 sm:px-3 py-1.5 bg-luxury-white text-charcoal focus:outline-none focus:border-gold min-h-[36px] max-w-[140px] sm:max-w-none"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* No results */}
            {products.length === 0 && !isLoading && (
              <div className="text-center py-16 sm:py-24 border border-luxury-border bg-luxury-warm/30">
                <div className="w-16 h-16 bg-luxury-warm rounded-full flex items-center justify-center mx-auto mb-5">
                  <Icon name="MagnifyingGlassIcon" size={28} className="text-luxury-muted" />
                </div>
                <p className="font-display text-xl font-light text-charcoal mb-2">
                  {t('product_listing.no_pieces_found')}
                </p>
                <p className="text-luxury-muted text-sm mb-6">
                  {t('product_listing.no_results_desc')}
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-gold text-charcoal text-xs font-semibold tracking-wide hover:bg-gold-light transition-colors min-h-[44px]"
                >
                  {t('product_listing.clear_all_filters')}
                </button>
              </div>
            )}

            {/* Grid view */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
                  : products.map((product, index) => (
                      // <Link
                      //   key={product.id}
                      //   href={`/product/${product.id}`}
                      //   className="group block"
                      //   onMouseEnter={() => setHoveredId(product.id)}
                      //   onMouseLeave={() => setHoveredId(null)}
                      // >
                      //   <div className="relative aspect-[3/4] overflow-hidden bg-luxury-warm mb-3 sm:mb-4">
                      //     <AppImage
                      //       src={product.image}
                      //       alt={product.name}
                      //       fill
                      //       className={`object-cover transition-all duration-700 ${hoveredId === product.id ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
                      //     />
                      //     <AppImage
                      //       src={product.hoverImage}
                      //       alt={`${product.name} alternate view`}
                      //       fill
                      //       className={`object-cover transition-all duration-700 absolute inset-0 ${hoveredId === product.id ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
                      //     />
                      //     {product.isNew && (
                      //       <span className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[10px] uppercase tracking-[0.15em] font-bold text-white bg-gold px-2 py-0.5 z-10">
                      //         {t('product_listing.new_badge')}
                      //       </span>
                      //     )}
                      //     {discountPct(product) && (
                      //       <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.15em] font-semibold text-white bg-red-500 px-2.5 py-1">
                      //         -{discountPct(product)}%
                      //       </span>
                      //     )}
                      //     {!product.inStock && (
                      //       <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                      //         <span className="text-xs uppercase tracking-widest text-white font-semibold">
                      //           {t('product_listing.sold_out')}
                      //         </span>
                      //       </div>
                      //     )}
                      //   </div>
                      //   <div>
                      //     {product.material && (
                      //       <p className="text-[10px] uppercase tracking-[0.15em] text-luxury-muted mb-1">
                      //         {product.material}
                      //       </p>
                      //     )}
                      //     <h3 className="font-display text-charcoal text-sm sm:text-base font-medium mb-1.5 sm:mb-2 group-hover:text-gold transition-colors duration-300 leading-snug">
                      //       {product.name}
                      //     </h3>
                      //     <div className="flex items-center gap-2 flex-wrap">
                      //       <p
                      //         className="text-charcoal font-semibold text-sm"
                      //         suppressHydrationWarning
                      //       >
                      //         {product.price.toLocaleString('vi-VN')}₫
                      //       </p>
                      //       {product.originalPrice && product.originalPrice > product.price && (
                      //         <p
                      //           className="text-luxury-muted text-xs sm:text-sm line-through"
                      //           suppressHydrationWarning
                      //         >
                      //           {product.originalPrice.toLocaleString('vi-VN')}₫
                      //         </p>
                      //       )}
                      //     </div>
                      //   </div>
                      // </Link>
                      <DynamicProductCard key={product.id} product={product} index={index} />
                    ))}
              </div>
            )}

            {/* List view */}
            {viewMode === 'list' && (
              <div className="space-y-3">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => <ProductListSkeleton key={i} />)
                  : products.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="flex gap-4 sm:gap-6 p-3 sm:p-4 border border-luxury-border hover:border-gold/40 transition-colors group"
                      >
                        <div className="relative w-20 sm:w-24 h-28 sm:h-32 flex-shrink-0 overflow-hidden bg-luxury-warm">
                          <AppImage
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                          <div>
                            {product.material && (
                              <p className="text-[10px] uppercase tracking-[0.15em] text-luxury-muted mb-1">
                                {product.material}
                              </p>
                            )}
                            <h3 className="font-display text-charcoal text-base sm:text-lg font-medium mb-1 group-hover:text-gold transition-colors leading-snug">
                              {product.name}
                            </h3>
                            {product.is_new && (
                              <span className="inline-block text-[10px] uppercase tracking-[0.15em] font-bold text-white bg-gold px-2 py-0.5 mb-2">
                                {t('product_listing.new_badge')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <p
                                className="text-charcoal font-semibold text-sm"
                                suppressHydrationWarning
                              >
                                {product.price.toLocaleString('vi-VN')}₫
                              </p>
                              {product.original_price && product.original_price > product.price && (
                                <p
                                  className="text-luxury-muted text-sm line-through"
                                  suppressHydrationWarning
                                >
                                  {product.original_price.toLocaleString('vi-VN')}₫
                                </p>
                              )}
                            </div>
                            {!product.stock_quantity && (
                              <span className="text-xs uppercase tracking-widest text-luxury-muted font-semibold">
                                {t('product_listing.sold_out')}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
              </div>
            )}

            {/* ── Pagination Bar ─────────────────────────────────────────── */}
            {!isLoading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-10 sm:mt-12 mb-4 flex-wrap">
                {/* Previous */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-charcoal-light border border-luxury-border hover:border-gold hover:text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-luxury-border disabled:hover:text-charcoal-light min-h-[44px]"
                  aria-label="Trang trước"
                >
                  <Icon name="ChevronLeftIcon" size={14} />
                  <span className="hidden sm:inline">Trước</span>
                </button>

                {/* Page numbers */}
                {getPageNumbers().map((page, idx) =>
                  page === '...' ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-2 sm:px-3 py-2 text-xs text-luxury-muted select-none"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => goToPage(page as number)}
                      className={`min-w-[44px] px-2 sm:px-3 py-2 text-xs font-medium border transition-colors min-h-[44px] ${
                        currentPage === page
                          ? 'bg-gold border-gold text-white font-semibold'
                          : 'border-luxury-border text-charcoal-light hover:border-gold hover:text-gold'
                      }`}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-charcoal-light border border-luxury-border hover:border-gold hover:text-gold transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-luxury-border disabled:hover:text-charcoal-light min-h-[44px]"
                  aria-label="Trang sau"
                >
                  <span className="hidden sm:inline">Sau</span>
                  <Icon name="ChevronRightIcon" size={14} />
                </button>
              </div>
            )}

            {/* Page info */}
            {!isLoading && totalPages > 1 && (
              <p className="text-center text-xs text-luxury-muted mb-6">
                Trang {currentPage} / {totalPages} &nbsp;·&nbsp; {totalCount} sản phẩm
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ProductListingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-luxury-white flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProductListingContent />
    </Suspense>
  );
}
