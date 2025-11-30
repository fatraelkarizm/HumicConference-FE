import React, { useMemo, useState } from "react";

export type AdminRow = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  joinedAt?: string; // ISO date string
  lastActive?: string; // human readable or ISO
  avatarUrl?: string;
};

type Props = {
  admins?: AdminRow[]; // make optional to avoid undefined errors
  onCreate?: () => void;
  onEdit: (admin: AdminRow) => void;
  onDelete: (id: string) => void;
};

function formatJoined(date?: string) {
  if (!date) return "-";
  try {
    const d = new Date(date);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return date;
  }
}

export default function AdminTable({ admins = [], onCreate, onEdit, onDelete }: Props) {
  // admins has default value [] so filtered will never be undefined
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter(
      (a) =>
        (a.fullName || "").toLowerCase().includes(q) ||
        (a.email || "").toLowerCase().includes(q) ||
        (a.role || "").toLowerCase().includes(q)
    );
  }, [admins, query]);

  const total = filtered.length; // now safe
  const totalPages = Math.max(1, Math.ceil(total / rowsPerPage));
  const visible = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  function goPage(p: number) {
    if (p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    setPage(p);
  }

  // inline SVG icons
  const IconPlus = (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IconEdit = (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const IconTrash = (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="space-y-4">
      {/* Top controls: search + add */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-1/2">
          <div className="relative w-full">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search User"
              className="w-full rounded-full border text-black border-gray-200 bg-white px-4 py-2 pl-10 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {/* Magnifier */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onCreate && onCreate()}
            className="inline-flex items-center gap-2 rounded-full bg-[#015B97] px-4 py-2 text-white text-sm shadow-sm hover:opacity-95"
            aria-label="Add user"
          >
            <span className="inline-flex items-center justify-center rounded-full bg-white/10 p-1">{IconPlus}</span>
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <div className="min-w-full rounded-md border-2 ">
          <table className="min-w-full table-auto">
            <thead className="bg-[#015B97] text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Full Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">Joined Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium hidden lg:table-cell">Last Active</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-blue-100">
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                visible.map((a) => (
                  <tr key={a.id} className="hover:bg-blue-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                          {a.avatarUrl ? (
                            <img src={a.avatarUrl} alt={a.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                              {a.fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">{a.fullName}</div>
                          <div className="text-xs text-gray-500 hidden sm:block">ID: {a.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{a.email}</div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="inline-block rounded-md bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {a.role}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-700">{formatJoined(a.joinedAt)}</div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-sm text-gray-600">{a.lastActive ?? "-"}</div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => onEdit(a)}
                          className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-200 px-2 py-1 text-blue-600 hover:bg-blue-50"
                          title="Edit"
                        >
                          {IconEdit}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus admin ${a.fullName}?`)) onDelete(a.id);
                          }}
                          className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-200 px-2 py-1 text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          {IconTrash}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer controls: rows per page + pagination */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3 text-gray-600">
          <span>Rows per page</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-gray-500">of {total} rows</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => goPage(1)}
            className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100"
            disabled={page === 1}
            aria-label="First page"
          >
            «
          </button>
          <button
            onClick={() => goPage(page - 1)}
            className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100"
            disabled={page === 1}
            aria-label="Previous page"
          >
            ‹
          </button>

          {/* show up to 5 numeric pages centered around current */}
          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
            const start = Math.max(1, Math.min(totalPages - 4, page - 2));
            const p = start + i;
            if (p > totalPages) return null;
            return (
              <button
                key={p}
                onClick={() => goPage(p)}
                className={`rounded-full px-3 py-1 text-sm ${p === page ? "bg-[#015B97] text-white" : "text-gray-700 hover:bg-gray-100"}`}
              >
                {p}
              </button>
            );
          })}

          <button
            onClick={() => goPage(page + 1)}
            className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100"
            disabled={page === totalPages}
            aria-label="Next page"
          >
            ›
          </button>
          <button
            onClick={() => goPage(totalPages)}
            className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100"
            disabled={page === totalPages}
            aria-label="Last page"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}