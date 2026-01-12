import React, { useState, useEffect } from "react";
import { PasswordEntry, EncryptedExport } from "./types";
import { encryptData, decryptData, generateId } from "./services/crypto";
import { Modal } from "./components/Common";
import {
  Plus,
  Search,
  LogOut,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Shield,
  KeyRound,
  User,
  ExternalLink,
  AlertTriangle,
  FileKey,
  HelpCircle,
} from "lucide-react";

export default function App() {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Confirm Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    show: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Add/Edit Form State
  const [formData, setFormData] = useState<Partial<PasswordEntry>>({});

  // Import/Export Password State
  const [filePassword, setFilePassword] = useState("");

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState("");

  // Success Notification State
  const [successNotif, setSuccessNotif] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // UI State
  const [showPasswordMap, setShowPasswordMap] = useState<
    Record<string, boolean>
  >({});

  // 1. Warning on Tab Close/Reload (Data is volatile)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only warn if there are passwords to lose
      if (passwords.length > 0) {
        const message =
          "All passwords will be deleted. Please ensure you have exported your data!";
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [passwords]);

  const handleAddPassword = () => {
    if (!formData.label || !formData.password) return;

    const newEntry: PasswordEntry = {
      id: generateId(),
      label: formData.label,
      username: formData.username || "",
      password: formData.password,
      url: formData.url || "",
      notes: formData.notes || "",
      createdAt: Date.now(),
    };

    // Save only to Memory (State)
    setPasswords((prev) => [...prev, newEntry]);
    setFormData({});
    setIsAddOpen(false);
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({
      show: true,
      title: "Delete Password",
      message:
        "Are you sure you want to delete this password? This action cannot be undone.",
      onConfirm: () => {
        setPasswords((prev) => prev.filter((p) => p.id !== id));
        setConfirmDialog({
          show: false,
          title: "",
          message: "",
          onConfirm: () => {},
        });
      },
    });
  };

  const toggleShowPassword = (id: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const showNotification = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setSuccessNotif({ show: true, message, type });
    setTimeout(
      () => setSuccessNotif({ show: false, message: "", type: "success" }),
      4000
    );
  };

  // --- EXPORT LOGIC ---
  const handleExport = async () => {
    if (!filePassword) {
      showNotification("Please enter a password to encrypt the file.", "error");
      return;
    }

    try {
      const encrypted = await encryptData(
        JSON.stringify(passwords),
        filePassword
      );
      const exportData: EncryptedExport = {
        data: encrypted.ciphertext,
        iv: encrypted.iv,
        salt: encrypted.salt,
        version: 1,
      };

      const blob = new Blob([JSON.stringify(exportData)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `secure_vault_export_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setIsExportOpen(false);
      setFilePassword("");
    } catch (e) {
      console.error("Export failed", e);
      showNotification("Export encryption failed.", "error");
    }
  };

  // --- IMPORT LOGIC ---
  const handleImport = async () => {
    if (!importFile) return;
    if (!filePassword) {
      setImportStatus("Please enter the decryption password.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsed: EncryptedExport = JSON.parse(content);

        // Decrypt using the provided password
        const decryptedJson = await decryptData(
          parsed.data,
          parsed.iv,
          parsed.salt,
          filePassword
        );
        const importedPasswords: PasswordEntry[] = JSON.parse(decryptedJson);

        setConfirmDialog({
          show: true,
          title: "Import Passwords",
          message: `Found ${importedPasswords.length} password(s). Add to current session?`,
          onConfirm: () => {
            const currentIds = new Set(passwords.map((p) => p.id));
            const toAdd = importedPasswords.filter(
              (p) => !currentIds.has(p.id)
            );
            setPasswords((prev) => [...prev, ...toAdd]);
            setIsImportOpen(false);
            setImportStatus("");
            setFilePassword("");
            setImportFile(null);
            showNotification(
              `✅ Successfully imported ${toAdd.length} new password(s).`
            );
            setConfirmDialog({
              show: false,
              title: "",
              message: "",
              onConfirm: () => {},
            });
          },
        });
      } catch (err) {
        console.error(err);
        setImportStatus("Incorrect password or invalid file format.");
      }
    };
    reader.readAsText(importFile);
  };

  const filteredPasswords = passwords.filter(
    (p) =>
      p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Success/Error Notification Toast */}
      {successNotif.show && (
        <div
          className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-lg shadow-lg border-l-4 animate-in slide-in-from-right fade-in duration-300 max-w-sm ${
            successNotif.type === "success"
              ? "bg-green-50 border-green-500 text-green-800"
              : "bg-red-50 border-red-500 text-red-800"
          }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {successNotif.type === "success" ? "✅" : "❌"}
            </span>
            <p className="font-medium text-sm">{successNotif.message}</p>
          </div>
        </div>
      )}

      {/* Custom Confirm Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl transform transition-all scale-100 border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {confirmDialog.title}
            </h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {confirmDialog.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setConfirmDialog({
                    show: false,
                    title: "",
                    message: "",
                    onConfirm: () => {},
                  })
                }
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <Shield size={28} />
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              SecureVault
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-red-500 font-medium bg-red-50 px-1.5 py-0.5 rounded uppercase">
                Volatile Session
              </span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Reset Session">
              <LogOut size={20} />
            </button>
            <button
              onClick={() => setIsTutorialOpen(true)}
              className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              title="Help & Tutorial">
              <HelpCircle size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-start sm:items-center">
          <div className="relative w-full sm:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search session..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setIsImportOpen(true);
                setFilePassword("");
                setImportFile(null);
                setImportStatus("");
              }}
              className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex text-sm font-medium">
              <Upload size={16} /> Import
            </button>
            <button
              onClick={() => {
                setIsExportOpen(true);
                setFilePassword("");
              }}
              className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm flex text-sm font-medium">
              <Download size={16} /> Export
            </button>
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex text-sm font-medium">
              <Plus size={18} /> Add New
            </button>
          </div>
        </div>

        {/* Warning Banner if data exists */}
        {passwords.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-3">
            <AlertTriangle
              className="text-yellow-600 shrink-0 mt-0.5"
              size={18}
            />
            <div className="text-sm text-yellow-800">
              <strong>Warning:</strong> Passwords are only stored in this
              browser tab. If you refresh or close this tab without exporting,
              your data will be permanently deleted.
            </div>
          </div>
        )}

        {/* Password Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {filteredPasswords.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
              <Shield size={48} className="mb-4 opacity-20" />
              <p>Session vault is empty.</p>
              <p className="text-sm">Import a file or add a new password.</p>
            </div>
          ) : (
            filteredPasswords.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-lg uppercase">
                      {entry.label.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 leading-tight">
                        {entry.label}
                      </h3>
                      {entry.url && (
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-gray-500 hover:text-indigo-600 flex items-center gap-1 mt-0.5">
                          {new URL(entry.url).hostname}{" "}
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600 overflow-hidden">
                      <User size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">
                        {entry.username || "No username"}
                      </span>
                    </div>
                    {entry.username && (
                      <button
                        onClick={() => copyToClipboard(entry.username!)}
                        className="text-gray-400 hover:text-gray-600 p-1">
                        <Copy size={14} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600 overflow-hidden flex-1">
                      <KeyRound
                        size={14}
                        className="text-gray-400 flex-shrink-0"
                      />
                      <span className="truncate font-mono">
                        {showPasswordMap[entry.id]
                          ? entry.password
                          : "••••••••••••"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleShowPassword(entry.id)}
                        className="text-gray-400 hover:text-gray-600 p-1">
                        {showPasswordMap[entry.id] ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(entry.password!)}
                        className="text-gray-400 hover:text-gray-600 p-1">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* --- MODALS --- */}

      {/* Add Password Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Password">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">
              Label
            </label>
            <input
              autoFocus
              className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-indigo-500/50 outline-none"
              placeholder="e.g. Gmail"
              value={formData.label || ""}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">
              Username / Email
            </label>
            <input
              className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-indigo-500/50 outline-none"
              placeholder="user@example.com"
              value={formData.username || ""}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-indigo-500/50 outline-none"
                placeholder="********"
                value={formData.password || ""}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <button
                onClick={() =>
                  setFormData({
                    ...formData,
                    password: Math.random().toString(36).slice(-10) + "A1!",
                  })
                }
                className="absolute right-2 top-1/2 mt-0.5 -translate-y-1/2 text-xs text-indigo-600 font-medium hover:underline">
                Generate
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">
              URL (Optional)
            </label>
            <input
              className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-indigo-500/50 outline-none"
              placeholder="https://..."
              value={formData.url || ""}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
            />
          </div>
          <button
            onClick={handleAddPassword}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-medium mt-4">
            Add to Session
          </button>
        </div>
      </Modal>

      {/* Export Modal - Password Protected */}
      <Modal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Export Passwords">
        <div className="space-y-4">
          <div className="text-center py-2">
            <div className="inline-block p-3 bg-indigo-100 rounded-full text-indigo-600 mb-4">
              <FileKey size={32} />
            </div>
            <p className="text-gray-600 mb-4">
              Protect your export file with a password.
            </p>

            <div className="text-left mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                Encryption Password
              </label>
              <input
                type="password"
                autoFocus
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500/50 outline-none bg-gray-50"
                placeholder="Enter a strong password..."
                value={filePassword}
                onChange={(e) => setFilePassword(e.target.value)}
              />
              <p className="text-[10px] text-gray-400 mt-1">
                You will need this password to import the file later.
              </p>
            </div>

            <button
              onClick={handleExport}
              className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center gap-2">
              <Download size={18} />
              Encrypt & Download
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Modal - Password Protected */}
      <Modal
        isOpen={isImportOpen}
        onClose={() => {
          setIsImportOpen(false);
          setImportFile(null);
          setImportStatus("");
        }}
        title="Import Vault">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <Upload size={24} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 font-medium truncate px-2">
              {importFile ? importFile.name : "Click to select .json file"}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
              Decryption Password
            </label>
            <input
              type="password"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500/50 outline-none bg-gray-50"
              placeholder="Enter the password for this file..."
              value={filePassword}
              onChange={(e) => setFilePassword(e.target.value)}
            />
          </div>

          {importStatus && (
            <p className="text-red-500 text-sm bg-red-50 p-2 rounded text-center">
              {importStatus}
            </p>
          )}

          <button
            onClick={handleImport}
            disabled={!importFile}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium mt-2">
            Decrypt & Import
          </button>
        </div>
      </Modal>

      {/* Tutorial Modal */}
      <Modal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        title="📚 Tutorial Penggunaan SecureVault">
        <div className="space-y-6 max-h-96 overflow-y-auto">
          <div>
            <h3 className="font-bold text-indigo-600 mb-2">
              ℹ️ Apa itu SecureVault?
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              SecureVault adalah aplikasi vault kata sandi yang berjalan 100%
              offline di browser Anda. Data hanya disimpan di memori tab
              ini—jika Anda refresh atau tutup tab, semua data akan hilang.
              Selalu ekspor data sebelum menutup!
            </p>
          </div>

          <div>
            <h3 className="font-bold text-indigo-600 mb-2">
              ✅ Menambah Kata Sandi Baru
            </h3>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>
                Klik tombol <strong>+ Add New</strong>
              </li>
              <li>
                Isi <strong>Label</strong> (mis. Gmail, Bank)
              </li>
              <li>
                Isi <strong>Username/Email</strong>
              </li>
              <li>
                Masukkan <strong>Password</strong> atau klik{" "}
                <strong>Generate</strong> untuk membuat otomatis
              </li>
              <li>
                Klik <strong>Add to Session</strong>
              </li>
            </ol>
          </div>

          <div>
            <h3 className="font-bold text-indigo-600 mb-2">
              🔍 Mencari & Melihat Kata Sandi
            </h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Gunakan kotak pencarian untuk cari label atau username</li>
              <li>• Klik ikon mata (👁) untuk tampilkan/sembunyikan password</li>
              <li>• Klik ikon copy untuk salin ke clipboard</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-indigo-600 mb-2">
              💾 Ekspor Data (SANGAT PENTING!)
            </h3>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>
                Klik tombol <strong>Export</strong>
              </li>
              <li>
                Masukkan kata sandi <strong>kuat</strong> untuk enkripsi file
              </li>
              <li>
                Klik <strong>Encrypt & Download</strong>
              </li>
              <li>
                Simpan file di tempat aman (folder Documents, cloud storage,
                USB)
              </li>
            </ol>
            <p className="text-xs text-red-600 mt-2 font-medium">
              ⚠️ Jangan lupa password enkripsi Anda!
            </p>
          </div>

          <div>
            <h3 className="font-bold text-indigo-600 mb-2">
              📥 Impor Data dari File Backup
            </h3>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>
                Klik tombol <strong>Import</strong>
              </li>
              <li>Pilih file `.json` hasil ekspor sebelumnya</li>
              <li>Masukkan kata sandi enkripsi file</li>
              <li>
                Klik <strong>Decrypt & Import</strong>
              </li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
            <p className="text-xs text-yellow-800 font-medium">
              ⚠️ <strong>Tips Keamanan:</strong> Data hanya ada di tab ini.
              Selalu backup sebelum menutup. Gunakan password ekspor yang kuat
              dan simpan di tempat aman.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
