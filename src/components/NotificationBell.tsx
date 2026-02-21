"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, X, CheckCheck, Bike, MapPin, Clock, AlertCircle, Info } from "lucide-react";
import { useNotificationStore, AppNotification, NotificationType } from "@/store/notificationStore";

function notificationIcon(type: NotificationType) {
  switch (type) {
    case "RIDE_ACCEPTED":   return <Bike size={15} className="text-green-400" />;
    case "CAPTAIN_ARRIVED":  return <MapPin size={15} className="text-blue-400" />;
    case "RIDE_STARTED":     return <Bike size={15} className="text-orange-400" />;
    case "RIDE_COMPLETED":   return <CheckCheck size={15} className="text-green-400" />;
    case "RIDE_CANCELLED":   return <AlertCircle size={15} className="text-red-400" />;
    case "RIDE_REQUESTED":   return <Clock size={15} className="text-yellow-400" />;
    default:                 return <Info size={15} className="text-[var(--muted)]" />;
  }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationItem({ n, onRead, onRemove }: {
  n: AppNotification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className={`group relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-[var(--surface-2)] ${
        !n.read ? "bg-orange-500/5" : ""
      }`}
      onClick={() => onRead(n.id)}
    >
      {/* Unread dot */}
      {!n.read && (
        <span className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" />
      )}

      {/* Icon */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--surface-3)] border border-[var(--border)] flex items-center justify-center mt-0.5">
        {notificationIcon(n.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--foreground)] leading-tight">{n.title}</p>
        <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">{n.message}</p>
        <p className="text-xs text-[var(--muted)]/60 mt-1">{timeAgo(n.createdAt)}</p>
      </div>

      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(n.id); }}
        className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--muted)] hover:text-[var(--error)] transition-all"
      >
        <X size={13} />
      </button>
    </div>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, markAsRead, markAllRead, removeNotification, clearAll } =
    useNotificationStore();

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`relative p-2 rounded-xl transition-all ${
          open
            ? "bg-[var(--surface-2)] text-[var(--foreground)]"
            : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
        }`}
        title="Notifications"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] rounded-full bg-[var(--primary)] text-white text-[10px] font-black flex items-center justify-center px-1 shadow-lg shadow-orange-500/40">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[460px] flex flex-col bg-[var(--surface)] border border-[var(--border-bright)] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-[var(--primary)]" />
              <span className="text-sm font-bold text-[var(--foreground)]">Notifications</span>
              {unread > 0 && (
                <span className="text-xs bg-orange-500/15 text-[var(--primary)] font-bold px-1.5 py-0.5 rounded-full border border-orange-500/20">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[var(--muted)] hover:text-[var(--primary)] transition-colors px-2 py-1 rounded-lg hover:bg-[var(--surface-2)]"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-[var(--muted)] hover:text-[var(--error)] transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center mb-3">
                  <Bell size={20} className="text-[var(--muted)]" />
                </div>
                <p className="text-sm font-semibold text-[var(--foreground)] mb-1">All caught up</p>
                <p className="text-xs text-[var(--muted)]">Notifications will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    n={n}
                    onRead={markAsRead}
                    onRemove={removeNotification}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
