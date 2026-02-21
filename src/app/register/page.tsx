"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User, Phone, Bike, Car } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { VehicleType, UserRole } from "../../../types/index.types";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role") as UserRole) || "RIDER";

  const [role, setRole] = useState<"RIDER" | "CAPTAIN">(
    defaultRole === "CAPTAIN" ? "CAPTAIN" : "RIDER"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    vehicleType: "BIKE" as VehicleType,
    vehiclePlate: "", vehicleModel: "", vehicleColor: "",
  });

  function update(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (role === "CAPTAIN" && step === 1) { setStep(2); return; }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Registration failed");

      router.push(`/login?role=${role}&registered=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary)] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bike size={20} className="text-white" />
            </div>
            <span className="font-black text-xl text-[var(--foreground)]">
              Bike<span className="text-[var(--primary)]">Service</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-[var(--foreground)] mb-2">Create account</h1>
          <p className="text-[var(--muted)]">Join BikeService today</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
          {/* Toggle */}
          <div className="grid grid-cols-2 gap-2 mb-8 p-1.5 bg-[var(--surface-2)] rounded-2xl">
            {(["RIDER", "CAPTAIN"] as const).map((r) => (
              <button
                key={r}
                onClick={() => { setRole(r); setStep(1); }}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  role === r
                    ? "bg-[var(--primary)] text-white shadow-lg shadow-orange-500/25"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {r === "RIDER" ? "🏍️ Rider" : "🧑‍✈️ Captain"}
              </button>
            ))}
          </div>

          {/* Captain step indicator */}
          {role === "CAPTAIN" && (
            <div className="flex items-center gap-2 mb-6">
              <div className={`flex-1 h-1 rounded-full transition-all ${step >= 1 ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`} />
              <div className={`flex-1 h-1 rounded-full transition-all ${step >= 2 ? "bg-[var(--primary)]" : "bg-[var(--border)]"}`} />
              <p className="text-xs text-[var(--muted)] ml-2">Step {step}/2</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <Input label="Full name" placeholder="Rahul Sharma" value={form.name} onChange={(e) => update("name", e.target.value)} icon={<User size={15} />} required />
                <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} icon={<Mail size={15} />} required />
                <Input label="Phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => update("phone", e.target.value)} icon={<Phone size={15} />} required={role === "CAPTAIN"} />
                <Input label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => update("password", e.target.value)} icon={<Lock size={15} />} required />
              </>
            )}

            {step === 2 && role === "CAPTAIN" && (
              <>
                <div>
                  <label className="text-sm font-medium text-[var(--muted)] block mb-2">Vehicle Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["BIKE", "AUTO", "CAR"] as VehicleType[]).map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => update("vehicleType", v)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                          form.vehicleType === v
                            ? "border-[var(--primary)] bg-orange-500/10 text-[var(--primary)]"
                            : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--primary)]/50"
                        }`}
                      >
                        {v === "BIKE" ? <Bike size={18} /> : v === "AUTO" ? <span className="text-lg">🛺</span> : <Car size={18} />}
                        <span className="text-xs font-semibold">{v}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <Input label="Vehicle Plate" placeholder="KA01AB1234" value={form.vehiclePlate} onChange={(e) => update("vehiclePlate", e.target.value)} required />
                <Input label="Vehicle Model" placeholder="Bajaj Pulsar 150" value={form.vehicleModel} onChange={(e) => update("vehicleModel", e.target.value)} required />
                <Input label="Vehicle Color" placeholder="Black" value={form.vehicleColor} onChange={(e) => update("vehicleColor", e.target.value)} required />
              </>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">{error}</div>
            )}

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              {role === "CAPTAIN" && step === 1 ? "Next: Vehicle Details →" : "Create Account"}
            </Button>

            {step === 2 && (
              <Button type="button" variant="ghost" fullWidth onClick={() => setStep(1)}>
                ← Back
              </Button>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--muted)]">
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--primary)] font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
