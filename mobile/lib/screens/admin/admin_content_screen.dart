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
  final List<NewArrival?> _heroSlots = [null, null, null]; // Fixed 3 slots
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadHeroImages();
  }

  Future<void> _loadHeroImages() async {
    setState(() => _isLoading = true);
    try {
      final newArrivals = await _supabaseService.getAllNewArrivals();

      // Sort by display order and take first 3
      newArrivals.sort((a, b) => a.displayOrder.compareTo(b.displayOrder));

      if (mounted) {
        setState(() {
          for (int i = 0; i < 3; i++) {
            if (i < newArrivals.length) {
              _heroSlots[i] = newArrivals[i];
            } else {
              _heroSlots[i] = null;
            }
          }
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading hero images: $e');
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading content: $e')),
        );
      }
    }
  }

  Future<void> _deleteSlot(int index) async {
    final slot = _heroSlots[index];
    if (slot == null) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Hero Image'),
        content: const Text('Are you sure you want to delete this hero image?'),
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
        await _supabaseService.deleteNewArrival(slot.id);
        await _loadHeroImages();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Hero image deleted successfully')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error deleting: $e')),
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
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw),
            onPressed: _loadHeroImages,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Hero Images / New Arrivals',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Manage up to 3 hero images for web homepage and mobile new arrivals slider',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Theme.of(context).colorScheme.outline,
                        ),
                  ),
                  const SizedBox(height: 24),
                  // Hero Slots
                  ...List.generate(3, (index) {
                    final slot = _heroSlots[index];
                    return _HeroSlotCard(
                      slotNumber: index + 1,
                      newArrival: slot,
                      onEdit: () async {
                        final result = await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => AddEditNewArrivalScreen(
                              newArrival: slot,
                              displayOrder: index,
                            ),
                          ),
                        );
                        if (result == true) {
                          _loadHeroImages();
                        }
                      },
                      onDelete: () => _deleteSlot(index),
                    );
                  }),
                ],
              ),
            ),
    );
  }
}

class _HeroSlotCard extends StatelessWidget {
  final int slotNumber;
  final NewArrival? newArrival;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _HeroSlotCard({
    required this.slotNumber,
    required this.newArrival,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final hasContent = newArrival != null;

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Slot $slotNumber',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                if (hasContent)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: newArrival!.isActive
                          ? Colors.green.withOpacity(0.2)
                          : Colors.grey.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      newArrival!.isActive ? 'Active' : 'Inactive',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color:
                            newArrival!.isActive ? Colors.green : Colors.grey,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            if (hasContent) ...[
              // Image Preview
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.network(
                  newArrival!.imageUrl,
                  height: 150,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    height: 150,
                    color: Colors.grey[300],
                    child: const Center(
                      child: Icon(LucideIcons.imageOff, size: 48),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              // Details
              if (newArrival!.title != null) ...[
                Text(
                  'Title:',
                  style: TextStyle(
                    fontSize: 12,
                    color: Theme.of(context).colorScheme.outline,
                  ),
                ),
                Text(
                  newArrival!.title!,
                  style: const TextStyle(fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 8),
              ],
              if (newArrival!.description != null) ...[
                Text(
                  'Description:',
                  style: TextStyle(
                    fontSize: 12,
                    color: Theme.of(context).colorScheme.outline,
                  ),
                ),
                Text(newArrival!.description!),
                const SizedBox(height: 8),
              ],
              if (newArrival!.linkUrl != null) ...[
                Text(
                  'Link:',
                  style: TextStyle(
                    fontSize: 12,
                    color: Theme.of(context).colorScheme.outline,
                  ),
                ),
                Text(
                  newArrival!.linkUrl!,
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
                const SizedBox(height: 12),
              ],
              // Actions
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: onEdit,
                      icon: const Icon(LucideIcons.edit, size: 16),
                      label: const Text('Edit'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: onDelete,
                      icon: const Icon(LucideIcons.trash, size: 16),
                      label: const Text('Delete'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        side: const BorderSide(color: Colors.red),
                      ),
                    ),
                  ),
                ],
              ),
            ] else ...[
              // Empty Slot
              Container(
                height: 150,
                decoration: BoxDecoration(
                  color: Theme.of(context)
                      .colorScheme
                      .surfaceContainerHighest
                      .withOpacity(0.3),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color:
                        Theme.of(context).colorScheme.outline.withOpacity(0.3),
                    style: BorderStyle.solid,
                    width: 2,
                  ),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        LucideIcons.imagePlus,
                        size: 48,
                        color: Theme.of(context).colorScheme.outline,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Empty Slot',
                        style: TextStyle(
                          color: Theme.of(context).colorScheme.outline,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: onEdit,
                  icon: const Icon(LucideIcons.plus, size: 16),
                  label: const Text('Add Hero Image'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    foregroundColor: Theme.of(context).colorScheme.onPrimary,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
