//! Data models for RunHub
//!
//! This module defines the core data structures used throughout the application,
//! corresponding to the database schema outlined in the architecture document.

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Represents a sports activity/workout session
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Activity {
    pub id: Uuid,
    pub source: String,        // e.g., "garmin", "coros", "keep", "manual"
    pub activity_type: String, // e.g., "running", "cycling", "swimming"
    pub name: Option<String>,  // User-defined or auto-generated name
    pub start_time_utc: DateTime<Utc>,
    pub duration_seconds: u32,
    pub distance_meters: Option<f64>,
    pub total_elevation_gain: Option<f64>,
    pub total_elevation_loss: Option<f64>,
    pub avg_heart_rate: Option<u16>,
    pub max_heart_rate: Option<u16>,
    pub avg_cadence: Option<u16>,
    pub max_cadence: Option<u16>,
    pub avg_speed_mps: Option<f64>,
    pub max_speed_mps: Option<f64>,
    pub calories: Option<u32>,
    pub training_stress_score: Option<f64>,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Represents a GPS track point with sensor data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrackPoint {
    pub id: Uuid,
    pub activity_id: Uuid,
    pub timestamp_utc: DateTime<Utc>,
    pub latitude: f64,
    pub longitude: f64,
    pub altitude_meters: Option<f64>,
    pub heart_rate: Option<u16>,
    pub cadence: Option<u16>,
    pub speed_mps: Option<f64>,
    pub power_watts: Option<u16>,
    pub temperature_celsius: Option<f32>,
    pub distance_meters: Option<f64>, // Cumulative distance from start
}

/// Represents a lap/split within an activity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Lap {
    pub id: Uuid,
    pub activity_id: Uuid,
    pub lap_number: u32,
    pub start_time_utc: DateTime<Utc>,
    pub duration_seconds: u32,
    pub distance_meters: f64,
    pub avg_heart_rate: Option<u16>,
    pub max_heart_rate: Option<u16>,
    pub avg_cadence: Option<u16>,
    pub avg_speed_mps: f64,
    pub max_speed_mps: Option<f64>,
    pub elevation_gain: Option<f64>,
    pub elevation_loss: Option<f64>,
    pub calories: Option<u32>,
}

/// Encrypted user credentials for external platforms
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserCredential {
    pub id: Uuid,
    pub platform: String,        // e.g., "garmin", "coros", "keep"
    pub username: String,        // May be encrypted
    pub encrypted_data: Vec<u8>, // Contains encrypted tokens, passwords, etc.
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub last_sync: Option<DateTime<Utc>>,
}

/// Summary statistics for dashboard display
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActivitySummary {
    pub total_activities: u32,
    pub total_distance_meters: f64,
    pub total_duration_seconds: u32,
    pub total_elevation_gain: f64,
    pub total_calories: u32,
    pub activity_types: Vec<ActivityTypeStats>,
    pub recent_activities: Vec<Activity>,
}

/// Statistics for a specific activity type
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActivityTypeStats {
    pub activity_type: String,
    pub count: u32,
    pub total_distance_meters: f64,
    pub total_duration_seconds: u32,
    pub avg_distance_meters: f64,
    pub avg_duration_seconds: u32,
}

/// Personal best record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersonalBest {
    pub id: Uuid,
    pub activity_type: String,
    pub distance_meters: f64,
    pub duration_seconds: u32,
    pub activity_id: Uuid,
    pub achieved_at: DateTime<Utc>,
    pub pace_per_km_seconds: f64, // For running activities
}

/// Sync status for external platforms
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncStatus {
    pub platform: String,
    pub last_sync: Option<DateTime<Utc>>,
    pub last_sync_success: bool,
    pub error_message: Option<String>,
    pub activities_synced: u32,
}

impl Activity {
    /// Create a new activity with generated UUID and timestamps
    pub fn new(source: String, activity_type: String, start_time_utc: DateTime<Utc>) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            source,
            activity_type,
            name: None,
            start_time_utc,
            duration_seconds: 0,
            distance_meters: None,
            total_elevation_gain: None,
            total_elevation_loss: None,
            avg_heart_rate: None,
            max_heart_rate: None,
            avg_cadence: None,
            max_cadence: None,
            avg_speed_mps: None,
            max_speed_mps: None,
            calories: None,
            training_stress_score: None,
            notes: None,
            created_at: now,
            updated_at: now,
        }
    }

    /// Calculate average pace in seconds per kilometer
    pub fn pace_per_km_seconds(&self) -> Option<f64> {
        if let Some(distance) = self.distance_meters {
            if distance > 0.0 {
                let distance_km = distance / 1000.0;
                return Some(self.duration_seconds as f64 / distance_km);
            }
        }
        None
    }
}

impl TrackPoint {
    /// Create a new track point with generated UUID
    pub fn new(
        activity_id: Uuid,
        timestamp_utc: DateTime<Utc>,
        latitude: f64,
        longitude: f64,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            activity_id,
            timestamp_utc,
            latitude,
            longitude,
            altitude_meters: None,
            heart_rate: None,
            cadence: None,
            speed_mps: None,
            power_watts: None,
            temperature_celsius: None,
            distance_meters: None,
        }
    }
}
