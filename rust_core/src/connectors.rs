//! Platform connectors for syncing data from external services
//! 
//! This module defines the connector interface and implementations for
//! various sports platforms like Garmin, Coros, etc.

pub mod garmin;
pub mod coros;

pub use garmin::GarminConnector;
pub use coros::CorosConnector;

use crate::database::Database;
use anyhow::Result;
use async_trait::async_trait;

/// Trait that all platform connectors must implement
#[async_trait]
pub trait ConnectorTrait {
    /// Get the platform name
    fn platform_name(&self) -> &str;

    /// Sync activities from the platform
    async fn sync_activities(&self, database: &Database) -> Result<u32>;

    /// Check if credentials are configured
    async fn has_credentials(&self) -> Result<bool>;

    /// Test connection to the platform
    async fn test_connection(&self) -> Result<bool>;
}
