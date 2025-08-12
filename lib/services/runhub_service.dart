import 'package:runhub/models/activity.dart';
import 'package:runhub/models/activity_summary.dart';

/// Service class for interfacing with RunHub Rust core
/// This will be replaced with actual FFI calls to Rust when flutter_rust_bridge is configured
class RunHubService {
  
  /// Get dashboard summary data
  Future<ActivitySummary> getActivitySummary() async {
    // Mock data for now - will be replaced with actual Rust FFI calls
    await Future.delayed(const Duration(milliseconds: 500));
    
    return ActivitySummary(
      totalActivities: 42,
      totalDistanceMeters: 250000.0, // 250km
      totalDurationSeconds: 75600, // 21 hours
      totalElevationGain: 2500.0, // 2.5km elevation
      totalCalories: 15000,
      activityTypes: [
        ActivityTypeStats(
          activityType: 'running',
          count: 25,
          totalDistanceMeters: 150000.0,
          totalDurationSeconds: 45000,
          avgDistanceMeters: 6000.0,
          avgDurationSeconds: 1800,
        ),
        ActivityTypeStats(
          activityType: 'cycling',
          count: 15,
          totalDistanceMeters: 90000.0,
          totalDurationSeconds: 27000,
          avgDistanceMeters: 6000.0,
          avgDurationSeconds: 1800,
        ),
        ActivityTypeStats(
          activityType: 'swimming',
          count: 2,
          totalDistanceMeters: 2000.0,
          totalDurationSeconds: 3600,
          avgDistanceMeters: 1000.0,
          avgDurationSeconds: 1800,
        ),
      ],
      recentActivities: [
        Activity(
          id: '1',
          source: 'garmin',
          activityType: 'running',
          name: 'Morning Run',
          startTimeUtc: DateTime.now().subtract(const Duration(days: 1)),
          durationSeconds: 2100,
          distanceMeters: 5000.0,
          avgHeartRate: 155,
          maxHeartRate: 175,
          calories: 350,
        ),
        Activity(
          id: '2',
          source: 'coros',
          activityType: 'cycling',
          name: 'Evening Ride',
          startTimeUtc: DateTime.now().subtract(const Duration(days: 2)),
          durationSeconds: 3600,
          distanceMeters: 25000.0,
          avgHeartRate: 140,
          maxHeartRate: 165,
          calories: 800,
        ),
      ],
    );
  }

  /// Get paginated list of activities
  Future<List<Activity>> getActivities({
    int limit = 20,
    int offset = 0,
    String? activityType,
    String? source,
  }) async {
    // Mock data for now
    await Future.delayed(const Duration(milliseconds: 300));
    
    final mockActivities = <Activity>[
      Activity(
        id: '1',
        source: 'garmin',
        activityType: 'running',
        name: 'Morning Run',
        startTimeUtc: DateTime.now().subtract(const Duration(days: 1)),
        durationSeconds: 2100,
        distanceMeters: 5000.0,
        avgHeartRate: 155,
        maxHeartRate: 175,
        calories: 350,
      ),
      Activity(
        id: '2',
        source: 'coros',
        activityType: 'cycling',
        name: 'Evening Ride',
        startTimeUtc: DateTime.now().subtract(const Duration(days: 2)),
        durationSeconds: 3600,
        distanceMeters: 25000.0,
        avgHeartRate: 140,
        maxHeartRate: 165,
        calories: 800,
      ),
      Activity(
        id: '3',
        source: 'garmin',
        activityType: 'running',
        name: 'Interval Training',
        startTimeUtc: DateTime.now().subtract(const Duration(days: 3)),
        durationSeconds: 1800,
        distanceMeters: 4000.0,
        avgHeartRate: 165,
        maxHeartRate: 185,
        calories: 320,
      ),
      Activity(
        id: '4',
        source: 'keep',
        activityType: 'swimming',
        name: 'Pool Session',
        startTimeUtc: DateTime.now().subtract(const Duration(days: 4)),
        durationSeconds: 2400,
        distanceMeters: 1500.0,
        avgHeartRate: 130,
        maxHeartRate: 150,
        calories: 280,
      ),
    ];

    // Apply filters
    var filtered = mockActivities.where((activity) {
      if (activityType != null && activity.activityType != activityType) {
        return false;
      }
      if (source != null && activity.source != source) {
        return false;
      }
      return true;
    }).toList();

    // Apply pagination
    final startIndex = offset;
    final endIndex = (startIndex + limit).clamp(0, filtered.length);
    
    if (startIndex >= filtered.length) {
      return [];
    }
    
    return filtered.sublist(startIndex, endIndex);
  }

  /// Get detailed activity information
  Future<ActivityDetails> getActivityDetails(String activityId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    
    // Mock detailed activity data
    final activity = Activity(
      id: activityId,
      source: 'garmin',
      activityType: 'running',
      name: 'Morning Run',
      startTimeUtc: DateTime.now().subtract(const Duration(days: 1)),
      durationSeconds: 2100,
      distanceMeters: 5000.0,
      totalElevationGain: 50.0,
      totalElevationLoss: 45.0,
      avgHeartRate: 155,
      maxHeartRate: 175,
      avgSpeedMps: 2.38, // ~5:00/km pace
      maxSpeedMps: 4.5,
      calories: 350,
      notes: 'Great morning run with perfect weather!',
    );

    // Mock track points (simplified)
    final trackPoints = <TrackPoint>[];
    final baseTime = activity.startTimeUtc;
    const baseLatitude = 37.7749;
    const baseLongitude = -122.4194;
    
    for (int i = 0; i < 100; i++) {
      trackPoints.add(TrackPoint(
        id: 'point_$i',
        activityId: activityId,
        timestampUtc: baseTime.add(Duration(seconds: i * 21)),
        latitude: baseLatitude + (i * 0.0001),
        longitude: baseLongitude + (i * 0.0001),
        altitudeMeters: 100.0 + (i % 20) - 10, // Simulate elevation changes
        heartRate: 150 + (i % 30), // Simulate HR variation
        speedMps: 2.0 + (i % 10) * 0.1, // Simulate speed changes
        distanceMeters: i * 50.0, // 50m per point
      ));
    }

    return ActivityDetails(
      activity: activity,
      trackPoints: trackPoints,
    );
  }

  /// Sync data from a platform
  Future<SyncResult> syncPlatform(String platform) async {
    await Future.delayed(const Duration(seconds: 2));
    
    return SyncResult(
      platform: platform,
      success: true,
      activitiesSynced: 3,
      errorMessage: null,
      syncDurationMs: 2000,
    );
  }

  /// Import activity from file
  Future<ImportResult> importFile(String filePath) async {
    await Future.delayed(const Duration(milliseconds: 800));
    
    return ImportResult(
      success: true,
      activitiesImported: 1,
      fileFormat: 'gpx',
      errorMessage: null,
    );
  }

  /// Get sync status for all platforms
  Future<List<SyncStatus>> getSyncStatus() async {
    await Future.delayed(const Duration(milliseconds: 200));
    
    return [
      SyncStatus(
        platform: 'garmin',
        lastSync: DateTime.now().subtract(const Duration(hours: 2)),
        lastSyncSuccess: true,
        errorMessage: null,
        activitiesSynced: 15,
      ),
      SyncStatus(
        platform: 'coros',
        lastSync: DateTime.now().subtract(const Duration(days: 1)),
        lastSyncSuccess: false,
        errorMessage: 'Authentication failed',
        activitiesSynced: 0,
      ),
    ];
  }
}
