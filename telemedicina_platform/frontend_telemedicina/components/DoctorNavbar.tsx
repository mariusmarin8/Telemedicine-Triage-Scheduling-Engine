"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function DoctorNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Panou principal", href: "/doctor/dashboard" },
    { name: "Programări", href: "/doctor/appointments" },
    { name: "Lista Pacienți", href: "/doctor/patients" },
    { name: "Istoric Consultații", href: "/doctor/history" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/doctor/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* LOGO */}
          <div className="flex items-center gap-8">
            <Link href="/doctor" className="flex items-baseline gap-1">
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text">
                Telemed           
              </span>
              
            </Link>

            {/* Link-uri Navigare (Desktop) */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = item.href === "/doctor" 
                  ? pathname === "/doctor"
                  : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-teal-50 text-teal-700" 
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
            
            <Link 
              href="/doctor/profile" 
              className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200 hover:border-teal-300 transition-all"
              title="Profil Medic"
            >
              <span className="text-[10px] font-bold text-slate-600">MD</span>
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}