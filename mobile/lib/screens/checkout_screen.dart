import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/config.dart';
import 'package:mobile/providers/cart_provider.dart';
import 'package:mobile/services/api_service.dart';
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

  String _shippingMethod = 'pickup'; // 'pickup' or 'doorstep'
  String _paymentMethod = 'mpesa'; // 'mpesa' or 'cod'

  // Location Data
  List<Map<String, dynamic>> _areas = [];
  List<Map<String, dynamic>> _locations = [];
  List<Map<String, dynamic>> _agents = [];
  List<Map<String, dynamic>> _doorstepDestinations = [];

  // Selected Values
  String? _selectedAreaId;
  String? _selectedLocationId;
  String? _selectedAgentId;
  String? _selectedDoorstepId;
  String? _originId;

  bool _isLoadingLocations = true;
  bool _isLoadingAgents = false;
  bool _isProcessing = false;
  bool _isSuccess = false;
  double? _deliveryFee;
  bool _isCalculatingFee = false;
  bool _isLoadingDoorstepDestinations = false;

  @override
  void initState() {
    super.initState();
    _loadOriginSettings();
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

  void _prefillUserData() async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return;

      // Set email
      if (user.email != null && user.email!.isNotEmpty) {
        _emailController.text = user.email!;
      }

      // Fetch profile from database
      final response = await Supabase.instance.client
          .from('profiles')
          .select('full_name, phone_number')
          .eq('id', user.id)
          .maybeSingle();

      if (response != null) {
        // Handle full name
        final fullName = response['full_name'] as String? ??
            user.userMetadata?['full_name'] as String? ??
            '';
        if (fullName.isNotEmpty) {
          final parts = fullName.trim().split(RegExp(r'\s+'));
          if (parts.isNotEmpty) {
            _firstNameController.text = parts[0];
            if (parts.length > 1) {
              _lastNameController.text = parts.sublist(1).join(' ');
            }
          }
        }

        // Handle phone number
        final phoneNumber = response['phone_number'] as String? ??
            user.userMetadata?['phone'] as String? ??
            '';
        if (phoneNumber.isNotEmpty) {
          _phoneController.text = phoneNumber;
        }
      }
    } catch (e) {
      debugPrint('Error prefilling user data: $e');
    }
  }

  Future<void> _loadOriginSettings() async {
    try {
      // Fetch settings directly from Supabase (app_settings table)
      final response = await Supabase.instance.client
          .from('app_settings')
          .select('value')
          .eq('key', 'pickup_mtaani_origin')
          .maybeSingle();

      debugPrint('Settings response from Supabase: $response');

      if (response != null && response['value'] != null) {
        var origin = response['value'];
        debugPrint('Origin data (raw): $origin');

        // Handle case where origin is a JSON string
        if (origin is String) {
          try {
            origin = json.decode(origin);
          } catch (e) {
            debugPrint('Error parsing origin JSON string: $e');
          }
        }

        if (origin is Map) {
          if (mounted) {
            setState(() {
              // Prefer agent_id, fallback to location_id
              _originId = origin['agent_id']?.toString() ??
                  origin['location_id']?.toString() ??
                  '';
              debugPrint('Set origin ID: $_originId');
            });
          }
        }
      } else {
        debugPrint('No pickup_mtaani_origin setting found');
      }
    } catch (e) {
      debugPrint('Error loading origin settings: $e');
      // Fallback to Config.pickupMtaaniOriginId will be used
    }
  }

  Future<void> _loadPickupLocations() async {
    setState(() => _isLoadingLocations = true);
    try {
      // Only load areas initially, locations will be loaded when area is selected
      final areas = await _apiService.getPickupAreas();

      if (mounted) {
        setState(() {
          _areas = areas;
          _isLoadingLocations = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading pickup areas: $e');
      if (mounted) {
        setState(() => _isLoadingLocations = false);
        Toast.error(context, 'Failed to load pickup areas');
      }
    }
  }

  Future<void> _loadLocationsByArea(String areaId) async {
    setState(() {
      _isLoadingLocations = true;
      _locations = [];
      _agents = [];
      _selectedLocationId = null;
      _selectedAgentId = null;
    });

    try {
      final locations = await _apiService.getPickupLocations(areaId: areaId);
      if (mounted) {
        setState(() {
          _locations = locations;
          _isLoadingLocations = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading pickup locations: $e');
      if (mounted) {
        setState(() => _isLoadingLocations = false);
        Toast.error(context, 'Failed to load pickup locations');
      }
    }
  }

  Future<void> _loadAgents(String locationId) async {
    setState(() {
      _isLoadingAgents = true;
      _agents = [];
      _selectedAgentId = null;
    });

    try {
      final agents = await _apiService.getPickupAgents(locationId);
      if (mounted) {
        setState(() {
          _agents = agents;
          _isLoadingAgents = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading pickup agents: $e');
      if (mounted) {
        setState(() => _isLoadingAgents = false);
        Toast.error(context, 'Failed to load pickup agents');
      }
    }
  }

  Future<void> _loadDoorstepDestinations(String areaId) async {
    setState(() {
      _isLoadingDoorstepDestinations = true;
      _doorstepDestinations = [];
    });

    try {
      final destinations =
          await _apiService.getDoorstepDestinations(areaId: areaId);
      if (mounted) {
        setState(() {
          _doorstepDestinations = destinations;
          _isLoadingDoorstepDestinations = false;
        });

        // Show message if no destinations available
        if (destinations.isEmpty) {
          Toast.info(context, 'Door delivery not available in this area');
        }
      }
    } catch (e) {
      debugPrint('Error loading doorstep destinations: $e');
      if (mounted) {
        setState(() => _isLoadingDoorstepDestinations = false);
        Toast.error(context, 'Failed to load doorstep destinations');
      }
    }
  }

  Future<void> _calculateDeliveryFee(String destinationId, String type) async {
    setState(() {
      _isCalculatingFee = true;
      _deliveryFee = null;
    });

    // Retry loading origin if missing
    if (_originId == null || _originId!.isEmpty) {
      await _loadOriginSettings();
    }

    final originId = _originId ?? Config.pickupMtaaniOriginId;
    debugPrint(
        'Calculating delivery fee: origin=$originId, destination=$destinationId, type=$type');

    if (originId.isEmpty) {
      debugPrint('Error: Origin ID is empty');
      if (mounted) {
        setState(() {
          _isCalculatingFee = false;
          _deliveryFee = 250.0;
        });
        Toast.error(context, 'Origin location not configured');
      }
      return;
    }

    try {
      final response = await _apiService.calculateDeliveryCharge(
        originId,
        destinationId,
        type,
      );

      debugPrint('Delivery fee response: $response');

      if (mounted) {
        setState(() {
          _deliveryFee = response['amount']?.toDouble() ??
              response['price']?.toDouble() ??
              response['data']?['amount']?.toDouble() ??
              response['data']?['price']?.toDouble() ??
              250.0;
          _isCalculatingFee = false;
        });
      }
    } catch (e) {
      debugPrint('Error calculating delivery fee: $e');
      if (mounted) {
        setState(() {
          _isCalculatingFee = false;
          _deliveryFee = 250.0; // Fallback
        });
        Toast.error(
            context, 'Could not calculate delivery fee. Using default.');
      }
    }
  }

  Future<void> _submitOrder() async {
    if (!_formKey.currentState!.validate()) return;

    if (_shippingMethod == 'pickup' && _selectedAgentId == null) {
      Toast.error(context, 'Please select a pickup agent');
      return;
    }

    if (_shippingMethod == 'doorstep' && _selectedDoorstepId == null) {
      Toast.error(context, 'Please select a delivery destination');
      return;
    }

    setState(() => _isProcessing = true);

    try {
      final cart = context.read<CartProvider>();
      final shippingFee =
          (_shippingMethod == 'pickup' || _shippingMethod == 'doorstep')
              ? (_deliveryFee ?? 0)
              : 250.0;
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
        pickupLocation: _shippingMethod == 'pickup' ? _selectedAgentId : null,
        deliveryAddress: _shippingMethod == 'doorstep'
            ? '${_addressController.text}, ${_cityController.text}'
            : _shippingMethod == 'delivery'
                ? '${_addressController.text}, ${_cityController.text}'
                : null,
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

      // Create delivery package if pickup or doorstep
      if ((_shippingMethod == 'pickup' || _shippingMethod == 'doorstep') &&
          Config.pickupMtaaniOriginId.isNotEmpty) {
        final destinationId = _shippingMethod == 'pickup'
            ? _selectedAgentId
            : _selectedDoorstepId;

        if (destinationId != null) {
          try {
            await _apiService.createDeliveryPackage(
              orderId: orderId,
              originId: _originId ?? Config.pickupMtaaniOriginId,
              destinationId: destinationId,
              recipientName:
                  '${_firstNameController.text} ${_lastNameController.text}',
              recipientPhone: phoneNumber,
              description: 'Order #$orderId - ${cart.items.length} items',
              type: _shippingMethod == 'pickup' ? 'agent' : 'doorstep',
              deliveryAddress: _shippingMethod == 'doorstep'
                  ? '${_addressController.text}, ${_cityController.text}'
                  : null,
            );
          } catch (e) {
            debugPrint('Delivery package creation failed: $e');
          }
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
        (_shippingMethod == 'pickup' || _shippingMethod == 'doorstep')
            ? (_deliveryFee ?? 0)
            : 250.0;
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
                            icon: LucideIcons.mapPin,
                            label: 'Pickup Station',
                            isSelected: _shippingMethod == 'pickup',
                            onTap: () =>
                                setState(() => _shippingMethod = 'pickup'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _ShippingMethodOption(
                            icon: LucideIcons.home,
                            label: 'Door Delivery',
                            isSelected: _shippingMethod == 'doorstep',
                            onTap: () =>
                                setState(() => _shippingMethod = 'doorstep'),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Common Area Selection
                    DropdownButtonFormField<String>(
                      value: _selectedAreaId,
                      decoration: InputDecoration(
                        labelText: 'Select Area / Region',
                        suffixIcon: _isLoadingLocations
                            ? const Padding(
                                padding: EdgeInsets.all(12.0),
                                child: SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                ),
                              )
                            : null,
                      ),
                      items: _areas.map((area) {
                        return DropdownMenuItem<String>(
                          value: area['id'].toString(),
                          child: Text(area['name'] ?? ''),
                        );
                      }).toList(),
                      onChanged: _isLoadingLocations
                          ? null
                          : (value) {
                              setState(() {
                                _selectedAreaId = value;
                                _selectedLocationId = null;
                                _selectedAgentId = null;
                                _selectedDoorstepId = null;
                                _deliveryFee = null;
                              });
                              if (value != null) {
                                if (_shippingMethod == 'pickup') {
                                  _loadLocationsByArea(value);
                                } else if (_shippingMethod == 'doorstep') {
                                  _loadDoorstepDestinations(value);
                                }
                              } else {
                                // Clear locations when area is deselected
                                setState(() {
                                  _locations = [];
                                  _doorstepDestinations = [];
                                });
                              }
                            },
                      validator: (v) =>
                          v == null ? 'Please select an area' : null,
                    ),
                    const SizedBox(height: 16),

                    if (_shippingMethod == 'pickup') ...[
                      DropdownButtonFormField<String>(
                        value: _selectedLocationId,
                        isExpanded: true,
                        decoration: const InputDecoration(
                          labelText: 'Select Pickup Point',
                        ),
                        items: _locations.map((loc) {
                          return DropdownMenuItem<String>(
                            value: loc['id']?.toString(),
                            child: Text(
                              loc['name'] ?? loc['agent_location'] ?? '',
                              overflow: TextOverflow.ellipsis,
                            ),
                          );
                        }).toList(),
                        onChanged:
                            _selectedAreaId == null || _isLoadingLocations
                                ? null
                                : (value) {
                                    if (value != null) {
                                      setState(() {
                                        _selectedLocationId = value;
                                        _selectedAgentId = null;
                                        _deliveryFee = null;
                                      });
                                      _loadAgents(value);
                                    }
                                  },
                        validator: (v) =>
                            v == null ? 'Please select a pickup point' : null,
                      ),
                      const SizedBox(height: 16),
                      DropdownButtonFormField<String>(
                        value: _selectedAgentId,
                        isExpanded: true,
                        decoration: InputDecoration(
                          labelText: 'Select Pickup Agent',
                          suffixIcon: _isLoadingAgents
                              ? const Padding(
                                  padding: EdgeInsets.all(12.0),
                                  child: SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  ),
                                )
                              : null,
                        ),
                        items: _agents.map((agent) {
                          return DropdownMenuItem<String>(
                            value: agent['id']?.toString(),
                            child: Text(
                              agent['business_name'] ?? '',
                              overflow: TextOverflow.ellipsis,
                            ),
                          );
                        }).toList(),
                        onChanged:
                            _selectedLocationId == null || _isLoadingAgents
                                ? null
                                : (value) {
                                    if (value != null) {
                                      setState(() {
                                        _selectedAgentId = value;
                                      });
                                      _calculateDeliveryFee(value, 'agent');
                                    }
                                  },
                        validator: (v) =>
                            v == null ? 'Please select a pickup agent' : null,
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
                    ] else if (_shippingMethod == 'doorstep') ...[
                      DropdownButtonFormField<String>(
                        value: _selectedDoorstepId,
                        isExpanded: true,
                        decoration: InputDecoration(
                          labelText: 'Select Doorstep Destination',
                          suffixIcon: _isLoadingDoorstepDestinations
                              ? const Padding(
                                  padding: EdgeInsets.all(12.0),
                                  child: SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  ),
                                )
                              : null,
                        ),
                        items: _doorstepDestinations.map((dest) {
                          return DropdownMenuItem<String>(
                            value: dest['id']?.toString(),
                            child: Text(dest['name'] ?? ''),
                          );
                        }).toList(),
                        onChanged: _selectedAreaId == null ||
                                _isLoadingDoorstepDestinations
                            ? null
                            : (value) {
                                if (value != null) {
                                  setState(() {
                                    _selectedDoorstepId = value;
                                  });
                                  _calculateDeliveryFee(value, 'doorstep');
                                }
                              },
                        validator: (v) =>
                            v == null ? 'Please select a destination' : null,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _addressController,
                        decoration: const InputDecoration(
                          labelText: 'Specific Address Details',
                          hintText: 'House No, Street, Landmark',
                        ),
                        validator: (v) =>
                            v?.isEmpty ?? true ? 'Required' : null,
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
                          (_shippingMethod == 'pickup' ||
                                  _shippingMethod == 'doorstep')
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
                ? Theme.of(context).colorScheme.tertiary
                : Theme.of(context).colorScheme.outline.withOpacity(0.5),
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
          color: isSelected
              ? Theme.of(context).colorScheme.tertiary.withOpacity(0.05)
              : null,
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected
                  ? Theme.of(context).colorScheme.tertiary
                  : Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
              size: 28,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                color: isSelected
                    ? Theme.of(context).colorScheme.tertiary
                    : Theme.of(context).colorScheme.onSurface,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
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
                ? Theme.of(context).colorScheme.tertiary
                : Theme.of(context).colorScheme.outline.withOpacity(0.5),
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
          color: isSelected
              ? Theme.of(context).colorScheme.tertiary.withOpacity(0.05)
              : null,
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color: isSelected
                  ? Theme.of(context).colorScheme.tertiary
                  : Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
              size: 28,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                color: isSelected
                    ? Theme.of(context).colorScheme.tertiary
                    : Theme.of(context).colorScheme.onSurface,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
