-- Migration: Insert 10 sample Gift Box products
-- Timestamp: 20260318050000

DO $$
DECLARE
    cat_giftboxes UUID;
BEGIN
    -- Fetch Gift Box category ID
    SELECT id INTO cat_giftboxes FROM public.categories WHERE slug = 'gift-boxes' LIMIT 1;

    -- Fallback: use first available category if gift-boxes not found
    IF cat_giftboxes IS NULL THEN
        SELECT id INTO cat_giftboxes FROM public.categories ORDER BY sort_order LIMIT 1;
    END IF;

    INSERT INTO public.products (
        id, category_id, name, name_vi, slug, description, description_vi,
        price, original_price, image_url, image_alt, sku,
        stock_quantity, is_active, is_new, is_best_seller, is_featured,
        material, weight_grams, tags
    )
    VALUES
    (
        gen_random_uuid(), cat_giftboxes,
        'Romantic Rose Gold Gift Set', 'Bộ Quà Tặng Vàng Hồng Lãng Mạn',
        'bo-qua-tang-vang-hong-lang-man',
        'A romantic gift set featuring a rose gold heart necklace and matching stud earrings, presented in a premium pink velvet box. Perfect for anniversaries and Valentine''s Day.',
        'Bộ quà tặng lãng mạn gồm dây chuyền trái tim vàng hồng và bông tai đôi đồng bộ, được đựng trong hộp nhung hồng cao cấp. Hoàn hảo cho ngày kỷ niệm và Valentine.',
        4850000, 5600000,
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
        'Bộ quà tặng vàng hồng gồm dây chuyền và bông tai trong hộp nhung hồng',
        'GIFT-002', 20, true, true, true, true,
        'Vàng hồng 14k', 8.5,
        ARRAY['hộp quà', 'vàng hồng', 'dây chuyền', 'bông tai', 'lãng mạn', 'valentine']
    ),
    (
        gen_random_uuid(), cat_giftboxes,
        'Pearl Elegance Gift Box', 'Hộp Quà Ngọc Trai Thanh Lịch',
        'hop-qua-ngoc-trai-thanh-lich',
        'An elegant gift box containing a freshwater pearl necklace, pearl drop earrings, and a pearl bracelet. A timeless set for the sophisticated woman.',
        'Hộp quà thanh lịch gồm dây chuyền ngọc trai nước ngọt, bông tai ngọc trai và vòng tay ngọc trai. Bộ trang sức vượt thời gian dành cho người phụ nữ tinh tế.',
        6200000, 7500000,
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
        'Hộp quà ngọc trai thanh lịch gồm dây chuyền bông tai và vòng tay',
        'GIFT-003', 15, true, false, true, false,
        'Ngọc trai nước ngọt, Vàng 14k', 14.2,
        ARRAY['hộp quà', 'ngọc trai', 'dây chuyền', 'bông tai', 'vòng tay', 'thanh lịch']
    ),
    (
        gen_random_uuid(), cat_giftboxes,
        'Diamond Sparkle Gift Set', 'Bộ Quà Tặng Kim Cương Lấp Lánh',
        'bo-qua-tang-kim-cuong-lap-lanh',
        'A dazzling gift set with a diamond solitaire pendant and matching diamond stud earrings in 18k white gold. Comes in a luxury black velvet box with a ribbon.',
        'Bộ quà tặng lấp lánh gồm mặt dây chuyền kim cương solitaire và bông tai kim cương đồng bộ bằng vàng trắng 18k. Được đựng trong hộp nhung đen sang trọng có ruy băng.',
        18500000, 22000000,
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
        'Bộ quà tặng kim cương lấp lánh gồm mặt dây chuyền và bông tai vàng trắng 18k',
        'GIFT-004', 8, true, true, false, true,
        'Vàng trắng 18k, Kim cương', 6.8,
        ARRAY['hộp quà', 'kim cương', 'dây chuyền', 'bông tai', 'vàng trắng', 'sang trọng']
    ),
    (
        gen_random_uuid(), cat_giftboxes,
        'Birthday Charm Gift Box', 'Hộp Quà Sinh Nhật Charm',
        'hop-qua-sinh-nhat-charm',
        'A delightful birthday gift box featuring a charm bracelet with 5 meaningful charms including a star, heart, moon, flower, and butterfly. Packaged in a festive gift box.',
        'Hộp quà sinh nhật thú vị gồm vòng tay charm với 5 mặt dây ý nghĩa gồm ngôi sao, trái tim, mặt trăng, hoa và bướm. Được đóng gói trong hộp quà lễ hội.',
        2950000, 3500000,
        'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
        'Hộp quà sinh nhật vòng tay charm với 5 mặt dây ngôi sao trái tim mặt trăng hoa bướm',
        'GIFT-005', 30, true, true, false, false,
        'Bạc 925 mạ vàng', 10.3,
        ARRAY['hộp quà', 'sinh nhật', 'charm', 'vòng tay', 'ngôi sao', 'trái tim']
    ),
    (
        gen_random_uuid(), cat_giftboxes,
        'Mother''s Day Jewelry Gift Set', 'Bộ Trang Sức Quà Tặng Ngày Của Mẹ',
        'bo-trang-suc-qua-tang-ngay-cua-me',
        'A heartfelt Mother''s Day gift set with a gold infinity necklace and matching infinity ring, symbolizing endless love. Presented in a floral-themed gift box.',
        'Bộ quà tặng Ngày của Mẹ đầy cảm xúc gồm dây chuyền vô cực vàng và nhẫn vô cực đồng bộ, tượng trưng cho tình yêu vô tận. Được đựng trong hộp quà chủ đề hoa.',
        5400000, 6200000,
        'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=600&q=80',
        'Bộ quà tặng Ngày của Mẹ gồm dây chuyền và nhẫn vô cực vàng trong hộp hoa',
        'GIFT-006', 18, true, false, true, false,
        'Vàng vàng 14k', 7.6,
        ARRAY['hộp quà', 'ngày của mẹ', 'vô cực', 'dây chuyền', 'nhẫn', 'tình yêu']
    ),
    (
        gen_random_uuid(), cat_giftboxes,
        'Luxury Sapphire Gift Box', 'Hộp Quà Sapphire Sang Trọng',
        'hop-qua-sapphire-sang-trong',
        'A luxurious gift box featuring a deep blue sapphire pendant necklace and sapphire drop earrings set in 18k yellow gold. A regal gift for special occasions.',
        'Hộp quà sang trọng gồm dây chuyền mặt sapphire xanh đậm và bông tai sapphire được chế tác bằng vàng vàng 18k. Món quà hoàng gia cho những dịp đặc biệt.',
        12800000, 15000000,
        'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80',
        'Hộp quà sapphire sang trọng gồm dây chuyền và bông tai vàng vàng 18k',
        'GIFT-007', 10, true, false, true, true,
        'Vàng vàng 18k, Sapphire', 9.4,
        ARRAY['hộp quà', 'sapphire', 'xanh', 'dây chuyền', 'bông tai', 'sang trọng']
    ),
    (
        gen_random_uuid(), cat_giftboxes,
        'Minimalist Silver Gift Set', 'Bộ Quà Tặng Bạc Tối Giản',
        'bo-qua-tang-bac-toi-gian',
        'A chic minimalist gift set with a thin silver bar necklace, small hoop earrings, and a delicate bangle bracelet. Ideal for everyday wear and gifting.',
        'Bộ quà tặng tối giản thanh lịch gồm dây chuyền thanh bạc mỏng, bông tai khuyên nhỏ và vòng tay bangle tinh tế. Lý tưởng để đeo hàng ngày và làm quà tặng.',
        2200000, 2700000,
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
        'Bộ quà tặng bạc tối giản gồm dây chuyền bông tai và vòng tay bangle',
        'GIFT-008', 35, true, true, false, false,
        'Bạc 925', 11.0,
        ARRAY['hộp quà', 'bạc', 'tối giản', 'dây chuyền', 'bông tai', 'vòng tay']
    ),
    (
        gen_random_uuid(), cat_giftboxes,
        'Emerald Anniversary Gift Box', 'Hộp Quà Kỷ Niệm Đá Emerald',
        'hop-qua-ky-niem-da-emerald',
        'A stunning anniversary gift box with a vivid green emerald pendant and matching emerald stud earrings in 18k white gold. Celebrate love with this exquisite set.',
        'Hộp quà kỷ niệm ấn tượng gồm mặt dây chuyền emerald xanh rực rỡ và bông tai emerald đồng bộ bằng vàng trắng 18k. Kỷ niệm tình yêu với bộ trang sức tinh xảo này.',
        9800000, 11500000,
        'https://images.unsplash.com/photo-1589674781759-c21c37956a44?w=600&q=80',
        'Hộp quà kỷ niệm đá emerald xanh gồm mặt dây chuyền và bông tai vàng trắng 18k',
        'GIFT-009', 12, true, false, false, true,
        'Vàng trắng 18k, Emerald', 8.1,
        ARRAY['hộp quà', 'emerald', 'xanh lá', 'kỷ niệm', 'dây chuyền', 'bông tai']
    ),
    (
        gen_random_uuid(), cat_giftboxes,
        'Graduation Jewelry Gift Set', 'Bộ Trang Sức Quà Tặng Tốt Nghiệp',
        'bo-trang-suc-qua-tang-tot-nghiep',
        'A celebratory graduation gift set featuring a gold star pendant necklace and star stud earrings. A meaningful gift to mark a milestone achievement.',
        'Bộ quà tặng tốt nghiệp đặc biệt gồm dây chuyền mặt ngôi sao vàng và bông tai ngôi sao. Món quà ý nghĩa để đánh dấu cột mốc thành tích quan trọng.',
        3600000, 4200000,
        'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80',
        'Bộ quà tặng tốt nghiệp gồm dây chuyền và bông tai ngôi sao vàng',
        'GIFT-010', 25, true, true, false, false,
        'Vàng vàng 14k', 6.0,
        ARRAY['hộp quà', 'tốt nghiệp', 'ngôi sao', 'dây chuyền', 'bông tai', 'kỷ niệm']
    ),
    (
        gen_random_uuid(), cat_giftboxes,
        'Luxury Ruby Love Gift Box', 'Hộp Quà Tình Yêu Ruby Sang Trọng',
        'hop-qua-tinh-yeu-ruby-sang-trong',
        'A passionate gift box featuring a ruby heart pendant necklace, ruby stud earrings, and a ruby tennis bracelet in 18k rose gold. The ultimate declaration of love.',
        'Hộp quà đam mê gồm dây chuyền mặt trái tim ruby, bông tai ruby và vòng tay tennis ruby bằng vàng hồng 18k. Lời tuyên bố tình yêu tuyệt vời nhất.',
        24500000, 29000000,
        'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80',
        'Hộp quà tình yêu ruby sang trọng gồm dây chuyền bông tai và vòng tay vàng hồng 18k',
        'GIFT-011', 6, true, true, true, true,
        'Vàng hồng 18k, Ruby', 16.5,
        ARRAY['hộp quà', 'ruby', 'đỏ', 'tình yêu', 'dây chuyền', 'bông tai', 'vòng tay', 'sang trọng']
    )
    ON CONFLICT (slug) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Gift Box products insertion failed: %', SQLERRM;
END $$;
