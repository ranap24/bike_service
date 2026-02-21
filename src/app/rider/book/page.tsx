"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapPin, Navigation, Bike, Car, Clock, ChevronRight,
  X, Star, Phone, MessageSquare, Shield, Zap, Users,
  CheckCircle, Wallet, Banknote, CreditCard, ChevronDown,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "../../../../store/authStore";
import { fetchWithAuth } from "../../../../utils/fetchWithAuth";
import { useRideStore } from "../../../../store/rideStore";
import { VehicleType, FareEstimate } from "../../../../types/index.types";

/* ─── Static dummy data ──────────────────────────────────────── */
const POPULAR_LOCATIONS = [
  { label: "MG Road",      address: "MG Road, Halasuru, Bengaluru, KA 560025" },
  { label: "Koramangala",  address: "Koramangala 5th Block, Bengaluru, KA 560095" },
  { label: "Airport",      address: "Kempegowda International Airport, Devanahalli, Bengaluru" },
  { label: "Whitefield",   address: "Whitefield Main Rd, Whitefield, Bengaluru, KA 560066" },
  { label: "HSR Layout",   address: "HSR Layout, Bengaluru, KA 560102" },
  { label: "Indiranagar",  address: "Indiranagar 100 Feet Rd, Bengaluru, KA 560038" },
];

const DUMMY_CAPTAINS = [
  { name: "Rajesh Kumar",   rating: 4.8, trips: 1247, plate: "KA 05 AB 1234", model: "Honda Activa 6G",    vehicleType: "BIKE" as VehicleType, color: "Matte Black",  phone: "+91 98765 43210", avatar: "R" },
  { name: "Suresh Nair",    rating: 4.6, trips: 892,  plate: "KA 03 CD 5678", model: "Bajaj RE Compact",   vehicleType: "AUTO" as VehicleType, color: "Yellow",       phone: "+91 91234 56789", avatar: "S" },
  { name: "Pradeep Shetty", rating: 4.9, trips: 2341, plate: "KA 01 EF 9012", model: "Maruti Swift Dzire", vehicleType: "CAR"  as VehicleType, color: "Pearl White",  phone: "+91 87654 32109", avatar: "P" },
];

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash", icon: <Banknote size={16} />, desc: "Pay on arrival" },
  { id: "upi",  label: "UPI",  icon: <Wallet  size={16} />, desc: "GPay / PhonePe"  },
  { id: "card", label: "Card", icon: <CreditCard size={16} />, desc: "Credit / Debit" },
];

const VEHICLE_META: Record<VehicleType, { capacity: string; badge?: string; etaOffset: number }> = {
  BIKE: { capacity: "1 Passenger",  badge: "Fastest",    etaOffset: 0 },
  AUTO: { capacity: "3 Passengers", badge: "Best Value", etaOffset: 2 },
  CAR:  { capacity: "4 Passengers",                      etaOffset: 4 },
};

/* ─── Types ──────────────────────────────────────────────────── */
type Step = "input" | "fare" | "searching" | "assigned" | "arrived" | "rating";
interface AssignedCaptain {
  name: string; rating: number; trips: number; plate: string;
  model: string; vehicleType: VehicleType; color: string; phone: string; avatar: string;
  otp: string; etaMinutes: number;
}

function generateOTP() { return String(Math.floor(1000 + Math.random() * 9000)); }

/* ─── Component ──────────────────────────────────────────────── */
export default function BookRidePage() {
  const { session, updateAccessToken, clearSession } = useAuthStore();
  const { selectedVehicle, setSelectedVehicle, setActiveRide, activeRide, clearRide } = useRideStore();

  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [fareEstimate, setFareEstimate] = useState<FareEstimate | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);
  const [assignedCaptain, setAssignedCaptain] = useState<AssignedCaptain | null>(null);
  const [etaSeconds, setEtaSeconds] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchDots, setSearchDots] = useState(0);
  const [error, setError] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (step !== "searching") return;
    const id = setInterval(() => setSearchDots((d) => (d + 1) % 4), 500);
    return () => clearInterval(id);
  }, [step]);

  useEffect(() => {
    if (step !== "assigned" || etaSeconds <= 0) return;
    const id = setInterval(() => {
      setEtaSeconds((s) => { if (s <= 1) { clearInterval(id); return 0; } return s - 1; });
    }, 1000);
    return () => clearInterval(id);
  }, [step, etaSeconds]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const DEMO_COORDS = { pickupLat: 12.9716, pickupLon: 77.5946, dropLat: 12.9352, dropLon: 77.6245 };

  async function handleGetFare(e: React.FormEvent) {
    e.preventDefault();
    if (!pickup || !drop) return;
    setError(""); setIsLoading(true);
    try {
      const { pickupLat, pickupLon, dropLat, dropLon } = DEMO_COORDS;
      const res = await fetch(`/api/rides?type=fare&pickupLat=${pickupLat}&pickupLon=${pickupLon}&dropLat=${dropLat}&dropLon=${dropLon}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setFareEstimate(json.data);
      setStep("fare");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get fare");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleBookRide() {
    if (!fareEstimate) return;
    setIsLoading(true); setError(""); setStep("searching");
    try {
      const { pickupLat, pickupLon, dropLat, dropLon } = DEMO_COORDS;
      const res = await fetchWithAuth(
        "/api/rides",
        { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pickupAddress: pickup, pickupLatitude: pickupLat, pickupLongitude: pickupLon,
            dropAddress: drop, dropLatitude: dropLat, dropLongitude: dropLon, vehicleType: selectedVehicle }) },
        session?.accessToken ?? "", updateAccessToken,
        () => { clearSession(); window.location.href = "/login"; }
      );
      const json = await res.json();
      if (json.success) setActiveRide(json.data);
    } catch { /* continue to dummy assignment */ } finally { setIsLoading(false); }

    const delay = 3000 + Math.random() * 1500;
    timerRef.current = setTimeout(() => {
      const captain = DUMMY_CAPTAINS.find((c) => c.vehicleType === selectedVehicle) ?? DUMMY_CAPTAINS[0];
      const etaMeta = VEHICLE_META[selectedVehicle];
      const etaMins = Math.floor(Math.random() * 5) + 4 + etaMeta.etaOffset;
      setAssignedCaptain({ ...captain, otp: generateOTP(), etaMinutes: etaMins });
      setEtaSeconds(etaMins * 60);
      setStep("assigned");
    }, delay);
  }

  function handleCancelRide() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStep("input"); setFareEstimate(null); setAssignedCaptain(null); setError("");
  }

  async function handleEndRide() {
    const rideId = activeRide?.id;
    if (rideId && session?.accessToken) {
      try {
        await fetchWithAuth(
          `/api/rides/${rideId}`,
          { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "complete" }) },
          session.accessToken, updateAccessToken,
          () => { clearSession(); window.location.href = "/login"; }
        );
      } catch { /* ignore — still advance UI */ }
    }
    setStep("rating");
  }

  function handleDismissRide() {
    clearRide();
    setStep("input"); setPickup(""); setDrop(""); setFareEstimate(null); setAssignedCaptain(null); setRating(0);
  }

  const selectedFare = fareEstimate
    ? selectedVehicle === "BIKE" ? fareEstimate.bike : selectedVehicle === "AUTO" ? fareEstimate.auto : fareEstimate.car
    : 0;
  const payMethod = PAYMENT_METHODS.find((p) => p.id === paymentMethod)!;
  const etaMin = Math.floor(etaSeconds / 60);
  const etaSec = etaSeconds % 60;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <div className="pt-20 pb-12 px-4 max-w-xl mx-auto">

        {/* ── INPUT ───────────────────────────────────────────── */}
        {step === "input" && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-3xl font-black text-[var(--foreground)] mb-1">Where to<span className="text-gradient">?</span></h1>
              <p className="text-[var(--muted)] text-sm">Hey {session?.user?.name?.split(" ")[0] ?? "there"}, ready for a ride?</p>
            </div>

            {/* Map mock */}
            <div className="relative rounded-3xl overflow-hidden mb-4 h-44 bg-gradient-to-br from-slate-800 to-slate-900 border border-[var(--border)] flex items-center justify-center">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 60%, #f97316 0%, transparent 60%), radial-gradient(circle at 70% 30%, #3b82f6 0%, transparent 50%)" }} />
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
                <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white" />
                <div className="absolute top-0 bottom-0 left-2/3 w-px bg-white" />
              </div>
              <div className="text-center z-10">
                <div className="w-12 h-12 rounded-full bg-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center mx-auto mb-2 animate-pulse">
                  <MapPin size={22} className="text-[var(--primary)]" />
                </div>
                <p className="text-xs text-white/50">Bengaluru, Karnataka</p>
              </div>
            </div>

            {/* Location inputs */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5 mb-4">
              <form onSubmit={handleGetFare} className="space-y-3">
                <div className="relative">
                  <div className="absolute left-3 top-3.5 w-2.5 h-2.5 rounded-full bg-green-400 z-10" />
                  <input className="w-full pl-8 pr-4 py-3 text-sm rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    placeholder="Pickup location" value={pickup} onChange={(e) => setPickup(e.target.value)} required />
                </div>
                <div className="flex items-center gap-2 px-1">
                  <div className="flex flex-col gap-1"><div className="w-px h-1.5 bg-[var(--border)] mx-1.5" /><div className="w-px h-1.5 bg-[var(--border)] mx-1.5" /></div>
                  <div className="h-px flex-1 border-b border-dashed border-[var(--border)]" />
                </div>
                <div className="relative">
                  <MapPin size={13} className="absolute left-3 top-3.5 text-red-400 z-10" />
                  <input className="w-full pl-8 pr-4 py-3 text-sm rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                    placeholder="Where are you going?" value={drop} onChange={(e) => setDrop(e.target.value)} required />
                </div>
                {error && <p className="text-xs text-red-400 px-1">{error}</p>}
                <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                  <Navigation size={15} /> See ride options
                </Button>
              </form>
            </div>

            {/* Popular destinations */}
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-3 px-1">Popular destinations</p>
            <div className="grid grid-cols-2 gap-2">
              {POPULAR_LOCATIONS.map((loc) => (
                <button key={loc.label} onClick={() => setDrop(loc.address)}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)]/60 transition-all text-left group">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/20 transition-colors">
                    <MapPin size={13} className="text-[var(--primary)]" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--foreground)] leading-tight">{loc.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── FARE SELECTION ───────────────────────────────────── */}
        {step === "fare" && fareEstimate && (
          <div className="animate-fade-in space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setStep("input")} className="p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] transition-colors">
                <X size={16} className="text-[var(--muted)]" />
              </button>
              <div>
                <h2 className="font-black text-[var(--foreground)] text-xl">Choose a ride</h2>
                <p className="text-xs text-[var(--muted)]">{fareEstimate.distance} km · ~{fareEstimate.duration} min</p>
              </div>
            </div>

            {/* Route pill */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <div className="w-px h-4 border-l-2 border-dashed border-[var(--border)]" />
                <MapPin size={10} className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--foreground)] font-medium truncate">{pickup}</p>
                <p className="text-xs text-[var(--muted)] truncate mt-0.5">{drop}</p>
              </div>
            </div>

            {/* Vehicle cards */}
            <div className="space-y-3">
              {([["BIKE", fareEstimate.bike], ["AUTO", fareEstimate.auto], ["CAR", fareEstimate.car]] as [VehicleType, number][]).map(([type, fare]) => {
                const meta = VEHICLE_META[type];
                const isSelected = selectedVehicle === type;
                const emoji = type === "BIKE" ? "🏍️" : type === "AUTO" ? "🛺" : "🚗";
                const label = type === "BIKE" ? "Bike" : type === "AUTO" ? "Auto" : "Car";
                return (
                  <button key={type} onClick={() => setSelectedVehicle(type)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${isSelected ? "border-[var(--primary)] bg-orange-500/8 shadow-lg shadow-orange-500/15" : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--primary)]/40"}`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${isSelected ? "bg-orange-500/15" : "bg-[var(--surface-2)]"}`}>{emoji}</div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[var(--foreground)]">{label}</p>
                        {meta.badge && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--primary)] text-white">{meta.badge}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-[var(--muted)] flex items-center gap-1"><Users size={10} /> {meta.capacity}</span>
                        <span className="text-xs text-[var(--muted)] flex items-center gap-1"><Clock size={10} /> {fareEstimate.duration + meta.etaOffset} min</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[var(--foreground)] text-xl">₹{fare}</p>
                      {isSelected && <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center ml-auto mt-1"><div className="w-2 h-2 rounded-full bg-white" /></div>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Payment picker */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden">
              <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-[var(--surface-2)] transition-colors" onClick={() => setShowPaymentPicker((v) => !v)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-[var(--primary)]">{payMethod.icon}</div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[var(--foreground)]">{payMethod.label}</p>
                    <p className="text-xs text-[var(--muted)]">{payMethod.desc}</p>
                  </div>
                </div>
                <ChevronDown size={15} className={`text-[var(--muted)] transition-transform ${showPaymentPicker ? "rotate-180" : ""}`} />
              </button>
              {showPaymentPicker && (
                <div className="border-t border-[var(--border)] divide-y divide-[var(--border)]">
                  {PAYMENT_METHODS.map((pm) => (
                    <button key={pm.id} onClick={() => { setPaymentMethod(pm.id); setShowPaymentPicker(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface-2)] transition-colors">
                      <div className="w-7 h-7 rounded-lg bg-[var(--surface-2)] flex items-center justify-center">{pm.icon}</div>
                      <div className="text-left flex-1">
                        <p className="text-sm font-semibold text-[var(--foreground)]">{pm.label}</p>
                        <p className="text-xs text-[var(--muted)]">{pm.desc}</p>
                      </div>
                      {paymentMethod === pm.id && <CheckCircle size={16} className="text-[var(--primary)]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button fullWidth size="lg" onClick={handleBookRide} isLoading={isLoading}>
              Book {selectedVehicle === "BIKE" ? "Bike" : selectedVehicle === "AUTO" ? "Auto" : "Car"} · ₹{selectedFare} <ChevronRight size={16} />
            </Button>
          </div>
        )}

        {/* ── SEARCHING ────────────────────────────────────────── */}
        {step === "searching" && (
          <div className="animate-fade-in text-center py-12">
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full bg-orange-500/10 animate-ping" />
              <div className="absolute inset-3 rounded-full bg-orange-500/15 animate-ping" style={{ animationDelay: "0.3s" }} />
              <div className="absolute inset-6 rounded-full bg-orange-500/20 animate-ping" style={{ animationDelay: "0.6s" }} />
              <div className="absolute inset-0 rounded-full bg-[var(--surface)] border-2 border-[var(--primary)] flex items-center justify-center">
                <span className="text-4xl">{selectedVehicle === "BIKE" ? "🏍️" : selectedVehicle === "AUTO" ? "🛺" : "🚗"}</span>
              </div>
            </div>
            <h2 className="text-xl font-black text-[var(--foreground)] mb-2">Finding your captain{".".repeat(searchDots)}</h2>
            <p className="text-sm text-[var(--muted)] mb-1">Looking for nearby captains</p>
            <p className="text-xs text-[var(--muted)] mb-8">Usually takes 15–30 seconds</p>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 text-left mb-6">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <div className="w-px h-5 border-l border-dashed border-[var(--border)]" />
                  <MapPin size={10} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--foreground)] font-medium truncate">{pickup}</p>
                  <p className="text-xs text-[var(--muted)] truncate mt-1">{drop}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[var(--foreground)]">₹{selectedFare}</p>
                  <p className="text-xs text-[var(--muted)]">{payMethod.label}</p>
                </div>
              </div>
            </div>
            <button onClick={handleCancelRide} className="text-sm text-red-400 hover:text-red-300 transition-colors underline underline-offset-2">Cancel ride</button>
          </div>
        )}

        {/* ── CAPTAIN ASSIGNED ─────────────────────────────────── */}
        {step === "assigned" && assignedCaptain && (
          <div className="animate-fade-in space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-semibold text-green-400">Captain Assigned</span>
              </div>
              <h2 className="text-xl font-black text-[var(--foreground)]">Your captain is on the way!</h2>
              {etaSeconds > 0 && (
                <p className="text-[var(--muted)] text-sm mt-1">
                  ETA: <span className="font-bold text-[var(--primary)]">{etaMin > 0 ? `${etaMin}m ` : ""}{String(etaSec).padStart(2, "0")}s</span>
                </p>
              )}
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5">
              {/* Captain info */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-orange-500/30">
                  {assignedCaptain.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-black text-[var(--foreground)] text-lg">{assignedCaptain.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-semibold text-[var(--foreground)]">{assignedCaptain.rating}</span>
                    <span className="text-xs text-[var(--muted)]">· {assignedCaptain.trips.toLocaleString()} trips</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all text-[var(--muted)]"><Phone size={15} /></button>
                  <button className="w-10 h-10 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all text-[var(--muted)]"><MessageSquare size={15} /></button>
                </div>
              </div>

              {/* Vehicle */}
              <div className="bg-[var(--surface-2)] rounded-2xl p-3 mb-4 flex items-center gap-3">
                <span className="text-2xl">{assignedCaptain.vehicleType === "BIKE" ? "🏍️" : assignedCaptain.vehicleType === "AUTO" ? "🛺" : "🚗"}</span>
                <div className="flex-1">
                  <p className="font-semibold text-[var(--foreground)] text-sm">{assignedCaptain.model}</p>
                  <p className="text-xs text-[var(--muted)]">{assignedCaptain.color}</p>
                </div>
                <span className="font-mono text-sm font-bold text-[var(--primary)] bg-orange-500/10 px-3 py-1.5 rounded-xl border border-[var(--primary)]/30">{assignedCaptain.plate}</span>
              </div>

              {/* OTP */}
              <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border border-orange-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-1"><Shield size={13} className="text-[var(--primary)]" /><span className="text-xs font-semibold text-[var(--primary)]">Share OTP with captain</span></div>
                  <p className="text-xs text-[var(--muted)]">Only share after captain arrives</p>
                </div>
                <div className="flex gap-1.5">
                  {assignedCaptain.otp.split("").map((digit, i) => (
                    <div key={i} className="w-10 h-12 rounded-xl bg-[var(--primary)] flex items-center justify-center">
                      <span className="text-xl font-black text-white">{digit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fare summary */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-[var(--muted)]">Fare</span><span className="font-bold text-[var(--foreground)]">₹{selectedFare}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[var(--muted)]">Payment</span><div className="flex items-center gap-1.5 text-[var(--primary)]">{payMethod.icon}<span className="font-semibold">{payMethod.label}</span></div></div>
              <div className="flex justify-between text-sm pt-2 border-t border-[var(--border)]"><span className="text-[var(--muted)]">Distance</span><span className="text-[var(--foreground)]">{fareEstimate?.distance} km</span></div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleCancelRide} className="flex-1 py-3 rounded-2xl text-sm font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all">Cancel</button>
              <Button fullWidth onClick={() => setStep("arrived")}><Zap size={15} /> Captain Arrived</Button>
            </div>
          </div>
        )}

        {/* ── IN RIDE ──────────────────────────────────────────── */}
        {step === "arrived" && assignedCaptain && (
          <div className="animate-fade-in space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 mb-3">
                <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="text-xs font-semibold text-purple-400">Ride in Progress</span>
              </div>
              <h2 className="text-xl font-black text-[var(--foreground)]">On your way!</h2>
              <p className="text-[var(--muted)] text-sm mt-1">Heading to {drop.split(",")[0]}</p>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center font-black text-white text-lg">{assignedCaptain.avatar}</div>
                <div>
                  <p className="font-bold text-[var(--foreground)]">{assignedCaptain.name}</p>
                  <p className="text-xs text-[var(--muted)]">{assignedCaptain.model} · {assignedCaptain.plate}</p>
                </div>
                <button className="ml-auto w-10 h-10 rounded-xl bg-[var(--surface-2)] flex items-center justify-center"><Phone size={15} className="text-[var(--muted)]" /></button>
              </div>

              {/* Progress */}
              <div className="flex items-center mb-5">
                {["Booked", "En Route", "Arrived", "In Ride", "Done"].map((s, i, arr) => (
                  <div key={s} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${i < 4 ? "bg-[var(--primary)] border-[var(--primary)]" : "border-[var(--border)] bg-[var(--surface-2)]"}`}>
                        {i < 4 && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className="text-[9px] text-[var(--muted)] whitespace-nowrap">{s}</span>
                    </div>
                    {i < arr.length - 1 && <div className={`flex-1 h-px mt-[-10px] ${i < 3 ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`} />}
                  </div>
                ))}
              </div>

              <div className="bg-[var(--surface-2)] rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2"><Shield size={13} className="text-[var(--primary)]" /><span className="text-xs text-[var(--muted)]">Your OTP</span></div>
                <span className="font-mono font-black text-[var(--primary)] tracking-widest">{assignedCaptain.otp}</span>
              </div>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-black text-[var(--foreground)] text-xl">₹{selectedFare}</p>
                <p className="text-xs text-[var(--muted)]">{payMethod.label} · {fareEstimate?.distance} km</p>
              </div>
              <Button onClick={handleEndRide}><CheckCircle size={15} /> End Ride</Button>
            </div>
          </div>
        )}

        {/* ── RATING ───────────────────────────────────────────── */}
        {step === "rating" && assignedCaptain && (
          <div className="animate-fade-in text-center pt-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-3xl font-black text-white mx-auto mb-4 shadow-xl shadow-orange-500/30">
              {assignedCaptain.avatar}
            </div>
            <h2 className="text-2xl font-black text-[var(--foreground)] mb-1">Ride completed! 🎉</h2>
            <p className="text-[var(--muted)] text-sm mb-1">Rate your experience with {assignedCaptain.name}</p>
            <p className="text-xs text-[var(--muted)] mb-8">{assignedCaptain.model} · {assignedCaptain.plate}</p>

            <div className="flex justify-center gap-3 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(star)} className="transition-transform hover:scale-125">
                  <Star size={40} className={`transition-colors ${star <= (hoverRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-[var(--border)]"}`} />
                </button>
              ))}
            </div>
            <p className="text-sm text-[var(--muted)] mb-8">
              {rating === 0 ? "Tap to rate" : rating === 5 ? "Excellent! 🌟" : rating === 4 ? "Great ride! 👍" : rating === 3 ? "Good ride" : rating === 2 ? "Could be better" : "Poor experience"}
            </p>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm"><span className="text-[var(--muted)]">Fare paid</span><span className="font-black text-[var(--foreground)] text-base">₹{selectedFare}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[var(--muted)]">Distance</span><span className="text-[var(--foreground)]">{fareEstimate?.distance} km</span></div>
              <div className="flex justify-between text-sm"><span className="text-[var(--muted)]">Payment</span><span className="text-[var(--foreground)]">{payMethod.label}</span></div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={handleDismissRide}>Skip</Button>
              <Button fullWidth onClick={handleDismissRide}>
                Submit <ChevronRight size={15} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

