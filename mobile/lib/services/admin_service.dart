import 'package:supabase_flutter/supabase_flutter.dart';

class AdminService {
  final SupabaseClient _supabase = Supabase.instance.client;

  /// Check if the current user is an admin
  Future<bool> isAdmin() async {
    try {
      final user = _supabase.auth.currentUser;
      if (user == null) return false;

      final response = await _supabase
          .from('admin_users')
          .select()
          .eq('id', user.id)
          .eq('is_active', true)
          .maybeSingle();

      return response != null;
    } catch (e) {
      return false;
    }
  }

  /// Check if a specific user ID is an admin
  Future<bool> isUserAdmin(String userId) async {
    try {
      final response = await _supabase
          .from('admin_users')
          .select()
          .eq('id', userId)
          .eq('is_active', true)
          .maybeSingle();

      return response != null;
    } catch (e) {
      return false;
    }
  }

  /// Get admin user details
  Future<Map<String, dynamic>?> getAdminDetails() async {
    try {
      final user = _supabase.auth.currentUser;
      if (user == null) return null;

      final response = await _supabase
          .from('admin_users')
          .select()
          .eq('id', user.id)
          .eq('is_active', true)
          .maybeSingle();

      return response;
    } catch (e) {
      return null;
    }
  }
}
