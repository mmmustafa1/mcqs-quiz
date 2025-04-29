/**
 * Secure storage utility for sensitive data like API keys
 * Uses a simple encryption method before storing in localStorage
 */

// Simple encryption key - in production this would ideally be more secure
const ENCRYPTION_KEY = 'answer-arena-secure-storage-key';

/**
 * Simple encryption function
 * Note: This is not production-grade encryption, just obfuscation
 */
const encrypt = (text: string): string => {
  const textToChars = (text: string) => text.split('').map(c => c.charCodeAt(0));
  const byteHex = (n: number) => ("0" + Number(n).toString(16)).substr(-2);
  
  const keyChars = textToChars(ENCRYPTION_KEY);
  
  return textToChars(text).map((c, i) => {
    return byteHex(c ^ keyChars[i % keyChars.length]);
  }).join('');
};

/**
 * Simple decryption function
 */
const decrypt = (encoded: string): string => {
  const textToChars = (text: string) => text.split('').map(c => c.charCodeAt(0));
  const keyChars = textToChars(ENCRYPTION_KEY);
  
  return encoded.match(/.{1,2}/g)?.map((hex, i) => {
    return String.fromCharCode(parseInt(hex, 16) ^ keyChars[i % keyChars.length]);
  }).join('') || '';
};

// Storage keys
const KEYS = {
  GOOGLE_API_KEY: 'google_api_key',
};

// Secure storage API
export const secureStorage = {
  // Save API key to localStorage with encryption
  saveApiKey: (apiKey: string): void => {
    if (!apiKey) return;
    localStorage.setItem(KEYS.GOOGLE_API_KEY, encrypt(apiKey));
  },

  // Get API key from localStorage with decryption
  getApiKey: (): string => {
    const encryptedKey = localStorage.getItem(KEYS.GOOGLE_API_KEY);
    return encryptedKey ? decrypt(encryptedKey) : '';
  },

  // Clear API key from localStorage
  clearApiKey: (): void => {
    localStorage.removeItem(KEYS.GOOGLE_API_KEY);
  },

  // Check if API key exists
  hasApiKey: (): boolean => {
    return !!localStorage.getItem(KEYS.GOOGLE_API_KEY);
  }
};
