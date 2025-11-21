class NewArrival {
  final String id;
  final String imageUrl;
  final String? title;
  final String? description;
  final String? linkUrl;
  final int displayOrder;
  final bool isActive;
  final DateTime? createdAt;

  NewArrival({
    required this.id,
    required this.imageUrl,
    this.title,
    this.description,
    this.linkUrl,
    required this.displayOrder,
    this.isActive = true,
    this.createdAt,
  });

  factory NewArrival.fromJson(Map<String, dynamic> json) {
    return NewArrival(
      id: json['id'] as String,
      imageUrl: json['image_url'] as String,
      title: json['title'] as String?,
      description: json['description'] as String?,
      linkUrl: json['link_url'] as String?,
      displayOrder: json['display_order'] as int? ?? 0,
      isActive: json['is_active'] as bool? ?? true,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'image_url': imageUrl,
      'title': title,
      'description': description,
      'link_url': linkUrl,
      'display_order': displayOrder,
      'is_active': isActive,
      'created_at': createdAt?.toIso8601String(),
    };
  }
}
