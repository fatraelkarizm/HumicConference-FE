"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, FileUp, X } from "lucide-react";
import {
     Dialog,
     DialogContent,
     DialogHeader,
     DialogTitle,
     DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import * as XLSX from 'xlsx';

interface ManageImportExportModalProps {
     isOpen: boolean;
     onClose: () => void;
     onExport: () => void;
     onImport: (data: any[]) => Promise<void>;
     selectedDay: string;
}

export default function ManageImportExportModal({
     isOpen,
     onClose,
     onExport,
     onImport,
     selectedDay,
}: ManageImportExportModalProps) {
     const [loading, setLoading] = useState(false);
     const [uploadedFile, setUploadedFile] = useState<File | null>(null);
     const fileInputRef = useRef<HTMLInputElement>(null);

     const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (file) {
               if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
                    toast.error('Please upload an Excel file (.xlsx or .xls)');
                    return;
               }
               setUploadedFile(file);
          }
     };

     const handleImport = async () => {
          if (!uploadedFile) {
               toast.error('Please select a file first');
               return;
          }

          setLoading(true);
          try {
               const data = await readExcelFile(uploadedFile);
               await onImport(data);
               toast.success('Data imported successfully!');
               setUploadedFile(null);
               if (fileInputRef.current) {
                    fileInputRef.current.value = '';
               }
          } catch (error: any) {
               toast.error(error.message || 'Failed to import data');
          } finally {
               setLoading(false);
          }
     };

     const readExcelFile = (file: File): Promise<any[]> => {
          return new Promise((resolve, reject) => {
               const reader = new FileReader();

               reader.onload = (e) => {
                    try {
                         const data = e.target?.result;
                         const workbook = XLSX.read(data, { type: 'binary' });
                         const sheetName = workbook.SheetNames[0];
                         const worksheet = workbook.Sheets[sheetName];
                         const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                         // Find header row (first row with "Start" or similar)
                         let headerRowIndex = 0;
                         for (let i = 0; i < Math.min(5, jsonData.length); i++) {
                              const row: any = jsonData[i];
                              if (row && row.some((cell: any) => String(cell).toLowerCase().includes('start'))) {
                                   headerRowIndex = i;
                                   break;
                              }
                         }

                         const headerRow: any = jsonData[headerRowIndex];

                         // Helper function to convert Excel time serial number to HH:MM
                         const excelTimeToHHMM = (excelTime: any): string => {
                              if (typeof excelTime === 'string') {
                                   // Already a string, just clean it up
                                   return excelTime.trim();
                              }

                              if (typeof excelTime === 'number') {
                                   // Excel stores time as fraction of a day
                                   // 0.5 = 12:00, 0.25 = 06:00, etc.
                                   const totalMinutes = Math.round(excelTime * 24 * 60);
                                   const hours = Math.floor(totalMinutes / 60);
                                   const minutes = totalMinutes % 60;
                                   return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                              }

                              return '00:00';
                         };

                         // Parse data rows
                         const parsedData = jsonData.slice(headerRowIndex + 1).map((row: any) => {
                              const rowData: any = {};
                              headerRow.forEach((header: string, index: number) => {
                                   const headerLower = String(header).toLowerCase().trim();
                                   const value = row[index];

                                   if (headerLower.includes('start')) rowData.startTime = excelTimeToHHMM(value);
                                   else if (headerLower.includes('end')) rowData.endTime = excelTimeToHHMM(value);
                                   else if (headerLower.includes('duration')) rowData.duration = value;
                                   else if (headerLower.includes('main room')) rowData.mainRoomActivity = value;
                                   else if (headerLower.includes('room a')) rowData.roomA = value;
                                   else if (headerLower.includes('room b')) rowData.roomB = value;
                                   else if (headerLower.includes('room c')) rowData.roomC = value;
                                   else if (headerLower.includes('room d')) rowData.roomD = value;
                                   else if (headerLower.includes('room e')) rowData.roomE = value;
                              });

                              // Use selected day from conference table
                              rowData.date = new Date(selectedDay).toLocaleDateString('en-US', {
                                   weekday: 'long',
                                   year: 'numeric',
                                   month: 'long',
                                   day: 'numeric'
                              });

                              return rowData;
                         });

                         resolve(parsedData.filter(r => r.startTime)); // Filter out empty rows
                    } catch (error) {
                         reject(new Error('Failed to parse Excel file'));
                    }
               };

               reader.onerror = () => {
                    reject(new Error('Failed to read file'));
               };

               reader.readAsBinaryString(file);
          });
     };

     return (
          <Dialog open={isOpen} onOpenChange={onClose}>
               <DialogContent className="max-w-2xl">
                    <DialogHeader>
                         <DialogTitle>Manage Import / Export</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                         {/* Export Section */}
                         <div className="border rounded-lg p-4 bg-orange-50">
                              <div className="flex items-start gap-4">
                                   <div className="p-3 bg-orange-100 rounded-lg">
                                        <FileDown className="w-6 h-6 text-orange-600" />
                                   </div>
                                   <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 mb-1">Export to Excel</h4>
                                        <p className="text-sm text-gray-600 mb-3">
                                             Download current conference schedule as an Excel file
                                        </p>
                                        <Button
                                             onClick={onExport}
                                             size="sm"
                                             className="bg-orange-600 hover:bg-orange-700"
                                        >
                                             <FileDown className="w-4 h-4 mr-2" />
                                             Export Schedule
                                        </Button>
                                   </div>
                              </div>
                         </div>

                         {/* Import Section */}
                         <div className="border rounded-lg p-4 bg-blue-50">
                              <div className="flex items-start gap-4">
                                   <div className="p-3 bg-blue-100 rounded-lg">
                                        <FileUp className="w-6 h-6 text-blue-600" />
                                   </div>
                                   <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 mb-1">Import from Excel</h4>
                                        <p className="text-sm text-gray-600 mb-3">
                                             Upload an Excel file to automatically create schedules and rooms
                                        </p>

                                        <div className="space-y-3">
                                             {/* File Upload */}
                                             <div>
                                                  <input
                                                       ref={fileInputRef}
                                                       type="file"
                                                       accept=".xlsx,.xls"
                                                       onChange={handleFileSelect}
                                                       className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-100 file:text-blue-700
                        hover:file:bg-blue-200
                        cursor-pointer"
                                                  />
                                             </div>

                                             {uploadedFile && (
                                                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                                                       <span className="text-sm text-gray-700">{uploadedFile.name}</span>
                                                       <button
                                                            onClick={() => {
                                                                 setUploadedFile(null);
                                                                 if (fileInputRef.current) fileInputRef.current.value = '';
                                                            }}
                                                            className="text-gray-400 hover:text-gray-600"
                                                       >
                                                            <X className="w-4 h-4" />
                                                       </button>
                                                  </div>
                                             )}

                                             <Button
                                                  onClick={handleImport}
                                                  disabled={!uploadedFile || loading}
                                                  size="sm"
                                                  className="bg-blue-600 hover:bg-blue-700"
                                             >
                                                  <FileUp className="w-4 h-4 mr-2" />
                                                  {loading ? 'Importing...' : 'Import Schedule'}
                                             </Button>
                                        </div>

                                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                             <p className="text-xs text-yellow-800">
                                                  <strong>Note:</strong> Excel file must have columns: <strong>Start, End, Main Room, Room A, Room B, Room C, Room D, Room E</strong>.
                                                  The system will auto-detect headers. Room cells can contain detailed info (moderator, presenter, etc).
                                             </p>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    <DialogFooter>
                         <Button onClick={onClose} variant="outline">Close</Button>
                    </DialogFooter>
               </DialogContent>
          </Dialog>
     );
}
