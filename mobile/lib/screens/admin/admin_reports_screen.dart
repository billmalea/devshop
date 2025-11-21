import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';

class AdminReportsScreen extends StatefulWidget {
  const AdminReportsScreen({super.key});

  @override
  State<AdminReportsScreen> createState() => _AdminReportsScreenState();
}

class _AdminReportsScreenState extends State<AdminReportsScreen> {
  final _supabase = Supabase.instance.client;
  bool _isLoading = true;

  // Stats
  double _totalRevenue = 0;
  int _totalOrders = 0;
  int _totalUsers = 0;
  double _averageOrderValue = 0;

  // Recent data
  List<Map<String, dynamic>> _recentOrders = [];
  Map<String, double> _salesByDate = {};
  Map<String, int> _usersByDate = {};

  @override
  void initState() {
    super.initState();
    _fetchReports();
  }

  Future<void> _fetchReports() async {
    setState(() => _isLoading = true);
    try {
      // Fetch orders
      final ordersResponse = await _supabase
          .from('orders')
          .select()
          .order('created_at', ascending: false);

      final orders = List<Map<String, dynamic>>.from(ordersResponse);

      // Calculate stats
      double revenue = 0;
      final salesByDate = <String, double>{};

      for (var order in orders) {
        final amount = (order['total_amount'] as num?)?.toDouble() ?? 0;
        revenue += amount;

        final date =
            DateFormat('MMM d').format(DateTime.parse(order['created_at']));
        salesByDate[date] = (salesByDate[date] ?? 0) + amount;
      }

      // Fetch users
      final usersResponse = await _supabase
          .from('profiles')
          .select()
          .order('created_at', ascending: false);

      final users = List<Map<String, dynamic>>.from(usersResponse);

      final usersByDate = <String, int>{};
      for (var user in users) {
        final date =
            DateFormat('MMM d').format(DateTime.parse(user['created_at']));
        usersByDate[date] = (usersByDate[date] ?? 0) + 1;
      }

      if (mounted) {
        setState(() {
          _totalRevenue = revenue;
          _totalOrders = orders.length;
          _totalUsers = users.length;
          _averageOrderValue = orders.isEmpty ? 0 : revenue / orders.length;
          _recentOrders = orders.take(10).toList();
          _salesByDate = salesByDate;
          _usersByDate = usersByDate;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching reports: $e');
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading reports: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reports'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw),
            onPressed: _fetchReports,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchReports,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Key Metrics
                    Text(
                      'Key Metrics',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: _MetricCard(
                            icon: LucideIcons.dollarSign,
                            label: 'Total Revenue',
                            value: 'KES ${_totalRevenue.toStringAsFixed(0)}',
                            color: Colors.green,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _MetricCard(
                            icon: LucideIcons.shoppingCart,
                            label: 'Total Orders',
                            value: _totalOrders.toString(),
                            color: Colors.blue,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _MetricCard(
                            icon: LucideIcons.users,
                            label: 'Total Users',
                            value: _totalUsers.toString(),
                            color: Colors.purple,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _MetricCard(
                            icon: LucideIcons.trendingUp,
                            label: 'Avg Order',
                            value:
                                'KES ${_averageOrderValue.toStringAsFixed(0)}',
                            color: Colors.orange,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),

                    // Sales by Date
                    Text(
                      'Sales by Date (Last 7 Days)',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 16),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: _salesByDate.isEmpty
                            ? const Text('No sales data available')
                            : Column(
                                children: _salesByDate.entries
                                    .take(7)
                                    .map((entry) => Padding(
                                          padding:
                                              const EdgeInsets.only(bottom: 12),
                                          child: Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.spaceBetween,
                                            children: [
                                              Text(entry.key),
                                              Text(
                                                'KES ${entry.value.toStringAsFixed(0)}',
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ))
                                    .toList(),
                              ),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // User Registrations
                    Text(
                      'User Registrations (Last 7 Days)',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 16),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: _usersByDate.isEmpty
                            ? const Text('No user data available')
                            : Column(
                                children: _usersByDate.entries
                                    .take(7)
                                    .map((entry) => Padding(
                                          padding:
                                              const EdgeInsets.only(bottom: 12),
                                          child: Row(
                                            mainAxisAlignment:
                                                MainAxisAlignment.spaceBetween,
                                            children: [
                                              Text(entry.key),
                                              Text(
                                                '${entry.value} users',
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ))
                                    .toList(),
                              ),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Recent Orders
                    Text(
                      'Recent Orders',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 16),
                    ..._recentOrders.map((order) => Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: Icon(
                              LucideIcons.shoppingBag,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                            title: Text(
                              'KES ${(order['total_amount'] as num?)?.toStringAsFixed(0) ?? '0'}',
                              style:
                                  const TextStyle(fontWeight: FontWeight.bold),
                            ),
                            subtitle: Text(
                              DateFormat('MMM d, y h:mm a')
                                  .format(DateTime.parse(order['created_at'])),
                            ),
                            trailing: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: _getStatusColor(order['status'])
                                    .withOpacity(0.2),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                order['status'] ?? 'pending',
                                style: TextStyle(
                                  color: _getStatusColor(order['status']),
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        )),
                  ],
                ),
              ),
            ),
    );
  }

  Color _getStatusColor(String? status) {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return Colors.green;
      case 'processing':
      case 'confirmed':
        return Colors.blue;
      case 'pending':
        return Colors.orange;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}

class _MetricCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _MetricCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 12),
            Text(
              value,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
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
