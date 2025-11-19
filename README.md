# DevShop - E-Commerce Platform for Kenya

A full-featured e-commerce platform built with Next.js, featuring M-Pesa payments and Pickup Mtaani delivery integration.

## 🚀 Features

- 🛒 **Shopping Cart** - Persistent cart with real-time updates
- 💳 **M-Pesa Payments** - STK push integration with TinyPesa/Daraja API
- 🚚 **Pickup Mtaani** - Delivery with agent locations and tracking
- 👤 **User Authentication** - Supabase Auth with profile management
- 🎛️ **Admin Panel** - Complete order, product, and delivery management
- 📦 **Inventory** - Automatic stock management
- 🎨 **Modern UI** - Tailwind CSS with shadcn/ui components
- 🔒 **Secure** - Row-level security with Supabase

## 🛠️ Tech Stack

- **Framework**: Next.js 15.2.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **Payments**: M-Pesa Daraja API / TinyPesa
- **Delivery**: Pickup Mtaani API
- **Package Manager**: pnpm

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)
- Supabase account
- TinyPesa account (for testing) or M-Pesa credentials (for production)
- Pickup Mtaani API key (optional)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/billmalea/devshop.git
cd devshop
pnpm install
```

### 2. Environment Setup

Create `.env.local` file:

```bash
cp .env.example .env.local
```

Update with your credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Payment (start with TinyPesa)
PAYMENT_PROVIDER=tinypesa
TINYPESA_API_TOKEN=your_token
TINYPESA_ACCOUNT_ID=your_account_id
```

### 3. Database Setup

Run SQL scripts in Supabase SQL Editor (in order):
1. `scripts/001_create_tables.sql`
2. `scripts/002_seed_products.sql`
3. `scripts/003_create_profile_trigger.sql`
4. `scripts/004_add_uber_products.sql`
5. `scripts/005_create_admin_tables.sql`
6. `scripts/006_add_delivery_packages.sql`
7. `scripts/007_add_inventory_functions.sql`

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Create Admin User

After signing up:
```sql
-- In Supabase SQL Editor
INSERT INTO public.admin_users (id, role, is_active)
VALUES ('your-user-uuid', 'superadmin', true);
```

## 📚 Documentation

- **[Full Integration Guide](./INTEGRATION_GUIDE.md)** - Complete setup and configuration
- **[Pickup Mtaani Integration](./PICKUP_MTAANI_INTEGRATION.md)** - Delivery API details

## 🔑 Key Features Detail

### Payment System
- Dual provider support (TinyPesa for dev, M-Pesa for production)
- Automatic phone number normalization
- STK push with callback handling
- Transaction tracking and verification

### Delivery Integration
- Dynamic agent location loading
- Real-time delivery charge calculation
- Package creation and tracking
- Webhook notifications for status updates

### Admin Panel
- Order management with detail views
- Product CRUD with inventory tracking
- Delivery package monitoring
- User management
- Sales analytics (ready to extend)

## 🏗️ Project Structure

```
devshop/
├── app/
│   ├── admin/           # Admin dashboard
│   ├── api/             # API routes
│   ├── auth/            # Authentication pages
│   ├── checkout/        # Checkout flow
│   ├── products/        # Product pages
│   └── ...
├── components/          # React components
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── payments/        # Payment providers
│   ├── pickupmtaani.ts  # Delivery API
│   └── ...
├── scripts/             # SQL migrations
└── public/              # Static assets
```

## 🧪 Testing

```bash
# Development with TinyPesa
PAYMENT_PROVIDER=tinypesa pnpm dev

# Test checkout flow with any Safaricom number
# Use ngrok for webhook testing locally
```

## 🚀 Production Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
pnpm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables
Set all production variables in Vercel dashboard:
- Switch `PAYMENT_PROVIDER=mpesa`
- Update `MPESA_CALLBACK_URL` to production domain
- Configure all M-Pesa credentials

## 🔧 Configuration

### Payment Provider Switch
```env
# Development
PAYMENT_PROVIDER=tinypesa

# Production
PAYMENT_PROVIDER=mpesa
```

### Pickup Mtaani Setup
1. Get API key from [Pickup Mtaani](https://pickupmtaani.com)
2. Set `PICKUP_MTAANI_API_KEY` in env
3. Configure origin agent ID: `NEXT_PUBLIC_PICKUP_MTAANI_ORIGIN_ID`

## 📝 API Endpoints

### Public
- `GET /api/pickup-mtaani/locations` - Agent locations
- `POST /api/payments/stk` - Initiate payment
- `GET /api/payments/status` - Check payment status

### Webhooks
- `POST /api/payments/mpesa/callback`
- `POST /api/payments/tinypesa/callback`
- `POST /api/webhooks/pickup-mtaani`

## 🤝 Contributing

Contributions welcome! Please read contribution guidelines first.

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues:
1. Check [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
2. Review troubleshooting section
3. Open an issue on GitHub

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Pickup Mtaani](https://pickupmtaani.com)
- [TinyPesa](https://tinypesa.com)
- [shadcn/ui](https://ui.shadcn.com)

---

Built with ❤️ for the Kenyan market
