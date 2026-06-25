"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MinorProfileData {
  id: string;
  first_name: string;
  last_name: string;
  cnp: string;
  date_of_birth: string;
  age: number;
  gender: "M" | "F";
  parent_id?: string;
  relationship: string;
  subscription_type?: string;
  subscription_expires_at?: string;
  created_at: string;
  total_consultations?: number; 
  total_prescriptions?: number;
}

interface Disease {
  disease_id: string;
  disease_name: string;
  category_name: string;
}

interface PrescriptionData {
  id: string;
  medication_name: string;
  dosage: string;
  duration: string;
  doctor_name: string;
  created_at: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MinorProfilePage() {
  const [profile, setProfile] = useState<MinorProfileData | null>(null);
  const [conditions, setConditions] = useState<string[]>([]);
  const [catalog, setCatalog] = useState<Disease[]>([]);
  const [recentHistory, setRecentHistory] = useState<any[]>([]); // Stare nouă pentru istoric
  const [isEditingConditions, setIsEditingConditions] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stare pentru rețete (hardcodate temporar)
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([
    {
      id: "1",
      medication_name: "Augmentin 1000mg",
      dosage: "1 capsulă la 12 ore",
      duration: "7 zile",
      doctor_name: "Dr. Ionescu",
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      medication_name: "Paracetamol 500mg",
      dosage: "La nevoie (febră/durere)",
      duration: "3 zile",
      doctor_name: "Dr. Ionescu",
      created_at: new Date().toISOString()
    }
  ]);

  const router = useRouter();
  const params = useParams();
  const minorId = params.id as string;

  useEffect(() => {
    if (!minorId) return;

    const fetchAll = async () => {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/login"); return; }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      try {
        // 1. Profilul minorului
        const profileRes = await fetch(`http://127.0.0.1:8085/api/patients/profile/minor/${minorId}`, { headers });
        if (!profileRes.ok) throw new Error("Nu am putut încărca profilul persoanei.");
        const profileData: MinorProfileData = await profileRes.json();
        setProfile(profileData);

        // 2. Boli pacient (folosind ID-ul minorului) - se aduc ca string-uri (nume)
        const condRes = await fetch(`http://127.0.0.1:8085/api/diseases/patient/${minorId}`, { headers });
        if (condRes.ok) setConditions(await condRes.json());

        // 3. Catalog boli (pentru mapare la editare)
        const catRes = await fetch("http://127.0.0.1:8085/api/diseases/catalog", { headers });
        if (catRes.ok) setCatalog(await catRes.json());

        // 4. Istoric specific minorului folosind query param
        const historyRes = await fetch(`http://127.0.0.1:8085/api/history?patient_id=${minorId}`, { headers });
        if (historyRes.ok) {
          const historyJson = await historyRes.json();
          setRecentHistory(historyJson.slice(0, 3));
        }

        // 5. Opțional: apel real pentru prescripții (comentat momentan, merge pe datele de test)
        // const presRes = await fetch(`http://127.0.0.1:8085/api/prescriptions/patient/${minorId}`, { headers });
        // if (presRes.ok) setPrescriptions(await presRes.json());

      } catch (err: any) {
        setError(err.message || "Eroare necunoscută.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [minorId, router]);

  // Logica sincronizată cu UUID-uri pentru salvare
  const handleSaveConditions = async () => {
    if (!profile) return;
    
    // Convertim textele bifate în UUID-uri din catalog
    const uuidConditions = conditions.map(name => {
      const match = catalog.find(d => d.disease_name === name);
      return match ? match.disease_id : null;
    }).filter(Boolean);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://127.0.0.1:8085/api/diseases/patient/${profile.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conditions: uuidConditions }),
      });
      
      if (res.ok) {
        setIsEditingConditions(false);
      } else {
        alert("Eroare la salvarea afecțiunilor.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCondition = (name: string) => {
    setConditions((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500">Se încarcă datele...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <p className="text-sm font-bold text-slate-600">{error || "Profil inexistent."}</p>
        <button onClick={() => router.back()} className="text-teal-600 font-bold hover:underline">Înapoi</button>
      </div>
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString("ro-RO", {
    year: "numeric", month: "long",
  });

  return (
    <>
      <div className="min-h-screen bg-slate-50 font-['DM_Sans',sans-serif] pb-12 relative">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

        <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">

          {/* ── Buton înapoi ── */}
          <button 
            onClick={() => router.push('/dashboard/profile')}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors mb-4"
          >
            ← Înapoi la contul principal
          </button>

          {/* ── Hero section ── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Persoană aflată în îngrijire</p>
                <span className="bg-teal-50 border border-teal-100 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                  {profile.relationship}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                #PAC-{profile.id.slice(0, 6).toUpperCase()} · Înregistrat: {memberSince}
              </p>
            </div>
            <button 
              onClick={() => setIsEditingProfile(true)}
              className="mt-4 md:mt-0 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              Editează Profil
            </button>
          </div>

          {/* ── Stats row (Sincronizat cu logica de profil) ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="🕒" label="Vârstă" value={profile.age.toString()} sub={profile.date_of_birth} valueColor="text-slate-900" />
            <StatCard icon="🩺" label="Consultații" value={profile.total_consultations?.toString() || "0"} sub="Total în sistem" valueColor="text-slate-900" />
            <StatCard icon="📝" label="Rețete Emise" value={profile.total_prescriptions?.toString() || "0"} sub="Istoric complet" valueColor="text-slate-900" />
            <StatCard 
              icon="💳" 
              label="Abonament" 
              value={profile.subscription_type && profile.subscription_type !== "Niciunul" ? profile.subscription_type : "Inactiv"} 
              sub={profile.subscription_type && profile.subscription_type !== "Niciunul" ? "Plan activ" : "Preia de la tutore"} 
              valueColor={profile.subscription_type && profile.subscription_type !== "Niciunul" ? "text-teal-700" : "text-orange-700"} 
            />
          </div>

          {/* ── Main content grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Date personale */}
            <Card title="Date Personale">
              <div className="space-y-4">
                <InfoRow label="Nume Complet" value={`${profile.last_name} ${profile.first_name}`} />
                <InfoRow label="CNP" value={profile.cnp || "Nespecificat"} />
                <InfoRow label="Sex" value={profile.gender === "M" ? "Masculin" : "Feminin"} />
                <InfoRow label="Data Nașterii" value={profile.date_of_birth} />
              </div>
            </Card>

            {/* Reprezentant Legal */}
            <Card title="Reprezentant Legal">
               <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-lg">
                    T
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Cont administrat de tutore</p>
                    <p className="text-xs text-slate-500 mt-0.5">Relație: <span className="font-bold text-slate-700">{profile.relationship}</span></p>
                  </div>
               </div>
               <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                 Toate notificările medicale și rețetele aferente acestui profil vor fi comunicate pe adresa de contact a contului principal.
               </p>
            </Card>

            {/* Dosar medical */}
            <Card 
              title="Dosar Medical" 
              action={
                isEditingConditions 
                  ? { label: "Salvează", onClick: handleSaveConditions, primary: true }
                  : { label: "✎ Editează", onClick: () => setIsEditingConditions(true) }
              }
            >
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Afecțiuni cronice</p>
              
              {!isEditingConditions ? (
                <div className="flex flex-wrap gap-2">
                  {conditions.length > 0 ? (
                    conditions.map((c, i) => (
                      <span key={i} className="bg-red-50 text-red-600 border border-red-100 px-3 py-1.5 rounded-lg text-xs font-bold">
                        {c}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic">Nicio afecțiune declarată.</p>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-4 max-h-48 overflow-y-auto space-y-3">
                  {catalog.map((d) => (
                    <label key={d.disease_id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={conditions.includes(d.disease_name)}
                        onChange={() => toggleCondition(d.disease_name)}
                        className="accent-teal-600 w-4 h-4 rounded border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {d.disease_name} <span className="text-slate-400 text-xs ml-1">({d.category_name})</span>
                      </span>
                    </label>
                  ))}
                  <button onClick={() => setIsEditingConditions(false)} className="text-xs text-slate-500 hover:text-slate-800 underline mt-2 block">
                    Anulează Editarea
                  </button>
                </div>
              )}
            </Card>

            {/* Plan de Tratament */}
            <Card title="Plan de Tratament Curent">
              {prescriptions.length === 0 ? (
                <EmptyState message="Nu există medicamente prescrise în sistem." />
              ) : (
                <div className="space-y-3">
                  {prescriptions.map((p) => (
                    <div 
                      key={p.id} 
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900">{p.medication_name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Schema: <span className="font-semibold text-slate-700">{p.dosage}</span> · Durată: <span className="font-semibold text-slate-700">{p.duration}</span>
                        </p>
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Prescris de</p>
                        <p className="text-xs font-bold text-teal-700">{p.doctor_name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* ─── CARD NOU: Consultații Recente ─── */}
            <Card title="Consultații Recente">
              {recentHistory.length === 0 ? (
                <EmptyState message="Nu există consultații înregistrate în istoric." />
              ) : (
                <div className="space-y-4">
                  {recentHistory.map((record: any, i: number) => {
                    let color = "bg-blue-400"; // Triaj / AI
                    let status = "ARHIVAT";
                    let subtitle = record.subtitle || record.symptoms_list || "Evaluare inițială";

                    if (record.record_type === "CONSULTATIE") {
                      color = "bg-teal-500";
                      status = "FINALIZAT";
                      
                      if (record.medication_list) subtitle = "Rețetă emisă";
                      if (record.referral_type) {
                        color = "bg-orange-400";
                        status = record.referral_type;
                        subtitle = `Trimis către specialist`;
                      }
                    }

                    const dateObj = new Date(record.event_date || record.created_at || new Date());
                    const formattedDate = dateObj.toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" });

                    return (
                      <div key={record.id || i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${color} shrink-0`} />
                          <div>
                            <p className="text-sm font-bold text-slate-800">{record.main_title || record.diagnosis || "Evaluare Medicală"}</p>
                            <p className="text-xs text-slate-400 font-semibold italic mt-0.5">{subtitle}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">{status}</span>
                          <p className="text-[10px] text-slate-400 font-bold mt-1">{formattedDate}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

          </div>
        </main>
      </div>

      {/* ── POP-UP EDITARE PROFIL (Centrare Perfectă) ── */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-[99999] grid place-items-center bg-black bg-opacity-60 p-4 sm:p-6 backdrop-blur-sm">
          
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Header Pop-up */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Editează Profilul</h2>
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="text-gray-400 hover:text-gray-800 bg-gray-50 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                title="Închide"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Formular - Pentru minor nu avem email/telefon în structură, punem CNP în loc */}
            <div className="p-8 space-y-5 bg-white">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nume</label>
                <input 
                  type="text" 
                  defaultValue={profile.last_name} 
                  className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Prenume</label>
                <input 
                  type="text" 
                  defaultValue={profile.first_name} 
                  className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">CNP</label>
                <input 
                  type="text" 
                  defaultValue={profile.cnp} 
                  className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all" 
                />
              </div>
            </div>

            {/* Footer Pop-up */}
            <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-100 rounded-xl shadow-sm transition-colors"
              >
                Anulează
              </button>
              <button 
                onClick={() => setIsEditingProfile(false)} 
                className="px-6 py-2.5 text-sm font-bold bg-teal-600 border-2 border-teal-600 hover:bg-teal-700 hover:border-teal-700 text-white rounded-xl shadow-md transition-colors"
              >
                Salvează
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Helper Components ───────────────────────────────────────────────────────

function Card({ title, action, children }: { title: string; action?: { label: string; onClick: () => void; primary?: boolean }; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        {action && (
          <button
            onClick={action.onClick}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
              action.primary 
                ? "bg-teal-600 text-white hover:bg-teal-700" 
                : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            {action.label}
          </button>
        )}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, valueColor = "text-slate-900" }: {
  icon: string; label: string; value: string; sub: string; valueColor?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-center">
      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2 mb-3">
        <span className="text-base">{icon}</span> {label}
      </p>
      <p className={`text-3xl font-extrabold mb-1 ${valueColor}`}>
        {value}
      </p>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
        {sub}
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0 last:pb-0">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}

function EmptyState({ message, subMessage }: { message: string, subMessage?: string }) {
  return (
    <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 w-full h-full flex flex-col justify-center items-center">
      <p className="text-sm font-medium text-slate-600">{message}</p>
      {subMessage && <p className="text-xs text-slate-400 mt-1">{subMessage}</p>}
    </div>
  );
}