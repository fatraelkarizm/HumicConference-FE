import React, { useEffect, useRef, useState } from "react";

export type Admin = {
  id: string;
  fullName: string;
  email: string;
  role: "Admin ICICyTA" | "Admin ICoDSA" | string;
  createdAt?: string;
};

type AdminModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: { fullName: string; email: string; password?: string; role: string }, id?: string) => void;
  initialData?: Admin | null;
  mode?: "create" | "edit";
};

export default function AdminModal({ open, onClose, onSave, initialData = null, mode = "create" }: AdminModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<Admin["role"]>("");
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && initialData) {
      setFullName(initialData.fullName || "");
      setEmail(initialData.email || "");
      setRole(initialData.role || "");
      // Clear password fields on edit view
      setPassword("");
      setConfirm("");
    }
    if (!open) {
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirm("");
      setRole("");
    }
  }, [open, initialData]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();

    if (!fullName.trim()) {
      alert("Nama lengkap harus diisi.");
      return;
    }
    if (!email.trim()) {
      alert("Email harus diisi.");
      return;
    }
    if (mode === "create") {
      if (!password) {
        alert("Password harus diisi.");
        return;
      }
      if (password !== confirm) {
        alert("Password dan konfirmasi tidak cocok.");
        return;
      }
    } else if (mode === "edit" && password) {
      // if editing and user provided a new password, check confirm
      if (password !== confirm) {
        alert("Password dan konfirmasi tidak cocok.");
        return;
      }
    }

    onSave({ fullName: fullName.trim(), email: email.trim(), password: password || undefined, role }, initialData?.id);
    onClose();
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-6"
      onMouseDown={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-lg bg-white shadow-lg ring-1 ring-black/5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900">{mode === "create" ? "Create Admin" : "Edit Admin"}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded p-1" aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600">Name Full <span className="text-red-500">*</span></label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-md border text-black border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Enter your name full"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border text-black border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Enter your email address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Password {mode === "create" && <span className="text-red-500">*</span>}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-md border text-black border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder={mode === "create" ? "create password" : "leave blank to keep existing"}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600">Konfirmasi Password {mode === "create" && <span className="text-red-500">*</span>}</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="mt-1 w-full rounded-md border text-black border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="confirm password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Peran (Role) <span className="text-red-500">*</span></label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Admin["role"])}
                className="mt-1 w-full rounded-md border text-black border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Pilih Role</option>
                <option value="Admin ICICyTA">Admin ICICyTA</option>
                <option value="Admin ICoDSA">Admin ICoDSA</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-95">
                Cancel
              </button>
              <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-95">
                {mode === "create" ? "Create" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}