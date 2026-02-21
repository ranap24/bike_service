"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bike, Shield, Zap, Star, MapPin, ChevronRight,
  Clock, CheckCircle, Activity, TrendingUp, Users, ArrowRight,
  Gauge, History, ToggleRight, BookOpen, Trophy, Wallet,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuthStore } from "@/store/authStore";

const CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune",
  "Kolkata", "Ahmedabad", "Jaipur", "Lucknow", "Surat", "Indore",
  "Bhopal", "Nagpur", "Visakhapatnam", "Coimbatore", "Kochi", "Chandigarh",
  "Patna", "Vadodara",
];

const VEHICLES = [
  {
    id: "BIKE",
    emoji: "🏍️",
    label: "Bike",
    tagline: "Beat the traffic",
    price: "₹30",
    unit: "base fare",
    color: "orange",
    gradient: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/40",
    ring: "ring-orange-500/30",
    desc: "Fastest route through city lanes. Ideal for solo rides.",
    badge: "Most Popular",
    badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  {
    id: "AUTO",
    emoji: "🛺",
    label: "Auto",
    tagline: "Comfortable & spacious",
    price: "₹50",
    unit: "base fare",
    color: "yellow",
    gradient: "from-yellow-500/20 to-yellow-500/5",
    border: "border-yellow-500/40",
    ring: "ring-yellow-500/30",
    desc: "Three-wheel comfort for you and your bags, rain or shine.",
    badge: "Best Value",
    badgeColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  {
    id: "CAR",
    emoji: "🚗",
    label: "Car",
    tagline: "Premium experience",
    price: "₹80",
    unit: "base fare",
    color: "blue",
    gradient: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/40",
    ring: "ring-blue-500/30",
    desc: "Air-conditioned sedans for a smooth, premium journey.",
    badge: "Premium",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
];

const FEATURES = [
  {
    icon: <Zap size={20} />,
    title: "Instant Booking",
    desc: "Book a ride in seconds. No waiting, no hassle. Your captain is always nearby.",
    accent: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    num: "01",
  },
  {
    icon: <Shield size={20} />,
    title: "Safe & Verified",
    desc: "Every captain goes through rigorous background checks. Live tracking + SOS.",
    accent: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    num: "02",
  },
  {
    icon: <Star size={20} />,
    title: "Rated Captains",
    desc: "Community-powered ratings ensure consistent quality rides every time.",
    accent: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    num: "03",
  },
  {
    icon: <TrendingUp size={20} />,
    title: "Smart Pricing",
    desc: "Dynamic fare estimates calculated ahead of time — no surge surprises.",
    accent: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    num: "04",
  },
];

const STEPS = [
  { num: "01", icon: <MapPin size={18} />, title: "Enter your destination", desc: "Type pickup and drop to get instant fare estimates for all vehicle types." },
  { num: "02", icon: <Bike size={18} />, title: "Choose your ride", desc: "Pick Bike, Auto, or Car. Prices shown upfront — always transparent." },
  { num: "03", icon: <Clock size={18} />, title: "Captain arrives", desc: "Your captain arrives in minutes. Track live on the map, get OTP for verification." },
  { num: "04", icon: <CheckCircle size={18} />, title: "Ride & rate", desc: "Complete your journey, pay securely, and rate your captain. That's it." },
];

const LIVE_FEED = [
  { city: "Bengaluru", action: "booked a Bike ride", time: "2s ago", avatar: "🧑" },
  { city: "Mumbai", action: "completed a Car ride", time: "8s ago", avatar: "👩" },
  { city: "Hyderabad", action: "booked an Auto", time: "14s ago", avatar: "🧔" },
  { city: "Pune", action: "rated their captain ★5", time: "21s ago", avatar: "👧" },
  { city: "Chennai", action: "booked a Bike ride", time: "29s ago", avatar: "🧑" },
];

const PLATFORM_STATS = [
  { value: "50K+", label: "Happy Riders", icon: <Users size={16} />, color: "text-orange-400" },
  { value: "5K+", label: "Active Captains", icon: <Bike size={16} />, color: "text-blue-400" },
  { value: "4.8★", label: "Avg. Rating", icon: <Star size={16} />, color: "text-yellow-400" },
  { value: "< 2 min", label: "Avg. Pickup", icon: <Clock size={16} />, color: "text-green-400" },
];

const TICKER = [...CITIES, ...CITIES]; // duplicate for seamless loop

function GuestHome() {
  const [activeVehicle, setActiveVehicle] = useState("BIKE");

  return (
    <div className="min-h-screen bg-[var(--background)] overflow-x-hidden">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden dot-grid">
        {/* Ambient glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-orange-500/6 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-60 left-1/4 w-[250px] h-[250px] bg-orange-400/6 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[200px] h-[200px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Floating decorative elements */}
        <div className="absolute top-36 left-10 text-3xl opacity-20 animate-float-slow select-none hidden lg:block">🏍️</div>
        <div className="absolute top-52 right-16 text-2xl opacity-15 animate-float select-none hidden lg:block" style={{ animationDelay: "1s" }}>🛺</div>
        <div className="absolute top-80 left-24 text-xl opacity-10 animate-float-slow select-none hidden lg:block" style={{ animationDelay: "2s" }}>🚗</div>
        <div className="absolute top-44 right-8 text-4xl opacity-10 animate-float select-none hidden xl:block" style={{ animationDelay: "1.5s" }}>⚡</div>

        <div className="max-w-5xl mx-auto text-center relative z-10">

          {/* Live badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[var(--surface-2)] border border-[var(--border-bright)] mb-8 animate-fade-in">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
            </span>
            <span className="text-sm text-[var(--muted-bright)] font-medium">Live in <span className="text-[var(--foreground)] font-semibold">20+ cities</span></span>
            <Activity size={13} className="text-[var(--muted)]" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black leading-[1.05] tracking-tight mb-6 animate-fade-in delay-100">
            Your ride,
            <br />
            <span className="text-gradient">your way.</span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in delay-200">
            Book Bike, Auto, and Car rides instantly. Fast pickups, verified captains,
            live tracking — all in one seamless app.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 animate-fade-in delay-300">
            <Link
              href="/register"
              className="gradient-primary text-white font-bold px-9 py-4 rounded-2xl text-base hover:brightness-110 active:scale-[0.97] transition-all shadow-xl shadow-orange-500/30 flex items-center gap-2.5 glow-primary-sm"
            >
              Book a Ride <ArrowRight size={17} />
            </Link>
            <Link
              href="/register?role=CAPTAIN"
              className="group bg-[var(--surface)] border border-[var(--border-bright)] text-[var(--muted-bright)] font-semibold px-8 py-4 rounded-2xl text-base hover:border-[var(--primary)] hover:text-[var(--primary)] active:scale-[0.97] transition-all flex items-center gap-2.5"
            >
              <Bike size={17} className="group-hover:rotate-6 transition-transform" />
              Become a Captain
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-fade-in delay-400">
            {PLATFORM_STATS.map((s, i) => (
              <div
                key={s.label}
                className="card-hover bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`flex items-center justify-center gap-1.5 mb-1.5 ${s.color}`}>
                  {s.icon}
                  <span className="text-xl font-black text-[var(--foreground)]">{s.value}</span>
                </div>
                <p className="text-xs text-[var(--muted)]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── City Ticker ──────────────────────────────────────── */}
      <div className="border-y border-[var(--border)] py-3 overflow-hidden bg-[var(--surface)]/50">
        <div className="flex gap-0 animate-marquee whitespace-nowrap">
          {TICKER.map((city, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-6 text-sm text-[var(--muted)] shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]/60 inline-block" />
              {city}
            </span>
          ))}
        </div>
      </div>

      {/* ── Vehicle Selector ─────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)] mb-3">Choose your ride</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--foreground)]">
              Three vehicles,<br /><span className="text-gradient">one platform.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {VEHICLES.map((v) => {
              const active = activeVehicle === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setActiveVehicle(v.id)}
                  className={`relative text-left rounded-3xl border p-6 transition-all duration-300 cursor-pointer ${
                    active
                      ? `bg-gradient-to-br ${v.gradient} ${v.border} ring-2 ${v.ring} shadow-2xl`
                      : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-bright)] hover:bg-[var(--surface-2)]"
                  }`}
                >
                  {/* Badge */}
                  <span className={`absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full border ${v.badgeColor}`}>
                    {v.badge}
                  </span>

                  {/* Emoji */}
                  <div className={`text-5xl mb-4 transition-transform duration-300 inline-block ${active ? "scale-110 animate-float" : "group-hover:scale-105"}`}>
                    {v.emoji}
                  </div>

                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-2xl font-black text-[var(--foreground)]">{v.price}</span>
                    <span className="text-xs text-[var(--muted)] mb-1">{v.unit}</span>
                  </div>
                  <h3 className="font-black text-[var(--foreground)] text-xl mb-1">{v.label}</h3>
                  <p className={`text-xs font-semibold mb-3 ${active ? `text-${v.color}-400` : "text-[var(--muted)]"}`}>{v.tagline}</p>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{v.desc}</p>

                  {active && (
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-green-400 font-semibold">Available now</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-sm text-[var(--primary)] font-semibold hover:underline underline-offset-4"
            >
              Book a {VEHICLES.find(v => v.id === activeVehicle)?.label} now
              <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)] mb-3">Why BikeService</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] mb-4">
              Built for the way<br /><span className="text-gradient">you move.</span>
            </h2>
            <p className="text-[var(--muted)] max-w-xl mx-auto text-sm leading-relaxed">
              Every feature is designed around simplicity, safety, and speed.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`card-hover group bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7 animate-fade-in-up`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start gap-5">
                  <div className={`shrink-0 w-12 h-12 rounded-2xl ${f.bg} border ${f.border} flex items-center justify-center ${f.accent} group-hover:scale-110 transition-transform`}>
                    {f.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-black text-[var(--foreground)] text-base">{f.title}</h3>
                      <span className="text-xs font-bold text-[var(--border-bright)] ml-auto font-mono">{f.num}</span>
                    </div>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works — Timeline ──────────────────────────── */}
      <section className="py-20 px-4 bg-[var(--surface)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)] mb-3">Simple as 1-2-3-4</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--foreground)]">
              How it <span className="text-gradient">works</span>
            </h2>
          </div>

          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute left-5 top-6 bottom-6 w-px bg-gradient-to-b from-[var(--primary)] via-[var(--border)] to-[var(--border)] hidden sm:block" />

            <div className="space-y-5">
              {STEPS.map((step, i) => (
                <div
                  key={step.num}
                  className="relative sm:pl-16 animate-fade-in-up card-hover"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  {/* Step dot */}
                  <div className={`hidden sm:flex absolute left-0 top-5 w-10 h-10 rounded-full items-center justify-center text-white z-10 font-black text-xs shrink-0 ${i === 0 ? "bg-[var(--primary)] shadow-lg shadow-orange-500/30" : "bg-[var(--surface-3)] border border-[var(--border-bright)]"}`}>
                    {i === 0 ? step.icon : step.num}
                  </div>

                  <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl px-6 py-5 flex items-center gap-5">
                    <div className={`sm:hidden shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs ${i === 0 ? "bg-[var(--primary)]" : "bg-[var(--surface-3)] border border-[var(--border-bright)]"}`}>
                      {step.num}
                    </div>
                    <div>
                      <h3 className="font-black text-[var(--foreground)] mb-1">{step.title}</h3>
                      <p className="text-sm text-[var(--muted)] leading-relaxed">{step.desc}</p>
                    </div>
                    {i === 0 && (
                      <div className="ml-auto shrink-0">
                        <span className="text-xs font-bold text-[var(--primary)] bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">Start here</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Activity Feed ───────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)] mb-3">Happening now</p>
              <h2 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] mb-4">
                Rides happening<br /><span className="text-gradient">right now</span>
              </h2>
              <p className="text-[var(--muted)] text-sm leading-relaxed mb-8">
                Thousands of riders and captains trust BikeService every day across India.
                Join the movement.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 gradient-primary text-white font-bold px-7 py-3.5 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-orange-500/25 text-sm"
              >
                Join BikeService <ArrowRight size={15} />
              </Link>
            </div>

            <div className="space-y-3">
              {LIVE_FEED.map((item, i) => (
                <div
                  key={i}
                  className="card-hover flex items-center gap-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl px-5 py-4 animate-slide-in-right"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--surface-3)] border border-[var(--border-bright)] flex items-center justify-center text-lg shrink-0">
                    {item.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[var(--foreground)] font-medium truncate">
                      Someone in <span className="text-[var(--primary)]">{item.city}</span>
                    </p>
                    <p className="text-xs text-[var(--muted)]">{item.action}</p>
                  </div>
                  <span className="text-xs text-[var(--muted)] shrink-0">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-[var(--surface)] border border-[var(--border-bright)] rounded-3xl overflow-hidden">
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/12 via-transparent to-blue-500/8 pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/8 rounded-full blur-[60px]" />
            <div className="dot-grid absolute inset-0 opacity-40 pointer-events-none" />

            <div className="relative z-10 p-10 sm:p-16 text-center">
              <div className="relative inline-block mb-6">
                <div className="text-6xl animate-float-slow">🏍️</div>
                <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-2xl -z-10 scale-150" />
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-[var(--foreground)] mb-4">
                Ready to ride?
              </h2>
              <p className="text-[var(--muted)] mb-10 max-w-xl mx-auto leading-relaxed">
                Join <span className="text-[var(--foreground)] font-semibold">50,000+ riders</span> already using BikeService.
                Sign up free and get your first ride discount.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2.5 gradient-primary text-white font-bold px-10 py-4 rounded-2xl hover:brightness-110 active:scale-[0.97] transition-all glow-primary text-base shadow-2xl shadow-orange-500/30"
                >
                  Get Started Free <ChevronRight size={18} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 text-[var(--muted-bright)] font-semibold px-8 py-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border-bright)] hover:text-[var(--foreground)] hover:border-[var(--primary)]/50 transition-all"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Bike size={16} className="text-white" />
              </div>
              <span className="font-black text-[var(--foreground)] text-lg">Bike<span className="text-[var(--primary)]">Service</span></span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[var(--muted)]">
              <Link href="#" className="hover:text-[var(--foreground)] transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-[var(--foreground)] transition-colors">Terms</Link>
              <Link href="#" className="hover:text-[var(--foreground)] transition-colors">Support</Link>
              <Link href="/login?role=CAPTAIN" className="hover:text-[var(--foreground)] transition-colors">Captain Login</Link>
            </div>
          </div>
          <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[var(--muted)]">© {new Date().getFullYear()} BikeService. All rights reserved.</p>
            <p className="text-xs text-[var(--muted)]">Available in 20+ cities across India</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Shared: City Ticker ──────────────────────────────────────────────────────

function CityTicker() {
  return (
    <div className="border-y border-[var(--border)] py-3 overflow-hidden bg-[var(--surface)]/50">
      <div className="flex gap-0 animate-marquee whitespace-nowrap">
        {TICKER.map((city, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-6 text-sm text-[var(--muted)] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]/60 inline-block" />
            {city}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Shared: Footer ───────────────────────────────────────────────────────────

function SharedFooter() {
  return (
    <footer className="border-t border-[var(--border)] py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Bike size={16} className="text-white" />
            </div>
            <span className="font-black text-[var(--foreground)] text-lg">Bike<span className="text-[var(--primary)]">Service</span></span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--muted)]">
            <Link href="#" className="hover:text-[var(--foreground)] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[var(--foreground)] transition-colors">Terms</Link>
            <Link href="#" className="hover:text-[var(--foreground)] transition-colors">Support</Link>
          </div>
        </div>
        <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--muted)]">© {new Date().getFullYear()} BikeService. All rights reserved.</p>
          <p className="text-xs text-[var(--muted)]">Available in 20+ cities across India</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Rider Home ───────────────────────────────────────────────────────────────

function RiderHome({ name }: { name: string }) {
  const [activeVehicle, setActiveVehicle] = useState("BIKE");

  return (
    <div className="min-h-screen bg-[var(--background)] overflow-x-hidden">
      <Navbar />

      {/* Personalized Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden dot-grid">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">

          <div className="mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[var(--surface-2)] border border-[var(--border-bright)] mb-6">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
              </span>
              <span className="text-sm text-[var(--muted-bright)] font-medium">Ready to ride</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-3">
              Welcome back,<br /><span className="text-gradient">{name}.</span>
            </h1>
            <p className="text-[var(--muted)] text-lg">Where are you headed today?</p>
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 gap-4 mb-10 animate-fade-in delay-100">
            <Link href="/rider/book"
              className="group card-hover flex items-center gap-5 p-6 rounded-2xl gradient-primary text-white border border-orange-500/40 shadow-xl shadow-orange-500/20 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                <MapPin size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-xl text-white mb-0.5">Book a Ride</h3>
                <p className="text-sm text-white/70">Pick your vehicle and go</p>
              </div>
              <ArrowRight size={18} className="text-white/70 group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
            <Link href="/rider/history"
              className="group card-hover flex items-center gap-5 p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-bright)] transition-all">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                <History size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-xl text-[var(--foreground)] mb-0.5">My Rides</h3>
                <p className="text-sm text-[var(--muted)]">History & receipts</p>
              </div>
              <ArrowRight size={18} className="text-[var(--muted)] group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in delay-200">
            {PLATFORM_STATS.map((s) => (
              <div key={s.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 text-center">
                <div className={`flex items-center justify-center gap-1.5 mb-1 ${s.color}`}>
                  {s.icon}
                  <span className="text-lg font-black text-[var(--foreground)]">{s.value}</span>
                </div>
                <p className="text-xs text-[var(--muted)]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CityTicker />

      {/* Vehicle Selector */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)] mb-3">Your vehicles</p>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--foreground)]">Pick your ride<br /><span className="text-gradient">right now.</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {VEHICLES.map((v) => {
              const active = activeVehicle === v.id;
              return (
                <button key={v.id} onClick={() => setActiveVehicle(v.id)}
                  className={`relative text-left rounded-3xl border p-6 transition-all duration-300 cursor-pointer ${active ? `bg-gradient-to-br ${v.gradient} ${v.border} ring-2 ${v.ring} shadow-2xl` : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--border-bright)] hover:bg-[var(--surface-2)]"}`}>
                  <span className={`absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full border ${v.badgeColor}`}>{v.badge}</span>
                  <div className={`text-5xl mb-4 inline-block transition-transform ${active ? "scale-110 animate-float" : ""}`}>{v.emoji}</div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-2xl font-black text-[var(--foreground)]">{v.price}</span>
                    <span className="text-xs text-[var(--muted)] mb-1">{v.unit}</span>
                  </div>
                  <h3 className="font-black text-[var(--foreground)] text-xl mb-1">{v.label}</h3>
                  <p className={`text-xs font-semibold mb-3 ${active ? `text-${v.color}-400` : "text-[var(--muted)]"}`}>{v.tagline}</p>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{v.desc}</p>
                  {active && <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /><span className="text-xs text-green-400 font-semibold">Available now</span></div>}
                </button>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link href="/rider/book" className="inline-flex items-center gap-2 gradient-primary text-white font-bold px-8 py-3.5 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-orange-500/25 text-sm">
              Book a {VEHICLES.find(v => v.id === activeVehicle)?.label} now <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-[var(--surface)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)] mb-3">Why riders love us</p>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">Every ride, <span className="text-gradient">guaranteed.</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="card-hover group bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 w-10 h-10 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center ${f.accent}`}>{f.icon}</div>
                  <div>
                    <h3 className="font-black text-[var(--foreground)] mb-1">{f.title}</h3>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SharedFooter />
    </div>
  );
}

// ─── Captain Home ─────────────────────────────────────────────────────────────

function CaptainHome({ name, rating, totalRides, isOnline }: {
  name: string; rating: number; totalRides: number; isOnline: boolean;
}) {
  const myStats = [
    { label: "Rating", value: rating ? `${rating.toFixed(1)}★` : "New", icon: <Star size={14} />, color: "text-yellow-400" },
    { label: "Total Rides", value: String(totalRides), icon: <Bike size={14} />, color: "text-orange-400" },
    { label: "Status", value: isOnline ? "Online" : "Offline", icon: <ToggleRight size={14} />, color: isOnline ? "text-green-400" : "text-[var(--muted)]" },
    { label: "Platform Riders", value: "50K+", icon: <Users size={14} />, color: "text-blue-400" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] overflow-x-hidden">
      <Navbar />

      <section className="relative pt-32 pb-20 px-4 overflow-hidden dot-grid">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">

          <div className="mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[var(--surface-2)] border border-[var(--border-bright)] mb-6">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping-slow absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? "bg-green-400" : "bg-[var(--muted)]"}`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isOnline ? "bg-green-400" : "bg-[var(--muted)]"}`} />
              </span>
              <span className="text-sm text-[var(--muted-bright)] font-medium">
                Captain &mdash; {isOnline ? "Online & accepting rides" : "Currently offline"}
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-3">
              Hey Captain,<br /><span className="text-gradient">{name}.</span>
            </h1>
            <p className="text-[var(--muted)] text-lg">Your dashboard has everything you need to earn today.</p>
          </div>

          {/* Captain Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 animate-fade-in delay-100">
            {myStats.map((s) => (
              <div key={s.label} className="card-hover bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 text-center">
                <div className={`flex items-center justify-center gap-1.5 mb-1.5 ${s.color}`}>
                  {s.icon}
                  <span className="text-xl font-black text-[var(--foreground)]">{s.value}</span>
                </div>
                <p className="text-xs text-[var(--muted)]">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="grid sm:grid-cols-2 gap-4 animate-fade-in delay-200">
            <Link href="/captain/dashboard" className="group card-hover sm:col-span-2 flex items-center gap-5 p-6 rounded-2xl gradient-primary text-white border border-orange-500/40 shadow-xl shadow-orange-500/20">
              <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center shrink-0"><Gauge size={24} /></div>
              <div className="flex-1">
                <h3 className="font-black text-xl text-white mb-0.5">Go to Dashboard</h3>
                <p className="text-sm text-white/70">View earnings, accept rides & manage status</p>
              </div>
              <ArrowRight size={18} className="text-white/70 group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
            {[
              { icon: <BookOpen size={20} />, label: "Available Rides", desc: "Browse open requests", href: "/captain/dashboard", accent: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { icon: <Wallet size={20} />, label: "Earnings", desc: "Track daily income", href: "/captain/dashboard", accent: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
            ].map((a) => (
              <Link key={a.label} href={a.href} className="group card-hover flex items-center gap-4 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-bright)] transition-all">
                <div className={`w-11 h-11 rounded-xl ${a.bg} border ${a.border} flex items-center justify-center shrink-0 ${a.accent}`}>{a.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--foreground)] mb-0.5">{a.label}</h3>
                  <p className="text-xs text-[var(--muted)]">{a.desc}</p>
                </div>
                <ArrowRight size={15} className="text-[var(--muted)] group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CityTicker />

      {/* Captain Perks */}
      <section className="py-16 px-4 bg-[var(--surface)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)] mb-3">Captain Benefits</p>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--foreground)]">Earn more, <span className="text-gradient">stress less.</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Wallet size={20} />, title: "Daily Payouts", desc: "Earnings transferred daily. No waiting.", accent: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
              { icon: <Shield size={20} />, title: "Ride Insurance", desc: "Every trip covered. Safety first.", accent: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { icon: <Trophy size={20} />, title: "Rewards", desc: "Hit milestones, unlock bonuses.", accent: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
              { icon: <TrendingUp size={20} />, title: "Smart Matching", desc: "Get rides nearby in seconds.", accent: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
              { icon: <Clock size={20} />, title: "Flexible Hours", desc: "Go online or offline anytime.", accent: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
              { icon: <BookOpen size={20} />, title: "Growing Network", desc: "50,000+ riders and growing.", accent: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
            ].map((f, i) => (
              <div key={f.title} className="card-hover group bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`w-11 h-11 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center ${f.accent} mb-4 group-hover:scale-110 transition-transform`}>{f.icon}</div>
                <h3 className="font-black text-[var(--foreground)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SharedFooter />
    </div>
  );
}

// ─── Root Page — Role Dispatcher ─────────────────────────────────────────────

export default function HomePage() {
  const { session } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - 4rem)" }}>
          <div className="w-8 h-8 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  const role = session?.role;

  if (role === "RIDER") {
    const name = session!.user?.name?.split(" ")[0] || "Rider";
    return <RiderHome name={name} />;
  }

  if (role === "CAPTAIN") {
    const cap = session!.captain;
    return (
      <CaptainHome
        name={cap?.name?.split(" ")[0] || "Captain"}
        rating={cap?.rating ?? 0}
        totalRides={(cap as unknown as { totalRides?: number })?.totalRides ?? 0}
        isOnline={cap?.isOnline ?? false}
      />
    );
  }

  return <GuestHome />;
}
