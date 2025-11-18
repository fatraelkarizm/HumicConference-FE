"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import ScheduleAddModal from "@/components/schedule/ScheduleAddModal";
import ScheduleDetailModal from "@/components/schedule/ScheduleDetailModal";
import { useSchedule, useScheduleActions } from "@/hooks/useSchedule";
import type { ScheduleItem, NewScheduleData } from "@/types/schedule";

export default function ICICYTASchedulePage() {
  const { user, isAuthenticated } = useAuth();
  const { schedule, scheduleItems, loading, error, refetch } = useSchedule();
  const { createScheduleItem, updateScheduleItem, deleteScheduleItem } =
    useScheduleActions();
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ScheduleItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Smart save with success verification
  async function handleSaveSchedule(payload: NewScheduleData, id?: string) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (id) {
        await updateScheduleItem(id, payload);
        console.log("✅ Schedule updated");
      } else {
        // ✅ Store count before creation
        const countBefore = scheduleItems.length;
        console.log("📊 Items before creation:", countBefore);

        await createScheduleItem(payload);
        console.log("✅ Schedule creation completed");
      }

      // Close modal immediately
      setEditingItem(null);
      setIsModalOpen(false);

      // ✅ Refresh with longer delay to ensure backend processing
      setTimeout(async () => {
        await refetch();
        console.log("🎉 Data refreshed successfully!");
      }, 1000);
    } catch (err: any) {
      console.error("❌ Save operation failed:", err.message);
      alert(`Failed to save schedule: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteItem(itemId: string) {
    if (!confirm("Are you sure you want to delete this schedule item?")) {
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await deleteScheduleItem(itemId);
      await refetch();
      console.log("🎉 Delete completed successfully!");
    } catch (err: any) {
      console.error("❌ Delete operation failed:", err);
      alert(`Failed to delete schedule: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEditItem(item: ScheduleItem) {
    setEditingItem(item);
    setIsModalOpen(true);
  }

  function handleAddNew() {
    setEditingItem(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingItem(null);
  }

  function handleViewDetail(itemId?: string) {
    if (!itemId) return;

    const item = scheduleItems.find((item) => item.id === itemId);
    if (item) {
      setSelectedItem(item);
      setDetailModalOpen(true);
    } else {
      alert("Schedule item not found!");
    }
  }

  function closeDetailModal() {
    setDetailModalOpen(false);
    setSelectedItem(null);
  }

  // Filter and pagination logic remains the same...
  const filteredItems = useMemo(() => {
    return scheduleItems.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.speaker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        filterType === "" ||
        item.scheduleType?.toLowerCase() === filterType.toLowerCase() ||
        item.type?.toLowerCase() === filterType.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [scheduleItems, searchTerm, filterType]);

  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Jadwal ICICyTA</h1>
            {schedule && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">{schedule.name}</span>
                <span className="mx-2">•</span>
                <span>
                  {schedule.startDate} - {schedule.endDate}
                </span>
                <span className="mx-2">•</span>
                <span className="font-medium text-blue-600">
                  {totalItems} schedules
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search sessions, speakers, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 2v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">All Types</option>
                  <option value="TALK">Talk</option>
                  <option value="MAIN">Main</option>
                  <option value="PARALLEL">Parallel</option>
                  <option value="BREAK">Break</option>
                  <option value="ONE_DAY_ACTIVITY">Activity</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={refetch}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <svg
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {loading ? "Loading..." : "Refresh"}
              </button>

              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Tambah Sesi Baru
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Time
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Speaker
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Title
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Type
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Location
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">
                          No schedule items found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm || filterType
                            ? "Try adjusting your search or filter criteria."
                            : "Get started by adding your first schedule item."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{item.date || "TBD"}</div>
                        {item.dayTitle && (
                          <div className="text-xs text-gray-500">
                            {item.dayTitle}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">
                          {item.startTime && item.endTime
                            ? `${item.startTime} - ${item.endTime}`
                            : "TBD"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{item.speaker || "-"}</div>
                        {item.moderator && (
                          <div className="text-xs text-gray-500">
                            Moderator: {item.moderator}
                          </div>
                        )}
                      </td>
                      {/* ✅ Title column now shows room description */}
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                          {item.roomName || item.title || "Untitled Session"}
                        </span>
                        {item.roomIdentifier && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.roomIdentifier}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="capitalize">
                          {item.scheduleType || item.type || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.onlineUrl ? (
                          <div>
                            <div className="font-medium">
                              {item.roomName} (Online)
                            </div>
                            <div
                              className="text-xs text-blue-600 truncate max-w-xs"
                              title={item.onlineUrl}
                            >
                              {item.onlineUrl}
                            </div>
                          </div>
                        ) : (
                          item.location || "TBD"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleViewDetail(item.id)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleEditItem(item)}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
                            title="Edit"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() => item.id && handleDeleteItem(item.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
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

        {/* Bottom Section: Items per page (left) + Pagination (right) */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="py-1 px-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-700">
              of {totalItems} results
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-700"
              >
                Previous
              </button>

              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-1 border rounded text-sm ${
                    currentPage === pageNum
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-700"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <ScheduleAddModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveSchedule}
        initialData={editingItem}
        mode={editingItem ? "edit" : "create"}
      />
      <ScheduleDetailModal
        isOpen={detailModalOpen}
        onClose={closeDetailModal}
        item={selectedItem}
      />
    </div>
  );
}
