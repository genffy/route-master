import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'ui/pages/home_page.dart';
import 'ui/theme/app_theme.dart';
import 'services/runhub_service.dart';

void main() {
  runApp(const RunHubApp());
}

class RunHubApp extends StatelessWidget {
  const RunHubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RunHub',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: RepositoryProvider(
        create: (context) => RunHubService(),
        child: const HomePage(),
      ),
      debugShowCheckedModeBanner: false,
    );
  }
}
