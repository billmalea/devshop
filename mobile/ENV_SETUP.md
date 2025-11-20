# DevShop Mobile - Environment Configuration

## Setup Instructions

### 1. Create `.env` file in the mobile directory

Create a file at `mobile/.env` with the following content (copy from your web `.env.local`):

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API Configuration
# For Android Emulator
API_BASE_URL=http://10.0.2.2:3000/api
# For iOS Simulator
# API_BASE_URL=http://localhost:3000/api
# For Physical Device (replace with your computer's IP)
# API_BASE_URL=http://192.168.1.XXX:3000/api

# Pickup Mtaani Configuration
PICKUP_MTAANI_API_URL=https://api.pickupmtaani.com/api/v1
PICKUP_MTAANI_API_KEY=your_pickup_mtaani_api_key
PICKUP_MTAANI_ORIGIN_ID=your_default_origin_agent_id

# Payment Provider ('tinypesa' for dev, 'mpesa' for production)
PAYMENT_PROVIDER=tinypesa

# TinyPesa Configuration (for development/testing)
TINYPESA_API_TOKEN=your_tinypesa_api_token
TINYPESA_ACCOUNT_ID=your_tinypesa_account_id

# M-Pesa Configuration (for production)
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_mpesa_shortcode
MPESA_PASSKEY=your_mpesa_passkey
MPESA_CALLBACK_URL=your_callback_url

# Feature Flags
ENABLE_ANALYTICS=false
ENABLE_CRASH_REPORTING=false
```

### 2. Run with environment variables

#### Option A: Using flutter run with --dart-define
```bash
flutter run \
  --dart-define=SUPABASE_URL=your_url \
  --dart-define=SUPABASE_ANON_KEY=your_key \
  --dart-define=API_BASE_URL=http://10.0.2.2:3000/api
```

#### Option B: Using flutter_dotenv package (Recommended)

1. Add to `pubspec.yaml`:
```yaml
dependencies:
  flutter_dotenv: ^5.1.0
```

2. Add to `pubspec.yaml` assets:
```yaml
flutter:
  assets:
    - .env
```

3. Load in `main.dart`:
```dart
import 'package:flutter_dotenv/flutter_dotenv.dart';

Future<void> main() async {
  await dotenv.load(fileName: ".env");
  // ... rest of main
}
```

### 3. Quick Setup (Copy from web .env.local)

If you have the web version running, copy the values from `devshop/.env.local`:

```bash
# From the mobile directory
cp ../.env.local .env
# Then edit .env to change API_BASE_URL for mobile
```

### 4. Update config.dart defaults

Edit `lib/config.dart` and replace the `defaultValue` parameters with your actual values for easier development.

## Important Notes

- **Never commit `.env` file** - it's already in `.gitignore`
- **Android Emulator**: Use `10.0.2.2` to access localhost
- **iOS Simulator**: Use `localhost` or `127.0.0.1`
- **Physical Device**: Use your computer's local IP address
- **Payment Provider**: Use `tinypesa` for development, `mpesa` for production
