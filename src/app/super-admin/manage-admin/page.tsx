"use client";

import React, { useEffect, useState } from "react";
import AdminTable, { AdminRow } from "@/components/AdminTable";
import AdminModal, { Admin } from "@/components/AdminModal";
import { createAdmin, deleteAdmin, getAdmins, updateAdmin } from "@/services/adminService";

/**
 * Page glue: loads admins, passes them to AdminTable, opens AdminModal for create/edit.
 * This component demonstrates how to connect AdminTable <-> AdminModal and fixes the
 * "Cannot read properties of undefined (reading 'length')" by ensuring AdminTable receives an array.
 */

export default function ManageAdminPage() {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Admin | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await getAdmins();
        // Normalize shape to AdminRow for table
        const normalized: AdminRow[] = (list || []).map((a: Admin) => ({
          id: a.id,
          fullName: a.fullName,
          email: a.email,
          role: a.role,
          joinedAt: a.createdAt,
          lastActive: a.createdAt ? new Date(a.createdAt).toLocaleString() : undefined,
          avatarUrl: undefined,
        }));
        setAdmins(normalized);
      } catch (err) {
        setAdmins([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function openCreate() {
    setModalMode("create");
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(adminRow: AdminRow) {
    setModalMode("edit");
    // convert AdminRow -> Admin initialData shape expected by AdminModal
    setEditing({
      id: adminRow.id,
      fullName: adminRow.fullName,
      email: adminRow.email,
      role: adminRow.role,
      createdAt: adminRow.joinedAt,
    });
    setModalOpen(true);
  }

  async function handleSave(payload: { fullName: string; email: string; password?: string; role: string }, id?: string) {
    if (modalMode === "create") {
      const created = await createAdmin(payload);
      const newRow: AdminRow = {
        id: created.id,
        fullName: created.fullName,
        email: created.email,
        role: created.role,
        joinedAt: created.createdAt,
        lastActive: created.createdAt ? new Date(created.createdAt).toLocaleString() : undefined,
      };
      setAdmins((prev) => [newRow, ...prev]);
    } else if (modalMode === "edit" && id) {
      const updated = await updateAdmin(id, payload);
      setAdmins((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                fullName: updated.fullName,
                email: updated.email,
                role: updated.role,
              }
            : p
        )
      );
    }
  }

  async function handleDelete(id: string) {
    await deleteAdmin(id);
    setAdmins((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Manage Admins</h2>
      </div>

      <div className="mb-4">
        {loading ? (
          <div className="text-sm text-gray-500">Loading admins...</div>
        ) : (
          <AdminTable admins={admins} onCreate={openCreate} onEdit={openEdit} onDelete={handleDelete} />
        )}
      </div>

      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editing}
        mode={modalMode}
        onSave={async (payload, id) => {
          await handleSave(payload as { fullName: string; email: string; password?: string; role: string }, id);
          setModalOpen(false);
        }}
      />
    </div>
  );
}