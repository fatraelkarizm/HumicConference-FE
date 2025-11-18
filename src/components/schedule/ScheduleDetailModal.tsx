import React from 'react';
import type { ScheduleItem } from '@/types/schedule';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  item: ScheduleItem | null;
};

export default function ScheduleDetailModal({ isOpen, onClose, item }: Props) {
  if (!isOpen || !item) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleUrlClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-2xl rounded-lg bg-white shadow-xl ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Schedule Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded p-1"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Title</h3>
              <p className="text-lg font-medium text-gray-900">{item.title}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Type</h3>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                item.scheduleType === 'PARALLEL' 
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {item.scheduleType || item.type}
              </span>
            </div>
          </div>

          {/* Time and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Date</h3>
              <p className="text-gray-900">{item.date}</p>
              {item.dayTitle && (
                <p className="text-sm text-gray-600">{item.dayTitle}</p>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Time</h3>
              <p className="text-gray-900">{item.timeDisplay || 'TBD'}</p>
            </div>
          </div>

          {/* Room and Topic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Room</h3>
              <p className="text-gray-900">{item.roomName || 'Main Room'}</p>
              {item.roomIdentifier && (
                <p className="text-sm text-gray-600">{item.roomIdentifier}</p>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Topic/Subject</h3>
              <p className="text-gray-900">{item.speaker || '-'}</p>
            </div>
          </div>

          {/* Moderator */}
          {item.moderator && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Moderator</h3>
              <p className="text-gray-900">{item.moderator}</p>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p className="text-gray-900 whitespace-pre-wrap">{item.description}</p>
            </div>
          )}

          {/* Online URL */}
          {item.onlineUrl && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Online Meeting</h3>
              <div className="flex items-center gap-2">
                <p className="text-blue-600 break-all">{item.onlineUrl}</p>
                <button
                  onClick={() => handleUrlClick(item.onlineUrl!)}
                  className="flex-shrink-0 inline-flex items-center px-3 py-1 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open Link
                </button>
              </div>
            </div>
          )}

          {/* Location Fallback */}
          {!item.onlineUrl && item.location && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
              <p className="text-gray-900">{item.location}</p>
            </div>
          )}

          {/* Additional Metadata */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Additional Info</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Schedule ID:</span>
                <span className="ml-2 font-mono text-gray-700">{item.id}</span>
              </div>
              <div>
                <span className="text-gray-500">Conference:</span>
                <span className="ml-2 text-gray-700">{item.conference || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}