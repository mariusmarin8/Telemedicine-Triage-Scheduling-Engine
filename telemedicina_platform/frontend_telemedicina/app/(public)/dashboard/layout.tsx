import Navbar from "@/components/Navbar"; // Verifică dacă ai alias-ul @ sau pune calea relativă ../../components/Navbar

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-[#F8FAFC]">
      {/* 1. Navbar-ul stă sus, fix */}
      <Navbar /> 
      
      {/* 2. Aici se vor schimba paginile (Profile, Programări, etc.) */}
      <main>
        {children}
      </main>
    </section>
  );
}