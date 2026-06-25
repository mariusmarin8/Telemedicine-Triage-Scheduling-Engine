"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DoctorHistoryRecord {
  id: string;
  patient_name: string;
  diagnosis: string | null;
  consultation_date: string;
}

export default function DoctorHistoryPage() {
  const [history, setHistory] = useState<DoctorHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Sesiune expirată. Vă rugăm să vă reautentificați.");

      const res = await fetch("http://127.0.0.1:8085/api/doctors/history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Nu s-a putut încărca istoricul consultațiilor.");
      const data = await res.json();
      setHistory(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Eroare de conexiune la server.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{ minHeight: "100vh", background: "#F4F5F7", display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <p style={{ color: "#94a3b8", fontSize: "13px" }}>Se încarcă istoricul medical...</p>
      </div>
    );
  }

  const accent = "#2BA583";
  const cardRadius = 18;
  const cardShadow = "0 1px 3px rgba(0,0,0,0.06), 0 1px 8px rgba(0,0,0,0.04)";

  return (
    <div style={{ minHeight: "100vh", background: "#F4F5F7", padding: "44px 32px", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* ── HEADER PAGINĂ ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#a0aec0",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              Arhivă Medicală
            </p>
            <h1 style={{ fontSize: "30px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.5px" }}>
              Istoric Consultații
            </h1>
          </div>
          
          <span 
            style={{ 
              background: "#fff", 
              border: "1px solid #e2e8f0", 
              padding: "8px 16px", 
              borderRadius: "10px", 
              fontSize: "13px", 
              fontWeight: 600, 
              color: "#475569" 
            }}
          >
            Total fișe: {history.length}
          </span>
        </div>

        {/* ── EROARE ── */}
        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fee2e2",
              borderRadius: "12px",
              padding: "14px 18px",
              fontSize: "13px",
              color: "#ef4444",
            }}
          >
            {error}
          </div>
        )}

        {/* ── SECTIUNE LISTĂ / TABEL INTERN ── */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: cardRadius,
            boxShadow: cardShadow,
            border: "1px solid #edf0f4",
            overflow: "hidden",
            padding: "12px 24px"
          }}
        >
          {/* Header-ul coloanelor în linie */}
          <div 
            style={{ 
              display: "grid", 
              gridTemplateColumns: "1.5fr 2.5fr 1.5fr 1fr", 
              padding: "16px 12px", 
              borderBottom: "2px solid #f1f5f9",
              fontSize: "11px", 
              fontWeight: 700, 
              color: "#94a3b8", 
              textTransform: "uppercase",
              letterSpacing: "0.05em"
            }}
          >
            <div>Pacient</div>
            <div>Diagnostic stabilit</div>
            <div>Dată Consultație</div>
            <div style={{ textAlign: "right" }}>Cod Fișă (ID)</div>
          </div>

          {/* Rândurile cu datele reale din DTO */}
          {history.length === 0 && !error ? (
            <div style={{ padding: "60px 0", textAlign: "center" }}>
              <span style={{ fontSize: "32px", opacity: 0.3, display: "block", marginBottom: "12px" }}>📋</span>
              <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0, fontStyle: "italic" }}>
                Nu aveți nicio consultație finalizată înregistrată în istoric.
              </p>
            </div>
          ) : (
            history.map((record) => {
              const dateObj = new Date(record.consultation_date);
              const formattedDate = dateObj.toLocaleDateString("ro-RO", { 
                day: "numeric", 
                month: "long", 
                year: "numeric" 
              });
              const formattedTime = dateObj.toLocaleTimeString("ro-RO", { 
                hour: "2-digit", 
                minute: "2-digit" 
              });

              return (
                <div 
                  key={record.id}
                  style={{ 
                    display: "grid", 
                    gridTemplateColumns: "1.5fr 2.5fr 1.5fr 1fr", 
                    padding: "18px 12px", 
                    borderBottom: "1px solid #f1f5f9",
                    alignItems: "center",
                    fontSize: "14px"
                  }}
                >
                  {/* Nume Pacient */}
                  <div style={{ fontWeight: 700, color: "#1e293b" }}>
                    👤 {record.patient_name}
                  </div>

                  {/* Diagnostic Final */}
                  <div style={{ color: "#475569", fontWeight: 500, paddingRight: "16px" }}>
                    {record.diagnosis ? (
                      <span style={{ color: "#334155" }}>{record.diagnosis}</span>
                    ) : (
                      <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "13px" }}>Fără diagnostic specificat</span>
                    )}
                  </div>

                  {/* Dată și Oră */}
                  <div style={{ color: "#64748b", fontSize: "13px", fontWeight: 500 }}>
                    📅 {formattedDate} <span style={{ color: "#94a3b8", marginLeft: "4px" }}>({formattedTime})</span>
                  </div>

                  {/* ID Scurtat (Cod Fișă) */}
                  <div style={{ textAlign: "right" }}>
                    <span 
                      style={{ 
                        background: "#f1f5f9", 
                        color: "#64748b", 
                        fontSize: "11px", 
                        fontWeight: 700, 
                        padding: "4px 8px", 
                        borderRadius: "6px",
                        fontFamily: "monospace"
                      }}
                      title={record.id}
                    >
                      #{record.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── FOOTER LINK ── */}
        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <Link
            href="/doctor"
            style={{ fontSize: "13px", color: "#64748b", textDecoration: "none", fontWeight: 600 }}
            onMouseEnter={(e) => e.currentTarget.style.color = accent}
            onMouseLeave={(e) => e.currentTarget.style.color = "#64748b"}
          >
            ← Înapoi la panoul principal
          </Link>
        </div>

      </div>
    </div>
  );
}