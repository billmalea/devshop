import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/models/category.dart';
import 'package:mobile/services/supabase_service.dart';

class AddEditCategoryScreen extends StatefulWidget {
  final Category? category;

  const AddEditCategoryScreen({super.key, this.category});

  @override
  State<AddEditCategoryScreen> createState() => _AddEditCategoryScreenState();
}

class _AddEditCategoryScreenState extends State<AddEditCategoryScreen> {
  final _formKey = GlobalKey<FormState>();
  final _supabaseService = SupabaseService();

  late TextEditingController _nameController;
  late TextEditingController _descriptionController;

  String? _selectedParentId;
  bool _isLoading = false;
  List<Category> _parentCategories = [];

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.category?.name);
    _descriptionController =
        TextEditingController(text: widget.category?.description);
    _selectedParentId = widget.category?.parentId;
    _loadParentCategories();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _loadParentCategories() async {
    try {
      final categories = await _supabaseService.getCategories();
      if (mounted) {
        setState(() {
          _parentCategories = categories;
        });
      }
    } catch (e) {
      debugPrint('Error loading parent categories: $e');
    }
  }

  String _generateSlug(String name) {
    return name
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9]+'), '-')
        .replaceAll(RegExp(r'^-|-$'), '');
  }

  Future<void> _saveCategory() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final slug = _generateSlug(_nameController.text);

      final data = {
        'name': _nameController.text,
        'slug': slug,
        'description': _descriptionController.text.isEmpty
            ? null
            : _descriptionController.text,
        'parent_id': _selectedParentId,
      };

      if (widget.category != null) {
        await _supabaseService.updateCategory(widget.category!.id, data);
      } else {
        await _supabaseService.createCategory(data);
      }

      if (mounted) {
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving category: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.category != null ? 'Edit Category' : 'Add Category'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.save),
            onPressed: _isLoading ? null : _saveCategory,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Category Name',
                        border: OutlineInputBorder(),
                        hintText: 'e.g., T-Shirts, Hoodies',
                      ),
                      validator: (value) {
                        if (value?.isEmpty ?? true) {
                          return 'Required';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _descriptionController,
                      decoration: const InputDecoration(
                        labelText: 'Description (Optional)',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: _selectedParentId,
                      decoration: const InputDecoration(
                        labelText: 'Parent Category (Optional)',
                        border: OutlineInputBorder(),
                        helperText: 'Leave empty for main category',
                      ),
                      items: [
                        const DropdownMenuItem<String>(
                          value: null,
                          child: Text('None (Main Category)'),
                        ),
                        ..._parentCategories.map((cat) {
                          return DropdownMenuItem<String>(
                            value: cat.id,
                            child: Text(cat.name),
                          );
                        }),
                      ],
                      onChanged: (value) {
                        setState(() {
                          _selectedParentId = value;
                        });
                      },
                    ),
                    const SizedBox(height: 24),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Theme.of(context)
                            .colorScheme
                            .surfaceContainerHighest
                            .withOpacity(0.3),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            LucideIcons.info,
                            size: 16,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Slug will be auto-generated: ${_nameController.text.isEmpty ? '...' : _generateSlug(_nameController.text)}',
                              style: TextStyle(
                                fontSize: 12,
                                color: Theme.of(context).colorScheme.outline,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
