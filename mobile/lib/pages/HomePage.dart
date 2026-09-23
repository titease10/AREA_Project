import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:flutter/material.dart';
import 'dart:ui';
import 'AreasPage.dart';
import 'ManagePage.dart';
import 'LinkAccPage.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class HomePage extends StatefulWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  _HomePageState createState() => _HomePageState();
}

class ServiceManager {
  Future<List<String>> listServices() async {
    var currentUrl = dotenv.env['IP_HOSTER'];
    final url = Uri.parse('${currentUrl}/serviceManager/listServices');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      print(List<String>.from(jsonDecode(response.body)));
      return List<String>.from(json.decode(response.body));
    } else {
      throw Exception('Failed to load services');
    }
  }
}

class _HomePageState extends State<HomePage> {
  int _selectedIndex = 0;

  final List<Widget> _widgetOptions = <Widget>[
    const Text('Home Page',
        style: TextStyle(fontSize: 35, fontWeight: FontWeight.bold)),
    LinkServicesPage(),
    AreasPage(),
    ManagePage(),
  ];
  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final selectedWidget = _selectedIndex < _widgetOptions.length
        ? _widgetOptions.elementAt(_selectedIndex)
        : _widgetOptions.first;

    return Scaffold(
      body: Stack(
        children: [
          _buildBackground(),
          Center(child: selectedWidget),
        ],
      ),
      bottomNavigationBar: Theme(
        data: Theme.of(context).copyWith(
          canvasColor: Color(0xfbb1A1A1A),
        ),
        child: BottomNavigationBar(
          items: const <BottomNavigationBarItem>[
            BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
            BottomNavigationBarItem(icon: Icon(Icons.link), label: 'Services'),
            BottomNavigationBarItem(
                icon: Icon(Icons.plus_one_rounded), label: 'Create'),
            BottomNavigationBarItem(
                icon: Icon(Icons.pending_sharp), label: 'Manage'),

          ],
          currentIndex: _selectedIndex,
          selectedItemColor: Color(0xfbbF66471),
          unselectedItemColor: Color.fromARGB(
              255, 255, 255, 255), // Unselected item color remains white
          showUnselectedLabels: true, // Ensure this is true
          onTap: _onItemTapped,
        ),
      ),
    );
  }

  Widget _buildBackground() {
    return Stack(
      children: [
        Container(
          decoration: const BoxDecoration(
            image: DecorationImage(
              image: AssetImage('assets/images/bg.jpg'),
              fit: BoxFit.cover,
            ),
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
      ],
    );
  }
}
