import 'dart:ui';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile/logic/AuthLogic.dart';

class RegistrationPopup {
  late final OverlayEntry overlayEntry;
  TextEditingController emailController = TextEditingController();
  TextEditingController firstNameController = TextEditingController();
  TextEditingController lastNameController = TextEditingController();
  TextEditingController passwordController = TextEditingController();

  RegistrationPopup() {
    overlayEntry = OverlayEntry(
      builder: (context) {
        AuthLogic authLogic = AuthLogic();

        return Positioned(
          top: MediaQuery.of(context).size.height / 4,
          left: MediaQuery.of(context).size.width / 10,
          right: MediaQuery.of(context).size.width / 10,
          child: Material(
            color: Colors.transparent,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(15),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10.0, sigmaY: 10.0),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      TextField(
                        controller: emailController,
                        decoration: const InputDecoration(labelText: "Email"),
                      ),
                      TextField(
                        controller: firstNameController,
                        decoration:
                            const InputDecoration(labelText: "First Name"),
                      ),
                      TextField(
                        controller: lastNameController,
                        decoration:
                            const InputDecoration(labelText: "Last Name"),
                      ),
                      TextField(
                        controller: passwordController,
                        decoration:
                            const InputDecoration(labelText: "Password"),
                        obscureText: true,
                      ),
                      const SizedBox(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          TextButton(
                            child: const Text("Cancel"),
                            onPressed: () => overlayEntry.remove(),
                          ),
                          TextButton(
                            child: const Text("Register"),
                            onPressed: () {
                              authLogic
                                  .register(
                                context,
                                emailController.text,
                                firstNameController.text,
                                lastNameController.text,
                                passwordController.text,
                              )
                                  .then((success) {
                                if (success) {
                                  print("Success registration");
                                  overlayEntry.remove();
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                          "Registrated successfully, Welcome to Area"),
                                      duration: Duration(seconds: 3),
                                    ),
                                  );
                                } else {
                                  print("Failed to register");
                                  if (authLogic.lastResponse != null) {
                                    try {
                                      final jsonResponse = json
                                          .decode(authLogic.lastResponse!.body);

                                      if (jsonResponse['message'] != null) {
                                        // Handle multiple error messages if present
                                        final messages =
                                            jsonResponse['message'];
                                        if (messages is List) {
                                          for (final message in messages) {
                                            ScaffoldMessenger.of(context)
                                                .showSnackBar(
                                              SnackBar(
                                                content: Text(message),
                                                duration:
                                                    const Duration(seconds: 3),
                                              ),
                                            );
                                          }
                                        } else {
                                          ScaffoldMessenger.of(context)
                                              .showSnackBar(
                                            SnackBar(
                                              content:
                                                  Text(jsonResponse['message']),
                                              duration:
                                                  const Duration(seconds: 3),
                                            ),
                                          );
                                        }
                                      } else if (jsonResponse['error'] !=
                                          null) {
                                        ScaffoldMessenger.of(context)
                                            .showSnackBar(
                                          SnackBar(
                                            content:
                                                Text(jsonResponse['error']),
                                            duration:
                                                const Duration(seconds: 3),
                                          ),
                                        );
                                      }
                                    } catch (e) {
                                      ScaffoldMessenger.of(context)
                                          .showSnackBar(
                                        SnackBar(
                                          content: Text("Server Error : $e."),
                                          duration: const Duration(seconds: 3),
                                        ),
                                      );
                                    }
                                  }
                                }
                              });
                            },
                          )
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  void show(BuildContext context) {
    Overlay.of(context).insert(overlayEntry);
  }

  void remove() {
    overlayEntry.remove();
  }
}
