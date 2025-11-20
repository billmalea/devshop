import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'DevShop',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.shoppingBag),
            onPressed: () {},
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Search Bar
              TextField(
                decoration: const InputDecoration(
                  hintText: 'Search products...',
                  prefixIcon: Icon(LucideIcons.search),
                ),
              ),
              const SizedBox(height: 24),

              // Hero Section (Placeholder)
              Container(
                height: 200,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.secondary,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(LucideIcons.image, size: 48, color: Theme.of(context).colorScheme.onSecondary),
                      const SizedBox(height: 8),
                      Text(
                        'New Arrivals',
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Categories
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Categories',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  TextButton(
                    onPressed: () {},
                    child: const Text('View All'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              SizedBox(
                height: 100,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: 5,
                  separatorBuilder: (context, index) => const SizedBox(width: 16),
                  itemBuilder: (context, index) {
                    return Column(
                      children: [
                        Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.secondary,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(LucideIcons.smartphone, color: Theme.of(context).colorScheme.onSecondary),
                        ),
                        const SizedBox(height: 8),
                        const Text('Phones'),
                      ],
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),

              // Featured Products
              Text(
                'Featured Products',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 0.75,
                ),
                itemCount: 4,
                itemBuilder: (context, index) {
                  return Card(
                    clipBehavior: Clip.antiAlias,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Container(
                            color: Theme.of(context).colorScheme.secondary,
                            child: Center(
                              child: Icon(LucideIcons.package, size: 32, color: Theme.of(context).colorScheme.onSecondary),
                            ),
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Product Name',
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '\$99.99',
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: NavigationBar(
        destinations: const [
          NavigationDestination(
            icon: Icon(LucideIcons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.search),
            label: 'Search',
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.user),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
