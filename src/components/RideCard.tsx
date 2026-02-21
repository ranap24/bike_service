import { RideStatus } from "../../types/index.types";
import { MapPin, Clock, DollarSign, Bike, Car } from "lucide-react";

interface RideCardProps {
  ride: {
    id: string;
    pickupAddress: string;
    dropAddress: string;
    status: RideStatus;
    fare: number;
    distance: number;
    duration: number;
    createdAt: string;
    captain?: { name: string; vehicleType: string; vehiclePlate: string } | null;
    rider?: { name: string } | null;
  };
  viewAs?: "rider" | "captain" | "admin";
}

const STATUS_STYLES: Record<RideStatus, string> = {
  REQUESTED: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  ACCEPTED: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  CAPTAIN_ARRIVED: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  IN_PROGRESS: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  COMPLETED: "bg-green-500/10 text-green-400 border-green-500/30",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/30",
};

const STATUS_LABELS: Record<RideStatus, string> = {
  REQUESTED: "Searching",
  ACCEPTED: "Captain Assigned",
  CAPTAIN_ARRIVED: "Captain Arrived",
  IN_PROGRESS: "On the Way",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function RideCard({ ride, viewAs = "rider" }: RideCardProps) {
  const VehicleIcon = ride.captain?.vehicleType === "CAR" ? Car : Bike;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--primary)]/50 transition-all duration-300 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
            <VehicleIcon size={14} className="text-[var(--primary)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">
              {new Date(ride.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              })}
            </p>
            {viewAs !== "rider" && ride.rider && (
              <p className="text-xs font-medium text-[var(--foreground)]">{ride.rider.name}</p>
            )}
          </div>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_STYLES[ride.status]}`}>
          {STATUS_LABELS[ride.status]}
        </span>
      </div>

      {/* Route */}
      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
          <p className="text-sm text-[var(--foreground)] leading-snug">{ride.pickupAddress}</p>
        </div>
        <div className="ml-2.5 border-l-2 border-dashed border-[var(--border)] h-4" />
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <MapPin size={10} className="text-red-400" />
          </div>
          <p className="text-sm text-[var(--foreground)] leading-snug">{ride.dropAddress}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[var(--muted)]">
            <Clock size={13} />
            <span className="text-xs">{ride.duration} min</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--muted)]">
            <MapPin size={13} />
            <span className="text-xs">{ride.distance} km</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign size={14} className="text-[var(--primary)]" />
          <span className="font-bold text-[var(--foreground)]">₹{ride.fare}</span>
        </div>
      </div>

      {ride.captain && (
        <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] flex items-center justify-center">
            <VehicleIcon size={12} className="text-[var(--muted)]" />
          </div>
          <span className="text-xs text-[var(--muted)]">
            {ride.captain.name} · {ride.captain.vehiclePlate}
          </span>
        </div>
      )}
    </div>
  );
}
