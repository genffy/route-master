//! Synchronization engine for external platforms and file imports
//! 
//! This module handles data synchronization from various sports platforms
//! and file imports (GPX, FIT, TCX).

use crate::database::Database;
use crate::models::*;
use crate::api::{SyncResult, ImportResult, ExportResult};
use crate::connectors::{ConnectorTrait, GarminConnector, CorosConnector};
use anyhow::Result;
use std::collections::HashMap;
use std::time::Instant;
use uuid::Uuid;

/// Main synchronization engine
pub struct SyncEngine {
    connectors: HashMap<String, Box<dyn ConnectorTrait + Send + Sync>>,
}

impl SyncEngine {
    /// Create new sync engine with available connectors
    pub fn new() -> Self {
        let mut connectors: HashMap<String, Box<dyn ConnectorTrait + Send + Sync>> = HashMap::new();
        
        // Register available connectors
        connectors.insert("garmin".to_string(), Box::new(GarminConnector::new()));
        connectors.insert("coros".to_string(), Box::new(CorosConnector::new()));
        
        Self { connectors }
    }

    /// Sync data from a specific platform
    pub async fn sync_platform(&self, platform: &str, database: &Database) -> Result<SyncResult> {
        let start_time = Instant::now();
        
        let connector = self.connectors.get(platform)
            .ok_or_else(|| anyhow::anyhow!("Unsupported platform: {}", platform))?;

        match connector.sync_activities(database).await {
            Ok(activities_synced) => Ok(SyncResult {
                platform: platform.to_string(),
                success: true,
                activities_synced,
                error_message: None,
                sync_duration_ms: start_time.elapsed().as_millis() as u64,
            }),
            Err(e) => Ok(SyncResult {
                platform: platform.to_string(),
                success: false,
                activities_synced: 0,
                error_message: Some(e.to_string()),
                sync_duration_ms: start_time.elapsed().as_millis() as u64,
            }),
        }
    }

    /// Import activity from file
    pub async fn import_file(&self, file_path: &str, database: &Database) -> Result<ImportResult> {
        let file_extension = std::path::Path::new(file_path)
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("")
            .to_lowercase();

        match file_extension.as_str() {
            "gpx" => self.import_gpx_file(file_path, database).await,
            "fit" => self.import_fit_file(file_path, database).await,
            "tcx" => self.import_tcx_file(file_path, database).await,
            _ => Ok(ImportResult {
                success: false,
                activities_imported: 0,
                file_format: file_extension.clone(),
                error_message: Some(format!("Unsupported file format: {}", file_extension)),
            }),
        }
    }

    /// Import GPX file
    async fn import_gpx_file(&self, file_path: &str, database: &Database) -> Result<ImportResult> {
        use std::fs::File;
        use std::io::BufReader;

        let file = File::open(file_path)?;
        let reader = BufReader::new(file);
        
        match gpx::read(reader) {
            Ok(gpx_data) => {
                let mut activities_imported = 0;

                for track in gpx_data.tracks {
                    if let Some(activity) = self.convert_gpx_track_to_activity(&track)? {
                        database.insert_activity(&activity)?;
                        
                        // Import track points
                        let mut track_points = Vec::new();
                        for segment in &track.segments {
                            for point in &segment.points {
                                if let Some(track_point) = self.convert_gpx_point_to_track_point(&activity.id, point) {
                                    track_points.push(track_point);
                                }
                            }
                        }
                        
                        if !track_points.is_empty() {
                            database.insert_track_points(&track_points)?;
                        }
                        
                        activities_imported += 1;
                    }
                }

                Ok(ImportResult {
                    success: true,
                    activities_imported,
                    file_format: "gpx".to_string(),
                    error_message: None,
                })
            }
            Err(e) => Ok(ImportResult {
                success: false,
                activities_imported: 0,
                file_format: "gpx".to_string(),
                error_message: Some(format!("Failed to parse GPX file: {}", e)),
            }),
        }
    }

    /// Import FIT file (placeholder implementation)
    async fn import_fit_file(&self, _file_path: &str, _database: &Database) -> Result<ImportResult> {
        // TODO: Implement FIT file parsing using fitparser crate
        Ok(ImportResult {
            success: false,
            activities_imported: 0,
            file_format: "fit".to_string(),
            error_message: Some("FIT file import not yet implemented".to_string()),
        })
    }

    /// Import TCX file (placeholder implementation)
    async fn import_tcx_file(&self, _file_path: &str, _database: &Database) -> Result<ImportResult> {
        // TODO: Implement TCX file parsing
        Ok(ImportResult {
            success: false,
            activities_imported: 0,
            file_format: "tcx".to_string(),
            error_message: Some("TCX file import not yet implemented".to_string()),
        })
    }

    /// Export activities to specified format
    pub async fn export_activities(
        &self,
        format: &str,
        activity_ids: &[Uuid],
        output_path: &str,
        database: &Database,
    ) -> Result<ExportResult> {
        match format.to_lowercase().as_str() {
            "gpx" => self.export_to_gpx(activity_ids, output_path, database).await,
            "csv" => self.export_to_csv(activity_ids, output_path, database).await,
            "json" => self.export_to_json(activity_ids, output_path, database).await,
            _ => Ok(ExportResult {
                success: false,
                activities_exported: 0,
                output_file: output_path.to_string(),
                error_message: Some(format!("Unsupported export format: {}", format)),
            }),
        }
    }

    /// Export to GPX format (placeholder)
    async fn export_to_gpx(
        &self,
        _activity_ids: &[Uuid],
        output_path: &str,
        _database: &Database,
    ) -> Result<ExportResult> {
        // TODO: Implement GPX export
        Ok(ExportResult {
            success: false,
            activities_exported: 0,
            output_file: output_path.to_string(),
            error_message: Some("GPX export not yet implemented".to_string()),
        })
    }

    /// Export to CSV format (placeholder)
    async fn export_to_csv(
        &self,
        _activity_ids: &[Uuid],
        output_path: &str,
        _database: &Database,
    ) -> Result<ExportResult> {
        // TODO: Implement CSV export
        Ok(ExportResult {
            success: false,
            activities_exported: 0,
            output_file: output_path.to_string(),
            error_message: Some("CSV export not yet implemented".to_string()),
        })
    }

    /// Export to JSON format (placeholder)
    async fn export_to_json(
        &self,
        _activity_ids: &[Uuid],
        output_path: &str,
        _database: &Database,
    ) -> Result<ExportResult> {
        // TODO: Implement JSON export
        Ok(ExportResult {
            success: false,
            activities_exported: 0,
            output_file: output_path.to_string(),
            error_message: Some("JSON export not yet implemented".to_string()),
        })
    }

    /// Get sync status for all platforms
    pub async fn get_sync_status(&self) -> Result<Vec<SyncStatus>> {
        let mut statuses = Vec::new();
        
        for platform in self.connectors.keys() {
            // TODO: Load actual sync status from database
            statuses.push(SyncStatus {
                platform: platform.clone(),
                last_sync: None,
                last_sync_success: false,
                error_message: None,
                activities_synced: 0,
            });
        }
        
        Ok(statuses)
    }

    /// Store encrypted credentials for a platform
    pub async fn store_credentials(
        &self,
        _platform: String,
        _username: String,
        _credentials_data: Vec<u8>,
        _database: &Database,
    ) -> Result<()> {
        // TODO: Implement credential storage with encryption
        Ok(())
    }

    /// Convert GPX track to Activity
    fn convert_gpx_track_to_activity(&self, track: &gpx::Track) -> Result<Option<Activity>> {
        if track.segments.is_empty() {
            return Ok(None);
        }

        let first_segment = &track.segments[0];
        if first_segment.points.is_empty() {
            return Ok(None);
        }

        let _start_point = &first_segment.points[0];
        // For now, use current time as placeholder since GPX time handling is complex
        let start_time_utc = chrono::Utc::now(); // TODO: Properly handle GPX time conversion

        let mut activity = Activity::new(
            "gpx_import".to_string(),
            "running".to_string(), // Default to running, could be improved with activity detection
            start_time_utc,
        );

        activity.name = track.name.clone();
        
        // Calculate basic statistics from track points
        let mut total_distance = 0.0;
        let mut duration_seconds = 0;
        let mut last_point: Option<&gpx::Waypoint> = None;
        
        for segment in &track.segments {
            for point in &segment.points {
                if let Some(_last) = last_point {
                    // For now, estimate 1 second per point - GPX time handling needs proper implementation
                    duration_seconds += 1;
                    
                    // Calculate distance using Haversine formula (simplified)
                    let lat1 = _last.point().y().to_radians();
                    let lat2 = point.point().y().to_radians();
                    let delta_lat = (point.point().y() - _last.point().y()).to_radians();
                    let delta_lon = (point.point().x() - _last.point().x()).to_radians();
                    
                    let a = (delta_lat / 2.0).sin().powi(2) + 
                            lat1.cos() * lat2.cos() * (delta_lon / 2.0).sin().powi(2);
                    let c = 2.0 * a.sqrt().atan2((1.0 - a).sqrt());
                    let distance = 6371000.0 * c; // Earth radius in meters
                    
                    total_distance += distance;
                }
                last_point = Some(point);
            }
        }

        activity.duration_seconds = duration_seconds;
        activity.distance_meters = Some(total_distance);
        
        if total_distance > 0.0 {
            activity.avg_speed_mps = Some(total_distance / duration_seconds as f64);
        }

        Ok(Some(activity))
    }

    /// Convert GPX waypoint to TrackPoint
    fn convert_gpx_point_to_track_point(&self, activity_id: &Uuid, point: &gpx::Waypoint) -> Option<TrackPoint> {
        // For now, use current time as placeholder - GPX time handling needs proper implementation
        let timestamp = chrono::Utc::now(); // TODO: Properly handle GPX time conversion
        
        let mut track_point = TrackPoint::new(
            *activity_id,
            timestamp,
            point.point().y(),
            point.point().x(),
        );
        
        track_point.altitude_meters = point.elevation;
        
        Some(track_point)
    }
}
