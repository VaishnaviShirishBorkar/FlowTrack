"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <footer className="bg-bg/80">
      <div className="max-w-7xl mx-auto px-6 py-8 text-sm text-gray-400 flex justify-between">
        <p>© {new Date().getFullYear()} FlowTrack</p>
        <p>Built for modern teams</p>
      </div>
    </footer>
  );
}

