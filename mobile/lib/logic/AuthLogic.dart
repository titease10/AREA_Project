import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AuthLogic {
  SharedPreferences? _prefs;
  Timer? _logoutTimer;
  static String? authToken;
  String? userMail;
  DateTime? tokenExpiration;
  http.Response? lastResponse;

  Future<String?> geAuthToken() async {
    return authToken;
  }

  AuthLogic() {
    _initializeAuthData();
  }

  Future<String?> getUserEmail() async {
    return _prefs?.getString('userEmail');
  }

  bool hasSessionExpired() {
    return !isTokenValid();
  }

  Future<void> _initializeAuthData() async {
    _prefs = await SharedPreferences.getInstance();

    authToken = _prefs?.getString('authToken');
    final tokenExpireMillis = _prefs?.getInt('tokenExpiration');
    if (tokenExpireMillis != null) {
      tokenExpiration = DateTime.fromMillisecondsSinceEpoch(tokenExpireMillis);
    }
  }

  void setAuthToken(String token, DateTime expiration, String email) {
    authToken = token;
    tokenExpiration = expiration;
    userMail = email;

    _prefs?.setString('userEmail', email);
    _prefs?.setString('authToken', token);
    _prefs?.setInt('tokenExpiration', expiration.millisecondsSinceEpoch);
    print(authToken);
    print("Expires at $tokenExpiration");
    print(userMail);
  }

  bool isTokenValid() {
    if (authToken == null || tokenExpiration == null) {
      return false;
    }
    return DateTime.now().isBefore(tokenExpiration!);
  }

  void clearAuthToken() {
    authToken = null;
    tokenExpiration = null;
    _logoutTimer?.cancel();

    _prefs?.remove('authToken');
    _prefs?.remove('tokenExpiration');
  }

  void startLogoutTimer(BuildContext context) {
    if (_logoutTimer != null) {
      _logoutTimer!.cancel(); // Cancel any existing timer
    }

    if (tokenExpiration != null) {
      final timeToExpiry =
          tokenExpiration!.difference(DateTime.now()).inSeconds;
      _logoutTimer = Timer(Duration(seconds: timeToExpiry), () {
        clearAuthToken();

        Navigator.of(context).pushReplacementNamed('/home');

        // Show a SnackBar after navigating
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Session expired. Please log in again.'),
            duration: Duration(seconds: 3),
          ),
        );
      });
    }
  }

  Future<bool> login(String email, String password) async {
    var baseUrl = dotenv.env['IP_HOSTER'];
    var url = Uri.parse('$baseUrl/auth/signIn');
    var response = await http.post(
      url,
      headers: <String, String>{
        'Content-Type': 'application/json',
      },
      body: jsonEncode(<String, String>{
        'email': email,
        'password': password,
      }),
    );

    lastResponse = response;
    if (response.statusCode == 201) {
      final responseBody = json.decode(response.body);
      final accessToken = responseBody['access_token'];
      _processToken(accessToken);
      return true;
    } else {
      // TODO: Handle error
      return false;
    }
  }

  void _processToken(String token) {
    try {
      final jwt = JWT.decode(token);
      final email = jwt.payload['email'];
      final expMillis = jwt.payload['exp'] * 1000;
      final expiration = DateTime.fromMillisecondsSinceEpoch(expMillis);

      setAuthToken(token, expiration, email);
    } catch (e) {
      print(e);
    }
  }

  Future<bool> register(BuildContext context, String email, String firstName,
      String lastName, String password) async {
    var baseUrl = dotenv.env['IP_HOSTER'];
    var url = Uri.parse('$baseUrl/auth/signUp');
    var response = await http.post(
      url,
      headers: <String, String>{
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: {
        'email': email,
        'firstName': firstName,
        'lastName': lastName,
        'password': password,
      },
    );

    lastResponse = response; // Store the response in lastResponse

    if (response.statusCode == 201) {
      return true;
    } else {
      print("Failed to register");

      if (response.body.isNotEmpty) {
        try {
          final jsonResponse = json.decode(response.body);
          print("Response Body (JSON): $jsonResponse");

          if (jsonResponse['error'] != null) {
            // Print the error message from the JSON response
            print("Registration Error: ${jsonResponse['error']}");
          }
        } catch (e) {
          print("Error decoding JSON response: $e");
        }
      } else {
        print("No response received.");
      }

      return false;
    }
  }
}
