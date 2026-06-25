"use client";

import { usePathname } from "next/navigation";
import DoctorNavbar from "@/components/DoctorNavbar";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideNavbar =
    pathname === "/doctor/login" ||
    pathname === "/doctor/register";

  return (
    <div className="min-h-screen bg-slate-50">
      {!hideNavbar && <DoctorNavbar />}

      <main>{children}</main>
    </div>
  );
}