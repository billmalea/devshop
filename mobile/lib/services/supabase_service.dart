import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:mobile/models/product.dart';
import 'package:mobile/models/category.dart';
import 'package:mobile/models/new_arrival.dart';
import 'package:mobile/models/order.dart';

class SupabaseService {
  final SupabaseClient _supabase = Supabase.instance.client;

  Future<List<Product>> getProducts() async {
    final response = await _supabase
        .from('products')
        .select()
        .limit(8)
        .order('created_at', ascending: false);

    return (response as List).map((e) => Product.fromJson(e)).toList();
  }

  Future<List<Product>> getProductsByCategory(String category) async {
    final response = await _supabase
        .from('products')
        .select()
        .eq('is_active', true)
        .eq('category', category)
        .order('created_at', ascending: false);

    return (response as List).map((e) => Product.fromJson(e)).toList();
  }

  Future<List<Product>> getProductsByBrand(String brand) async {
    final response = await _supabase
        .from('products')
        .select()
        .eq('is_active', true)
        .eq('brand', brand)
        .order('created_at', ascending: false);

    return (response as List).map((e) => Product.fromJson(e)).toList();
  }

  Future<Product> getProduct(String id) async {
    final response =
        await _supabase.from('products').select().eq('id', id).single();

    return Product.fromJson(response);
  }

  Future<Product?> getProductById(String id) async {
    try {
      return await getProduct(id);
    } catch (e) {
      return null;
    }
  }

  Future<List<Category>> getCategories() async {
    try {
      final response = await _supabase
          .from('categories')
          .select()
          .filter('parent_id', 'is', null)
          .order('name');

      return (response as List).map((e) => Category.fromJson(e)).toList();
    } catch (e) {
      throw Exception('Failed to load categories: $e');
    }
  }

  Future<List<NewArrival>> getNewArrivals() async {
    try {
      final response = await _supabase
          .from('new_arrivals')
          .select()
          .eq('is_active', true)
          .order('display_order');

      return (response as List).map((e) => NewArrival.fromJson(e)).toList();
    } catch (e) {
      throw Exception('Failed to load new arrivals: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getUserOrders(String userId) async {
    try {
      final response = await _supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', userId)
          .order('created_at', ascending: false);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      throw Exception('Failed to load orders: $e');
    }
  }

  // Profile Management
  Future<Map<String, dynamic>?> getProfile(String userId) async {
    try {
      final response = await _supabase
          .from('profiles')
          .select()
          .eq('id', userId)
          .maybeSingle();

      return response;
    } catch (e) {
      throw Exception('Failed to load profile: $e');
    }
  }

  Future<void> updateProfile(String userId, Map<String, dynamic> data) async {
    try {
      await _supabase.from('profiles').update(data).eq('id', userId);
    } catch (e) {
      throw Exception('Failed to update profile: $e');
    }
  }

  // Cart Management (optional - for server-side cart persistence)
  Future<List<Map<String, dynamic>>> getCartItems(String userId) async {
    try {
      final response = await _supabase
          .from('cart_items')
          .select('*, products(*)')
          .eq('user_id', userId);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      throw Exception('Failed to load cart: $e');
    }
  }

  Future<void> addToCart(String userId, String productId, int quantity) async {
    try {
      await _supabase.from('cart_items').upsert({
        'user_id': userId,
        'product_id': productId,
        'quantity': quantity,
      });
    } catch (e) {
      throw Exception('Failed to add to cart: $e');
    }
  }

  Future<void> removeFromCart(String userId, String productId) async {
    try {
      await _supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);
    } catch (e) {
      throw Exception('Failed to remove from cart: $e');
    }
  }

  Future<void> clearCart(String userId) async {
    try {
      await _supabase.from('cart_items').delete().eq('user_id', userId);
    } catch (e) {
      throw Exception('Failed to clear cart: $e');
    }
  }

  // Admin Product Management
  Future<List<Product>> getAllProducts() async {
    final response = await _supabase
        .from('products')
        .select()
        .order('created_at', ascending: false);

    return (response as List).map((e) => Product.fromJson(e)).toList();
  }

  Future<void> createProduct(Map<String, dynamic> productData) async {
    await _supabase.from('products').insert(productData);
  }

  Future<void> updateProduct(
      String id, Map<String, dynamic> productData) async {
    await _supabase.from('products').update(productData).eq('id', id);
  }

  Future<void> deleteProduct(String id) async {
    await _supabase.from('products').delete().eq('id', id);
  }

  Future<String> uploadProductImage(File imageFile) async {
    final fileName = '${DateTime.now().millisecondsSinceEpoch}.jpg';
    final path = 'products/$fileName';

    await _supabase.storage.from('product-images').upload(path, imageFile);

    final imageUrl =
        _supabase.storage.from('product-images').getPublicUrl(path);
    return imageUrl;
  }

  // Admin Order Management
  Future<List<Order>> getAllOrders() async {
    try {
      final response = await _supabase
          .from('orders')
          .select('*, items:order_items(*)')
          .order('created_at', ascending: false);

      return (response as List).map((e) => Order.fromJson(e)).toList();
    } catch (e) {
      throw Exception('Failed to load all orders: $e');
    }
  }

  Future<void> updateOrderStatus(String orderId, String status) async {
    await _supabase.from('orders').update({'status': status}).eq('id', orderId);
  }

  // Admin New Arrival Management
  Future<List<NewArrival>> getAllNewArrivals() async {
    try {
      final response =
          await _supabase.from('new_arrivals').select().order('display_order');
      return (response as List).map((e) => NewArrival.fromJson(e)).toList();
    } catch (e) {
      throw Exception('Failed to load all new arrivals: $e');
    }
  }

  Future<void> createNewArrival(Map<String, dynamic> data) async {
    await _supabase.from('new_arrivals').insert(data);
  }

  Future<void> updateNewArrival(String id, Map<String, dynamic> data) async {
    await _supabase.from('new_arrivals').update(data).eq('id', id);
  }

  Future<void> deleteNewArrival(String id) async {
    await _supabase.from('new_arrivals').delete().eq('id', id);
  }

  Future<String> uploadNewArrivalImage(File imageFile) async {
    final fileName = '${DateTime.now().millisecondsSinceEpoch}.jpg';
    final path = 'new-arrivals/$fileName';
    await _supabase.storage.from('product-images').upload(path, imageFile);
    return _supabase.storage.from('product-images').getPublicUrl(path);
  }
}
