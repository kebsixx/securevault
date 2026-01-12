// Utility to encode/decode
const enc = new TextEncoder();
const dec = new TextDecoder();

const getPasswordKey = (password: string) =>
  window.crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveKey",
  ]);

// Fix: Relax keyUsage type to allow single usage arrays like ["encrypt"] or ["decrypt"]
const deriveKey = (
  passwordKey: CryptoKey,
  salt: Uint8Array,
  keyUsage: ("encrypt" | "decrypt")[]
) =>
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

export const encryptData = async (
  data: string,
  password: string
): Promise<{ ciphertext: string; iv: string; salt: string }> => {
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

// Password Strength Checker
export const evaluatePasswordStrength = (
  password: string
): { score: number; label: string; color: string; feedback: string[] } => {
  let score = 0;
  const feedback: string[] = [];

  // Length checks
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  // Generate feedback
  if (password.length < 8) feedback.push("Use at least 8 characters");
  if (!/[A-Z]/.test(password)) feedback.push("Add uppercase letters");
  if (!/[0-9]/.test(password)) feedback.push("Add numbers");
  if (!/[^a-zA-Z0-9]/.test(password))
    feedback.push("Add special characters (!@#$%^&*)");

  // Normalize score to 0-5
  const normalizedScore = Math.min(Math.ceil(score / 1.4), 5);

  const levels = [
    { score: 0, label: "Very Weak", color: "bg-red-500" },
    { score: 1, label: "Weak", color: "bg-orange-500" },
    { score: 2, label: "Fair", color: "bg-yellow-500" },
    { score: 3, label: "Good", color: "bg-blue-500" },
    { score: 4, label: "Strong", color: "bg-green-500" },
    { score: 5, label: "Very Strong", color: "bg-green-600" },
  ];

  const level = levels[normalizedScore];

  return {
    score: normalizedScore,
    label: level.label,
    color: level.color,
    feedback,
  };
};

// Validate JSON structure for import
export const validateEncryptedExport = (data: unknown): boolean => {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.data === "string" &&
    typeof obj.iv === "string" &&
    typeof obj.salt === "string" &&
    typeof obj.version === "number"
  );
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

// URL Validation
export const isValidURL = (urlString: string): boolean => {
  if (!urlString) return true; // Optional field
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
};

// File Size Validation (in MB)
export const validateFileSize = (
  file: File,
  maxSizeMB: number = 5
): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

// Get file size in MB
export const getFileSizeMB = (file: File): number => {
  return file.size / (1024 * 1024);
};

// Password Generator
interface PasswordGeneratorOptions {
  length: number;
  useUppercase: boolean;
  useLowercase: boolean;
  useNumbers: boolean;
  useSymbols: boolean;
}

export const generatePassword = (options: PasswordGeneratorOptions): string => {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*_+-=()[]{}|;:,.<>?";

  let chars = "";
  if (options.useUppercase) chars += uppercase;
  if (options.useLowercase) chars += lowercase;
  if (options.useNumbers) chars += numbers;
  if (options.useSymbols) chars += symbols;

  // If no character types selected, use default
  if (chars === "") {
    chars = uppercase + lowercase + numbers;
  }

  let password = "";
  const charArray = new Uint8Array(options.length);
  window.crypto.getRandomValues(charArray);

  for (let i = 0; i < options.length; i++) {
    password += chars[charArray[i] % chars.length];
  }

  // Ensure at least one character from each enabled type
  const ensureCharacters = [];
  if (options.useUppercase) ensureCharacters.push(uppercase);
  if (options.useLowercase) ensureCharacters.push(lowercase);
  if (options.useNumbers) ensureCharacters.push(numbers);
  if (options.useSymbols) ensureCharacters.push(symbols);

  if (ensureCharacters.length > 0) {
    const passwordArray = password.split("");
    ensureCharacters.forEach((charSet, index) => {
      const randomIndex = Math.floor(Math.random() * passwordArray.length);
      const randomChar = charSet[Math.floor(Math.random() * charSet.length)];
      passwordArray[randomIndex] = randomChar;
    });
    password = passwordArray.join("");
  }

  return password;
};

export type { PasswordGeneratorOptions };
