"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Panou principal", href: "/dashboard" },
    { name: "Consultație nouă", href: "/dashboard/triage" },
    { name: "Programările mele", href: "/dashboard/appointments" },
    { name: "Istoric medical", href: "/dashboard/consultations" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* LOGO */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Telemed
            </Link>

            {/* Link-uri Navigare (Desktop) */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-blue-50 text-blue-600" 
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Acțiuni Dreapta */}
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
            >
              Ieșire
            </button>
            
            <Link href="/dashboard/profile" className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 hover:border-blue-300 transition-all">
              <span className="text-[10px] font-bold text-slate-600">Profil</span>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}