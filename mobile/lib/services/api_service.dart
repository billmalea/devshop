import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/config.dart';

class ApiService {
  final String _baseUrl = Config.apiBaseUrl;

  // Pickup Mtaani Integration
  Future<List<Map<String, dynamic>>> getPickupLocations() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/delivery/locations'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return List<Map<String, dynamic>>.from(data['locations'] ?? []);
      } else {
        throw Exception(
            'Failed to load pickup locations: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching pickup locations: $e');
    }
  }

  Future<Map<String, dynamic>> calculateDeliveryCharge(
    String originId,
    String destinationId,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/delivery/calculate'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'origin_id': originId,
          'destination_id': destinationId,
        }),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to calculate delivery: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error calculating delivery: $e');
    }
  }

  Future<Map<String, dynamic>> createDeliveryPackage({
    required String orderId,
    required String originId,
    required String destinationId,
    required String recipientName,
    required String recipientPhone,
    required String description,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/delivery/create-package'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'order_id': orderId,
          'origin_id': originId,
          'destination_id': destinationId,
          'recipient_name': recipientName,
          'recipient_phone': recipientPhone,
          'description': description,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to create package: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error creating delivery package: $e');
    }
  }

  Future<List<Map<String, dynamic>>> getDeliveryPackages() async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/pickup-mtaani/packages'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return List<Map<String, dynamic>>.from(data['data'] ?? []);
      } else {
        throw Exception('Failed to load packages: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching delivery packages: $e');
    }
  }

  // Payment Integration (supports both TinyPesa and M-Pesa)
  Future<Map<String, dynamic>> initiateStkPush({
    required String phoneNumber,
    required double amount,
    required String accountReference,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/payments/initiate'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'phone_number': phoneNumber,
          'amount': amount,
          'account_reference': accountReference,
          'provider': Config.paymentProvider, // 'tinypesa' or 'mpesa'
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        final error = json.decode(response.body);
        throw Exception(error['error'] ?? 'Payment initiation failed');
      }
    } catch (e) {
      throw Exception('Error initiating payment: $e');
    }
  }

  Future<Map<String, dynamic>> checkPaymentStatus(
      String checkoutRequestId) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/payments/status/$checkoutRequestId'),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception(
            'Failed to check payment status: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error checking payment status: $e');
    }
  }

  // Order Management
  Future<Map<String, dynamic>> createOrder({
    required String userId,
    required List<Map<String, dynamic>> items,
    required double totalAmount,
    required String phoneNumber,
    String? deliveryAddress,
    String? pickupLocation,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/orders/create'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'user_id': userId,
          'items': items,
          'total_amount': totalAmount,
          'phone_number': phoneNumber,
          'delivery_address': deliveryAddress,
          'pickup_location': pickupLocation,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to create order: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error creating order: $e');
    }
  }

  Future<Map<String, dynamic>> updateOrderStatus({
    required String orderId,
    required String status,
  }) async {
    try {
      final response = await http.patch(
        Uri.parse('$_baseUrl/orders/$orderId/status'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'status': status,
        }),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception(
            'Failed to update order status: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error updating order status: $e');
    }
  }

  // Profile Management
  Future<Map<String, dynamic>> updateProfile({
    required String userId,
    required Map<String, dynamic> profileData,
  }) async {
    try {
      final response = await http.patch(
        Uri.parse('$_baseUrl/profile/$userId'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(profileData),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to update profile: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error updating profile: $e');
    }
  }

  // Helper method to normalize phone numbers
  String normalizePhoneNumber(String phone) {
    // Remove spaces, dashes, and parentheses
    String cleaned = phone.replaceAll(RegExp(r'[\s\-\(\)]'), '');

    // Handle different formats
    if (cleaned.startsWith('+254')) {
      return cleaned.substring(1); // Remove +
    } else if (cleaned.startsWith('254')) {
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      return '254${cleaned.substring(1)}';
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      return '254$cleaned';
    }

    return cleaned;
  }
}
