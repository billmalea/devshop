import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/models/product.dart';
import 'package:mobile/services/supabase_service.dart';

class AdminInventoryScreen extends StatefulWidget {
  const AdminInventoryScreen({super.key});

  @override
  State<AdminInventoryScreen> createState() => _AdminInventoryScreenState();
}

class _AdminInventoryScreenState extends State<AdminInventoryScreen> {
  final SupabaseService _supabaseService = SupabaseService();
  List<Product> _products = [];
  List<Product> _filteredProducts = [];
  bool _isLoading = true;
  String _filter = 'all'; // 'all', 'low', 'out'

  @override
  void initState() {
    super.initState();
    _fetchInventory();
  }

  Future<void> _fetchInventory() async {
    setState(() => _isLoading = true);
    try {
      final products = await _supabaseService.getAllProducts();
      if (mounted) {
        setState(() {
          _products = products;
          _applyFilter();
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching inventory: $e');
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _applyFilter() {
    setState(() {
      switch (_filter) {
        case 'low':
          _filteredProducts =
              _products.where((p) => p.stock > 0 && p.stock < 5).toList();
          break;
        case 'out':
          _filteredProducts = _products.where((p) => p.stock == 0).toList();
          break;
        default:
          _filteredProducts = _products;
      }
    });
  }

  Future<void> _updateStock(String productId, int newStock) async {
    try {
      await _supabaseService.updateProduct(productId, {'stock': newStock});
      setState(() {
        final index = _products.indexWhere((p) => p.id == productId);
        if (index != -1) {
          _products[index] = Product(
            id: _products[index].id,
            name: _products[index].name,
            description: _products[index].description,
            price: _products[index].price,
            category: _products[index].category,
            brand: _products[index].brand,
            imageUrl: _products[index].imageUrl,
            stock: newStock,
            isActive: _products[index].isActive,
            createdAt: _products[index].createdAt,
          );
        }
        _applyFilter();
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Stock updated')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error updating stock: $e')),
        );
      }
    }
  }

  int get _lowStockCount => _products.where((p) => p.stock < 5).length;
  int get _outOfStockCount => _products.where((p) => p.stock == 0).length;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Inventory'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Stats Cards
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Expanded(
                        child: _StatCard(
                          icon: LucideIcons.package,
                          label: 'Total',
                          value: _products.length.toString(),
                          color: Colors.blue,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _StatCard(
                          icon: LucideIcons.alertTriangle,
                          label: 'Low Stock',
                          value: _lowStockCount.toString(),
                          color: Colors.orange,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _StatCard(
                          icon: LucideIcons.xCircle,
                          label: 'Out',
                          value: _outOfStockCount.toString(),
                          color: Colors.red,
                        ),
                      ),
                    ],
                  ),
                ),
                // Filter Buttons
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    children: [
                      _FilterChip(
                        label: 'All',
                        isSelected: _filter == 'all',
                        onTap: () {
                          setState(() => _filter = 'all');
                          _applyFilter();
                        },
                      ),
                      const SizedBox(width: 8),
                      _FilterChip(
                        label: 'Low Stock',
                        isSelected: _filter == 'low',
                        onTap: () {
                          setState(() => _filter = 'low');
                          _applyFilter();
                        },
                      ),
                      const SizedBox(width: 8),
                      _FilterChip(
                        label: 'Out of Stock',
                        isSelected: _filter == 'out',
                        onTap: () {
                          setState(() => _filter = 'out');
                          _applyFilter();
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                // Products List
                Expanded(
                  child: _filteredProducts.isEmpty
                      ? const Center(
                          child: Text('No products match this filter'))
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: _filteredProducts.length,
                          itemBuilder: (context, index) {
                            final product = _filteredProducts[index];
                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: ListTile(
                                title: Text(product.name),
                                subtitle: Text(product.category),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 4,
                                      ),
                                      decoration: BoxDecoration(
                                        color: product.stock == 0
                                            ? Colors.red.withOpacity(0.2)
                                            : product.stock < 5
                                                ? Colors.orange.withOpacity(0.2)
                                                : Colors.green.withOpacity(0.2),
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        product.stock.toString(),
                                        style: TextStyle(
                                          color: product.stock == 0
                                              ? Colors.red
                                              : product.stock < 5
                                                  ? Colors.orange
                                                  : Colors.green,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    IconButton(
                                      icon: const Icon(LucideIcons.edit,
                                          size: 20),
                                      onPressed: () =>
                                          _showStockDialog(product),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
    );
  }

  void _showStockDialog(Product product) {
    final controller = TextEditingController(text: product.stock.toString());
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Update Stock: ${product.name}'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(
            labelText: 'Stock Quantity',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              final newStock = int.tryParse(controller.text);
              if (newStock != null) {
                _updateStock(product.id, newStock);
                Navigator.pop(context);
              }
            },
            child: const Text('Update'),
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Theme.of(context).colorScheme.outline,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? Theme.of(context).colorScheme.primary
              : Theme.of(context).colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected
                ? Theme.of(context).colorScheme.onPrimary
                : Theme.of(context).colorScheme.onSurface,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}
