import React from 'react';
import type { ScheduleItem } from '@/types/schedule';

interface ScheduleTimelineProps {
  schedules: ScheduleItem[];
  onEditSchedule?: (item: ScheduleItem) => void;
  onDeleteSchedule?: (id: string) => void;
}

const getSessionTypeColor = (type?: string) => {
  switch (type) {
    case 'MAIN':
      return 'bg-green-100 border-green-300';
    case 'PARALLEL':
      return 'bg-blue-100 border-blue-300';
    case 'BREAK':
      return 'bg-orange-100 border-orange-300';
    case 'KEYNOTE':
      return 'bg-purple-100 border-purple-300';
    default:
      return 'bg-gray-100 border-gray-300';
  }
};

const getSessionTypeTag = (type?: string) => {
  switch (type) {
    case 'MAIN':
      return { text: 'Main Session', color: 'bg-green-500 text-white' };
    case 'PARALLEL':
      return { text: 'Parallel Session', color: 'bg-blue-500 text-white' };
    case 'BREAK':
      return { text: 'Break', color: 'bg-orange-500 text-white' };
    case 'KEYNOTE':
      return { text: 'Keynote', color: 'bg-purple-500 text-white' };
    default:
      return { text: 'Session', color: 'bg-gray-500 text-white' };
  }
};

export default function ScheduleTimeline({ schedules, onEditSchedule, onDeleteSchedule }: ScheduleTimelineProps) {
  // Group schedules by time slot
  const groupedByTime = schedules.reduce((acc, schedule) => {
    const timeKey = schedule.timeDisplay || `${schedule.startTime}-${schedule.endTime}`;
    if (!acc[timeKey]) {
      acc[timeKey] = [];
    }
    acc[timeKey].push(schedule);
    return acc;
  }, {} as Record<string, ScheduleItem[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedByTime).map(([timeSlot, timeSchedules]) => (
        <div key={timeSlot} className="flex gap-4">
          {/* Time Column */}
          <div className="w-24 flex-shrink-0">
            <div className="bg-blue-600 text-white text-center py-3 px-2 rounded-lg font-medium text-sm">
              {timeSlot}
            </div>
          </div>

          {/* Content Column */}
          <div className="flex-1">
            {timeSchedules.length === 1 ? (
              // Single session row
              <SingleSessionRow 
                schedule={timeSchedules[0]} 
                onEdit={onEditSchedule}
                onDelete={onDeleteSchedule}
              />
            ) : (
              // Multiple sessions (parallel)
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 mb-3">
                  {timeSchedules[0].location || 'Main Rundown'}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {timeSchedules.map((schedule) => (
                    <SessionCard
                      key={schedule.id}
                      schedule={schedule}
                      onEdit={onEditSchedule}
                      onDelete={onDeleteSchedule}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Single session component
function SingleSessionRow({ 
  schedule, 
  onEdit, 
  onDelete 
}: { 
  schedule: ScheduleItem;
  onEdit?: (item: ScheduleItem) => void;
  onDelete?: (id: string) => void;
}) {
  const typeTag = getSessionTypeTag(schedule.scheduleType);
  
  return (
    <div className={`border-2 rounded-lg p-4 ${getSessionTypeColor(schedule.scheduleType)}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-800">{schedule.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeTag.color}`}>
              {typeTag.text}
            </span>
          </div>
          
          {schedule.description && (
            <p className="text-gray-600 text-sm mb-2">{schedule.description}</p>
          )}
          
          {schedule.speaker && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                👤
              </div>
              <span className="font-medium">{schedule.speaker}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-1 ml-4">
          {onEdit && (
            <button
              onClick={() => onEdit(schedule)}
              className="p-1 hover:bg-white/50 rounded"
              title="Edit"
            >
              
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(schedule.id)}
              className="p-1 hover:bg-white/50 rounded"
              title="Delete"
            >
              
            </button>
          )}
        </div>
      </div>
      
      <div className="text-right text-xs text-gray-500 mt-2">
        {schedule.timeDisplay?.split(' - ')[1] && 
          `Duration: ${schedule.timeDisplay.split(' - ')[1]}`
        }
      </div>
    </div>
  );
}

// Session card for parallel sessions
function SessionCard({ 
  schedule, 
  onEdit, 
  onDelete 
}: { 
  schedule: ScheduleItem;
  onEdit?: (item: ScheduleItem) => void;
  onDelete?: (id: string) => void;
}) {
  const typeTag = getSessionTypeTag(schedule.scheduleType);
  
  return (
    <div className={`border-2 rounded-lg p-3 ${getSessionTypeColor(schedule.scheduleType)} relative group`}>
      <div className="flex justify-between items-start mb-2">
        <span className={`px-2 py-1 rounded text-xs font-medium ${typeTag.color}`}>
          {typeTag.text}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(schedule)}
              className="p-1 hover:bg-white/50 rounded text-xs"
              title="Edit"
            >
             
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(schedule.id)}
              className="p-1 hover:bg-white/50 rounded text-xs"
              title="Delete"
            >
                 </button>
          )}
        </div>
      </div>
      
      <h4 className="font-medium text-sm text-gray-800 mb-1 leading-tight">
        {schedule.title}
      </h4>
      
      {schedule.speaker && (
        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
          <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center text-xs">
            👤
          </div>
          <span className="truncate">{schedule.speaker}</span>
        </div>
      )}
      
      {schedule.location && (
        <div className="text-xs text-gray-500"> {schedule.location}</div>
      )}
      
      <div className="text-xs text-gray-400 mt-2">
        {schedule.timeDisplay?.includes('30m') ? '30 min' : 
         schedule.timeDisplay?.includes('1h') ? '1h' : 
         schedule.timeDisplay || ''}
      </div>
    </div>
  );
}