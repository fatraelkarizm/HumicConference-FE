// src/components/dashboard/StatCard.tsx
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

const StatCard = ({ title, description, iconColor }: { title: string; description: string; iconColor: string; }) => (
    <div className="bg-white rounded-lg p-5 shadow-[0_0_4px_0_rgba(0,0,0,0.15)] flex items-center gap-4">
        <CalendarDaysIcon className={`w-10 h-10 ${iconColor}`} strokeWidth={1.5} />
        <div>
            <p className="text-[#1E1B39] font-lato text-xl lg:text-2xl font-bold">{title}</p>
            <p className="text-[#89868D] font-lato text-sm">{description}</p>
        </div>
    </div>
);

export default StatCard;