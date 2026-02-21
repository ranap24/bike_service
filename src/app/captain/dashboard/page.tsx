"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Bike, Power, MapPin, Star, Clock, ChevronRight, TrendingUp,
  Phone, Shield, CheckCircle, Navigation, AlertCircle, X,
  IndianRupee, Timer, Zap, BarChart3,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "../../../../store/authStore";

/* ─── Dummy data ────────────────────────────────────────────── */
const DUMMY_WEEKLY_EARNINGS = [
  { day: "Mon", amount: 480 },
  { day: "Tue", amount: 720 },
  { day: "Wed", amount: 310 },
  { day: "Thu", amount: 890 },
  { day: "Fri", amount: 1120 },
  { day: "Sat", amount: 650 },
  { day: "Sun", amount: 0 },
];

const DUMMY_RIDE_REQUESTS = [
  { id: "r1", riderName: "Arjun Mehta",    riderRating: 4.7, pickup: "Koramangala 5th Block, Bengaluru", drop: "MG Road Metro Station, Bengaluru", distance: 4.2, duration: 14, fare: 89,  vehicleType: "BIKE" },
  { id: "r2", riderName: "Priya Sharma",   riderRating: 4.9, pickup: "HSR Layout Sector 1, Bengaluru",  drop: "Indiranagar 100 Feet Rd, Bengaluru", distance: 6.8, duration: 22, fare: 148, vehicleType: "AUTO" },
  { id: "r3", riderName: "Rahul Verma",    riderRating: 4.5, pickup: "Whitefield Main Rd, Bengaluru",   drop: "Marathahalli Bridge, Bengaluru",     distance: 3.1, duration: 10, fare: 65,  vehicleType: "BIKE" },
  { id: "r4", riderName: "Sneha Kulkarni", riderRating: 4.8, pickup: "Jayanagar 4th Block, Bengaluru",  drop: "Lalbagh Botanical Garden, Bengaluru",distance: 2.4, duration: 9,  fare: 52,  vehicleType: "BIKE" },
];

const DUMMY_HISTORY = [
  { id: "h1", riderName: "Amit Joshi",   pickup: "Silk Board Junction, Bengaluru", drop: "Electronic City Phase 1, Bengaluru", fare: 142, distance: 8.2, duration: 28, time: "2h ago",   status: "COMPLETED" },
  { id: "h2", riderName: "Kavya Nair",   pickup: "JP Nagar 7th Phase, Bengaluru",  drop: "Bannerghatta Rd, Bengaluru",          fare: 78,  distance: 4.5, duration: 16, time: "4h ago",   status: "COMPLETED" },
  { id: "h3", riderName: "Raju Bhat",    pickup: "Richmond Road, Bengaluru",       drop: "Church Street, Bengaluru",             fare: 45,  distance: 2.1, duration: 8,  time: "Yesterday", status: "COMPLETED" },
  { id: "h4", riderName: "Meena Reddy",  pickup: "Marathahalli, Bengaluru",        drop: "Outer Ring Rd, Bengaluru",             fare: 0,   distance: 5.7, duration: 0,  time: "Yesterday", status: "CANCELLED" },
  { id: "h5", riderName: "Sujit Kumar",  pickup: "Hebbal Flyover, Bengaluru",      drop: "Yelahanka New Town, Bengaluru",        fare: 198, distance: 11.3,duration: 35, time: "2 days ago", status: "COMPLETED" },
];

interface CaptainProfile {
  id: string; name: string; email: string; phone: string;
  vehicleType: string; vehiclePlate: string; vehicleModel: string; vehicleColor: string;
  isOnline: boolean; isVerified: boolean; rating: number; totalRides: number;
}

type CaptainStep = "idle" | "incoming" | "active" | "completed";

interface ActiveRide {
  id: string; riderName: string; riderRating: number; pickup: string; drop: string;
  distance: number; duration: number; fare: number; otp: string;
  rideStatus: "arrived" | "started" | "completed";
}

function generateOTP() { return String(Math.floor(1000 + Math.random() * 9000)); }

/* ─── Component ──────────────────────────────────────────────── */
export default function CaptainDashboardPage() {
  const { session } = useAuthStore();
  const [profile, setProfile] = useState<CaptainProfile | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "history">("home");
  const [captainStep, setCaptainStep] = useState<CaptainStep>("idle");
  const [incomingRide, setIncomingRide] = useState<typeof DUMMY_RIDE_REQUESTS[0] | null>(null);
  const [countdown, setCountdown] = useState(15);
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null);
  const [isTogglingOnline, setIsTogglingOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rideHistory, setRideHistory] = useState(DUMMY_HISTORY);
  const incomingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const rideIndexRef = useRef(0);

  const headers = { authorization: `Bearer ${session?.accessToken}` };
  const todayEarnings = rideHistory.filter((r) => r.status === "COMPLETED" && (r.time.includes("h ago") || r.time === "Just now")).reduce((s, r) => s + r.fare, 0);
  const weekEarnings = DUMMY_WEEKLY_EARNINGS.reduce((s, d) => s + d.amount, 0);
  const maxEarnings = Math.max(...DUMMY_WEEKLY_EARNINGS.map((d) => d.amount));

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/captain", { headers });
      const json = await res.json();
      if (json.success) { setProfile(json.data); setIsOnline(json.data.isOnline); }
    } catch { /* ignore */ } finally { setIsLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => { if (session?.accessToken) fetchProfile(); }, [session, fetchProfile]);

  // Trigger incoming rides when online
  useEffect(() => {
    if (!isOnline || captainStep !== "idle") { clearTimeout(incomingTimerRef.current!); return; }
    function scheduleNext() {
      const delay = 5000 + Math.random() * 8000;
      incomingTimerRef.current = setTimeout(() => {
        const ride = DUMMY_RIDE_REQUESTS[rideIndexRef.current % DUMMY_RIDE_REQUESTS.length];
        rideIndexRef.current++;
        setIncomingRide(ride);
        setCountdown(15);
        setCaptainStep("incoming");
      }, delay);
    }
    scheduleNext();
    return () => clearTimeout(incomingTimerRef.current!);
  }, [isOnline, captainStep]);

  // Countdown timer for incoming ride
  useEffect(() => {
    if (captainStep !== "incoming") return;
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!);
          setIncomingRide(null);
          setCaptainStep("idle");
          return 15;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current!);
  }, [captainStep]);

  useEffect(() => () => {
    clearTimeout(incomingTimerRef.current!);
    clearInterval(countdownRef.current!);
  }, []);

  async function toggleOnline() {
    setIsTogglingOnline(true);
    try {
      const res = await fetch("/api/captain", {
        method: "PATCH", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_online", isOnline: !isOnline }),
      });
      const json = await res.json();
      if (json.success) setIsOnline(!isOnline);
      else setIsOnline((v) => !v); // optimistic on demo
    } catch { setIsOnline((v) => !v); }
    finally { setIsTogglingOnline(false); }
  }

  function acceptRide() {
    if (!incomingRide) return;
    clearInterval(countdownRef.current!);
    setActiveRide({
      id: incomingRide.id, riderName: incomingRide.riderName, riderRating: incomingRide.riderRating,
      pickup: incomingRide.pickup, drop: incomingRide.drop, distance: incomingRide.distance,
      duration: incomingRide.duration, fare: incomingRide.fare, otp: generateOTP(), rideStatus: "arrived",
    });
    setIncomingRide(null);
    setCaptainStep("active");
  }

  function declineRide() {
    clearInterval(countdownRef.current!);
    setIncomingRide(null);
    setCaptainStep("idle");
  }

  function advanceRideStatus() {
    if (!activeRide) return;
    if (activeRide.rideStatus === "arrived") setActiveRide({ ...activeRide, rideStatus: "started" });
    else if (activeRide.rideStatus === "started") setActiveRide({ ...activeRide, rideStatus: "completed" });
    else { setCaptainStep("completed"); }
  }

  function finishRide() {
    if (activeRide) {
      const completedEntry = {
        id: `session-${Date.now()}`,
        riderName: activeRide.riderName,
        pickup: activeRide.pickup,
        drop: activeRide.drop,
        fare: activeRide.fare,
        distance: activeRide.distance,
        duration: activeRide.duration,
        time: "Just now",
        status: "COMPLETED",
      };
      setRideHistory((prev) => [completedEntry, ...prev]);
    }
    setCaptainStep("idle");
    setActiveRide(null);
  }

  if (isLoading) return (
    <div className="min-h-screen bg-[var(--background)]"><Navbar />
      <div className="pt-20 px-4 max-w-2xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-[var(--surface)] border border-[var(--border)] rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <div className="pt-20 pb-12 max-w-2xl mx-auto">

        {/* ── INCOMING RIDE MODAL ──────────────────────────────── */}
        {captainStep === "incoming" && incomingRide && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm px-4 pb-6 animate-fade-in">
            <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--primary)] rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/20">
              {/* Countdown strip */}
              <div className="relative h-1.5 bg-[var(--border)]">
                <div className="absolute inset-y-0 left-0 bg-[var(--primary)] transition-all duration-1000 ease-linear" style={{ width: `${(countdown / 15) * 100}%` }} />
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                      <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">New Ride Request</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-semibold text-[var(--foreground)]">{incomingRide.riderName}</span>
                      <span className="text-xs text-[var(--muted)]">({incomingRide.riderRating}★)</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full border-4 border-[var(--primary)] flex items-center justify-center">
                    <span className="text-lg font-black text-[var(--primary)]">{countdown}</span>
                  </div>
                </div>

                {/* Route */}
                <div className="bg-[var(--surface-2)] rounded-2xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-1 mt-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      <div className="w-px h-8 border-l-2 border-dashed border-[var(--border)]" />
                      <MapPin size={12} className="text-red-400" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-semibold text-[var(--foreground)] leading-snug">{incomingRide.pickup}</p>
                      <p className="text-sm text-[var(--muted)] leading-snug">{incomingRide.drop}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 pt-3 border-t border-[var(--border)]">
                    <span className="text-xs text-[var(--muted)] flex items-center gap-1"><MapPin size={10} /> {incomingRide.distance} km</span>
                    <span className="text-xs text-[var(--muted)] flex items-center gap-1"><Clock size={10} /> {incomingRide.duration} min</span>
                    <span className="text-xs font-bold text-green-400 flex items-center gap-1 ml-auto"><IndianRupee size={10} /> ₹{incomingRide.fare}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={declineRide} className="flex-1 py-3.5 rounded-2xl text-sm font-bold border-2 border-red-500/40 text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2">
                    <X size={16} /> Decline
                  </button>
                  <Button fullWidth size="lg" onClick={acceptRide}>
                    <CheckCircle size={16} /> Accept  ₹{incomingRide.fare}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIVE RIDE PANEL ────────────────────────────────── */}
        {captainStep === "active" && activeRide && (
          <div className="px-4 animate-fade-in">
            {/* Active ride header */}
            <div className="mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 mb-3">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs font-semibold text-blue-400">
                  {activeRide.rideStatus === "arrived" ? "Navigate to Pickup" : activeRide.rideStatus === "started" ? "Ride in Progress" : "Almost Done!"}
                </span>
              </div>
              <h2 className="text-2xl font-black text-[var(--foreground)]">Active Ride</h2>
            </div>

            {/* Rider card */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5 mb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl font-black text-white">
                  {activeRide.riderName[0]}
                </div>
                <div className="flex-1">
                  <p className="font-black text-[var(--foreground)] text-lg">{activeRide.riderName}</p>
                  <div className="flex items-center gap-1">
                    <Star size={11} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-[var(--muted)]">{activeRide.riderRating}★ Rider</span>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 hover:bg-green-500/20 transition-all">
                  <Phone size={16} />
                </button>
              </div>

              {/* Progress steps */}
              <div className="flex items-center mb-5">
                {["Accepted", "En Route", "Arrived", "In Ride", "Done"].map((s, i, arr) => {
                  const doneCount = activeRide.rideStatus === "arrived" ? 3 : activeRide.rideStatus === "started" ? 4 : 5;
                  return (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${i < doneCount ? "bg-[var(--primary)] border-[var(--primary)]" : "border-[var(--border)] bg-[var(--surface-2)]"}`}>
                          {i < doneCount && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className="text-[9px] text-[var(--muted)] whitespace-nowrap">{s}</span>
                      </div>
                      {i < arr.length - 1 && <div className={`flex-1 h-px mt-[-10px] transition-all ${i < doneCount - 1 ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`} />}
                    </div>
                  );
                })}
              </div>

              {/* Route */}
              <div className="bg-[var(--surface-2)] rounded-2xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 mt-0.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    <div className="w-px h-7 border-l-2 border-dashed border-[var(--border)]" />
                    <MapPin size={12} className="text-red-400" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-semibold text-[var(--foreground)]">{activeRide.pickup}</p>
                    <p className="text-sm text-[var(--muted)]">{activeRide.drop}</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 pt-3 border-t border-[var(--border)]">
                  <span className="text-xs text-[var(--muted)]">📍 {activeRide.distance} km</span>
                  <span className="text-xs text-[var(--muted)]">⏱ {activeRide.duration} min</span>
                  <span className="text-xs font-bold text-green-400 ml-auto">₹{activeRide.fare}</span>
                </div>
              </div>

              {/* OTP verification */}
              {activeRide.rideStatus === "arrived" && (
                <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border border-orange-500/30 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1"><Shield size={13} className="text-[var(--primary)]" /><span className="text-xs font-semibold text-[var(--primary)]">Ask rider for OTP</span></div>
                    <p className="text-xs text-[var(--muted)]">Verify before starting ride</p>
                  </div>
                  <div className="flex gap-1.5">
                    {activeRide.otp.split("").map((digit, i) => (
                      <div key={i} className="w-10 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center">
                        <span className="text-xl font-black text-white">{digit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action button */}
            <Button fullWidth size="lg" onClick={advanceRideStatus}
              variant={activeRide.rideStatus === "completed" ? "primary" : "primary"}>
              {activeRide.rideStatus === "arrived" && <><Navigation size={16} /> Start Ride (OTP Verified)</>}
              {activeRide.rideStatus === "started" && <><CheckCircle size={16} /> Complete Ride</>}
              {activeRide.rideStatus === "completed" && <><CheckCircle size={16} /> Finish & Collect ₹{activeRide.fare}</>}
            </Button>
          </div>
        )}

        {/* ── RIDE COMPLETED ───────────────────────────────────── */}
        {captainStep === "completed" && activeRide && (
          <div className="px-4 animate-fade-in text-center py-10">
            <div className="w-24 h-24 rounded-3xl bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-5">
              <span className="text-5xl">🎉</span>
            </div>
            <h2 className="text-2xl font-black text-[var(--foreground)] mb-1">Ride Completed!</h2>
            <p className="text-[var(--muted)] text-sm mb-6">Great job, {profile?.name?.split(" ")[0]}!</p>

            <div className="bg-[var(--surface)] border border-green-500/30 rounded-3xl p-6 mb-6 text-left">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-[var(--muted)]">Rider</span>
                <span className="font-semibold text-[var(--foreground)]">{activeRide.riderName}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-[var(--muted)]">Distance</span>
                <span className="text-[var(--foreground)]">{activeRide.distance} km</span>
              </div>
              <div className="flex items-center justify-between mb-3 pt-3 border-t border-[var(--border)]">
                <span className="text-[var(--muted)]">Earnings</span>
                <span className="text-2xl font-black text-green-400">₹{activeRide.fare}</span>
              </div>
            </div>

            <Button fullWidth size="lg" onClick={() => { finishRide(); setActiveTab("history"); }}>
              <Zap size={16} /> Back to Dashboard
            </Button>
          </div>
        )}

        {/* ── MAIN DASHBOARD ───────────────────────────────────── */}
        {(captainStep === "idle" || captainStep === "incoming") && (
          <div className="px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 animate-fade-in">
              <div>
                <p className="text-xs text-[var(--muted)] mb-0.5">Welcome back,</p>
                <h1 className="text-2xl font-black text-[var(--foreground)]">
                  {profile?.name ?? session?.captain?.name ?? "Captain"} 👋
                </h1>
              </div>
              <Button variant={isOnline ? "danger" : "primary"} onClick={toggleOnline} isLoading={isTogglingOnline} size="sm">
                <Power size={14} /> {isOnline ? "Go Offline" : "Go Online"}
              </Button>
            </div>

            {/* Online status banner */}
            {isOnline ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-5 animate-slide-in">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                  <div>
                    <p className="text-sm font-bold text-green-400">You&apos;re online</p>
                    <p className="text-xs text-green-400/70">Accepting ride requests near Bengaluru</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-green-400/70">~3 captains nearby</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl p-4 mb-5">
                <div className="flex items-center gap-3">
                  <AlertCircle size={16} className="text-[var(--muted)]" />
                  <p className="text-sm text-[var(--muted)]">Go online to start receiving ride requests</p>
                </div>
              </div>
            )}

            {/* Earnings hero */}
            <div className="bg-gradient-to-br from-orange-500/15 to-orange-600/5 border border-orange-500/25 rounded-3xl p-5 mb-5 animate-fade-in">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-[var(--muted)] mb-1">Today&apos;s Earnings</p>
                  <p className="text-4xl font-black text-[var(--foreground)]">₹{todayEarnings}</p>
                  <p className="text-xs text-green-400 mt-1">↑ ₹{weekEarnings} this week</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--muted)] mb-1">Trips Today</p>
                  <p className="text-2xl font-black text-[var(--primary)]">{rideHistory.filter(r => r.status === "COMPLETED" && (r.time.includes("h ago") || r.time === "Just now")).length}</p>
                </div>
              </div>

              {/* Weekly bar chart */}
              <div className="flex items-end gap-1.5 h-14">
                {DUMMY_WEEKLY_EARNINGS.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-sm transition-all"
                      style={{ height: `${maxEarnings > 0 ? (d.amount / maxEarnings) * 44 : 0}px`, minHeight: d.amount > 0 ? "4px" : "0", backgroundColor: d.day === "Sun" ? "var(--border)" : "rgba(249, 115, 22, 0.5)" }} />
                    <span className="text-[9px] text-[var(--muted)]">{d.day[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 mb-5 animate-fade-in">
              {[
                { icon: <Star size={14} />, label: "Rating", value: profile?.rating?.toFixed(1) ?? "4.8", color: "text-yellow-400 bg-yellow-500/10" },
                { icon: <Bike size={14} />, label: "Total", value: profile?.totalRides ?? 1247, color: "text-blue-400 bg-blue-500/10" },
                { icon: <Timer size={14} />, label: "Online", value: "6.2h", color: "text-purple-400 bg-purple-500/10" },
                { icon: <MapPin size={14} />, label: "Status", value: profile?.isVerified ? "✓ Verified" : "Pending", color: "text-green-400 bg-green-500/10" },
              ].map((stat) => (
                <div key={stat.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3 text-center hover:border-[var(--primary)]/40 transition-all">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center mb-1.5 mx-auto ${stat.color}`}>{stat.icon}</div>
                  <p className="font-bold text-[var(--foreground)] text-xs leading-tight">{stat.value}</p>
                  <p className="text-[10px] text-[var(--muted)]">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Vehicle info */}
            {profile && (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 mb-5 animate-fade-in">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-2xl">
                    {profile.vehicleType === "BIKE" ? "🏍️" : profile.vehicleType === "AUTO" ? "🛺" : "🚗"}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[var(--foreground)] text-sm">{profile.vehicleModel}</p>
                    <p className="text-xs text-[var(--muted)]">{profile.vehicleColor}</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-[var(--primary)] bg-orange-500/10 px-2.5 py-1.5 rounded-xl border border-[var(--primary)]/30">
                    {profile.vehiclePlate}
                  </span>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-5 p-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-2xl">
              {(["home", "history"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab ? "bg-[var(--primary)] text-white shadow-lg shadow-orange-500/20" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}>
                  {tab === "home" ? "🏠 Dashboard" : "📋 History"}
                </button>
              ))}
            </div>

            {/* HOME tab */}
            {activeTab === "home" && (
              <div className="space-y-4 animate-fade-in">
                {/* Tip of day */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0"><BarChart3 size={16} className="text-blue-400" /></div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)] mb-0.5">Peak hours: 8–10 AM, 5–8 PM</p>
                    <p className="text-xs text-[var(--muted)]">You earn 2× more during surge pricing at these times. Stay online!</p>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={14} className="text-green-400" />
                      <span className="text-xs text-[var(--muted)]">Acceptance Rate</span>
                    </div>
                    <p className="text-2xl font-black text-[var(--foreground)]">87%</p>
                    <p className="text-xs text-green-400">↑ 3% this week</p>
                  </div>
                  <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} className="text-orange-400" />
                      <span className="text-xs text-[var(--muted)]">Distance Today</span>
                    </div>
                    <p className="text-2xl font-black text-[var(--foreground)]">38 km</p>
                    <p className="text-xs text-[var(--muted)]">5 completed trips</p>
                  </div>
                </div>

                {!isOnline && (
                  <div className="text-center py-8 border-2 border-dashed border-[var(--border)] rounded-2xl">
                    <p className="text-[var(--muted)] text-sm mb-3">Go online to start receiving rides</p>
                    <Button onClick={toggleOnline} isLoading={isTogglingOnline}><Power size={14} /> Go Online</Button>
                  </div>
                )}

                {isOnline && (
                  <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 text-center">
                    <div className="flex justify-center gap-1.5 mb-3">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">Looking for rides near you...</p>
                    <p className="text-xs text-[var(--muted)] mt-1">A ride request will appear in a few seconds</p>
                  </div>
                )}
              </div>
            )}

            {/* HISTORY tab */}
            {activeTab === "history" && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-[var(--foreground)]">Recent rides</p>
                  <span className="text-xs text-[var(--muted)]">₹{rideHistory.filter(r => r.status === "COMPLETED").reduce((s, r) => s + r.fare, 0)} total</span>
                </div>
                {rideHistory.map((ride) => (
                  <div key={ride.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 hover:border-[var(--primary)]/40 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-[var(--foreground)] text-sm">{ride.riderName}</p>
                        <p className="text-xs text-[var(--muted)]">{ride.time}</p>
                      </div>
                      <div className="text-right">
                        {ride.status === "COMPLETED"
                          ? <p className="font-black text-green-400">+₹{ride.fare}</p>
                          : <p className="text-xs font-semibold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/30">Cancelled</p>
                        }
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                      <span className="flex items-center gap-1"><MapPin size={10} /> {ride.distance} km</span>
                      <span className="flex items-center gap-1"><Clock size={10} /> {ride.duration} min</span>
                    </div>
                    <div className="mt-2 text-xs text-[var(--muted)] truncate">
                      <span className="text-green-400/60">↑</span> {ride.pickup.split(",")[0]} → {ride.drop.split(",")[0]}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

