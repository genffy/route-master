import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../services/runhub_service.dart';
import '../../models/activity.dart';
import '../theme/app_theme.dart';

class ActivitiesTab extends StatefulWidget {
  const ActivitiesTab({super.key});

  @override
  State<ActivitiesTab> createState() => _ActivitiesTabState();
}

class _ActivitiesTabState extends State<ActivitiesTab> {
  final List<Activity> _activities = [];
  bool _isLoading = false;
  bool _hasMore = true;
  String? _selectedActivityType;
  String? _selectedSource;
  
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _loadActivities(refresh: true);
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels == _scrollController.position.maxScrollExtent) {
      if (!_isLoading && _hasMore) {
        _loadActivities();
      }
    }
  }

  void _loadActivities({bool refresh = false}) async {
    if (_isLoading) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final service = context.read<RunHubService>();
      final newActivities = await service.getActivities(
        limit: 20,
        offset: refresh ? 0 : _activities.length,
        activityType: _selectedActivityType,
        source: _selectedSource,
      );

      setState(() {
        if (refresh) {
          _activities.clear();
        }
        _activities.addAll(newActivities);
        _hasMore = newActivities.length == 20;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading activities: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Activities'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => _loadActivities(refresh: true),
          ),
        ],
      ),
      body: Column(
        children: [
          if (_selectedActivityType != null || _selectedSource != null)
            _buildFilterChips(),
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async => _loadActivities(refresh: true),
              child: _buildActivityList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChips() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Wrap(
        spacing: 8,
        children: [
          if (_selectedActivityType != null)
            FilterChip(
              label: Text(_selectedActivityType!),
              selected: true,
              onSelected: (bool value) {
                if (!value) {
                  setState(() {
                    _selectedActivityType = null;
                  });
                  _loadActivities(refresh: true);
                }
              },
              onDeleted: () {
                setState(() {
                  _selectedActivityType = null;
                });
                _loadActivities(refresh: true);
              },
            ),
          if (_selectedSource != null)
            FilterChip(
              label: Text(_selectedSource!),
              selected: true,
              onSelected: (bool value) {
                if (!value) {
                  setState(() {
                    _selectedSource = null;
                  });
                  _loadActivities(refresh: true);
                }
              },
              onDeleted: () {
                setState(() {
                  _selectedSource = null;
                });
                _loadActivities(refresh: true);
              },
            ),
        ],
      ),
    );
  }

  Widget _buildActivityList() {
    if (_activities.isEmpty && !_isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.sports_outlined, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text(
              'No activities found',
              style: TextStyle(fontSize: 18, color: Colors.grey),
            ),
            SizedBox(height: 8),
            Text(
              'Import your first activity or sync from a platform',
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(16),
      itemCount: _activities.length + (_hasMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == _activities.length) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: CircularProgressIndicator(),
            ),
          );
        }

        final activity = _activities[index];
        return _buildActivityCard(activity);
      },
    );
  }

  Widget _buildActivityCard(Activity activity) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () => _showActivityDetails(activity),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    backgroundColor: AppTheme.getActivityTypeColor(activity.activityType),
                    child: Icon(
                      AppTheme.getActivityTypeIcon(activity.activityType),
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          activity.name ?? 'Unnamed Activity',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        Text(
                          '${activity.formattedDate} • ${activity.source}',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (activity.calories != null)
                    Column(
                      children: [
                        const Icon(Icons.local_fire_department, color: Colors.orange, size: 16),
                        Text(
                          '${activity.calories}',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _buildStatColumn(
                      'Distance',
                      activity.formattedDistance,
                      Icons.straighten,
                    ),
                  ),
                  Expanded(
                    child: _buildStatColumn(
                      'Duration',
                      activity.formattedDuration,
                      Icons.timer,
                    ),
                  ),
                  Expanded(
                    child: _buildStatColumn(
                      'Pace',
                      activity.formattedPace,
                      Icons.speed,
                    ),
                  ),
                  if (activity.avgHeartRate != null)
                    Expanded(
                      child: _buildStatColumn(
                        'Avg HR',
                        '${activity.avgHeartRate}',
                        Icons.favorite,
                      ),
                    ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatColumn(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, size: 16, color: Colors.grey[600]),
        const SizedBox(height: 4),
        Text(
          value,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: Colors.grey[600],
          ),
        ),
      ],
    );
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Filter Activities'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            DropdownButtonFormField<String>(
              value: _selectedActivityType,
              decoration: const InputDecoration(labelText: 'Activity Type'),
              items: ['running', 'cycling', 'swimming', 'walking', 'strength']
                  .map((type) => DropdownMenuItem(
                        value: type,
                        child: Text(type.capitalize()),
                      ))
                  .toList(),
              onChanged: (value) {
                setState(() {
                  _selectedActivityType = value;
                });
              },
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              value: _selectedSource,
              decoration: const InputDecoration(labelText: 'Source'),
              items: ['garmin', 'coros', 'keep', 'manual']
                  .map((source) => DropdownMenuItem(
                        value: source,
                        child: Text(source.capitalize()),
                      ))
                  .toList(),
              onChanged: (value) {
                setState(() {
                  _selectedSource = value;
                });
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              setState(() {
                _selectedActivityType = null;
                _selectedSource = null;
              });
              Navigator.of(context).pop();
              _loadActivities(refresh: true);
            },
            child: const Text('Clear'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              _loadActivities(refresh: true);
            },
            child: const Text('Apply'),
          ),
        ],
      ),
    );
  }

  void _showActivityDetails(Activity activity) {
    // TODO: Navigate to activity details page
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Activity details for ${activity.name}')),
    );
  }
}

extension StringExtension on String {
  String capitalize() {
    return "${this[0].toUpperCase()}${substring(1)}";
  }
}
