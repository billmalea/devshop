# DevShop Setup Checklist

Use this checklist to ensure everything is configured correctly.

## ☑️ Pre-Launch Checklist

### 1. Database Setup
- [ ] Created Supabase project
- [ ] Ran all SQL scripts in order (001-007)
- [ ] Created admin user in `admin_users` table
- [ ] Verified products are seeded
- [ ] Tested RLS policies (create test order)

### 2. Environment Variables
- [ ] Copied `.env.example` to `.env.local`
- [ ] Set Supabase URL and keys (including service role)
- [ ] Configured payment provider (tinypesa/mpesa)
- [ ] Added payment credentials (TinyPesa or M-Pesa)
- [ ] Set Pickup Mtaani API key (if using)
- [ ] Set origin agent ID (if using Pickup Mtaani)

### 3. Payment Configuration

#### TinyPesa (Recommended for Development)
- [ ] Created account at https://tinypesa.com
- [ ] Got API token and account ID
- [ ] Set `PAYMENT_PROVIDER=tinypesa`
- [ ] Tested STK push with test phone number

#### M-Pesa (Production)
- [ ] Registered for Daraja API
- [ ] Got consumer key and secret
- [ ] Set business short code
- [ ] Got passkey
- [ ] Set `PAYMENT_PROVIDER=mpesa`
- [ ] Configured callback URL (must be publicly accessible)
- [ ] Tested in sandbox mode first

### 4. Pickup Mtaani Configuration (Optional)
- [ ] Got API key from Pickup Mtaani
- [ ] Identified origin agent location ID
- [ ] Set environment variables
- [ ] Tested location fetching
- [ ] Tested delivery charge calculation
- [ ] Tested package creation

### 5. Testing Flow

#### User Flow
- [ ] Can sign up/login
- [ ] Can browse products
- [ ] Can add to cart
- [ ] Can checkout (both delivery methods)
- [ ] STK push received on phone
- [ ] Payment callback updates order
- [ ] Order appears in profile/admin

#### Admin Flow
- [ ] Can access admin panel (/admin)
- [ ] Can view all orders
- [ ] Can view order details
- [ ] Can update order status
- [ ] Can view delivery packages
- [ ] Can manage products
- [ ] Can view users

### 6. Webhooks (Production Only)
- [ ] Exposed callbacks publicly (ngrok for dev)
- [ ] M-Pesa callback registered
- [ ] TinyPesa callback registered (if using)
- [ ] Pickup Mtaani webhook registered
- [ ] Tested webhook receives events
- [ ] Verified status updates work

### 7. Production Deployment
- [ ] All environment variables set in hosting
- [ ] Database migrations run on production
- [ ] Admin users created
- [ ] Callback URLs updated to production domain
- [ ] SSL certificate active
- [ ] Tested complete order flow in production
- [ ] Monitored logs for errors

### 8. Post-Launch Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor payment success rate
- [ ] Track delivery completion rate
- [ ] Check webhook delivery
- [ ] Monitor database performance
- [ ] Review customer feedback

## 🔧 Quick Tests

### Test Payment
```bash
# Use these test numbers with TinyPesa:
# Any valid Safaricom number (254XXXXXXXXX)
# Amount: Any amount (min 1 KES)
```

### Test Delivery
```bash
# Check locations load
curl http://localhost:3000/api/pickup-mtaani/locations

# Check delivery charge calculation
curl "http://localhost:3000/api/pickup-mtaani/delivery-charge?origin=ORIGIN_ID&destination=DEST_ID"
```

### Test Order Creation
1. Add product to cart
2. Go to checkout
3. Fill form
4. Select pickup/delivery
5. Click pay
6. Check phone for STK
7. Enter PIN
8. Verify order in admin

## 🐛 Common Issues

### Payment not received
- Check phone number format (254XXXXXXXXX)
- Verify payment provider credentials
- Check callback URL is accessible
- Review server logs for errors

### Admin access denied
```sql
-- Verify user is in admin_users table
SELECT * FROM admin_users WHERE id = 'your-user-id';

-- If not, add them:
INSERT INTO admin_users (id, role, is_active)
VALUES ('your-user-id', 'superadmin', true);
```

### Products not showing
```sql
-- Check products exist
SELECT COUNT(*) FROM products;

-- If 0, run seed script:
-- scripts/002_seed_products.sql
```

### Stock not decrementing
```sql
-- Run inventory function script:
-- scripts/007_add_inventory_functions.sql

-- Test function
SELECT decrement_stock('product-uuid'::uuid, 1);
```

## 📞 Support Resources

- **Supabase**: https://supabase.com/docs
- **TinyPesa**: https://tinypesa.com/docs
- **M-Pesa Daraja**: https://developer.safaricom.co.ke/
- **Pickup Mtaani**: https://api.pickupmtaani.com/api/v1/docs
- **Next.js**: https://nextjs.org/docs

## ✅ Ready to Launch

Once all items are checked:
1. Test complete user journey
2. Process test order end-to-end
3. Verify all webhooks working
4. Monitor first real orders closely
5. Have rollback plan ready

---

**Last Updated**: November 19, 2025  
**Status**: Use this checklist before going live! ✅
