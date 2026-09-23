import 'dart:convert';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../logic/AuthLogic.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AreasPage extends StatefulWidget {
  @override
  _AreasPageState createState() => _AreasPageState();
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
  String provider;
  List<Action> actions;
  List<Reaction> reactions;
  List<Query> queries;

  ActionReaction(
      {required this.provider,
      required this.actions,
      required this.reactions,
      required this.queries});

  factory ActionReaction.fromJson(Map<String, dynamic> json) {
    return ActionReaction(
      provider: json['provider'],
      actions:
          List<Action>.from(json["actions"].map((x) => Action.fromJson(x))),
      reactions: List<Reaction>.from(
          json["reactions"].map((x) => Reaction.fromJson(x))),
      queries: List<Query>.from(json["queries"].map((x) => Query.fromJson(x))),
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

class _AreasPageState extends State<AreasPage> {
  late Future<List<ActionReaction>> futureActionReactions;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  String? selectedProvider;
  Action? selectedAction;
  String? secondProvider;
  Reaction? selectedReaction;
  String? selectedId;
  bool isProviderSelected = false;
  bool isActionSelected = false;
  bool isSecondProviderSelected = false;
  String? selectedQueryProvider;
  Query? selectedQuery;
  Map<String, String> selectedQueryParams = {};
  int?
      _openPanelIndex; // -1: none, 0: provider, 1: action, 2: second provider, 3: reaction
  Map<String, TextEditingController> inputControllers = {};
  Map<String, List<Map<String, dynamic>>> fetchedSelectOptions = {};

  @override
  void initState() {
    super.initState();
    futureActionReactions = fetchActionReactions();
  }

  void dispose() {
    // Dispose of the controllers when the state is disposed
    inputControllers.forEach((key, controller) {
      controller.dispose();
    });
    super.dispose();
  }

  Future<void> fetchAndSetSelectOptions(ExtraParam param) async {
    if (param.type == 'select' ||
        (param.type == 'query' && param.url.isNotEmpty)) {
      String? token = AuthLogic.authToken;
      var response = await http.get(
        Uri.parse(param.url),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        var data = json.decode(response.body);
        debugPrint('Fetched options for ${param.name}');
        if (data is Map<String, dynamic> &&
            data.containsKey('items') &&
            data['items'] is List) {
          List<dynamic> items = data['items'];
          List<Map<String, dynamic>> options = items.map((item) {
            return {'id': item['id'].toString(), 'name': item['name']};
          }).toList();
          setState(() {
            fetchedSelectOptions[param.name] = options;
          });
        }
      } else {
        // Error handling
        debugPrint(
            'Error fetching options for ${param.name}: ${response.statusCode}');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    debugPrint(
        'Building with selectedQueryProvider: $selectedQueryProvider, selectedQuery: ${selectedQuery?.name}');
    // print('Building with _openPanelIndex: $_openPanelIndex');
    return Scaffold(
      key: _scaffoldKey,
      body: Stack(
        children: [
          _buildBackground(),
          FutureBuilder<List<ActionReaction>>(
            future: futureActionReactions,
            builder: (context, snapshot) {
              if (snapshot.hasData) {
                var actionReactions = snapshot.data!;
                List<Query> queries = [];
                if (selectedQueryProvider != null) {
                  queries = actionReactions
                      .firstWhere(
                        (ar) => ar.provider == selectedQueryProvider,
                        orElse: () => ActionReaction(
                            provider: "",
                            actions: [],
                            reactions: [],
                            queries: []),
                      )
                      .queries;
                }
                ;
                return ListView(
                  children: <Widget>[
                    _buildProviderSelection(snapshot.data!),
                    if (isProviderSelected)
                      _buildActionSelection(snapshot.data!),
                    if (isActionSelected)
                      _buildSecondProviderSelection(snapshot.data!),
                    if (isSecondProviderSelected)
                      _buildReactionSelection(snapshot.data!),
                    if (requiresQuerySelection()) // Call the method here
                      _buildQueryProviderSelection(snapshot.data!),
                    if (selectedQueryProvider != null)
                      _buildQuerySelection(queries),
                    if (selectedQuery != null)
                      ..._buildQueryExtraParamsUI(selectedQuery!.extraParams),
                    ElevatedButton(
                      onPressed: _saveConfiguration,
                      child: Text('Save Configuration'),
                    ),
                  ],
                );
              } else if (snapshot.hasError) {
                return Center(child: Text("Error: ${snapshot.error}"));
              } else {
                // Handle the case where data is still loading
                return Center(child: CircularProgressIndicator());
              }
            },
          )
        ],
      ),
    );
  }

  Widget _buildActionSelection(List<ActionReaction> data) {
    var actions = data
        .firstWhere((element) => element.provider == selectedProvider)
        .actions;

    actions.forEach((action) {
      action.extraParams.forEach((param) {
        if (param.type == 'select' &&
            fetchedSelectOptions[param.name] == null) {
          fetchAndSetSelectOptions(param);
        }
      });
    });

    return ExpansionPanelList.radio(
      initialOpenPanelValue: _openPanelIndex,
      children: [
        ExpansionPanelRadio(
          value: 1, // value for actions
          headerBuilder: (BuildContext context, bool isExpanded) {
            return ListTile(
              title: Text(selectedAction?.name ?? 'Select an action'),
            );
          },
          body: Column(
            children: [
              ...actions
                  .map((action) => ListTile(
                        title: Text(action.name),
                        onTap: () {
                          setState(() {
                            selectedAction = action;
                            isActionSelected = true;
                            _openPanelIndex = null;
                          });
                        },
                      ))
                  .toList(),
              if (selectedAction != null)
                ..._buildExtraParamsUI(selectedAction!.extraParams),
            ],
          ),
        )
      ],
    );
  }

  List<Widget> _buildExtraParamsUI(List<ExtraParam> extraParams) {
    // Filter out the 'query' type parameters from the UI generation
    var filteredParams =
        extraParams.where((param) => param.type != 'query').toList();

    return filteredParams.map((param) => _buildExtraParamField(param)).toList();
  }

  Widget _buildSecondProviderSelection(List<ActionReaction> data) {
    var providersWithReactions =
        data.where((element) => element.reactions.isNotEmpty).toList();
    return ExpansionPanelList.radio(
      initialOpenPanelValue: _openPanelIndex,
      children: [
        ExpansionPanelRadio(
          value: 2,
          headerBuilder: (BuildContext context, bool isExpanded) {
            return ListTile(
              title: Text(secondProvider ?? 'Select a second service'),
            );
          },
          body: Column(
            children: providersWithReactions
                .map((item) => ListTile(
                      title: Text(item.provider),
                      onTap: () {
                        setState(() {
                          secondProvider = item.provider;
                          isSecondProviderSelected = true;
                          _openPanelIndex = null;
                        });
                      },
                    ))
                .toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildReactionSelection(List<ActionReaction> data) {
    var reactions = data
        .firstWhere((element) => element.provider == secondProvider)
        .reactions;
    // print('Reactions is : $data');

    reactions.forEach((reaction) {
      reaction.extraParams.forEach((param) {
        if (param.type == 'select' &&
            fetchedSelectOptions[param.name] == null) {
          fetchAndSetSelectOptions(param);
        }
      });
    });

    return ExpansionPanelList.radio(
      initialOpenPanelValue: _openPanelIndex,
      children: [
        ExpansionPanelRadio(
          value: 3, // value for reactions
          headerBuilder: (BuildContext context, bool isExpanded) {
            return ListTile(
              title: Text(selectedReaction?.name ?? 'Select a reaction'),
            );
          },
          body: Column(
            children: [
              ...reactions
                  .map((reaction) => ListTile(
                        title: Text(reaction.name),
                        onTap: () {
                          setState(() {
                            selectedReaction = reaction;
                            _openPanelIndex = null;
                          });
                        },
                      ))
                  .toList(),
              if (selectedReaction != null)
                ..._buildExtraParamsUI(selectedReaction!.extraParams),
            ],
          ),
        )
      ],
    );
  }

  Widget _buildExtraParamField(ExtraParam param) {
    switch (param.type) {
      case 'select':
        return _buildSelectField(param);
      case 'input':
        return _buildInputField(param);
      default:
        return Container();
    }
  }

  Widget _buildProviderSelection(List<ActionReaction> data) {
    return ExpansionPanelList.radio(
      initialOpenPanelValue: _openPanelIndex,
      children: [
        ExpansionPanelRadio(
          value: 0, // Identifier for the provider panel
          headerBuilder: (BuildContext context, bool isExpanded) {
            return ListTile(
              title: Text(selectedProvider ?? 'Select a first service'),
            );
          },
          body: Column(
            children: data
                .map((item) => ListTile(
                      title: Text(item.provider),
                      onTap: () {
                        setState(() {
                          selectedProvider = item.provider;
                          isProviderSelected = true;
                          _openPanelIndex = null;
                          // print('Panel index set to null');
                        });
                      },
                    ))
                .toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildInputField(ExtraParam param) {
    // print('Creating input field for: ${param.name}');

    // Create a TextEditingController for each input field if not already created
    inputControllers.putIfAbsent(param.name, () => TextEditingController());

    return TextFormField(
      controller: inputControllers[param.name],
      decoration: InputDecoration(
        labelText: param.name,
        border: OutlineInputBorder(),
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Please enter ${param.name}';
        }
        return null;
      },
    );
  }

  Widget _buildSelectField(ExtraParam param) {
    List<Map<String, dynamic>> options = fetchedSelectOptions[param.name] ?? [];
    // print("options are $options");
    return DropdownButtonFormField<String>(
      decoration: InputDecoration(
        labelText: param.name,
        border: OutlineInputBorder(),
      ),
      items: options.map((option) {
        return DropdownMenuItem<String>(
          value: option['id']
              .toString(), // Assuming 'id' is the value you want to select
          child: Text(option['name']), // Displaying the 'name' in the dropdown
        );
      }).toList(),
      onChanged: (String? newValue) {
        // Update the selected option's ID
        setState(() {
          param.selectedId = newValue;
        });
      },
    );
  }

  bool requiresQuerySelection() {
    if (selectedAction != null) {
      for (var param in selectedAction!.extraParams) {
        if (param.type == 'query') {
          return true;
        }
      }
    }
    if (selectedReaction != null) {
      for (var param in selectedReaction!.extraParams) {
        if (param.type == 'query') {
          return true;
        }
      }
    }

    return false;
  }

  Widget _buildQueryProviderSelection(List<ActionReaction> data) {
    var providersWithQueries =
        data.where((element) => element.queries.isNotEmpty).toList();

    return ExpansionPanelList.radio(
      initialOpenPanelValue: _openPanelIndex, // Update this as needed
      children: [
        ExpansionPanelRadio(
          value: 4, // A new value for query providers
          headerBuilder: (BuildContext context, bool isExpanded) {
            return ListTile(
              title: Text(selectedQueryProvider ?? 'Select a query provider'),
            );
          },
          body: Column(
            children: providersWithQueries
                .map((item) => ListTile(
                      title: Text(item.provider),
                      onTap: () {
                        debugPrint('Query Provider selected: ${item.provider}');
                        setState(() {
                          selectedQueryProvider = item.provider;
                        });
                      },
                    ))
                .toList(),
          ),
        ),
      ],
    );
  }

  List<Widget> _buildQueryExtraParamsUI(List<ExtraParam> extraParams) {
    print("Building UI of extra param");
    return extraParams.map((param) => _buildExtraParamField(param)).toList();
  }

  Widget _buildQuerySelection(List<Query> queries) {
    return ExpansionPanelList.radio(
      children: [
        ExpansionPanelRadio(
          value: 'QueriesPanel', // A unique identifier for this panel
          headerBuilder: (BuildContext context, bool isExpanded) {
            return const ListTile(
              title: Text("Queries"),
            );
          },
          body: Column(
            children: queries.map((query) {
              return ListTile(
                title: Text(query.name),
                onTap: () {
                  setState(() {
                    selectedQuery = query;
                    // Fetch options for select type extra params
                    query.extraParams.forEach((param) {
                      if (param.type == 'select') {
                        fetchAndSetSelectOptions(param);
                      }
                    });
                  });
                },
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  Future<List<String>> _fetchSelectOptions(String url) async {
    String? token = AuthLogic.authToken;

    var response = await http.get(
      Uri.parse(url),
      headers: {
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      var data = json.decode(response.body);

      if (data is Map<String, dynamic> &&
          data.containsKey('items') &&
          data['items'] is List) {
        List<dynamic> items = data['items'];
        // print(items);
        return items.map((item) {
          if (item is Map<String, dynamic> && item.containsKey('name')) {
            return item['name'].toString();
          }
          return 'Unknown'; // Fallback for items without a 'name'
        }).toList();
      } else {
        throw Exception('Unexpected data format');
      }
    } else {
      throw Exception('Failed to fetch select options');
    }
  }

  void _showSnackBar(String message) {
    final snackBar = SnackBar(content: Text(message));
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }

  Future<void> _saveConfiguration() async {

    Map<String, dynamic> actionParams = {};
    Map<String, dynamic> reactionParams = {};
    Map<String, dynamic> queryDetails = {};

    if (selectedAction != null) {
      for (var param in selectedAction!.extraParams) {
        if (param.type == 'select') {
          actionParams[param.name] = param.selectedId;
        } else {
          actionParams[param.name] = inputControllers[param.name]?.text;
        }
      }
    }

    if (selectedReaction != null) {
      for (var param in selectedReaction!.extraParams) {
        if (param.type == 'select') {
          reactionParams[param.name] =
              param.selectedId ?? 'default_value'; // Provide a default value
        } else {
          reactionParams[param.name] = inputControllers[param.name]?.text ??
              'default_value'; // Provide a default value
        }
      }
    }

    if (selectedQuery != null) {
      int index = 0;
      for (var param in selectedQuery!.extraParams) {
        var key = (selectedQuery!.extraParams.length > 1)
            ? index.toString()
            : param.name;
        var paramDetails = {
          'name': param.name,
          'type': param.type,
          'url': param.url
        };
        print('Param details: $paramDetails');
        reactionParams["0"] = paramDetails;
        reactionParams["queryName"] = selectedQuery!.name;
        print('selectedQueryParams: $selectedQueryParams');

        if (param.type == 'select') {
          reactionParams[param.name] =
              param.selectedId ?? 'default_value'; // Provide a default value
        } else {
          reactionParams[param.name] = inputControllers[param.name]?.text ??
              'default_value'; // Provide a default value
        }
        reactionParams['queryProvider'] = selectedQueryProvider;
        print('reactionParams: $reactionParams');
        index++;
      }
    }

    var configuration = {
      'action': selectedAction?.name,
      'actionParams': actionParams,
      'actionProvider': selectedProvider,
      'reaction': selectedReaction?.name,
      'reactionParams': reactionParams,
      'reactionProvider': secondProvider,
    };

    String? token = AuthLogic.authToken;
    var currentUrl = dotenv.env['IP_HOSTER'];

    var response = await http.post(
      Uri.parse('$currentUrl/serviceManager/save-action-reaction'),
     headers: {
     'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': 'Bearer $token',
       },
       body: json.encode(configuration),
     );
    print(json.encode(configuration));

     if (response.statusCode == 201) {
       print(response.statusCode);
       var data = json.decode(response.body);
     _showSnackBar('Configuration saved successfully');
      }
     else {
       throw Exception('HTTP error! status: ${response.statusCode}');
     }
  }

  Future<List<ActionReaction>> fetchActionReactions() async {
    var baseUrl = dotenv.env['IP_HOSTER'];
    var url = Uri.parse('$baseUrl/serviceManager/listActionReactions');
    final response = await http.get(url);

    if (response.statusCode == 200) {
      List jsonResponse = json.decode(response.body);
      return jsonResponse.map((data) => ActionReaction.fromJson(data)).toList();
    } else {
      throw Exception('Failed to load action reactions');
    }
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
