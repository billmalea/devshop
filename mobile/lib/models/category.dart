class Category {
  final String id;
  final String name;
  final String slug;
  final String? parentId;

  Category({
    required this.id,
    required this.name,
    required this.slug,
    this.parentId,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      parentId: json['parent_id'] as String?,
    );
  }
}
