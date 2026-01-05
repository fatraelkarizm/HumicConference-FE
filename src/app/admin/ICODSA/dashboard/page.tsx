"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import conferenceScheduleService from "@/services/ConferenceScheduleService";
import type { BackendConferenceSchedule } from "@/types";
import {
     Calendar,
     Activity,
     BarChart3,
     CalendarDays,
     ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ICODSADashboardPage() {
     const { user, loading: authLoading } = useAuth();
     const router = useRouter();
     const [conferences, setConferences] = useState<BackendConferenceSchedule[]>([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          if (!authLoading && (!user || (user.role !== 'ADMIN_ICODSA' && user.role !== 'SUPER_ADMIN'))) {
               if (!user) router.push("/login");
          }
     }, [user, authLoading, router]);

     useEffect(() => {
          const fetchData = async () => {
               try {
                    const token = await conferenceScheduleService.getAccessToken();
                    if (token) {
                         const data = await conferenceScheduleService.getAllConferenceSchedules(token, false);
                         // Filter only ICODSA
                         const icodsaData = data.filter(c => c.type === 'ICODSA').sort((a, b) => parseInt(b.year) - parseInt(a.year));
                         setConferences(icodsaData);
                    }
               } catch {
               } finally {
                    setLoading(false);
               }
          };

          if (user) {
               fetchData();
          }
     }, [user]);

     if (authLoading || loading) {
          return (
               <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#015B97]"></div>
               </div>
          );
     }

     const activeConference = conferences.find(c => c.is_active);
     const totalConferences = conferences.length;
     const latestConference = conferences[0];

     return (
          <div className="min-h-screen bg-gray-50/50 p-6 space-y-8">
               {/* 1. Welcome & Header */}
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                         <h1 className="text-3xl font-bold text-[#015B97]">
                              ICoDSA Admin Dashboard
                         </h1>
                         <p className="text-gray-500 mt-1">Manage your ICoDSA conference events and schedules.</p>
                    </div>
                    <Button onClick={() => router.push('/admin/ICODSA')} className="bg-[#015B97] hover:bg-[#014f7a]">
                         <CalendarDays className="w-4 h-4 mr-2" />
                         Manage Schedule
                    </Button>
               </div>

               {/* 2. Key Metrics */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Total Events */}
                    <Card className="border-none shadow-sm bg-[#015B97] text-white">
                         <CardContent className="p-6">
                              <div className="flex justify-between items-start">
                                   <div>
                                        <p className="text-blue-100 text-sm font-medium">Total Events</p>
                                        <h3 className="text-3xl font-bold mt-2">{totalConferences}</h3>
                                   </div>
                                   <div className="p-2 bg-white/20 rounded-lg">
                                        <BarChart3 className="w-6 h-6 text-white" />
                                   </div>
                              </div>
                              <div className="mt-4 flex items-center text-blue-100 text-sm">
                                   <Activity className="w-4 h-4 mr-1" />
                                   <span>ICoDSA Conferences</span>
                              </div>
                         </CardContent>
                    </Card>

                    {/* Active Session */}
                    <Card className="border-none shadow-sm bg-white border border-gray-100">
                         <CardContent className="p-6">
                              <div className="flex justify-between items-start">
                                   <div>
                                        <p className="text-gray-500 text-sm font-medium">Active Conference</p>
                                        <h3 className="text-2xl font-bold mt-2 text-gray-900">
                                             {activeConference ? activeConference.year : 'None'}
                                        </h3>
                                        <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200">
                                             {activeConference ? 'Live' : 'Inactive'}
                                        </Badge>
                                   </div>
                                   <div className="p-2 bg-green-100 rounded-lg">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                   </div>
                              </div>
                         </CardContent>
                    </Card>

                    {/* Latest */}
                    <Card className="border-none shadow-sm bg-white border border-gray-100">
                         <CardContent className="p-6">
                              <div className="flex justify-between items-start">
                                   <div>
                                        <p className="text-gray-500 text-sm font-medium">Most Recent</p>
                                        <h3 className="text-2xl font-bold mt-2 text-gray-900">
                                             {latestConference ? latestConference.year : 'N/A'}
                                        </h3>
                                        <div className="text-xs text-gray-500 mt-1">
                                             {latestConference ? new Date(latestConference.start_date).toLocaleDateString() : '-'}
                                        </div>
                                   </div>
                                   <div className="p-2 bg-blue-50 rounded-lg">
                                        <Calendar className="w-6 h-6 text-[#015B97]" />
                                   </div>
                              </div>
                         </CardContent>
                    </Card>
               </div>

               {/* 3. History Table */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                         <h2 className="text-lg font-semibold text-gray-900">Conference History</h2>
                    </div>

                    <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
                         <div className="col-span-4">Conference Year</div>
                         <div className="col-span-5">Date</div>
                         <div className="col-span-3 text-right">Action</div>
                    </div>

                    <div className="divide-y divide-gray-100">
                         {conferences.map((conf) => (
                              <div key={conf.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
                                   <div className="col-span-4">
                                        <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#015B97] flex items-center justify-center text-xs font-bold">
                                                  {conf.year.substring(2)}
                                             </div>
                                             <div>
                                                  <p className="font-medium text-gray-900">{conf.name}</p>
                                                  <div className="flex items-center gap-2 mt-0.5">
                                                       {conf.is_active && (
                                                            <span className="inline-flex items-center text-[10px] font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">
                                                                 Active
                                                            </span>
                                                       )}
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="col-span-5 text-sm text-gray-600">
                                        <span>{new Date(conf.start_date).toLocaleDateString()}</span>
                                        <span className="text-gray-400 mx-2">-</span>
                                        <span>{new Date(conf.end_date).toLocaleDateString()}</span>
                                   </div>
                                   <div className="col-span-3 text-right">
                                        <Button
                                             variant="ghost"
                                             size="sm"
                                             className="text-[#015B97] hover:text-[#014f7a] hover:bg-blue-50"
                                             onClick={() => router.push(`/admin/ICODSA?year=${conf.year}`)}
                                        >
                                             Manage <ArrowRight className="w-3 h-3 ml-1" />
                                        </Button>
                                   </div>
                              </div>
                         ))}

                         {conferences.length === 0 && (
                              <div className="p-8 text-center text-gray-500">
                                   No conferences found.
                              </div>
                         )}
                    </div>
               </div>
          </div>
     );
}
