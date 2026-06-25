"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DoctorWorkspacePage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [finalDiagnosis, setFinalDiagnosis] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [medicationList, setMedicationList] = useState("");
  const [referralType, setReferralType] = useState("");
  const [referralDetails, setReferralDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { fetchWorkspaceData(); }, []);

  useEffect(() => {
    if (selectedApp) {
      setFinalDiagnosis(selectedApp.primary_diagnosis || "");
      setRecommendations(""); setMedicationList(""); setReferralType(""); setReferralDetails("");
    }
  }, [selectedApp]);

  const fetchWorkspaceData = async () => {
    setLoading(true); setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Sesiune expirată.");
      const res = await fetch("http://127.0.0.1:8085/api/doctors/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Nu s-a putut încărca lista.");
      setAppointments(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setSubmitting(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://127.0.0.1:8085/api/doctors/finalize-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          appointment_id: selectedApp.id, final_diagnosis: finalDiagnosis,
          recommendations, medication_list: medicationList || null,
          referral_type: referralType || null, referral_details: referralDetails || null,
        }),
      });
      if (res.ok) {
        alert("Fișa medicală a fost salvată cu succes!");
        setAppointments(appointments.filter(a => a.id !== selectedApp.id));
        setSelectedApp(null);
      } else {
        const d = await res.json();
        alert(`Eroare: ${d.message || "Verificați SGBD-ul."}`);
      }
    } catch { alert("Eroare de rețea."); }
    finally { setSubmitting(false); }
  };

  const loadMock = () => {
    setError(null);
    setAppointments([
      { id: "1", patient_name: "Ioan Popescu", primary_diagnosis: "Suspiciune Pneumonie Comunitară", complexity_level: 3, patient_answers: { "Febră > 38.5°C": "Da", "Tip tuse": "Productivă", "Dificultăți respiratorii": "Da" }, start_time: new Date().toISOString() },
      { id: "2", patient_name: "Maria Dumitru", primary_diagnosis: "Astm Bronșic Exacerbat", complexity_level: 4, patient_answers: { "Febră > 38.5°C": "Nu", "Tip tuse": "Uscată", "Dificultăți respiratorii": "Da" }, start_time: new Date(Date.now() + 1800000).toISOString() },
    ]);
  };

  const accent = "#2BA583";
  const shadow = "0 1px 3px rgba(0,0,0,0.06), 0 2px 10px rgba(0,0,0,0.04)";
  const radius = 18;

  const inp: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", border: "1px solid #e2e8f0", borderRadius: 10,
    padding: "10px 13px", fontSize: 13, color: "#1e293b", outline: "none",
    fontFamily: "inherit", background: "#fafbfc", marginTop: 6,
  };
  const lbl: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: "#94a3b8",
    letterSpacing: "0.1em", textTransform: "uppercase",
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F4F5F7", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 13, fontFamily: "inherit" }}>
      Se încarcă spațiul de lucru clinic...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F4F5F7", padding: "32px 24px", fontFamily: "inherit", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>

        {/* TOP BAR */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Link href="/doctor/dashboard" style={{ fontSize: 12, fontWeight: 700, color: accent, textDecoration: "none" }}>
            ← Înapoi la Panoul Principal
          </Link>
          {(error || appointments.length === 0) && (
            <button onClick={loadMock} style={{ fontSize: 12, fontWeight: 600, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 14px", color: "#475569", cursor: "pointer" }}>
              Încarcă Pacienți de Test
            </button>
          )}
        </div>

        {error && (
          <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 18px", marginBottom: 20, fontSize: 13, color: "#b91c1c" }}>
            ⚠ {error}
          </div>
        )}

        {/* SPLIT */}
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16, alignItems: "start" }}>

          {/* STÂNGA */}
          <div style={{ background: "#fff", border: "1px solid #edf0f4", borderRadius: radius, boxShadow: shadow, padding: 20, height: 680, display: "flex", flexDirection: "column" }}>
            <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 14, marginBottom: 16 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: "0 0 3px" }}>Listă de Așteptare</h2>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{appointments.length} pacienți alocați</p>
            </div>

            {appointments.length === 0 ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "#94a3b8", textAlign: "center" }}>
                <span style={{ fontSize: 28 }}>✅</span>
                <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>Toate consultațiile finalizate!</p>
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {appointments.map(app => (
                  <div key={app.id} onClick={() => setSelectedApp(app)} style={{
                    padding: "13px 15px", borderRadius: 12, cursor: "pointer",
                    border: selectedApp?.id === app.id ? `1.5px solid ${accent}` : "1px solid #f1f5f9",
                    background: selectedApp?.id === app.id ? "#F0FAF7" : "#f8fafc",
                    transition: "all 0.15s",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{app.patient_name}</p>
                      {app.complexity_level && (
                        <span style={{ fontSize: 9, fontWeight: 700, background: "#f1f5f9", color: "#64748b", padding: "2px 7px", borderRadius: 5, whiteSpace: "nowrap", flexShrink: 0 }}>
                          CPLX {app.complexity_level}/5
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 11, color: accent, fontWeight: 600, margin: "0 0 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {app.primary_diagnosis || "Necesită evaluare"}
                    </p>
                    {app.start_time && (
                      <p style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace", margin: 0, textAlign: "right" }}>
                        {new Date(app.start_time).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DREAPTA */}
          <div style={{ background: "#fff", border: "1px solid #edf0f4", borderRadius: radius, boxShadow: shadow, padding: "28px 32px", height: 680, display: "flex", flexDirection: "column" }}>
            {!selectedApp ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, textAlign: "center" }}>
                <span style={{ fontSize: 36, opacity: 0.2 }}>📄</span>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#334155", margin: 0 }}>Niciun pacient selectat</p>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0, maxWidth: 280, lineHeight: 1.6 }}>
                  Alege un pacient din lista din stânga pentru a deschide fișa de consultație.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFinalize} style={{ display: "flex", flexDirection: "column", height: "100%" }}>

                {/* Antet */}
                <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 16, marginBottom: 20 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", background: accent, color: "#fff", padding: "3px 10px", borderRadius: 6 }}>
                    Consultație în desfășurare
                  </span>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "10px 0 12px", letterSpacing: "-0.3px" }}>
                    {selectedApp.patient_name}
                  </h2>

                  {/* Răspunsuri triaj */}
                  {selectedApp.patient_answers && Object.keys(selectedApp.patient_answers).length > 0 && (
                    <div style={{ background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 12, padding: "12px 14px" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>
                        Răspunsuri Chestionar Triaj
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {(selectedApp.form_structure?.questions
                          ? selectedApp.form_structure.questions.map((q: any) => {
                              const raw = selectedApp.patient_answers?.[q.id];
                              if (raw === undefined || raw === null) return null;
                              const ans = raw === true ? "Da" : raw === false ? "Nu" : raw;
                              return { label: q.text, value: ans, key: q.id };
                            }).filter(Boolean)
                          : Object.entries(selectedApp.patient_answers).map(([k, v]: any) => ({
                              key: k, label: k, value: v === true ? "Da" : v === false ? "Nu" : v,
                            }))
                        ).map((item: any) => (
                          <div key={item.key} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "5px 11px", fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ color: "#94a3b8", fontWeight: 500 }}>{item.label}:</span>
                            <span style={{ fontWeight: 700, color: "#334155" }}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Câmpuri */}
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, paddingRight: 4 }}>

                  <div>
                    <label style={lbl}>Diagnostic Final Clinic <span style={{ color: "#ef4444" }}>*</span></label>
                    <input type="text" required value={finalDiagnosis} onChange={e => setFinalDiagnosis(e.target.value)}
                      placeholder="Ex: Pneumonie lobară inferioară dreaptă" style={inp} />
                  </div>

                  <div>
                    <label style={lbl}>Indicații Medicale & Regim <span style={{ color: "#ef4444" }}>*</span></label>
                    <textarea required rows={3} value={recommendations} onChange={e => setRecommendations(e.target.value)}
                      placeholder="Ex: Hidratare corespunzătoare, repaus la pat..."
                      style={{ ...inp, resize: "none", lineHeight: 1.6 }} />
                  </div>

                  <div>
                    <label style={lbl}>Schemă Tratament / Rețetă</label>
                    <textarea rows={2} value={medicationList} onChange={e => setMedicationList(e.target.value)}
                      placeholder="Ex: Augmentin 1g (1-0-1) 7 zile, Paracetamol 500mg la nevoie"
                      style={{ ...inp, resize: "none", fontFamily: "monospace", background: "#f8fafc" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingTop: 14, borderTop: "1px dashed #e2e8f0" }}>
                    <div>
                      <label style={lbl}>Tip Bilet de Trimitere</label>
                      <select value={referralType} onChange={e => setReferralType(e.target.value)}
                        style={{ ...inp, cursor: "pointer", appearance: "auto" }}>
                        <option value="">—</option>
                        <option value="INVESTIGATII_SUPLIMENTARE">Investigații Suplimentare</option>
                        <option value="SPECIALIST">Specialist</option>
                        <option value="SPITAL">Spital</option>
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Detalii Trimitere</label>
                      <input type="text" value={referralDetails} onChange={e => setReferralDetails(e.target.value)}
                        placeholder="Ex: Radiografie toracică AP" style={inp} />
                    </div>
                  </div>

                </div>

                {/* Submit */}
                <div style={{ paddingTop: 16, marginTop: 4 }}>
                  <button type="submit" disabled={submitting} style={{
                    width: "100%", background: submitting ? "#a0d4c4" : accent,
                    color: "#fff", border: "none", borderRadius: 12, padding: "14px",
                    fontSize: 14, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
                    fontFamily: "inherit", letterSpacing: "0.01em",
                  }}>
                    {submitting ? "Se salvează în SGBD..." : "Semnează fișa și finalizează consultația"}
                  </button>
                </div>

              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}