import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:mobile/screens/home_screen.dart';
import 'dart:math' as math;

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late AnimationController _rotationController;
  late Animation<double> _opacityAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    );

    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat();

    _opacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.easeIn),
      ),
    );

    _scaleAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.easeOutBack),
      ),
    );

    _controller.forward();

    Future.delayed(const Duration(seconds: 4), () {
      if (mounted) {
        Navigator.of(context).pushReplacement(
          PageRouteBuilder(
            pageBuilder: (context, animation, secondaryAnimation) =>
                const HomeScreen(),
            transitionsBuilder:
                (context, animation, secondaryAnimation, child) {
              return FadeTransition(opacity: animation, child: child);
            },
            transitionDuration: const Duration(milliseconds: 800),
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _rotationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: Stack(
        children: [
          // Background Rings
          Positioned.fill(
            child: CustomPaint(
              painter: RingsPainter(
                animation: _rotationController,
                isDark: isDark,
              ),
            ),
          ),
          // Floating Icons
          ...List.generate(6, (index) {
            final angle = (index * 60) * (math.pi / 180);
            const radius = 120.0;
            return AnimatedBuilder(
              animation: _rotationController,
              builder: (context, child) {
                final currentAngle =
                    angle + (_rotationController.value * 2 * math.pi);
                return Positioned(
                  left: MediaQuery.of(context).size.width / 2 +
                      math.cos(currentAngle) * radius -
                      12,
                  top: MediaQuery.of(context).size.height / 2 +
                      math.sin(currentAngle) * radius -
                      12,
                  child: Opacity(
                    opacity: 0.6,
                    child: Icon(
                      _getIconForIndex(index),
                      color: _getColorForIndex(index, isDark),
                      size: 24,
                    ),
                  ),
                );
              },
            );
          }),
          // Center Logo
          Center(
            child: AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                return Opacity(
                  opacity: _opacityAnimation.value,
                  child: Transform.scale(
                    scale: _scaleAnimation.value,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          'DevShop',
                          style: Theme.of(context)
                              .textTheme
                              .displayMedium
                              ?.copyWith(
                                fontWeight: FontWeight.bold,
                                letterSpacing: -1.0,
                                height: 1.0,
                              ),
                        ),
                        const SizedBox(width: 4),
                        Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          width: 10,
                          height: 10,
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.tertiary,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  IconData _getIconForIndex(int index) {
    switch (index) {
      case 0:
        return LucideIcons.code;
      case 1:
        return LucideIcons.terminal;
      case 2:
        return LucideIcons.cpu;
      case 3:
        return LucideIcons.database;
      case 4:
        return LucideIcons.globe;
      case 5:
        return LucideIcons.smartphone;
      default:
        return LucideIcons.code;
    }
  }

  Color _getColorForIndex(int index, bool isDark) {
    final lightColors = [
      Colors.blue.shade700,
      Colors.purple.shade700,
      Colors.amber.shade700,
      Colors.cyan.shade700,
      Colors.green.shade700,
      Colors.pink.shade700,
    ];
    final darkColors = [
      Colors.blue.shade300,
      Colors.purple.shade300,
      Colors.amber.shade300,
      Colors.cyan.shade300,
      Colors.green.shade300,
      Colors.pink.shade300,
    ];
    final colors = isDark ? darkColors : lightColors;
    return colors[index % colors.length];
  }
}

class RingsPainter extends CustomPainter {
  final Animation<double> animation;
  final bool isDark;

  RingsPainter({required this.animation, required this.isDark})
      : super(repaint: animation);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final colors = [
      Colors.blue.withOpacity(isDark ? 0.2 : 0.1),
      Colors.purple.withOpacity(isDark ? 0.2 : 0.1),
      Colors.amber.withOpacity(isDark ? 0.2 : 0.1),
    ];

    for (int i = 1; i <= 3; i++) {
      final radius = 100.0 * i;
      final paint = Paint()
        ..color = colors[(i - 1) % colors.length]
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5;

      // Add some rotation effect by drawing arcs instead of full circles
      final startAngle = animation.value * 2 * math.pi * (i % 2 == 0 ? 1 : -1);
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        math.pi * 1.5,
        false,
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant RingsPainter oldDelegate) => true;
}
