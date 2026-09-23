import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  static final _storage = FlutterSecureStorage();
  static final Map<String, String?> _serviceTokens = {};

  static Future<String?> retrieveToken(String service) async {
    String? token = await _storage.read(key: service);
    _serviceTokens[service] = token;
    return token;
  }

  // Clears a token for a given service from secure storage
  static Future<void> clearToken(String service) async {
    await _storage.delete(key: service);
    _serviceTokens.remove(service);
  }

  // Returns the in-memory token for a service if available
  static String? getToken(String service) {
    return _serviceTokens[service];
  }

  // Stores a token for a given service in secure storage
  static Future<void> storeToken(String service, String token) async {
    await _storage.write(key: service, value: token);
    _serviceTokens[service] = token;
    print('Token stored for $service: $token');
  }
}
