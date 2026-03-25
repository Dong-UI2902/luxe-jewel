'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { useCart } from '@/contexts/CartContext';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  notes: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
}

type PaymentMethod = 'cod' | 'bank_transfer';

// ─── Constants ────────────────────────────────────────────────────────────────

const RING_SIZES = ['6', '7', '8', '9', '10'];

const isRingProduct = (name: string): boolean => {
  const lower = name.toLowerCase();
  return lower.includes('nhẫn') || lower.includes('nhan') || lower.includes('ring');
};

// Helper: get material options for a cart item from its stored materialOptions or material string
function getItemMaterialOptions(item: { material?: string; materialOptions?: string[] }): string[] {
  if (item.materialOptions && item.materialOptions.length > 0) return item.materialOptions;
  if (item.material) {
    const parts = item.material.split(',').map((m) => m.trim()).filter(Boolean);
    if (parts.length > 0) return parts;
  }
  return [];
}

// ─── Bank Info Box ────────────────────────────────────────────────────────────

const BankTransferInfo: React.FC<{ orderNumber: string; phone: string }> = ({ orderNumber, phone }) => (
  <div className="mt-5 p-5 bg-amber-50 border border-amber-200 rounded-sm">
    <div className="flex items-center gap-2 mb-4">
      <Icon name="BanknotesIcon" size={18} className="text-amber-700" />
      <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wide">Thông tin chuyển khoản</h4>
    </div>
    <div className="space-y-2 text-sm mb-4">
      <div className="flex justify-between">
        <span className="text-amber-700 font-medium">Ngân hàng:</span>
        <span className="text-amber-900 font-semibold">[Tên Ngân Hàng]</span>
      </div>
      <div className="flex justify-between">
        <span className="text-amber-700 font-medium">Số tài khoản:</span>
        <span className="text-amber-900 font-semibold font-mono">[Số Tài Khoản]</span>
      </div>
      <div className="flex justify-between">
        <span className="text-amber-700 font-medium">Chủ tài khoản:</span>
        <span className="text-amber-900 font-semibold">[Tên Chủ TK]</span>
      </div>
      <div className="flex justify-between items-start">
        <span className="text-amber-700 font-medium">Nội dung CK:</span>
        <span className="text-amber-900 font-semibold text-right">
          {orderNumber || 'Mã đơn'} {phone || 'SĐT'}
        </span>
      </div>
    </div>
    <div className="bg-amber-100 border border-amber-300 p-3 rounded-sm">
      <p className="text-xs text-amber-800 leading-relaxed">
        📸 Khách chuyển khoản xong chụp lại màn hình giao dịch và gửi vào{' '}
        <strong>Zalo</strong> trên màn hình để được xác nhận.
      </p>
    </div>
  </div>
);

// ─── Order Summary Sidebar ────────────────────────────────────────────────────

const OrderSummary: React.FC<{
  subtotal: number;
  itemSizes: Record<string, string>;
  itemMaterials: Record<string, string>;
  setItemSizes: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setItemMaterials: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}> = ({ subtotal, itemSizes, itemMaterials, setItemSizes, setItemMaterials }) => {
  const { items, updateQuantity, removeFromCart } = useCart();
  const [openSizeDropdown, setOpenSizeDropdown] = useState<string | null>(null);
  const [openMaterialDropdown, setOpenMaterialDropdown] = useState<string | null>(null);

  // Initialize local size/material state from cart items
  useEffect(() => {
    const sizes: Record<string, string> = {};
    const materials: Record<string, string> = {};
    items.forEach((item) => {
      if (item.size) sizes[item.id] = item.size;
      if (item.material) materials[item.id] = item.material;
    });
    setItemSizes(sizes);
    setItemMaterials(materials);
  }, []);

  const handleSizeSelect = (itemId: string, size: string) => {
    setItemSizes((prev) => ({ ...prev, [itemId]: size }));
    setOpenSizeDropdown(null);
  };

  const handleMaterialSelect = (itemId: string, material: string) => {
    setItemMaterials((prev) => ({ ...prev, [itemId]: material }));
    setOpenMaterialDropdown(null);
  };

  const handleQuantityChange = (itemId: string, delta: number, currentQty: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQty);
    }
  };

  return (
    <div className="bg-luxury-warm border border-luxury-border p-6 sticky top-24">
      <h3 className="font-display text-lg font-medium text-charcoal mb-6">Tóm tắt đơn hàng</h3>

      <div className="space-y-5 mb-6 pb-6 border-b border-luxury-border">
        {items.map((item) => {
          const isRing = isRingProduct(item.name);
          const currentSize = itemSizes[item.id] || item.size || '';
          const currentMaterial = itemMaterials[item.id] || item.material || '';

          return (
            <div key={item.id} className="flex gap-3">
              {/* Image */}
              <div className="relative w-16 h-20 flex-shrink-0 bg-luxury-white">
                <AppImage src={item.image} alt={item.name} fill className="object-cover" />
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-charcoal leading-tight">{item.name}</p>

                {/* Material display / dropdown */}
                <div className="relative mt-1">
                  {(() => {
                    const materialOpts = getItemMaterialOptions(item);
                    if (materialOpts.length === 0) {
                      // No material options — show static text if material is set
                      return currentMaterial ? (
                        <span className="text-[10px] text-luxury-muted">{currentMaterial}</span>
                      ) : null;
                    }
                    if (materialOpts.length === 1) {
                      // Single material — show as static text
                      return <span className="text-[10px] text-luxury-muted">{materialOpts[0]}</span>;
                    }
                    // Multiple materials — show dropdown
                    return (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMaterialDropdown(openMaterialDropdown === item.id ? null : item.id);
                            setOpenSizeDropdown(null);
                          }}
                          className="flex items-center gap-1 text-[10px] text-luxury-muted hover:text-gold transition-colors"
                        >
                          <span>{currentMaterial || 'Chọn chất liệu'}</span>
                          <Icon name="ChevronDownIcon" size={10} />
                        </button>
                        {openMaterialDropdown === item.id && (
                          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-luxury-border shadow-md min-w-[130px]">
                            {materialOpts.map((mat) => (
                              <button
                                key={mat}
                                type="button"
                                onClick={() => handleMaterialSelect(item.id, mat)}
                                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-luxury-warm transition-colors ${
                                  currentMaterial === mat ? 'text-gold font-semibold' : 'text-charcoal'
                                }`}
                              >
                                {mat}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Size display / dropdown — only for rings */}
                {isRing && (
                  <div className="relative mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenSizeDropdown(openSizeDropdown === item.id ? null : item.id);
                        setOpenMaterialDropdown(null);
                      }}
                      className="flex items-center gap-1 text-[10px] text-luxury-muted hover:text-gold transition-colors"
                    >
                      <span>Size: {currentSize || 'Chọn size'}</span>
                      <Icon name="ChevronDownIcon" size={10} />
                    </button>
                    {openSizeDropdown === item.id && (
                      <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-luxury-border shadow-md">
                        <div className="grid grid-cols-4 gap-0">
                          {RING_SIZES.map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => handleSizeSelect(item.id, size)}
                              className={`px-3 py-1.5 text-xs text-center hover:bg-luxury-warm transition-colors border-b border-r border-luxury-border/50 ${
                                currentSize === size ? 'bg-gold/10 text-gold font-semibold' : 'text-charcoal'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Price */}
                <p className="text-sm font-semibold text-charcoal mt-1.5">
                  {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                </p>

                {/* Quantity controls */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.id, -1, item.quantity)}
                    className="w-6 h-6 flex items-center justify-center border border-luxury-border text-charcoal hover:border-gold hover:text-gold transition-colors text-sm leading-none"
                    aria-label="Giảm số lượng"
                  >
                    −
                  </button>
                  <span className="text-xs font-medium text-charcoal w-4 text-center">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.id, 1, item.quantity)}
                    className="w-6 h-6 flex items-center justify-center border border-luxury-border text-charcoal hover:border-gold hover:text-gold transition-colors text-sm leading-none"
                    aria-label="Tăng số lượng"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-charcoal-light">Tạm tính</span>
          <span className="text-charcoal font-medium">{subtotal.toLocaleString('vi-VN')}đ</span>
        </div>
        <div className="flex justify-between">
          <span className="text-charcoal-light">Phí vận chuyển</span>
          <span className="text-green-600 font-medium">Miễn phí</span>
        </div>
        <div className="flex justify-between pt-3 border-t border-luxury-border">
          <span className="font-semibold text-charcoal">Tổng cộng</span>
          <span className="font-bold text-charcoal text-lg">{subtotal.toLocaleString('vi-VN')}đ</span>
        </div>
      </div>
    </div>
  );
};

// ─── Vietnamese Location Data ─────────────────────────────────────────────────

const VN_LOCATIONS: Record<string, Record<string, string[]>> = {
  'Hà Nội': {
    'Quận Ba Đình': ['Phường Cống Vị', 'Phường Điện Biên', 'Phường Đội Cấn', 'Phường Giảng Võ', 'Phường Kim Mã', 'Phường Liễu Giai', 'Phường Ngọc Hà', 'Phường Ngọc Khánh', 'Phường Phúc Xá', 'Phường Quán Thánh', 'Phường Thành Công', 'Phường Trúc Bạch', 'Phường Vĩnh Phúc'],
    'Quận Hoàn Kiếm': ['Phường Chương Dương', 'Phường Cửa Đông', 'Phường Cửa Nam', 'Phường Đồng Xuân', 'Phường Hàng Bạc', 'Phường Hàng Bài', 'Phường Hàng Bồ', 'Phường Hàng Buồm', 'Phường Hàng Đào', 'Phường Hàng Gai', 'Phường Hàng Mã', 'Phường Hàng Trống', 'Phường Lý Thái Tổ', 'Phường Phan Chu Trinh', 'Phường Phúc Tân', 'Phường Tràng Tiền', 'Phường Trần Hưng Đạo', 'Phường Đông Kinh Nghĩa Thục'],
    'Quận Đống Đa': ['Phường Cát Linh', 'Phường Hàng Bột', 'Phường Khâm Thiên', 'Phường Kim Liên', 'Phường Láng Hạ', 'Phường Láng Thượng', 'Phường Nam Đồng', 'Phường Ngã Tư Sở', 'Phường Ô Chợ Dừa', 'Phường Phương Liên', 'Phường Phương Mai', 'Phường Quang Trung', 'Phường Quốc Tử Giám', 'Phường Thịnh Quang', 'Phường Thổ Quan', 'Phường Trung Liệt', 'Phường Trung Phụng', 'Phường Trung Tự', 'Phường Văn Chương', 'Phường Văn Miếu', 'Phường Xã Đàn'],
    'Quận Hai Bà Trưng': ['Phường Bách Khoa', 'Phường Bạch Đằng', 'Phường Bạch Mai', 'Phường Bùi Thị Xuân', 'Phường Cầu Dền', 'Phường Đồng Nhân', 'Phường Đồng Tâm', 'Phường Lê Đại Hành', 'Phường Minh Khai', 'Phường Nguyễn Du', 'Phường Phạm Đình Hổ', 'Phường Phố Huế', 'Phường Quỳnh Lôi', 'Phường Quỳnh Mai', 'Phường Thanh Lương', 'Phường Thanh Nhàn', 'Phường Trương Định', 'Phường Vĩnh Tuy'],
    'Quận Cầu Giấy': ['Phường Dịch Vọng', 'Phường Dịch Vọng Hậu', 'Phường Mai Dịch', 'Phường Nghĩa Đô', 'Phường Nghĩa Tân', 'Phường Quan Hoa', 'Phường Trung Hòa', 'Phường Yên Hòa'],
    'Quận Thanh Xuân': ['Phường Hạ Đình', 'Phường Khương Đình', 'Phường Khương Mai', 'Phường Khương Trung', 'Phường Kim Giang', 'Phường Nhân Chính', 'Phường Phương Liệt', 'Phường Thanh Xuân Bắc', 'Phường Thanh Xuân Nam', 'Phường Thanh Xuân Trung', 'Phường Thượng Đình'],
    'Quận Hoàng Mai': ['Phường Đại Kim', 'Phường Định Công', 'Phường Giáp Bát', 'Phường Hoàng Liệt', 'Phường Hoàng Văn Thụ', 'Phường Lĩnh Nam', 'Phường Mai Động', 'Phường Tân Mai', 'Phường Thanh Trì', 'Phường Thịnh Liệt', 'Phường Tương Mai', 'Phường Vĩnh Hưng', 'Phường Yên Sở'],
    'Quận Long Biên': ['Phường Bồ Đề', 'Phường Cự Khối', 'Phường Đức Giang', 'Phường Gia Thụy', 'Phường Giang Biên', 'Phường Long Biên', 'Phường Ngọc Lâm', 'Phường Ngọc Thụy', 'Phường Phúc Đồng', 'Phường Phúc Lợi', 'Phường Sài Đồng', 'Phường Thạch Bàn', 'Phường Thượng Thanh', 'Phường Việt Hưng'],
  },
  'TP. Hồ Chí Minh': {
    'Quận 1': ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Kho', 'Phường Cầu Ông Lãnh', 'Phường Cô Giang', 'Phường Đa Kao', 'Phường Nguyễn Cư Trinh', 'Phường Nguyễn Thái Bình', 'Phường Phạm Ngũ Lão', 'Phường Tân Định'],
    'Quận 3': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14'],
    'Quận 5': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'],
    'Quận 7': ['Phường Bình Thuận', 'Phường Phú Mỹ', 'Phường Phú Thuận', 'Phường Tân Hưng', 'Phường Tân Kiểng', 'Phường Tân Phong', 'Phường Tân Phú', 'Phường Tân Quy', 'Phường Tân Thuận Đông', 'Phường Tân Thuận Tây'],
    'Quận Bình Thạnh': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 17', 'Phường 19', 'Phường 21', 'Phường 22', 'Phường 24', 'Phường 25', 'Phường 26', 'Phường 27', 'Phường 28'],
    'Quận Tân Bình': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'],
    'Quận Gò Vấp': ['Phường 1', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16', 'Phường 17'],
    'Thành phố Thủ Đức': ['Phường An Khánh', 'Phường An Lợi Đông', 'Phường An Phú', 'Phường Bình Chiểu', 'Phường Bình Thọ', 'Phường Bình Trưng Đông', 'Phường Bình Trưng Tây', 'Phường Cát Lái', 'Phường Hiệp Bình Chánh', 'Phường Hiệp Bình Phước', 'Phường Hiệp Phú', 'Phường Linh Chiểu', 'Phường Linh Đông', 'Phường Linh Tây', 'Phường Linh Trung', 'Phường Linh Xuân', 'Phường Long Bình', 'Phường Long Phước', 'Phường Long Thạnh Mỹ', 'Phường Long Trường', 'Phường Phú Hữu', 'Phường Phước Bình', 'Phường Phước Long A', 'Phường Phước Long B', 'Phường Tam Bình', 'Phường Tam Phú', 'Phường Tân Phú', 'Phường Thảo Điền', 'Phường Thủ Thiêm', 'Phường Trường Thạnh', 'Phường Trường Thọ'],
  },
  'Đà Nẵng': {
    'Quận Hải Châu': ['Phường Bình Hiên', 'Phường Bình Thuận', 'Phường Hải Châu 1', 'Phường Hải Châu 2', 'Phường Hòa Cường Bắc', 'Phường Hòa Cường Nam', 'Phường Hòa Thuận Đông', 'Phường Hòa Thuận Tây', 'Phường Nam Dương', 'Phường Phước Ninh', 'Phường Thạch Thang', 'Phường Thanh Bình', 'Phường Thuận Phước'],
    'Quận Thanh Khê': ['Phường An Khê', 'Phường Chính Gián', 'Phường Hòa Khê', 'Phường Tam Thuận', 'Phường Tân Chính', 'Phường Thạc Gián', 'Phường Thanh Khê Đông', 'Phường Thanh Khê Tây', 'Phường Vĩnh Trung', 'Phường Xuân Hà'],
    'Quận Sơn Trà': ['Phường An Hải Bắc', 'Phường An Hải Đông', 'Phường An Hải Tây', 'Phường Mân Thái', 'Phường Nại Hiên Đông', 'Phường Phước Mỹ', 'Phường Thọ Quang'],
    'Quận Ngũ Hành Sơn': ['Phường Hòa Hải', 'Phường Hòa Quý', 'Phường Khuê Mỹ', 'Phường Mỹ An'],
    'Quận Liên Chiểu': ['Phường Hòa Hiệp Bắc', 'Phường Hòa Hiệp Nam', 'Phường Hòa Khánh Bắc', 'Phường Hòa Khánh Nam', 'Phường Hòa Minh'],
    'Quận Cẩm Lệ': ['Phường Hòa An', 'Phường Hòa Phát', 'Phường Hòa Thọ Đông', 'Phường Hòa Thọ Tây', 'Phường Hòa Xuân', 'Phường Khuê Trung'],
  },
  'Hải Phòng': {
    'Quận Hồng Bàng': ['Phường Hoàng Văn Thụ', 'Phường Minh Khai', 'Phường Phan Bội Châu', 'Phường Quán Toan', 'Phường Sở Dầu', 'Phường Thượng Lý', 'Phường Trại Chuối', 'Phường Trần Nguyên Hãn'],
    'Quận Lê Chân': ['Phường An Biên', 'Phường An Dương', 'Phường Cát Dài', 'Phường Dư Hàng', 'Phường Dư Hàng Kênh', 'Phường Đông Hải', 'Phường Hàng Kênh', 'Phường Lam Sơn', 'Phường Nghĩa Xá', 'Phường Niệm Nghĩa', 'Phường Trần Nguyên Hãn', 'Phường Vĩnh Niệm'],
    'Quận Ngô Quyền': ['Phường Cầu Đất', 'Phường Cầu Tre', 'Phường Đằng Giang', 'Phường Đằng Hải', 'Phường Đằng Lâm', 'Phường Đổng Quốc Bình', 'Phường Gia Viên', 'Phường Lạc Viên', 'Phường Lê Lợi', 'Phường Máy Chai', 'Phường Máy Tơ', 'Phường Vạn Mỹ'],
  },
  'Cần Thơ': {
    'Quận Ninh Kiều': ['Phường An Bình', 'Phường An Cư', 'Phường An Hòa', 'Phường An Khánh', 'Phường An Lạc', 'Phường An Nghiệp', 'Phường An Phú', 'Phường Cái Khế', 'Phường Hưng Lợi', 'Phường Tân An', 'Phường Thới Bình', 'Phường Xuân Khánh'],
    'Quận Bình Thủy': ['Phường An Thới', 'Phường Bình Thủy', 'Phường Bùi Hữu Nghĩa', 'Phường Long Hòa', 'Phường Long Tuyền', 'Phường Thới An Đông', 'Phường Trà An', 'Phường Trà Nóc'],
    'Quận Cái Răng': ['Phường Ba Láng', 'Phường Hưng Phú', 'Phường Hưng Thạnh', 'Phường Lê Bình', 'Phường Phú Thứ', 'Phường Tân Phú', 'Phường Thường Thạnh'],
  },
  'Bình Dương': {
    'Thành phố Thủ Dầu Một': ['Phường Chánh Mỹ', 'Phường Chánh Nghĩa', 'Phường Định Hòa', 'Phường Hiệp An', 'Phường Hiệp Thành', 'Phường Hòa Phú', 'Phường Phú Cường', 'Phường Phú Hòa', 'Phường Phú Lợi', 'Phường Phú Mỹ', 'Phường Phú Thọ', 'Phường Tân An', 'Phường Tương Bình Hiệp'],
    'Thành phố Dĩ An': ['Phường An Bình', 'Phường Bình An', 'Phường Bình Thắng', 'Phường Đông Hòa', 'Phường Dĩ An', 'Phường Tân Bình', 'Phường Tân Đông Hiệp'],
    'Thành phố Thuận An': ['Phường An Phú', 'Phường An Thạnh', 'Phường Bình Chuẩn', 'Phường Bình Hòa', 'Phường Bình Nhâm', 'Phường Hưng Định', 'Phường Lái Thiêu', 'Phường Thuận Giao', 'Phường Vĩnh Phú'],
  },
  'Đồng Nai': {
    'Thành phố Biên Hòa': ['Phường An Bình', 'Phường An Hòa', 'Phường Bình Đa', 'Phường Bửu Hòa', 'Phường Bửu Long', 'Phường Hiệp Hòa', 'Phường Hòa Bình', 'Phường Hố Nai', 'Phường Long Bình', 'Phường Long Bình Tân', 'Phường Quang Vinh', 'Phường Quyết Thắng', 'Phường Tam Hiệp', 'Phường Tam Hòa', 'Phường Tân Biên', 'Phường Tân Hiệp', 'Phường Tân Mai', 'Phường Tân Phong', 'Phường Tân Tiến', 'Phường Tân Vạn', 'Phường Thanh Bình', 'Phường Thống Nhất', 'Phường Trảng Dài', 'Phường Trung Dũng'],
  },
  'Khánh Hòa': {
    'Thành phố Nha Trang': ['Phường Lộc Thọ', 'Phường Ngọc Hiệp', 'Phường Phong Phú', 'Phường Phước Hải', 'Phường Phước Hòa', 'Phường Phước Long', 'Phường Phước Tân', 'Phường Phước Tiến', 'Phường Tân Lập', 'Phường Vạn Thắng', 'Phường Vạn Thạnh', 'Phường Vĩnh Hải', 'Phường Vĩnh Hòa', 'Phường Vĩnh Nguyên', 'Phường Vĩnh Phước', 'Phường Vĩnh Thọ', 'Phường Vĩnh Trường', 'Phường Xương Huân'],
  },
  'Lâm Đồng': {
    'Thành phố Đà Lạt': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Xã Tà Nung', 'Xã Xuân Thọ', 'Xã Xuân Trường'],
  },
  'Thừa Thiên Huế': {
    'Thành phố Huế': ['Phường An Cựu', 'Phường An Đông', 'Phường An Hòa', 'Phường An Tây', 'Phường Đông Ba', 'Phường Gia Hội', 'Phường Hương Long', 'Phường Kim Long', 'Phường Phú Bình', 'Phường Phú Cát', 'Phường Phú Hiệp', 'Phường Phú Hội', 'Phường Phú Nhuận', 'Phường Phú Thuận', 'Phường Phước Vĩnh', 'Phường Tây Lộc', 'Phường Thuận Hòa', 'Phường Thuận Lộc', 'Phường Thuận Thành', 'Phường Trường An', 'Phường Vĩ Dạ', 'Phường Vĩnh Ninh', 'Phường Xuân Phú'],
  },
  'Quảng Nam': {
    'Thành phố Hội An': ['Phường Cẩm An', 'Phường Cẩm Châu', 'Phường Cẩm Nam', 'Phường Cẩm Phô', 'Phường Cẩm Thanh', 'Phường Cửa Đại', 'Phường Minh An', 'Phường Sơn Phong', 'Phường Tân An', 'Phường Thanh Hà'],
    'Thành phố Tam Kỳ': ['Phường An Mỹ', 'Phường An Sơn', 'Phường An Xuân', 'Phường Hòa Hương', 'Phường Phước Hòa', 'Phường Tân Thạnh', 'Phường Trường Xuân'],
  },
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ShoppingCartCheckoutPage() {
  const router = useRouter();
  const { items, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [itemSizes, setItemSizes] = useState<Record<string, string>>({});
  const [itemMaterials, setItemMaterials] = useState<Record<string, string>>({});

  // Generate a preview order number for the bank transfer note
  useEffect(() => {
    const num = `LJ-${Date.now().toString().slice(-8)}`;
    setOrderNumber(num);
  }, []);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ và tên.';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Họ và tên phải có ít nhất 2 ký tự.';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại.';
    } else if (!/^(0|\+84)[3-9][0-9]{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ (VD: 0901 234 567).';
    }

    if (!formData.address.trim()) {
      errors.address = 'Vui lòng nhập địa chỉ giao hàng.';
    } else if (formData.address.trim().length < 5) {
      errors.address = 'Địa chỉ phải có ít nhất 5 ký tự.';
    }

    if (!formData.city.trim()) {
      errors.city = 'Vui lòng chọn tỉnh / thành phố.';
    }

    if (formData.city && !formData.district.trim()) {
      errors.district = 'Vui lòng chọn quận / huyện.';
    }

    if (formData.district && !formData.ward.trim()) {
      errors.ward = 'Vui lòng chọn phường / xã.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (field: keyof FormData, value: string) => {
    if (field === 'city') {
      setFormData((prev) => ({ ...prev, city: value, district: '', ward: '' }));
      setFormErrors((prev) => ({ ...prev, city: undefined, district: undefined, ward: undefined }));
      return;
    }
    if (field === 'district') {
      setFormData((prev) => ({ ...prev, district: value, ward: '' }));
      setFormErrors((prev) => ({ ...prev, district: undefined, ward: undefined }));
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const inputClass =
    'w-full px-4 py-3 border bg-luxury-white text-sm text-charcoal focus:outline-none focus:border-gold transition-colors placeholder:text-luxury-muted';
  const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-charcoal-light mb-1.5';
  const errorClass = 'mt-1.5 text-xs text-red-600 flex items-center gap-1';

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (items.length === 0) {
      setError('Giỏ hàng trống.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      // user comes from AuthContext (already resolved from session)

      const finalOrderNumber = orderNumber || `LJ-${Date.now().toString().slice(-8)}`;
      const orderStatus = paymentMethod === 'bank_transfer' ? 'awaiting_confirmation' : 'pending';

      // Insert order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user?.id ?? null,
          order_number: finalOrderNumber,
          status: orderStatus,
          payment_method: paymentMethod,
          subtotal: cartTotal,
          shipping_fee: 0,
          discount_amount: 0,
          total_amount: cartTotal,
          shipping_name: formData.fullName,
          shipping_phone: formData.phone,
          shipping_address: [formData.address, formData.ward, formData.district].filter(Boolean).join(', '),
          shipping_city: formData.city,
          notes: formData.notes || null,
        })
        .select('id')
        .single();

      if (orderError) {
        console.error('Order insert error:', orderError);
        setError(`Không thể tạo đơn hàng: ${orderError.message}`);
        setIsSubmitting(false);
        return;
      }

      // Insert order items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.productId || null,
        product_name: item.name,
        product_image: item.image || null,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        size: itemSizes[item.id] || item.size || null,
        material: itemMaterials[item.id] || item.material || null,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

      if (itemsError) {
        console.error('Order items insert error:', itemsError);
        setError(`Lỗi khi lưu sản phẩm: ${itemsError.message}`);
        setIsSubmitting(false);
        return;
      }

      // Send Telegram notification (non-blocking)
      fetch('/api/telegram-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_method: paymentMethod,
          customer_name: formData.fullName,
          phone: formData.phone,
          total_amount: cartTotal,
          order_id: finalOrderNumber,
        }),
      }).catch(() => {});

      // Clear cart and redirect
      clearCart();
      router.push(`/order-success?order_id=${orderData.id}`);
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-white">
      <Header />

      <main className="pt-14 sm:pt-16 md:pt-20">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-10">
          {/* Page Title */}
          <div className="text-center mb-8 sm:mb-10">
            <Link href="/homepage" className="inline-flex items-center gap-2 mb-3 sm:mb-4">
              <span className="font-display text-xl sm:text-2xl font-semibold tracking-wide text-charcoal">LuxeJewel</span>
            </Link>
            <h1 className="font-display text-2xl sm:text-3xl font-light text-charcoal">Thanh toán</h1>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-16 sm:py-20 border border-luxury-border bg-luxury-warm/30 max-w-md mx-auto">
              <Icon name="ShoppingBagIcon" size={40} className="text-luxury-muted mx-auto mb-4" />
              <p className="font-display text-xl font-light text-charcoal mb-2">Giỏ hàng trống</p>
              <p className="text-luxury-muted text-sm mb-6">Hãy thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
              <Link
                href="/product-listing"
                className="inline-block px-8 py-3.5 bg-gold text-charcoal text-sm font-semibold hover:bg-gold-light transition-colors min-h-[48px]"
              >
                Xem bộ sưu tập
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 sm:gap-10">
              {/* Left: Form */}
              <div>
                {/* Shipping Info */}
                <section className="mb-7 sm:mb-8">
                  <h2 className="font-display text-lg sm:text-xl font-light text-charcoal mb-4 sm:mb-5">Thông tin giao hàng</h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className={labelClass}>Họ và tên *</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleFormChange('fullName', e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className={`${inputClass} ${formErrors.fullName ? 'border-red-400 focus:border-red-400' : 'border-luxury-border'}`}
                      />
                      {formErrors.fullName && (
                        <p className={errorClass}>
                          <Icon name="ExclamationCircleIcon" size={12} className="flex-shrink-0" />
                          {formErrors.fullName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Số điện thoại *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleFormChange('phone', e.target.value)}
                        placeholder="0901 234 567"
                        className={`${inputClass} ${formErrors.phone ? 'border-red-400 focus:border-red-400' : 'border-luxury-border'}`}
                      />
                      {formErrors.phone && (
                        <p className={errorClass}>
                          <Icon name="ExclamationCircleIcon" size={12} className="flex-shrink-0" />
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Địa chỉ *</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleFormChange('address', e.target.value)}
                        placeholder="Số nhà, tên đường"
                        className={`${inputClass} ${formErrors.address ? 'border-red-400 focus:border-red-400' : 'border-luxury-border'}`}
                      />
                      {formErrors.address && (
                        <p className={errorClass}>
                          <Icon name="ExclamationCircleIcon" size={12} className="flex-shrink-0" />
                          {formErrors.address}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Tỉnh / Thành phố *</label>
                      <div className="relative">
                        <select
                          value={formData.city}
                          onChange={(e) => handleFormChange('city', e.target.value)}
                          className={`${inputClass} appearance-none pr-8 ${formErrors.city ? 'border-red-400 focus:border-red-400' : 'border-luxury-border'}`}
                        >
                          <option value="">Chọn Tỉnh/ thành phố</option>
                          {Object.keys(VN_LOCATIONS).map((province) => (
                            <option key={province} value={province}>{province}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                          <svg className="w-4 h-4 text-luxury-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                      {formErrors.city && (
                        <p className={errorClass}>
                          <Icon name="ExclamationCircleIcon" size={12} className="flex-shrink-0" />
                          {formErrors.city}
                        </p>
                      )}
                    </div>
                    <div className="relative">
                      <label className={labelClass}>Quận/ Huyện</label>
                      <div className="relative">
                        <select
                          value={formData.district}
                          onChange={(e) => handleFormChange('district', e.target.value)}
                          disabled={!formData.city}
                          className={`${inputClass} appearance-none pr-8 ${formErrors.district ? 'border-red-400 focus:border-red-400' : 'border-luxury-border'} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <option value="">Chọn Quận/ Huyện</option>
                          {formData.city && VN_LOCATIONS[formData.city]
                            ? Object.keys(VN_LOCATIONS[formData.city]).map((district) => (
                                <option key={district} value={district}>{district}</option>
                              ))
                            : null}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                          <svg className="w-4 h-4 text-luxury-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                      {formErrors.district && (
                        <p className={errorClass}>
                          <Icon name="ExclamationCircleIcon" size={12} className="flex-shrink-0" />
                          {formErrors.district}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Phường/ Xã</label>
                        <div className="relative">
                          <select
                            value={formData.ward}
                            onChange={(e) => handleFormChange('ward', e.target.value)}
                            disabled={!formData.district}
                            className={`${inputClass} appearance-none pr-8 ${formErrors.ward ? 'border-red-400 focus:border-red-400' : 'border-luxury-border'} disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <option value="">Phường/ Xã</option>
                            {formData.city && formData.district && VN_LOCATIONS[formData.city]?.[formData.district]
                              ? VN_LOCATIONS[formData.city][formData.district].map((ward) => (
                                  <option key={ward} value={ward}>{ward}</option>
                                ))
                              : null}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                            <svg className="w-4 h-4 text-luxury-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                        {formErrors.ward && (
                          <p className={errorClass}>
                            <Icon name="ExclamationCircleIcon" size={12} className="flex-shrink-0" />
                            {formErrors.ward}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Ghi chú đơn hàng</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleFormChange('notes', e.target.value)}
                        placeholder="Ghi chú thêm cho đơn hàng (tuỳ chọn)"
                        rows={3}
                        className={`${inputClass} border-luxury-border resize-none`}
                      />
                    </div>
                  </div>
                </section>

                {/* Order Summary — shown on mobile above payment */}
                <div className="lg:hidden mb-7 sm:mb-8">
                  <OrderSummary
                    subtotal={cartTotal}
                    itemSizes={itemSizes}
                    itemMaterials={itemMaterials}
                    setItemSizes={setItemSizes}
                    setItemMaterials={setItemMaterials}
                  />
                </div>

                {/* Payment Method */}
                <section className="mb-7 sm:mb-8">
                  <h2 className="font-display text-lg sm:text-xl font-light text-charcoal mb-4 sm:mb-5">Phương thức thanh toán</h2>
                  <div className="space-y-3">
                    {/* COD */}
                    <label
                      className={`flex items-start gap-4 p-4 border cursor-pointer transition-all duration-200 ${
                        paymentMethod === 'cod' ?'border-gold bg-gold/5' :'border-luxury-border hover:border-luxury-border-dark'
                      }`}
                    >
                      <div
                        onClick={() => setPaymentMethod('cod')}
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          paymentMethod === 'cod' ? 'border-gold' : 'border-luxury-border-dark'
                        }`}
                      >
                        {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                      </div>
                      <div className="flex-1" onClick={() => setPaymentMethod('cod')}>
                        <div className="flex items-center gap-2">
                          <Icon name="TruckIcon" size={16} className="text-charcoal" />
                          <p className="text-sm font-semibold text-charcoal">Thanh toán khi nhận hàng (COD)</p>
                        </div>
                        <p className="text-xs text-luxury-muted mt-1">
                          Bạn chỉ cần thanh toán khi nhận được hàng.
                        </p>
                      </div>
                    </label>

                    {/* Bank Transfer */}
                    <label
                      className={`flex items-start gap-4 p-4 border cursor-pointer transition-all duration-200 ${
                        paymentMethod === 'bank_transfer' ?'border-gold bg-gold/5' :'border-luxury-border hover:border-luxury-border-dark'
                      }`}
                    >
                      <div
                        onClick={() => setPaymentMethod('bank_transfer')}
                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                          paymentMethod === 'bank_transfer' ? 'border-gold' : 'border-luxury-border-dark'
                        }`}
                      >
                        {paymentMethod === 'bank_transfer' && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
                      </div>
                      <div className="flex-1" onClick={() => setPaymentMethod('bank_transfer')}>
                        <div className="flex items-center gap-2">
                          <Icon name="BuildingLibraryIcon" size={16} className="text-charcoal" />
                          <p className="text-sm font-semibold text-charcoal">Chuyển khoản Ngân hàng</p>
                        </div>
                        <p className="text-xs text-luxury-muted mt-1">
                          Chuyển khoản trước, xác nhận qua Zalo.
                        </p>

                        {/* Bank details shown when selected */}
                        {paymentMethod === 'bank_transfer' && (
                          <BankTransferInfo orderNumber={orderNumber} phone={formData.phone} />
                        )}
                      </div>
                    </label>
                  </div>
                </section>

                {/* Error */}
                {error && (
                  <div className="mb-5 p-4 bg-red-50 border border-red-200 flex items-center gap-3">
                    <Icon name="ExclamationCircleIcon" size={16} className="text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-charcoal text-white font-semibold text-sm tracking-wide hover:bg-charcoal-mid transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[52px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Icon name="ShoppingBagIcon" size={16} />
                      Đặt hàng
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-luxury-muted mt-4">
                  Không cần tạo tài khoản · Đặt hàng ngay
                </p>
              </div>

              {/* Right: Order Summary — desktop only */}
              <div className="hidden lg:block">
                <OrderSummary
                  subtotal={cartTotal}
                  itemSizes={itemSizes}
                  itemMaterials={itemMaterials}
                  setItemSizes={setItemSizes}
                  setItemMaterials={setItemMaterials}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}