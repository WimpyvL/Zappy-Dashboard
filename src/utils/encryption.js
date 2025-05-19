/**
 * Encryption utilities for secure messaging
 * 
 * This module provides functions for encrypting and decrypting sensitive message content
 * using the Web Crypto API with AES-GCM encryption.
 */

// The encryption key is derived from an environment variable or a default value
// In a production environment, this should be securely managed and not hardcoded
const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'zappy-secure-messaging-encryption-key';

/**
 * Convert a string to an ArrayBuffer
 * @param {string} str - String to convert
 * @returns {ArrayBuffer} - Resulting ArrayBuffer
 */
function stringToArrayBuffer(str) {
  return new TextEncoder().encode(str);
}

/**
 * Convert an ArrayBuffer to a string
 * @param {ArrayBuffer} buffer - ArrayBuffer to convert
 * @returns {string} - Resulting string
 */
function arrayBufferToString(buffer) {
  return new TextDecoder().decode(buffer);
}

/**
 * Convert an ArrayBuffer to a Base64 string
 * @param {ArrayBuffer} buffer - ArrayBuffer to convert
 * @returns {string} - Base64 string
 */
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert a Base64 string to an ArrayBuffer
 * @param {string} base64 - Base64 string to convert
 * @returns {ArrayBuffer} - Resulting ArrayBuffer
 */
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Derive an encryption key from a password
 * @param {string} password - Password to derive key from
 * @returns {Promise<CryptoKey>} - Derived key
 */
async function deriveKey(password) {
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    stringToArrayBuffer(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Use a salt based on the application name
  const salt = stringToArrayBuffer('zappy-telehealth-messaging');

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt a message
 * @param {string} message - Message to encrypt
 * @returns {Promise<string>} - Encrypted message in format: base64(iv):base64(ciphertext)
 */
export async function encryptMessage(message) {
  try {
    const key = await deriveKey(ENCRYPTION_KEY);
    
    // Generate a random initialization vector
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the message
    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      stringToArrayBuffer(message)
    );
    
    // Format the result as base64(iv):base64(ciphertext)
    return `${arrayBufferToBase64(iv)}:${arrayBufferToBase64(ciphertext)}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
}

/**
 * Decrypt a message
 * @param {string} encryptedMessage - Encrypted message in format: base64(iv):base64(ciphertext)
 * @returns {Promise<string>} - Decrypted message
 */
export async function decryptMessage(encryptedMessage) {
  try {
    // Split the encrypted message into IV and ciphertext
    const [ivBase64, ciphertextBase64] = encryptedMessage.split(':');
    
    if (!ivBase64 || !ciphertextBase64) {
      throw new Error('Invalid encrypted message format');
    }
    
    const iv = base64ToArrayBuffer(ivBase64);
    const ciphertext = base64ToArrayBuffer(ciphertextBase64);
    
    // Derive the key
    const key = await deriveKey(ENCRYPTION_KEY);
    
    // Decrypt the message
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: new Uint8Array(iv)
      },
      key,
      ciphertext
    );
    
    return arrayBufferToString(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt message');
  }
}

/**
 * Check if the Web Crypto API is available
 * @returns {boolean} - Whether encryption is available
 */
export function isEncryptionAvailable() {
  return window.crypto && window.crypto.subtle;
}
