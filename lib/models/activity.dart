/// Data models corresponding to Rust core structures

class Activity {
  final String id;
  final String source;
  final String activityType;
  final String? name;
  final DateTime startTimeUtc;
  final int durationSeconds;
  final double? distanceMeters;
  final double? totalElevationGain;
  final double? totalElevationLoss;
  final int? avgHeartRate;
  final int? maxHeartRate;
  final int? avgCadence;
  final int? maxCadence;
  final double? avgSpeedMps;
  final double? maxSpeedMps;
  final int? calories;
  final double? trainingStressScore;
  final String? notes;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Activity({
    required this.id,
    required this.source,
    required this.activityType,
    this.name,
    required this.startTimeUtc,
    required this.durationSeconds,
    this.distanceMeters,
    this.totalElevationGain,
    this.totalElevationLoss,
    this.avgHeartRate,
    this.maxHeartRate,
    this.avgCadence,
    this.maxCadence,
    this.avgSpeedMps,
    this.maxSpeedMps,
    this.calories,
    this.trainingStressScore,
    this.notes,
    this.createdAt,
    this.updatedAt,
  });

  /// Calculate average pace in seconds per kilometer
  double? get pacePerKmSeconds {
    if (distanceMeters != null && distanceMeters! > 0) {
      final distanceKm = distanceMeters! / 1000.0;
      return durationSeconds / distanceKm;
    }
    return null;
  }

  /// Format pace as MM:SS per km
  String get formattedPace {
    final pace = pacePerKmSeconds;
    if (pace == null) return '--:--';
    
    final minutes = (pace / 60).floor();
    final seconds = (pace % 60).round();
    return '${minutes.toString().padLeft(1, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  /// Format distance in km with appropriate precision
  String get formattedDistance {
    if (distanceMeters == null) return '--';
    final km = distanceMeters! / 1000.0;
    if (km < 1) {
      return '${distanceMeters!.round()}m';
    }
    return '${km.toStringAsFixed(2)}km';
  }

  /// Format duration as HH:MM:SS or MM:SS
  String get formattedDuration {
    final duration = Duration(seconds: durationSeconds);
    final hours = duration.inHours;
    final minutes = duration.inMinutes.remainder(60);
    final seconds = duration.inSeconds.remainder(60);
    
    if (hours > 0) {
      return '${hours.toString().padLeft(1, '0')}:${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
    } else {
      return '${minutes.toString().padLeft(1, '0')}:${seconds.toString().padLeft(2, '0')}';
    }
  }

  /// Format date for display
  String get formattedDate {
    final now = DateTime.now();
    final difference = now.difference(startTimeUtc);
    
    if (difference.inDays == 0) {
      return 'Today';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else {
      return '${startTimeUtc.day}/${startTimeUtc.month}/${startTimeUtc.year}';
    }
  }
}

class TrackPoint {
  final String id;
  final String activityId;
  final DateTime timestampUtc;
  final double latitude;
  final double longitude;
  final double? altitudeMeters;
  final int? heartRate;
  final int? cadence;
  final double? speedMps;
  final int? powerWatts;
  final double? temperatureCelsius;
  final double? distanceMeters;

  TrackPoint({
    required this.id,
    required this.activityId,
    required this.timestampUtc,
    required this.latitude,
    required this.longitude,
    this.altitudeMeters,
    this.heartRate,
    this.cadence,
    this.speedMps,
    this.powerWatts,
    this.temperatureCelsius,
    this.distanceMeters,
  });
}

class Lap {
  final String id;
  final String activityId;
  final int lapNumber;
  final DateTime startTimeUtc;
  final int durationSeconds;
  final double distanceMeters;
  final int? avgHeartRate;
  final int? maxHeartRate;
  final int? avgCadence;
  final double avgSpeedMps;
  final double? maxSpeedMps;
  final double? elevationGain;
  final double? elevationLoss;
  final int? calories;

  Lap({
    required this.id,
    required this.activityId,
    required this.lapNumber,
    required this.startTimeUtc,
    required this.durationSeconds,
    required this.distanceMeters,
    this.avgHeartRate,
    this.maxHeartRate,
    this.avgCadence,
    required this.avgSpeedMps,
    this.maxSpeedMps,
    this.elevationGain,
    this.elevationLoss,
    this.calories,
  });
}

class ActivityDetails {
  final Activity activity;
  final List<TrackPoint> trackPoints;

  ActivityDetails({
    required this.activity,
    required this.trackPoints,
  });
}

class SyncResult {
  final String platform;
  final bool success;
  final int activitiesSynced;
  final String? errorMessage;
  final int syncDurationMs;

  SyncResult({
    required this.platform,
    required this.success,
    required this.activitiesSynced,
    this.errorMessage,
    required this.syncDurationMs,
  });
}

class ImportResult {
  final bool success;
  final int activitiesImported;
  final String fileFormat;
  final String? errorMessage;

  ImportResult({
    required this.success,
    required this.activitiesImported,
    required this.fileFormat,
    this.errorMessage,
  });
}

class SyncStatus {
  final String platform;
  final DateTime? lastSync;
  final bool lastSyncSuccess;
  final String? errorMessage;
  final int activitiesSynced;

  SyncStatus({
    required this.platform,
    this.lastSync,
    required this.lastSyncSuccess,
    this.errorMessage,
    required this.activitiesSynced,
  });
}
