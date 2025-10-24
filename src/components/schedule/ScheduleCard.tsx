import React from 'react';
import type { ProcessedScheduleItem } from '@/types/schedule';

interface ScheduleCardProps {
  item: ProcessedScheduleItem;
  onOpenDetail?: (itemId?: string) => void;
}

export default function ScheduleCard({ item, onOpenDetail }: ScheduleCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TALK':
        return '🎤';
      case 'BREAK':
        return '☕';
      case 'ONE_DAY_ACTIVITY':
        return '🚌';
      default:
        return '📋';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'TALK':
        return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
      case 'BREAK':
        return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
      case 'ONE_DAY_ACTIVITY':
        return 'bg-green-50 border-green-200 hover:bg-green-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const getScheduleTypeColor = (scheduleType?: string) => {
    switch (scheduleType) {
      case 'MAIN':
        return 'bg-blue-100 text-blue-800';
      case 'PARALLEL':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${getTypeColor(item.type)}`}
      onClick={() => onOpenDetail?.(item.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg flex items-center gap-2 flex-1">
          <span className="text-xl">{getTypeIcon(item.type)}</span>
          <span className="line-clamp-2">{item.title}</span>
        </h3>
        {item.timeDisplay && (
          <span className="text-xs font-mono bg-white px-2 py-1 rounded shadow-sm ml-2 flex-shrink-0">
            {item.timeDisplay}
          </span>
        )}
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-sm text-gray-700 mb-3 line-clamp-3">
          {item.description}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 text-xs">
        {item.location && (
          <span className="bg-white bg-opacity-80 px-2 py-1 rounded flex items-center gap-1">
            <span>📍</span>
            <span className="truncate max-w-[120px]">{item.location}</span>
          </span>
        )}
        {item.speaker && (
          <span className="bg-white bg-opacity-80 px-2 py-1 rounded flex items-center gap-1">
            <span>👤</span>
            <span className="truncate max-w-[100px]">{item.speaker}</span>
          </span>
        )}
        {item.scheduleType && (
          <span className={`px-2 py-1 rounded text-xs font-medium ${getScheduleTypeColor(item.scheduleType)}`}>
            {item.scheduleType}
          </span>
        )}
      </div>

      {/* Room count indicator for parallel sessions */}
      {item.rooms && item.rooms.length > 1 && (
        <div className="mt-2 text-xs text-gray-600 bg-white bg-opacity-60 px-2 py-1 rounded">
          📊 +{item.rooms.length - 1} more rooms
        </div>
      )}
    </div>
  );
}