import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/models/category.dart';
import 'package:mobile/models/product.dart';
import 'package:mobile/services/supabase_service.dart';
import 'package:mobile/widgets/product_card.dart';

class CategoriesScreen extends StatefulWidget {
  const CategoriesScreen({super.key});

  @override
  State<CategoriesScreen> createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends State<CategoriesScreen>
    with SingleTickerProviderStateMixin {
  final SupabaseService _supabaseService = SupabaseService();
  List<Category> _allCategories = [];
  List<Category> _parentCategories = [];
  List<Product> _products = [];
  bool _isLoading = true;
  late TabController _tabController;
  int _currentTabIndex = 0;
  String? _selectedSubcategorySlug;

  @override
  void initState() {
    super.initState();
    _loadCategories();
  }

  Future<void> _loadCategories() async {
    try {
      final categories = await _supabaseService.getAllCategories();
      if (mounted && categories.isNotEmpty) {
        final parentCats = categories.where((c) => c.parentId == null).toList();
        setState(() {
          _allCategories = categories;
          _parentCategories = parentCats;
          _tabController =
              TabController(length: parentCats.length, vsync: this);
          _tabController.addListener(_onTabChanged);
        });
        await _loadProductsByCategory(parentCats[0]);
      }
    } catch (e) {
      debugPrint('Error loading categories: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _onTabChanged() {
    if (_tabController.indexIsChanging) {
      setState(() {
        _selectedSubcategorySlug = null; // Reset subcategory selection
      });
      _loadProductsByCategory(_parentCategories[_tabController.index]);
    }
  }

  List<Category> _getSubcategories(String parentId) {
    return _allCategories.where((c) => c.parentId == parentId).toList();
  }

  Future<void> _loadProductsByCategory(Category category,
      {String? subcategorySlug}) async {
    setState(() {
      _isLoading = true;
      _currentTabIndex = _parentCategories.indexOf(category);
    });

    try {
      // Use subcategory slug if provided, otherwise use parent category slug
      final slug = subcategorySlug ?? category.slug;
      final products = await _supabaseService.getProductsByCategory(slug);
      if (mounted) {
        setState(() {
          _products = products;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading products: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _onSubcategorySelected(String? subcategorySlug) {
    setState(() {
      _selectedSubcategorySlug = subcategorySlug;
    });
    _loadProductsByCategory(
      _parentCategories[_currentTabIndex],
      subcategorySlug: subcategorySlug,
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_parentCategories.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    final currentCategory = _parentCategories[_currentTabIndex];
    final subcategories = _getSubcategories(currentCategory.id);
    final hasSubcategories = subcategories.isNotEmpty;

    return SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              'Categories',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ),
          // Main Category Tabs
          Container(
            decoration: BoxDecoration(
              color: Theme.of(context).scaffoldBackgroundColor,
              border: Border(
                bottom: BorderSide(
                  color: Theme.of(context).colorScheme.outline.withOpacity(0.2),
                ),
              ),
            ),
            child: Container(
              margin: const EdgeInsets.only(bottom: 8),
              child: TabBar(
                controller: _tabController,
                isScrollable: true,
                labelColor: Theme.of(context).colorScheme.onPrimary,
                unselectedLabelColor: Theme.of(context).colorScheme.onSurface,
                indicator: BoxDecoration(
                  borderRadius: BorderRadius.circular(50),
                  color: Theme.of(context).colorScheme.tertiary,
                ),
                indicatorSize: TabBarIndicatorSize.tab,
                dividerColor: Colors.transparent,
                labelStyle: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
                unselectedLabelStyle: const TextStyle(
                  fontWeight: FontWeight.normal,
                  fontSize: 14,
                ),
                padding: const EdgeInsets.symmetric(horizontal: 8),
                labelPadding: const EdgeInsets.symmetric(horizontal: 4),
                tabAlignment: TabAlignment.start,
                tabs: _parentCategories
                    .map((category) => Tab(
                          height: 32,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(50),
                              border: Border.all(
                                color: Theme.of(context)
                                    .colorScheme
                                    .outline
                                    .withOpacity(0.2),
                              ),
                            ),
                            child: Align(
                              alignment: Alignment.center,
                              child: Text(category.name),
                            ),
                          ),
                        ))
                    .toList(),
              ),
            ),
          ),
          // Subcategory Chips (shown only if current category has subcategories)
          if (hasSubcategories)
            Container(
              height: 40,
              margin: const EdgeInsets.only(top: 8, bottom: 8),
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                children: [
                  // "All" chip
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: const Text('All'),
                      selected: _selectedSubcategorySlug == null,
                      onSelected: (selected) {
                        if (selected) _onSubcategorySelected(null);
                      },
                      selectedColor: Theme.of(context).colorScheme.tertiary,
                      labelStyle: TextStyle(
                        color: _selectedSubcategorySlug == null
                            ? Theme.of(context).colorScheme.onPrimary
                            : Theme.of(context).colorScheme.onSurface,
                        fontWeight: _selectedSubcategorySlug == null
                            ? FontWeight.bold
                            : FontWeight.normal,
                        fontSize: 12,
                      ),
                      side: BorderSide(
                        color: Theme.of(context)
                            .colorScheme
                            .outline
                            .withOpacity(0.2),
                      ),
                    ),
                  ),
                  // Subcategory chips
                  ...subcategories.map((subcat) => Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(subcat.name),
                          selected: _selectedSubcategorySlug == subcat.slug,
                          onSelected: (selected) {
                            if (selected) _onSubcategorySelected(subcat.slug);
                          },
                          selectedColor: Theme.of(context).colorScheme.tertiary,
                          labelStyle: TextStyle(
                            color: _selectedSubcategorySlug == subcat.slug
                                ? Theme.of(context).colorScheme.onPrimary
                                : Theme.of(context).colorScheme.onSurface,
                            fontWeight: _selectedSubcategorySlug == subcat.slug
                                ? FontWeight.bold
                                : FontWeight.normal,
                            fontSize: 12,
                          ),
                          side: BorderSide(
                            color: Theme.of(context)
                                .colorScheme
                                .outline
                                .withOpacity(0.2),
                          ),
                        ),
                      )),
                ],
              ),
            ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _products.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              LucideIcons.packageX,
                              size: 64,
                              color: Theme.of(context).colorScheme.outline,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No products found',
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () => _loadProductsByCategory(
                          _parentCategories[_currentTabIndex],
                          subcategorySlug: _selectedSubcategorySlug,
                        ),
                        child: GridView.builder(
                          padding: const EdgeInsets.all(16),
                          gridDelegate:
                              const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                            childAspectRatio: 0.7,
                          ),
                          itemCount: _products.length,
                          itemBuilder: (context, index) {
                            final product = _products[index];
                            return ProductCard(product: product);
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }
}
