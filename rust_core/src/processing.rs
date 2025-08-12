//! Data processing and standardization engine
//!
//! This module handles data cleaning, deduplication, and standardization
//! from various sources into our unified data model.

use crate::models::*;
use anyhow::Result;
// use chrono::{DateTime, Utc}; // Commented out as not used
use std::collections::HashMap;

/// Data processing engine for standardizing and cleaning activity data
pub struct ProcessingEngine;

impl ProcessingEngine {
    /// Create new processing engine
    pub fn new() -> Self {
        Self
    }

    /// Generate a unique signature for an activity to detect duplicates
    pub fn generate_activity_signature(&self, activity: &Activity) -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

        let mut hasher = DefaultHasher::new();

        // Hash key components that should be unique for each activity
        activity.start_time_utc.timestamp().hash(&mut hasher);
        activity.duration_seconds.hash(&mut hasher);

        if let Some(distance) = activity.distance_meters {
            // Round distance to nearest meter to handle floating point variations
            (distance.round() as i64).hash(&mut hasher);
        }

        activity.activity_type.hash(&mut hasher);

        format!("{:x}", hasher.finish())
    }

    /// Standardize activity type strings across different platforms
    pub fn standardize_activity_type(&self, raw_type: &str, platform: &str) -> String {
        let normalized = raw_type.to_lowercase().trim().to_string();

        match platform {
            "garmin" => self.standardize_garmin_activity_type(&normalized),
            "coros" => self.standardize_coros_activity_type(&normalized),
            "keep" => self.standardize_keep_activity_type(&normalized),
            _ => self.standardize_generic_activity_type(&normalized),
        }
    }

    /// Standardize Garmin activity types
    fn standardize_garmin_activity_type(&self, garmin_type: &str) -> String {
        match garmin_type {
            "running" | "run" => "running".to_string(),
            "cycling" | "bike" | "road_biking" | "mountain_biking" => "cycling".to_string(),
            "swimming" | "pool_swim" | "open_water_swimming" => "swimming".to_string(),
            "walking" | "casual_walking" | "speed_walking" => "walking".to_string(),
            "hiking" | "mountaineering" => "hiking".to_string(),
            "strength_training" | "cardio" | "fitness_equipment" => "strength".to_string(),
            _ => garmin_type.to_string(),
        }
    }

    /// Standardize Coros activity types
    fn standardize_coros_activity_type(&self, coros_type: &str) -> String {
        match coros_type {
            "跑步" | "running" => "running".to_string(),
            "骑行" | "cycling" => "cycling".to_string(),
            "游泳" | "swimming" => "swimming".to_string(),
            "健走" | "walking" => "walking".to_string(),
            "登山" | "hiking" => "hiking".to_string(),
            _ => coros_type.to_string(),
        }
    }

    /// Standardize Keep activity types
    fn standardize_keep_activity_type(&self, keep_type: &str) -> String {
        match keep_type {
            "跑步" | "running" => "running".to_string(),
            "骑行" | "cycling" => "cycling".to_string(),
            "游泳" | "swimming" => "swimming".to_string(),
            "健走" | "walking" => "walking".to_string(),
            "登山" | "hiking" => "hiking".to_string(),
            "力量训练" | "strength" => "strength".to_string(),
            _ => keep_type.to_string(),
        }
    }

    /// Generic activity type standardization
    fn standardize_generic_activity_type(&self, activity_type: &str) -> String {
        match activity_type {
            "run" | "jog" | "jogging" => "running".to_string(),
            "bike" | "biking" | "bicycle" => "cycling".to_string(),
            "swim" => "swimming".to_string(),
            "walk" => "walking".to_string(),
            "hike" => "hiking".to_string(),
            "gym" | "workout" | "fitness" => "strength".to_string(),
            _ => activity_type.to_string(),
        }
    }

    /// Clean and validate track point data
    pub fn clean_track_points(&self, points: &mut Vec<TrackPoint>) -> Result<()> {
        // Remove points with invalid coordinates
        points.retain(|point| {
            point.latitude >= -90.0
                && point.latitude <= 90.0
                && point.longitude >= -180.0
                && point.longitude <= 180.0
        });

        // Sort by timestamp
        points.sort_by(|a, b| a.timestamp_utc.cmp(&b.timestamp_utc));

        // Remove duplicate timestamps
        points.dedup_by(|a, b| a.timestamp_utc == b.timestamp_utc);

        // Validate heart rate values
        for point in points.iter_mut() {
            if let Some(hr) = point.heart_rate {
                if hr < 30 || hr > 250 {
                    point.heart_rate = None; // Invalid heart rate
                }
            }
        }

        // Calculate cumulative distance
        let mut cumulative_distance = 0.0;
        for i in 1..points.len() {
            let (prev_points, curr_points) = points.split_at_mut(i);
            let prev_point = &prev_points[i - 1];
            let curr_point = &mut curr_points[0];

            let distance = self.calculate_distance(
                prev_point.latitude,
                prev_point.longitude,
                curr_point.latitude,
                curr_point.longitude,
            );

            cumulative_distance += distance;
            curr_point.distance_meters = Some(cumulative_distance);
        }

        Ok(())
    }

    /// Calculate distance between two GPS coordinates using Haversine formula
    fn calculate_distance(&self, lat1: f64, lon1: f64, lat2: f64, lon2: f64) -> f64 {
        const EARTH_RADIUS: f64 = 6371000.0; // meters

        let lat1_rad = lat1.to_radians();
        let lat2_rad = lat2.to_radians();
        let delta_lat = (lat2 - lat1).to_radians();
        let delta_lon = (lon2 - lon1).to_radians();

        let a = (delta_lat / 2.0).sin().powi(2)
            + lat1_rad.cos() * lat2_rad.cos() * (delta_lon / 2.0).sin().powi(2);

        let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());

        EARTH_RADIUS * c
    }

    /// Calculate activity statistics from track points
    pub fn calculate_activity_stats(
        &self,
        activity: &mut Activity,
        track_points: &[TrackPoint],
    ) -> Result<()> {
        if track_points.is_empty() {
            return Ok(());
        }

        // Calculate total distance from last track point
        if let Some(last_point) = track_points.last() {
            if let Some(distance) = last_point.distance_meters {
                activity.distance_meters = Some(distance);
            }
        }

        // Calculate duration from first and last track points
        if let (Some(first), Some(last)) = (track_points.first(), track_points.last()) {
            let duration = (last.timestamp_utc - first.timestamp_utc).num_seconds();
            if duration > 0 {
                activity.duration_seconds = duration as u32;
            }
        }

        // Calculate heart rate statistics
        let heart_rates: Vec<u16> = track_points.iter().filter_map(|p| p.heart_rate).collect();

        if !heart_rates.is_empty() {
            activity.avg_heart_rate =
                Some(heart_rates.iter().sum::<u16>() / heart_rates.len() as u16);
            activity.max_heart_rate = heart_rates.iter().max().copied();
        }

        // Calculate speed statistics
        let speeds: Vec<f64> = track_points.iter().filter_map(|p| p.speed_mps).collect();

        if !speeds.is_empty() {
            activity.avg_speed_mps = Some(speeds.iter().sum::<f64>() / speeds.len() as f64);
            activity.max_speed_mps = speeds
                .iter()
                .max_by(|a, b| a.partial_cmp(b).unwrap())
                .copied();
        } else if let (Some(distance), duration) =
            (activity.distance_meters, activity.duration_seconds)
        {
            if duration > 0 {
                activity.avg_speed_mps = Some(distance / duration as f64);
            }
        }

        // Calculate elevation gain/loss
        let mut elevation_gain = 0.0;
        let mut elevation_loss = 0.0;

        for i in 1..track_points.len() {
            if let (Some(prev_alt), Some(curr_alt)) = (
                track_points[i - 1].altitude_meters,
                track_points[i].altitude_meters,
            ) {
                let diff = curr_alt - prev_alt;
                if diff > 0.0 {
                    elevation_gain += diff;
                } else {
                    elevation_loss += diff.abs();
                }
            }
        }

        if elevation_gain > 0.0 {
            activity.total_elevation_gain = Some(elevation_gain);
        }
        if elevation_loss > 0.0 {
            activity.total_elevation_loss = Some(elevation_loss);
        }

        Ok(())
    }

    /// Generate personal best records from activities
    pub fn find_personal_bests(&self, activities: &[Activity]) -> Vec<PersonalBest> {
        let mut pbs = Vec::new();
        let mut best_times: HashMap<(String, String), (f64, &Activity)> = HashMap::new();

        // Common distances for running (in meters)
        let running_distances = vec![
            1000.0,  // 1K
            5000.0,  // 5K
            10000.0, // 10K
            21097.5, // Half marathon
            42195.0, // Marathon
        ];

        for activity in activities {
            if activity.activity_type == "running" {
                if let Some(distance) = activity.distance_meters {
                    // Check standard distances
                    for &target_distance in &running_distances {
                        let distance_key = format!("{}m", target_distance as u64);
                        let key = (activity.activity_type.clone(), distance_key);

                        // Allow 5% tolerance for distance matching
                        if (distance - target_distance).abs() / target_distance <= 0.05 {
                            let pace = activity.duration_seconds as f64 / (distance / 1000.0);

                            match best_times.get(&key) {
                                None => {
                                    best_times.insert(key, (pace, activity));
                                }
                                Some((best_pace, _)) => {
                                    if pace < *best_pace {
                                        best_times.insert(key, (pace, activity));
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Convert to PersonalBest records
        for ((activity_type, distance_str), (pace, activity)) in best_times {
            let distance_meters = distance_str
                .trim_end_matches('m')
                .parse::<f64>()
                .unwrap_or(0.0);

            pbs.push(PersonalBest {
                id: uuid::Uuid::new_v4(),
                activity_type,
                distance_meters,
                duration_seconds: activity.duration_seconds,
                activity_id: activity.id,
                achieved_at: activity.start_time_utc,
                pace_per_km_seconds: pace,
            });
        }

        pbs
    }
}
