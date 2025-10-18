// services/ScheduleService.ts
// Simulated Schedule service (name: ScheduleService)
// - Persists to localStorage so data survives full page reload.
// - Normalizes dayNumber to number and guards against corrupted storage.

import type { NewScheduleData, ScheduleItem } from "@/types/schedule";

const STORAGE_KEY = "hc_schedules_v1";

/** utils */
function uid(prefix = "") {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function formatTimeDisplay(start?: string, end?: string) {
  if (start && end) return `${start} - ${end}`;
  if (start) return start;
  return "";
}

function safeParse(raw?: string | null): any {
  if (!raw) return null;
  try {
    return JSON.parse(raw as string);
  } catch (err) {
    // corrupted storage, attempt to recover by removing file
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    return null;
  }
}

function readStore(): ScheduleItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    const parsed = safeParse(raw);
    if (!parsed) return [];
    // ensure normalization: array of ScheduleItem
    if (!Array.isArray(parsed)) return [];
    return parsed.map((s: any) => ({
      id: String(s.id ?? uid("sch-")),
      title: String(s.title ?? ""),
      conference: String(s.conference ?? ""),
      date: String(s.date ?? ""),
      startTime: s.startTime ?? undefined,
      endTime: s.endTime ?? undefined,
      timeDisplay: s.timeDisplay ?? formatTimeDisplay(s.startTime, s.endTime),
      speaker: s.speaker ?? undefined,
      description: s.description ?? undefined,
      location: s.location ?? undefined,
      scheduleType: s.scheduleType ?? undefined,
      createdAt: s.createdAt ?? new Date().toISOString(),
      // normalize dayNumber to number if possible
      dayNumber: s.dayNumber !== undefined ? Number(s.dayNumber) : undefined,
      dayTitle: s.dayTitle ?? undefined,
    })) as ScheduleItem[];
  } catch (err) {
    return [];
  }
}

function writeStore(items: ScheduleItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore write errors
  }
}

/** Service API (async to mimic network) */
export async function getSchedules(conference?: string): Promise<ScheduleItem[]> {
  await new Promise((r) => setTimeout(r, 60));
  const all = readStore();
  if (conference) return all.filter((s) => String(s.conference || "") === String(conference));
  return all;
}

export async function createSchedule(payload: NewScheduleData): Promise<ScheduleItem> {
  await new Promise((r) => setTimeout(r, 60));
  const all = readStore();
  const dayNum = payload.dayNumber !== undefined && payload.dayNumber !== null ? Number(payload.dayNumber) : undefined;
  const created: ScheduleItem = {
    id: uid("sch-"),
    title: payload.title,
    conference: payload.conference,
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
    timeDisplay: formatTimeDisplay(payload.startTime, payload.endTime),
    speaker: payload.speaker,
    description: payload.description,
    location: payload.location,
    scheduleType: payload.scheduleType,
    createdAt: new Date().toISOString(),
    dayNumber: isNaN(dayNum as number) ? undefined : (dayNum as number),
    dayTitle: payload.dayTitle,
  };
  all.unshift(created);
  writeStore(all);
  return created;
}

export async function updateSchedule(id: string, patch: Partial<NewScheduleData>): Promise<ScheduleItem> {
  await new Promise((r) => setTimeout(r, 60));
  const all = readStore();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Schedule not found");
  const existing = all[idx];
  const dayNum = patch.dayNumber !== undefined && patch.dayNumber !== null ? Number(patch.dayNumber) : existing.dayNumber;
  const updated: ScheduleItem = {
    ...existing,
    ...patch,
    timeDisplay: formatTimeDisplay(patch.startTime ?? existing.startTime, patch.endTime ?? existing.endTime),
    dayNumber: isNaN(dayNum as number) ? existing.dayNumber : (dayNum as number),
    dayTitle: patch.dayTitle ?? existing.dayTitle,
  } as ScheduleItem;
  all[idx] = updated;
  writeStore(all);
  return updated;
}

export async function deleteSchedule(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 60));
  const all = readStore();
  const filtered = all.filter((s) => s.id !== id);
  writeStore(filtered);
}