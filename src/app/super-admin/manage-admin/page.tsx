"use client";

import React, { useEffect, useState } from "react";
import AdminTable, { AdminRow } from "@/components/AdminTable";
import AdminModal, { Admin } from "@/components/AdminModal";
import AdminService from "@/services/adminService";
import { useAuth } from "@/context/AuthContext";

export default function ManageAdminPage() {
  const { user, isAuthenticated } = useAuth();
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Admin | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if user is SUPER_ADMIN
  useEffect(() => {
    if (isAuthenticated && user && user.role !== 'SUPER_ADMIN') {
      window.location.href = '/unauthorized';
    }
  }, [isAuthenticated, user]);

  // Load admins on component mount
  useEffect(() => {
    if (isAuthenticated && user?.role === 'SUPER_ADMIN') {
      loadAdmins();
    }
  }, [isAuthenticated, user]);

  async function loadAdmins() {
    setLoading(true);
    setError(null);
    try {
      const list = await AdminService.getAdmins();

      // Filter hanya admin users (exclude SUPER_ADMIN) - UPDATED ICODSA
      const adminUsers = list.filter(admin =>
        admin.role === 'ADMIN_ICICYTA' || admin.role === 'ADMIN_ICODSA' // FIXED: ICODSA
      );

      // Normalize shape to AdminRow for table
      const normalized: AdminRow[] = adminUsers.map((a: Admin) => ({
        id: a.id,
        fullName: a.fullName,
        email: a.email,
        role: a.role,
        joinedAt: a.createdAt,
      }));

      setAdmins(normalized);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load admins');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setModalMode("create");
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(adminRow: AdminRow) {
    setModalMode("edit");
    setEditing({
      id: adminRow.id,
      fullName: adminRow.fullName,
      email: adminRow.email,
      role: adminRow.role as 'ADMIN_ICICYTA' | 'ADMIN_ICODSA', // FIXED: ICODSA
      createdAt: adminRow.joinedAt,
    });
    setModalOpen(true);
  }

  async function handleSave(
    payload: { fullName: string; email: string; password?: string; role: string },
    id?: string
  ) {
    try {
      setError(null);

      if (modalMode === "create") {
        const created = await AdminService.createAdmin(payload);

        const newRow: AdminRow = {
          id: created.id,
          fullName: created.fullName,
          email: created.email,
          role: created.role,
          joinedAt: created.createdAt,
          lastActive: 'Never',
          avatarUrl: created.profile_uri || undefined,
        };

        setAdmins((prev) => [newRow, ...prev]);
      } else if (modalMode === "edit" && id) {
        const updated = await AdminService.updateAdmin(id, payload);

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save admin');
      throw err;
    }
  }

  async function handleDelete(id: string) {
    try {
      setError(null);

      await AdminService.deleteAdmin(id);
      setAdmins((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete admin');
    }
  }

  if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Unauthorized</h2>
          <p className="text-gray-600">You need SUPER_ADMIN privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Manage Admins</h2>
          <p className="text-gray-600">Create and manage admin users for ICICYTA and ICODSA</p> {/* FIXED: ICODSA */}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="mb-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">Loading admins...</div>
          </div>
        ) : (
          <AdminTable
            admins={admins}
            onCreate={openCreate}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <AdminModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setError(null);
        }}
        initialData={editing}
        mode={modalMode}
        onSave={async (payload, id) => {
          try {
            await handleSave(payload as { fullName: string; email: string; password?: string; role: string }, id);
            setModalOpen(false);
          } catch {
            // Error is handled in handleSave, modal stays open
          }
        }}
      />
    </div>
  );
}