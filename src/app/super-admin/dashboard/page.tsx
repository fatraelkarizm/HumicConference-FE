"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import conferenceScheduleService from "@/services/ConferenceScheduleService";
import type { BackendConferenceSchedule } from "@/types";
import {
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  Activity,
  BarChart3,
  CalendarDays
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [conferences, setConferences] = useState<BackendConferenceSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  // Checks and redirects
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login"); // or whatever your login route is
    }
  }, [user, authLoading, router]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await conferenceScheduleService.getAccessToken();
        if (token) {
          const data = await conferenceScheduleService.getAllConferenceSchedules(token, false);
          setConferences(data);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // --- Statistics Calculation ---
  const totalConferences = conferences.length;
  const icicytaConferences = conferences.filter(c => c.type === 'ICICYTA').sort((a, b) => parseInt(b.year) - parseInt(a.year));
  const icodsaConferences = conferences.filter(c => c.type === 'ICODSA').sort((a, b) => parseInt(b.year) - parseInt(a.year));
  const activeConference = conferences.find(c => c.is_active);

  // Get latest
  const latestIcicyta = icicytaConferences[0];
  const latestIcodsa = icodsaConferences[0];

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-8">
      {/* 1. Welcome & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your conferences today.</p>
        </div>
        <div className="flex gap-3">
          {/* Quick Action Buttons */}
          <Button onClick={() => router.push('/super-admin/ICICYTA')} className="bg-[#015B97] hover:bg-[#014f7a]">
            Manage ICICyTA
          </Button>
          <Button onClick={() => router.push('/super-admin/ICODSA')} variant="outline" className="border-[#015B97] text-[#015B97] hover:bg-blue-50">
            Manage ICODSA
          </Button>
        </div>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Conferences */}
        <Card className="border-none shadow-sm bg-[#015B97] text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Conferences</p>
                <h3 className="text-3xl font-bold mt-2">{totalConferences}</h3>
              </div>
              <div className="p-2 bg-white/20 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-blue-100 text-sm">
              <Activity className="w-4 h-4 mr-1" />
              <span>All time history</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Session */}
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Conference</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900">
                  {activeConference ? activeConference.year : 'None'}
                </h3>
                <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200">
                  {activeConference ? activeConference.type : 'Inactive'}
                </Badge>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Currently accessible by users
            </div>
          </CardContent>
        </Card>

        {/* ICICyTA Stats */}
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">ICICyTA Events</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900">{icicytaConferences.length}</h3>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Latest: <span className="font-medium text-gray-700">{latestIcicyta?.year || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        {/* ICODSA Stats */}
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">ICODSA Events</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900">{icodsaConferences.length}</h3>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Latest: <span className="font-medium text-gray-700">{latestIcodsa?.year || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Recent Conferences List (History) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Conference History</h2>
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              View All
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
              <div className="col-span-4">Conference</div>
              <div className="col-span-3">Date</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {conferences
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort by created (newest first) or year
                .slice(0, 5) // Top 5
                .map((conf) => (
                  <div key={conf.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
                    <div className="col-span-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${conf.type === 'ICICYTA' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                          {conf.type[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{conf.name}</p>
                          <p className="text-xs text-gray-500">{conf.type} • {conf.year}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-3 text-sm text-gray-600 flex flex-col">
                      <span>{new Date(conf.start_date).toLocaleDateString()}</span>
                      <span className="text-xs text-gray-400">to {new Date(conf.end_date).toLocaleDateString()}</span>
                    </div>
                    <div className="col-span-3">
                      {conf.is_active ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500 border-gray-200">Archived</Badge>
                      )}
                    </div>
                    <div className="col-span-2 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-blue-600"
                        onClick={() => router.push(`/super-admin/${conf.type}?year=${conf.year}`)}
                      >
                        <ArrowRight className="w-4 h-4" />
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

        {/* Side Panel / Quick Stats */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Overview</h2>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-6">
            {/* Total Presentation Types (Estimated) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Presentation Types</span>
                <Badge variant="secondary" className="text-xs">Distribution</Badge>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-md">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Onsite</p>
                      <p className="text-xs text-gray-500">Physical attendance</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-md">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Online / Hybrid</p>
                      <p className="text-xs text-gray-500">Remote participation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Navigation</h4>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-blue-600 hover:bg-blue-50" onClick={() => router.push('/super-admin/ICICYTA')}>
                  <CalendarDays className="w-4 h-4 mr-2" />
                  ICICYTA Schedule
                </Button>
                <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-orange-600 hover:bg-orange-50" onClick={() => router.push('/super-admin/ICODSA')}>
                  <CalendarDays className="w-4 h-4 mr-2" />
                  ICODSA Schedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
