import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/models/new_arrival.dart';
import 'package:mobile/services/supabase_service.dart';
import 'package:mobile/screens/admin/add_edit_new_arrival_screen.dart';

class AdminContentScreen extends StatefulWidget {
  const AdminContentScreen({super.key});

  @override
  State<AdminContentScreen> createState() => _AdminContentScreenState();
}

class _AdminContentScreenState extends State<AdminContentScreen> {
  final SupabaseService _supabaseService = SupabaseService();
  late Future<List<NewArrival>> _newArrivalsFuture;

  @override
  void initState() {
    super.initState();
    _refreshNewArrivals();
  }

  void _refreshNewArrivals() {
    setState(() {
      _newArrivalsFuture = _supabaseService.getAllNewArrivals();
    });
  }

  Future<void> _deleteNewArrival(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete New Arrival'),
        content: const Text('Are you sure you want to delete this item?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await _supabaseService.deleteNewArrival(id);
        _refreshNewArrivals();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Item deleted successfully')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error deleting item: $e')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Content Management'),
      ),
      body: FutureBuilder<List<NewArrival>>(
        future: _newArrivalsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No new arrivals found'));
          }

          final newArrivals = snapshot.data!;

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: newArrivals.length,
            itemBuilder: (context, index) {
              final item = newArrivals[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 16),
                child: ListTile(
                  leading: Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      image: DecorationImage(
                        image: NetworkImage(item.imageUrl),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  title: Text(item.title ?? 'No Title'),
                  subtitle: Text(
                      'Order: ${item.displayOrder} • ${item.isActive ? 'Active' : 'Inactive'}'),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(LucideIcons.edit, size: 20),
                        onPressed: () async {
                          final result = await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) =>
                                  AddEditNewArrivalScreen(newArrival: item),
                            ),
                          );
                          if (result == true) {
                            _refreshNewArrivals();
                          }
                        },
                      ),
                      IconButton(
                        icon: const Icon(LucideIcons.trash,
                            size: 20, color: Colors.red),
                        onPressed: () => _deleteNewArrival(item.id),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const AddEditNewArrivalScreen(),
            ),
          );
          if (result == true) {
            _refreshNewArrivals();
          }
        },
        child: const Icon(LucideIcons.plus),
      ),
    );
  }
}
