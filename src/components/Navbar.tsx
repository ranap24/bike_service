"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Bike, Menu, X, User, LogOut, Gauge, History, Map } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { NotificationBell } from "./NotificationBell";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { session, clearSession } = useAuthStore();
  const { clearAll: clearNotifications } = useNotificationStore();

  function handleLogout() {
    clearSession();
    clearNotifications();
    // Clear cookies via API then redirect
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      router.push("/");
    });
    setIsOpen(false);
  }

  const role = session?.role;

  const navLinks = role === "RIDER"
    ? [
        { href: "/rider/book", label: "Book Ride", icon: <Map size={16} /> },
        { href: "/rider/history", label: "History", icon: <History size={16} /> },
      ]
    : role === "CAPTAIN"
    ? [
        { href: "/captain/dashboard", label: "Dashboard", icon: <Gauge size={16} /> },
      ]
    : role === "ADMIN"
    ? [
        { href: "/admin/dashboard", label: "Dashboard", icon: <Gauge size={16} /> },
      ]
    : [
        { href: "/login", label: "Login", icon: null },
        { href: "/register", label: "Get Started", icon: null },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-[var(--primary)] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bike size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-[var(--foreground)]">
              Bike<span className="text-[var(--primary)]">Service</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            {session && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-[var(--border)]">
                <NotificationBell />
                <div className="flex items-center gap-2 text-sm text-[var(--muted)] px-2">
                  <div className="w-7 h-7 rounded-full bg-[var(--surface-2)] flex items-center justify-center">
                    <User size={14} className="text-[var(--primary)]" />
                  </div>
                  <span className="text-[var(--foreground)] font-medium">
                    {session.user?.name?.split(" ")[0] || session.captain?.name?.split(" ")[0]}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--surface-3)] border border-[var(--border)] text-[var(--muted)] font-mono uppercase tracking-wide">
                    {session.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--error)] hover:bg-[var(--surface-2)] transition-all"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-2)]"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] animate-fade-in">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "bg-orange-500/10 text-[var(--primary)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            {session && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-[var(--muted)] hover:bg-red-500/10 hover:text-[var(--error)] transition-all"
              >
                <LogOut size={16} />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
