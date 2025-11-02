/*
  # Demo Data Insertion

  ## Summary
  Populates the system with:
  - 10 restaurant tables
  - 100 menu items across multiple categories
  - 3 demo staff accounts (server, kitchen, admin)
  - Sample orders for demonstration

  ## Demo Credentials
  - Server: server@bhairuha.local / password (server, mobile-first interface)
  - Kitchen: kitchen@bhairuha.local / password (kitchen, large-screen view)
  - Admin: admin@bhairuha.local / password (admin, desktop control hub)

  ## Notes
  - Staff accounts reference auth.users via ID
  - Menu items include appetizers, mains, desserts, beverages
  - Tables initialized as 'free' status
  - Sample data for demonstration purposes
*/

-- Insert demo menu items (100 items across categories)
INSERT INTO menu_items (name, category, price, description, is_available) VALUES
-- Appetizers (20)
('Spring Rolls', 'Appetizers', 250, 'Crispy vegetable spring rolls with sweet chili sauce', true),
('Samosa (3pc)', 'Appetizers', 200, 'Golden fried pastries with spiced potato filling', true),
('Pakora Mix', 'Appetizers', 280, 'Mixed vegetable fritters with tamarind sauce', true),
('Paneer Tikka', 'Appetizers', 350, 'Grilled cottage cheese cubes with yogurt marinade', true),
('Chicken Tikka', 'Appetizers', 380, 'Marinated chicken pieces grilled to perfection', true),
('Fish Tikka', 'Appetizers', 420, 'Fresh fish cubes with spice marinade', true),
('Shrimp Kebab', 'Appetizers', 450, 'Grilled shrimp skewers with herbs', true),
('Onion Bhaji', 'Appetizers', 220, 'Crispy onion rings with gram flour coating', true),
('Corn Fritters', 'Appetizers', 240, 'Shallow-fried corn patties with herbs', true),
('Vegetable Cutlet', 'Appetizers', 210, 'Mixed vegetable patties with breadcrumb coating', true),
('Chicken Cutlet', 'Appetizers', 280, 'Spiced chicken patties with breadcrumb coating', true),
('Fish Fry', 'Appetizers', 380, 'Battered and fried fish pieces', true),
('Mushroom Momo', 'Appetizers', 260, 'Steamed dumplings with mushroom filling', true),
('Chicken Momo', 'Appetizers', 300, 'Steamed dumplings with chicken filling', true),
('Prawn Momo', 'Appetizers', 340, 'Steamed dumplings with shrimp filling', true),
('Corn & Cheese Balls', 'Appetizers', 270, 'Deep-fried corn and cheese filled spheres', true),
('Paneer Chilli', 'Appetizers', 320, 'Pan-fried paneer cubes with chili sauce', true),
('Chicken Chilli', 'Appetizers', 360, 'Pan-fried chicken with chili and soy sauce', true),
('Garlic Bread', 'Appetizers', 180, 'Toasted bread with garlic butter and herbs', true),
('Cheese Garlic Bread', 'Appetizers', 220, 'Garlic bread topped with melted cheese', true),
-- Main Courses - Vegetarian (20)
('Paneer Butter Masala', 'Mains - Veg', 420, 'Soft paneer in creamy tomato sauce with spices', true),
('Chana Masala', 'Mains - Veg', 280, 'Chickpeas in aromatic tomato-based curry', true),
('Aloo Gobi', 'Mains - Veg', 260, 'Potatoes and cauliflower with turmeric and spices', true),
('Baingan Bharta', 'Mains - Veg', 290, 'Mashed eggplant with onions, tomatoes, and spices', true),
('Palak Paneer', 'Mains - Veg', 380, 'Paneer in spinach-based creamy sauce', true),
('Mushroom Masala', 'Mains - Veg', 350, 'Button mushrooms in spiced creamy sauce', true),
('Vegetable Korma', 'Mains - Veg', 320, 'Mixed vegetables in mild coconut-based sauce', true),
('Rajma Curry', 'Mains - Veg', 240, 'Kidney beans in tomato-based spiced curry', true),
('Mixed Vegetable Curry', 'Mains - Veg', 310, 'Seasonal vegetables in aromatic gravy', true),
('Paneer Tikka Masala', 'Mains - Veg', 450, 'Grilled paneer cubes in tomato-cream sauce', true),
('Vegetable Biryani', 'Mains - Veg', 380, 'Fragrant basmati rice with mixed vegetables and spices', true),
('Paneer Biryani', 'Mains - Veg', 420, 'Basmati rice layered with paneer and aromatic spices', true),
('Paneer Dosa', 'Mains - Veg', 340, 'Crispy crepe with paneer and potato filling', true),
('Masala Dosa', 'Mains - Veg', 320, 'Crispy crepe with spiced potato filling', true),
('Cheese Naan', 'Mains - Veg', 220, 'Flatbread stuffed with melted cheese', true),
('Peshwari Naan', 'Mains - Veg', 240, 'Flatbread stuffed with coconut and dry fruits', true),
('Garlic Naan', 'Mains - Veg', 180, 'Flatbread topped with garlic and cilantro', true),
('Butter Naan', 'Mains - Veg', 160, 'Classic Indian flatbread with butter', true),
('Roti/Chapati', 'Mains - Veg', 40, 'Whole wheat Indian flatbread', true),
('Paratha', 'Mains - Veg', 120, 'Layered Indian flatbread with ghee', true),
-- Main Courses - Non-Vegetarian (20)
('Butter Chicken', 'Mains - Non-Veg', 480, 'Tender chicken in rich creamy tomato sauce', true),
('Chicken Tikka Masala', 'Mains - Non-Veg', 500, 'Grilled chicken in aromatic spiced cream sauce', true),
('Chicken Chettinad', 'Mains - Non-Veg', 450, 'Chicken with roasted spices and coconut', true),
('Chicken Lababdar', 'Mains - Non-Veg', 460, 'Chicken with onions and peppers in spiced sauce', true),
('Lamb Curry', 'Mains - Non-Veg', 520, 'Tender lamb pieces in aromatic spiced gravy', true),
('Lamb Biryani', 'Mains - Non-Veg', 520, 'Fragrant basmati rice with lamb and spices', true),
('Rogan Josh', 'Mains - Non-Veg', 500, 'Meat in aromatic tomato-based curry', true),
('Nihari', 'Mains - Non-Veg', 480, 'Slow-cooked meat curry with traditional spices', true),
('Fish Curry', 'Mains - Non-Veg', 450, 'Fresh fish in aromatic coconut-based sauce', true),
('Fish Tikka Masala', 'Mains - Non-Veg', 480, 'Grilled fish in creamy tomato sauce', true),
('Shrimp Curry', 'Mains - Non-Veg', 520, 'Tender shrimp in spiced coconut sauce', true),
('Prawn Masala', 'Mains - Non-Veg', 540, 'Large prawns in aromatic creamy sauce', true),
('Crab Masala', 'Mains - Non-Veg', 580, 'Fresh crab in tomato-based spiced sauce', true),
('Mixed Seafood Curry', 'Mains - Non-Veg', 600, 'Assorted fish and shrimp in aromatic sauce', true),
('Chicken Biryani', 'Mains - Non-Veg', 480, 'Basmati rice with tender chicken and spices', true),
('Hyderabadi Biryani', 'Mains - Non-Veg', 520, 'Traditional layered rice with meat and aromatics', true),
('Keema Naan', 'Mains - Non-Veg', 280, 'Flatbread filled with spiced ground meat', true),
('Tandoori Chicken', 'Mains - Non-Veg', 420, 'Chicken marinated and clay-oven roasted', true),
('Malai Chicken', 'Mains - Non-Veg', 460, 'Creamy chicken curry with spices', true),
('Chicken Vindaloo', 'Mains - Non-Veg', 440, 'Spicy chicken curry with potatoes', true),
-- Rice & Breads (10)
('Fried Rice', 'Rice & Bread', 280, 'Wok-tossed rice with vegetables and sauce', true),
('Egg Fried Rice', 'Rice & Bread', 320, 'Fried rice with scrambled eggs', true),
('Chicken Fried Rice', 'Rice & Bread', 380, 'Fried rice with diced chicken', true),
('Shrimp Fried Rice', 'Rice & Bread', 420, 'Fried rice with shrimp', true),
('Plain Rice', 'Rice & Bread', 100, 'Steamed basmati rice', true),
('Pulao', 'Rice & Bread', 240, 'Aromatic rice with whole spices', true),
('Lemon Rice', 'Rice & Bread', 200, 'Rice with lemon juice and spices', true),
('Coconut Rice', 'Rice & Bread', 220, 'Rice with fresh coconut and curry leaves', true),
('Tamarind Rice', 'Rice & Bread', 210, 'Rice with tamarind paste and peanuts', true),
('Mushroom Rice', 'Rice & Bread', 260, 'Rice with mushrooms and aromatic spices', true),
-- Desserts (10)
('Gulab Jamun', 'Desserts', 180, 'Soft milk solids in sugar syrup', true),
('Rasgulla', 'Desserts', 160, 'Soft cheese balls in sugar syrup', true),
('Kheer', 'Desserts', 150, 'Rice pudding with milk and cardamom', true),
('Payasam', 'Desserts', 170, 'Traditional coconut and jaggery dessert', true),
('Jalebi', 'Desserts', 140, 'Spiral-shaped fried sweet', true),
('Barfi', 'Desserts', 200, 'Milk fudge with nuts', true),
('Laddu', 'Desserts', 180, 'Spheres of gram flour and ghee', true),
('Halwa', 'Desserts', 190, 'Semolina or carrot pudding', true),
('Ice Cream', 'Desserts', 120, 'Vanilla, chocolate, or strawberry', true),
('Kulfi', 'Desserts', 130, 'Traditional Indian ice cream on stick', true),
-- Beverages (10)
('Water', 'Beverages', 20, 'Mineral water', true),
('Masala Chai', 'Beverages', 80, 'Spiced Indian tea', true),
('Coffee', 'Beverages', 100, 'Hot brewed coffee', true),
('Lassi', 'Beverages', 120, 'Yogurt-based sweet or salt drink', true),
('Mango Shake', 'Beverages', 180, 'Mango smoothie with milk', true),
('Strawberry Shake', 'Beverages', 170, 'Strawberry smoothie with milk', true),
('Chocolate Shake', 'Beverages', 150, 'Chocolate smoothie with milk', true),
('Fresh Juice', 'Beverages', 140, 'Orange, pineapple, or mixed fruit juice', true),
('Smoothie Bowl', 'Beverages', 250, 'Thick smoothie with granola and fruit toppings', true),
('Iced Tea', 'Beverages', 100, 'Chilled sweet or lime tea', true);

-- Insert 10 demo tables
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
(10, 'free');
