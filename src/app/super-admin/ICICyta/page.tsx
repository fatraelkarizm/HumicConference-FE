"use client";

import React, { useEffect, useState } from "react";
import {
  PlusIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import ScheduleCard from "@/components/schedule/ScheduleCard";
import ScheduleModal from "@/components/schedule/ScheduleAddModal";
import ScheduleDetailModal from "@/components/schedule/ScheduleDetailModal";
import type { ScheduleItem, NewScheduleData } from "@/types/schedule";
import { createSchedule, getSchedules, updateSchedule, deleteSchedule } from "@/services/ScheduleService";

export default function JadwalICICytaPage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // detail/edit modal state
  const [activeItem, setActiveItem] = useState<ScheduleItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  async function loadSchedules() {
    setLoading(true);
    let all = await getSchedules("ICICyTA");
    if (!all || all.length === 0) {
      all = await getSchedules();
    }
    setSchedules(all);
    setLoading(false);
  }

  useEffect(() => {
    loadSchedules();
  }, []);

  async function handleSave(payload: NewScheduleData, id?: string) {
    if (id) {
      // update
      const updated = await updateSchedule(id, payload);
      setSchedules((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } else {
      // create
      const created = await createSchedule(payload);
      setSchedules((prev) => [created, ...prev]);
    }
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    await deleteSchedule(id);
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }

  function openDetail(id?: string) {
    const item = schedules.find((s) => s.id === id) ?? null;
    setActiveItem(item);
    setDetailOpen(true);
  }

  function openEditFromDetail(item: ScheduleItem) {
    setActiveItem(item);
    setDetailOpen(false);
    // open ScheduleModal in edit mode
    setTimeout(() => {
      setEditMode(true);
      setIsModalOpen(true);
    }, 50);
  }

  function handleSavedUpdate(updated: ScheduleItem) {
    setSchedules((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  // grouping by dayNumber
  const byDay: Record<string, ScheduleItem[]> = {};
  schedules.forEach((s) => {
    const day = s.dayNumber !== undefined && s.dayNumber !== null ? Number(s.dayNumber) : 1;
    const key = `day-${day}`;
    (byDay[key] = byDay[key] || []).push(s);
  });

  const dayKeys = Object.keys(byDay).sort((a, b) => {
    const na = Number(a.split("-")[1] || 1);
    const nb = Number(b.split("-")[1] || 1);
    return na - nb;
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-4">
          <span className="inline-flex items-center justify-center rounded-md" style={{ backgroundColor: "#FFB84D", padding: 8 }}>
            <CalendarDaysIcon className="w-5 h-5 text-white" />
          </span>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-black leading-tight">Jadwal ICICyta</h1>
            <p className="text-black mt-1 text-sm">Lorem ipsum</p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button onClick={() => { setEditMode(false); setIsModalOpen(true); }} className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: "#10B981" }}>
            <PlusIcon className="w-5 h-5" />
            <span>Tambah Schedule Baru</span>
          </button>
          <button className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: "#2563EB" }}>
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Import Data</span>
          </button>
          <button className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-semibold" style={{ backgroundColor: "#949CA2" }}>
            <ArrowUpTrayIcon className="w-5 h-5" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {dayKeys.length === 0 && !loading && <div className="text-gray-500">No schedules yet — try adding one.</div>}

        {dayKeys.map((dayKey) => {
          const items = byDay[dayKey];
          const dayNumber = Number(dayKey.split("-")[1] || 1);
          const first = items[0];
          const headerTitle = first?.dayTitle ?? `Day ${dayNumber}`;

          // group items by time
          const byTime: Record<string, ScheduleItem[]> = {};
          items.forEach((s) => {
            const k = s.timeDisplay || s.date || "TBD";
            (byTime[k] = byTime[k] || []).push(s);
          });

          const timeKeys = Object.keys(byTime);

          return (
            <section key={dayKey}>
              <div className="mb-4 rounded-md p-3 bg-[#CAF2D7]">
                <div className="text-sm font-semibold text-[#064e3b]">{headerTitle}</div>
              </div>

              <div className="space-y-6">
                {timeKeys.map((timeKey) => {
                  const rowItems = byTime[timeKey];
                  return (
                    <div key={timeKey} className="grid grid-cols-[160px_1fr] items-stretch gap-6">
                      <div className="h-full">
                        <div className="h-full rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg shadow-sm px-4">
                          {timeKey}
                        </div>
                      </div>

                      <div className="h-full">
                        <div className="h-full rounded-lg p-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rowItems.map((s) => (
                              <div key={s.id} className="h-full">
                                <ScheduleCard item={s} onOpenDetail={openDetail} className="h-full" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Create/Edit modal uses same UI (mode controlled by editMode + activeItem) */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setActiveItem(null);
          setEditMode(false);
        }}
        initialData={editMode ? activeItem ?? null : null}
        mode={editMode ? "edit" : "create"}
        onSave={async (payload, id) => {
          await handleSave(payload, id);
          // after save ensure we reload (or we already updated state)
        }}
      />

      {/* Detail modal (shows info + edit/delete icons). Edit opens the same modal in edit mode */}
      <ScheduleDetailModal
        open={detailOpen}
        item={activeItem}
        onClose={() => {
          setDetailOpen(false);
          setActiveItem(null);
        }}
        onEdit={(item) => {
          openEditFromDetail(item);
        }}
        onDelete={(id) => {
          handleDelete(id);
        }}
      />
    </>
  );
}