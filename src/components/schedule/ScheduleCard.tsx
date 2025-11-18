import React from 'react';
import type { ScheduleItem } from '@/types/schedule';

interface ScheduleCardProps {
  item?: ScheduleItem | null; // ✅ CHANGED: Made optional with null
  onOpenDetail?: (itemId?: string) => void;
  fallbackMessage?: string; // ✅ ADDED: Fallback message prop
}

export default function ScheduleCard({ 
  item, 
  onOpenDetail, 
  fallbackMessage = "Schedule data unavailable" 
}: ScheduleCardProps) {
  
  // ✅ ADDED: Handle null/undefined cases directly in ScheduleCard
  if (!item) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 border-gray-200 cursor-not-allowed">
        <div className="text-gray-500 text-sm flex items-center gap-2">
          <span>📋</span>
          <span>{fallbackMessage}</span>
        </div>
      </div>
    );
  }

  // ✅ ADDED: Handle incomplete data
  if (!item.id || !item.title) {
    return (
      <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200 cursor-not-allowed">
        <div className="text-yellow-700 text-sm flex items-center gap-2">
          <span>⚠️</span>
          <span>Incomplete schedule data</span>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-600 mt-1">
            Missing: {!item.id ? 'id' : ''} {!item.title ? 'title' : ''}
          </div>
        )}
      </div>
    );
  }

  // ✅ ADDED: Default values for missing properties
  const safeItem = {
    id: item.id,
    title: item.title,
    type: item.type || 'TALK',
    description: item.description,
    speaker: item.speaker,
    location: item.location,
    timeDisplay: item.timeDisplay,
    scheduleType: item.scheduleType,
    rooms: item.rooms,
    startTime: item.startTime,
    endTime: item.endTime
  };

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

  // ✅ ADDED: Generate time display if missing
  const displayTime = safeItem.timeDisplay || 
    (safeItem.startTime && safeItem.endTime ? 
      `${safeItem.startTime} - ${safeItem.endTime}` : 
      safeItem.startTime || safeItem.endTime || '');

  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${getTypeColor(safeItem.type)}`}
      onClick={() => onOpenDetail?.(safeItem.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-lg flex items-center gap-2 flex-1">
          <span className="text-xl">{getTypeIcon(safeItem.type)}</span>
          <span className="line-clamp-2">{safeItem.title}</span>
        </h3>
        {displayTime && (
          <span className="text-xs font-mono bg-white px-2 py-1 rounded shadow-sm ml-2 flex-shrink-0">
            {displayTime}
          </span>
        )}
      </div>

      {/* Description */}
      {safeItem.description && (
        <p className="text-sm text-gray-700 mb-3 line-clamp-3">
          {safeItem.description}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 text-xs">
        {safeItem.location && (
          <span className="bg-white bg-opacity-80 px-2 py-1 rounded flex items-center gap-1">
            <span className="truncate max-w-[120px]">{safeItem.location}</span>
          </span>
        )}
        {safeItem.speaker && (
          <span className="bg-white bg-opacity-80 px-2 py-1 rounded flex items-center gap-1">
            <span>👤</span>
            <span className="truncate max-w-[100px]">{safeItem.speaker}</span>
          </span>
        )}
        {safeItem.scheduleType && (
          <span className={`px-2 py-1 rounded text-xs font-medium ${getScheduleTypeColor(safeItem.scheduleType)}`}>
            {safeItem.scheduleType}
          </span>
        )}
      </div>

      {/* Room count indicator for parallel sessions */}
      {safeItem.rooms && safeItem.rooms.length > 1 && (
        <div className="mt-2 text-xs text-gray-600 bg-white bg-opacity-60 px-2 py-1 rounded">
          📊 +{safeItem.rooms.length - 1} more rooms
        </div>
      )}

      {/* ✅ ADDED: Debug info in development */}
      {process.env.NODE_ENV === 'development' && !item.type && (
        <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
          ⚠️ DEV: Using fallback type 'TALK'
        </div>
      )}
    </div>
  );
}