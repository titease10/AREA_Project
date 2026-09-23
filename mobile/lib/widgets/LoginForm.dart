import 'package:flutter/material.dart';
import 'FrostedGlass.dart'; // Ensure the path is correct
import '../logic/AuthLogic.dart'; // Ensure the path is correct

class LoginForm extends StatelessWidget {
  final AuthLogic _authLogic = AuthLogic();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        FrostedGlassBox(
          theWidth: 200.0,
          theHeight: 50.0,
          theChildren: [
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(
                hintText: 'Email',
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(horizontal: 10),
              ),
              style: const TextStyle(color: Colors.white),
            ),
          ],
        ),
        const SizedBox(height: 10),
        FrostedGlassBox(
          theWidth: 200.0,
          theHeight: 50.0,
          theChildren: [
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(
                hintText: 'Password',
                border: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(horizontal: 10),
              ),
              style: const TextStyle(color: Colors.white),
              obscureText: true,
            ),
          ],
        ),
        const SizedBox(height: 20),
        GestureDetector(
          onTap: () async {
            bool success = await _authLogic.login(
                _emailController.text, _passwordController.text);
            if (success) {
              // Handle successful login
            } else {
              // Handle login failure
            }
          },
          child: const Center(
            child: Text(
              'Login',
              style: TextStyle(color: Colors.white, fontSize: 30.0),
            ),
          ),
        ),
      ],
    );
  }
}
