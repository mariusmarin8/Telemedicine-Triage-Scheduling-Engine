"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

function Tab({ active, children, onClick }: any) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 16px",
        fontSize: "11px",
        fontWeight: 600,
        borderRadius: "999px",
        border: "1px solid",
        cursor: "pointer",
        transition: "all 0.15s",
        backgroundColor: active ? "#111827" : "#ffffff",
        color: active ? "#ffffff" : "#6b7280",
        borderColor: active ? "#111827" : "#e5e7eb",
      }}
    >
      {children}
    </button>
  );
}

function Row({ label, val, last }: any) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 0",
        borderBottom: last ? "none" : "1px solid #f3f4f6",
      }}
    >
      <span style={{ fontSize: "13px", color: "#9ca3af", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{val}</span>
    </div>
  );
}


function AfectiuniForm({ patientId, initialConditions, onSave, onCancel }: any) {
  const [catalog, setCatalog] = useState<any[]>([]);
  const [selectedNames, setSelectedNames] = useState<string[]>(initialConditions || []);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://127.0.0.1:8085/api/diseases/catalog", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCatalog(data))
      .catch((err) => console.error("Eroare catalog:", err));
  }, []);

  const handleToggle = (name: string) => {
    setSelectedNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const uuidConditions = selectedNames
        .map((name) => {
          const match = catalog.find((d) => d.disease_name === name);
          return match ? match.disease_id : null;
        })
        .filter(Boolean);

      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8085/api/diseases/patient/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ conditions: uuidConditions }),
      });
      if (res.ok) onSave();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "8px" }}>
      <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", margin: 0 }}>
        Selectează afecțiunile cunoscute
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {catalog.map((d: any) => {
          const isChecked = selectedNames.includes(d.disease_name);
          return (
            <label
              key={d.disease_id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 14px",
                borderRadius: "10px",
                border: `1px solid ${isChecked ? "#6ee7b7" : "#e5e7eb"}`,
                backgroundColor: isChecked ? "#f0fdf9" : "#ffffff",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <input
                type="checkbox"
                style={{ width: "16px", height: "16px", accentColor: "#108A75", cursor: "pointer" }}
                checked={isChecked}
                onChange={() => handleToggle(d.disease_name)}
              />
              <span style={{ fontSize: "13px", fontWeight: 500, color: isChecked ? "#059669" : "#374151" }}>
                {d.disease_name}
                <span style={{ color: "#9ca3af", fontSize: "11px", marginLeft: "6px" }}>({d.category_name})</span>
              </span>
            </label>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "10px", paddingTop: "8px" }}>
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            flex: 1,
            backgroundColor: "#111827",
            color: "#ffffff",
            padding: "12px",
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: "13px",
            border: "none",
            cursor: isSaving ? "not-allowed" : "pointer",
            opacity: isSaving ? 0.6 : 1,
          }}
        >
          {isSaving ? "Se salvează..." : "✓ Salvează modificările"}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "12px 20px",
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: "13px",
            border: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
            color: "#6b7280",
            cursor: "pointer",
          }}
        >
          Anulează
        </button>
      </div>
    </div>
  );
}

function InformatiiMedicaleContent({ patientId }: { patientId: string }) {
  const [conditions, setConditions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchConditions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8085/api/diseases/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setConditions(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConditions(); }, [patientId]);

  if (loading)
    return (
      <div style={{ padding: "32px 0", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>
        Se încarcă datele medicale...
      </div>
    );

  if (showForm) {
    return (
      <AfectiuniForm
        patientId={patientId}
        initialConditions={conditions}
        onSave={() => { setShowForm(false); fetchConditions(); }}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div style={{ paddingTop: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", margin: 0 }}>
          Dosar Medical
        </p>
        <button
          onClick={() => setShowForm(true)}
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#059669",
            backgroundColor: "#f0fdf9",
            border: "1px solid #6ee7b7",
            borderRadius: "8px",
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          + Adaugă afecțiuni
        </button>
      </div>

      {conditions.length === 0 ? (
        <p style={{ fontSize: "13px", color: "#9ca3af", padding: "16px 0" }}>
          Nu există informații medicale adăugate încă.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {conditions.map((c, i) => (
            <div
              key={i}
              style={{
                padding: "12px 16px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#111827",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ color: "#059669", fontSize: "18px", lineHeight: 1 }}>•</span> {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function IstoricMinorContent({ patientId }: { patientId: string }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://127.0.0.1:8085/api/history/all-records?patient_id=${patientId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) setHistory(await res.json());
      } catch (err) {
        console.error("Eroare încărcare istoric minor:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [patientId]);

  if (loading) {
    return (
      <div style={{ padding: "32px 0", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>
        Se încarcă istoricul medical...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <p style={{ fontSize: "13px", color: "#9ca3af", padding: "16px 0", margin: 0, italic: "true" } as any}>
        Nu există istoric de consultații înregistrat pentru acest minor.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", paddingTop: "4px" }}>
      {history.map((record: any, i: number) => {
        let color = "#3b82f6"; // Albastru implicit pentru Triaj / AI
        let status = "ARHIVAT";
        let subtitle = record.subtitle || record.symptoms_list || "Evaluare inițială";

        if (record.record_type === "CONSULTATIE") {
          color = "#108A75"; // Verde pentru consultația la medic
          status = "FINALIZAT";
          
          if (record.medication_list) subtitle = "Rețetă emisă";
          if (record.referral_type) {
            color = "#f97316"; // Portocaliu pentru trimiteri speciale
            status = record.referral_type;
            subtitle = `Trimis către specialist`;
          }
        }

        const dateObj = new Date(record.event_date || record.created_at || new Date());
        const formattedDate = dateObj.toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" });

        return (
          <div
            key={record.id || i}
            style={{
              padding: "14px 16px",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#111827", margin: "0 0 2px" }}>
                  {record.main_title || record.diagnosis || "Evaluare Medicală"}
                </p>
                <p style={{ fontSize: "11px", color: "#6b7280", margin: 0, fontWeight: 500, fontStyle: "italic" }}>
                  {subtitle}
                </p>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <span style={{ fontSize: "9px", fontWeight: 700, color: "#4b5563", backgroundColor: "#f3f4f6", borderRadius: "4px", padding: "2px 6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {status}
              </span>
              <p style={{ fontSize: "10px", color: "#9ca3af", fontWeight: 600, margin: "4px 0 0" }}>
                {formattedDate}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
// =============================================================================
// COMPONENTA PRINCIPALĂ
// =============================================================================

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "10px 14px",
  fontSize: "13px",
  color: "#111827",
  backgroundColor: "#ffffff",
  outline: "none",
  fontWeight: 500,
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#9ca3af",
  marginBottom: "6px",
};

export default function MinoriPage() {
  const [parent, setParent] = useState<any>(null);
  const [minors, setMinors] = useState<any[]>([]);
  const [selectedMinor, setSelectedMinor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("date_personale");

  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addError, setAddError] = useState("");

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMinor, setEditingMinor] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: "", last_name: "", date_of_birth: "", gender: "", cnp: "", relationship: "",
  });

  const fetchMinorsList = async (token: string) => {
    try {
      const res = await fetch("http://127.0.0.1:8085/api/patients/minors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMinors(data);
        if (data.length > 0 && !selectedMinor && !isCreateMode) setSelectedMinor(data[0]);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem("token");
      if (!token) { setLoading(false); return; }
      try {
        const parentRes = await fetch("http://127.0.0.1:8085/api/patients/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (parentRes.ok) setParent(await parentRes.json());
        await fetchMinorsList(token);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchInitialData();
  }, []);

  const handleAddSubmit = async (e: any) => {
    e.preventDefault();
    setAddError("");
    if (!formData.gender) { setAddError("Te rugăm să selectezi sexul pacientului."); return; }
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch("http://127.0.0.1:8085/api/patients/minors", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ first_name: "", last_name: "", date_of_birth: "", gender: "", cnp: "", relationship: "" });
        setIsCreateMode(false);
        await fetchMinorsList(token);
        const resList = await fetch("http://127.0.0.1:8085/api/patients/minors", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const newList = await resList.json();
        setSelectedMinor(newList[newList.length - 1]);
      } else {
        const errData = await res.json();
        setAddError(errData.message || "Eroare la adăugare.");
      }
    } catch { setAddError("Eroare server."); }
    finally { setIsSubmitting(false); }
  };

  const openEditMode = (minor: any) => {
    setEditingMinor({
      ...minor,
      first_name: minor.first_name || "",
      last_name: minor.last_name || "",
      cnp: minor.cnp || "",
      gender: minor.gender || "",
      relationship: minor.relationship || "",
      date_of_birth: minor?.date_of_birth ? String(minor.date_of_birth).split("T")[0] : "",
    });
    setIsEditMode(true);
    setIsCreateMode(false);
  };

  const handleUpdateSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    if (!token) return;
    const payload = {
      first_name: editingMinor.first_name, last_name: editingMinor.last_name,
      date_of_birth: editingMinor.date_of_birth, gender: editingMinor.gender,
      cnp: editingMinor.cnp, relationship: editingMinor.relationship,
    };
    try {
      const res = await fetch(`http://127.0.0.1:8085/api/patients/minors/${editingMinor.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsEditMode(false);
        await fetchMinorsList(token);
        setSelectedMinor({ ...selectedMinor, ...payload });
      } else {
        const errData = await res.json();
        alert(errData.message || "Eroare la modificare.");
      }
    } catch { alert("Eroare server."); }
    finally { setIsSubmitting(false); }
  };

  if (loading)
    return (
      <div style={{ backgroundColor: "#f0eeeb", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#9ca3af", fontSize: "13px" }}>Se încarcă...</p>
      </div>
    );

  return (
    <div style={{ backgroundColor: "#f0eeeb", minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9ca3af", marginBottom: "6px" }}>
              Cont pacient
            </p>
            <h1 style={{ fontSize: "22px", fontWeight: 600, color: "#111827", margin: 0 }}>Pacienți minori</h1>
          </div>
          <button
            onClick={() => { setIsCreateMode(true); setIsEditMode(false); setSelectedMinor(null); }}
            disabled={isCreateMode}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 600,
              border: "none",
              cursor: isCreateMode ? "not-allowed" : "pointer",
              backgroundColor: isCreateMode ? "#e5e7eb" : "#111827",
              color: isCreateMode ? "#9ca3af" : "#ffffff",
              transition: "all 0.15s",
            }}
          >
            {isCreateMode ? "Se adaugă..." : "+ Adaugă minor"}
          </button>
        </div>

        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* COLOANA STÂNGĂ */}
          <div style={{ width: "300px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Card tutore */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>
                  {parent?.first_name?.[0] || ""}{parent?.last_name?.[0] || ""}
                </div>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#111827", margin: "0 0 2px" }}>
                    {parent ? `${parent.first_name} ${parent.last_name}` : "Se încarcă..."}
                  </p>
                  <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", margin: 0 }}>
                    Tutore legal
                  </p>
                </div>
              </div>
              <span style={{ fontSize: "10px", fontWeight: 600, color: "#059669", backgroundColor: "#f0fdf9", border: "1px solid #6ee7b7", borderRadius: "999px", padding: "3px 10px" }}>
                Activ
              </span>
            </div>

            {/* Lista minori */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {minors.map((minor) => {
                const isSelected = selectedMinor?.id === minor.id && !isCreateMode;
                const isBoy = minor?.gender === "M";

                return (
                  <div
                    key={minor.id}
                    onClick={() => { 
                      setIsCreateMode(false); 
                      setIsEditMode(false); 
                      setSelectedMinor(minor); 
                    }}
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "14px",
                      padding: "16px",
                      cursor: "pointer",
                      border: `1px solid ${isSelected ? "#6ee7b7" : "#e5e7eb"}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.15s",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* bara verde stanga */}
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", backgroundColor: isSelected ? "#059669" : "transparent", borderRadius: "4px 0 0 4px", transition: "background-color 0.15s" }} />

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingLeft: "8px" }}>
                      <div style={{ width: "38px", height: "38px", borderRadius: "50%", backgroundColor: isBoy ? "#eff6ff" : "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: isBoy ? "#3b82f6" : "#f97316", flexShrink: 0 }}>
                        {minor?.first_name?.[0] || "?"}{minor?.last_name?.[0] || "?"}
                      </div>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "#111827", margin: "0 0 2px" }}>
                          {minor.first_name} {minor.last_name}
                        </p>
                        <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
                          {minor.age} ani · {minor.relationship || (isBoy ? "fiu" : "fiică")}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditMode(minor); }}
                      style={{ width: "30px", height: "30px", borderRadius: "50%", border: "1px solid #e5e7eb", backgroundColor: "#ffffff", color: "#9ca3af", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0 }}
                    >
                      ✎
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Card responsabilitate */}
            <div style={{ backgroundColor: "#f0fdf9", border: "1px solid #6ee7b7", borderRadius: "14px", padding: "18px" }}>
              <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#059669", marginBottom: "8px" }}>
                Responsabilitate legală
              </p>
              <p style={{ fontSize: "12px", color: "#065f46", lineHeight: "1.6", margin: 0, fontWeight: 500 }}>
                Prin adăugarea unui minor, confirmi că ești reprezentantul legal al acestuia și că datele medicale introduse sunt corecte.
              </p>
            </div>
          </div>

          {/* COLOANA DREAPTĂ */}
          <div style={{ flex: 1, minWidth: "0", display: "flex", flexDirection: "column", gap: "16px" }}>

            {isCreateMode ? (
              <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", overflow: "hidden" }}>
                <div style={{ padding: "28px 32px 24px", borderBottom: "1px solid #f3f4f6" }}>
                  <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9ca3af", marginBottom: "6px" }}>
                    Înregistrare
                  </p>
                  <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#111827", margin: 0 }}>Adaugă pacient minor</h2>
                </div>

                <form onSubmit={handleAddSubmit} style={{ padding: "28px 32px" }}>
                  {addError && (
                    <div style={{ backgroundColor: "#fff7f7", border: "1px solid #fecaca", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "#dc2626", marginBottom: "20px" }}>
                      {addError}
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={labelStyle}>Prenume *</label>
                      <input required type="text" placeholder="ex. Maria" style={inputStyle} value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Nume *</label>
                      <input required type="text" placeholder="ex. Popescu" style={inputStyle} value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Dată naștere *</label>
                      <input required type="date" style={inputStyle} value={formData.date_of_birth} onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Sex *</label>
                      <select required style={{ ...inputStyle, color: formData.gender ? "#111827" : "#9ca3af" }} value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                        <option value="" disabled hidden>Selectează</option>
                        <option value="M">Masculin</option>
                        <option value="F">Feminin</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={labelStyle}>CNP *</label>
                    <input required type="text" minLength={13} maxLength={13} placeholder="13 cifre" style={inputStyle} value={formData.cnp} onChange={e => setFormData({ ...formData, cnp: e.target.value })} />
                  </div>
                  <div style={{ marginBottom: "28px" }}>
                    <label style={labelStyle}>Relație cu tutorele</label>
                    <select style={{ ...inputStyle, color: formData.relationship ? "#111827" : "#9ca3af" }} value={formData.relationship} onChange={e => setFormData({ ...formData, relationship: e.target.value })}>
                      <option value="" disabled hidden>Selectează</option>
                      <option value="Fiu">Fiu (Părinte)</option>
                      <option value="Fiica">Fiică (Părinte)</option>
                      <option value="Persoana_reprezentata">Persoana reprezentată legal</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button type="button" onClick={() => { setIsCreateMode(false); if (minors.length > 0) setSelectedMinor(minors[0]); }}
                      style={{ padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, border: "1px solid #e5e7eb", backgroundColor: "#ffffff", color: "#6b7280", cursor: "pointer" }}>
                      Anulează
                    </button>
                    <button type="submit" disabled={isSubmitting}
                      style={{ padding: "10px 24px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, border: "none", backgroundColor: "#111827", color: "#ffffff", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.6 : 1 }}>
                      {isSubmitting ? "Se salvează..." : "✓ Salvează"}
                    </button>
                  </div>
                </form>
              </div>

            ) : selectedMinor && isEditMode && editingMinor ? (
              <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", overflow: "hidden" }}>
                <div style={{ padding: "28px 32px 24px", borderBottom: "1px solid #f3f4f6" }}>
                  <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9ca3af", marginBottom: "6px" }}>
                    Editare profil
                  </p>
                  <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#111827", margin: 0 }}>
                    {editingMinor.first_name} {editingMinor.last_name}
                  </h2>
                </div>

                <form onSubmit={handleUpdateSubmit} style={{ padding: "28px 32px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                    <div>
                      <label style={labelStyle}>Prenume *</label>
                      <input required type="text" style={inputStyle} value={editingMinor.first_name} onChange={e => setEditingMinor({ ...editingMinor, first_name: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Nume *</label>
                      <input required type="text" style={inputStyle} value={editingMinor.last_name} onChange={e => setEditingMinor({ ...editingMinor, last_name: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Dată naștere *</label>
                      <input required type="date" style={inputStyle} value={editingMinor.date_of_birth} onChange={e => setEditingMinor({ ...editingMinor, date_of_birth: e.target.value })} />
                    </div>
                    <div>
                      <label style={labelStyle}>Sex *</label>
                      <select required style={{ ...inputStyle, color: editingMinor.gender ? "#111827" : "#9ca3af" }} value={editingMinor.gender} onChange={e => setEditingMinor({ ...editingMinor, gender: e.target.value })}>
                        <option value="" disabled hidden>Selectează</option>
                        <option value="M">Masculin</option>
                        <option value="F">Feminin</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: "16px" }}>
                    <label style={labelStyle}>CNP *</label>
                    <input required type="text" minLength={13} maxLength={13} style={inputStyle} value={editingMinor.cnp} onChange={e => setEditingMinor({ ...editingMinor, cnp: e.target.value })} />
                  </div>
                  <div style={{ marginBottom: "28px" }}>
                    <label style={labelStyle}>Relație cu tutorele</label>
                    <select style={{ ...inputStyle, color: editingMinor.relationship ? "#111827" : "#9ca3af" }} value={editingMinor.relationship} onChange={e => setEditingMinor({ ...editingMinor, relationship: e.target.value })}>
                      <option value="" disabled hidden>Selectează</option>
                      <option value="Fiu">Fiu</option>
                      <option value="Fiica">Fiică</option>
                      <option value="Persoana_reprezentata">Persoana reprezentată legal</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button type="button" onClick={() => setIsEditMode(false)}
                      style={{ padding: "10px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, border: "1px solid #e5e7eb", backgroundColor: "#ffffff", color: "#6b7280", cursor: "pointer" }}>
                      Anulează
                    </button>
                    <button type="submit" disabled={isSubmitting}
                      style={{ padding: "10px 24px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, border: "none", backgroundColor: "#111827", color: "#ffffff", cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.6 : 1 }}>
                      {isSubmitting ? "Se salvează..." : "✓ Salvează"}
                    </button>
                  </div>
                </form>
              </div>

            ) : selectedMinor ? (
              <>
                {/* Card profil minor */}
                <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "50%", backgroundColor: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 700, color: "#f97316" }}>
                      {selectedMinor.first_name[0]}{selectedMinor.last_name[0]}
                    </div>
                    <div>
                      <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>
                        {selectedMinor.first_name} {selectedMinor.last_name}
                      </h2>
                      <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
                        #MIN-{selectedMinor.id.slice(0, 5)}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                    {/* NOU: Butonul "Vezi profilul complet" */}
                    <Link
                      href={`/dashboard/profile/minor/${selectedMinor.id}`}
                      style={{ 
                        padding: "8px 16px", 
                        borderRadius: "10px", 
                        fontSize: "12px", 
                        fontWeight: 600, 
                        border: "1px solid #e5e7eb", 
                        backgroundColor: "#f9fafb", 
                        color: "#374151", 
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      👁 Vezi profilul complet
                    </Link>
                    
                    <button
                      onClick={() => openEditMode(selectedMinor)}
                      style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, border: "1px solid #e5e7eb", backgroundColor: "#ffffff", color: "#374151", cursor: "pointer" }}
                    >
                      ✎ Editează
                    </button>
                    <button
                      style={{ padding: "8px 16px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, border: "1px solid #fecaca", backgroundColor: "#fff7f7", color: "#dc2626", cursor: "pointer" }}
                    >
                      🗑 Elimină
                    </button>
                  </div>
                </div>

                {/* Card tabs + conținut */}
                <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", overflow: "hidden" }}>
                  <div style={{ display: "flex", gap: "8px", padding: "16px 20px", borderBottom: "1px solid #f3f4f6", backgroundColor: "#f9fafb" }}>
                    <Tab active={activeTab === "date_personale"} onClick={() => setActiveTab("date_personale")}>Date personale</Tab>
                    <Tab active={activeTab === "informatii_medicale"} onClick={() => setActiveTab("informatii_medicale")}>Info medicale</Tab>
                    <Tab active={activeTab === "istoric"} onClick={() => setActiveTab("istoric")}>Istoric</Tab>
                  </div>
                  <div style={{ padding: "20px 28px" }}>
                    {activeTab === "date_personale" && (
                      <div>
                        <Row label="Dată naștere" val={selectedMinor.date_of_birth ? new Date(selectedMinor.date_of_birth).toISOString().split("T")[0] : "N/A"} />
                        <Row label="Vârstă" val={`${selectedMinor.age} ani`} />
                        <Row label="Sex" val={selectedMinor.gender === "M" ? "Masculin" : "Feminin"} />
                        <Row label="CNP" val={selectedMinor.cnp || "Nespecificat"} />
                        <Row label="Relație tutor" val={selectedMinor.relationship || (selectedMinor.gender === "M" ? "Fiu" : "Fiică")} last />
                      </div>
                    )}
                    {activeTab === "informatii_medicale" && <InformatiiMedicaleContent patientId={selectedMinor.id} />}
                    {activeTab === "istoric" && <IstoricMinorContent patientId={selectedMinor.id} />}
                  </div>
                </div>

                {/* Buton consultație */}
                <Link
                  href={`/dashboard/triage?patient_id=${selectedMinor.id}`}
                  style={{
                    display: "block",
                    textAlign: "center",
                    backgroundColor: "#111827",
                    color: "#ffffff",
                    padding: "16px",
                    borderRadius: "14px",
                    fontSize: "14px",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "background-color 0.15s",
                  }}
                >
                  👤 Solicită consultație pentru {selectedMinor.first_name}
                </Link>
              </>

            ) : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", borderRadius: "16px", padding: "60px", minHeight: "400px" }}>
                <p style={{ fontSize: "13px", color: "#9ca3af" }}>
                  Selectează un minor din listă pentru a-i vedea detaliile.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}