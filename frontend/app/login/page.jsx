"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* LEFT */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[radial-gradient(circle_at_top,#1e293b,transparent_70%)]">
        <div className="text-xl font-semibold text-white">
          Flow<span className="text-primary">Track</span>
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-white leading-snug">
            Bring clarity to your team’s work
          </h1>
          <p className="mt-4 text-gray-400 max-w-sm">
            Plan projects, track progress, and collaborate in real time.
          </p>
        </div>
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} FlowTrack</p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
          <p className="text-gray-400 mt-1">Sign in to your FlowTrack account</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md bg-card px-4 py-2.5 text-sm text-white border focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md bg-card px-4 py-2.5 text-sm text-white border focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full py-2.5 rounded-md bg-white text-black hover:opacity-90 transition"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-400">
            Don’t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
