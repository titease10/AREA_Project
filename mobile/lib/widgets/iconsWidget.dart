import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class IconButtonsWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        IconButton(
          icon: const Icon(FontAwesomeIcons.apple,
              color: Colors.white), // Set color to white
          onPressed: () {
            // Add your action for the Apple icon button
          },
        ),
        const SizedBox(width: 20), // Spacing between the buttons
        IconButton(
          icon: const Icon(FontAwesomeIcons.google,
              color: Colors.white), // Set color to white
          onPressed: () {
            // Add your action for the Google icon button
          },
        ),
        IconButton(
          icon: const Icon(FontAwesomeIcons.twitter,
              color: Colors.white), // Set color to white
          onPressed: () {
            // Add your action for the Google icon button
          },
        ),
      ],
    );
  }
}
