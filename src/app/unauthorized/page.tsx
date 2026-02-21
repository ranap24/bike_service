import Link from "next/link";
import { Shield, Home } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <Shield size={36} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-black text-[var(--foreground)] mb-3">Access Denied</h1>
        <p className="text-[var(--muted)] mb-8">
          You don&apos;t have permission to access this page. Please login with the correct account.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 gradient-primary text-white font-semibold px-6 py-3 rounded-2xl hover:brightness-110 transition-all"
          >
            Login
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] font-semibold px-6 py-3 rounded-2xl hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all"
          >
            <Home size={16} /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
