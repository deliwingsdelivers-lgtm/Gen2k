-- ====================================================
-- COMPLETE SETUP SCRIPT FOR BHAIRUHA RESTAURANT OMS
-- Run this in Supabase SQL Editor
-- ====================================================

-- Step 1: Link created auth users to staff table
-- This will automatically use the user IDs from auth.users
DO $$
DECLARE
  server_user_id uuid;
  kitchen_user_id uuid;
  admin_user_id uuid;
BEGIN
  -- Get user IDs from auth.users
  SELECT id INTO server_user_id FROM auth.users WHERE email = 'server@bhairuha.local';
  SELECT id INTO kitchen_user_id FROM auth.users WHERE email = 'kitchen@bhairuha.local';
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@bhairuha.local';

  -- Insert into staff table if users exist
  IF server_user_id IS NOT NULL THEN
    INSERT INTO staff (id, email, full_name, role, is_active)
    VALUES (server_user_id, 'server@bhairuha.local', 'Arsath Malik', 'server', true)
    ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE 'Server user linked to staff table';
  ELSE
    RAISE WARNING 'Server user not found in auth.users';
  END IF;

  IF kitchen_user_id IS NOT NULL THEN
    INSERT INTO staff (id, email, full_name, role, is_active)
    VALUES (kitchen_user_id, 'kitchen@bhairuha.local', 'Bhairuha Kitchen', 'kitchen', true)
    ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE 'Kitchen user linked to staff table';
  ELSE
    RAISE WARNING 'Kitchen user not found in auth.users';
  END IF;

  IF admin_user_id IS NOT NULL THEN
    INSERT INTO staff (id, email, full_name, role, is_active)
    VALUES (admin_user_id, 'admin@bhairuha.local', 'Bhairuha Admin', 'admin', true)
    ON CONFLICT (id) DO NOTHING;
    RAISE NOTICE 'Admin user linked to staff table';
  ELSE
    RAISE WARNING 'Admin user not found in auth.users';
  END IF;
END $$;

-- Step 2: Create restaurant tables
INSERT INTO tables (table_number, status) VALUES
(1, 'free'),
(2, 'free'),
(3, 'free'),
(4, 'free'),
(5, 'free'),
(6, 'free'),
(7, 'free'),
(8, 'free'),
(9, 'free'),
(10, 'free')
ON CONFLICT (table_number) DO NOTHING;

-- Step 3: Add menu items
INSERT INTO menu_items (name, category, price, description, is_available) VALUES
-- Appetizers
('Spring Rolls', 'Appetizers', 250, 'Crispy vegetable spring rolls with sweet chili sauce', true),
('Samosa (3pc)', 'Appetizers', 200, 'Golden fried pastries with spiced potato filling', true),
('Pakora Mix', 'Appetizers', 280, 'Mixed vegetable fritters with tamarind sauce', true),
('Paneer Tikka', 'Appetizers', 350, 'Grilled cottage cheese cubes with yogurt marinade', true),
('Chicken Tikka', 'Appetizers', 380, 'Marinated chicken pieces grilled to perfection', true),
('Fish Tikka', 'Appetizers', 420, 'Fresh fish cubes with spice marinade', true),
('Garlic Bread', 'Appetizers', 180, 'Toasted bread with garlic butter and herbs', true),
('Cheese Garlic Bread', 'Appetizers', 220, 'Garlic bread topped with melted cheese', true),
('Onion Bhaji', 'Appetizers', 220, 'Crispy onion rings with gram flour coating', true),
('Mushroom Momo', 'Appetizers', 260, 'Steamed dumplings with mushroom filling', true),

-- Mains - Vegetarian
('Paneer Butter Masala', 'Mains - Veg', 420, 'Soft paneer in creamy tomato sauce with spices', true),
('Chana Masala', 'Mains - Veg', 280, 'Chickpeas in aromatic tomato-based curry', true),
('Aloo Gobi', 'Mains - Veg', 260, 'Potatoes and cauliflower with turmeric and spices', true),
('Palak Paneer', 'Mains - Veg', 380, 'Paneer in spinach-based creamy sauce', true),
('Mushroom Masala', 'Mains - Veg', 350, 'Button mushrooms in spiced creamy sauce', true),
('Vegetable Biryani', 'Mains - Veg', 380, 'Fragrant basmati rice with mixed vegetables and spices', true),
('Paneer Biryani', 'Mains - Veg', 420, 'Basmati rice layered with paneer and aromatic spices', true),
('Masala Dosa', 'Mains - Veg', 320, 'Crispy crepe with spiced potato filling', true),
('Paneer Dosa', 'Mains - Veg', 340, 'Crispy crepe with paneer and potato filling', true),
('Mixed Vegetable Curry', 'Mains - Veg', 310, 'Seasonal vegetables in aromatic gravy', true),

-- Mains - Non-Vegetarian
('Butter Chicken', 'Mains - Non-Veg', 480, 'Tender chicken in rich creamy tomato sauce', true),
('Chicken Tikka Masala', 'Mains - Non-Veg', 500, 'Grilled chicken in aromatic spiced cream sauce', true),
('Chicken Chettinad', 'Mains - Non-Veg', 450, 'Chicken with roasted spices and coconut', true),
('Lamb Curry', 'Mains - Non-Veg', 520, 'Tender lamb pieces in aromatic spiced gravy', true),
('Lamb Biryani', 'Mains - Non-Veg', 520, 'Fragrant basmati rice with lamb and spices', true),
('Fish Curry', 'Mains - Non-Veg', 450, 'Fresh fish in aromatic coconut-based sauce', true),
('Fish Tikka Masala', 'Mains - Non-Veg', 480, 'Grilled fish in creamy tomato sauce', true),
('Shrimp Curry', 'Mains - Non-Veg', 520, 'Tender shrimp in spiced coconut sauce', true),
('Chicken Biryani', 'Mains - Non-Veg', 480, 'Basmati rice with tender chicken and spices', true),
('Tandoori Chicken', 'Mains - Non-Veg', 420, 'Chicken marinated and clay-oven roasted', true),

-- Rice & Breads
('Fried Rice', 'Rice & Bread', 280, 'Wok-tossed rice with vegetables and sauce', true),
('Egg Fried Rice', 'Rice & Bread', 320, 'Fried rice with scrambled eggs', true),
('Chicken Fried Rice', 'Rice & Bread', 380, 'Fried rice with diced chicken', true),
('Plain Rice', 'Rice & Bread', 100, 'Steamed basmati rice', true),
('Garlic Naan', 'Rice & Bread', 180, 'Flatbread topped with garlic and cilantro', true),
('Butter Naan', 'Rice & Bread', 160, 'Classic Indian flatbread with butter', true),
('Cheese Naan', 'Rice & Bread', 220, 'Flatbread stuffed with melted cheese', true),
('Roti/Chapati', 'Rice & Bread', 40, 'Whole wheat Indian flatbread', true),
('Paratha', 'Rice & Bread', 120, 'Layered Indian flatbread with ghee', true),
('Pulao', 'Rice & Bread', 240, 'Aromatic rice with whole spices', true),

-- Desserts
('Gulab Jamun', 'Desserts', 180, 'Soft milk solids in sugar syrup', true),
('Rasgulla', 'Desserts', 160, 'Soft cheese balls in sugar syrup', true),
('Kheer', 'Desserts', 150, 'Rice pudding with milk and cardamom', true),
('Jalebi', 'Desserts', 140, 'Spiral-shaped fried sweet', true),
('Barfi', 'Desserts', 200, 'Milk fudge with nuts', true),
('Halwa', 'Desserts', 190, 'Semolina or carrot pudding', true),
('Ice Cream', 'Desserts', 120, 'Vanilla, chocolate, or strawberry', true),
('Kulfi', 'Desserts', 130, 'Traditional Indian ice cream on stick', true),

-- Beverages
('Water', 'Beverages', 20, 'Mineral water', true),
('Masala Chai', 'Beverages', 80, 'Spiced Indian tea', true),
('Coffee', 'Beverages', 100, 'Hot brewed coffee', true),
('Lassi', 'Beverages', 120, 'Yogurt-based sweet or salt drink', true),
('Mango Shake', 'Beverages', 180, 'Mango smoothie with milk', true),
('Fresh Juice', 'Beverages', 140, 'Orange, pineapple, or mixed fruit juice', true),
('Iced Tea', 'Beverages', 100, 'Chilled sweet or lime tea', true),
('Smoothie Bowl', 'Beverages', 250, 'Thick smoothie with granola and fruit toppings', true)
ON CONFLICT DO NOTHING;

-- Verification queries
SELECT 'Staff count:' as info, COUNT(*) as count FROM staff
UNION ALL
SELECT 'Tables count:', COUNT(*) FROM tables
UNION ALL
SELECT 'Menu items count:', COUNT(*) FROM menu_items;

-- Show created staff
SELECT email, full_name, role FROM staff ORDER BY role;
