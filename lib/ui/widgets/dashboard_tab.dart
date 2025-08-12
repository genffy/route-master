import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../services/runhub_service.dart';
import '../../models/activity_summary.dart';
import '../theme/app_theme.dart';

class DashboardTab extends StatefulWidget {
  const DashboardTab({super.key});

  @override
  State<DashboardTab> createState() => _DashboardTabState();
}

class _DashboardTabState extends State<DashboardTab> {
  Future<ActivitySummary>? _summaryFuture;

  @override
  void initState() {
    super.initState();
    _loadSummary();
  }

  void _loadSummary() {
    final service = context.read<RunHubService>();
    setState(() {
      _summaryFuture = service.getActivitySummary();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadSummary,
          ),
        ],
      ),
      body: FutureBuilder<ActivitySummary>(
        future: _summaryFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text('Error: ${snapshot.error}'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _loadSummary,
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          final summary = snapshot.data!;
          return _buildDashboard(context, summary);
        },
      ),
    );
  }

  Widget _buildDashboard(BuildContext context, ActivitySummary summary) {
    return RefreshIndicator(
      onRefresh: () async => _loadSummary(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildStatsGrid(summary),
            const SizedBox(height: 24),
            _buildActivityTypeChart(summary),
            const SizedBox(height: 24),
            _buildRecentActivities(summary),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsGrid(ActivitySummary summary) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      childAspectRatio: 1.5,
      children: [
        _buildStatCard(
          'Total Activities',
          summary.totalActivities.toString(),
          Icons.fitness_center,
          AppTheme.primaryColor,
        ),
        _buildStatCard(
          'Total Distance',
          summary.formattedTotalDistance,
          Icons.straighten,
          AppTheme.runningColor,
        ),
        _buildStatCard(
          'Total Time',
          summary.formattedTotalDuration,
          Icons.timer,
          AppTheme.cyclingColor,
        ),
        _buildStatCard(
          'Calories Burned',
          summary.formattedTotalCalories,
          Icons.local_fire_department,
          Colors.orange,
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 32, color: color),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: color,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              title,
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityTypeChart(ActivitySummary summary) {
    if (summary.activityTypes.isEmpty) {
      return const SizedBox.shrink();
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Activity Types',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 200,
              child: PieChart(
                PieChartData(
                  sections: summary.activityTypes.map((stat) {
                    return PieChartSectionData(
                      value: stat.count.toDouble(),
                      title: stat.count.toString(),
                      color: AppTheme.getActivityTypeColor(stat.activityType),
                      radius: 80,
                      titleStyle: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    );
                  }).toList(),
                  centerSpaceRadius: 40,
                  sectionsSpace: 2,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 16,
              runSpacing: 8,
              children: summary.activityTypes.map((stat) {
                return Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: AppTheme.getActivityTypeColor(stat.activityType),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${stat.activityType} (${stat.count})',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentActivities(ActivitySummary summary) {
    if (summary.recentActivities.isEmpty) {
      return const SizedBox.shrink();
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Recent Activities',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                TextButton(
                  onPressed: () {
                    // TODO: Navigate to activities tab
                  },
                  child: const Text('View All'),
                ),
              ],
            ),
            const SizedBox(height: 8),
            ...summary.recentActivities.take(3).map((activity) {
              return ListTile(
                contentPadding: EdgeInsets.zero,
                leading: CircleAvatar(
                  backgroundColor: AppTheme.getActivityTypeColor(activity.activityType),
                  child: Icon(
                    AppTheme.getActivityTypeIcon(activity.activityType),
                    color: Colors.white,
                  ),
                ),
                title: Text(activity.name ?? 'Unnamed Activity'),
                subtitle: Text(
                  '${activity.formattedDistance} • ${activity.formattedDuration} • ${activity.formattedDate}',
                ),
                trailing: Text(
                  activity.formattedPace,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                onTap: () {
                  // TODO: Navigate to activity details
                },
              );
            }).toList(),
          ],
        ),
      ),
    );
  }
}
