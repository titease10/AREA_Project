import 'package:flutter/material.dart';
import 'dart:ui'; // Import this for the BackdropFilter

class Box extends StatelessWidget {
  final List<Widget> children;
  final AlignmentGeometry position;
  final Color backgroundColor;
  final double opacity;

  const Box({
    super.key,
    required this.children,
    required this.position,
    required this.backgroundColor,
    required this.opacity,
  });

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: position,
      child: Opacity(
        opacity: opacity,
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            padding: EdgeInsets.all(20), // Add padding here
            decoration: BoxDecoration(
              color: backgroundColor,
              borderRadius: BorderRadius.circular(10), // Add this line
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min, // Make the column wrap its content
              children: children,
            ),
          ),
        ),
      ),
    );
  }
}