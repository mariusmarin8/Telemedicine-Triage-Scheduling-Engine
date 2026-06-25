"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredApps, setFilteredApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "past">("all");

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (!appointments) return;
    if (filter === "active") {
      setFilteredApps(appointments.filter((app) => app.status === "PROGRAMAT"));
    } else if (filter === "past") {
      setFilteredApps(appointments.filter((app) => app.status === "FINALIZAT" || app.status === "ANULAT"));
    } else {
      setFilteredApps(appointments);
    }
  }, [filter, appointments]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Sesiune expirată. Reautentificați-vă.");

      const res = await fetch("http://127.0.0.1:8085/api/appointments/history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Nu s-a putut încărca istoricul programărilor.");
      const data = await res.json();
      setAppointments(data);
      setFilteredApps(data);
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
        style={{ backgroundColor: "#f0eeeb", minHeight: "100vh" }}
        className="flex items-center justify-center"
      >
        <p style={{ color: "#9ca3af", fontSize: "13px" }}>Se încarcă programările...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f0eeeb", minHeight: "100vh", padding: "40px 16px" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* ── CARD HEADER ── */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "28px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#9ca3af",
                marginBottom: "6px",
              }}
            >
              Pacient
            </p>
            <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#111827", margin: 0 }}>
              Programările familiei
            </h1>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "8px" }}>
            {(["all", "active", "past"] as const).map((f) => {
              const labels: Record<string, string> = {
                all: `Toate (${appointments.length})`,
                active: "Urmează",
                past: "Istoric",
              };
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: "999px",
                    fontSize: "11px",
                    fontWeight: 500,
                    border: "1px solid",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    backgroundColor: filter === f ? "#111827" : "#ffffff",
                    color: filter === f ? "#ffffff" : "#6b7280",
                    borderColor: filter === f ? "#111827" : "#e5e7eb",
                  }}
                >
                  {labels[f]}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── EROARE ── */}
        {error && (
          <div
            style={{
              backgroundColor: "#fff7f7",
              border: "1px solid #fecaca",
              borderRadius: "12px",
              padding: "14px 18px",
              fontSize: "13px",
              color: "#dc2626",
            }}
          >
            {error}
          </div>
        )}

        {/* ── GOL ── */}
        {filteredApps.length === 0 && !error && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "60px 32px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "28px", marginBottom: "12px", opacity: 0.4 }}>📅</div>
            <p style={{ fontSize: "13px", color: "#9ca3af" }}>
              Nu s-a găsit nicio programare în această secțiune.
            </p>
          </div>
        )}

        {/* ── CARDURI PROGRAMĂRI ── */}
        {filteredApps.map((app) => {
          const appDate = new Date(app.start_time);
          const isScheduled = app.status === "PROGRAMAT";
          const isAnulat = app.status === "ANULAT";

          const statusStyle = isScheduled
            ? { backgroundColor: "#ecfdf5", color: "#059669", border: "1px solid #d1fae5" }
            : isAnulat
            ? { backgroundColor: "#fff7f7", color: "#dc2626", border: "1px solid #fecaca" }
            : { backgroundColor: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" };

          return (
            <div
              key={app.id}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "24px 28px" }}>
                
                {/* ── INDICATOR PACIENT ── */}
                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                   <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af" }}>
                     Pentru pacientul:
                   </span>
                   <span style={{ fontSize: "11px", fontWeight: 700, color: "#374151", backgroundColor: "#f3f4f6", padding: "4px 10px", borderRadius: "8px" }}>
                     👤 {app.patient_name || "Nespecificat"}
                   </span>
                </div>

                {/* Row: doctor info + data/status */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>

                  {/* Stânga: inițiala + info doctor */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        backgroundColor: "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#374151",
                        flexShrink: 0,
                        textTransform: "uppercase",
                      }}
                    >
                      {app.doctor_name?.[0] || "D"}
                    </div>
                    <div>
                      <p style={{ fontSize: "15px", fontWeight: 600, color: "#111827", margin: "0 0 3px" }}>
                        Dr. {app.doctor_name}
                      </p>
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "#9ca3af",
                          margin: 0,
                        }}
                      >
                        {app.specialty}
                      </p>
                    </div>
                  </div>

                  {/* Dreapta: dată + status */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#111827", margin: "0 0 3px" }}>
                      {appDate.toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: "0 0 8px" }}>
                      Ora {appDate.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <span
                      style={{
                        ...statusStyle,
                        display: "inline-block",
                        fontSize: "10px",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        padding: "3px 10px",
                        borderRadius: "999px",
                      }}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>

                {/* Diagnostic triaj */}
                {app.primary_diagnosis && (
                  <div
                    style={{
                      marginTop: "16px",
                      backgroundColor: "#f9fafb",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "13px", flexShrink: 0 }}>🩺</span>
                    <div>
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "#9ca3af",
                          margin: "0 0 3px",
                        }}
                      >
                        Simptomatologie triaj
                      </p>
                      <p style={{ fontSize: "13px", color: "#374151", margin: 0, fontWeight: 500 }}>
                        {app.primary_diagnosis}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* ── FOOTER LINK ── */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "16px 28px",
            textAlign: "center",
          }}
        >
          <Link
            href="/dashboard"
            style={{ fontSize: "13px", color: "#6b7280", textDecoration: "none" }}
          >
            ← Înapoi la dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}