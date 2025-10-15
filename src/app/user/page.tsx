// src/app/schedule/page.tsx

import Image from "next/image";

const scheduleData = [
  {
    day: "Day 1",
    date: "Wednesday, 22 November 2025",
    timeSlots: [
      {
        time: "7.30 - 09.10",
        title: "Main Rundown",
        duration: "1h 40m",
        events: [
          {
            id: 1,
            title: "Speech by General Chair",
            subtitle: "Representation (Assoc. Prof. Dr. Putu Harry Gunawan)",
            speaker: {
              name: "Dr. Kadek Hendratma",
              handle: "@kadekhendratma",
              avatar: "/avatars/kadek.png", 
            },
            duration: "1h 30m",
            isParallel: false,
          },
          {
            id: 2,
            title: "Speech by General Chair",
            subtitle: "Representation (Assoc. Prof. Dr. Putu Harry Gunawan)",
            speaker: {
              name: "Dr. Kadek Hendratma",
              handle: "@kadekhendratma",
              avatar: "/avatars/kadek.png",
            },
            duration: "1h 30m",
            isParallel: true,
          },
        ],
      },
      {
        time: "7.30 - 09.10",
        title: "Signing MoU Telkom University dan Kyushu University",
        duration: "6h 30m",
        events: [
          {
            id: 3,
            title: "Speech by General Chair",
            subtitle: "Representation (Assoc. Prof. Dr. Putu Harry Gunawan)",
            speaker: {
              name: "Dr. Kadek Hendratma",
              handle: "@kadekhendratma",
              avatar: "/avatars/kadek.png",
            },
            duration: "1h 30m",
            isParallel: false,
          },
          {
            id: 4,
            title: "Speech by General Chair",
            subtitle: "Representation (Assoc. Prof. Dr. Putu Harry Gunawan)",
            speaker: {
              name: "Dr. Kadek Hendratma",
              handle: "@kadekhendratma",
              avatar: "/avatars/kadek.png",
            },
            duration: "1h 30m",
            isParallel: false,
          },
        ],
      },
    ],
  },
  {
    day: "Day 2",
    date: "Saturday, 23 November 2025",
    timeSlots: [
      {
        time: "7.30 - 09.10",
        title: "Main Rundown Day 2",
        duration: "1h 40m",
        events: [
          {
            id: 5,
            title: "Speech by General Chair",
            subtitle: "Representation (Assoc. Prof. Dr. Putu Harry Gunawan)",
            speaker: {
              name: "Dr. Kadek Hendratma",
              handle: "@kadekhendratma",
              avatar: "/avatars/kadek.png",
            },
            duration: "1h 30m",
            isParallel: true,
          },
          {
            id: 6,
            title: "Speech by General Chair",
            subtitle: "Representation (Assoc. Prof. Dr. Putu Harry Gunawan)",
            speaker: {
              name: "Dr. Kadek Hendratma",
              handle: "@kadekhendratma",
              avatar: "/avatars/kadek.png",
            },
            duration: "1h 30m",
            isParallel: true,
          },
        ],
      },
    ],
  },
];


const Header = () => (
  <header className="bg-white shadow-md">
    <nav className="px-16 py-4 flex justify-between items-center bg-[#015B97]">
      <div className="text-2xl font-semibold text-white">Humic Conference</div>
      <div className="flex items-center space-x-6">
        <a href="#" className="text-white">
          ICICTYA
        </a>
        <a href="#" className="text-white">
          ICoDSA
        </a>
        <a href="#" className="text-white">
          About
        </a>
      </div>
    </nav>
  </header>
);

const EventCard = ({ event }: { event: any }) => (
  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-2">
    <div className="flex justify-between items-start text-xs">
      <p className="font-semibold text-gray-800">{event.title}</p>
      <span className="text-gray-500">{event.duration}</span>
    </div>
    <p className="text-xs text-gray-500">{event.subtitle}</p>
    <div className="flex items-center gap-2 mt-1">
      <Image
        src={event.speaker.avatar}
        alt={event.speaker.name}
        width={32}
        height={32}
        className="rounded-full"
      />
      <div>
        <p className="text-sm font-semibold text-gray-800">
          {event.speaker.name}
        </p>
        <p className="text-xs text-gray-500">{event.speaker.handle}</p>
      </div>
    </div>
    {event.isParallel && (
      <div className="mt-2 self-start">
        <span className="bg-teal-100 text-teal-600 text-xs font-semibold px-2 py-1 rounded-md">
          Parallel Session
        </span>
      </div>
    )}
  </div>
);


export default function SchedulePage() {
  return (
    <>
      <Header />
      <main className="bg-gray-50 min-h-screen p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
          {/* Judul dan Tombol */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Schedule ICICTYA
            </h1>
            <button className="bg-teal-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-teal-600 transition">
              Parallel Session
            </button>
          </div>

          {/* Mapping data jadwal */}
          <div className="space-y-12">
            {scheduleData.map((day, dayIndex) => (
              <div key={dayIndex}>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-blue-600 rounded-full mr-3"></span>
                  {day.day}: {day.date}
                </h2>

                <div className="space-y-6">
                  {day.timeSlots.map((slot, slotIndex) => (
                    <div
                      key={slotIndex}
                      className="flex flex-col md:flex-row gap-6"
                    >
                      <div className="w-full md:w-24 text-blue-600 font-semibold text-left">
                        {slot.time}
                      </div>
                      <div className="flex-1 bg-blue-50 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-gray-800">
                            {slot.title}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {slot.duration}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {slot.events.map((event) => (
                            <EventCard key={event.id} event={event} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
