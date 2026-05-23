'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { createClient } from '@/lib/supabase/client';
import { DynamicProductCard } from '@/app/homepage/page';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  original_price?: number;
  image_url?: string;
  gallery_urls?: string[];
  material?: string;
  is_new?: boolean;
  is_best_seller?: boolean;
  stock_quantity?: number;
  category_id?: string;
  tags?: string[];
  categories?: { name: string; slug: string };
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  is_new?: boolean;
  image_url?: string;
  material?: string;
  slug: string;
}

const SIZES = ['6', '7', '8', '9', '10'];
const MATERIALS = ['Gold', 'Silver', 'White Gold'];

// Helper: parse materials from product.material string (comma-separated or single)
function parseMaterials(material?: string): string[] {
  if (!material) return MATERIALS;
  const parts = material
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : MATERIALS;
}

// Helper: check if product is a ring based on category slug or name
function isRingProduct(product: ProductDetail): boolean {
  const slug = product.categories?.slug?.toLowerCase() || '';
  const name = product.categories?.name?.toLowerCase() || '';
  return (
    slug.includes('ring') ||
    slug.includes('nhan') ||
    name.includes('ring') ||
    name.includes('nhẫn') ||
    name.includes('nhan')
  );
}

// ─── Size Guide Modal ─────────────────────────────────────────────────────────

const SizeGuideModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-charcoal/50" onClick={onClose} />
      <div className="relative bg-luxury-white w-full max-w-lg shadow-2xl animate-fade-up z-10">
        <div className="flex items-center justify-between px-8 py-6 border-b border-luxury-border">
          <h2 className="font-display text-2xl font-light text-charcoal">
            {t('product_detail.ring_size_guide')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-luxury-muted hover:text-gold transition-colors"
          >
            <Icon name="XMarkIcon" size={20} />
          </button>
        </div>
        <div className="px-8 py-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-luxury-border">
                <th className="text-left py-2 font-semibold text-charcoal text-xs uppercase tracking-wide">
                  {t('product_detail.us_size')}
                </th>
                <th className="text-left py-2 font-semibold text-charcoal text-xs uppercase tracking-wide">
                  {t('product_detail.diameter')}
                </th>
                <th className="text-left py-2 font-semibold text-charcoal text-xs uppercase tracking-wide">
                  {t('product_detail.circumference')}
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['6', '16.5', '51.9'],
                ['7', '17.3', '54.4'],
                ['8', '18.2', '57.2'],
                ['9', '18.9', '59.5'],
                ['10', '19.8', '62.1'],
              ].map(([s, d, c]) => (
                <tr
                  key={s}
                  className="border-b border-luxury-border/50 hover:bg-luxury-warm transition-colors"
                >
                  <td className="py-2.5 text-charcoal font-medium">{s}</td>
                  <td className="py-2.5 text-charcoal-light">{d}</td>
                  <td className="py-2.5 text-charcoal-light">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { addToCart, openCart, cartCount } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'care' | 'shipping'>('description');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isOpenMobileModal, setIsOpenMobileModal] = useState(false);

  const productId = params?.id as string;
  console.log(selectedImage);

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .select('*, categories(name, slug)')
          .eq('id', productId)
          .single();

        if (error || !data) {
          router.push('/product-listing');
          return;
        }
        setProduct(data);

        // Auto-select material if only one option
        const materials = parseMaterials(data.material);
        if (materials.length === 1) {
          setSelectedMaterial(materials[0]);
        }

        // Fetch related products from same category
        if (data.category_id) {
          const { data: related } = await supabase
            .from('products')
            .select('id, name, price, original_price, is_new, image_url, material, slug')
            .eq('category_id', data.category_id)
            .eq('is_active', true)
            .neq('id', productId)
            .limit(4);
          if (related) setRelatedProducts(related);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, router]);

  const isRing = product ? isRingProduct(product) : false;
  const productMaterials = product ? parseMaterials(product.material) : MATERIALS;
  const hasMaterialOptions = productMaterials.length > 1;
  const canAddToCart = (!isRing || !!selectedSize) && (!hasMaterialOptions || !!selectedMaterial);

  const handleAddToCart = () => {
    if (!product) return;
    if (!canAddToCart) return;
    addToCart({
      productId: product.id,
      name: product.name,
      material: selectedMaterial || product.material || '',
      materialOptions: productMaterials,
      price: Number(product.price),
      image: allImages[0] || '',
      size: selectedSize,
      quantity,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleBuyNow = () => {
    if (!canAddToCart) return;
    handleAddToCart();
    router.push('/shopping-cart-checkout');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-white">
        <Header cartCount={cartCount} onCartOpen={openCart} />
        <main className="pt-20">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
              <div className="aspect-[3/4] bg-luxury-warm" />
              <div className="space-y-4">
                <div className="h-4 bg-luxury-warm rounded w-1/3" />
                <div className="h-8 bg-luxury-warm rounded w-3/4" />
                <div className="h-6 bg-luxury-warm rounded w-1/4" />
                <div className="h-24 bg-luxury-warm rounded" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  const allImages = [product.image_url, ...(product.gallery_urls || [])].filter(
    Boolean
  ) as string[];
  console.log(allImages);

  if (allImages.length === 0) {
    allImages.push('https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=90');
  }

  const discountPct =
    product.original_price && Number(product.original_price) > Number(product.price)
      ? Math.round(
          ((Number(product.original_price) - Number(product.price)) /
            Number(product.original_price)) *
            100
        )
      : null;

  const categoryName = product.categories?.name || '';

  return (
    <div className="min-h-screen bg-luxury-white">
      <Header cartCount={cartCount} onCartOpen={openCart} />
      <CartDrawer />

      {sizeGuideOpen && <SizeGuideModal onClose={() => setSizeGuideOpen(false)} />}

      <main className="pt-14 sm:pt-16 md:pt-20">
        {/* Breadcrumb */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-3 sm:py-4">
          <nav className="flex items-center gap-1.5 sm:gap-2 text-xs text-luxury-muted flex-wrap">
            <Link href="/homepage" className="hover:text-gold transition-colors">
              {t('product_detail.home')}
            </Link>
            <Icon name="ChevronRightIcon" size={10} />
            <Link href="/product-listing" className="hover:text-gold transition-colors">
              {t('product_detail.collections')}
            </Link>
            {categoryName && (
              <>
                <Icon name="ChevronRightIcon" size={10} />
                <Link
                  href={`/product-listing?category=${product.categories?.slug || ''}`}
                  className="hover:text-gold transition-colors"
                >
                  {categoryName}
                </Link>
              </>
            )}
            <Icon name="ChevronRightIcon" size={10} />
            <span className="text-charcoal truncate max-w-[150px] sm:max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>

        {/* Product Detail */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 pb-12 sm:pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-20">
            {/* Left: Gallery */}
            <div className="flex gap-3 sm:gap-4">
              {/* Thumbnails — hidden on mobile, shown on sm+ */}
              <div className="hidden sm:flex flex-col gap-3 flex-shrink-0">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-14 sm:w-16 h-18 sm:h-20 overflow-hidden border-2 transition-all duration-200 min-h-[44px] ${
                      selectedImage === i
                        ? 'border-gold'
                        : 'border-transparent hover:border-luxury-border-dark'
                    }`}
                  >
                    <AppImage
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      fill
                      className="object-cover"
                      unoptimized={true}
                    />
                  </button>
                ))}
              </div>

              {/* Main image with zoom */}
              <div className="flex-1 flex flex-col gap-3">
                {/* Khung chứa ảnh lớn */}
                <div
                  className="relative aspect-[3/4] overflow-hidden bg-luxury-warm cursor-crosshair"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  onClick={() => {
                    if (window.innerWidth < 640) {
                      setIsOpenMobileModal(true);
                    }
                  }}
                >
                  <AppImage
                    src={allImages[selectedImage] || allImages[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                    key={allImages[selectedImage]}
                    style={
                      isZoomed
                        ? {
                            transform: 'scale(2)',
                            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                            transition: 'transform 0.1s ease',
                          }
                        : { transition: 'transform 0.3s ease' }
                    }
                    unoptimized={true}
                  />

                  {product.is_new && (
                    <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.15em] font-bold text-charcoal bg-gold px-2 py-0.5 z-10">
                      {t('product_detail.new_badge')}
                    </span>
                  )}

                  {discountPct && (
                    <span className="absolute top-3 right-3 text-[10px] uppercase tracking-[0.15em] font-bold text-white bg-red-600 px-2 py-0.5 z-10">
                      -{discountPct}%
                    </span>
                  )}

                  <div className="hidden md:block">
                    {/* Nút Mũi tên trái */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage((selectedImage - 1 + allImages.length) % allImages.length);
                      }}
                      onMouseEnter={(e) => {
                        e.stopPropagation(); // Chặn lan truyền sự kiện
                        setIsZoomed(false); // Ép ảnh trả về kích thước bình thường
                      }}
                      onMouseLeave={(e) => {
                        e.stopPropagation();
                        setIsZoomed(true); // Khi chuột rời nút bấm và về lại vùng ảnh thì bật zoom lại
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-luxury-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-luxury-white transition-colors z-10 min-w-[44px] min-h-[44px]"
                    >
                      <Icon name="ChevronLeftIcon" size={14} />
                    </button>

                    {/* Nút Mũi tên phải */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage((selectedImage + 1) % allImages.length);
                      }}
                      onMouseEnter={(e) => {
                        e.stopPropagation(); // Chặn lan truyền sự kiện
                        setIsZoomed(false); // Ép ảnh trả về kích thước bình thường
                      }}
                      onMouseLeave={(e) => {
                        e.stopPropagation();
                        setIsZoomed(true);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-luxury-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-luxury-white transition-colors z-10 min-w-[44px] min-h-[44px]"
                    >
                      <Icon name="ChevronRightIcon" size={14} />
                    </button>
                  </div>

                  <p className="absolute bottom-3 right-3 text-[10px] text-luxury-muted bg-luxury-white/80 px-2 py-1 z-10 hidden sm:block">
                    Hover to zoom
                  </p>
                </div>

                {/* Mobile thumbnail strip */}
                {allImages.length > 1 && (
                  <div className="flex gap-2 sm:hidden overflow-x-auto pb-1">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`relative w-14 h-18 flex-shrink-0 overflow-hidden border-2 transition-all duration-200 min-w-[56px] min-h-[44px] ${
                          selectedImage === i ? 'border-gold' : 'border-transparent'
                        }`}
                      >
                        <AppImage
                          src={img}
                          alt={`${product.name} view ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* MOBILE MODAL TAB IMAGE */}
                {isOpenMobileModal && (
                  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-white px-4 py-6 sm:hidden animate-fade-in">
                    <div className="w-full flex justify-end">
                      <button
                        onClick={() => setIsOpenMobileModal(false)}
                        className="p-2 text-charcoal active:opacity-50"
                        aria-label="Đóng"
                      >
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>

                    <div className="relative flex-1 flex items-center justify-center w-full max-h-[75vh]">
                      <AppImage
                        src={allImages[selectedImage] || allImages[0]}
                        alt={product.name}
                        className="max-w-full max-h-full object-contain select-none"
                        unoptimized={true}
                      />
                    </div>

                    <div className="w-full flex justify-center gap-20 pb-4">
                      <button
                        onClick={() =>
                          setSelectedImage(
                            (selectedImage - 1 + allImages.length) % allImages.length
                          )
                        }
                        className="p-3 text-charcoal active:opacity-40"
                      >
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setSelectedImage((selectedImage + 1) % allImages.length)}
                        className="p-3 text-charcoal active:opacity-40"
                      >
                        <svg
                          width="32"
                          height="32"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col">
              {categoryName && (
                <p className="text-[10px] uppercase tracking-[0.3em] text-gold-dark font-semibold mb-2">
                  {categoryName}
                </p>
              )}

              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-light text-charcoal mb-3 sm:mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-luxury-border">
                <div className="flex items-center gap-3 flex-wrap">
                  <p
                    className="text-2xl sm:text-3xl font-semibold text-charcoal"
                    suppressHydrationWarning
                  >
                    {Number(product.price).toLocaleString('vi-VN')}₫
                  </p>
                  {product.original_price &&
                    Number(product.original_price) > Number(product.price) && (
                      <p
                        className="text-base sm:text-lg text-luxury-muted line-through"
                        suppressHydrationWarning
                      >
                        {Number(product.original_price).toLocaleString('vi-VN')}₫
                      </p>
                    )}
                </div>
                <p className="text-xs text-luxury-muted mt-1">
                  Miễn phí vận chuyển cho đơn hàng trên 5.000.000₫ · Đổi trả trong 30 ngày
                </p>
              </div>

              {/* Material Selection */}
              <div className="mb-5 sm:mb-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-light mb-3">
                  Chất liệu{' '}
                  {selectedMaterial && (
                    <span className="text-charcoal normal-case font-normal">
                      — {selectedMaterial}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {productMaterials.map((mat) => (
                    <button
                      key={mat}
                      onClick={() => setSelectedMaterial(mat)}
                      className={`px-4 py-2.5 border text-sm font-medium transition-all duration-200 min-h-[44px] ${
                        selectedMaterial === mat
                          ? 'bg-charcoal border-charcoal text-white'
                          : 'border-luxury-border text-charcoal-light hover:border-gold hover:text-gold'
                      }`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
                {hasMaterialOptions && !selectedMaterial && (
                  <p className="text-xs text-red-500 mt-2 font-medium">
                    Vui lòng chọn chất liệu trước khi thêm vào giỏ hàng
                  </p>
                )}
              </div>

              {/* Size Selection — only for rings */}
              {isRing && (
                <div className="mb-6 sm:mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-light">
                      Kích cỡ nhẫn{' '}
                      {selectedSize && (
                        <span className="text-charcoal normal-case font-normal">
                          — {selectedSize}
                        </span>
                      )}
                    </p>
                    <button
                      onClick={() => setSizeGuideOpen(true)}
                      className="text-xs text-gold hover:text-gold-dark transition-colors font-medium flex items-center gap-1 min-h-[44px]"
                    >
                      <Icon name="InformationCircleIcon" size={12} />
                      {t('product_detail.size_guide')}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-11 h-11 border text-sm font-medium transition-all duration-200 min-w-[44px] min-h-[44px] ${
                          selectedSize === size
                            ? 'bg-charcoal border-charcoal text-white'
                            : 'border-luxury-border text-charcoal-light hover:border-gold hover:text-gold'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {!selectedSize && (
                    <p className="text-xs text-red-500 mt-2 font-medium">
                      Vui lòng chọn kích cỡ nhẫn trước khi thêm vào giỏ hàng
                    </p>
                  )}
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6 sm:mb-8">
                <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-light mb-3">
                  Số lượng
                </p>
                <div className="flex items-center border border-luxury-border w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 flex items-center justify-center text-charcoal-light hover:text-gold hover:bg-luxury-warm transition-colors min-w-[44px] min-h-[44px]"
                  >
                    <Icon name="MinusIcon" size={14} />
                  </button>
                  <span className="w-12 text-center text-sm font-medium text-charcoal">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-11 h-11 flex items-center justify-center text-charcoal-light hover:text-gold hover:bg-luxury-warm transition-colors min-w-[44px] min-h-[44px]"
                  >
                    <Icon name="PlusIcon" size={14} />
                  </button>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex gap-3 mb-3 sm:mb-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  className={`flex-1 py-4 text-sm font-semibold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 min-h-[52px] ${
                    !canAddToCart
                      ? 'bg-luxury-warm border border-luxury-border text-luxury-muted cursor-not-allowed'
                      : addedToCart
                        ? 'bg-green-600 text-white'
                        : 'bg-gold text-white hover:bg-gold-dark hover:text-white'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Icon name="CheckIcon" size={16} /> {t('product_detail.added_to_cart')}
                    </>
                  ) : (
                    <>
                      <Icon name="ShoppingBagIcon" size={16} /> {t('product_detail.add_to_cart')}
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={!canAddToCart}
                className={`w-full py-4 border-2 text-sm font-semibold tracking-wide transition-all duration-300 mb-6 sm:mb-8 min-h-[52px] ${
                  !canAddToCart
                    ? 'border-luxury-border text-luxury-muted cursor-not-allowed'
                    : 'border-charcoal text-charcoal hover:bg-charcoal hover:text-white'
                }`}
              >
                Mua ngay
              </button>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 py-5 sm:py-6 border-t border-luxury-border">
                {[
                  { icon: 'ShieldCheckIcon', label: 'Chứng nhận GIA' },
                  { icon: 'TruckIcon', label: 'Miễn phí ship' },
                  { icon: 'ArrowPathIcon', label: 'Đổi trả 30 ngày' },
                ].map((badge) => (
                  <div key={badge.label} className="flex flex-col items-center gap-1.5 text-center">
                    <Icon name={badge.icon as any} size={18} className="text-gold" />
                    <span className="text-[10px] text-luxury-muted tracking-wide leading-tight">
                      {badge.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-12 sm:mt-16 border-t border-luxury-border">
            <div className="flex gap-0 border-b border-luxury-border overflow-x-auto">
              {(['description', 'care', 'shipping'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 sm:px-8 py-4 text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-200 border-b-2 -mb-px whitespace-nowrap min-h-[48px] ${
                    activeTab === tab
                      ? 'border-gold text-gold'
                      : 'border-transparent text-luxury-muted hover:text-charcoal'
                  }`}
                >
                  {t(`product_detail.${tab}` as any) || tab}
                </button>
              ))}
            </div>
            <div className="py-8 sm:py-10 max-w-2xl">
              {activeTab === 'description' && (
                <p
                  className="text-charcoal-light leading-relaxed text-sm sm:text-base"
                  dangerouslySetInnerHTML={{ __html: product.description || '' }}
                ></p>
              )}
              {activeTab === 'care' && (
                <div className="space-y-4">
                  {[
                    {
                      title: 'Vệ sinh',
                      desc: 'Lau sạch trang sức bằng vải mềm và dung dịch xà phòng nhẹ. Tráng sạch và lau khô.',
                    },
                    {
                      title: 'Bảo quản',
                      desc: 'Bảo quản từng món riêng biệt trong túi LuxeJewel để tránh trầy xước.',
                    },
                    {
                      title: 'Đeo trang sức',
                      desc: 'Tháo trang sức trước khi bơi, tập thể dục hoặc dùng mỹ phẩm.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <div className="w-1 bg-gold/30 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm text-charcoal mb-1">{item.title}</p>
                        <p className="text-sm text-charcoal-light leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'shipping' && (
                <div className="space-y-6">
                  {[
                    {
                      icon: 'TruckIcon',
                      title: 'Miễn phí vận chuyển',
                      desc: 'Miễn phí cho đơn hàng trên 5.000.000₫. Giao hàng trong 3-5 ngày làm việc.',
                    },
                    {
                      icon: 'BoltIcon',
                      title: 'Giao hàng nhanh',
                      desc: 'Phí 50.000₫ cho giao hàng trong ngày. Đặt trước 14h để nhận trong ngày.',
                    },
                    {
                      icon: 'ArrowPathIcon',
                      title: 'Đổi trả 30 ngày',
                      desc: 'Sản phẩm chưa sử dụng trong bao bì gốc được hoàn tiền đầy đủ trong 30 ngày.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-4">
                      <Icon
                        name={item.icon as any}
                        size={20}
                        className="text-gold flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="font-semibold text-sm text-charcoal mb-1">{item.title}</p>
                        <p className="text-sm text-charcoal-light leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-luxury-border">
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-light text-charcoal">
                  {t('product_detail.related_products')}
                </h2>
                <Link
                  href="/product-listing"
                  className="text-sm text-charcoal-light hover:text-gold transition-colors flex items-center gap-1 min-h-[44px]"
                >
                  {t('product_detail.continue_shopping')} <Icon name="ArrowRightIcon" size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {relatedProducts.map((rp, i) => (
                  // <Link key={rp.id} href={`/product/${rp.id}`} className="product-card group">
                  //   <div className="relative aspect-[3/4] overflow-hidden bg-luxury-warm mb-3">
                  //     <AppImage
                  //       src={
                  //         rp.image_url ||
                  //         'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=85'
                  //       }
                  //       alt={rp.name}
                  //       fill
                  //       className="object-cover product-card-img"
                  //     />
                  //   </div>
                  //   {rp.material && (
                  //     <p className="text-[10px] uppercase tracking-[0.15em] text-luxury-muted mb-1">
                  //       {rp.material}
                  //     </p>
                  //   )}
                  //   <h3 className="font-display text-sm font-medium text-charcoal mb-1 group-hover:text-gold transition-colors leading-snug">
                  //     {rp.name}
                  //   </h3>
                  //   <p className="text-sm font-semibold text-charcoal" suppressHydrationWarning>
                  //     {Number(rp.price).toLocaleString('vi-VN')}₫
                  //   </p>
                  // </Link>
                  <DynamicProductCard key={rp.id} product={rp} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
