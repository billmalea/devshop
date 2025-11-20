import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/config.dart';
import 'package:mobile/providers/cart_provider.dart';
import 'package:mobile/services/api_service.dart';
import 'package:mobile/services/supabase_service.dart';
import 'package:mobile/widgets/toast.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final ApiService _apiService = ApiService();

  String _shippingMethod = 'delivery'; // 'delivery' or 'pickup'
  String _paymentMethod = 'mpesa'; // 'mpesa' or 'cod'
  List<Map<String, dynamic>> _pickupLocations = [];
  String? _selectedLocationId;
  bool _isLoadingLocations = true;
  bool _isProcessing = false;
  bool _isSuccess = false;
  double? _deliveryFee;
  bool _isCalculatingFee = false;

  @override
  void initState() {
    super.initState();
    _loadPickupLocations();
    _prefillUserData();
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    super.dispose();
  }

  Future<void> _prefillUserData() async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user != null) {
        _emailController.text = user.email ?? '';

        final profile = await SupabaseService().getProfile(user.id);
        if (profile != null && mounted) {
          final fullName = profile['full_name'] as String? ?? '';
          final parts = fullName.split(' ');
          if (parts.isNotEmpty) {
            _firstNameController.text = parts.first;
            if (parts.length > 1) {
              _lastNameController.text = parts.sublist(1).join(' ');
            }
          }
          _phoneController.text = profile['phone_number'] as String? ?? '';
        }
      }
    } catch (e) {
      debugPrint('Error prefilling user data: $e');
    }
  }

  Future<void> _loadPickupLocations() async {
    try {
      final locations = await _apiService.getPickupLocations();
      if (mounted) {
        setState(() {
          _pickupLocations = locations;
          _isLoadingLocations = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading locations: $e');
      if (mounted) {
        setState(() => _isLoadingLocations = false);
        Toast.error(context, 'Failed to load pickup locations');
      }
    }
  }

  Future<void> _calculateDeliveryFee(String locationId) async {
    if (_shippingMethod != 'pickup') return;

    setState(() {
      _selectedLocationId = locationId;
      _isCalculatingFee = true;
    });

    try {
      final originId = Config.pickupMtaaniOriginId.isNotEmpty
          ? Config.pickupMtaaniOriginId
          : 'DEFAULT_ORIGIN';
      final result =
          await _apiService.calculateDeliveryCharge(originId, locationId);
      if (mounted) {
        setState(() {
          _deliveryFee = (result['price'] as num?)?.toDouble() ?? 150.0;
          _isCalculatingFee = false;
        });
      }
    } catch (e) {
      debugPrint('Delivery calculation error: $e');
      if (mounted) {
        setState(() {
          _deliveryFee = 150.0;
          _isCalculatingFee = false;
        });
      }
    }
  }

  Future<void> _submitOrder() async {
    if (!_formKey.currentState!.validate()) return;

    if (_shippingMethod == 'pickup' && _selectedLocationId == null) {
      Toast.error(context, 'Please select a pickup location');
      return;
    }

    setState(() => _isProcessing = true);

    try {
      final cart = context.read<CartProvider>();
      final shippingFee =
          _shippingMethod == 'pickup' ? (_deliveryFee ?? 0) : 250.0;
      final totalAmount = cart.totalAmount + shippingFee;
      final phoneNumber =
          _apiService.normalizePhoneNumber(_phoneController.text.trim());
      final user = Supabase.instance.client.auth.currentUser;

      if (user == null) throw Exception('User not authenticated');

      // Create order
      final orderItems = cart.items
          .map((item) => {
                'product_id': item.product.id,
                'product_name': item.product.name,
                'quantity': item.quantity,
                'price': item.product.price,
              })
          .toList();

      final orderResponse = await _apiService.createOrder(
        userId: user.id,
        items: orderItems,
        totalAmount: totalAmount,
        phoneNumber: phoneNumber,
        pickupLocation: _selectedLocationId,
      );

      final orderId = orderResponse['order_id'] ?? orderResponse['id'];

      // Handle payment
      if (_paymentMethod == 'mpesa') {
        await _apiService.initiateStkPush(
          phoneNumber: phoneNumber,
          amount: totalAmount,
          accountReference: 'Order-$orderId',
        );
        if (!mounted) return;
        Toast.success(context, 'M-Pesa payment prompt sent to your phone');
      } else {
        if (!mounted) return;
        Toast.success(context, 'Order placed! Pay on delivery.');
      }

      // Create delivery package if pickup
      if (_shippingMethod == 'pickup' &&
          _selectedLocationId != null &&
          Config.pickupMtaaniOriginId.isNotEmpty) {
        try {
          await _apiService.createDeliveryPackage(
            orderId: orderId,
            originId: Config.pickupMtaaniOriginId,
            destinationId: _selectedLocationId!,
            recipientName:
                '${_firstNameController.text} ${_lastNameController.text}',
            recipientPhone: phoneNumber,
            description: 'Order #$orderId - ${cart.items.length} items',
          );
        } catch (e) {
          debugPrint('Delivery package creation failed: $e');
        }
      }

      if (!mounted) return;
      cart.clear();
      setState(() {
        _isSuccess = true;
        _isProcessing = false;
      });
    } catch (e) {
      debugPrint('Order submission error: $e');
      if (mounted) {
        Toast.error(context, 'Failed to process order. Please try again.');
        setState(() => _isProcessing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = context.watch<CartProvider>();
    final currencyFormat =
        NumberFormat.currency(symbol: 'KES ', decimalDigits: 0);

    if (_isSuccess) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color:
                        Theme.of(context).colorScheme.tertiary.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    LucideIcons.checkCircle2,
                    size: 64,
                    color: Theme.of(context).colorScheme.tertiary,
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'Order Confirmed!',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 16),
                Text(
                  _paymentMethod == 'mpesa'
                      ? 'Thank you for your purchase. You will receive an M-Pesa confirmation shortly.'
                      : 'Thank you for your order. Please have the exact amount ready upon delivery/pickup.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Theme.of(context)
                        .colorScheme
                        .onSurface
                        .withOpacity(0.6),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  "We'll start processing your order right away.",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Theme.of(context)
                        .colorScheme
                        .onSurface
                        .withOpacity(0.6),
                  ),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: FilledButton(
                    onPressed: () => Navigator.of(context).pop(),
                    style: FilledButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.tertiary,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('Continue Shopping'),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (cart.items.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Checkout')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Your cart is empty',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 8),
              Text(
                'Add some items to checkout',
                style: TextStyle(
                  color:
                      Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                ),
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () => Navigator.of(context).pop(),
                style: FilledButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.tertiary,
                ),
                child: const Text('Browse Products'),
              ),
            ],
          ),
        ),
      );
    }

    final shippingFee =
        _shippingMethod == 'pickup' ? (_deliveryFee ?? 0) : 250.0;
    final total = cart.totalAmount + shippingFee;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout'),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Contact Information Card
              _buildCard(
                title: 'Contact Information',
                subtitle: 'Enter your details for delivery',
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _firstNameController,
                            decoration: const InputDecoration(
                              labelText: 'First Name',
                              hintText: 'John',
                            ),
                            validator: (v) =>
                                v?.isEmpty ?? true ? 'Required' : null,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: TextFormField(
                            controller: _lastNameController,
                            decoration: const InputDecoration(
                              labelText: 'Last Name',
                              hintText: 'Doe',
                            ),
                            validator: (v) =>
                                v?.isEmpty ?? true ? 'Required' : null,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(
                        labelText: 'Email',
                        hintText: 'john@example.com',
                      ),
                      validator: (v) => v?.isEmpty ?? true ? 'Required' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: const InputDecoration(
                        labelText: 'Phone Number',
                        hintText: '07XX XXX XXX',
                      ),
                      validator: (v) => v?.isEmpty ?? true ? 'Required' : null,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Shipping Method Card
              _buildCard(
                title: 'Shipping Method',
                subtitle: 'Choose how you want to receive your order',
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: _ShippingMethodOption(
                            icon: LucideIcons.truck,
                            label: 'Home Delivery',
                            isSelected: _shippingMethod == 'delivery',
                            onTap: () =>
                                setState(() => _shippingMethod = 'delivery'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _ShippingMethodOption(
                            icon: LucideIcons.mapPin,
                            label: 'Pickup Mtaani',
                            isSelected: _shippingMethod == 'pickup',
                            onTap: () =>
                                setState(() => _shippingMethod = 'pickup'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    if (_shippingMethod == 'delivery') ...[
                      TextFormField(
                        controller: _addressController,
                        decoration: const InputDecoration(
                          labelText: 'Delivery Address',
                          hintText: 'Street, Building, Apartment',
                        ),
                        validator: (v) =>
                            v?.isEmpty ?? true ? 'Required' : null,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _cityController,
                        decoration: const InputDecoration(
                          labelText: 'City',
                          hintText: 'Nairobi',
                        ),
                        validator: (v) =>
                            v?.isEmpty ?? true ? 'Required' : null,
                      ),
                    ] else ...[
                      DropdownButtonFormField<String>(
                        value: _selectedLocationId,
                        decoration: const InputDecoration(
                          labelText: 'Select Pickup Location',
                        ),
                        items: _pickupLocations.map((loc) {
                          return DropdownMenuItem<String>(
                            value: loc['id'] as String,
                            child: Text(
                                '${loc['name']} ${loc['town'] != null ? '(${loc['town']})' : ''}'),
                          );
                        }).toList(),
                        onChanged: _isLoadingLocations
                            ? null
                            : (value) {
                                if (value != null) {
                                  _calculateDeliveryFee(value);
                                }
                              },
                        validator: (v) =>
                            v == null ? 'Please select a location' : null,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Powered by Pickup Mtaani API',
                        style: TextStyle(
                          fontSize: 12,
                          color: Theme.of(context)
                              .colorScheme
                              .onSurface
                              .withOpacity(0.5),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Payment Method Card
              _buildCard(
                title: 'Payment Method',
                subtitle: 'Select your preferred payment option',
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: _PaymentMethodOption(
                            icon: LucideIcons.smartphone,
                            label: 'M-Pesa',
                            isSelected: _paymentMethod == 'mpesa',
                            onTap: () =>
                                setState(() => _paymentMethod = 'mpesa'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _PaymentMethodOption(
                            icon: LucideIcons.banknote,
                            label: 'Pay on Delivery',
                            isSelected: _paymentMethod == 'cod',
                            onTap: () => setState(() => _paymentMethod = 'cod'),
                          ),
                        ),
                      ],
                    ),
                    if (_paymentMethod == 'mpesa') ...[
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Theme.of(context)
                              .colorScheme
                              .tertiary
                              .withOpacity(0.05),
                          border: Border.all(
                            color: Theme.of(context)
                                .colorScheme
                                .tertiary
                                .withOpacity(0.2),
                          ),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text(
                                    'M-PESA',
                                    style: TextStyle(
                                      color: Color(0xFF10B981),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                const Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'M-Pesa Express',
                                      style: TextStyle(
                                          fontWeight: FontWeight.w600),
                                    ),
                                    Text(
                                      'Instant payment to your phone',
                                      style: TextStyle(fontSize: 12),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'We will send a payment prompt to ${_phoneController.text.isNotEmpty ? _phoneController.text : 'your phone number'}.',
                              style: const TextStyle(fontSize: 14),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Order Summary Card
              _buildCard(
                title: 'Order Summary',
                subtitle: null,
                child: Column(
                  children: [
                    ...cart.items.map((item) => Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${item.quantity}x ${item.product.name}',
                                style: TextStyle(
                                  color: Theme.of(context)
                                      .colorScheme
                                      .onSurface
                                      .withOpacity(0.7),
                                ),
                              ),
                              Text(currencyFormat.format(item.total)),
                            ],
                          ),
                        )),
                    const Divider(),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Subtotal',
                            style: TextStyle(fontWeight: FontWeight.w500)),
                        Text(currencyFormat.format(cart.totalAmount)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Shipping',
                          style: TextStyle(
                            color: Theme.of(context)
                                .colorScheme
                                .onSurface
                                .withOpacity(0.6),
                          ),
                        ),
                        Text(
                          _shippingMethod == 'pickup'
                              ? (_isCalculatingFee
                                  ? 'Calculating...'
                                  : currencyFormat.format(shippingFee))
                              : currencyFormat.format(250),
                          style: TextStyle(
                            color: Theme.of(context)
                                .colorScheme
                                .onSurface
                                .withOpacity(0.6),
                          ),
                        ),
                      ],
                    ),
                    const Divider(),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Total',
                          style: TextStyle(
                              fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          currencyFormat.format(total),
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.tertiary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 56,
                child: FilledButton(
                  onPressed: _isProcessing ? null : _submitOrder,
                  style: FilledButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.tertiary,
                    foregroundColor: Colors.white,
                  ),
                  child: _isProcessing
                      ? const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor:
                                    AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            ),
                            SizedBox(width: 12),
                            Text('Processing...'),
                          ],
                        )
                      : Text(_paymentMethod == 'mpesa'
                          ? 'Pay Now'
                          : 'Place Order'),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCard({
    required String title,
    String? subtitle,
    required Widget child,
  }) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Theme.of(context).colorScheme.outline),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: TextStyle(
                  color:
                      Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
                ),
              ),
            ],
            const SizedBox(height: 20),
            child,
          ],
        ),
      ),
    );
  }
}

class _ShippingMethodOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _ShippingMethodOption({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(
            color: isSelected
                ? Theme.of(context).colorScheme.primary
                : Theme.of(context).colorScheme.outline,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, size: 24),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}

class _PaymentMethodOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _PaymentMethodOption({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(
            color: isSelected
                ? Theme.of(context).colorScheme.primary
                : Theme.of(context).colorScheme.outline,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(icon, size: 24),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}
