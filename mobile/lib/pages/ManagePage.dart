import 'dart:convert';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../logic/AuthLogic.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../widgets/FrostedGlass.dart';

class ManagePage extends StatefulWidget {
  @override
  _ManagePageState createState() => _ManagePageState();
}

Future<List<ActionReaction>> fetchActionReactions() async {
  var baseUrl = dotenv.env['IP_HOSTER'];
  var url = Uri.parse('$baseUrl/serviceManager/getActionReactionsOfUser');
  //add the token to the header
  String? token = AuthLogic.authToken;
  final response = await http.get(
    Uri.parse(url.toString()),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer $token',
    },
  );
  print(response.body);
  if (response.statusCode == 200) {
    List jsonResponse = json.decode(response.body);
    return jsonResponse.map((data) => ActionReaction.fromJson(data)).toList();
  } else {
    throw Exception('Failed to load action reactions');
  }
}

class Reaction {
  String name;
  List<ExtraParam> extraParams;

  Reaction({required this.name, required this.extraParams});
  factory Reaction.fromJson(Map<String, dynamic> json) {
    return Reaction(
      name: json['name'],
      extraParams: List<ExtraParam>.from(
          json["extraParams"].map((x) => ExtraParam.fromJson(x))),
    );
  }
}

class ExtraParam {
  String name;
  String type;
  String url;
  String? selectedId;
  bool requiresSelect;

  ExtraParam({
    required this.name,
    required this.type,
    required this.url,
    this.selectedId,
    this.requiresSelect = false,
  });

  factory ExtraParam.fromJson(Map<String, dynamic> json) {
    return ExtraParam(
      name: json['name'],
      type: json['type'],
      url: json['url'],
    );
  }
}

class Query {
  String name;
  List<ExtraParam> extraParams;

  Query({required this.name, required this.extraParams});

  factory Query.fromJson(Map<String, dynamic> json) {
    return Query(
      name: json['name'],
      extraParams: List<ExtraParam>.from(
          json["extraParams"].map((x) => ExtraParam.fromJson(x))),
    );
  }
}

class ActionReaction {
  String id;
  String userId;
  String actionEventId;
  String reactionEventId;
  String actionProvider;
  String reactionProvider;
  String
      actionParams; // You might want to parse this into a more structured object
  String reactionParams; // Same as above
  bool active;
  String createdAt;
  String updatedAt;
  String? iQueryId; // Nullable since it can be null

  ActionReaction({
    required this.id,
    required this.userId,
    required this.actionEventId,
    required this.reactionEventId,
    required this.actionProvider,
    required this.reactionProvider,
    required this.actionParams,
    required this.reactionParams,
    required this.active,
    required this.createdAt,
    required this.updatedAt,
    this.iQueryId,
  });

  factory ActionReaction.fromJson(Map<String, dynamic> json) {
    return ActionReaction(
      id: json['id'],
      userId: json['userId'],
      actionEventId: json['actionEventId'],
      reactionEventId: json['reactionEventId'],
      actionProvider: json['actionProvider'],
      reactionProvider: json['reactionProvider'],
      actionParams: json['actionParams'],
      reactionParams: json['reactionParams'],
      active: json['active'],
      createdAt: json['createdAt'],
      updatedAt: json['updatedAt'],
      iQueryId: json['iQueryId'],
    );
  }
}

class Action {
  String name;
  List<ExtraParam> extraParams;

  Action({required this.name, required this.extraParams});

  factory Action.fromJson(Map<String, dynamic> json) {
    return Action(
      name: json['name'],
      extraParams: List<ExtraParam>.from(
          json["extraParams"].map((x) => ExtraParam.fromJson(x))),
    );
  }
}

class CustomFrostedAppBar extends StatelessWidget
    implements PreferredSizeWidget {
  final String title;
  final double height;

  const CustomFrostedAppBar({
    Key? key,
    required this.title,
    this.height = kToolbarHeight,
  }) : super(key: key);

  @override
  Size get preferredSize => Size.fromHeight(height);

  @override
  Widget build(BuildContext context) {
    return TransformingFrostedGlassBox(title: title);
  }
}

class _ManagePageState extends State<ManagePage> {
  late Future<List<ActionReaction>> futureActionReactions;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    futureActionReactions = fetchActionReactions();
  }

  @override
  void dispose() {
    // Dispose of the controllers when the state is disposed
    // ... existing dispose logic ...
    super.dispose();
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      body: Stack(
        children: [
          _buildBackground(),
          FutureBuilder<List<ActionReaction>>(
            future: futureActionReactions,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return Center(child: CircularProgressIndicator());
              } else if (snapshot.hasError) {
                return Center(child: Text('Error: ${snapshot.error}'));
              } else if (snapshot.hasData) {
                return ListView.builder(
                  itemCount: snapshot.data!.length,
                  itemBuilder: (context, index) {
                    ActionReaction actionReaction = snapshot.data![index];
                    return Card(
                      child: ListTile(
                        title: Text(
                            '${actionReaction.actionProvider} - ${actionReaction.reactionProvider}'),
                        subtitle: Text(
                            'Action: ${actionReaction.actionEventId}, Reaction: ${actionReaction.reactionEventId}'),
                      ),
                    );
                  },
                );
              } else {
                return Center(child: Text('No data available'));
              }
            },
          ),
        ],
      ),
    );
  }
}
