// src/components/dashboard/ScheduleCard.tsx
import Image from "next/image"; 

const ScheduleCard = ({
  title,
  time,
  speaker,
  room,
  description,
  bgColor,
  borderColor,
  textColor = "black",
}: {
  title: string;
  time: string;
  speaker: string;
  room: string;
  description: string;
  bgColor: string;
  borderColor: string;
  textColor?: string;
}) => (
  <div
    className={`rounded-lg ${bgColor} border-l-4 ${borderColor} p-4 relative flex flex-col`}
  >
    <div className="flex justify-between items-start mb-2">
      <h3
        className={`font-satoshi text-sm font-medium leading-tight ${
          textColor === "white" ? "text-white" : "text-gray-800"
        } pr-12 line-clamp-3`}
      >
        {title}
      </h3>
      <span
        className={`absolute top-4 right-4 text-xs ${
          textColor === "white" ? "text-white/70" : "text-gray-500"
        }`}
      >
        {time}
      </span>
    </div>
    <div className="flex-grow"></div>
    <div className="flex items-center gap-3 mt-4">
      <div className="w-9 h-9 rounded-lg bg-gray-300 flex-shrink-0">
        {/* Nanti bisa diganti <Image /> */}
      </div>
      <div className="flex-1">
        <p
          className={`font-satoshi text-sm font-bold ${
            textColor === "white" ? "text-white" : "text-black"
          }`}
        >
          {speaker}
        </p>
        <p
          className={`${
            textColor === "white" ? "text-white/80" : "text-gray-500"
          } font-inter text-xs leading-4`}
        >
          {description}
        </p>
      </div>
      <div
        className={`font-satoshi text-xs font-medium ${
          textColor === "white" ? "text-white" : "text-gray-600"
        }`}
      >
        {room}
      </div>
    </div>
  </div>
);

export default ScheduleCard;
