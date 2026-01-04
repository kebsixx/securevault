// Utility to encode/decode
const enc = new TextEncoder();
const dec = new TextDecoder();

const getPasswordKey = (password: string) =>
  window.crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);

// Fix: Relax keyUsage type to allow single usage arrays like ["encrypt"] or ["decrypt"]
const deriveKey = (passwordKey: CryptoKey, salt: Uint8Array, keyUsage: ("encrypt" | "decrypt")[]) =>
  window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    keyUsage
  );

export const encryptData = async (data: string, password: string): Promise<{ ciphertext: string; iv: string; salt: string }> => {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const passwordKey = await getPasswordKey(password);
  const aesKey = await deriveKey(passwordKey, salt, ["encrypt"]);

  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    aesKey,
    enc.encode(data)
  );

  return {
    ciphertext: bufferToBase64(encryptedContent),
    iv: bufferToBase64(iv),
    salt: bufferToBase64(salt),
  };
};

export const decryptData = async (
  ciphertextB64: string,
  ivB64: string,
  saltB64: string,
  password: string
): Promise<string> => {
  try {
    const salt = base64ToBuffer(saltB64);
    const iv = base64ToBuffer(ivB64);
    const ciphertext = base64ToBuffer(ciphertextB64);

    const passwordKey = await getPasswordKey(password);
    const aesKey = await deriveKey(passwordKey, salt, ["decrypt"]);

    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      aesKey,
      ciphertext
    );

    return dec.decode(decryptedContent);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Invalid password or corrupted data");
  }
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Helpers
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToBuffer(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}