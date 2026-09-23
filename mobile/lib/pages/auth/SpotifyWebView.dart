import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../logic/AuthLogic.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class SpotifyWebView extends StatefulWidget {
  final String serviceName;

  SpotifyWebView({super.key, required this.serviceName});

  @override
  State<SpotifyWebView> createState() => _SpotifyWebViewState();
}

class _SpotifyWebViewState extends State<SpotifyWebView> {
  late final WebViewController controller;
  var loadingPercentage = 0;
  final authToken = AuthLogic.authToken;
  var currentUrl = dotenv.env['IP_HOSTER'];
  bool showSuccessMessage = false;

  @override
  void initState() {
    debugPrint(authToken);
    super.initState();
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(Uri.parse('${currentUrl}/spotify/auth?token=$authToken'))
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
