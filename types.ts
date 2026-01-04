export interface PasswordEntry {
  id: string;
  label: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  createdAt: number;
}

export interface EncryptedExport {
  data: string; // Base64 ciphertext
  iv: string; // Base64 IV
  salt: string; // Base64 Salt
  version: number;
}
