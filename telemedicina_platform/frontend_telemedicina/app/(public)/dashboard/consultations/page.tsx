"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type TabType = "all" | "doctors";

export default function PatientMedicalTimelinePage() {
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Sesiune expirată. Vă rugăm să vă reconectați.");

      const res = await fetch("http://127.0.0.1:8085/api/history/all-records", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Nu s-a putut încărca istoricul medical.");

      const data = await res.json();
      setAllRecords(data);
    } catch (err: any) {
      console.error("Eroare fetch istoric:", err);
      setError(err.message || "Eroare de rețea.");
    } finally {
      setLoading(false);
    }
  };

  const displayedRecords =
    activeTab === "all"
      ? allRecords
      : allRecords.filter((r) => r.record_type === "CONSULTATIE");

  const getReferralLabel = (type: string) => {
    switch (type) {
      case "SPITAL": return "Internare spital";
      case "SPECIALIST": return "Specialist";
      case "INVESTIGATII_SUPLIMENTARE": return "Investigații suplimentare";
      default: return type;
    }
  };

  if (loading) {
    return (
      <div
        style={{ backgroundColor: "#f0eeeb" }}
        className="min-h-screen flex items-center justify-center"
      >
        <p style={{ color: "#9ca3af", fontSize: "13px", fontWeight: 400 }}>
          Se încarcă istoricul...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: "#f0eeeb", minHeight: "100vh", padding: "40px 16px" }}
    >
      {/* Conținut centrat, max 680px — același ca în imaginea de referință */}
      <div style={{ maxWidth: "680px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* ── CARD 1: HEADER ── */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "28px 32px",
            display: "flex",
            alignItems: "flex-start",
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
              Istoric clinic
            </p>
            <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#111827", margin: 0 }}>
              Dosarul meu medical
            </h1>
          </div>
          {/* Tabs în dreapta headerului */}
          <div style={{ display: "flex", gap: "8px", alignSelf: "center" }}>
            <button
              onClick={() => setActiveTab("all")}
              style={{
                padding: "5px 14px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 500,
                border: "1px solid",
                cursor: "pointer",
                transition: "all 0.15s",
                backgroundColor: activeTab === "all" ? "#111827" : "#ffffff",
                color: activeTab === "all" ? "#ffffff" : "#6b7280",
                borderColor: activeTab === "all" ? "#111827" : "#e5e7eb",
              }}
            >
              Toate
            </button>
            <button
              onClick={() => setActiveTab("doctors")}
              style={{
                padding: "5px 14px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 500,
                border: "1px solid",
                cursor: "pointer",
                transition: "all 0.15s",
                backgroundColor: activeTab === "doctors" ? "#111827" : "#ffffff",
                color: activeTab === "doctors" ? "#ffffff" : "#6b7280",
                borderColor: activeTab === "doctors" ? "#111827" : "#e5e7eb",
              }}
            >
              Consultații
            </button>
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
        {displayedRecords.length === 0 && !error && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "60px 32px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "13px", color: "#9ca3af" }}>
              Nu există înregistrări în această secțiune.
            </p>
          </div>
        )}

        {/* ── CARDS ── */}
        {displayedRecords.map((record) => {
          const dateObj = new Date(record.event_date);
          const isTriage = record.record_type === "TRIAJ";
          const hasMedication =
            record.medication_list && record.medication_list !== "Fără rețetă";
          const hasReferral =
            record.referral_type &&
            record.referral_type !== "FĂRĂ_TRIMITERE" &&
            record.referral_type !== "-";

          return (
            <Link
              key={record.id}
              href={`/dashboard/records/${record.id}`}
              style={{ textDecoration: "none", display: "block" }}
            >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "box-shadow 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
            >
              {/* ─ Card header ─ */}
              <div style={{ padding: "24px 28px 20px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "20px",
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
                        marginBottom: "5px",
                      }}
                    >
                      {isTriage ? "Sistem de triaj" : "Consult medical"}
                    </p>
                    <h2
                      style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#111827",
                        margin: 0,
                      }}
                    >
                      {record.main_title}
                    </h2>
                    {record.subtitle && (
                      <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "3px" }}>
                        {record.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Data + badge */}
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "16px" }}>
                    <div
                      style={{
                        display: "inline-block",
                        backgroundColor: "#f3f4f6",
                        borderRadius: "8px",
                        padding: "3px 10px",
                        fontSize: "11px",
                        fontWeight: 500,
                        color: "#374151",
                        marginBottom: "6px",
                      }}
                    >
                      {isTriage ? "Triaj automat" : "Consult final"}
                    </div>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                      {dateObj.toLocaleDateString("ro-RO", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p style={{ fontSize: "11px", color: "#9ca3af", margin: "2px 0 0" }}>
                      {dateObj.toLocaleTimeString("ro-RO", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>

                {/* ─ Diagnostic ─ */}
                <div style={{ marginBottom: "16px" }}>
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#9ca3af",
                      marginBottom: "6px",
                    }}
                  >
                    {isTriage ? "Diagnostic identificat" : "Diagnostic final"}
                  </p>

                  <div
                    style={{
                      backgroundColor: "#f9fafb",
                      borderRadius: "10px",
                      padding: "14px 16px",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#111827",
                        margin: "0 0 4px",
                      }}
                    >
                      {record.diagnosis}
                    </p>
                    {isTriage && (
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: "10px",
                          fontWeight: 500,
                          color: "#6b7280",
                          backgroundColor: "#ffffff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          padding: "2px 8px",
                          marginTop: "4px",
                        }}
                      >
                        diagnostic provizoriu
                      </span>
                    )}
                  </div>
                </div>

                {/* ─ Detalii / Indicații ─ */}
                <div>
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#9ca3af",
                      marginBottom: "6px",
                    }}
                  >
                    {isTriage ? "Recomandări" : "Indicații medicale"}
                  </p>
                  <div
                    style={{
                      backgroundColor: "#f9fafb",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "14px", flexShrink: 0 }}>
                      {isTriage ? "📋" : "💊"}
                    </span>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#374151",
                        margin: 0,
                        lineHeight: "1.6",
                      }}
                    >
                      {record.details}
                    </p>
                  </div>
                </div>
              </div>

              {/* ─ Tratament prescris ─ */}
              {!isTriage && hasMedication && (
                <div
                  style={{
                    borderTop: "1px solid #f3f4f6",
                    padding: "20px 28px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#9ca3af",
                      marginBottom: "12px",
                    }}
                  >
                    Tratament prescris
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#d1d5db",
                          marginBottom: "6px",
                        }}
                      >
                        Medicamente
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          fontFamily: "monospace",
                          fontWeight: 600,
                          color: "#1f2937",
                          whiteSpace: "pre-line",
                          lineHeight: "1.7",
                        }}
                      >
                        {record.medication_list}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#d1d5db",
                          marginBottom: "6px",
                        }}
                      >
                        Instrucțiuni
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          fontStyle: "italic",
                          lineHeight: "1.7",
                        }}
                      >
                        {record.medication_instructions}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ─ Trimitere ─ */}
              {!isTriage && hasReferral && (
                <div
                  style={{
                    borderTop: "1px solid #f3f4f6",
                    padding: "20px 28px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#9ca3af",
                      marginBottom: "10px",
                    }}
                  >
                    Trimitere emisă
                  </p>
                  <div
                    style={{
                      backgroundColor: "#fffbeb",
                      border: "1px solid #fde68a",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "13px", flexShrink: 0 }}>⚠️</span>
                    <div>
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "#92400e",
                          marginBottom: "4px",
                        }}
                      >
                        {getReferralLabel(record.referral_type)}
                      </span>
                      <p style={{ fontSize: "13px", color: "#78350f", margin: 0, lineHeight: "1.5" }}>
                        {record.referral_details}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </Link>
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
            href="/patient/dashboard"
            style={{
              fontSize: "13px",
              color: "#6b7280",
              textDecoration: "none",
            }}
          >
            ← Înapoi la dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}