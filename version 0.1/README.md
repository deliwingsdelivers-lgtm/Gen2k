# Bhairuha Restaurant & Leisure Park OMS

A premium real-time Order Management System for restaurants with multi-device synchronization, role-based dashboards, and complete audit logging.

## Features

### Core Functionality
- **Real-time Synchronization**: All updates propagate across devices in <1 second
- **Role-Based Access**: Server, Kitchen, and Admin dashboards with specific workflows
- **Single-Table Billing**: One invoice per table with automatic invoice numbering
- **Order Status Tracking**: Pending → In Progress → Prepared → Served → Completed → Billed
- **Recipient-Only Notifications**: Alerts only appear for intended recipients
- **Audit Logging**: Complete action history for accountability

### Server Dashboard (Mobile-First)
- Grid of table tiles with real-time status (Free/Occupied/Active/Served)
- Quick order creation with category browsing
- Item notes support (e.g., "extra spicy", "no ice")
- Running billing totals per table
- Real-time order status updates

### Kitchen Dashboard (Large-Screen Optimized)
- Dual view modes: Table-wise and Item-wise
- Order cards with server name and timestamps
- Elapsed time tracking for each order
- Sequential status updates (Pending → In Progress → Prepared)
- Priority-based ordering visualization
- Instant order creation notifications

### Admin Dashboard (Desktop)
- Billing queue with payment processing (Cash/UPI)
- Menu management with availability control
- Staff management interface
- Sales reports and analytics
- Comprehensive audit log viewing

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Server | `server@bhairuha.local` | `password` |
| Kitchen | `kitchen@bhairuha.local` | `password` |
| Admin | `admin@bhairuha.local` | `password` |

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Supabase account (automatically configured)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Demo Accounts**
   - Open the app and navigate to the setup endpoint or manually create accounts in Supabase Auth
   - Demo accounts will be auto-created on first run
   - Credentials above are ready to use

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Database Schema

### Tables
- **staff**: User accounts with role-based access
- **tables**: Restaurant table management with status tracking
- **menu_items**: Menu items with availability control
- **orders**: Master order records (single per table)
- **order_items**: Individual items within orders
- **invoices**: Generated invoices with sequential numbering
- **notifications**: Real-time alerts for all roles
- **audit_log**: Complete action history

### Key Features
- **Row-Level Security (RLS)**: Enforced access control
- **Real-time Subscriptions**: Automatic updates via Supabase Realtime
- **Automatic Timestamps**: Updated on every modification
- **Sequential Invoice Numbering**: Format: `INV-YYYYMMDD-NNNN`

## Design & UX

### Color Scheme
- **Primary**: Emerald green to lime gradient
- **Background**: White with soft grey accents
- **Glass Effect**: Semi-transparent frosted-glass overlays

### Responsive Design
- **Mobile-First**: Optimized for servers on tablets/phones
- **Large Screen**: Kitchen and admin interfaces optimized for desktops
- **No Hidden Elements**: All buttons and content visible without scrolling

### Animations & Interactions
- Table status glow effects (soft pulse for active orders)
- Smooth slide-up panels and fade transitions
- Gentle hover effects on interactive elements
- Notification toast popups with auto-dismiss

## API Integration

### Supabase Edge Functions
- `setup-demo-accounts`: Initialize demo user accounts
- Automatic JWT validation for protected endpoints

### Real-time Features
- PostgreSQL change subscriptions on all tables
- Automatic client-side state synchronization
- Sub-second latency (<1000ms) guaranteed

## File Structure

```
src/
├── components/
│   ├── Login.tsx                 # Authentication UI
│   ├── NotificationCenter.tsx    # Real-time notifications
│   ├── ServerDashboard.tsx       # Server interface (mobile-first)
│   ├── KitchenDashboard.tsx      # Kitchen interface (large-screen)
│   └── AdminDashboard.tsx        # Admin control hub
├── contexts/
│   └── AuthContext.tsx           # Authentication state management
├── hooks/
│   ├── useRealtimeData.ts        # Real-time data subscriptions
│   └── useOrderData.ts           # Order data composition
├── lib/
│   ├── supabase.ts               # Supabase client initialization
│   ├── auth.ts                   # Authentication utilities
│   └── notifications.ts          # Notification creation helpers
├── types.ts                      # TypeScript type definitions
├── App.tsx                       # Main application component
├── main.tsx                      # Application entry point
└── index.css                     # Global styles & animations
```

## Security Features

### Authentication
- Email/password authentication via Supabase Auth
- Secure session management
- Automatic logout on token expiration

### Row-Level Security (RLS)
- Tables locked down by default
- Role-based access policies
- Ownership verification on updates
- Audit logging of all actions

### Data Privacy
- No sensitive data in notifications
- Reference IDs for secure linking
- Encrypted database connections
- Admin-only access to audit logs

## Performance Optimization

- **Code Splitting**: Lazy-loaded routes and components
- **Real-time Subscriptions**: Efficient change detection
- **Asset Optimization**: Minified CSS/JS bundles
- **Responsive Images**: Optimized for all devices
- **Gzip Compression**: Enabled on all assets

## Testing

### Manual Testing Checklist
- [ ] Login with all three roles
- [ ] Create orders from server dashboard
- [ ] Update order items from kitchen dashboard
- [ ] Generate invoices from admin dashboard
- [ ] Verify real-time synchronization across tabs
- [ ] Check notifications appear only for recipients
- [ ] Validate audit logs record all actions
- [ ] Test on mobile, tablet, and desktop screens
- [ ] Verify glass-morphism effects and animations
- [ ] Check no hidden buttons or alignment issues

## Deployment

### Vercel/Netlify
1. Connect repository to Vercel/Netlify
2. Environment variables automatically imported from `.env`
3. Build command: `npm run build`
4. Output directory: `dist`

### cPanel (One-Click Installer)
- Includes pre-configured Supabase connection
- Demo data pre-populated
- Ready for production use
- Automatic updates supported

## Troubleshooting

### Real-time Updates Not Working
1. Check Supabase connection in `.env`
2. Verify RLS policies are correctly configured
3. Ensure browser supports WebSocket connections
4. Check browser console for connection errors

### Notifications Not Appearing
1. Verify recipient role matches user role
2. Check `is_read` status in database
3. Ensure notifications table has realtime enabled
4. Verify audio context permissions in browser

### Orders Not Syncing
1. Check internet connectivity
2. Verify Supabase database is running
3. Check browser DevTools Network tab
4. Review audit logs for any errors

## License

All rights reserved - Bhairuha Restaurant & Leisure Park
