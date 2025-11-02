import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://anyopnttxzcnepjjmwph.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFueW9wbnR0eHpjbmVwamptd3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMTYxMjQsImV4cCI6MjA3NzU5MjEyNH0.zx6uawextc3QAI06SClijnASiBV6eal-mda3WEAZ4Yg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🚀 Starting database population...\n');

// Create demo accounts
const demoAccounts = [
  { email: 'server@bhairuha.local', password: 'password', full_name: 'Arsath Malik', role: 'server' },
  { email: 'kitchen@bhairuha.local', password: 'password', full_name: 'Bhairuha Kitchen', role: 'kitchen' },
  { email: 'admin@bhairuha.local', password: 'password', full_name: 'Bhairuha Admin', role: 'admin' },
];

console.log('👤 Creating demo user accounts...');
console.log('⚠️  Note: This requires manual creation via Supabase Dashboard\n');

for (const account of demoAccounts) {
  // Try to sign up (this will only work if auth is open for signup)
  const { data, error } = await supabase.auth.signUp({
    email: account.email,
    password: account.password,
    options: {
      data: {
        full_name: account.full_name,
        role: account.role,
      },
    },
  });

  if (error) {
    console.log(`❌ ${account.role}: ${error.message}`);
  } else if (data.user) {
    console.log(`✅ ${account.role} user created: ${account.email}`);
    
    // Try to add to staff table
    const { error: staffError } = await supabase
      .from('staff')
      .insert({
        id: data.user.id,
        email: account.email,
        full_name: account.full_name,
        role: account.role,
        is_active: true,
      });
    
    if (staffError) {
      console.log(`   ⚠️  Staff table insert failed: ${staffError.message}`);
    } else {
      console.log(`   ✅ Added to staff table`);
    }
  }
}

console.log('\n📦 Populating database with demo data...\n');

// Insert tables
console.log('🪑 Creating restaurant tables...');
const { error: tablesError } = await supabase
  .from('tables')
  .insert(
    Array.from({ length: 10 }, (_, i) => ({
      table_number: i + 1,
      status: 'free',
    }))
  );

if (tablesError) {
  console.log('❌ Error creating tables:', tablesError.message);
} else {
  console.log('✅ Created 10 restaurant tables');
}

// Insert menu items
console.log('\n🍽️  Adding menu items...');

const menuItems = [
  // Appetizers
  { name: 'Spring Rolls', category: 'Appetizers', price: 250, description: 'Crispy vegetable spring rolls with sweet chili sauce', is_available: true },
  { name: 'Samosa (3pc)', category: 'Appetizers', price: 200, description: 'Golden fried pastries with spiced potato filling', is_available: true },
  { name: 'Paneer Tikka', category: 'Appetizers', price: 350, description: 'Grilled cottage cheese cubes with yogurt marinade', is_available: true },
  { name: 'Chicken Tikka', category: 'Appetizers', price: 380, description: 'Marinated chicken pieces grilled to perfection', is_available: true },
  { name: 'Fish Tikka', category: 'Appetizers', price: 420, description: 'Fresh fish cubes with spice marinade', is_available: true },
  
  // Mains - Veg
  { name: 'Paneer Butter Masala', category: 'Mains - Veg', price: 420, description: 'Soft paneer in creamy tomato sauce with spices', is_available: true },
  { name: 'Chana Masala', category: 'Mains - Veg', price: 280, description: 'Chickpeas in aromatic tomato-based curry', is_available: true },
  { name: 'Palak Paneer', category: 'Mains - Veg', price: 380, description: 'Paneer in spinach-based creamy sauce', is_available: true },
  { name: 'Vegetable Biryani', category: 'Mains - Veg', price: 380, description: 'Fragrant basmati rice with mixed vegetables', is_available: true },
  { name: 'Masala Dosa', category: 'Mains - Veg', price: 320, description: 'Crispy crepe with spiced potato filling', is_available: true },
  
  // Mains - Non-Veg
  { name: 'Butter Chicken', category: 'Mains - Non-Veg', price: 480, description: 'Tender chicken in rich creamy tomato sauce', is_available: true },
  { name: 'Chicken Tikka Masala', category: 'Mains - Non-Veg', price: 500, description: 'Grilled chicken in aromatic spiced cream sauce', is_available: true },
  { name: 'Lamb Biryani', category: 'Mains - Non-Veg', price: 520, description: 'Fragrant basmati rice with lamb and spices', is_available: true },
  { name: 'Fish Curry', category: 'Mains - Non-Veg', price: 450, description: 'Fresh fish in aromatic coconut-based sauce', is_available: true },
  { name: 'Chicken Biryani', category: 'Mains - Non-Veg', price: 480, description: 'Basmati rice with tender chicken and spices', is_available: true },
  
  // Rice & Bread
  { name: 'Garlic Naan', category: 'Rice & Bread', price: 180, description: 'Flatbread topped with garlic and cilantro', is_available: true },
  { name: 'Butter Naan', category: 'Rice & Bread', price: 160, description: 'Classic Indian flatbread with butter', is_available: true },
  { name: 'Plain Rice', category: 'Rice & Bread', price: 100, description: 'Steamed basmati rice', is_available: true },
  { name: 'Fried Rice', category: 'Rice & Bread', price: 280, description: 'Wok-tossed rice with vegetables', is_available: true },
  
  // Desserts
  { name: 'Gulab Jamun', category: 'Desserts', price: 180, description: 'Soft milk solids in sugar syrup', is_available: true },
  { name: 'Ice Cream', category: 'Desserts', price: 120, description: 'Vanilla, chocolate, or strawberry', is_available: true },
  { name: 'Kheer', category: 'Desserts', price: 150, description: 'Rice pudding with milk and cardamom', is_available: true },
  
  // Beverages
  { name: 'Masala Chai', category: 'Beverages', price: 80, description: 'Spiced Indian tea', is_available: true },
  { name: 'Coffee', category: 'Beverages', price: 100, description: 'Hot brewed coffee', is_available: true },
  { name: 'Lassi', category: 'Beverages', price: 120, description: 'Yogurt-based sweet drink', is_available: true },
  { name: 'Mango Shake', category: 'Beverages', price: 180, description: 'Mango smoothie with milk', is_available: true },
  { name: 'Fresh Juice', category: 'Beverages', price: 140, description: 'Orange or mixed fruit juice', is_available: true },
];

const { error: menuError } = await supabase
  .from('menu_items')
  .insert(menuItems);

if (menuError) {
  console.log('❌ Error adding menu items:', menuError.message);
} else {
  console.log(`✅ Added ${menuItems.length} menu items`);
}

console.log('\n✅ Database population complete!');
console.log('\n📋 Next steps:');
console.log('1. If user accounts failed to create automatically, create them manually:');
console.log('   Go to: https://supabase.com/dashboard/project/anyopnttxzcnepjjmwph/auth/users');
console.log('   Create users with emails: server@bhairuha.local, kitchen@bhairuha.local, admin@bhairuha.local');
console.log('   Password for all: password');
console.log('2. After creating users, manually add them to staff table via SQL Editor');
console.log('3. Application should now be ready to use!\n');
