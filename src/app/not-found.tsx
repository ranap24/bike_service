"use client";

import Link from "next/link";
import { Bike, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="relative mb-8">
          <div className="text-8xl font-black text-[var(--border)] select-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center animate-float">
              <Bike size={28} className="text-[var(--primary)]" />
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-black text-[var(--foreground)] mb-3">Ride not found</h1>
        <p className="text-[var(--muted)] mb-8">
          Looks like this page took a wrong turn. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 gradient-primary text-white font-semibold px-6 py-3 rounded-2xl hover:brightness-110 transition-all"
          >
            <Home size={16} /> Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] font-semibold px-6 py-3 rounded-2xl hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
