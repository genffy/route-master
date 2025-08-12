import 'package:flutter/material.dart';
import '../widgets/dashboard_tab.dart';
import '../widgets/activities_tab.dart';
import '../widgets/settings_tab.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int _currentIndex = 0;
  
  late final List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      const DashboardTab(),
      const ActivitiesTab(),
      const SettingsTab(),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Dashboard',
          ),
          NavigationDestination(
            icon: Icon(Icons.list_outlined),
            selectedIcon: Icon(Icons.list),
            label: 'Activities',
          ),
          NavigationDestination(
            icon: Icon(Icons.settings_outlined),
            selectedIcon: Icon(Icons.settings),
            label: 'Settings',
          ),
        ],
      ),
      floatingActionButton: _currentIndex == 1 ? FloatingActionButton(
        onPressed: () => _showImportDialog(context),
        tooltip: 'Import Activity',
        child: const Icon(Icons.add),
      ) : null,
    );
  }

  void _showImportDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Import Activity'),
        content: const Text('Choose how to import your activity data:'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              _importFromFile(context);
            },
            child: const Text('From File'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              _syncFromPlatform(context);
            },
            child: const Text('Sync Platform'),
          ),
        ],
      ),
    );
  }

  void _importFromFile(BuildContext context) {
    // TODO: Implement file picker and import
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('File import not yet implemented')),
    );
  }

  void _syncFromPlatform(BuildContext context) {
    // TODO: Show platform selection dialog
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Platform sync not yet implemented')),
    );
  }
}
