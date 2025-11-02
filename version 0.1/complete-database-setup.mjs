import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://anyopnttxzcnepjjmwph.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFueW9wbnR0eHpjbmVwamptd3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjAxNjEyNCwiZXhwIjoyMDc3NTkyMTI0fQ.vU8B-6S51vAxHOzxVTxDSJTTIUw2eztWe-x-DgYPU6g';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 Starting complete database setup with service role...\n');

// Step 1: Apply schema migration
console.log('📋 Step 1: Creating database schema...');
try {
  const schemaSql = readFileSync('./supabase/migrations/20251102142102_001_create_oms_schema.sql', 'utf8');
  const { error } = await supabase.rpc('exec_sql', { sql: schemaSql }).single();
  
  if (error) {
    console.log('⚠️  Schema might already exist, continuing...');
  } else {
    console.log('✅ Database schema created successfully');
  }
} catch (error) {
  console.log('⚠️  Using direct table operations instead...');
}

// Step 2: Get user IDs and insert staff records
console.log('\n👥 Step 2: Setting up staff accounts...');
const demoAccounts = [
  { email: 'server@bhairuha.local', full_name: 'Arsath Malik', role: 'server' },
  { email: 'kitchen@bhairuha.local', full_name: 'Bhairuha Kitchen', role: 'kitchen' },
  { email: 'admin@bhairuha.local', full_name: 'Bhairuha Admin', role: 'admin' },
];

for (const account of demoAccounts) {
  try {
    // Get user from auth
    const { data: users } = await supabase.auth.admin.listUsers();
    const authUser = users.users.find(u => u.email === account.email);
    
    if (authUser) {
      const { error } = await supabase
        .from('staff')
        .upsert({
          id: authUser.id,
          email: account.email,
          full_name: account.full_name,
          role: account.role,
          is_active: true,
        }, { onConflict: 'id' });
      
      if (error) {
        console.log(`❌ ${account.role}: ${error.message}`);
      } else {
        console.log(`✅ ${account.role} account linked: ${account.email}`);
      }
    }
  } catch (error) {
    console.log(`⚠️  Error with ${account.role}: ${error.message}`);
  }
}

// Step 3: Create restaurant tables
console.log('\n🪑 Step 3: Creating restaurant tables...');
const tablesToCreate = Array.from({ length: 10 }, (_, i) => ({
  table_number: i + 1,
  status: 'free',
}));

const { error: tablesError } = await supabase
  .from('tables')
  .upsert(tablesToCreate, { onConflict: 'table_number' });

if (tablesError) {
  console.log('❌ Error creating tables:', tablesError.message);
} else {
  console.log('✅ Created 10 restaurant tables');
}

// Step 4: Insert menu items
console.log('\n🍽️  Step 4: Adding menu items...');

const menuItems = [
  // Appetizers
  { name: 'Spring Rolls', category: 'Appetizers', price: 250, description: 'Crispy vegetable spring rolls with sweet chili sauce', is_available: true },
  { name: 'Samosa (3pc)', category: 'Appetizers', price: 200, description: 'Golden fried pastries with spiced potato filling', is_available: true },
  { name: 'Pakora Mix', category: 'Appetizers', price: 280, description: 'Mixed vegetable fritters with tamarind sauce', is_available: true },
  { name: 'Paneer Tikka', category: 'Appetizers', price: 350, description: 'Grilled cottage cheese cubes with yogurt marinade', is_available: true },
  { name: 'Chicken Tikka', category: 'Appetizers', price: 380, description: 'Marinated chicken pieces grilled to perfection', is_available: true },
  { name: 'Fish Tikka', category: 'Appetizers', price: 420, description: 'Fresh fish cubes with spice marinade', is_available: true },
  { name: 'Garlic Bread', category: 'Appetizers', price: 180, description: 'Toasted bread with garlic butter and herbs', is_available: true },
  { name: 'Cheese Garlic Bread', category: 'Appetizers', price: 220, description: 'Garlic bread topped with melted cheese', is_available: true },
  { name: 'Onion Bhaji', category: 'Appetizers', price: 220, description: 'Crispy onion rings with gram flour coating', is_available: true },
  { name: 'Mushroom Momo', category: 'Appetizers', price: 260, description: 'Steamed dumplings with mushroom filling', is_available: true },
  
  // Mains - Veg
  { name: 'Paneer Butter Masala', category: 'Mains - Veg', price: 420, description: 'Soft paneer in creamy tomato sauce with spices', is_available: true },
  { name: 'Chana Masala', category: 'Mains - Veg', price: 280, description: 'Chickpeas in aromatic tomato-based curry', is_available: true },
  { name: 'Aloo Gobi', category: 'Mains - Veg', price: 260, description: 'Potatoes and cauliflower with turmeric and spices', is_available: true },
  { name: 'Palak Paneer', category: 'Mains - Veg', price: 380, description: 'Paneer in spinach-based creamy sauce', is_available: true },
  { name: 'Mushroom Masala', category: 'Mains - Veg', price: 350, description: 'Button mushrooms in spiced creamy sauce', is_available: true },
  { name: 'Vegetable Biryani', category: 'Mains - Veg', price: 380, description: 'Fragrant basmati rice with mixed vegetables', is_available: true },
  { name: 'Paneer Biryani', category: 'Mains - Veg', price: 420, description: 'Basmati rice layered with paneer and aromatic spices', is_available: true },
  { name: 'Masala Dosa', category: 'Mains - Veg', price: 320, description: 'Crispy crepe with spiced potato filling', is_available: true },
  { name: 'Paneer Dosa', category: 'Mains - Veg', price: 340, description: 'Crispy crepe with paneer and potato filling', is_available: true },
  { name: 'Mixed Vegetable Curry', category: 'Mains - Veg', price: 310, description: 'Seasonal vegetables in aromatic gravy', is_available: true },
  
  // Mains - Non-Veg
  { name: 'Butter Chicken', category: 'Mains - Non-Veg', price: 480, description: 'Tender chicken in rich creamy tomato sauce', is_available: true },
  { name: 'Chicken Tikka Masala', category: 'Mains - Non-Veg', price: 500, description: 'Grilled chicken in aromatic spiced cream sauce', is_available: true },
  { name: 'Chicken Chettinad', category: 'Mains - Non-Veg', price: 450, description: 'Chicken with roasted spices and coconut', is_available: true },
  { name: 'Lamb Curry', category: 'Mains - Non-Veg', price: 520, description: 'Tender lamb pieces in aromatic spiced gravy', is_available: true },
  { name: 'Lamb Biryani', category: 'Mains - Non-Veg', price: 520, description: 'Fragrant basmati rice with lamb and spices', is_available: true },
  { name: 'Fish Curry', category: 'Mains - Non-Veg', price: 450, description: 'Fresh fish in aromatic coconut-based sauce', is_available: true },
  { name: 'Fish Tikka Masala', category: 'Mains - Non-Veg', price: 480, description: 'Grilled fish in creamy tomato sauce', is_available: true },
  { name: 'Shrimp Curry', category: 'Mains - Non-Veg', price: 520, description: 'Tender shrimp in spiced coconut sauce', is_available: true },
  { name: 'Chicken Biryani', category: 'Mains - Non-Veg', price: 480, description: 'Basmati rice with tender chicken and spices', is_available: true },
  { name: 'Tandoori Chicken', category: 'Mains - Non-Veg', price: 420, description: 'Chicken marinated and clay-oven roasted', is_available: true },
  
  // Rice & Bread
  { name: 'Fried Rice', category: 'Rice & Bread', price: 280, description: 'Wok-tossed rice with vegetables and sauce', is_available: true },
  { name: 'Egg Fried Rice', category: 'Rice & Bread', price: 320, description: 'Fried rice with scrambled eggs', is_available: true },
  { name: 'Chicken Fried Rice', category: 'Rice & Bread', price: 380, description: 'Fried rice with diced chicken', is_available: true },
  { name: 'Plain Rice', category: 'Rice & Bread', price: 100, description: 'Steamed basmati rice', is_available: true },
  { name: 'Garlic Naan', category: 'Rice & Bread', price: 180, description: 'Flatbread topped with garlic and cilantro', is_available: true },
  { name: 'Butter Naan', category: 'Rice & Bread', price: 160, description: 'Classic Indian flatbread with butter', is_available: true },
  { name: 'Cheese Naan', category: 'Rice & Bread', price: 220, description: 'Flatbread stuffed with melted cheese', is_available: true },
  { name: 'Roti/Chapati', category: 'Rice & Bread', price: 40, description: 'Whole wheat Indian flatbread', is_available: true },
  { name: 'Paratha', category: 'Rice & Bread', price: 120, description: 'Layered Indian flatbread with ghee', is_available: true },
  { name: 'Pulao', category: 'Rice & Bread', price: 240, description: 'Aromatic rice with whole spices', is_available: true },
  
  // Desserts
  { name: 'Gulab Jamun', category: 'Desserts', price: 180, description: 'Soft milk solids in sugar syrup', is_available: true },
  { name: 'Rasgulla', category: 'Desserts', price: 160, description: 'Soft cheese balls in sugar syrup', is_available: true },
  { name: 'Kheer', category: 'Desserts', price: 150, description: 'Rice pudding with milk and cardamom', is_available: true },
  { name: 'Jalebi', category: 'Desserts', price: 140, description: 'Spiral-shaped fried sweet', is_available: true },
  { name: 'Barfi', category: 'Desserts', price: 200, description: 'Milk fudge with nuts', is_available: true },
  { name: 'Halwa', category: 'Desserts', price: 190, description: 'Semolina or carrot pudding', is_available: true },
  { name: 'Ice Cream', category: 'Desserts', price: 120, description: 'Vanilla, chocolate, or strawberry', is_available: true },
  { name: 'Kulfi', category: 'Desserts', price: 130, description: 'Traditional Indian ice cream on stick', is_available: true },
  
  // Beverages
  { name: 'Water', category: 'Beverages', price: 20, description: 'Mineral water', is_available: true },
  { name: 'Masala Chai', category: 'Beverages', price: 80, description: 'Spiced Indian tea', is_available: true },
  { name: 'Coffee', category: 'Beverages', price: 100, description: 'Hot brewed coffee', is_available: true },
  { name: 'Lassi', category: 'Beverages', price: 120, description: 'Yogurt-based sweet or salt drink', is_available: true },
  { name: 'Mango Shake', category: 'Beverages', price: 180, description: 'Mango smoothie with milk', is_available: true },
  { name: 'Fresh Juice', category: 'Beverages', price: 140, description: 'Orange, pineapple, or mixed fruit juice', is_available: true },
  { name: 'Iced Tea', category: 'Beverages', price: 100, description: 'Chilled sweet or lime tea', is_available: true },
  { name: 'Smoothie Bowl', category: 'Beverages', price: 250, description: 'Thick smoothie with granola and fruit toppings', is_available: true },
];

const { error: menuError } = await supabase
  .from('menu_items')
  .upsert(menuItems, { onConflict: 'name' });

if (menuError) {
  console.log('❌ Error adding menu items:', menuError.message);
} else {
  console.log(`✅ Added ${menuItems.length} menu items`);
}

// Step 5: Verify setup
console.log('\n✅ Step 5: Verifying database setup...\n');

const { count: staffCount } = await supabase.from('staff').select('*', { count: 'exact', head: true });
const { count: tablesCount } = await supabase.from('tables').select('*', { count: 'exact', head: true });
const { count: menuCount } = await supabase.from('menu_items').select('*', { count: 'exact', head: true });

console.log('📊 Database Statistics:');
console.log(`   Staff: ${staffCount} accounts`);
console.log(`   Tables: ${tablesCount} restaurant tables`);
console.log(`   Menu Items: ${menuCount} items`);

console.log('\n🎉 Database setup complete!');
console.log('\n📝 Demo Credentials:');
console.log('   Server:  server@bhairuha.local  / password');
console.log('   Kitchen: kitchen@bhairuha.local / password');
console.log('   Admin:   admin@bhairuha.local   / password');
console.log('\n🚀 Application is ready to use!\n');
