"use client";

import { useEffect, useState } from "react";
import { Clock, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { RideCard } from "@/components/RideCard";
import { useAuthStore } from "../../../../store/authStore";
import { Ride } from "../../../../types/index.types";

export default function RideHistoryPage() {
  const { session } = useAuthStore();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!session?.accessToken) return;
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, page]);

  async function fetchHistory() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/rides?page=${page}`, {
        headers: { authorization: `Bearer ${session?.accessToken}` },
      });
      const json = await res.json();
      if (json.success) {
        setRides(json.data.rides);
        setTotalPages(json.data.pages);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  const stats = {
    total: rides.length,
    completed: rides.filter((r) => r.status === "COMPLETED").length,
    spent: rides.filter((r) => r.status === "COMPLETED").reduce((sum, r) => sum + r.fare, 0),
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <div className="pt-20 pb-10 px-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <Link href="/rider/book" className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors">
            <ChevronLeft size={18} className="text-[var(--muted)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[var(--foreground)]">Ride History</h1>
            <p className="text-sm text-[var(--muted)]">All your past journeys</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in">
          {[
            { label: "Total Rides", value: stats.total, icon: "🏍️" },
            { label: "Completed", value: stats.completed, icon: "✅" },
            { label: "Total Spent", value: `₹${stats.spent.toFixed(0)}`, icon: "💰" },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 text-center hover:border-[var(--primary)]/50 transition-all">
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="font-black text-[var(--foreground)] text-lg">{s.value}</p>
              <p className="text-xs text-[var(--muted)]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Rides List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-[var(--surface-2)] rounded mb-3 w-1/2" />
                <div className="h-3 bg-[var(--surface-2)] rounded mb-2 w-full" />
                <div className="h-3 bg-[var(--surface-2)] rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-[var(--surface)] flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-[var(--muted)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">No rides yet</h3>
            <p className="text-[var(--muted)] mb-6">Book your first ride to get started!</p>
            <Link
              href="/rider/book"
              className="inline-flex items-center gap-2 gradient-primary text-white font-semibold px-6 py-3 rounded-2xl hover:brightness-110 transition-all"
            >
              Book a Ride
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {rides.map((ride) => (
                <RideCard key={ride.id} ride={ride as unknown as Parameters<typeof RideCard>[0]["ride"]} viewAs="rider" />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--muted)] disabled:opacity-40 hover:border-[var(--primary)] transition-all"
                >
                  ← Prev
                </button>
                <span className="text-sm text-[var(--muted)]">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--muted)] disabled:opacity-40 hover:border-[var(--primary)] transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
