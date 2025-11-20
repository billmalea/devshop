class Product {
  final String id;
  final String name;
  final String? description;
  final double price;
  final String category;
  final String brand;
  final String? imageUrl;
  final int stock;
  final bool isActive;
  final DateTime? createdAt;

  Product({
    required this.id,
    required this.name,
    this.description,
    required this.price,
    required this.category,
    required this.brand,
    this.imageUrl,
    required this.stock,
    this.isActive = true,
    this.createdAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      price: (json['price'] as num).toDouble(),
      category: json['category'] as String,
      brand: json['brand'] as String,
      imageUrl: json['image_url'] as String?,
      stock: json['stock'] as int? ?? 0,
      isActive: json['is_active'] as bool? ?? true,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'category': category,
      'brand': brand,
      'image_url': imageUrl,
      'stock': stock,
      'is_active': isActive,
      'created_at': createdAt?.toIso8601String(),
    };
  }
}
