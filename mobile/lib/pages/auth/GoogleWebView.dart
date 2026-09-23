import 'dart:async';

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../logic/AuthLogic.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class GoogleWebView extends StatefulWidget {
  final String serviceName;

  const GoogleWebView({super.key, required this.serviceName});

  @override
  State<GoogleWebView> createState() => _GoogleWebViewState();
}

class _GoogleWebViewState extends State<GoogleWebView> {
  late final WebViewController controller;
  var loadingPercentage = 0;
  var currentUrl = dotenv.env['IP_HOSTER'];
  bool showSuccessMessage = false;
  final authToken = AuthLogic.authToken;

  @override
  void initState() {
    debugPrint(authToken);

    String userag = '';
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(Uri.parse('${currentUrl}/googleauth/auth?token=$authToken'))
      // ..getUserAgent();
      ..setUserAgent('random')
      ..setNavigationDelegate(NavigationDelegate(
        onPageStarted: (url) {
          setState(() {
            loadingPercentage = 0;
            currentUrl = url;
          });
          debugPrint('url: $url');
        },
        onProgress: (url) {
          setState(() {
            debugPrint('url: $url');
          });
        },
        onPageFinished: (url) {
          setState(() {
            debugPrint('url: $url');
            loadingPercentage = 100;

            // Check if the login was successful
            if (isLoginSuccessful(url)) {
              showSuccessMessage = true;
            }
          });
        },
      ));
  }

  bool isLoginSuccessful(String url) {
    return url.contains('code=');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Log into your account"),
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: controller),
          if (showSuccessMessage)
            const Center(
              child: Text(
                "Account successfully logged in",
                style: TextStyle(fontSize: 20, color: Colors.green),
              ),
            ),
        ],
      ),
    );
  }
}
