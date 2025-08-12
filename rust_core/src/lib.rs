//! RunHub Core - Rust backend for sports data aggregation
//!
//! This library provides the core functionality for RunHub, including:
//! - Data synchronization from various sports platforms
//! - Local database management
//! - Data processing and standardization
//! - File import/export capabilities

pub mod api;
pub mod connectors;
pub mod crypto;
pub mod database;
pub mod models;
pub mod processing;
pub mod sync;

pub use api::*;
pub use models::*;

use anyhow::Result;

/// Initialize the RunHub core library
pub fn init() -> Result<()> {
    env_logger::init();
    log::info!("RunHub Core initialized");
    Ok(())
}

/// Get the library version
pub fn version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_init() {
        assert!(init().is_ok());
    }

    #[test]
    fn test_version() {
        assert!(!version().is_empty());
    }
}
