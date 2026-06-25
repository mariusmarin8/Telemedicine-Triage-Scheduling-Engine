"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
export default function DoctorDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]); // Stare nouă pentru istoric
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Sesiune expirată.");
      
    
      const [profileRes, appointmentsRes, historyRes] = await Promise.all([
        fetch("http://127.0.0.1:8085/api/doctors/profile", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://127.0.0.1:8085/api/doctors/appointments", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://127.0.0.1:8085/api/doctors/history", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      
      if (!profileRes.ok) throw new Error("Eroare la încărcarea profilului.");
      
      setProfile(await profileRes.json());
      setAppointments(appointmentsRes.ok ? await appointmentsRes.json() : []);
      setHistory(historyRes.ok ? await historyRes.json() : []);
      
    } catch (err: any) {
      setError(err.message || "Eroare de conexiune.");
    } finally { setLoading(false); }
  };

  const today = new Date().toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase();

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F4F5F7", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 13, fontFamily: "inherit" }}>
      Se încarcă...
    </div>
  );

  if (error || !profile) return (
    <div style={{ minHeight: "100vh", background: "#F4F5F7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: "inherit" }}>
      <p style={{ color: "#ef4444", fontSize: 14 }}>{error}</p>
      <button onClick={fetchData} style={{ padding: "9px 22px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
        Reîncearcă
      </button>
    </div>
  );

  const accent = "#2BA583";
  const cardRadius = 18;
  const cardShadow = "0 1px 3px rgba(0,0,0,0.06), 0 1px 8px rgba(0,0,0,0.04)";

  return (
    <div style={{ minHeight: "100vh", background: "#F4F5F7", padding: "44px 32px", fontFamily: "inherit", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#a0aec0", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{today}</p>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
            Bună ziua, Dr. {profile.last_name} 👋
          </h1>
        </div>

        {/* BANNER */}
        <div style={{ background: "#FEFCE8", border: "1px solid #FDE68A", borderRadius: 14, padding: "13px 20px", marginBottom: 32, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 15 }}>⚠️</span>
          <p style={{ fontSize: 13, color: "#854d0e", margin: 0, lineHeight: 1.5 }}>
            <strong style={{ fontWeight: 700 }}>Mod triaj automat.</strong> Asigurați-vă că verificați pre-diagnosticul înainte de validare.
          </p>
        </div>

        {/* 4 STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 36 }}>
          {[
            { icon: "🩺", label: "Specialitate", value: profile.specialty || "General", sub: null, color: "#1e293b" },
            { icon: "👥", label: "Coadă Pacienți", value: appointments.length, sub: "în așteptare acum", color: accent },
            { icon: "📄", label: "Status Parafă", value: "Validă", sub: profile.license_number || "Fără parafă", color: "#1e293b" },
            { icon: "📅", label: "Data", value: new Date().toLocaleDateString("ro-RO"), sub: null, color: "#1e293b" },
          ].map((card, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #edf0f4", borderRadius: cardRadius, padding: "22px 22px 18px", boxShadow: cardShadow }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
                <span style={{ fontSize: 14 }}>{card.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>{card.label}</span>
              </div>
              <p style={{ fontSize: 24, fontWeight: 800, color: card.color, margin: 0, lineHeight: 1 }}>{card.value}</p>
              {card.sub && <p style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 6, marginBottom: 0 }}>{card.sub}</p>}
            </div>
          ))}
        </div>

        {/* ACȚIUNI RAPIDE */}
        <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>Acțiuni Rapide</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 36 }}>
          
          {/* Verde - Duce către zona de finalizare consultații / lista pacienți */}
          <Link 
            href="/doctor/patients" 
            style={{ textDecoration: "none", background: accent, borderRadius: cardRadius, padding: "26px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 176, boxShadow: `0 4px 20px ${accent}33`, cursor: "pointer" }}
          >
            <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.18)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🩺</div>
            <div>
              <p style={{ color: "#fff", fontWeight: 800, fontSize: 16, margin: "0 0 5px", letterSpacing: "-0.2px" }}>Panou Consultații</p>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, margin: "0 0 18px", lineHeight: 1.5 }}>Gestionați și finalizați consultațiile pacienților alocați.</p>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>→</span>
            </div>
          </Link>

          {/* Alb 1 - Duce către programări */}
          <Link 
            href="/doctor/appointments" 
            style={{ textDecoration: "none", background: "#fff", border: "1px solid #edf0f4", borderRadius: cardRadius, padding: "26px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 176, boxShadow: cardShadow, cursor: "pointer" }}
          >
            <span style={{ fontSize: 22 }}>📅</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", margin: "0 0 5px" }}>Programările mele</p>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>Vezi și gestionează programările viitoare.</p>
            </div>
          </Link>

          {/* Alb 2 - Duce către istoric */}
          <Link 
            href="/doctor/history" 
            style={{ textDecoration: "none", background: "#fff", border: "1px solid #edf0f4", borderRadius: cardRadius, padding: "26px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 176, boxShadow: cardShadow, cursor: "pointer" }}
          >
            <span style={{ fontSize: 22 }}>📋</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", margin: "0 0 5px" }}>Istoric & Rețete</p>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.5 }}>Accesează consultațiile și rețetele anterioare.</p>
            </div>
          </Link>

        </div>

        {/* SECȚIUNEA DE JOS: PACIENȚI VS ISTORIC */}
        <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>Activitate Medicală</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

          {/* Stânga: Lista pacienți în așteptare */}
          <div style={{ background: "#fff", border: "1px solid #edf0f4", borderRadius: cardRadius, boxShadow: cardShadow, padding: "20px", height: 460, overflowY: "auto" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#334155", margin: "0 0 16px" }}>Pacienți în așteptare</p>
            {appointments.length === 0
              ? <p style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic", margin: 0, textAlign: "center", padding: "40px 0" }}>Nu aveți pacienți în coadă.</p>
              : appointments.map(app => (
                <div key={app.id} style={{
                  padding: "16px", borderRadius: 12, marginBottom: 10, 
                  border: "1px solid #f1f5f9", background: "#f8fafc",
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", margin: "0 0 4px" }}>{app.patient_name}</p>
                    <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                      Triaj: <span style={{ color: accent, fontWeight: 600 }}>{app.primary_diagnosis || "Nespecificat"}</span>
                    </p>
                  </div>
                  <span style={{ background: "#e0f2fe", color: "#0284c7", fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 6, textTransform: "uppercase" }}>
                    În așteptare
                  </span>
                </div>
              ))
            }
          </div>

          {/* Dreapta: Istoric Consultații */}
          <div style={{ background: "#fff", border: "1px solid #edf0f4", borderRadius: cardRadius, boxShadow: cardShadow, padding: "20px", height: 460, overflowY: "auto" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#334155", margin: "0 0 16px" }}>Istoric Consultații</p>
            {history.length === 0
              ? <p style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic", margin: 0, textAlign: "center", padding: "40px 0" }}>Nu există istoric disponibil.</p>
              : history.map((record: any, index: number) => {
                  const dateObj = new Date(record.created_at || record.event_date || new Date());
                  const formattedDate = dateObj.toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" });
                  
                  return (
                    <div key={record.id || index} style={{
                      padding: "16px", borderRadius: 12, marginBottom: 10, 
                      border: "1px solid #f1f5f9", background: "#fff",
                      display: "flex", justifyContent: "space-between", alignItems: "flex-start"
                    }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", margin: "0 0 4px" }}>{record.patient_name || "Pacient Necunoscut"}</p>
                        <p style={{ fontSize: 12, color: "#64748b", margin: 0, fontStyle: "italic" }}>
                          Diagnostic: {record.diagnosis || record.main_title || "-"}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", margin: "0 0 4px" }}>{formattedDate}</p>
                        <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: 9, fontWeight: 700, padding: "3px 6px", borderRadius: 4, textTransform: "uppercase" }}>
                          Finalizat
                        </span>
                      </div>
                    </div>
                  );
                })
            }
          </div>

        </div>

      </div>
    </div>
  );
}