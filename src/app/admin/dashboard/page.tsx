"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Bike, TrendingUp, CheckCircle, Activity, DollarSign } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { StatCard } from "@/components/ui/StatCard";
import { useAuthStore } from "../../../../store/authStore";
import { Ride } from "../../../../types/index.types";
import { RideStatus } from "../../../../types/index.types";

interface AdminStats {
  totalUsers: number;
  totalCaptains: number;
  totalRides: number;
  completedRides: number;
  totalRevenue: number;
  completionRate: string;
}

const STATUS_BADGE: Record<RideStatus, string> = {
  REQUESTED: "bg-yellow-500/10 text-yellow-400",
  ACCEPTED: "bg-blue-500/10 text-blue-400",
  CAPTAIN_ARRIVED: "bg-purple-500/10 text-purple-400",
  IN_PROGRESS: "bg-orange-500/10 text-orange-400",
  COMPLETED: "bg-green-500/10 text-green-400",
  CANCELLED: "bg-red-500/10 text-red-400",
};

export default function AdminDashboardPage() {
  const { session } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentRides, setRecentRides] = useState<(Ride & { rider: { name: string }; captain?: { name: string } | null })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/stats", {
        headers: { authorization: `Bearer ${session?.accessToken}` },
      });
      const json = await res.json();
      if (json.success) {
        setStats(json.data.stats);
        setRecentRides(json.data.recentRides);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session?.accessToken) fetchData();
  }, [session, fetchData]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <div className="pt-20 pb-10 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center">
              <Activity size={20} className="text-[var(--primary)]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[var(--foreground)]">Admin Dashboard</h1>
              <p className="text-sm text-[var(--muted)]">Real-time platform overview</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-medium">System Operational</span>
          </div>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 h-28" />
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10 animate-fade-in">
            <StatCard label="Total Riders" value={stats.totalUsers.toLocaleString()} icon={<Users size={18} />} color="blue" />
            <StatCard label="Active Captains" value={stats.totalCaptains.toLocaleString()} icon={<Bike size={18} />} color="orange" />
            <StatCard label="Total Rides" value={stats.totalRides.toLocaleString()} icon={<TrendingUp size={18} />} color="purple" />
            <StatCard label="Completed Rides" value={stats.completedRides.toLocaleString()} icon={<CheckCircle size={18} />} color="green" />
            <StatCard label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={<DollarSign size={18} />} color="orange" />
            <StatCard label="Completion Rate" value={`${stats.completionRate}%`} icon={<Activity size={18} />} color="green" />
          </div>
        )}

        {/* Recent Rides */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
            <div>
              <h2 className="font-bold text-[var(--foreground)]">Recent Rides</h2>
              <p className="text-xs text-[var(--muted)]">Last 10 ride requests</p>
            </div>
            <button
              onClick={fetchData}
              className="text-xs text-[var(--primary)] font-semibold hover:underline"
            >
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-[var(--surface-2)] rounded w-1/2" />
                    <div className="h-2 bg-[var(--surface-2)] rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentRides.length === 0 ? (
            <div className="p-12 text-center text-[var(--muted)]">
              <p>No rides yet. Data will appear here once users start booking.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {["Rider", "Route", "Captain", "Fare", "Status", "Date"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {recentRides.map((ride) => (
                    <tr key={ride.id} className="hover:bg-[var(--surface-2)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-orange-500/10 flex items-center justify-center text-xs">
                            {ride.rider?.name?.[0] || "?"}
                          </div>
                          <span className="text-sm font-medium text-[var(--foreground)]">{ride.rider?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-[200px]">
                          <p className="text-xs text-[var(--muted)] truncate">{(ride as unknown as Record<string, string>).pickupAddress}</p>
                          <p className="text-xs text-[var(--foreground)] truncate">{(ride as unknown as Record<string, string>).dropAddress}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[var(--muted)]">{ride.captain?.name || "—"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-[var(--foreground)]">₹{ride.fare}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[ride.status]}`}>
                          {ride.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-[var(--muted)]">
                          {new Date(ride.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4 mt-8 animate-fade-in">
          {[
            { icon: "👤", title: "Manage Users", desc: "View, verify, and manage rider accounts", href: "#" },
            { icon: "🧑‍✈️", title: "Manage Captains", desc: "Verify captains and track performance", href: "#" },
            { icon: "📊", title: "Analytics", desc: "Deep insights into platform performance", href: "#" },
          ].map((action) => (
            <a
              key={action.title}
              href={action.href}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--primary)]/50 hover:bg-[var(--surface-2)] transition-all group cursor-pointer"
            >
              <div className="text-2xl mb-3 group-hover:scale-110 transition-transform inline-block">{action.icon}</div>
              <h3 className="font-bold text-[var(--foreground)] mb-1 text-sm">{action.title}</h3>
              <p className="text-xs text-[var(--muted)]">{action.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
