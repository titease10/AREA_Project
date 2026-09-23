import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../logic/AuthLogic.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';


class DiscordWebView extends StatefulWidget {
  final String serviceName;

  const DiscordWebView({super.key, required this.serviceName});

  @override
  State<DiscordWebView> createState() => _DiscordWebViewState();
}

class _DiscordWebViewState extends State<DiscordWebView> {
  late final WebViewController controller;
  var loadingPercentage = 0;
  final authToken = AuthLogic.authToken;
  var currentUrl = dotenv.env['IP_HOSTER'];
  bool showSuccessMessage = false;

  @override
  void initState() {
    debugPrint(authToken);
    String userag = '';
    super.initState();
    print('${currentUrl}/discord/auth?token=$authToken');
    controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(Uri.parse('${currentUrl}/discord/auth?token=$authToken'))
      // ..getUserAgent();
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

            if (isLoginSuccessful(url)) {
              showSuccessMessage = true;
            }
          });
        },
      ));
    // ..setUserAgent('random');
  }

  bool isLoginSuccessful(String url) {
    return url.contains('permissions=0');
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
