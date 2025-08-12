//! Public API for RunHub Core
//! 
//! This module defines the public interface that Flutter will call through FFI.
//! All functions are async and return Results for proper error handling.

use crate::database::Database;
use crate::models::*;
use crate::sync::SyncEngine;
use anyhow::Result;
use std::path::Path;
use uuid::Uuid;

/// Main API struct that manages database and sync operations
pub struct RunHubCore {
    database: Database,
    sync_engine: SyncEngine,
}

impl RunHubCore {
    /// Initialize RunHub Core with database path
    pub fn new<P: AsRef<Path>>(db_path: P) -> Result<Self> {
        let database = Database::new(db_path)?;
        let sync_engine = SyncEngine::new();
        
        Ok(Self {
            database,
            sync_engine,
        })
    }

    /// Get activities summary for dashboard
    pub async fn get_activities_summary(&self) -> Result<ActivitySummary> {
        self.database.get_activity_summary()
    }

    /// Get list of activities with pagination and filtering
    pub async fn get_activities(
        &self,
        limit: u32,
        offset: u32,
        activity_type: Option<String>,
        source: Option<String>,
    ) -> Result<Vec<Activity>> {
        self.database.get_activities(
            limit,
            offset,
            activity_type.as_deref(),
            source.as_deref(),
        )
    }

    /// Get detailed activity by ID including track points
    pub async fn get_activity_details(&self, activity_id: String) -> Result<ActivityDetails> {
        let id = Uuid::parse_str(&activity_id)?;
        
        let activity = self.database.get_activity(&id)?
            .ok_or_else(|| anyhow::anyhow!("Activity not found: {}", activity_id))?;
        
        let track_points = self.database.get_track_points(&id)?;
        
        Ok(ActivityDetails {
            activity,
            track_points,
        })
    }

    /// Sync data from a specific platform
    pub async fn sync_platform(&self, platform: String) -> Result<SyncResult> {
        self.sync_engine.sync_platform(&platform, &self.database).await
    }

    /// Import activity from file (GPX, FIT, TCX)
    pub async fn import_file(&self, file_path: String) -> Result<ImportResult> {
        self.sync_engine.import_file(&file_path, &self.database).await
    }

    /// Export activities to specified format
    pub async fn export_activities(
        &self,
        format: String,
        activity_ids: Vec<String>,
        output_path: String,
    ) -> Result<ExportResult> {
        let ids: Result<Vec<Uuid>> = activity_ids
            .iter()
            .map(|id| Uuid::parse_str(id).map_err(|e| anyhow::anyhow!("Invalid UUID: {}", e)))
            .collect();
        
        self.sync_engine.export_activities(&format, &ids?, &output_path, &self.database).await
    }

    /// Get sync status for all configured platforms
    pub async fn get_sync_status(&self) -> Result<Vec<SyncStatus>> {
        self.sync_engine.get_sync_status().await
    }

    /// Store encrypted credentials for a platform
    pub async fn store_credentials(
        &self,
        platform: String,
        username: String,
        credentials_data: Vec<u8>,
    ) -> Result<()> {
        self.sync_engine.store_credentials(platform, username, credentials_data, &self.database).await
    }
}

/// Detailed activity information including track points
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ActivityDetails {
    pub activity: Activity,
    pub track_points: Vec<TrackPoint>,
}

/// Result of sync operation
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SyncResult {
    pub platform: String,
    pub success: bool,
    pub activities_synced: u32,
    pub error_message: Option<String>,
    pub sync_duration_ms: u64,
}

/// Result of file import operation
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ImportResult {
    pub success: bool,
    pub activities_imported: u32,
    pub file_format: String,
    pub error_message: Option<String>,
}

/// Result of export operation
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ExportResult {
    pub success: bool,
    pub activities_exported: u32,
    pub output_file: String,
    pub error_message: Option<String>,
}
