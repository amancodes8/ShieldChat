/*
 * Crypto Utilities for ShieldChat
 * Uses Web Crypto API for secure client-side encryption.
 */

// Generate a cryptographic key from a password and salt using PBKDF2
export const generateKeyFromPassword = async (password, salt) => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true, // extractable (though we won't export it)
    ["encrypt", "decrypt"]
  );
};

// Encrypt a message using AES-GCM
export const encryptMessage = async (text, key) => {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
  const encodedText = enc.encode(text);

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encodedText
  );

  // Return as JSON string containing IV and ciphertext (base64)
  return JSON.stringify({
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(ciphertext)),
  });
};

// Decrypt a message using AES-GCM
export const decryptMessage = async (encryptedDataString, key) => {
  try {
    const { iv, data } = JSON.parse(encryptedDataString);
    const ivArray = new Uint8Array(iv);
    const dataArray = new Uint8Array(data);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivArray,
      },
      key,
      dataArray
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null; // Return null to indicate failure
  }
};
