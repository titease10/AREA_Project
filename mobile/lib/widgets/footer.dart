import 'package:flutter/material.dart';
import 'dart:ui'; // Import this for the BackdropFilter

class Footer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 50,
      child: ClipRect( // Add this
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Opacity(
            opacity: 0.1,
            child: Container(
              color: Colors.white,
              child: Center(
                child: Text(
                  'Footer',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}