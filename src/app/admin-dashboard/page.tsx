'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppImage from '@/components/ui/AppImage';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import TiptapEditor from '@/components/TiptapEditor';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SupabaseOrder {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  total_amount: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_city: string;
  shipping_address: string | null;
  created_at: string;
  notes: string | null;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  size: string | null;
  material: string | null;
}

interface DBProduct {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  price: number;
  original_price: number;
  stock_quantity: number;
  is_active: boolean;
  image_url: string | null;
  category_id: string | null;
  categories: { name: string } | null;
  is_new: boolean;
  is_best_seller: boolean;
}

interface DBCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface CustomerProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  orderCount: number;
  totalSpend: number;
  lastOrderAt: string | null;
}

interface EditProductForm {
  name: string;
  categoryId: string;
  price: string;
  original_price: string;
  stock: string;
  material: string;
  imageUrl: string;
  imagePreview: string;
  galleryUrls: string[];
  galleryPreviews: string[];
  tags: string[];
  description: string;
  isNew: boolean;
  isBestSeller: boolean;
}

interface CategoryForm {
  name: string;
  description: string;
  imageUrl: string;
  imagePreview: string;
  sortOrder: string;
  isActive: boolean;
}

interface ChartDataPoint {
  month: string;
  revenue: number;
  orders: number;
}

interface CategoryDataPoint {
  name: string;
  value: number;
  color: string;
}

interface KPIData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  pendingPayments: number;
  ytdRevenue: number;
  ytdOrders: number;
}

const PRODUCT_NEW_INITIAL_STATE = {
  name: '',
  categoryId: '',
  price: '',
  original_price: '',
  stock: '',
  material: '',
  tags: [] as string[],
  description: '',
  isNew: false,
  isBestSeller: false,
};

const PRODUCT_EDIT_INITIAL_STATE: EditProductForm = {
  ...PRODUCT_NEW_INITIAL_STATE,
  imageUrl: '',
  imagePreview: '',
  galleryUrls: [],
  galleryPreviews: [],
};

type AdminSection = 'overview' | 'products' | 'orders' | 'analytics' | 'customers' | 'categories';

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    active: 'bg-green-50 text-green-700 border-green-200',
    low_stock: 'bg-amber-50 text-amber-700 border-amber-200',
    out_of_stock: 'bg-red-50 text-red-700 border-red-200',
    pending: 'bg-blue-50 text-blue-700 border-blue-200',
    awaiting_confirmation: 'bg-amber-50 text-amber-700 border-amber-200',
    paid: 'bg-green-50 text-green-700 border-green-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    shipped: 'bg-purple-50 text-purple-700 border-purple-200',
    delivered: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
  };
  const labels: Record<string, string> = {
    active: 'Active',
    low_stock: 'Low Stock',
    out_of_stock: 'Out of Stock',
    pending: 'Pending',
    awaiting_confirmation: 'Chờ xác nhận',
    paid: 'Đã thanh toán',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border rounded-sm ${styles[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}
    >
      {labels[status] || status}
    </span>
  );
};

const KPICard: React.FC<{
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
  loading?: boolean;
}> = ({ title, value, change, positive, icon, loading }) => (
  <div className="bg-white border border-gray-100 p-5 rounded-sm hover:shadow-product transition-shadow duration-300">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 bg-gold/10 rounded-sm flex items-center justify-center">
        <Icon name={icon as any} size={18} className="text-gold" />
      </div>
      <span
        className={`text-xs font-semibold flex items-center gap-1 ${positive ? 'text-green-600' : 'text-red-500'}`}
      >
        <Icon name={positive ? 'ArrowTrendingUpIcon' : 'ArrowTrendingDownIcon'} size={12} />
        {change}
      </span>
    </div>
    {loading ? (
      <div className="h-8 w-24 bg-gray-100 animate-pulse rounded mb-1" />
    ) : (
      <p className="text-2xl font-bold text-charcoal mb-1 font-display">{value}</p>
    )}
    <p className="text-xs text-luxury-muted uppercase tracking-wide">{title}</p>
  </div>
);

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-charcoal text-white px-4 py-3 text-xs shadow-lg">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}:{' '}
            {p.name === 'revenue' ? `${Number(p.value).toLocaleString('vi-VN')}đ` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = ['#D4AF37', '#B8940F', '#E8D080', '#8A7020', '#C0A030', '#A08010'];

function getProductStatus(product: DBProduct): string {
  if (!product.is_active) return 'out_of_stock';
  if (product.stock_quantity === 0) return 'out_of_stock';
  if (product.stock_quantity <= 3) return 'low_stock';
  return 'active';
}

function getLast6MonthLabels(): { label: string; year: number; month: number }[] {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      label: `Th ${d.getMonth() + 1}`,
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    });
  }
  return result;
}

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') +
    '-' +
    Date.now()
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editProductForm, setEditProductForm] = useState<EditProductForm>(
    PRODUCT_EDIT_INITIAL_STATE
  );
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const [uploadingEditGallery, setUploadingEditGallery] = useState(false);
  const [savingEditProduct, setSavingEditProduct] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editGalleryInputRef = useRef<HTMLInputElement>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState(PRODUCT_NEW_INITIAL_STATE);
  const [deleteConfirmProductId, setDeleteConfirmProductId] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const pendingEditUploads = useRef<string[]>([]);

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newProductImageUrl, setNewProductImageUrl] = useState<string>('');
  const [newProductImagePreview, setNewProductImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [editTagInput, setEditTagInput] = useState('');

  // Gallery images upload state
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // ── Categories state ──
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>({
    name: '',
    description: '',
    imageUrl: '',
    imagePreview: '',
    sortOrder: '0',
    isActive: true,
  });
  const [savingCategory, setSavingCategory] = useState(false);
  const [deleteConfirmCategoryId, setDeleteConfirmCategoryId] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false);
  const categoryImageInputRef = useRef<HTMLInputElement>(null);

  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  // Redirect non-admins
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace('/homepage');
    }
  }, [user, loading, isAdmin, router]);

  // ── Supabase orders state ──
  const [orders, setOrders] = useState<SupabaseOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loadingItems, setLoadingItems] = useState<string | null>(null);
  const [newOrderNotification, setNewOrderNotification] = useState<SupabaseOrder | null>(null);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const isInitialLoad = useRef(true);

  // ── Products state ──
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // ── Analytics / chart state ──
  const [salesData, setSalesData] = useState<ChartDataPoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryDataPoint[]>([]);
  const [kpiData, setKpiData] = useState<KPIData>({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    pendingPayments: 0,
    ytdRevenue: 0,
    ytdOrders: 0,
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // ── Customers state ──
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);

  // ── Fetch categories ──
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, image_url, is_active, sort_order, created_at')
      .order('sort_order', { ascending: true });
    if (!error && data) {
      setCategories(data as DBCategory[]);
    }
    setCategoriesLoading(false);
  }, []);

  // ── Fetch orders ──
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select(
        'id, order_number, status, payment_method, total_amount, notes, shipping_name, shipping_phone, shipping_city, shipping_address, created_at'
      )
      .order('created_at', { ascending: false })
      .limit(200);

    if (!error && data) {
      setOrders(data);
    }
    setOrdersLoading(false);
  }, []);

  // ── Fetch products ──
  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select(
        'id, name, sku, price, original_price, stock_quantity, is_active, is_best_seller, is_new, image_url, category_id, categories(name)'
      )
      .order('created_at', { ascending: false })
      .limit(200);

    if (!error && data) {
      const sorted = [...(data as unknown as DBProduct[])].sort((a, b) => {
        const stockPriority = (p: DBProduct) => {
          if (p.stock_quantity === 0) return 0;
          if (p.stock_quantity <= 3) return 1;
          return 2;
        };
        return stockPriority(a) - stockPriority(b);
      });
      setProducts(sorted);
    }
    setProductsLoading(false);
  }, []);

  // ── Fetch customers ──
  const fetchCustomers = useCallback(async () => {
    setCustomersLoading(true);
    const supabase = createClient();

    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, phone, avatar_url, created_at')
      .order('created_at', { ascending: false })
      .limit(500);

    if (profilesError || !profiles) {
      setCustomersLoading(false);
      return;
    }

    const { data: allOrders } = await supabase
      .from('orders')
      .select('user_id, total_amount, created_at')
      .not('user_id', 'is', null);

    const ordersByUser: Record<string, { count: number; total: number; lastAt: string | null }> =
      {};
    (allOrders || []).forEach((o: any) => {
      if (!o.user_id) return;
      if (!ordersByUser[o.user_id]) {
        ordersByUser[o.user_id] = { count: 0, total: 0, lastAt: null };
      }
      ordersByUser[o.user_id].count += 1;
      ordersByUser[o.user_id].total += Number(o.total_amount);
      const oDate = o.created_at;
      if (!ordersByUser[o.user_id].lastAt || oDate > ordersByUser[o.user_id].lastAt!) {
        ordersByUser[o.user_id].lastAt = oDate;
      }
    });

    const enriched: CustomerProfile[] = profiles.map((p: any) => ({
      id: p.id,
      email: p.email || '',
      full_name: p.full_name || '',
      phone: p.phone || null,
      avatar_url: p.avatar_url || null,
      created_at: p.created_at,
      orderCount: ordersByUser[p.id]?.count || 0,
      totalSpend: ordersByUser[p.id]?.total || 0,
      lastOrderAt: ordersByUser[p.id]?.lastAt || null,
    }));

    setCustomers(enriched);
    setCustomersLoading(false);
  }, []);

  // ── Compute analytics from orders + products ──
  const computeAnalytics = useCallback((allOrders: SupabaseOrder[], allProducts: DBProduct[]) => {
    setAnalyticsLoading(true);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const ytdStart = new Date(currentYear, 0, 1);

    const thisMonthOrders = allOrders.filter((o) => {
      const d = new Date(o.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalRevenue = thisMonthOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const totalOrders = thisMonthOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const pendingPayments = allOrders.filter(
      (o) => o.payment_method === 'bank_transfer' && o.status === 'awaiting_confirmation'
    ).length;

    const ytdOrders = allOrders.filter((o) => new Date(o.created_at) >= ytdStart);
    const ytdRevenue = ytdOrders.reduce((sum, o) => sum + Number(o.total_amount), 0);

    setKpiData({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      pendingPayments,
      ytdRevenue,
      ytdOrders: ytdOrders.length,
    });

    const months = getLast6MonthLabels();
    const chartData: ChartDataPoint[] = months.map(({ label, year, month }) => {
      const monthOrders = allOrders.filter((o) => {
        const d = new Date(o.created_at);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      });
      return {
        month: label,
        revenue: monthOrders.reduce((sum, o) => sum + Number(o.total_amount), 0),
        orders: monthOrders.length,
      };
    });
    setSalesData(chartData);

    const catMap: Record<string, number> = {};
    allProducts.forEach((p) => {
      const catName = p.categories?.name || 'Other';
      catMap[catName] = (catMap[catName] || 0) + 1;
    });
    const total = allProducts.length || 1;
    const catEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
    const catChartData: CategoryDataPoint[] = catEntries.map(([name, count], idx) => ({
      name,
      value: Math.round((count / total) * 100),
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    }));
    setCategoryData(catChartData);

    setAnalyticsLoading(false);
  }, []);

  // ── Initial data load ──
  useEffect(() => {
    if (!user || !isAdmin) return;

    const supabase = createClient();

    fetchOrders();
    fetchProducts();
    fetchCustomers();
    fetchCategories();

    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        if (isInitialLoad.current) return;
        const newOrder = payload.new as SupabaseOrder;
        setOrders((prev) => [newOrder, ...prev]);
        setNewOrderNotification(newOrder);
        setNewOrderCount((c) => c + 1);
        setTimeout(() => setNewOrderNotification(null), 8000);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    const timer = setTimeout(() => {
      isInitialLoad.current = false;
    }, 3000);

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin, fetchOrders, fetchProducts, fetchCustomers, fetchCategories]);

  useEffect(() => {
    if (!ordersLoading && !productsLoading) {
      computeAnalytics(orders, products);
    }
  }, [orders, products, ordersLoading, productsLoading, computeAnalytics]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleConfirmPayment = async (orderId: string) => {
    setConfirmingOrderId(orderId);
    const supabase = createClient();

    const { error } = await supabase
      .from('orders')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      showToast('Lỗi: ' + error.message);
    } else {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'paid' } : o)));
      showToast('✅ Đã xác nhận thanh toán!');
    }
    setConfirmingOrderId(null);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (!error) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    }
  };

  const handleToggleOrderItems = async (orderId: string) => {
    if (selectedOrderId === orderId) {
      setSelectedOrderId(null);
      return;
    }
    setSelectedOrderId(orderId);
    if (orderItems[orderId]) return;
    setLoadingItems(orderId);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('order_items')
      .select('id, product_name, product_image, quantity, unit_price, total_price, size, material')
      .eq('order_id', orderId)
      .order('id', { ascending: true });
    if (!error && data) {
      setOrderItems((prev) => ({ ...prev, [orderId]: data }));
    }
    setLoadingItems(null);
  };

  const handleImageUpload = async (
    file: File,
    bucket = 'product-images'
  ): Promise<string | null> => {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `upload-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) {
      showToast('Upload failed: ' + error.message);
      return null;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleGalleryFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);

    setUploadingGallery(true);
    const supabase = createClient();
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `gallery-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (!error && data) {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path);
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    setUploadingGallery(false);
    if (uploadedUrls.length > 0) {
      setGalleryUrls((prev) => [...prev, ...uploadedUrls]);
      showToast(`✅ ${uploadedUrls.length} gallery image(s) uploaded!`);
    }
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   const objectUrl = URL.createObjectURL(file);
  //   setEditProductForm((prev) => ({ ...prev, imagePreview: objectUrl }));

  //   const publicUrl = await handleEditImageUpload(file);
  //   if (publicUrl) {
  //     setEditProductForm((prev) => ({ ...prev, imageUrl: publicUrl, imagePreview: publicUrl }));
  //     showToast('✅ Image uploaded successfully!');
  //   } else {
  //     setEditProductForm((prev) => ({ ...prev, imagePreview: prev.imageUrl }));
  //   }
  // };

  const handleAddProductSave = async () => {
    if (!newProduct.name || !newProduct.price) {
      showToast('Please fill in product name and price.');
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.from('products').insert({
      name: newProduct.name,
      category_id: newProduct.categoryId || null,
      price: parseFloat(newProduct.price),
      original_price: parseFloat(newProduct.original_price),
      stock_quantity: parseInt(newProduct.stock) || 0,
      image_url: newProductImageUrl || null,
      gallery_urls: galleryUrls.length > 0 ? galleryUrls : null,
      is_active: true,
      material: newProduct.material || null,
      tags: newProduct.tags.length > 0 ? newProduct.tags : null,
      slug: slugify(newProduct.name),
      description: newProduct.description || null,
      is_new: newProduct.isNew,
      is_best_seller: newProduct.isBestSeller,
    });

    if (error) {
      showToast('Error saving product: ' + error.message);
    } else {
      showToast('✅ Product added successfully!');
      setShowAddProduct(false);
      setNewProduct(PRODUCT_NEW_INITIAL_STATE);
      setNewTagInput('');
      setNewProductImageUrl('');
      setNewProductImagePreview('');
      setGalleryUrls([]);
      setGalleryPreviews([]);
      fetchProducts();
    }
  };

  const handleOpenEditProduct = async (product: DBProduct) => {
    setEditingProduct(product.id);
    pendingEditUploads.current = [];
    const supabase = createClient();
    const { data } = await supabase
      .from('products')
      .select(
        'id, name, description, price, original_price, stock_quantity, image_url, gallery_urls, material, tags, is_new, is_best_seller, category_id, categories(name)'
      )
      .eq('id', product.id)
      .single();

    const fullProduct = data as any;

    setEditProductForm({
      name: fullProduct?.name || product.name,
      categoryId: fullProduct?.category_id || product.category_id || '',
      price: String(fullProduct?.price ?? product.price),
      original_price: String(fullProduct?.original_price ?? product.original_price ?? ''),
      stock: String(fullProduct?.stock_quantity ?? product.stock_quantity),
      material: fullProduct?.material || '',
      imageUrl: fullProduct?.image_url || product.image_url || '',
      imagePreview: fullProduct?.image_url || product.image_url || '',
      galleryUrls: fullProduct?.gallery_urls || [],
      galleryPreviews: fullProduct?.gallery_urls || [],
      tags: fullProduct?.tags || [],
      description: fullProduct?.description || product.description || '',
      isNew: fullProduct?.is_new || false,
      isBestSeller: fullProduct?.is_best_seller || false,
    });
    setEditTagInput('');
  };

  const handleEditImageUpload = async (file: File): Promise<string | null> => {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    setUploadingEditImage(true);
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    setUploadingEditImage(false);

    if (error) {
      showToast('Upload failed: ' + error.message);
      return null;
    }

    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path);

    pendingEditUploads.current = [...pendingEditUploads.current, urlData.publicUrl];

    return urlData.publicUrl;
  };

  const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setEditProductForm((prev) => ({ ...prev, imagePreview: objectUrl }));

    const publicUrl = await handleEditImageUpload(file);
    if (publicUrl) {
      setEditProductForm((prev) => ({ ...prev, imageUrl: publicUrl, imagePreview: publicUrl }));
      showToast('✅ Image uploaded successfully!');
    } else {
      setEditProductForm((prev) => ({ ...prev, imagePreview: prev.imageUrl }));
    }
  };

  const handleEditGalleryFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setEditProductForm((prev) => ({
      ...prev,
      galleryPreviews: [...prev.galleryPreviews, ...newPreviews],
    }));

    setUploadingEditGallery(true);
    const supabase = createClient();
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `gallery-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (!error && data) {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path);
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    setUploadingEditGallery(false);
    if (uploadedUrls.length > 0) {
      setEditProductForm((prev) => ({
        ...prev,
        galleryUrls: [...prev.galleryUrls, ...uploadedUrls],
      }));
      showToast(`✅ ${uploadedUrls.length} gallery image(s) uploaded!`);
    }
    if (editGalleryInputRef.current) editGalleryInputRef.current.value = '';
  };

  const handleRemoveEditGalleryImage = (index: number) => {
    setEditProductForm((prev) => ({
      ...prev,
      galleryUrls: prev.galleryUrls.filter((_, i) => i !== index),
      galleryPreviews: prev.galleryPreviews.filter((_, i) => i !== index),
    }));
  };

  const handleAddNewTag = () => {
    const tag = newTagInput.trim();
    if (tag && !newProduct.tags.includes(tag)) {
      setNewProduct((p) => ({ ...p, tags: [...p.tags, tag] }));
    }
    setNewTagInput('');
  };

  const handleRemoveNewTag = (tag: string) => {
    setNewProduct((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));
  };

  const handleAddEditTag = () => {
    const tag = editTagInput.trim();
    if (tag && !editProductForm.tags.includes(tag)) {
      setEditProductForm((p) => ({ ...p, tags: [...p.tags, tag] }));
    }
    setEditTagInput('');
  };

  const handleRemoveEditTag = (tag: string) => {
    setEditProductForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));
  };

  const handleEditProductSave = async () => {
    if (!editingProduct) return;
    if (!editProductForm.name || !editProductForm.price) {
      showToast('Please fill in product name and price.');
      return;
    }
    setSavingEditProduct(true);
    const supabase = createClient();

    const { error } = await supabase
      .from('products')
      .update({
        name: editProductForm.name,
        description: editProductForm.description || null,
        category_id: editProductForm.categoryId || null,
        price: parseFloat(editProductForm.price),
        original_price: parseFloat(editProductForm.original_price) || null,
        stock_quantity: parseInt(editProductForm.stock) || 0,
        image_url: editProductForm.imageUrl || null,
        gallery_urls: editProductForm.galleryUrls.length > 0 ? editProductForm.galleryUrls : null,
        material: editProductForm.material || null,
        tags: editProductForm.tags.length > 0 ? editProductForm.tags : null,
        updated_at: new Date().toISOString(),
        is_new: editProductForm.isNew,
        is_best_seller: editProductForm.isBestSeller,
      })
      .eq('id', editingProduct);

    setSavingEditProduct(false);
    if (error) {
      showToast('Error updating product: ' + error.message);
    } else {
      showToast('✅ Product updated successfully!');
      pendingEditUploads.current = [];
      setEditingProduct(null);
      fetchProducts();
    }
  };

  const handleCancelEdit = async () => {
    const toDelete = pendingEditUploads.current;
    pendingEditUploads.current = [];
    setEditingProduct(null);
    setEditProductForm(PRODUCT_EDIT_INITIAL_STATE);

    if (toDelete.length > 0) {
      const supabase = createClient();
      const paths = toDelete
        .map((url) => {
          const marker = '/product-images/';
          const idx = url.indexOf(marker);
          return idx !== -1 ? url.substring(idx + marker.length) : '';
        })
        .filter(Boolean);

      if (paths.length > 0) {
        await supabase.storage.from('product-images').remove(paths);
      }
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    setDeleteConfirmProductId(productId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmProductId) return;
    setDeletingProduct(true);
    const supabase = createClient();
    const { error } = await supabase.from('products').delete().eq('id', deleteConfirmProductId);
    if (error) {
      showToast('Error: ' + error.message);
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== deleteConfirmProductId));
      showToast('✅ Product deleted.');
    }
    setDeletingProduct(false);
    setDeleteConfirmProductId(null);
  };

  // ── Category CRUD handlers ──
  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      imageUrl: '',
      imagePreview: '',
      sortOrder: '0',
      isActive: true,
    });
  };

  const handleOpenAddCategory = () => {
    resetCategoryForm();
    setEditingCategory(null);
    setShowAddCategory(true);
  };

  const handleOpenEditCategory = (cat: DBCategory) => {
    setCategoryForm({
      name: cat.name,
      description: cat.description || '',
      imageUrl: cat.image_url || '',
      imagePreview: cat.image_url || '',
      sortOrder: String(cat.sort_order),
      isActive: cat.is_active,
    });
    setEditingCategory(cat.id);
    setShowAddCategory(true);
  };

  const handleCategoryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setCategoryForm((prev) => ({ ...prev, imagePreview: preview }));
    setUploadingCategoryImage(true);
    const url = await handleImageUpload(file);
    setUploadingCategoryImage(false);
    if (url) {
      setCategoryForm((prev) => ({ ...prev, imageUrl: url, imagePreview: url }));
      showToast('✅ Image uploaded!');
    } else {
      setCategoryForm((prev) => ({ ...prev, imagePreview: prev.imageUrl }));
    }
    if (categoryImageInputRef.current) categoryImageInputRef.current.value = '';
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      showToast('Category name is required.');
      return;
    }
    setSavingCategory(true);
    const supabase = createClient();

    const payload = {
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim() || null,
      image_url: categoryForm.imageUrl || null,
      sort_order: parseInt(categoryForm.sortOrder) || 0,
      is_active: categoryForm.isActive,
    };

    if (editingCategory) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editingCategory);
      if (error) {
        showToast('Error: ' + error.message);
      } else {
        showToast('✅ Category updated!');
        setShowAddCategory(false);
        setEditingCategory(null);
        fetchCategories();
      }
    } else {
      const slug =
        categoryForm.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '') +
        '-' +
        Date.now();
      const { error } = await supabase.from('categories').insert({ ...payload, slug });
      if (error) {
        showToast('Error: ' + error.message);
      } else {
        showToast('✅ Category created!');
        setShowAddCategory(false);
        fetchCategories();
      }
    }
    setSavingCategory(false);
  };

  const handleDeleteCategory = (catId: string) => {
    setDeleteConfirmCategoryId(catId);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deleteConfirmCategoryId) return;
    setDeletingCategory(true);
    const supabase = createClient();
    const { error } = await supabase.from('categories').delete().eq('id', deleteConfirmCategoryId);
    if (error) {
      showToast('Error: ' + error.message);
    } else {
      setCategories((prev) => prev.filter((c) => c.id !== deleteConfirmCategoryId));
      showToast('✅ Category deleted.');
    }
    setDeletingCategory(false);
    setDeleteConfirmCategoryId(null);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.shipping_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.order_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingBankOrders = orders.filter(
    (o) => o.payment_method === 'bank_transfer' && o.status === 'awaiting_confirmation'
  ).length;

  const lowStockCount = products.filter((p) => p.stock_quantity <= 3 && p.is_active).length;

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F8F6] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems: { id: AdminSection; label: string; icon: string; badge?: number }[] = [
    { id: 'overview', label: 'Tổng Quan', icon: 'HomeIcon' },
    { id: 'products', label: 'Sản Phẩm', icon: 'SquaresPlusIcon', badge: lowStockCount },
    { id: 'categories', label: 'Danh Mục', icon: 'TagIcon' },
    { id: 'orders', label: 'Đơn Hàng', icon: 'ShoppingBagIcon', badge: newOrderCount },
    { id: 'customers', label: 'Khách Hàng', icon: 'UsersIcon' },
    { id: 'analytics', label: 'Phân Tích Kinh Doanh', icon: 'ChartBarIcon' },
  ];

  // Shared sidebar nav content
  const SidebarNav = ({
    collapsed,
    onNavClick,
  }: {
    collapsed: boolean;
    onNavClick?: () => void;
  }) => (
    <>
      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveSection(item.id);
              if (item.id === 'orders') setNewOrderCount(0);
              onNavClick?.();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] font-semibold uppercase tracking-wide transition-all duration-200 relative ${
              activeSection === item.id
                ? 'text-white bg-white/5 border-l-2 border-gold'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5 border-l-2 border-transparent'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <div className="relative">
              <Icon name={item.icon as any} size={18} />
              {item.id === 'orders' && newOrderCount > 0 && collapsed && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
            </div>
            {!collapsed && (
              <>
                <span>{item.label}</span>
                {item.id === 'orders' && newOrderCount > 0 && (
                  <span className="ml-auto w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="ArrowTrendingUpIcon" size={12} />
                  </span>
                )}
                {item.id === 'orders' && newOrderCount === 0 && pendingBankOrders > 0 && (
                  <span className="ml-auto w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center">
                    {pendingBankOrders}
                  </span>
                )}
                {item.badge !== undefined && item.badge > 0 && item.id !== 'orders' && (
                  <span className="ml-auto w-5 h-5 bg-gold text-white rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </nav>
      <div className={`border-t border-white/10 p-4 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-charcoal font-bold text-xs">
              A
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Admin User</p>
              <p className="text-[10px] text-white/40">admin@luxejewel.com</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!collapsed)}
          className="flex-shrink-0 text-white/40 hover:text-white transition-colors text-xs"
        >
          <Icon name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'} size={14} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F8F8F6] flex">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-charcoal text-white px-5 py-3 shadow-lg text-sm font-medium animate-fade-up">
          {toastMessage}
        </div>
      )}

      {/* New Order Real-time Notification */}
      {newOrderNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-green-300 shadow-xl rounded-sm px-5 py-4 flex items-start gap-4 min-w-[320px] max-w-sm animate-fade-up">
          <div className="flex-shrink-0 w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-charcoal">🛍️ Đơn hàng mới!</p>
            <p className="text-xs text-gray-600 mt-0.5 truncate">
              <span className="font-semibold">{newOrderNotification.shipping_name}</span>
              {' · '}#{newOrderNotification.order_number}
            </p>
            <p className="text-xs text-gold font-semibold mt-0.5">
              {Number(newOrderNotification.total_amount).toLocaleString('vi-VN')}đ
            </p>
          </div>
          <button
            onClick={() => {
              setNewOrderNotification(null);
              setActiveSection('orders');
              setNewOrderCount(0);
            }}
            className="flex-shrink-0 text-gray-400 hover:text-charcoal transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-charcoal flex flex-col z-50 transition-transform duration-300 lg:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <AppLogo size={28} />
            <span className="font-display text-white text-base font-semibold tracking-wide">
              LuxeJewel
            </span>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="text-white/50 hover:text-white transition-colors p-1"
          >
            <Icon name="XMarkIcon" size={20} />
          </button>
        </div>
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-semibold">
            Admin Panel
          </p>
        </div>
        <SidebarNav collapsed={false} onNavClick={() => setMobileSidebarOpen(false)} />
      </aside>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={`hidden lg:flex flex-shrink-0 bg-charcoal flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-60'}`}
      >
        <div
          className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${sidebarCollapsed ? 'justify-center' : ''}`}
        >
          <AppLogo size={28} />
          {!sidebarCollapsed && (
            <span className="font-display text-white text-base font-semibold tracking-wide">
              LuxeJewel
            </span>
          )}
        </div>
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-[9px] uppercase tracking-[0.3em] text-white font-semibold">
              Admin Panel
            </p>
          </div>
        )}
        <SidebarNav collapsed={sidebarCollapsed} />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-white hover:text-gold transition-colors -ml-1"
              aria-label="Open menu"
            >
              <Icon name="Bars3Icon" size={22} />
            </button>
            <div>
              <h1 className="font-display text-lg md:text-xl font-semibold text-white capitalize">
                {activeSection === 'overview'
                  ? 'Tổng Quan'
                  : activeSection === 'products'
                    ? 'Sản Phẩm'
                    : activeSection === 'orders'
                      ? 'Đơn Hàng'
                      : activeSection === 'customers'
                        ? 'Khách Hàng'
                        : activeSection === 'categories'
                          ? 'Danh Mục'
                          : 'Phân Tích Kinh Doanh'}
              </h1>
              <p className="text-xs text-luxury-muted mt-0.5 hidden sm:block">
                {(() => {
                  const d = new Date();
                  return `Ngày ${String(d.getDate()).padStart(2, '0')} tháng ${String(d.getMonth() + 1).padStart(2, '0')}, ${d.getFullYear()}`;
                })()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative hidden sm:block">
              <Icon
                name="MagnifyingGlassIcon"
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-muted"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm dữ liệu..."
                className="pl-8 pr-4 py-2 text-xs border border-gray-200 bg-gray-50 focus:outline-none focus:border-gold transition-colors w-40 md:w-64"
              />
            </div>
            <button className="relative p-2 text-luxury-muted hover:text-gold transition-colors">
              <Icon name="BellIcon" size={18} />
              {pendingBankOrders > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
              )}
            </button>
            <Link
              href="/homepage"
              className="text-xs text-charcoal-light hover:text-gold transition-colors flex items-center gap-1"
            >
              <Icon name="ArrowTopRightOnSquareIcon" size={14} />
              <span className="hidden md:inline">Xem Cửa Hàng</span>
            </Link>
          </div>
        </header>

        {/* Mobile search bar */}
        <div className="sm:hidden bg-white border-b border-gray-100 px-4 pb-3">
          <div className="relative">
            <Icon
              name="MagnifyingGlassIcon"
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm dữ liệu..."
              className="w-full pl-8 pr-4 py-2 text-xs border border-gray-200 bg-gray-50 focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* ── OVERVIEW ── */}
          {activeSection === 'overview' && (
            <div>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <KPICard
                  title="TỔNG DOANH THU (Năm nay)"
                  value={
                    analyticsLoading ? '...' : `${kpiData.totalRevenue.toLocaleString('vi-VN')}đ`
                  }
                  change="Tính từ đầu năm"
                  positive={true}
                  icon="BanknotesIcon"
                  loading={analyticsLoading}
                />
                <KPICard
                  title="TỔNG ĐƠN HÀNG (Năm nay)"
                  value={analyticsLoading ? '...' : String(kpiData.totalOrders)}
                  change="Tính từ đầu năm"
                  positive={true}
                  icon="ShoppingBagIcon"
                  loading={analyticsLoading}
                />
                <KPICard
                  title="GIÁ TRỊ TRUNG BÌNH ĐƠN HÀNG"
                  value={
                    analyticsLoading
                      ? '...'
                      : `${Math.round(kpiData.avgOrderValue).toLocaleString('vi-VN')}đ`
                  }
                  change="Năm nay"
                  positive={true}
                  icon="CurrencyDollarIcon"
                  loading={analyticsLoading}
                />
                <KPICard
                  title="THANH TOÁN CHỜ"
                  value={analyticsLoading ? '...' : String(kpiData.pendingPayments)}
                  change="Chuyển khoản"
                  positive={kpiData.pendingPayments === 0}
                  icon="ExclamationTriangleIcon"
                  loading={analyticsLoading}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white border border-gray-100 p-4 md:p-6 rounded-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="font-semibold text-sm text-charcoal">Tổng Quan Doanh Thu</h2>
                      <p className="text-xs text-luxury-muted mt-0.5">6 tháng gần nhất</p>
                    </div>
                  </div>
                  {analyticsLoading ? (
                    <div className="h-[220px] flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={salesData}>
                        <defs>
                          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0EEE8" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11, fill: '#8A8A8A' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#8A8A8A' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `${(v / 1000000).toFixed(0)} Tr`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#D4AF37"
                          strokeWidth={2}
                          fill="url(#goldGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="bg-white border border-gray-100 p-4 md:p-6 rounded-sm">
                  <h2 className="font-semibold text-sm text-charcoal mb-1">Products by Category</h2>
                  <p className="text-xs text-luxury-muted mt-0.5">Current inventory</p>
                  {analyticsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-6 bg-gray-100 animate-pulse rounded" />
                      ))}
                    </div>
                  ) : categoryData.length === 0 ? (
                    <p className="text-xs text-luxury-muted">No products yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {categoryData.map((cat) => (
                        <div key={cat.name}>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-medium text-charcoal">{cat.name}</span>
                            <span className="text-xs font-bold text-charcoal">{cat.value}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${cat.value}%`, backgroundColor: cat.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Orders from Supabase */}
              <div className="bg-white border border-gray-100 rounded-sm">
                <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-sm text-charcoal">Recent Orders</h2>
                  <button
                    onClick={() => setActiveSection('orders')}
                    className="text-xs text-gold hover:text-gold-dark transition-colors font-medium"
                  >
                    View all
                  </button>
                </div>
                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-50">
                        {['Order', 'Customer', 'Total', 'Method', 'Status'].map((h) => (
                          <th
                            key={h}
                            className="text-left px-6 py-3 text-[10px] font-semibold uppercase tracking-wide text-luxury-muted"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ordersLoading ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-8 text-center text-xs text-luxury-muted"
                          >
                            Đang tải...
                          </td>
                        </tr>
                      ) : (
                        orders.slice(0, 5).map((order) => (
                          <tr
                            key={order.id}
                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="px-6 py-3.5 text-xs font-mono text-charcoal-light">
                              {order.order_number}
                            </td>
                            <td className="px-6 py-3.5">
                              <p className="text-xs font-semibold text-charcoal">
                                {order.shipping_name}
                              </p>
                              <p className="text-[10px] text-luxury-muted">
                                {order.shipping_phone}
                              </p>
                            </td>
                            <td className="px-6 py-3.5 text-xs font-bold text-charcoal">
                              {Number(order.total_amount).toLocaleString('vi-VN')}đ
                            </td>
                            <td className="px-6 py-3.5 text-xs text-charcoal-light">
                              {order.payment_method === 'bank_transfer' ? (
                                <span className="flex items-center gap-1">
                                  <Icon
                                    name="BuildingLibraryIcon"
                                    size={12}
                                    className="text-amber-600"
                                  />
                                  Chuyển khoản
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Icon name="TruckIcon" size={12} className="text-blue-600" />
                                  COD
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-3.5">
                              <StatusBadge status={order.status} />
                            </td>
                          </tr>
                        ))
                      )}
                      {!ordersLoading && orders.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-8 text-center text-xs text-luxury-muted"
                          >
                            Chưa có đơn hàng nào.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Mobile card list */}
                <div className="sm:hidden divide-y divide-gray-50">
                  {ordersLoading ? (
                    <div className="px-4 py-8 text-center text-xs text-luxury-muted">
                      Đang tải...
                    </div>
                  ) : (
                    orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="px-4 py-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-charcoal-light">
                            {order.order_number}
                          </span>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-xs font-semibold text-charcoal">{order.shipping_name}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-charcoal-light">
                            {order.shipping_phone}
                          </span>
                          <span className="text-xs font-bold text-charcoal">
                            {Number(order.total_amount).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  {!ordersLoading && orders.length === 0 && (
                    <div className="px-4 py-8 text-center text-xs text-luxury-muted">
                      Chưa có đơn hàng nào.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── PRODUCTS ── */}
          {activeSection === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-luxury-muted">
                  {productsLoading ? 'Loading...' : `${filteredProducts.length} products`}
                </p>
                <button
                  onClick={() => setShowAddProduct(!showAddProduct)}
                  className="flex items-center gap-2 px-4 py-2 bg-gold text-white text-xs font-semibold hover:bg-gold-light transition-colors"
                >
                  <Icon name="PlusIcon" size={14} />
                  Thêm Sản Phẩm
                </button>
              </div>

              {showAddProduct && (
                <div className="bg-white border border-gray-100 p-4 md:p-6 mb-6 rounded-sm">
                  <h3 className="font-semibold text-sm text-charcoal mb-4">Thêm sản phẩm mới</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-1">
                        Tên sản phẩm
                      </label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. Soleil Diamond Ring"
                        className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-1">
                        Danh mục
                      </label>
                      <select
                        value={newProduct.categoryId}
                        onChange={(e) =>
                          setNewProduct((p) => ({ ...p, categoryId: e.target.value }))
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gold transition-colors bg-white"
                      >
                        <option value="">— Chọn danh mục —</option>
                        {categories
                          .filter((c) => c.is_active)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-1">
                        Giá hiện tại (đ)
                      </label>
                      <input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-1">
                        Giá gốc (đ)
                      </label>
                      <input
                        type="number"
                        value={newProduct.original_price}
                        onChange={(e) =>
                          setNewProduct((p) => ({ ...p, original_price: e.target.value }))
                        }
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-1">
                        Số lượng
                      </label>
                      <input
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct((p) => ({ ...p, stock: e.target.value }))}
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-1">
                        Chất liệu
                      </label>
                      <input
                        type="text"
                        value={newProduct.material}
                        onChange={(e) => setNewProduct((p) => ({ ...p, material: e.target.value }))}
                        placeholder="e.g. 18K Gold, Sterling Silver"
                        className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                  </div>

                  {/* {Description} */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Mô tả sản phẩm</label>
                    <TiptapEditor
                      content={newProduct.description || ''}
                      onChange={(html) => setNewProduct((p) => ({ ...p, description: html }))}
                    />
                  </div>

                  {/* Tags */}
                  <div className="mb-4">
                    <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-1">
                      Thẻ sản phẩm
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNewTag();
                          }
                        }}
                        placeholder="e.g. diamond, luxury, gift"
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gold transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleAddNewTag}
                        className="px-3 py-2 bg-gold text-charcoal text-xs font-semibold hover:bg-gold-light transition-colors"
                      >
                        Thêm
                      </button>
                    </div>
                    {newProduct.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {newProduct.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold/10 text-charcoal text-xs rounded-sm border border-gold/20"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveNewTag(tag)}
                              className="text-luxury-muted hover:text-red-500 transition-colors"
                            >
                              <Icon name="XMarkIcon" size={10} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-luxury-muted mt-1">
                      Nhấn Enter hoặc nhấn "Thêm" để thêm tag vào sản phẩm
                    </p>
                  </div>

                  {/* Image Upload Section */}
                  <div className="mb-4">
                    <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-2">
                      Ảnh sản phẩm
                    </label>
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-24 flex-shrink-0 bg-luxury-warm border border-gray-200 overflow-hidden flex items-center justify-center">
                        {newProductImagePreview ? (
                          <img
                            src={newProductImagePreview}
                            alt="Product preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Icon name="PhotoIcon" size={24} className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setNewProductImagePreview(URL.createObjectURL(file));
                            setUploadingImage(true);
                            const url = await handleImageUpload(file);
                            setUploadingImage(false);
                            if (url) {
                              setNewProductImageUrl(url);
                              setNewProductImagePreview(url);
                              showToast('✅ Image uploaded successfully!');
                            } else {
                              setNewProductImagePreview('');
                            }
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-charcoal-light text-xs font-semibold hover:border-gold hover:text-gold transition-colors disabled:opacity-60"
                        >
                          {uploadingImage ? (
                            <>
                              <div className="w-3 h-3 border border-gold/30 border-t-gold rounded-full animate-spin" />
                              Đang tải lên...
                            </>
                          ) : (
                            <>
                              <Icon name="ArrowUpTrayIcon" size={14} />
                              {newProductImagePreview ? 'Thay đổi ảnh' : 'Tải lên ảnh'}
                            </>
                          )}
                        </button>
                        <p className="text-[10px] text-luxury-muted mt-1.5">
                          JPEG, PNG or WebP · Max 5MB
                        </p>
                        {newProductImageUrl && (
                          <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                            <Icon name="CheckCircleIcon" size={11} />
                            Ảnh đã lưu vào server và sẵn sàng sử dụng
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gallery Images Upload Section */}
                  <div className="mb-4">
                    <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-2">
                      Ảnh gallery{' '}
                      <span className="normal-case font-normal text-luxury-muted">
                        (các ảnh sản phẩm bổ sung)
                      </span>
                    </label>
                    {galleryPreviews.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {galleryPreviews.map((preview, idx) => (
                          <div
                            key={idx}
                            className="relative w-16 h-20 flex-shrink-0 bg-luxury-warm border border-gray-200 overflow-hidden flex items-center justify-center rounded-sm"
                          >
                            <img
                              src={preview}
                              alt={`Gallery ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {idx >= galleryUrls.length && (
                              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                <div className="w-4 h-4 border border-gold/30 border-t-gold rounded-full animate-spin" />
                              </div>
                            )}
                            {idx < galleryUrls.length && (
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(idx)}
                                className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Icon name="XMarkIcon" size={10} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <input
                        ref={galleryInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        onChange={handleGalleryFilesChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        disabled={uploadingGallery}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-charcoal-light text-xs font-semibold hover:border-gold hover:text-gold transition-colors disabled:opacity-60"
                      >
                        {uploadingGallery ? (
                          <>
                            <div className="w-3 h-3 border border-gold/30 border-t-gold rounded-full animate-spin" />
                            Đang tải lên...
                          </>
                        ) : (
                          <>
                            <Icon name="PhotoIcon" size={14} />
                            Thêm ảnh gallery
                          </>
                        )}
                      </button>
                      <p className="text-[10px] text-luxury-muted">
                        Chọn nhiều tệp · JPEG, PNG hoặc WebP
                      </p>
                    </div>
                    {galleryUrls.length > 0 && (
                      <p className="text-[10px] text-green-600 mt-1.5 flex items-center gap-1">
                        <Icon name="CheckCircleIcon" size={11} />
                        {galleryUrls.length} ảnh gallery đã sẵn sàng
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddProductSave}
                      className="flex items-center gap-2 px-6 py-2 bg-charcoal text-white text-xs font-semibold hover:bg-charcoal-mid transition-colors disabled:opacity-60"
                    >
                      Lưu sản phẩm
                    </button>
                    <button
                      onClick={() => {
                        setShowAddProduct(false);
                        setNewProductImageUrl('');
                        setNewProductImagePreview('');
                      }}
                      className="px-6 py-2 border border-gray-200 text-charcoal-light text-xs font-semibold hover:border-gray-300 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}

              {/* Desktop table */}
              <div className="hidden sm:block bg-white border border-gray-100 rounded-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        {[
                          'Sản phẩm',
                          'SKU',
                          'Danh mục',
                          'Giá',
                          'Số lượng',
                          'Trạng thái',
                          'Sản phẩm mới',
                          'Bán chạy',
                          'Hành động',
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-luxury-muted whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {productsLoading ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-8 text-center text-xs text-luxury-muted"
                          >
                            Đang tải sản phẩm...
                          </td>
                        </tr>
                      ) : filteredProducts.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-8 text-center text-xs text-luxury-muted"
                          >
                            Không có sản phẩm.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((product) => (
                          <tr
                            key={product.id}
                            className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group"
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-10 h-12 flex-shrink-0 bg-luxury-warm border border-gray-200 overflow-hidden flex items-center justify-center">
                                  <AppImage
                                    src={product.image_url || ''}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <p className="text-xs font-semibold text-charcoal max-w-[160px] leading-tight">
                                  {product.name}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-[10px] font-mono text-luxury-muted">
                              {product.sku || '—'}
                            </td>
                            <td className="px-4 py-4 text-xs text-charcoal-light">
                              {product.categories?.name || '—'}
                            </td>
                            <td className="px-4 py-4 text-xs font-bold text-charcoal">
                              {Number(product.price).toLocaleString('vi-VN')}đ
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`text-xs font-bold ${product.stock_quantity === 0 ? 'text-red-500' : product.stock_quantity <= 3 ? 'text-amber-600' : 'text-green-600'}`}
                              >
                                {product.stock_quantity === 0 ? 'Out' : product.stock_quantity}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <StatusBadge status={getProductStatus(product)} />
                            </td>
                            <td className="px-4 py-4">
                              <StatusBadge status={product.is_new ? 'active' : 'normal'} />
                            </td>
                            <td className="px-4 py-4">
                              <StatusBadge status={product.is_best_seller ? 'active' : 'normal'} />
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEditProduct(product)}
                                  className="p-1.5 text-luxury-muted hover:text-gold transition-colors"
                                >
                                  <Icon name="PencilSquareIcon" size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-1.5 text-luxury-muted hover:text-red-500 transition-colors"
                                >
                                  <Icon name="TrashIcon" size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile product cards */}
              <div className="sm:hidden space-y-3">
                {productsLoading ? (
                  <div className="py-8 text-center text-xs text-luxury-muted">
                    Đang tải sản phẩm...
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border border-gray-100 rounded-sm p-4 flex items-start gap-3"
                    >
                      <div className="relative w-12 h-12 flex-shrink-0 bg-luxury-warm border border-gray-200 overflow-hidden flex items-center justify-center rounded-sm">
                        <AppImage
                          src={product.image_url || ''}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-charcoal leading-tight">
                          {product.name}
                        </p>
                        <p className="text-[10px] font-mono text-luxury-muted mb-1">
                          {product.sku || '—'} · {product.categories?.name || '—'}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-charcoal">
                              {Number(product.price).toLocaleString('vi-VN')}đ
                            </span>
                            <span
                              className={`text-[10px] font-bold ${product.stock_quantity === 0 ? 'text-red-500' : product.stock_quantity <= 3 ? 'text-amber-600' : 'text-green-600'}`}
                            >
                              {product.stock_quantity === 0
                                ? 'Out of stock'
                                : `Stock: ${product.stock_quantity}`}
                            </span>
                          </div>
                          <StatusBadge status={getProductStatus(product)} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleOpenEditProduct(product)}
                          className="p-2 text-luxury-muted hover:text-gold transition-colors"
                        >
                          <Icon name="PencilSquareIcon" size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-luxury-muted hover:text-red-500 transition-colors"
                        >
                          <Icon name="TrashIcon" size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ── EDIT PRODUCT MODAL ── */}
              {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
                  <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                      <h3 className="font-display font-semibold text-base text-charcoal">
                        Chỉnh sửa sản phẩm
                      </h3>
                      <button
                        onClick={() => handleCancelEdit()}
                        className="p-1.5 text-luxury-muted hover:text-charcoal transition-colors"
                      >
                        <Icon name="XMarkIcon" size={18} />
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="px-6 py-5 space-y-5">
                      {/* Name + Category + Price + Stock */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-1">
                            Tên sản phẩm
                          </label>
                          <input
                            type="text"
                            value={editProductForm.name}
                            onChange={(e) =>
                              setEditProductForm((p) => ({ ...p, name: e.target.value }))
                            }
                            placeholder="e.g. Soleil Diamond Ring"
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gold transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted">
                            Sản phẩm mới?
                          </label>
                          <label className="text-[10px] block mb-1">
                            (Bật để hiển thị như một sản phẩm nổi bật)
                          </label>
                          <label className="switch block">
                            <input
                              type="checkbox"
                              checked={editProductForm.isNew}
                              onChange={(e) =>
                                setEditProductForm((p) => ({ ...p, isNew: e.target.checked }))
                              }
                            />
                            <span className="slider round"></span>
                          </label>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted">
                            Sản phẩm bán chạy?
                          </label>
                          <label className="text-[10px] block mb-1">
                            (Bật để hiển thị như một sản phẩm bán chạy)
                          </label>
                          <label className="switch block">
                            <input
                              type="checkbox"
                              checked={editProductForm.isBestSeller}
                              onChange={(e) =>
                                setEditProductForm((p) => ({
                                  ...p,
                                  isBestSeller: e.target.checked,
                                }))
                              }
                            />
                            <span className="slider round"></span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-1">
                            Danh mục
                          </label>
                          <select
                            value={editProductForm.categoryId}
                            onChange={(e) =>
                              setEditProductForm((p) => ({ ...p, categoryId: e.target.value }))
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gold transition-colors bg-white"
                          >
                            <option value="">— Chọn danh mục —</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-1">
                            Giá hiện tại (đ)
                          </label>
                          <input
                            type="number"
                            value={editProductForm.price}
                            onChange={(e) =>
                              setEditProductForm((p) => ({ ...p, price: e.target.value }))
                            }
                            placeholder="0"
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gold transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-1">
                            Giá gốc (đ)
                          </label>
                          <input
                            type="number"
                            value={editProductForm.original_price}
                            onChange={(e) =>
                              setEditProductForm((p) => ({ ...p, original_price: e.target.value }))
                            }
                            placeholder="0"
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gold transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-1">
                            Số lượng
                          </label>
                          <input
                            type="number"
                            value={editProductForm.stock}
                            onChange={(e) =>
                              setEditProductForm((p) => ({ ...p, stock: e.target.value }))
                            }
                            placeholder="0"
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gold transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-1">
                            Chất liệu
                          </label>
                          <input
                            type="text"
                            value={editProductForm.material}
                            onChange={(e) =>
                              setEditProductForm((p) => ({ ...p, material: e.target.value }))
                            }
                            placeholder="e.g. 18K Gold, Sterling Silver"
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gold transition-colors"
                          />
                        </div>
                      </div>

                      {/* {Description} */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">Mô tả sản phẩm</label>
                        <TiptapEditor
                          content={editProductForm.description}
                          onChange={(html) =>
                            setEditProductForm((p) => ({ ...p, description: html }))
                          }
                        />
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-1">
                          Thẻ sản phẩm
                        </label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={editTagInput}
                            onChange={(e) => setEditTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddEditTag();
                              }
                            }}
                            placeholder="e.g. diamond, luxury, gift"
                            className="flex-1 px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gold transition-colors"
                          />
                          <button
                            type="button"
                            onClick={handleAddEditTag}
                            className="px-3 py-2 bg-gold text-white text-xs font-semibold hover:bg-gold-light transition-colors"
                          >
                            Thêm
                          </button>
                        </div>
                        {editProductForm.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {editProductForm.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold/10 text-charcoal text-xs rounded-sm border border-gold/20"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEditTag(tag)}
                                  className="text-luxury-muted hover:text-red-500 transition-colors"
                                >
                                  <Icon name="XMarkIcon" size={10} />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-luxury-muted mt-1">
                          Nhấn Enter hoặc nhấn "Thêm" để thêm tag vào sản phẩm
                        </p>
                      </div>

                      {/* Main Image */}
                      <div className="mb-4">
                        <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-2">
                          Ảnh sản phẩm
                        </label>
                        <div className="flex items-start gap-4">
                          <div className="w-20 h-20 flex-shrink-0 bg-luxury-warm border border-gray-200 overflow-hidden flex items-center justify-center rounded-sm">
                            {editProductForm.imagePreview ? (
                              <img
                                src={editProductForm.imagePreview}
                                alt="Product preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Icon name="PhotoIcon" size={24} className="text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1">
                            <input
                              ref={editFileInputRef}
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={handleEditFileChange}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => editFileInputRef.current?.click()}
                              disabled={uploadingEditImage}
                              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-charcoal-light text-xs font-semibold hover:border-gold hover:text-gold transition-colors disabled:opacity-60"
                            >
                              {uploadingEditImage ? (
                                <>
                                  <div className="w-3 h-3 border border-gold/30 border-t-gold rounded-full animate-spin" />
                                  Đang tải lên...
                                </>
                              ) : (
                                <>
                                  <Icon name="ArrowUpTrayIcon" size={14} />
                                  {editProductForm.imagePreview ? 'Thay đổi ảnh' : 'Tải lên ảnh'}
                                </>
                              )}
                            </button>
                            <p className="text-[10px] text-luxury-muted mt-1.5">
                              JPEG, PNG or WebP · Max 5MB
                            </p>
                            {editProductForm.imageUrl && (
                              <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                                <Icon name="CheckCircleIcon" size={11} />
                                Ảnh đã lưu vào server và sẵn sàng sử dụng
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Gallery Images */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-2">
                          Ảnh gallery{' '}
                          <span className="normal-case font-normal text-luxury-muted">
                            (các ảnh sản phẩm bổ sung)
                          </span>
                        </label>
                        {editProductForm.galleryPreviews.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {editProductForm.galleryPreviews.map((preview, idx) => (
                              <div
                                key={idx}
                                className="relative w-16 h-20 flex-shrink-0 bg-luxury-warm border border-gray-200 overflow-hidden flex items-center justify-center rounded-sm"
                              >
                                <img
                                  src={preview}
                                  alt={`Gallery ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {idx >= editProductForm.galleryUrls.length && (
                                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                    <div className="w-4 h-4 border border-gold/30 border-t-gold rounded-full animate-spin" />
                                  </div>
                                )}
                                {idx < editProductForm.galleryUrls.length && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEditGalleryImage(idx)}
                                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Icon name="XMarkIcon" size={10} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <input
                            ref={editGalleryInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            multiple
                            onChange={handleEditGalleryFilesChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => editGalleryInputRef.current?.click()}
                            disabled={uploadingEditGallery}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-charcoal-light text-xs font-semibold hover:border-gold hover:text-gold transition-colors disabled:opacity-60"
                          >
                            {uploadingEditGallery ? (
                              <>
                                <div className="w-3 h-3 border border-gold/30 border-t-gold rounded-full animate-spin" />
                                Đang tải lên...
                              </>
                            ) : (
                              <>
                                <Icon name="PhotoIcon" size={14} />
                                Thêm ảnh gallery
                              </>
                            )}
                          </button>
                          <p className="text-[10px] text-luxury-muted">
                            Chọn nhiều tệp · JPEG, PNG hoặc WebP
                          </p>
                        </div>
                        {editProductForm.galleryUrls.length > 0 && (
                          <p className="text-[10px] text-green-600 mt-1.5 flex items-center gap-1">
                            <Icon name="CheckCircleIcon" size={11} />
                            {editProductForm.galleryUrls.length} ảnh gallery đã sẵn sàng
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                      <button
                        onClick={handleEditProductSave}
                        disabled={savingEditProduct}
                        className="flex items-center gap-2 px-6 py-2 bg-charcoal text-white text-xs font-semibold hover:bg-charcoal-mid transition-colors disabled:opacity-60"
                      >
                        {savingEditProduct ? (
                          <>
                            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <Icon name="CheckIcon" size={14} />
                            Lưu thay đổi
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleCancelEdit()}
                        className="px-6 py-2 border border-gray-200 text-charcoal-light text-xs font-semibold hover:border-gray-300 transition-colors"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── DELETE CONFIRMATION MODAL ── */}
              {deleteConfirmProductId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="bg-white w-full max-w-sm rounded-sm shadow-2xl">
                    <div className="px-6 py-5 border-b border-gray-100">
                      <h3 className="font-display font-semibold text-base text-charcoal">
                        Xoá sản phẩm
                      </h3>
                    </div>
                    <div className="px-6 py-5">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                          <Icon name="TrashIcon" size={18} className="text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm text-charcoal font-medium mb-1">
                            Bạn có chắc chắn muốn xoá sản phẩm này?
                          </p>
                          <p className="text-xs text-luxury-muted">
                            Sản phẩm sẽ bị xoá vĩnh viễn khỏi cửa hàng và không thể khôi phục.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                      <button
                        onClick={() => setDeleteConfirmProductId(null)}
                        disabled={deletingProduct}
                        className="px-4 py-2 text-xs font-semibold text-luxury-muted border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-60"
                      >
                        Huỷ
                      </button>
                      <button
                        onClick={handleConfirmDelete}
                        disabled={deletingProduct}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
                      >
                        {deletingProduct ? (
                          <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Icon name="TrashIcon" size={12} />
                        )}
                        Xoá sản phẩm
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── CATEGORIES ── */}
          {activeSection === 'categories' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-luxury-muted">
                  {categoriesLoading ? 'Loading...' : `${filteredCategories.length} categories`}
                </p>
                <button
                  onClick={handleOpenAddCategory}
                  className="flex items-center gap-2 px-4 py-2 bg-gold text-charcoal text-xs font-semibold hover:bg-gold-light transition-colors"
                >
                  <Icon name="PlusIcon" size={14} />
                  Thêm danh mục
                </button>
              </div>

              {/* Add / Edit Category Form — only shown for ADD (not edit) */}
              {showAddCategory && !editingCategory && (
                <div className="bg-white border border-gray-100 p-4 md:p-6 mb-6 rounded-sm">
                  <h3 className="font-semibold text-sm text-charcoal mb-4">Thêm danh mục</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-1">
                        Tên danh mục
                      </label>
                      <input
                        type="text"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. Rings"
                        className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gold transition-colors"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-1">
                        Mô tả (không bắt buộc)
                      </label>
                      <textarea
                        value={categoryForm.description}
                        onChange={(e) =>
                          setCategoryForm((p) => ({ ...p, description: e.target.value }))
                        }
                        placeholder="Short description of this category..."
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gold transition-colors resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-1">
                        Thứ tự danh mục (không bắt buộc)
                      </label>
                      <input
                        type="number"
                        value={categoryForm.sortOrder}
                        onChange={(e) =>
                          setCategoryForm((p) => ({ ...p, sortOrder: e.target.value }))
                        }
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gold transition-colors"
                      />
                      <p className="text-[10px] text-luxury-muted mt-1">
                        Lower numbers appear first
                      </p>
                    </div>
                    <div className="flex items-center gap-3 pt-5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div
                          onClick={() => setCategoryForm((p) => ({ ...p, isActive: !p.isActive }))}
                          className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${categoryForm.isActive ? 'bg-gold' : 'bg-gray-300'}`}
                        >
                          <div
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${categoryForm.isActive ? 'translate-x-4' : 'translate-x-0.5'}`}
                          />
                        </div>
                        <span className="text-xs font-medium text-charcoal">Active</span>
                      </label>
                    </div>
                  </div>

                  {/* Category Image */}
                  <div className="mb-5">
                    <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-2">
                      Category Image
                    </label>
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 flex-shrink-0 bg-luxury-warm border border-gray-200 overflow-hidden flex items-center justify-center rounded-sm">
                        {categoryForm.imagePreview ? (
                          <img
                            src={categoryForm.imagePreview}
                            alt="Category preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Icon name="PhotoIcon" size={24} className="text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          ref={categoryImageInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleCategoryImageChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => categoryImageInputRef.current?.click()}
                          disabled={uploadingCategoryImage}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-charcoal-light text-xs font-semibold hover:border-gold hover:text-gold transition-colors disabled:opacity-60"
                        >
                          {uploadingCategoryImage ? (
                            <>
                              <div className="w-3 h-3 border border-gold/30 border-t-gold rounded-full animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Icon name="ArrowUpTrayIcon" size={14} />
                              {categoryForm.imagePreview ? 'Change Image' : 'Upload Image'}
                            </>
                          )}
                        </button>
                        <p className="text-[10px] text-luxury-muted mt-1.5">
                          JPEG, PNG or WebP · Max 5MB
                        </p>
                        {categoryForm.imageUrl && (
                          <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                            <Icon name="CheckCircleIcon" size={11} />
                            Image saved to storage
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleSaveCategory}
                      disabled={savingCategory}
                      className="flex items-center gap-2 px-6 py-2 bg-charcoal text-white text-xs font-semibold hover:bg-charcoal-mid transition-colors disabled:opacity-60"
                    >
                      {savingCategory ? (
                        <>
                          <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>Save Category</>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddCategory(false);
                        setEditingCategory(null);
                        resetCategoryForm();
                      }}
                      className="px-6 py-2 border border-gray-200 text-charcoal-light text-xs font-semibold hover:border-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Desktop categories table */}
              <div className="hidden sm:block bg-white border border-gray-100 rounded-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        {[
                          'Category',
                          'Description',
                          'Sort Order',
                          'Products',
                          'Status',
                          'Actions',
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-luxury-muted whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {categoriesLoading ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-xs text-luxury-muted"
                          >
                            Loading categories...
                          </td>
                        </tr>
                      ) : filteredCategories.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-xs text-luxury-muted"
                          >
                            No categories found.
                          </td>
                        </tr>
                      ) : (
                        filteredCategories.map((cat) => {
                          const productCount = products.filter(
                            (p) => p.category_id === cat.id
                          ).length;
                          return (
                            <tr
                              key={cat.id}
                              className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors group"
                            >
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 flex-shrink-0 bg-luxury-warm border border-gray-200 overflow-hidden rounded-sm flex items-center justify-center">
                                    {cat.image_url ? (
                                      <img
                                        src={cat.image_url}
                                        alt={cat.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Icon name="TagIcon" size={16} className="text-gray-300" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-charcoal">
                                      {cat.name}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-xs text-luxury-muted max-w-[200px] truncate">
                                {cat.description || '—'}
                              </td>
                              <td className="px-4 py-4 text-xs text-charcoal text-center">
                                {cat.sort_order}
                              </td>
                              <td className="px-4 py-4">
                                <button
                                  onClick={() => {
                                    setActiveSection('products');
                                    setSearchQuery('');
                                  }}
                                  className="text-xs font-semibold text-gold hover:underline"
                                >
                                  {productCount} products
                                </button>
                              </td>
                              <td className="px-4 py-4">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border rounded-sm ${cat.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                                >
                                  {cat.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => handleOpenEditCategory(cat)}
                                    className="p-1.5 text-luxury-muted hover:text-gold transition-colors"
                                  >
                                    <Icon name="PencilSquareIcon" size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    className="p-1.5 text-luxury-muted hover:text-red-500 transition-colors"
                                  >
                                    <Icon name="TrashIcon" size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile category cards */}
              <div className="sm:hidden space-y-3">
                {categoriesLoading ? (
                  <div className="py-8 text-center text-xs text-luxury-muted">
                    Loading categories...
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="py-8 text-center text-xs text-luxury-muted">
                    No categories found.
                  </div>
                ) : (
                  filteredCategories.map((cat) => {
                    const productCount = products.filter((p) => p.category_id === cat.id).length;
                    return (
                      <div
                        key={cat.id}
                        className="bg-white border border-gray-100 rounded-sm p-4 flex items-start gap-3"
                      >
                        <div className="w-12 h-12 flex-shrink-0 bg-luxury-warm border border-gray-200 overflow-hidden rounded-sm flex items-center justify-center">
                          {cat.image_url ? (
                            <img
                              src={cat.image_url}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Icon name="TagIcon" size={18} className="text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="mb-0.5">
                            <p className="text-xs font-semibold text-charcoal">{cat.name}</p>
                          </div>
                          {cat.description && (
                            <p className="text-[10px] text-luxury-muted mb-1 line-clamp-1">
                              {cat.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-charcoal-light">
                              Sort: {cat.sort_order}
                            </span>
                            <span className="text-[10px] text-gold font-semibold">
                              {productCount} products
                            </span>
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-semibold uppercase border rounded-sm ${cat.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                            >
                              {cat.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleOpenEditCategory(cat)}
                            className="p-2 text-luxury-muted hover:text-gold transition-colors"
                          >
                            <Icon name="PencilSquareIcon" size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-2 text-luxury-muted hover:text-red-500 transition-colors"
                          >
                            <Icon name="TrashIcon" size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ── EDIT CATEGORY MODAL ── */}
              {editingCategory && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
                  <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                      <h3 className="font-display font-semibold text-base text-charcoal">
                        Edit Category
                      </h3>
                      <button
                        onClick={() => {
                          setEditingCategory(null);
                          setShowAddCategory(false);
                          resetCategoryForm();
                        }}
                        className="p-1.5 text-luxury-muted hover:text-charcoal transition-colors"
                      >
                        <Icon name="XMarkIcon" size={18} />
                      </button>
                    </div>

                    {/* Modal Body */}
                    <div className="px-6 py-5 space-y-4">
                      {/* Category Name */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-1">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="e.g. Rings"
                          className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gold transition-colors"
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-1">
                          Description
                        </label>
                        <textarea
                          value={categoryForm.description}
                          onChange={(e) =>
                            setCategoryForm((p) => ({ ...p, description: e.target.value }))
                          }
                          placeholder="Short description of this category..."
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gold transition-colors resize-none"
                        />
                      </div>

                      {/* Sort Order + Active */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-1">
                            Sort Order
                          </label>
                          <input
                            type="number"
                            value={categoryForm.sortOrder}
                            onChange={(e) =>
                              setCategoryForm((p) => ({ ...p, sortOrder: e.target.value }))
                            }
                            placeholder="0"
                            className="w-full px-3 py-2 text-sm border border-gray-200 focus:outline-none focus:border-gold transition-colors"
                          />
                          <p className="text-[10px] text-luxury-muted mt-1">
                            Lower numbers appear first
                          </p>
                        </div>
                        <div className="flex items-center gap-3 pt-5">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <div
                              onClick={() =>
                                setCategoryForm((p) => ({ ...p, isActive: !p.isActive }))
                              }
                              className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${categoryForm.isActive ? 'bg-gold' : 'bg-gray-300'}`}
                            >
                              <div
                                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${categoryForm.isActive ? 'translate-x-4' : 'translate-x-0.5'}`}
                              />
                            </div>
                            <span className="text-xs font-medium text-charcoal">Active</span>
                          </label>
                        </div>
                      </div>

                      {/* Category Image */}
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide font-semibold text-luxury-muted mb-2">
                          Category Image
                        </label>
                        <div className="flex items-start gap-4">
                          <div className="w-20 h-20 flex-shrink-0 bg-luxury-warm border border-gray-200 overflow-hidden flex items-center justify-center rounded-sm">
                            {categoryForm.imagePreview ? (
                              <img
                                src={categoryForm.imagePreview}
                                alt="Category preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Icon name="PhotoIcon" size={24} className="text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1">
                            <input
                              ref={categoryImageInputRef}
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={handleCategoryImageChange}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => categoryImageInputRef.current?.click()}
                              disabled={uploadingCategoryImage}
                              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-charcoal-light text-xs font-semibold hover:border-gold hover:text-gold transition-colors disabled:opacity-60"
                            >
                              {uploadingCategoryImage ? (
                                <>
                                  <div className="w-3 h-3 border border-gold/30 border-t-gold rounded-full animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Icon name="ArrowUpTrayIcon" size={14} />
                                  {categoryForm.imagePreview ? 'Change Image' : 'Upload Image'}
                                </>
                              )}
                            </button>
                            <p className="text-[10px] text-luxury-muted mt-1.5">
                              JPEG, PNG or WebP · Max 5MB
                            </p>
                            {categoryForm.imageUrl && (
                              <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                                <Icon name="CheckCircleIcon" size={11} />
                                Image saved to storage
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                      <button
                        onClick={handleSaveCategory}
                        disabled={savingCategory}
                        className="flex items-center gap-2 px-6 py-2 bg-charcoal text-white text-xs font-semibold hover:bg-charcoal-mid transition-colors disabled:opacity-60"
                      >
                        {savingCategory ? (
                          <>
                            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Icon name="CheckIcon" size={14} />
                            Update Category
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategory(null);
                          setShowAddCategory(false);
                          resetCategoryForm();
                        }}
                        className="px-6 py-2 border border-gray-200 text-charcoal-light text-xs font-semibold hover:border-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Category Confirmation Modal */}
              {deleteConfirmCategoryId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="bg-white w-full max-w-sm rounded-sm shadow-2xl">
                    <div className="px-6 py-5 border-b border-gray-100">
                      <h3 className="font-display font-semibold text-base text-charcoal">
                        Delete Category
                      </h3>
                    </div>
                    <div className="px-6 py-5">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                          <Icon name="TrashIcon" size={18} className="text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm text-charcoal font-medium mb-1">
                            Delete this category?
                          </p>
                          <p className="text-xs text-luxury-muted">
                            Products linked to this category will have their category set to none.
                            This cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                      <button
                        onClick={() => setDeleteConfirmCategoryId(null)}
                        disabled={deletingCategory}
                        className="px-4 py-2 text-xs font-semibold text-luxury-muted border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-60"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmDeleteCategory}
                        disabled={deletingCategory}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
                      >
                        {deletingCategory ? (
                          <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Icon name="TrashIcon" size={12} />
                        )}
                        Delete Category
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ORDERS ── */}
          {activeSection === 'orders' && (
            <div>
              {/* Order stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  {
                    label: 'Chờ xác nhận',
                    count: orders.filter((o) => o.status === 'awaiting_confirmation').length,
                    color: 'bg-amber-50 border-amber-200 text-amber-700',
                  },
                  {
                    label: 'Đang xử lý',
                    count: orders.filter((o) => o.status === 'pending').length,
                    color: 'bg-blue-50 border-blue-200 text-blue-700',
                  },
                  {
                    label: 'Đã thanh toán',
                    count: orders.filter((o) => o.status === 'paid').length,
                    color: 'bg-green-50 border-green-200 text-green-700',
                  },
                  {
                    label: 'Đã huỷ',
                    count: orders.filter((o) => o.status === 'cancelled').length,
                    color: 'bg-red-50 border-red-200 text-red-700',
                  },
                ].map((stat) => (
                  <div key={stat.label} className={`border p-4 rounded-sm ${stat.color}`}>
                    <p className="text-2xl font-bold font-display">{stat.count}</p>
                    <p className="text-xs font-semibold uppercase tracking-wide mt-1 opacity-70">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-gray-100 rounded-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-sm text-charcoal">Tất cả đơn hàng</h2>
                  {ordersLoading && <span className="text-xs text-luxury-muted">Đang tải...</span>}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-50 bg-gray-50/30">
                        {[
                          'Order ID',
                          'Customer',
                          'Phone',
                          'Total',
                          'Method',
                          'Status',
                          'Actions',
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-luxury-muted whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <React.Fragment key={order.id}>
                          <tr className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                            <td className="px-4 py-4 text-[10px] font-mono text-charcoal font-semibold">
                              {order.order_number}
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-xs font-semibold text-charcoal">
                                {order.shipping_name}
                              </p>
                              <p className="text-[10px] text-luxury-muted">
                                {order.shipping_phone}
                              </p>
                            </td>
                            <td className="px-4 py-4 text-xs text-luxury-muted">
                              {order.shipping_phone}
                            </td>
                            <td className="px-4 py-4 text-xs font-bold text-charcoal">
                              {Number(order.total_amount).toLocaleString('vi-VN')}đ
                            </td>
                            <td className="px-4 py-4 text-xs text-charcoal-light">
                              {order.payment_method === 'bank_transfer' ? (
                                <span className="flex items-center gap-1">
                                  <Icon
                                    name="BuildingLibraryIcon"
                                    size={12}
                                    className="text-amber-600"
                                  />
                                  Chuyển khoản
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Icon name="TruckIcon" size={12} className="text-blue-600" />
                                  COD
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <StatusBadge status={order.status} />
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleOrderItems(order.id)}
                                  className="flex items-center gap-1 px-2 py-1.5 border border-gray-200 text-charcoal-light text-[10px] font-semibold hover:border-gold hover:text-gold transition-colors"
                                  title="Xem chi tiết đơn hàng"
                                >
                                  <Icon
                                    name={
                                      selectedOrderId === order.id
                                        ? 'ChevronUpIcon'
                                        : 'ChevronDownIcon'
                                    }
                                    size={11}
                                  />
                                  Detail
                                </button>
                                {order.payment_method === 'bank_transfer' &&
                                  order.status === 'awaiting_confirmation' && (
                                    <button
                                      onClick={() => handleConfirmPayment(order.id)}
                                      disabled={confirmingOrderId === order.id}
                                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-semibold transition-colors disabled:opacity-60 whitespace-nowrap"
                                    >
                                      {confirmingOrderId === order.id ? (
                                        <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                                      ) : (
                                        <Icon name="CheckIcon" size={11} />
                                      )}
                                      Confirm Payment
                                    </button>
                                  )}
                                {!(
                                  order.payment_method === 'bank_transfer' &&
                                  order.status === 'awaiting_confirmation'
                                ) && (
                                  <select
                                    value={order.status}
                                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                    className="text-[10px] border border-gray-200 px-2 py-1.5 text-charcoal focus:outline-none focus:border-gold transition-colors bg-white rounded-sm"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="awaiting_confirmation">Chờ xác nhận</option>
                                    <option value="paid">Đã thanh toán</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                )}
                              </div>
                            </td>
                          </tr>
                          {selectedOrderId === order.id && (
                            <tr>
                              <td colSpan={7} className="px-4 pb-4 bg-gray-50/30">
                                <div className="pt-1 space-y-2">
                                  {loadingItems === order.id ? (
                                    <div className="flex items-center gap-2 text-xs text-luxury-muted py-2">
                                      <div className="w-3 h-3 border border-gold/30 border-t-gold rounded-full animate-spin" />
                                      Đang tải...
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="bg-gray-50 border border-gray-100 rounded-sm px-3 py-2 space-y-1.5">
                                        <p className="text-[10px] font-semibold uppercase tracking-wide text-luxury-muted">
                                          Thông tin khách hàng
                                        </p>
                                        <div className="flex items-start gap-1.5">
                                          <Icon
                                            name="UserIcon"
                                            size={11}
                                            className="text-luxury-muted mt-0.5 flex-shrink-0"
                                          />
                                          <p className="text-[10px] text-charcoal font-semibold">
                                            {order.shipping_name}
                                          </p>
                                        </div>
                                        <div className="flex items-start gap-1.5">
                                          <Icon
                                            name="PhoneIcon"
                                            size={11}
                                            className="text-luxury-muted mt-0.5 flex-shrink-0"
                                          />
                                          <p className="text-[10px] text-charcoal">
                                            {order.shipping_phone}
                                          </p>
                                        </div>
                                        <div className="flex items-start gap-1.5">
                                          <Icon
                                            name="MapPinIcon"
                                            size={11}
                                            className="text-luxury-muted mt-0.5 flex-shrink-0"
                                          />
                                          <p className="text-[10px] text-charcoal leading-snug">
                                            {[order.shipping_address, order.shipping_city]
                                              .filter(Boolean)
                                              .join(', ') || '—'}
                                          </p>
                                        </div>
                                        <div className="flex items-start gap-1.5">
                                          <p className="text-[10px] text-charcoal leading-snug">
                                            Ghi chú: {order.notes || 'Không có ghi chú'}
                                          </p>
                                        </div>
                                      </div>
                                      <div>
                                        {orderItems[order.id] && orderItems[order.id].length > 0 ? (
                                          orderItems[order.id].map((item) => (
                                            <div
                                              key={item.id}
                                              className="flex items-start gap-2 bg-gray-50 border border-gray-100 p-2 rounded-sm"
                                            >
                                              {item.product_image && (
                                                <div className="w-8 h-10 flex-shrink-0 overflow-hidden bg-luxury-warm">
                                                  <img
                                                    src={item.product_image}
                                                    alt={item.product_name}
                                                    className="w-full h-full object-cover"
                                                  />
                                                </div>
                                              )}
                                              <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-semibold text-charcoal leading-tight">
                                                  {item.product_name}
                                                </p>
                                                <div className="flex flex-wrap gap-2 mt-0.5">
                                                  {item.material && (
                                                    <span className="text-[10px] text-luxury-muted">
                                                      CL:{' '}
                                                      <span className="text-charcoal">
                                                        {item.material}
                                                      </span>
                                                    </span>
                                                  )}
                                                  {item.size && (
                                                    <span className="text-[10px] text-luxury-muted">
                                                      Size:{' '}
                                                      <span className="text-charcoal">
                                                        {item.size}
                                                      </span>
                                                    </span>
                                                  )}
                                                  <span className="text-[10px] text-luxury-muted">
                                                    ×{item.quantity}
                                                  </span>
                                                </div>
                                              </div>
                                              <p className="text-[10px] font-bold text-charcoal">
                                                {Number(item.total_price).toLocaleString('vi-VN')}đ
                                              </p>
                                            </div>
                                          ))
                                        ) : (
                                          <p className="text-[10px] text-luxury-muted">
                                            Không có sản phẩm.
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  <div className="pt-1">
                                    {order.payment_method === 'bank_transfer' &&
                                    order.status === 'awaiting_confirmation' ? (
                                      <button
                                        onClick={() => handleConfirmPayment(order.id)}
                                        disabled={confirmingOrderId === order.id}
                                        className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
                                      >
                                        {confirmingOrderId === order.id ? (
                                          <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                          <Icon name="CheckIcon" size={12} />
                                        )}
                                        Confirm Payment
                                      </button>
                                    ) : (
                                      <select
                                        value={order.status}
                                        onChange={(e) =>
                                          handleUpdateStatus(order.id, e.target.value)
                                        }
                                        className="w-full text-xs border border-gray-200 px-3 py-2 text-charcoal focus:outline-none focus:border-gold transition-colors bg-white rounded-sm"
                                      >
                                        <option value="pending">Pending</option>
                                        <option value="awaiting_confirmation">Chờ xác nhận</option>
                                        <option value="paid">Đã thanh toán</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                      </select>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                      {!ordersLoading && filteredOrders.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-12 text-center text-xs text-luxury-muted"
                          >
                            Chưa có đơn hàng nào.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile order cards */}
                <div className="sm:hidden divide-y divide-gray-50">
                  {ordersLoading ? (
                    <div className="px-4 py-8 text-center text-xs text-luxury-muted">
                      Đang tải...
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div key={order.id} className="px-4 py-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-semibold text-charcoal">
                            {order.order_number}
                          </span>
                          <StatusBadge status={order.status} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-charcoal">
                            {order.shipping_name}
                          </p>
                          <p className="text-[10px] text-luxury-muted">
                            {order.shipping_phone} · {order.shipping_city}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-charcoal-light">
                            {order.payment_method === 'bank_transfer' ? 'Chuyển khoản' : 'COD'}
                          </span>
                          <span className="text-xs font-bold text-charcoal">
                            {Number(order.total_amount).toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                        <button
                          onClick={() => handleToggleOrderItems(order.id)}
                          className="w-full flex items-center justify-center gap-1 px-3 py-1.5 border border-gray-200 text-charcoal-light text-xs font-semibold transition-colors"
                        >
                          <Icon
                            name={
                              selectedOrderId === order.id ? 'ChevronUpIcon' : 'ChevronDownIcon'
                            }
                            size={12}
                          />
                          {selectedOrderId === order.id ? 'Ẩn chi tiết' : 'Detail'}
                        </button>
                        {selectedOrderId === order.id && (
                          <div className="pt-1 space-y-2">
                            {loadingItems === order.id ? (
                              <div className="flex items-center gap-2 text-xs text-luxury-muted py-2">
                                <div className="w-3 h-3 border border-gold/30 border-t-gold rounded-full animate-spin" />
                                Đang tải...
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="bg-gray-50 border border-gray-100 rounded-sm px-3 py-2 space-y-1.5">
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-luxury-muted">
                                    Thông tin khách hàng
                                  </p>
                                  <div className="flex items-start gap-1.5">
                                    <Icon
                                      name="UserIcon"
                                      size={11}
                                      className="text-luxury-muted mt-0.5 flex-shrink-0"
                                    />
                                    <p className="text-[10px] text-charcoal font-semibold">
                                      {order.shipping_name}
                                    </p>
                                  </div>
                                  <div className="flex items-start gap-1.5">
                                    <Icon
                                      name="PhoneIcon"
                                      size={11}
                                      className="text-luxury-muted mt-0.5 flex-shrink-0"
                                    />
                                    <p className="text-[10px] text-charcoal">
                                      {order.shipping_phone}
                                    </p>
                                  </div>
                                  <div className="flex items-start gap-1.5">
                                    <Icon
                                      name="MapPinIcon"
                                      size={11}
                                      className="text-luxury-muted mt-0.5 flex-shrink-0"
                                    />
                                    <p className="text-[10px] text-charcoal leading-snug">
                                      {[order.shipping_address, order.shipping_city]
                                        .filter(Boolean)
                                        .join(', ') || '—'}
                                    </p>
                                  </div>
                                </div>
                                {orderItems[order.id] && orderItems[order.id].length > 0 ? (
                                  orderItems[order.id].map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex items-start gap-2 bg-gray-50 border border-gray-100 p-2 rounded-sm"
                                    >
                                      {item.product_image && (
                                        <div className="w-8 h-10 flex-shrink-0 overflow-hidden bg-luxury-warm">
                                          <img
                                            src={item.product_image}
                                            alt={item.product_name}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-semibold text-charcoal leading-tight">
                                          {item.product_name}
                                        </p>
                                        <div className="flex flex-wrap gap-2 mt-0.5">
                                          {item.material && (
                                            <span className="text-[10px] text-luxury-muted">
                                              CL:{' '}
                                              <span className="text-charcoal">{item.material}</span>
                                            </span>
                                          )}
                                          {item.size && (
                                            <span className="text-[10px] text-luxury-muted">
                                              Size:{' '}
                                              <span className="text-charcoal">{item.size}</span>
                                            </span>
                                          )}
                                          <span className="text-[10px] text-luxury-muted">
                                            ×{item.quantity}
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-[10px] font-bold text-charcoal">
                                        {Number(item.total_price).toLocaleString('vi-VN')}đ
                                      </p>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-[10px] text-luxury-muted">
                                    Không có sản phẩm.
                                  </p>
                                )}
                              </div>
                            )}
                            <div className="pt-1">
                              {order.payment_method === 'bank_transfer' &&
                              order.status === 'awaiting_confirmation' ? (
                                <button
                                  onClick={() => handleConfirmPayment(order.id)}
                                  disabled={confirmingOrderId === order.id}
                                  className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors disabled:opacity-60"
                                >
                                  {confirmingOrderId === order.id ? (
                                    <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                                  ) : (
                                    <Icon name="CheckIcon" size={12} />
                                  )}
                                  Confirm Payment
                                </button>
                              ) : (
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                  className="w-full text-xs border border-gray-200 px-3 py-2 text-charcoal focus:outline-none focus:border-gold transition-colors bg-white rounded-sm"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="awaiting_confirmation">Chờ xác nhận</option>
                                  <option value="paid">Đã thanh toán</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {!ordersLoading && filteredOrders.length === 0 && (
                    <div className="px-4 py-8 text-center text-xs text-luxury-muted">
                      Chưa có đơn hàng nào.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {activeSection === 'analytics' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <KPICard
                  title="TỔNG DOANH THU (Năm nay)"
                  value={
                    analyticsLoading ? '...' : `${kpiData.ytdRevenue.toLocaleString('vi-VN')}đ`
                  }
                  change="Tính từ đầu năm"
                  positive={true}
                  icon="BanknotesIcon"
                  loading={analyticsLoading}
                />
                <KPICard
                  title="TỔNG ĐƠN HÀNG (Năm nay)"
                  value={analyticsLoading ? '...' : String(kpiData.ytdOrders)}
                  change="Tính từ đầu năm"
                  positive={true}
                  icon="ShoppingBagIcon"
                  loading={analyticsLoading}
                />
                <KPICard
                  title="TỔNG SẢN PHẨM"
                  value={analyticsLoading ? '...' : String(products.length)}
                  change={`${products.filter((p) => p.is_active).length} đang kinh doanh`}
                  positive={true}
                  icon="SquaresPlusIcon"
                  loading={analyticsLoading}
                />
                <KPICard
                  title="SẢN PHẨM SẮP HẾT HÀNG"
                  value={analyticsLoading ? '...' : String(lowStockCount)}
                  change="≤3 sản phẩm"
                  positive={lowStockCount === 0}
                  icon="ExclamationTriangleIcon"
                  loading={analyticsLoading}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white border border-gray-100 p-4 md:p-6 rounded-sm">
                  <h2 className="font-semibold text-sm text-charcoal mb-1">Doanh Thu Theo Tháng</h2>
                  <p className="text-xs text-luxury-muted mb-6">6 tháng gần nhất</p>
                  {analyticsLoading ? (
                    <div className="h-[220px] flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={salesData} barSize={28}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0EEE8" vertical={false} />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11, fill: '#8A8A8A' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#8A8A8A' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v) => `${(v / 1000000).toFixed(0)} Tr`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="revenue" fill="#D4AF37" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="bg-white border border-gray-100 p-4 md:p-6 rounded-sm">
                  <h2 className="font-semibold text-sm text-charcoal mb-1">Lượng Đơn Hàng</h2>
                  <p className="text-xs text-luxury-muted mb-6">6 tháng gần nhất</p>
                  {analyticsLoading ? (
                    <div className="h-[220px] flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0EEE8" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11, fill: '#8A8A8A' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#8A8A8A' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="orders"
                          stroke="#1A1A1A"
                          strokeWidth={2}
                          dot={{ fill: '#D4AF37', r: 4 }}
                          activeDot={{ r: 6, fill: '#D4AF37' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── CUSTOMERS ── */}
          {activeSection === 'customers' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-100 p-5 rounded-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-gold/10 rounded-sm flex items-center justify-center">
                      <Icon name="UsersIcon" size={16} className="text-gold" />
                    </div>
                    <p className="text-[10px] uppercase tracking-wide font-semibold text-luxury-muted">
                      Tổng Khách Hàng
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-charcoal font-display">
                    {customersLoading ? '...' : customers.length}
                  </p>
                </div>
                <div className="bg-white border border-gray-100 p-5 rounded-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-gold/10 rounded-sm flex items-center justify-center">
                      <Icon name="ShoppingBagIcon" size={16} className="text-gold" />
                    </div>
                    <p className="text-[10px] uppercase tracking-wide font-semibold text-luxury-muted">
                      Đã Đặt Hàng
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-charcoal font-display">
                    {customersLoading ? '...' : customers.filter((c) => c.orderCount > 0).length}
                  </p>
                </div>
                <div className="bg-white border border-gray-100 p-5 rounded-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-gold/10 rounded-sm flex items-center justify-center">
                      <Icon name="BanknotesIcon" size={16} className="text-gold" />
                    </div>
                    <p className="text-[10px] uppercase tracking-wide font-semibold text-luxury-muted">
                      Tổng Chi Tiêu
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-charcoal font-display">
                    {customersLoading
                      ? '...'
                      : `${customers.reduce((s, c) => s + c.totalSpend, 0).toLocaleString('vi-VN')}đ`}
                  </p>
                </div>
              </div>

              <div className="hidden sm:block bg-white border border-gray-100 rounded-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100">
                  <h2 className="font-semibold text-sm text-charcoal">
                    {customersLoading ? 'Đang tải...' : `${filteredCustomers.length} khách hàng`}
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        {[
                          'Khách Hàng',
                          'Email',
                          'Điện Thoại',
                          'Đơn Hàng',
                          'Tổng Chi Tiêu',
                          'Đơn Gần Nhất',
                          'Ngày Đăng Ký',
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-luxury-muted whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {customersLoading ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-10 text-center text-xs text-luxury-muted"
                          >
                            Đang tải khách hàng...
                          </td>
                        </tr>
                      ) : filteredCustomers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-10 text-center text-xs text-luxury-muted"
                          >
                            Không có khách hàng.
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((customer) => (
                          <tr
                            key={customer.id}
                            className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors"
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {customer.avatar_url ? (
                                    <img
                                      src={customer.avatar_url}
                                      alt={customer.full_name}
                                      className="w-full h-full object-cover rounded-full"
                                    />
                                  ) : (
                                    <span className="text-xs font-bold text-gold">
                                      {(customer.full_name || customer.email || '?')
                                        .charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-semibold text-charcoal max-w-[200px] truncate">
                                  {customer.full_name || '—'}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-xs text-charcoal-light max-w-[180px] truncate">
                              {customer.email || '—'}
                            </td>
                            <td className="px-4 py-4 text-xs text-charcoal-light">
                              {customer.phone || '—'}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-sm border ${customer.orderCount > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                              >
                                {customer.orderCount} đơn
                              </span>
                            </td>
                            <td className="px-4 py-4 text-xs font-bold text-charcoal">
                              {customer.totalSpend > 0
                                ? `${customer.totalSpend.toLocaleString('vi-VN')}đ`
                                : '—'}
                            </td>
                            <td className="px-4 py-4 text-xs text-luxury-muted">
                              {customer.lastOrderAt
                                ? new Date(customer.lastOrderAt).toLocaleDateString('vi-VN')
                                : '—'}
                            </td>
                            <td className="px-4 py-4 text-xs text-luxury-muted">
                              {new Date(customer.created_at).toLocaleDateString('vi-VN')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="sm:hidden space-y-3">
                {customersLoading ? (
                  <div className="py-8 text-center text-xs text-luxury-muted">
                    Đang tải khách hàng...
                  </div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="py-8 text-center text-xs text-luxury-muted">
                    Không có khách hàng.
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="bg-white border border-gray-100 rounded-sm p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {customer.avatar_url ? (
                            <img
                              src={customer.avatar_url}
                              alt={customer.full_name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <span className="text-sm font-bold text-gold">
                              {(customer.full_name || customer.email || '?')
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-charcoal truncate">
                            {customer.full_name || '—'}
                          </p>
                          <p className="text-[10px] text-luxury-muted truncate">{customer.email}</p>
                          {customer.phone && (
                            <p className="text-[10px] text-luxury-muted">{customer.phone}</p>
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-sm border flex-shrink-0 ${customer.orderCount > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                        >
                          {customer.orderCount} đơn
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-2">
                        <div>
                          <p className="text-[10px] text-luxury-muted">Tổng chi tiêu</p>
                          <p className="text-xs font-bold text-charcoal">
                            {customer.totalSpend > 0
                              ? `${customer.totalSpend.toLocaleString('vi-VN')}đ`
                              : '—'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-luxury-muted">Đăng ký</p>
                          <p className="text-xs text-charcoal-light">
                            {new Date(customer.created_at).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
