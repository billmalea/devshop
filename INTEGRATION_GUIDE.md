# DevShop E-Commerce Platform - Complete Integration Guide

## Overview
Full-featured e-commerce platform for the Kenyan market with M-Pesa payments, Pickup Mtaani delivery, and admin management.

## Tech Stack
- **Frontend**: Next.js 15.2.4, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Payments**: M-Pesa Daraja API, TinyPesa (switchable)
- **Delivery**: Pickup Mtaani API
- **UI**: shadcn/ui components

## Features Implemented

### 1. User Features
- ✅ Product browsing with filters (brand, category)
- ✅ Shopping cart with persistence
- ✅ User authentication (sign up, login)
- ✅ Profile management with auto-prefill
- ✅ Checkout with delivery options (home delivery / Pickup Mtaani)
- ✅ Real-time M-Pesa STK push payments
- ✅ Order tracking
- ✅ Dynamic delivery charge calculation

### 2. Payment Integration
#### Dual Provider Support
- **TinyPesa** (Development/Testing): Easy setup, no credentials needed
- **M-Pesa** (Production): Full Daraja API integration
- Switch between providers via `PAYMENT_PROVIDER` env variable

#### Payment Features
- STK Push initiation
- Phone number normalization (supports multiple formats)
- Payment status checking
- Automatic order status updates via callbacks
- Transaction reference storage

### 3. Delivery Integration (Pickup Mtaani)
- Dynamic agent location fetching
- Real-time delivery charge calculation
- Package creation and tracking
- Webhook notifications for status updates
- Admin delivery management dashboard

### 4. Admin Panel
- User management
- Product management (CRUD)
- Order management with status updates
- Order detail view with full information
- Delivery package tracking
- Inventory management
- Promotions management (table ready)
- Content management
- Reports and analytics (placeholder)
- Settings

### 5. Database Schema
```
profiles (user data)
products (catalog)
orders (order records)
order_items (order line items)
delivery_packages (Pickup Mtaani integration)
cart_items (shopping cart)
admin_users (role-based access)
promotions (discount codes)
content (homepage banners)
settings (app configuration)
activity_logs (audit trail)
```

### 6. Inventory Management
- Automatic stock decrement on order
- SQL function: `decrement_stock(product_id, quantity)`

## Environment Setup

### Required Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Pickup Mtaani API
PICKUP_MTAANI_API_KEY=your_pickup_mtaani_api_key
NEXT_PUBLIC_PICKUP_MTAANI_API_URL=https://api.pickupmtaani.com/api/v1
NEXT_PUBLIC_PICKUP_MTAANI_ORIGIN_ID=YOUR_DEFAULT_ORIGIN_AGENT_ID

# Payment Provider (use 'tinypesa' or 'mpesa')
PAYMENT_PROVIDER=tinypesa

# TinyPesa (for testing/development)
TINYPESA_API_TOKEN=your_tinypesa_api_token
TINYPESA_ACCOUNT_ID=your_tinypesa_account_id

# M-Pesa (for production)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_BUSINESS_SHORT_CODE=your_business_shortcode
MPESA_PASSKEY=your_mpesa_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
MPESA_ENVIRONMENT=sandbox
```

## Database Setup

### Run SQL Scripts in Order

```bash
# In Supabase SQL Editor, run these in order:
1. scripts/001_create_tables.sql
2. scripts/002_seed_products.sql
3. scripts/003_create_profile_trigger.sql
4. scripts/004_add_uber_products.sql
5. scripts/005_create_admin_tables.sql
6. scripts/006_add_delivery_packages.sql
7. scripts/007_add_inventory_functions.sql
```

### Create Admin User

```sql
-- After creating your user account, add them as admin
INSERT INTO public.admin_users (id, role, is_active)
VALUES ('your-user-uuid', 'superadmin', true);
```

## API Endpoints

### Public Endpoints
- `GET /api/pickup-mtaani/locations` - Fetch Pickup Mtaani locations
- `GET /api/pickup-mtaani/delivery-charge?origin=X&destination=Y` - Calculate delivery fee
- `POST /api/payments/stk` - Initiate STK push
- `GET /api/payments/status?requestId=X` - Check payment status

### Admin Endpoints (Protected)
- `GET /api/pickup-mtaani/packages` - List all packages
- `POST /api/pickup-mtaani/packages` - Create delivery package

### Webhook Endpoints
- `POST /api/payments/mpesa/callback` - M-Pesa callback
- `POST /api/payments/tinypesa/callback` - TinyPesa callback
- `POST /api/webhooks/pickup-mtaani` - Pickup Mtaani status updates

## Payment Flow

### M-Pesa/TinyPesa Payment Process

1. **Customer Checkout**
   ```
   Customer clicks "Pay Now"
   → Order created in database (status: pending)
   → STK push sent to phone
   → Customer enters M-Pesa PIN
   ```

2. **Payment Callback**
   ```
   Payment provider sends callback
   → Order status updated (pending → processing)
   → M-Pesa reference stored
   → Delivery package created (if pickup)
   ```

3. **Delivery Integration**
   ```
   Package created in Pickup Mtaani
   → Webhook updates delivery status
   → Order status synced automatically
   → Customer notified
   ```

## Testing

### Development Flow

1. **Use TinyPesa for Testing**
   ```bash
   PAYMENT_PROVIDER=tinypesa
   ```
   - Get test credentials from https://tinypesa.com
   - Test phone: Any valid Safaricom number

2. **Local Testing**
   ```bash
   pnpm dev
   ```
   - Test checkout flow
   - Verify STK push
   - Check order creation

3. **Webhook Testing**
   - Use ngrok for local webhooks
   ```bash
   ngrok http 3000
   ```
   - Update callback URLs in env

### Production Deployment

1. **Switch to M-Pesa**
   ```bash
   PAYMENT_PROVIDER=mpesa
   ```

2. **Configure Callbacks**
   - Update `MPESA_CALLBACK_URL` to your production domain
   - Register webhook with Pickup Mtaani

3. **Deploy**
   ```bash
   git push origin master
   vercel --prod
   ```

## Phone Number Formats Supported

The system automatically normalizes these formats:
- `0712345678` → `254712345678`
- `+254712345678` → `254712345678`
- `254712345678` → `254712345678`
- `712345678` → `254712345678`

## Status Mapping

### Order Status Flow
```
pending → processing → shipped → delivered
         ↓
      cancelled (if payment fails)
```

### Delivery Package Status
```
created → paid → in_transit → delivered
         ↓
      failed (if delivery fails)
```

### Status Sync
- Pickup Mtaani webhook updates package status
- Package status updates trigger order status changes
- Automatic mapping handled in webhook handler

## Admin Features

### Order Management
- View all orders with filters
- Update order status manually
- View order details (items, delivery, payment)
- Track delivery packages
- View M-Pesa transaction references

### Product Management
- Add/Edit/Delete products
- Manage inventory (stock levels)
- Automatic stock decrement on purchase

### Delivery Management
- View all Pickup Mtaani packages
- Track delivery status
- Monitor delivery fees
- Payment verification

## Next Steps (Optional Enhancements)

### Remaining Features
1. **Promotion System** - Apply discount codes at checkout
2. **Doorstep Delivery** - Alternative to Pickup Mtaani agents
3. **Email Notifications** - Order confirmations, delivery updates
4. **SMS Notifications** - Via Africa's Talking
5. **Customer Order History** - User dashboard
6. **Analytics Dashboard** - Sales reports, popular products
7. **Search Functionality** - Product search with filters
8. **Wishlist** - Save products for later
9. **Product Reviews** - Customer ratings and feedback
10. **Multi-currency** - Support USD alongside KES

## Troubleshooting

### Payment Issues
- **STK not received**: Check phone number format
- **Callback not working**: Verify callback URL is publicly accessible
- **Payment provider error**: Check API credentials in env

### Delivery Issues
- **Locations not loading**: Verify `PICKUP_MTAANI_API_KEY`
- **Delivery charge not calculated**: Check `NEXT_PUBLIC_PICKUP_MTAANI_ORIGIN_ID`
- **Package not created**: Ensure origin agent ID is valid

### Database Issues
- **Orders not saving**: Check RLS policies
- **Admin access denied**: Verify user in `admin_users` table
- **Stock not decrementing**: Run `007_add_inventory_functions.sql`

## Support

For issues or questions:
1. Check environment variables are correctly set
2. Review Supabase logs for database errors
3. Check browser console for frontend errors
4. Review server logs for API issues

## Credits

Built with:
- Next.js - React framework
- Supabase - Backend & Auth
- Pickup Mtaani - Delivery service
- M-Pesa/TinyPesa - Payment processing
- shadcn/ui - UI components
- Tailwind CSS - Styling

---

**Version**: 1.0.0  
**Last Updated**: November 19, 2025  
**Status**: Production Ready ✅
