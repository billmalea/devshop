import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static final lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: Colors.white,
    colorScheme: const ColorScheme.light(
      primary: Colors.black,
      onPrimary: Colors.white,
      secondary: Color(0xFFF4F4F5), // --secondary
      onSecondary: Color(0xFF18181B), // --secondary-foreground
      surface: Colors.white,
      onSurface: Colors.black,
      error: Color(0xFFEF4444), // --destructive
      onError: Color(0xFFFAFAFA), // --destructive-foreground
      outline: Color(0xFFE4E4E7), // --border
    ),
    cardTheme: const CardTheme(
      color: Colors.white,
      elevation: 0,
      shape: RoundedRectangleBorder(
        side: BorderSide(color: Color(0xFFE4E4E7)), // --border
        borderRadius: BorderRadius.all(Radius.circular(8)), // --radius
      ),
    ),
    textTheme: GoogleFonts.interTextTheme().copyWith(
      displayLarge: GoogleFonts.outfit(
        color: Colors.black,
        fontWeight: FontWeight.bold,
      ),
      displayMedium: GoogleFonts.outfit(
        color: Colors.black,
        fontWeight: FontWeight.bold,
      ),
      displaySmall: GoogleFonts.outfit(
        color: Colors.black,
        fontWeight: FontWeight.bold,
      ),
      headlineLarge: GoogleFonts.outfit(
        color: Colors.black,
        fontWeight: FontWeight.bold,
      ),
      headlineMedium: GoogleFonts.outfit(
        color: Colors.black,
        fontWeight: FontWeight.bold,
      ),
      headlineSmall: GoogleFonts.outfit(
        color: Colors.black,
        fontWeight: FontWeight.bold,
      ),
      titleLarge: GoogleFonts.outfit(
        color: Colors.black,
        fontWeight: FontWeight.w600,
      ),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.white,
      foregroundColor: Colors.black,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Color(0xFFE4E4E7)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Color(0xFFE4E4E7)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Colors.black),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
    ),
  );

  static final darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: Colors.black,
    colorScheme: const ColorScheme.dark(
      primary: Colors.white,
      onPrimary: Colors.black,
      secondary: Color(0xFF27272A), // --secondary
      onSecondary: Color(0xFFFAFAFA), // --secondary-foreground
      surface: Colors.black,
      onSurface: Colors.white,
      error: Color(0xFF7F1D1D), // --destructive
      onError: Color(0xFFFAFAFA), // --destructive-foreground
      outline: Color(0xFF27272A), // --border
    ),
    cardTheme: const CardTheme(
      color: Colors.black,
      elevation: 0,
      shape: RoundedRectangleBorder(
        side: BorderSide(color: Color(0xFF27272A)), // --border
        borderRadius: BorderRadius.all(Radius.circular(8)),
      ),
    ),
    textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
      displayLarge: GoogleFonts.outfit(
        color: Colors.white,
        fontWeight: FontWeight.bold,
      ),
      displayMedium: GoogleFonts.outfit(
        color: Colors.white,
        fontWeight: FontWeight.bold,
      ),
      displaySmall: GoogleFonts.outfit(
        color: Colors.white,
        fontWeight: FontWeight.bold,
      ),
      headlineLarge: GoogleFonts.outfit(
        color: Colors.white,
        fontWeight: FontWeight.bold,
      ),
      headlineMedium: GoogleFonts.outfit(
        color: Colors.white,
        fontWeight: FontWeight.bold,
      ),
      headlineSmall: GoogleFonts.outfit(
        color: Colors.white,
        fontWeight: FontWeight.bold,
      ),
      titleLarge: GoogleFonts.outfit(
        color: Colors.white,
        fontWeight: FontWeight.w600,
      ),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.black,
      foregroundColor: Colors.white,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: false,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.black,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Color(0xFF27272A)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Color(0xFF27272A)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: Colors.white),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
    ),
  );
}
