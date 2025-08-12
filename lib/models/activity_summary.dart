import 'activity.dart';

class ActivitySummary {
  final int totalActivities;
  final double totalDistanceMeters;
  final int totalDurationSeconds;
  final double totalElevationGain;
  final int totalCalories;
  final List<ActivityTypeStats> activityTypes;
  final List<Activity> recentActivities;

  ActivitySummary({
    required this.totalActivities,
    required this.totalDistanceMeters,
    required this.totalDurationSeconds,
    required this.totalElevationGain,
    required this.totalCalories,
    required this.activityTypes,
    required this.recentActivities,
  });

  /// Format total distance
  String get formattedTotalDistance {
    final km = totalDistanceMeters / 1000.0;
    return '${km.toStringAsFixed(1)}km';
  }

  /// Format total duration
  String get formattedTotalDuration {
    final duration = Duration(seconds: totalDurationSeconds);
    final hours = duration.inHours;
    final minutes = duration.inMinutes.remainder(60);
    
    if (hours > 0) {
      return '${hours}h ${minutes}m';
    } else {
      return '${minutes}m';
    }
  }

  /// Format total elevation
  String get formattedTotalElevation {
    if (totalElevationGain < 1000) {
      return '${totalElevationGain.round()}m';
    } else {
      return '${(totalElevationGain / 1000).toStringAsFixed(1)}km';
    }
  }

  /// Format total calories
  String get formattedTotalCalories {
    if (totalCalories >= 1000) {
      return '${(totalCalories / 1000).toStringAsFixed(1)}k';
    }
    return totalCalories.toString();
  }
}

class ActivityTypeStats {
  final String activityType;
  final int count;
  final double totalDistanceMeters;
  final int totalDurationSeconds;
  final double avgDistanceMeters;
  final int avgDurationSeconds;

  ActivityTypeStats({
    required this.activityType,
    required this.count,
    required this.totalDistanceMeters,
    required this.totalDurationSeconds,
    required this.avgDistanceMeters,
    required this.avgDurationSeconds,
  });

  /// Format total distance for this activity type
  String get formattedTotalDistance {
    final km = totalDistanceMeters / 1000.0;
    return '${km.toStringAsFixed(1)}km';
  }

  /// Format average distance for this activity type
  String get formattedAvgDistance {
    final km = avgDistanceMeters / 1000.0;
    return '${km.toStringAsFixed(1)}km';
  }

  /// Format total duration for this activity type
  String get formattedTotalDuration {
    final duration = Duration(seconds: totalDurationSeconds);
    final hours = duration.inHours;
    if (hours > 0) {
      return '${hours}h';
    } else {
      return '${duration.inMinutes}m';
    }
  }

  /// Format average duration for this activity type
  String get formattedAvgDuration {
    final duration = Duration(seconds: avgDurationSeconds);
    final minutes = duration.inMinutes;
    if (minutes >= 60) {
      final hours = duration.inHours;
      final remainingMinutes = duration.inMinutes.remainder(60);
      return '${hours}h ${remainingMinutes}m';
    } else {
      return '${minutes}m';
    }
  }
}
