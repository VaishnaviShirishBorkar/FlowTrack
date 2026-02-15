"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <nav className="bg-bg/80 backdrop-blur sticky top-0 z-50 border-b border-gray-800">
      <div className={`${isDashboard ? 'px-6' : 'max-w-7xl mx-auto px-6'} h-14 flex items-center justify-between`}>

        {/* Logo → Home */}
        <Link href="/" className="text-xl font-semibold text-white">
          Flow<span className="text-primary">Track</span>
        </Link>

        <div className="flex items-center gap-6 text-sm text-gray-400">
          {isDashboard ? (
            /* Dashboard navbar: Home link + user info */
            <>
              <Link href="/" className="hover:text-white transition flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
                </svg>
                Home
              </Link>
              <Link href="/dashboard" className="hover:text-white transition">
                Dashboard
              </Link>
              <Link href="/dashboard/profile" className="hover:text-white transition flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="text-white font-medium">{user?.name}</span>
              </Link>
              <button
                onClick={logout}
                className="text-red-400 hover:text-red-300 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            /* Public navbar */
            <>
              <Link href="#features" className="hover:text-white transition">Features</Link>
              <Link href="#pricing" className="hover:text-white transition">Pricing</Link>
              <Link href="#docs" className="hover:text-white transition">Docs</Link>
              {user ? (
                <div className="flex items-center gap-4 ml-2">
                  <Link href="/dashboard" className="px-4 py-2 rounded-md bg-primary text-white hover:opacity-90 transition">
                    Dashboard
                  </Link>
                  <button onClick={logout} className="text-red-400 hover:text-red-300 transition">
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link href="/login" className="ml-2 px-4 py-2 rounded-md bg-primary text-white hover:opacity-90 transition">
                  Sign In
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
