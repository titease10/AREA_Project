import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:mobile/logic/AuthServices.dart';
import 'HomePage.dart';

class LinkServicesPage extends StatefulWidget {
  @override
  _LinkServicesPageState createState() => _LinkServicesPageState();
}

class _LinkServicesPageState extends State<LinkServicesPage> {
  late Future<List<String>> services;

  @override
  void initState() {
    super.initState();
    services = ServiceManager().listServices().then((list) => list
        .where((service) =>
            service != 'mailgun' &&
            service != 'timeio' &&
            service != 'airQuality' &&
            service != 'leagueoflegends' &&
            service != 'openweathermap')
        .toList());
  }

  void _handleServiceAction(BuildContext context, String serviceName) {
    switch (serviceName.toLowerCase()) {
      case 'spotify':
        Navigator.of(context).pushNamed(
          '/SpotifyAuth',
          arguments: serviceName,
        );
        break;
      case 'google':
        Navigator.of(context).pushNamed(
          '/GoogleAuth',
          arguments: serviceName,
        );
        break;
      case 'discord':
        Navigator.of(context).pushNamed(
          '/DiscordAuth',
          arguments: serviceName,
        );
      case 'github':
        Navigator.of(context).pushNamed(
          '/GithubAuth',
          arguments: serviceName,
        );
      case 'facebook':
        Navigator.of(context).pushNamed(
          '/FacebookAuth',
          arguments: serviceName,
        );
      case 'twitter':
        Navigator.of(context).pushNamed(
          '/TwitterAuth',
          arguments: serviceName,
        );
      case 'microsoft':
        Navigator.of(context).pushNamed(
          '/MicrosoftAuth',
          arguments: serviceName,
        );
        break;
      default:
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<String>>(
      future: services,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        }

        return ListView.builder(
          itemCount: snapshot.data!.length + 1,
          itemBuilder: (context, index) {
            if (index == 0) {
              return Padding(
                padding: const EdgeInsets.only(top: 16.0),
                child: GlowingOverscrollIndicator(
                  axisDirection: AxisDirection.down,
                  color: Colors.blue, // Glow color
                  child: Text(
                    "Link your Services",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24.0,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                      shadows: [
                        Shadow(
                          color: Colors.black.withOpacity(0.5),
                          blurRadius: 2,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }

            int serviceIndex = index - 1;
            String serviceName = snapshot.data![serviceIndex];
            IconData icon = ServiceIconMapping.getIcon(serviceName);
            Color color = ServiceIconMapping.getColor(serviceName);

            return Container(
              margin: const EdgeInsets.symmetric(vertical: 8),
              decoration: BoxDecoration(
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.5),
                    spreadRadius: 2,
                    blurRadius: 5,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Card(
                elevation: 0,
                color: Colors.transparent,
                child: ListTile(
                  title: Text(
                    serviceName.capitalize(),
                    style: const TextStyle(
                      color: Colors.white,
                    ),
                  ),
                  leading: Icon(icon, color: color),
                  onTap: () => _handleServiceAction(context, serviceName),
                ),
              ),
            );
          },
        );
      },
    );
  }
}

extension StringExtension on String {
  String capitalize() {
    return "${this[0].toUpperCase()}${this.substring(1)}";
  }
}

class ServiceIconMapping {
  static final Map<String, IconData> _iconMap = {
    'spotify': FontAwesomeIcons.spotify,
    'google': FontAwesomeIcons.google,
    'discord': FontAwesomeIcons.discord,
    'github': FontAwesomeIcons.github,
    'facebook': FontAwesomeIcons.facebook,
    'microsoft': FontAwesomeIcons.microsoft,
    'leagueoflegends': FontAwesomeIcons.l,
    'twitter': FontAwesomeIcons.squareXTwitter
  };

  static final Map<String, Color> _colorMap = {
    'spotify': Color(0xffb0FBE11),
    'google': Color(0xffbDB4537),
    'discord': Color(0xffb7389DA),
    'github': Color(0xffbE6EDF3),
    'facebook': Color(0xffb0766FF),
    // 'twitter': Color()
    'leagueoflegends': Color(0xffbCEAB5B)
  };

  static IconData getIcon(String serviceName) {
    return _iconMap[serviceName] ??
        FontAwesomeIcons.questionCircle; // Default icon
  }

  static Color getColor(String serviceName) {
    return _colorMap[serviceName] ?? Colors.grey; // Default color
  }
}
