import 'package:flutter/material.dart';
import 'dart:ui';

class FrostedGlassBox extends StatelessWidget {
  const FrostedGlassBox({
    Key? key,
    required this.theWidth,
    required this.theHeight,
    required this.theChildren,
  }) : super(key: key);

  final double theWidth;
  final double theHeight;
  final List<Widget> theChildren;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ClipRRect(
        borderRadius: BorderRadius.circular(15),
        child: Container(
          width: theWidth,
          height: theHeight,
          color: const Color.fromARGB(0, 0, 0, 0),
          child: Stack(
            children: [
              BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 5.0, sigmaY: 5.0),
                child: Container(),
              ),
              Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Colors.white.withOpacity(0.75),
                      const Color.fromARGB(255, 207, 157, 157)
                          .withOpacity(0.35),
                    ],
                  ),
                ),
              ),
              Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: theChildren,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class TransformingFrostedGlassBox extends StatefulWidget {
  final String title;

  const TransformingFrostedGlassBox({Key? key, required this.title})
      : super(key: key);

  @override
  _TransformingFrostedGlassBoxState createState() =>
      _TransformingFrostedGlassBoxState();
}

class _TransformingFrostedGlassBoxState
    extends State<TransformingFrostedGlassBox> {
  bool isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => setState(() {
        isExpanded = !isExpanded;
      }),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 500),
        width: isExpanded ? 300.0 : 200.0,
        height: isExpanded ? 400.0 : 100.0,
        child: FrostedGlassBox(
          theWidth: isExpanded ? 300.0 : 200.0,
          theHeight: isExpanded ? 400.0 : 100.0,
          theChildren: isExpanded
              ? [
                  const Text('Sign Up Form',
                      style: TextStyle(color: Colors.white)),
                ]
              : [
                  Text(
                    widget.title,
                    style: const TextStyle(color: Colors.white, fontSize: 30.0),
                  ),
                ],
        ),
      ),
    );
  }
}
