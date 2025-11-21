import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/models/order.dart';
import 'package:mobile/services/supabase_service.dart';

class AdminOrderDetailsScreen extends StatefulWidget {
  final Order order;

  const AdminOrderDetailsScreen({super.key, required this.order});

  @override
  State<AdminOrderDetailsScreen> createState() =>
      _AdminOrderDetailsScreenState();
}

class _AdminOrderDetailsScreenState extends State<AdminOrderDetailsScreen> {
  final SupabaseService _supabaseService = SupabaseService();
  late String _currentStatus;
  bool _isUpdating = false;

  final List<String> _statusOptions = [
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  @override
  void initState() {
    super.initState();
    _currentStatus = widget.order.status;
  }

  Future<void> _updateStatus(String? newStatus) async {
    if (newStatus == null || newStatus == _currentStatus) return;

    setState(() => _isUpdating = true);

    try {
      await _supabaseService.updateOrderStatus(widget.order.id, newStatus);
      setState(() {
        _currentStatus = newStatus;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Order status updated successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error updating status: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isUpdating = false);
      }
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return Colors.orange;
      case 'processing':
        return Colors.blue;
      case 'shipped':
        return Colors.purple;
      case 'delivered':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Order #${widget.order.id.substring(0, 8)}'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Section
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Order Status',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: _statusOptions.contains(_currentStatus)
                          ? _currentStatus
                          : null,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 12),
                      ),
                      items: _statusOptions.map((status) {
                        return DropdownMenuItem(
                          value: status,
                          child: Row(
                            children: [
                              Container(
                                width: 12,
                                height: 12,
                                decoration: BoxDecoration(
                                  color: _getStatusColor(status),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(status),
                            ],
                          ),
                        );
                      }).toList(),
                      onChanged: _isUpdating ? null : _updateStatus,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Customer Info
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Customer Details',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _DetailRow(
                      icon: LucideIcons.calendar,
                      label: 'Date',
                      value: DateFormat('MMM dd, yyyy HH:mm')
                          .format(widget.order.createdAt),
                    ),
                    if (widget.order.shippingAddress != null) ...[
                      const SizedBox(height: 8),
                      _DetailRow(
                        icon: LucideIcons.mapPin,
                        label: 'Address',
                        value: widget.order.shippingAddress!,
                      ),
                    ],
                    if (widget.order.paymentMethod != null) ...[
                      const SizedBox(height: 8),
                      _DetailRow(
                        icon: LucideIcons.creditCard,
                        label: 'Payment',
                        value: widget.order.paymentMethod == 'mpesa'
                            ? 'M-Pesa'
                            : (widget.order.paymentMethod == 'cod'
                                ? 'Cash on Delivery'
                                : widget.order.paymentMethod!),
                      ),
                    ],
                    if (widget.order.shippingMethod != null) ...[
                      const SizedBox(height: 8),
                      _DetailRow(
                        icon: LucideIcons.truck,
                        label: 'Shipping',
                        value: widget.order.shippingMethod == 'pickup_agent'
                            ? 'Pickup Mtaani'
                            : (widget.order.shippingMethod == 'home_delivery'
                                ? 'Home Delivery'
                                : widget.order.shippingMethod!),
                      ),
                    ],
                    if (widget.order.phoneNumber != null) ...[
                      const SizedBox(height: 8),
                      _DetailRow(
                        icon: LucideIcons.phone,
                        label: 'Phone',
                        value: widget.order.phoneNumber!,
                      ),
                    ],
                    if (widget.order.pickupLocation != null) ...[
                      const SizedBox(height: 8),
                      _DetailRow(
                        icon: LucideIcons.store,
                        label: 'Pickup',
                        value: widget.order.pickupLocation!,
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Order Items
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Order Items',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    if (widget.order.items != null)
                      ...widget.order.items!.map((item) => Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.grey[100],
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(LucideIcons.package,
                                      size: 20, color: Colors.grey),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item.productName,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      Text(
                                        'Qty: ${item.quantity} x KES ${item.price}',
                                        style: TextStyle(
                                          color: Colors.grey[600],
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                Text(
                                  'KES ${(item.price * item.quantity).toStringAsFixed(0)}',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          )),
                    const Divider(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Total Amount',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        Text(
                          'KES ${widget.order.totalAmount.toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 18,
                            color: Colors.blue,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: Colors.grey),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
              Text(
                value,
                style: const TextStyle(fontSize: 14),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
