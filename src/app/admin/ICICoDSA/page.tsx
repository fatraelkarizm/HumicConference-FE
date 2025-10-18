"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import StatCard from "@/components/StatCard";
import ScheduleCard from "@/components/schedule/ScheduleCard";
import TimelineRow from "@/components/TimelineRow";

// --- DATA DUMMY --- (Nanti bisa diganti dari API)
const stats = [
  { title: "Jadwal ICICyTA", description: "Lorem ipsum", iconColor: "text-green-500" },
  { title: "Jadwal ICoDSA", description: "Lorem ipsum", iconColor: "text-orange-400" },
];

const timeline = [
  {
    time: "07.30 - 09.10",
    events: [
      { id: 1, title: "Speech by General Chair Representation", time: "1h 40m", speaker: "Mahananta", room: "Room A", description: "Opening Ceremony", bgColor: "bg-orange-100", borderColor: "border-orange-400" },
      { id: 2, title: "Signing MoU Telkom University dan Kyushu University", time: "1h 40m", speaker: "Rector", room: "Main Hall", description: "Collaboration Agreement", bgColor: "bg-teal-100", borderColor: "border-teal-400" },
    ],
  },
  {
    time: "09.30 - 11.00",
    events: [
      { id: 3, title: "Keynote Speaker 1: The Future of AI in Research", time: "1h 30m", speaker: "Dr. Aisha Khan", room: "Auditorium", description: "Artificial Intelligence", bgColor: "bg-blue-800", borderColor: "border-blue-500", textColor: "white" },
    ],
  },
];


// --- KOMPONEN UTAMA HALAMAN DASHBOARD ---
export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Memuat sesi...</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-gray-800 font-poppins text-2xl lg:text-[30px] font-bold mb-1">
        Welcome back, {user.name} 👋
      </h1>
      <p className="text-gray-600 font-poppins text-base lg:text-xl mb-6 lg:mb-8">to Dashboard</p>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-2xl">
        {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
      </div>

      {/* Timeline Jadwal */}
      <div className="space-y-6">
        {timeline.map(item => (
          <TimelineRow key={item.time} time={item.time}>
            <div className={`grid grid-cols-1 ${item.events.length > 1 ? 'sm:grid-cols-2' : ''} gap-4`}>
              {item.events.map(event => <ScheduleCard key={event.id} {...event} />)}
            </div>
          </TimelineRow>
        ))}
      </div>
    </>
  );
}