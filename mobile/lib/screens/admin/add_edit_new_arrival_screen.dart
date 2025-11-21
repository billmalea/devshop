import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/models/new_arrival.dart';
import 'package:mobile/services/supabase_service.dart';

class AddEditNewArrivalScreen extends StatefulWidget {
  final NewArrival? newArrival;
  final int? displayOrder;

  const AddEditNewArrivalScreen({
    super.key,
    this.newArrival,
    this.displayOrder,
  });

  @override
  State<AddEditNewArrivalScreen> createState() =>
      _AddEditNewArrivalScreenState();
}

class _AddEditNewArrivalScreenState extends State<AddEditNewArrivalScreen> {
  final _formKey = GlobalKey<FormState>();
  final _supabaseService = SupabaseService();
  final _imagePicker = ImagePicker();

  late TextEditingController _titleController;
  late TextEditingController _descriptionController;
  late TextEditingController _linkUrlController;
  late TextEditingController _displayOrderController;

  File? _imageFile;
  String? _currentImageUrl;
  bool _isActive = true;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.newArrival?.title);
    _descriptionController =
        TextEditingController(text: widget.newArrival?.description);
    _linkUrlController =
        TextEditingController(text: widget.newArrival?.linkUrl);
    _displayOrderController = TextEditingController(
        text: (widget.displayOrder ?? widget.newArrival?.displayOrder ?? 0)
            .toString());
    _currentImageUrl = widget.newArrival?.imageUrl;
    _isActive = widget.newArrival?.isActive ?? true;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _linkUrlController.dispose();
    _displayOrderController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final pickedFile =
        await _imagePicker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _imageFile = File(pickedFile.path);
      });
    }
  }

  Future<void> _saveNewArrival() async {
    if (!_formKey.currentState!.validate()) return;

    if (_imageFile == null && _currentImageUrl == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select an image')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      String? imageUrl = _currentImageUrl;

      if (_imageFile != null) {
        imageUrl = await _supabaseService.uploadNewArrivalImage(_imageFile!);
      }

      final data = {
        'title': _titleController.text,
        'description': _descriptionController.text,
        'link_url':
            _linkUrlController.text.isEmpty ? null : _linkUrlController.text,
        'display_order': int.parse(_displayOrderController.text),
        'is_active': _isActive,
        'image_url': imageUrl,
      };

      if (widget.newArrival != null) {
        await _supabaseService.updateNewArrival(widget.newArrival!.id, data);
      } else {
        await _supabaseService.createNewArrival(data);
      }

      if (mounted) {
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving new arrival: $e')),
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
        title: Text(
            widget.newArrival != null ? 'Edit New Arrival' : 'Add New Arrival'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.save),
            onPressed: _isLoading ? null : _saveNewArrival,
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
                    Center(
                      child: GestureDetector(
                        onTap: _pickImage,
                        child: Container(
                          width: double.infinity,
                          height: 200,
                          decoration: BoxDecoration(
                            color: Colors.grey[200],
                            borderRadius: BorderRadius.circular(12),
                            image: _imageFile != null
                                ? DecorationImage(
                                    image: FileImage(_imageFile!),
                                    fit: BoxFit.cover,
                                  )
                                : _currentImageUrl != null
                                    ? DecorationImage(
                                        image: NetworkImage(_currentImageUrl!),
                                        fit: BoxFit.cover,
                                      )
                                    : null,
                          ),
                          child: _imageFile == null && _currentImageUrl == null
                              ? const Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(LucideIcons.imagePlus,
                                        size: 48, color: Colors.grey),
                                    SizedBox(height: 8),
                                    Text('Tap to add image',
                                        style: TextStyle(color: Colors.grey)),
                                  ],
                                )
                              : null,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    TextFormField(
                      controller: _titleController,
                      decoration: const InputDecoration(
                        labelText: 'Title',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _descriptionController,
                      decoration: const InputDecoration(
                        labelText: 'Description',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _linkUrlController,
                      decoration: const InputDecoration(
                        labelText: 'Link URL (Optional)',
                        border: OutlineInputBorder(),
                        hintText: '/products or /categories/electronics',
                      ),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _displayOrderController,
                      decoration: const InputDecoration(
                        labelText: 'Display Order',
                        border: OutlineInputBorder(),
                        helperText: 'Lower numbers appear first',
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value?.isEmpty ?? true) {
                          return 'Required';
                        }
                        if (int.tryParse(value!) == null) {
                          return 'Invalid number';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    SwitchListTile(
                      title: const Text('Active Status'),
                      value: _isActive,
                      onChanged: (value) => setState(() => _isActive = value),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
