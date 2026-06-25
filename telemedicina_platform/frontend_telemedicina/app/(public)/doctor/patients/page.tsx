"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────
interface DoctorPatientRecord {
  id: string;
  patient_name: string;
  cnp: string | null;
  age: number;
  gender: string;
}

// Adaptat exact la `PatientHistoryDTO` din Rust
interface PatientHistoryDTO {
  id: string;
  record_type: string;
  event_date: string;
  main_title: string;
  subtitle: string;
  diagnosis: string;
  details: string;
  medication_list: string;
  medication_instructions: string;
  referral_type: string;
  referral_details: string;
}

export default function AllPatientsPage() {
  const [patients, setPatients] = useState<DoctorPatientRecord[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<DoctorPatientRecord | null>(null);
  const [history, setHistory] = useState<PatientHistoryDTO[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const accent = "#2BA583";
  const cardRadius = 18;
  const cardShadow = "0 1px 3px rgba(0,0,0,0.06), 0 1px 8px rgba(0,0,0,0.04)";

  // 1. Fetch inițial pentru toți pacienții
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8085/api/doctors/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Eroare la încărcarea listei.");
      setPatients(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch istoric când se selectează un pacient
  const handleViewHistory = async (patient: DoctorPatientRecord) => {
    setSelectedPatient(patient);
    setLoadingHistory(true);
    setHistory([]);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8085/api/history/all-records?patient_id=${patient.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHistory(await res.json());
      } else {
        throw new Error("Nu s-a putut descărca istoricul.");
      }
    } catch (err) {
      console.error("Eroare la istoric:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.cnp && p.cnp.includes(searchTerm))
  );

  if (loading) return <div className="p-10 text-center text-slate-400">Se încarcă baza de date...</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#F4F5F7", padding: "44px 32px", boxSizing: "border-box", fontFamily: "inherit" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>

        {/* ─── MOD VIZUALIZARE ISTORIC (Când un pacient e selectat) ─── */}
        {selectedPatient ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <button 
              onClick={() => setSelectedPatient(null)}
              style={{ alignSelf: "flex-start", background: "none", border: "none", color: "#64748b", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}
            >
              ← Înapoi la lista completă
            </button>

            <div style={{ background: "#fff", borderRadius: cardRadius, padding: 32, boxShadow: cardShadow, border: "1px solid #edf0f4" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "1px solid #f1f5f9", paddingBottom: 24, marginBottom: 24 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Dosar Medical Pacient</p>
                  <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>{selectedPatient.patient_name}</h2>
                  <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>CNP: {selectedPatient.cnp || "N/A"} · {selectedPatient.age} ani · Sex: {selectedPatient.gender}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>ID Sistem</p>
                  <p style={{ fontSize: 12, fontFamily: "monospace", color: "#475569" }}>{selectedPatient.id}</p>
                </div>
              </div>

              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#334155", marginBottom: 16 }}>Istoric Evenimente Medicale</h3>
              
              {loadingHistory ? (
                <p style={{ fontSize: 13, color: "#94a3b8" }}>Se descarcă istoricul complet...</p>
              ) : history.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", background: "#f8fafc", borderRadius: 12 }}>
                  <p style={{ fontSize: 13, color: "#94a3b8", fontStyle: "italic" }}>Nu există nicio înregistrare medicală pentru acest pacient.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {history.map((h, i) => {
                    const displayDate = new Date(h.event_date).toLocaleDateString("ro-RO", {
                      day: "numeric", month: "long", year: "numeric"
                    });

                    // Culoare diferită în funcție de tipul fișei
                    const isConsult = h.record_type === "CONSULTATIE";
                    const badgeColor = isConsult ? accent : "#0284c7"; // Verde ptr Consult, Albastru ptr Triaj

                    return (
                      <div key={h.id || i} style={{ padding: "20px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                          <div>
                            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 4 }}>📅 {displayDate}</p>
                            <h4 style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", margin: "0 0 4px 0" }}>{h.main_title}</h4>
                            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{h.subtitle}</p>
                          </div>
                          <span style={{ fontSize: 9, fontWeight: 800, color: badgeColor, background: "#fff", border: `1px solid ${badgeColor}44`, padding: "4px 8px", borderRadius: 6, textTransform: "uppercase" }}>
                            {h.record_type}
                          </span>
                        </div>

                        {/* Diagnostic */}
                        {h.diagnosis && (
                          <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px dashed #cbd5e1" }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 2 }}>Diagnostic</p>
                            <p style={{ fontSize: 13, color: "#334155", fontWeight: 600, margin: 0 }}>{h.diagnosis}</p>
                          </div>
                        )}

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          {/* Detalii / Recomandări */}
                          {h.details && (
                            <div>
                              <p style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 2 }}>Detalii/Recomandări</p>
                              <p style={{ fontSize: 13, color: "#475569", margin: 0, whiteSpace: "pre-wrap" }}>{h.details}</p>
                            </div>
                          )}

                          {/* Rețetă */}
                          {(h.medication_list || h.medication_instructions) && (
                            <div style={{ background: "#f0fdfa", padding: "12px", borderRadius: "8px", border: "1px solid #ccfbf1" }}>
                              <p style={{ fontSize: 11, fontWeight: 700, color: "#0d9488", textTransform: "uppercase", marginBottom: 4 }}>💊 Rețetă Prescrisă</p>
                              {h.medication_list && <p style={{ fontSize: 12, fontFamily: "monospace", color: "#0f766e", margin: "0 0 4px 0", fontWeight: 700 }}>{h.medication_list}</p>}
                              {h.medication_instructions && <p style={{ fontSize: 12, color: "#115e59", margin: 0 }}>{h.medication_instructions}</p>}
                            </div>
                          )}
                        </div>

                        {/* Trimitere */}
                        {h.referral_type && (
                          <div style={{ marginTop: 12, background: "#fffbeb", padding: "10px 14px", borderRadius: "8px", border: "1px solid #fef3c7" }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: "#b45309", textTransform: "uppercase", margin: "0 0 2px 0" }}>Bilet Trimitere: {h.referral_type}</p>
                            {h.referral_details && <p style={{ fontSize: 12, color: "#92400e", margin: 0 }}>{h.referral_details}</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        ) : (
          /* ─── MOD LISTĂ PACIENȚI (Default) ─── */
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#a0aec0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Registru Electronic</p>
                <h1 style={{ fontSize: 30, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>Lista Pacienților</h1>
              </div>
              <input 
                type="text" 
                placeholder="Caută după nume sau CNP..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 280, padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", outline: "none", fontSize: 14 }}
              />
            </div>

            {error && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fee2e2", borderRadius: 12, padding: "14px 18px", fontSize: 13, color: "#ef4444" }}>
                {error}
              </div>
            )}

            <div style={{ background: "#fff", borderRadius: cardRadius, boxShadow: cardShadow, border: "1px solid #edf0f4", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr", padding: "16px 24px", background: "#fcfcfd", borderBottom: "2px solid #f1f5f9", fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                <div>Nume și Prenume</div>
                <div>CNP</div>
                <div>Vârstă</div>
                <div>Sex</div>
                <div style={{ textAlign: "right" }}>Acțiune</div>
              </div>

              {filteredPatients.length === 0 ? (
                <div style={{ padding: "60px 0", textAlign: "center" }}>
                  <span style={{ fontSize: 32, opacity: 0.3, display: "block", marginBottom: 12 }}>👥</span>
                  <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, fontStyle: "italic" }}>Niciun pacient găsit.</p>
                </div>
              ) : (
                filteredPatients.map((p) => (
                  <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr", padding: "20px 24px", borderBottom: "1px solid #f1f5f9", alignItems: "center", fontSize: 14 }}>
                    <div style={{ fontWeight: 700, color: "#1e293b" }}>👤 {p.patient_name}</div>
                    <div style={{ fontFamily: "monospace", color: "#64748b" }}>{p.cnp || "N/A"}</div>
                    <div style={{ fontWeight: 600 }}>{p.age} ani</div>
                    <div style={{ color: "#64748b" }}>{p.gender === "M" ? "Masculin" : "Feminin"}</div>
                    <div style={{ textAlign: "right" }}>
                      <button 
                        onClick={() => handleViewHistory(p)}
                        style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#f0fdf4", color: accent, fontWeight: 700, cursor: "pointer", fontSize: 12 }}
                      >
                        Vezi Dosar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ textAlign: "center", marginTop: 8 }}>
              <Link href="/doctor" style={{ fontSize: 13, color: "#64748b", textDecoration: "none", fontWeight: 600 }}>
                ← Înapoi la panoul principal
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}