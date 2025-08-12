import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../services/runhub_service.dart';
import '../../models/activity.dart';

class SettingsTab extends StatefulWidget {
  const SettingsTab({super.key});

  @override
  State<SettingsTab> createState() => _SettingsTabState();
}

class _SettingsTabState extends State<SettingsTab> {
  List<SyncStatus>? _syncStatuses;
  bool _isLoadingSyncStatus = true;

  @override
  void initState() {
    super.initState();
    _loadSyncStatus();
  }

  void _loadSyncStatus() async {
    setState(() {
      _isLoadingSyncStatus = true;
    });

    try {
      final service = context.read<RunHubService>();
      final statuses = await service.getSyncStatus();
      setState(() {
        _syncStatuses = statuses;
        _isLoadingSyncStatus = false;
      });
    } catch (e) {
      setState(() {
        _isLoadingSyncStatus = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading sync status: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildPlatformSyncSection(),
          const SizedBox(height: 24),
          _buildDataManagementSection(),
          const SizedBox(height: 24),
          _buildGeneralSection(),
          const SizedBox(height: 24),
          _buildAboutSection(),
        ],
      ),
    );
  }

  Widget _buildPlatformSyncSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Platform Sync',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            if (_isLoadingSyncStatus)
              const Center(child: CircularProgressIndicator())
            else if (_syncStatuses != null)
              ..._syncStatuses!.map((status) => _buildPlatformStatusTile(status))
            else
              const Text('Failed to load sync status'),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _showAddPlatformDialog,
              icon: const Icon(Icons.add),
              label: const Text('Add Platform'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlatformStatusTile(SyncStatus status) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: CircleAvatar(
        backgroundColor: status.lastSyncSuccess ? Colors.green : Colors.red,
        child: Icon(
          _getPlatformIcon(status.platform),
          color: Colors.white,
        ),
      ),
      title: Text(status.platform.toUpperCase()),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (status.lastSync != null)
            Text('Last sync: ${_formatDateTime(status.lastSync!)}')
          else
            const Text('Never synced'),
          if (status.errorMessage != null)
            Text(
              'Error: ${status.errorMessage}',
              style: const TextStyle(color: Colors.red),
            ),
          Text('Activities synced: ${status.activitiesSynced}'),
        ],
      ),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.sync),
            onPressed: () => _syncPlatform(status.platform),
          ),
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => _showPlatformSettings(status.platform),
          ),
        ],
      ),
    );
  }

  Widget _buildDataManagementSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Data Management',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.file_upload),
              title: const Text('Import Data'),
              subtitle: const Text('Import GPX, FIT, or TCX files'),
              onTap: _showImportOptions,
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.file_download),
              title: const Text('Export Data'),
              subtitle: const Text('Export your activities to various formats'),
              onTap: _showExportOptions,
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.backup),
              title: const Text('Backup Database'),
              subtitle: const Text('Create a backup of all your data'),
              onTap: _createBackup,
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.delete_forever, color: Colors.red),
              title: const Text('Clear All Data'),
              subtitle: const Text('Delete all activities and settings'),
              onTap: _showClearDataDialog,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGeneralSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'General',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.palette),
              title: const Text('Theme'),
              subtitle: const Text('System default'),
              onTap: _showThemeOptions,
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.straighten),
              title: const Text('Units'),
              subtitle: const Text('Metric'),
              onTap: _showUnitsOptions,
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.notifications),
              title: const Text('Notifications'),
              subtitle: const Text('Sync reminders'),
              onTap: _showNotificationSettings,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAboutSection() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'About',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.info),
              title: const Text('Version'),
              subtitle: const Text('1.0.0+1'),
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.description),
              title: const Text('Privacy Policy'),
              onTap: _showPrivacyPolicy,
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.gavel),
              title: const Text('Terms of Service'),
              onTap: _showTermsOfService,
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.code),
              title: const Text('Open Source Licenses'),
              onTap: _showLicenses,
            ),
          ],
        ),
      ),
    );
  }

  IconData _getPlatformIcon(String platform) {
    switch (platform.toLowerCase()) {
      case 'garmin':
        return Icons.watch;
      case 'coros':
        return Icons.sports;
      case 'keep':
        return Icons.phone_android;
      default:
        return Icons.cloud;
    }
  }

  String _formatDateTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inDays == 0) {
      return 'Today ${dateTime.hour}:${dateTime.minute.toString().padLeft(2, '0')}';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else {
      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    }
  }

  void _showAddPlatformDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Platform'),
        content: const Text('Choose a platform to connect:'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              _addPlatform('garmin');
            },
            child: const Text('Garmin'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              _addPlatform('coros');
            },
            child: const Text('Coros'),
          ),
        ],
      ),
    );
  }

  void _addPlatform(String platform) {
    // TODO: Implement platform connection flow
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$platform connection not yet implemented')),
    );
  }

  void _syncPlatform(String platform) async {
    // Show loading indicator
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const AlertDialog(
        content: Row(
          children: [
            CircularProgressIndicator(),
            SizedBox(width: 16),
            Text('Syncing...'),
          ],
        ),
      ),
    );

    try {
      final service = context.read<RunHubService>();
      final result = await service.syncPlatform(platform);
      
      if (mounted) {
        Navigator.of(context).pop(); // Close loading dialog
        
        if (result.success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Synced ${result.activitiesSynced} activities from $platform')),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Sync failed: ${result.errorMessage}')),
          );
        }
        
        _loadSyncStatus(); // Refresh status
      }
    } catch (e) {
      if (mounted) {
        Navigator.of(context).pop(); // Close loading dialog
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Sync error: $e')),
        );
      }
    }
  }

  void _showPlatformSettings(String platform) {
    // TODO: Implement platform-specific settings
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('$platform settings not yet implemented')),
    );
  }

  void _showImportOptions() {
    // TODO: Implement import options
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Import options not yet implemented')),
    );
  }

  void _showExportOptions() {
    // TODO: Implement export options
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Export options not yet implemented')),
    );
  }

  void _createBackup() {
    // TODO: Implement backup functionality
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Backup functionality not yet implemented')),
    );
  }

  void _showClearDataDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Clear All Data'),
        content: const Text(
          'This will permanently delete all activities, settings, and credentials. This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () {
              Navigator.of(context).pop();
              _clearAllData();
            },
            child: const Text('Delete All'),
          ),
        ],
      ),
    );
  }

  void _clearAllData() {
    // TODO: Implement clear all data
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Clear data functionality not yet implemented')),
    );
  }

  void _showThemeOptions() {
    // TODO: Implement theme selection
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Theme options not yet implemented')),
    );
  }

  void _showUnitsOptions() {
    // TODO: Implement units selection
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Units options not yet implemented')),
    );
  }

  void _showNotificationSettings() {
    // TODO: Implement notification settings
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Notification settings not yet implemented')),
    );
  }

  void _showPrivacyPolicy() {
    // TODO: Show privacy policy
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Privacy policy not yet implemented')),
    );
  }

  void _showTermsOfService() {
    // TODO: Show terms of service
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Terms of service not yet implemented')),
    );
  }

  void _showLicenses() {
    showLicensePage(context: context);
  }
}
