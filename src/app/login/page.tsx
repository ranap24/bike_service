"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Bike, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "../../../store/authStore";
import { UserRole } from "../../../types/index.types";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = (searchParams.get("role") as UserRole) || "RIDER";

  const [role, setRole] = useState<UserRole>(defaultRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { setSession } = useAuthStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Login failed");

      const { tokens, user, captain } = json.data;

      setSession({
        accessToken: tokens.accessToken,
        role,
        user: role !== "CAPTAIN" ? user : undefined,
        captain: role === "CAPTAIN" ? captain : undefined,
      });

      if (role === "CAPTAIN") router.push("/captain/dashboard");
      else if (role === "ADMIN") router.push("/admin/dashboard");
      else router.push("/rider/book");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary)] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bike size={20} className="text-white" />
            </div>
            <span className="font-black text-xl text-[var(--foreground)]">
              Bike<span className="text-[var(--primary)]">Service</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-[var(--foreground)] mb-2">Welcome back</h1>
          <p className="text-[var(--muted)]">Sign in to continue your journey</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-8">
          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-8 p-1.5 bg-[var(--surface-2)] rounded-2xl">
            {(["RIDER", "CAPTAIN", "ADMIN"] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                  role === r
                    ? "bg-[var(--primary)] text-white shadow-lg shadow-orange-500/25"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {r === "RIDER" ? "🏍️" : r === "CAPTAIN" ? "🧑‍✈️" : "⚙️"} {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              required
            />
            <div>
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={16} />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Sign In as {role === "RIDER" ? "Rider" : role === "CAPTAIN" ? "Captain" : "Admin"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--muted)]">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[var(--primary)] font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
