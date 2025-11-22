import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/screens/admin/admin_products_screen.dart';
import 'package:mobile/screens/admin/admin_orders_screen.dart';
import 'package:mobile/screens/admin/admin_content_screen.dart';
import 'package:mobile/screens/admin/admin_categories_screen.dart';
import 'package:mobile/screens/admin/admin_deliveries_screen.dart';
import 'package:mobile/screens/admin/admin_inventory_screen.dart';
import 'package:mobile/screens/admin/admin_users_screen.dart';
import 'package:mobile/screens/admin/admin_reports_screen.dart';
import 'package:mobile/screens/admin/admin_settings_screen.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AdminHomeScreen extends StatefulWidget {
  const AdminHomeScreen({super.key});

  @override
  State<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends State<AdminHomeScreen> {
  final _supabase = Supabase.instance.client;
  Map<String, int> _stats = {
    'products': 0,
    'orders': 0,
    'users': 0,
  };
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    try {
      final productsCount = await _supabase.from('products').select().count();

      final ordersCount = await _supabase.from('orders').select().count();

      final usersCount = await _supabase.from('profiles').select().count();

      setState(() {
        _stats = {
          'products': productsCount.count,
          'orders': ordersCount.count,
          'users': usersCount.count,
        };
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Panel'),
        centerTitle: true,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Welcome Section
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Colors.blue.shade600,
                          Colors.blue.shade800,
                        ],
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Welcome to Admin Panel',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Manage your DevShop store',
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.9),
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Stats Cards
                  const Text(
                    'Overview',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _StatCard(
                          title: 'Products',
                          value: _stats['products'].toString(),
                          icon: LucideIcons.package,
                          color: Colors.purple,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _StatCard(
                          title: 'Orders',
                          value: _stats['orders'].toString(),
                          icon: LucideIcons.shoppingCart,
                          color: Colors.orange,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _StatCard(
                          title: 'Users',
                          value: _stats['users'].toString(),
                          icon: LucideIcons.users,
                          color: Colors.green,
                        ),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(child: SizedBox()),
                    ],
                  ),

                  const SizedBox(height: 32),

                  // Admin Sections
                  const Text(
                    'Management',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _AdminMenuItem(
                    title: 'Products',
                    subtitle: 'Manage products and inventory',
                    icon: LucideIcons.package,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const AdminProductsScreen(),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 12),
                  _AdminMenuItem(
                    title: 'Orders',
                    subtitle: 'View and manage orders',
                    icon: LucideIcons.shoppingCart,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const AdminOrdersScreen(),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 12),
                  _AdminMenuItem(
                    title: 'Content',
                    subtitle: 'Manage new arrivals and content',
                    icon: LucideIcons.fileText,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const AdminContentScreen(),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 12),
                  _AdminMenuItem(
                    title: 'Categories',
                    subtitle: 'Manage product categories',
                    icon: LucideIcons.folderTree,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const AdminCategoriesScreen(),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 12),
                  _AdminMenuItem(
                    title: 'Inventory',
                    subtitle: 'Track and manage stock levels',
                    icon: LucideIcons.warehouse,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const AdminInventoryScreen(),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 12),
                  _AdminMenuItem(
                    title: 'Deliveries',
                    subtitle: 'View Pickup Mtaani deliveries',
                    icon: LucideIcons.truck,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const AdminDeliveriesScreen(),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 12),
                  _AdminMenuItem(
                    title: 'Users',
                    subtitle: 'Manage customer accounts',
                    icon: LucideIcons.users,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const AdminUsersScreen(),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 12),
                  const SizedBox(height: 12),
                  _AdminMenuItem(
                    title: 'Reports',
                    subtitle: 'Analytics and insights',
                    icon: LucideIcons.barChart,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const AdminReportsScreen(),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 12),
                  _AdminMenuItem(
                    title: 'Settings',
                    subtitle: 'Configure app settings',
                    icon: LucideIcons.settings,
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const AdminSettingsScreen(),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.secondary,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Theme.of(context).colorScheme.outline.withOpacity(0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 12),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.6),
            ),
          ),
        ],
      ),
    );
  }
}

class _AdminMenuItem extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final VoidCallback onTap;

  const _AdminMenuItem({
    required this.title,
    required this.subtitle,
    required this.icon,
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
          color: Theme.of(context).colorScheme.secondary,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: Theme.of(context).colorScheme.outline.withOpacity(0.2),
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: Colors.blue, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 12,
                      color: Theme.of(context)
                          .colorScheme
                          .onSurface
                          .withOpacity(0.6),
                    ),
                  ),
                ],
              ),
            ),
            Icon(
              LucideIcons.chevronRight,
              color: Theme.of(context).colorScheme.onSurface.withOpacity(0.4),
            ),
          ],
        ),
      ),
    );
  }
}
