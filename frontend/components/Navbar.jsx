import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-bg/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-xl font-semibold text-white">
          Flow<span className="text-primary">Track</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="#features" className="hover:text-white transition">
            Features
          </Link>
          <Link href="#pricing" className="hover:text-white transition">
            Pricing
          </Link>
          <Link href="#docs" className="hover:text-white transition">
            Docs
          </Link>

          <Link
            href="/login"
            className="ml-2 px-4 py-2 rounded-md bg-primary text-white hover:opacity-90 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
