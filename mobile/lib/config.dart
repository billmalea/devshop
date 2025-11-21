import 'package:flutter_dotenv/flutter_dotenv.dart';

class Config {
  // Supabase Configuration
  static String get supabaseUrl =>
      dotenv.env['SUPABASE_URL'] ??
      dotenv.env['NEXT_PUBLIC_SUPABASE_URL'] ??
      '';
  static String get supabaseAnonKey =>
      dotenv.env['SUPABASE_ANON_KEY'] ??
      dotenv.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ??
      '';

  // API Configuration
  static String get apiBaseUrl =>
      dotenv.env['API_BASE_URL'] ?? 'http://10.0.2.2:3000/api';

  // Pickup Mtaani Configuration
  static String get pickupMtaaniApiUrl =>
      dotenv.env['PICKUP_MTAANI_API_URL'] ??
      'https://api.pickupmtaani.com/api/v1';
  static String get pickupMtaaniApiKey =>
      dotenv.env['PICKUP_MTAANI_API_KEY'] ?? '';
  static String get pickupMtaaniOriginId =>
      dotenv.env['PICKUP_MTAANI_ORIGIN_ID'] ?? '';

  // Payment Configuration
  static String get paymentProvider =>
      dotenv.env['PAYMENT_PROVIDER'] ?? 'tinypesa';

  // TinyPesa Configuration
  static String get tinypesaApiToken => dotenv.env['TINYPESA_API_TOKEN'] ?? '';
  static String get tinypesaAccountId =>
      dotenv.env['TINYPESA_ACCOUNT_ID'] ?? '';

  // M-Pesa Configuration
  static String get mpesaConsumerKey => dotenv.env['MPESA_CONSUMER_KEY'] ?? '';
  static String get mpesaConsumerSecret =>
      dotenv.env['MPESA_CONSUMER_SECRET'] ?? '';
  static String get mpesaShortcode => dotenv.env['MPESA_SHORTCODE'] ?? '';
  static String get mpesaPasskey => dotenv.env['MPESA_PASSKEY'] ?? '';
  static String get mpesaCallbackUrl => dotenv.env['MPESA_CALLBACK_URL'] ?? '';

  // App Configuration
  static const String appName = 'DevShop';
  static const String appVersion = '1.0.0';
  static String get webUrl => dotenv.env['WEB_URL'] ?? 'https://devshop.com';

  // Feature Flags
  static bool get enableAnalytics =>
      dotenv.env['ENABLE_ANALYTICS']?.toLowerCase() == 'true';
  static bool get enableCrashReporting =>
      dotenv.env['ENABLE_CRASH_REPORTING']?.toLowerCase() == 'true';

  // Helper methods
  static bool get isProduction => paymentProvider == 'mpesa';
  static bool get isDevelopment => paymentProvider == 'tinypesa';

  // Validate configuration
  static bool validateConfig() {
    if (supabaseUrl.isEmpty || supabaseAnonKey.isEmpty) {
      return false;
    }
    return true;
  }
}
