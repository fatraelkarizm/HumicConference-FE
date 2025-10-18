import { Admin } from "@/components/AdminModal";

const STORAGE_KEY = "hc_admins_v1";

async function fetchFromServer(input: RequestInfo, init?: RequestInit) {
  try {
    const res = await fetch(input, init);
    if (!res.ok) {
      throw new Error(`Server responded ${res.status}`);
    }
    return res.json();
  } catch (err) {
    throw err;
  }
}

export async function getAdmins(): Promise<Admin[]> {
  // Try server first
  try {
    // Adjust endpoint to your backend.
    const data = await fetchFromServer("/api/admins");
    return data as Admin[];
  } catch {
    // fallback localStorage
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Admin[];
    } catch {
      return [];
    }
  }
}

export async function createAdmin(payload: { fullName: string; email: string; password?: string; role: string }): Promise<Admin> {
  try {
    const data = await fetchFromServer("/api/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return data as Admin;
  } catch {
    // fallback: persist to localStorage
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: Admin[] = raw ? JSON.parse(raw) : [];
    const newAdmin: Admin = {
      id: String(Date.now()),
      fullName: payload.fullName,
      email: payload.email,
      role: payload.role,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newAdmin);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return newAdmin;
  }
}

export async function updateAdmin(id: string, payload: { fullName?: string; email?: string; password?: string; role?: string }): Promise<Admin> {
  try {
    const data = await fetchFromServer(`/api/admins/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return data as Admin;
  } catch {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: Admin[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error("Admin not found");
    const updated = { ...list[idx], ...payload };
    list[idx] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return updated;
  }
}

export async function deleteAdmin(id: string): Promise<void> {
  try {
    await fetchFromServer(`/api/admins/${id}`, { method: "DELETE" });
    return;
  } catch {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: Admin[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return;
  }
}