"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Team Member",
  });

  const [error, setError] = useState("");
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await register(form.name, form.email, form.password, form.role);
      router.push("/dashboard"); // Auto login and redirect
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed");
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
          <h1 className="text-3xl font-semibold text-white">
            Get started with FlowTrack
          </h1>
          <p className="mt-4 text-gray-400 max-w-sm">
            Create your account and start managing projects.
          </p>
        </div>
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} FlowTrack</p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-white">Create an account</h2>
          <p className="text-gray-400 mt-1">Start your journey with FlowTrack</p>

          <form onSubmit={handleRegister} className="mt-8 space-y-5">
            <input
              placeholder="Full Name"
              className="w-full rounded-md bg-card px-4 py-2.5 text-sm text-white border"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              placeholder="Email"
              className="w-full rounded-md bg-card px-4 py-2.5 text-sm text-white border"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-md bg-card px-4 py-2.5 text-sm text-white border"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <select
              className="w-full px-4 py-2.5 bg-card text-white border rounded-md"
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option className='text-black' value="Admin">Admin</option>
              <option className='text-black' value="Team Leader">Team Leader</option>
              <option className='text-black' value="Team Member">Team Member</option>
            </select>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full py-2.5 rounded-md bg-white text-black hover:opacity-90 transition"
            >
              Create Account
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
