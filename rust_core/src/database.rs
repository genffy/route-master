//! Database management for RunHub
//! 
//! This module provides the Data Access Object (DAO) layer for SQLite database operations.
//! It handles all CRUD operations for activities, track points, laps, and user credentials.

use crate::models::*;
use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use rusqlite::{params, Connection, Row};
use std::path::Path;
use uuid::Uuid;

/// Database manager for RunHub
pub struct Database {
    conn: Connection,
}

impl Database {
    /// Create a new database connection and initialize schema
    pub fn new<P: AsRef<Path>>(db_path: P) -> Result<Self> {
        let conn = Connection::open(db_path)
            .context("Failed to open SQLite database")?;
        
        let db = Self { conn };
        db.initialize_schema()?;
        Ok(db)
    }

    /// Initialize database schema with all required tables
    fn initialize_schema(&self) -> Result<()> {
        // Enable foreign key constraints
        self.conn.execute("PRAGMA foreign_keys = ON;", [])?;

        // Activities table
        self.conn.execute(
            r#"
            CREATE TABLE IF NOT EXISTS activities (
                id TEXT PRIMARY KEY,
                source TEXT NOT NULL,
                activity_type TEXT NOT NULL,
                name TEXT,
                start_time_utc TEXT NOT NULL,
                duration_seconds INTEGER NOT NULL,
                distance_meters REAL,
                total_elevation_gain REAL,
                total_elevation_loss REAL,
                avg_heart_rate INTEGER,
                max_heart_rate INTEGER,
                avg_cadence INTEGER,
                max_cadence INTEGER,
                avg_speed_mps REAL,
                max_speed_mps REAL,
                calories INTEGER,
                training_stress_score REAL,
                notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            "#,
            [],
        )?;

        // Track points table
        self.conn.execute(
            r#"
            CREATE TABLE IF NOT EXISTS track_points (
                id TEXT PRIMARY KEY,
                activity_id TEXT NOT NULL,
                timestamp_utc TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                altitude_meters REAL,
                heart_rate INTEGER,
                cadence INTEGER,
                speed_mps REAL,
                power_watts INTEGER,
                temperature_celsius REAL,
                distance_meters REAL,
                FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE
            );
            "#,
            [],
        )?;

        // Laps table
        self.conn.execute(
            r#"
            CREATE TABLE IF NOT EXISTS laps (
                id TEXT PRIMARY KEY,
                activity_id TEXT NOT NULL,
                lap_number INTEGER NOT NULL,
                start_time_utc TEXT NOT NULL,
                duration_seconds INTEGER NOT NULL,
                distance_meters REAL NOT NULL,
                avg_heart_rate INTEGER,
                max_heart_rate INTEGER,
                avg_cadence INTEGER,
                avg_speed_mps REAL NOT NULL,
                max_speed_mps REAL,
                elevation_gain REAL,
                elevation_loss REAL,
                calories INTEGER,
                FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE
            );
            "#,
            [],
        )?;

        // User credentials table (encrypted)
        self.conn.execute(
            r#"
            CREATE TABLE IF NOT EXISTS user_credentials (
                id TEXT PRIMARY KEY,
                platform TEXT NOT NULL UNIQUE,
                username TEXT NOT NULL,
                encrypted_data BLOB NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                last_sync TEXT
            );
            "#,
            [],
        )?;

        // Create indexes for better query performance
        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_activities_start_time ON activities (start_time_utc);",
            [],
        )?;
        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_activities_type ON activities (activity_type);",
            [],
        )?;
        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_track_points_activity ON track_points (activity_id);",
            [],
        )?;
        self.conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_track_points_timestamp ON track_points (timestamp_utc);",
            [],
        )?;

        Ok(())
    }

    /// Insert a new activity
    pub fn insert_activity(&self, activity: &Activity) -> Result<()> {
        self.conn.execute(
            r#"
            INSERT INTO activities (
                id, source, activity_type, name, start_time_utc, duration_seconds,
                distance_meters, total_elevation_gain, total_elevation_loss,
                avg_heart_rate, max_heart_rate, avg_cadence, max_cadence,
                avg_speed_mps, max_speed_mps, calories, training_stress_score,
                notes, created_at, updated_at
            ) VALUES (
                ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20
            )
            "#,
            params![
                activity.id.to_string(),
                activity.source,
                activity.activity_type,
                activity.name,
                activity.start_time_utc.to_rfc3339(),
                activity.duration_seconds,
                activity.distance_meters,
                activity.total_elevation_gain,
                activity.total_elevation_loss,
                activity.avg_heart_rate,
                activity.max_heart_rate,
                activity.avg_cadence,
                activity.max_cadence,
                activity.avg_speed_mps,
                activity.max_speed_mps,
                activity.calories,
                activity.training_stress_score,
                activity.notes,
                activity.created_at.to_rfc3339(),
                activity.updated_at.to_rfc3339(),
            ],
        )?;
        Ok(())
    }

    /// Get activity by ID
    pub fn get_activity(&self, id: &Uuid) -> Result<Option<Activity>> {
        let mut stmt = self.conn.prepare(
            "SELECT * FROM activities WHERE id = ?1"
        )?;

        let activity_iter = stmt.query_map([id.to_string()], |row| {
            Ok(self.row_to_activity(row)?)
        })?;

        for activity in activity_iter {
            return Ok(Some(activity?));
        }
        Ok(None)
    }

    /// Get activities with pagination and filtering
    pub fn get_activities(
        &self,
        limit: u32,
        offset: u32,
        activity_type: Option<&str>,
        source: Option<&str>,
    ) -> Result<Vec<Activity>> {
        let mut query = "SELECT * FROM activities WHERE 1=1".to_string();
        let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

        if let Some(activity_type) = activity_type {
            query.push_str(" AND activity_type = ?");
            params.push(Box::new(activity_type.to_string()));
        }

        if let Some(source) = source {
            query.push_str(" AND source = ?");
            params.push(Box::new(source.to_string()));
        }

        query.push_str(" ORDER BY start_time_utc DESC LIMIT ? OFFSET ?");
        params.push(Box::new(limit));
        params.push(Box::new(offset));

        let mut stmt = self.conn.prepare(&query)?;
        let param_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|p| p.as_ref()).collect();
        
        let activity_iter = stmt.query_map(&param_refs[..], |row| {
            Ok(self.row_to_activity(row)?)
        })?;

        let mut activities = Vec::new();
        for activity in activity_iter {
            activities.push(activity?);
        }
        Ok(activities)
    }

    /// Insert track points in batch for better performance
    pub fn insert_track_points(&self, track_points: &[TrackPoint]) -> Result<()> {
        let tx = self.conn.unchecked_transaction()?;
        
        {
            let mut stmt = tx.prepare(
                r#"
                INSERT INTO track_points (
                    id, activity_id, timestamp_utc, latitude, longitude,
                    altitude_meters, heart_rate, cadence, speed_mps,
                    power_watts, temperature_celsius, distance_meters
                ) VALUES (
                    ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12
                )
                "#,
            )?;

            for point in track_points {
                stmt.execute(params![
                    point.id.to_string(),
                    point.activity_id.to_string(),
                    point.timestamp_utc.to_rfc3339(),
                    point.latitude,
                    point.longitude,
                    point.altitude_meters,
                    point.heart_rate,
                    point.cadence,
                    point.speed_mps,
                    point.power_watts,
                    point.temperature_celsius,
                    point.distance_meters,
                ])?;
            }
        }

        tx.commit()?;
        Ok(())
    }

    /// Get track points for an activity
    pub fn get_track_points(&self, activity_id: &Uuid) -> Result<Vec<TrackPoint>> {
        let mut stmt = self.conn.prepare(
            "SELECT * FROM track_points WHERE activity_id = ?1 ORDER BY timestamp_utc"
        )?;

        let point_iter = stmt.query_map([activity_id.to_string()], |row| {
            Ok(self.row_to_track_point(row)?)
        })?;

        let mut points = Vec::new();
        for point in point_iter {
            points.push(point?);
        }
        Ok(points)
    }

    /// Generate activity summary statistics
    pub fn get_activity_summary(&self) -> Result<ActivitySummary> {
        // Get total counts and aggregates
        let mut stmt = self.conn.prepare(
            r#"
            SELECT 
                COUNT(*) as total_activities,
                COALESCE(SUM(distance_meters), 0) as total_distance,
                SUM(duration_seconds) as total_duration,
                COALESCE(SUM(total_elevation_gain), 0) as total_elevation,
                COALESCE(SUM(calories), 0) as total_calories
            FROM activities
            "#
        )?;

        let summary_row = stmt.query_row([], |row| {
            Ok((
                row.get::<_, u32>(0)?,
                row.get::<_, f64>(1)?,
                row.get::<_, u32>(2)?,
                row.get::<_, f64>(3)?,
                row.get::<_, u32>(4)?,
            ))
        })?;

        // Get activity type statistics
        let mut type_stmt = self.conn.prepare(
            r#"
            SELECT 
                activity_type,
                COUNT(*) as count,
                COALESCE(SUM(distance_meters), 0) as total_distance,
                SUM(duration_seconds) as total_duration,
                COALESCE(AVG(distance_meters), 0) as avg_distance,
                AVG(duration_seconds) as avg_duration
            FROM activities
            GROUP BY activity_type
            ORDER BY count DESC
            "#
        )?;

        let type_iter = type_stmt.query_map([], |row| {
            Ok(ActivityTypeStats {
                activity_type: row.get(0)?,
                count: row.get(1)?,
                total_distance_meters: row.get(2)?,
                total_duration_seconds: row.get(3)?,
                avg_distance_meters: row.get(4)?,
                avg_duration_seconds: row.get(5)?,
            })
        })?;

        let mut activity_types = Vec::new();
        for stat in type_iter {
            activity_types.push(stat?);
        }

        // Get recent activities
        let recent_activities = self.get_activities(10, 0, None, None)?;

        Ok(ActivitySummary {
            total_activities: summary_row.0,
            total_distance_meters: summary_row.1,
            total_duration_seconds: summary_row.2,
            total_elevation_gain: summary_row.3,
            total_calories: summary_row.4,
            activity_types,
            recent_activities,
        })
    }

    /// Helper function to convert database row to Activity
    fn row_to_activity(&self, row: &Row) -> Result<Activity, rusqlite::Error> {
        Ok(Activity {
            id: Uuid::parse_str(&row.get::<_, String>(0)?).map_err(|_| rusqlite::Error::InvalidColumnType(0, "UUID".to_string(), rusqlite::types::Type::Text))?,
            source: row.get(1)?,
            activity_type: row.get(2)?,
            name: row.get(3)?,
            start_time_utc: DateTime::parse_from_rfc3339(&row.get::<_, String>(4)?)
                .map_err(|_| rusqlite::Error::InvalidColumnType(4, "DateTime".to_string(), rusqlite::types::Type::Text))?
                .with_timezone(&Utc),
            duration_seconds: row.get(5)?,
            distance_meters: row.get(6)?,
            total_elevation_gain: row.get(7)?,
            total_elevation_loss: row.get(8)?,
            avg_heart_rate: row.get(9)?,
            max_heart_rate: row.get(10)?,
            avg_cadence: row.get(11)?,
            max_cadence: row.get(12)?,
            avg_speed_mps: row.get(13)?,
            max_speed_mps: row.get(14)?,
            calories: row.get(15)?,
            training_stress_score: row.get(16)?,
            notes: row.get(17)?,
            created_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(18)?)
                .map_err(|_| rusqlite::Error::InvalidColumnType(18, "DateTime".to_string(), rusqlite::types::Type::Text))?
                .with_timezone(&Utc),
            updated_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(19)?)
                .map_err(|_| rusqlite::Error::InvalidColumnType(19, "DateTime".to_string(), rusqlite::types::Type::Text))?
                .with_timezone(&Utc),
        })
    }

    /// Helper function to convert database row to TrackPoint
    fn row_to_track_point(&self, row: &Row) -> Result<TrackPoint, rusqlite::Error> {
        Ok(TrackPoint {
            id: Uuid::parse_str(&row.get::<_, String>(0)?).map_err(|_| rusqlite::Error::InvalidColumnType(0, "UUID".to_string(), rusqlite::types::Type::Text))?,
            activity_id: Uuid::parse_str(&row.get::<_, String>(1)?).map_err(|_| rusqlite::Error::InvalidColumnType(1, "UUID".to_string(), rusqlite::types::Type::Text))?,
            timestamp_utc: DateTime::parse_from_rfc3339(&row.get::<_, String>(2)?)
                .map_err(|_| rusqlite::Error::InvalidColumnType(2, "DateTime".to_string(), rusqlite::types::Type::Text))?
                .with_timezone(&Utc),
            latitude: row.get(3)?,
            longitude: row.get(4)?,
            altitude_meters: row.get(5)?,
            heart_rate: row.get(6)?,
            cadence: row.get(7)?,
            speed_mps: row.get(8)?,
            power_watts: row.get(9)?,
            temperature_celsius: row.get(10)?,
            distance_meters: row.get(11)?,
        })
    }
}
