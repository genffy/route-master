//! Cryptography utilities for secure credential storage
//!
//! This module provides encryption/decryption functionality for storing
//! user credentials securely on the local device.

use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use anyhow::Result;
use argon2::{
    password_hash::{rand_core::RngCore, SaltString},
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
};
// use rand::RngCore as _; // Commented out as not used directly
use serde::{Deserialize, Serialize};

/// Encrypted data container
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptedData {
    pub nonce: Vec<u8>,
    pub ciphertext: Vec<u8>,
    pub salt: Vec<u8>,
}

/// Credential data to be encrypted
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CredentialData {
    pub access_token: Option<String>,
    pub refresh_token: Option<String>,
    pub session_cookies: Option<String>,
    pub password: Option<String>,
    pub additional_data: std::collections::HashMap<String, String>,
}

/// Cryptography manager for secure operations
pub struct CryptoManager;

impl CryptoManager {
    /// Create new crypto manager
    pub fn new() -> Self {
        Self
    }

    /// Encrypt credential data using AES-256-GCM with a user-provided master password
    pub fn encrypt_credentials(
        &self,
        data: &CredentialData,
        master_password: &str,
    ) -> Result<EncryptedData> {
        // Generate random salt
        let mut salt = [0u8; 32];
        OsRng.fill_bytes(&mut salt);
        let salt_string = SaltString::encode_b64(&salt)
            .map_err(|e| anyhow::anyhow!("Failed to encode salt: {:?}", e))?;

        // Derive key from master password using Argon2
        let argon2 = Argon2::default();
        let password_hash = argon2
            .hash_password(master_password.as_bytes(), &salt_string)
            .map_err(|e| anyhow::anyhow!("Failed to hash password: {:?}", e))?;

        // Extract the hash as the encryption key
        let hash_output = password_hash
            .hash
            .ok_or_else(|| anyhow::anyhow!("Failed to get hash"))?;
        let key_bytes = hash_output.as_bytes();
        let key = &key_bytes[..32]; // Take first 32 bytes for AES-256

        // Serialize credential data
        let plaintext = serde_json::to_vec(data)
            .map_err(|e| anyhow::anyhow!("Failed to serialize credential data: {}", e))?;

        // Generate random nonce
        let mut nonce_bytes = [0u8; 12];
        OsRng.fill_bytes(&mut nonce_bytes);
        let nonce = Nonce::from_slice(&nonce_bytes);

        // Encrypt data
        let cipher = Aes256Gcm::new_from_slice(key)
            .map_err(|e| anyhow::anyhow!("Invalid key length: {:?}", e))?;
        let ciphertext = cipher
            .encrypt(nonce, plaintext.as_ref())
            .map_err(|e| anyhow::anyhow!("Encryption failed: {}", e))?;

        Ok(EncryptedData {
            nonce: nonce_bytes.to_vec(),
            ciphertext,
            salt: salt.to_vec(),
        })
    }

    /// Decrypt credential data using the master password
    pub fn decrypt_credentials(
        &self,
        encrypted_data: &EncryptedData,
        master_password: &str,
    ) -> Result<CredentialData> {
        // Recreate salt string
        let salt_string = SaltString::encode_b64(&encrypted_data.salt)
            .map_err(|e| anyhow::anyhow!("Failed to encode salt: {:?}", e))?;

        // Derive key from master password
        let argon2 = Argon2::default();
        let password_hash = argon2
            .hash_password(master_password.as_bytes(), &salt_string)
            .map_err(|e| anyhow::anyhow!("Failed to hash password: {:?}", e))?;

        let hash_output = password_hash
            .hash
            .ok_or_else(|| anyhow::anyhow!("Failed to get hash"))?;
        let key_bytes = hash_output.as_bytes();
        let key = &key_bytes[..32];

        // Decrypt data
        let nonce = Nonce::from_slice(&encrypted_data.nonce);
        let cipher = Aes256Gcm::new_from_slice(key)
            .map_err(|e| anyhow::anyhow!("Invalid key length: {:?}", e))?;

        let plaintext = cipher
            .decrypt(nonce, encrypted_data.ciphertext.as_ref())
            .map_err(|e| anyhow::anyhow!("Decryption failed: {}", e))?;

        // Deserialize credential data
        let credential_data: CredentialData = serde_json::from_slice(&plaintext)
            .map_err(|e| anyhow::anyhow!("Failed to deserialize credential data: {}", e))?;

        Ok(credential_data)
    }

    /// Generate a secure random master password
    pub fn generate_master_password(&self, length: usize) -> String {
        const CHARSET: &[u8] =
            b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        let mut rng = OsRng;
        let mut password = String::with_capacity(length);

        for _ in 0..length {
            let idx = (rng.next_u32() as usize) % CHARSET.len();
            password.push(CHARSET[idx] as char);
        }

        password
    }

    /// Verify master password against stored hash
    pub fn verify_master_password(&self, password: &str, hash: &str) -> Result<bool> {
        let parsed_hash = PasswordHash::new(hash)
            .map_err(|e| anyhow::anyhow!("Invalid password hash format: {:?}", e))?;
        let argon2 = Argon2::default();

        match argon2.verify_password(password.as_bytes(), &parsed_hash) {
            Ok(()) => Ok(true),
            Err(_) => Ok(false),
        }
    }

    /// Hash master password for storage
    pub fn hash_master_password(&self, password: &str) -> Result<String> {
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();

        let password_hash = argon2
            .hash_password(password.as_bytes(), &salt)
            .map_err(|e| anyhow::anyhow!("Failed to hash password: {:?}", e))?;

        Ok(password_hash.to_string())
    }
}

impl Default for CryptoManager {
    fn default() -> Self {
        Self::new()
    }
}

impl CredentialData {
    /// Create new empty credential data
    pub fn new() -> Self {
        Self {
            access_token: None,
            refresh_token: None,
            session_cookies: None,
            password: None,
            additional_data: std::collections::HashMap::new(),
        }
    }

    /// Add additional custom data
    pub fn add_data(&mut self, key: String, value: String) {
        self.additional_data.insert(key, value);
    }

    /// Get additional data by key
    pub fn get_data(&self, key: &str) -> Option<&String> {
        self.additional_data.get(key)
    }
}

impl Default for CredentialData {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt_credentials() {
        let crypto = CryptoManager::new();
        let master_password = "test_password_123!";

        let mut credentials = CredentialData::new();
        credentials.access_token = Some("test_token".to_string());
        credentials.password = Some("user_password".to_string());
        credentials.add_data("platform_id".to_string(), "garmin".to_string());

        // Encrypt
        let encrypted = crypto
            .encrypt_credentials(&credentials, master_password)
            .unwrap();

        // Decrypt
        let decrypted = crypto
            .decrypt_credentials(&encrypted, master_password)
            .unwrap();

        assert_eq!(credentials.access_token, decrypted.access_token);
        assert_eq!(credentials.password, decrypted.password);
        assert_eq!(
            credentials.get_data("platform_id"),
            decrypted.get_data("platform_id")
        );
    }

    #[test]
    fn test_master_password_verification() {
        let crypto = CryptoManager::new();
        let password = "secure_password_123!";

        let hash = crypto.hash_master_password(password).unwrap();
        assert!(crypto.verify_master_password(password, &hash).unwrap());
        assert!(!crypto
            .verify_master_password("wrong_password", &hash)
            .unwrap());
    }

    #[test]
    fn test_generate_master_password() {
        let crypto = CryptoManager::new();
        let password = crypto.generate_master_password(16);

        assert_eq!(password.len(), 16);
        assert!(password.chars().all(|c| c.is_ascii()));
    }
}
