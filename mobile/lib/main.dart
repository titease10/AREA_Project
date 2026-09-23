import 'package:flutter/material.dart';
import 'package:mobile/pages/auth/DiscordWebView.dart';
import 'package:mobile/pages/auth/FacebookWebView.dart';
import 'package:mobile/pages/auth/GoogleWebView.dart';
import 'package:mobile/pages/auth/GithubWebView.dart';
import 'package:mobile/pages/auth/MicrosoftWebView.dart';
import 'package:mobile/pages/auth/SpotifyWebview.dart';
import 'package:mobile/pages/HomePage.dart';
import 'package:mobile/pages/auth/TwitterWebView.dart';
import 'package:mobile/widgets/FrostedGlass.dart';
import 'package:mobile/logic/AuthLogic.dart';
import 'package:mobile/widgets/RegistrationPopup.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:ui';
import 'dart:convert';

void main() async {
  await dotenv.load(fileName: ".env");

  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AREA',
      home: MyHomePage(),
      routes: {'/home': (context) => const HomePage()},
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case '/SpotifyAuth':
            final serviceName = settings.arguments as String;
            return MaterialPageRoute(
              builder: (context) => SpotifyWebView(serviceName: serviceName),
            );
          case '/GoogleAuth':
            final serviceName = settings.arguments as String;
            return MaterialPageRoute(
              builder: (context) => GoogleWebView(serviceName: serviceName),
            );
          case '/DiscordAuth':
            final serviceName = settings.arguments as String;
            return MaterialPageRoute(
              builder: (context) => DiscordWebView(serviceName: serviceName),
            );
          case '/GithubAuth':
            final serviceName = settings.arguments as String;
            return MaterialPageRoute(
              builder: (context) => GithubWebView(serviceName: serviceName),
            );
          case '/FacebookAuth':
            final serviceName = settings.arguments as String;
            return MaterialPageRoute(
                builder: (context) =>
                    FacebookWebView(serviceName: serviceName));
          case '/TwitterAuth':
            final serviceName = settings.arguments as String;
            return MaterialPageRoute(
                builder: (context) => TwitterWebView(serviceName: serviceName));

          case '/MicrosoftAuth':
            final serviceName = settings.arguments as String;
            return MaterialPageRoute(
                builder: (context) =>
                    MicrosoftWebView(serviceName: serviceName));
        }
        return null;
      },
    );
  }
}

class MyHomePage extends StatelessWidget {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                  image: AssetImage('assets/images/bg.jpg'), fit: BoxFit.cover),
            ),
          ),
          BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.0),
              ),
            ),
          ),
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.center,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black12.withOpacity(0.3),
                  const Color.fromARGB(255, 17, 17, 17).withOpacity(0.8),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(top: 100),
            child: Align(
              alignment: Alignment.center,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const Text(
                    'Welcome\nto\n',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 50.0,
                      fontWeight: FontWeight.bold,
                      shadows: [
                        Shadow(
                          blurRadius: 40.0,
                          color: Color.fromARGB(255, 255, 255, 255),
                          offset: Offset(1, 0),
                        ),
                      ],
                    ),
                    textAlign: TextAlign.center,
                  ),
                  Transform.translate(
                    offset: Offset(0, -80),
                    child: Container(
                      width: 150,
                      height: 150,
                      decoration: const BoxDecoration(
                        image: DecorationImage(
                          image: AssetImage('assets/images/logo.png'),
                          fit: BoxFit.contain,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            top: 400,
            left: 0,
            right: 0,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                FrostedGlassBox(
                  theWidth: 200.0,
                  theHeight: 50.0,
                  theChildren: [
                    TextField(
                      controller: emailController,
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
                      controller: passwordController,
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
                FrostedGlassBox(
                  theWidth: 200.0,
                  theHeight: 50.0,
                  theChildren: [
                    GestureDetector(
                      onTap: () => _handleLogin(context),
                      child: const Center(
                        child: Text(
                          'Login',
                          style: TextStyle(
                              color: Color.fromARGB(255, 49, 47, 47),
                              fontSize: 30.0),
                        ),
                      ),
                    ),
                  ],
                ),
                // IconButtonsWidget(),
              ],
            ),
          ),
          Positioned(
            top: 600,
            left: 10,
            right: 10,
            child: TextButton(
              onPressed: () {
                RegistrationPopup popup = RegistrationPopup();
                popup.show(context);
              },
              child: const Text(
                'Not registered yet, create an account right here',
                style: TextStyle(
                    color: Color.fromARGB(255, 154, 216, 255), fontSize: 16),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _handleLogin(BuildContext context) {
    AuthLogic authLogic = AuthLogic();
    authLogic
        .login(emailController.text, passwordController.text)
        .then((success) {
      if (success) {
        Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (context) => const HomePage()));
      } else {
        print("Failed to login");

        // Print the response body as JSON for debugging purposes
        if (authLogic.lastResponse != null) {
          try {
            final jsonResponse = json.decode(authLogic.lastResponse!.body);
            print("Response Body (JSON): $jsonResponse");
          } catch (e) {
            print("Error decoding JSON response: $e");
          }
        } else {
          print("No response received.");
        }
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text("Login failed. Please check your credentials."),
            duration: Duration(seconds: 3),
          ),
        );
      }
    });
  }
}
