"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [minors, setMinors] = useState<any[]>([]);
  const [recentHistory, setRecentHistory] = useState<any[]>([]);
  const [nextAppt, setNextAppt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Stări pentru Pop-up-ul de abonament
  const [showSubModal, setShowSubModal] = useState(false);
  const [subPlan, setSubPlan] = useState("Individual");
  const [subCycle, setSubCycle] = useState("Lunar");
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    Promise.all([
      fetch("http://127.0.0.1:8085/api/patients/profile", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("http://127.0.0.1:8085/api/patients/minors", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("http://127.0.0.1:8085/api/history/all-records", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("http://127.0.0.1:8085/api/appointments/history", { headers: { Authorization: `Bearer ${token}` } }),
    ])
      .then(async ([meRes, minorsRes, historyRes, apptRes]) => {
        const meJson = await meRes.json();

        let minorsJson = [];
        if (minorsRes.ok) minorsJson = await minorsRes.json();

        let historyJson = [];
        if (historyRes.ok) historyJson = await historyRes.json();

        let apptJson = [];
        if (apptRes.ok) apptJson = await apptRes.json();

        setData(meJson);
        setMinors(minorsJson);
        setRecentHistory(historyJson.slice(0, 3));

        const now = new Date();
        const upcoming = apptJson
          .filter((appt: any) => new Date(appt.start_time) > now)
          .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

        setNextAppt(upcoming[0] || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Eroare la încărcarea datelor în panou:", err);
        setLoading(false);
      });
  }, []);

  // Funcția care execută plata către backend
  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8085/api/subscriptions/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan_type: subPlan,
          billing_cycle: subCycle,
        }),
      });

      if (!res.ok) throw new Error("A apărut o problemă la procesarea plății.");
      
      // Dacă a reușit, actualizăm starea pe loc!
      setData((prev: any) => ({ ...prev, subscription_type: subPlan }));
      setShowSubModal(false);
      
    } catch (err: any) {
      alert(err.message || "Eroare de conexiune la server.");
    } finally {
      setIsPurchasing(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-slate-400 font-medium">
        Se deschide panoul medical...
      </div>
    );
  if (!data)
    return (
      <div className="p-10 text-center text-red-500">
        Eroare la încărcarea datelor.
      </div>
    );

  // Verificăm rapid dacă are abonament valid
  const hasActiveSubscription = data.subscription_type && data.subscription_type !== "Niciunul";

  return (
    <div className="min-h-screen bg-[#F8FAFB] text-slate-700 pb-12 relative">
      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8">

        {/* --- HEADER --- */}
        <header className="space-y-1">
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            {new Date().toLocaleDateString("ro-RO", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="text-2xl font-semibold text-slate-800">
            Bună ziua, <span className="text-[#108A75]">{data.first_name}</span> 👋
          </h1>
        </header>

        {/* --- BANNER ABONAMENT --- */}
        {!hasActiveSubscription ? (
          <div className="bg-[#FFFBEB] border border-[#FEF3C7] p-4 rounded-xl flex justify-between items-center shadow-sm">
            <p className="text-sm text-[#92400E] flex items-center gap-2">
              <span className="text-lg">⚠️</span>{" "}
              <span className="font-bold">Abonament inactiv.</span> Nu ai acces la consultații online.
            </p>
            <button 
              onClick={() => setShowSubModal(true)} 
              className="text-sm font-bold text-[#B45309] hover:underline transition-all"
            >
              Activează acum →
            </button>
          </div>
        ) : (
          <div className="bg-[#ECFDF5] border border-[#D1FAE5] p-4 rounded-xl flex justify-between items-center shadow-sm">
            <p className="text-sm text-[#065F46] flex items-center gap-2">
              <span className="text-lg">✅</span>{" "}
              <span className="font-bold">Abonament {data.subscription_type} activ.</span> Ai acces complet la serviciile de telemedicină.
            </p>
            {data.subscription_type === "Individual" && (
              <button 
                onClick={() => { setSubPlan("Family"); setShowSubModal(true); }} 
                className="text-sm font-bold text-[#047857] hover:underline transition-all"
              >
                Upgrade la Family ↑
              </button>
            )}
          </div>
        )}

        {/* --- STATISTICI --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="🕒" label="Vârstă" val={data.age || "N/A"} sub={data.date_of_birth || "-"} />
          <StatCard icon="🩺" label="Consultații" val={data.total_consultations ?? 0} sub="total în sistem" />
          <StatCard icon="📄" label="Rețete emise" val={data.total_prescriptions ?? 0} sub="istoric complet" />
          <StatCard
            icon="💳"
            label="Abonament"
            val={hasActiveSubscription ? "Activ" : "Inactiv"}
            sub={hasActiveSubscription ? `Plan ${data.subscription_type}` : "fără plan activ"}
            valColor={hasActiveSubscription ? "text-[#108A75]" : "text-[#B45309]"}
          />
        </div>

        {/* --- ACȚIUNI RAPIDE --- */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
            Acțiuni rapide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Link
              href="/dashboard/triage"
              className="bg-[#2D9F83] p-8 rounded-2xl text-white shadow-md hover:bg-[#248A71] transition-all flex flex-col justify-between h-48"
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
                👤
              </div>
              <div>
                <h4 className="font-bold text-lg leading-tight">Consultație nouă</h4>
                <p className="text-xs opacity-90 font-light mt-1 text-teal-50">
                  Introduci simptomele și primești o evaluare medicală imediată.
                </p>
                <div className="mt-4 text-xl">→</div>
              </div>
            </Link>
            <ActionCard
              icon="📅"
              title="Programările mele"
              desc="Vezi și gestionează consultațiile tale."
              link="/dashboard/appointments"
            />
            <ActionCard
              icon="📄"
              title="Rețete & istoric"
              desc="Accesează fișele tale medicale anterioare."
              link="/dashboard/profile"
            />
          </div>
        </div>

        {/* --- MAIN SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Stânga (Programare + Istoric) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Următoarea programare */}
            {nextAppt ? (
              <div className="bg-[#EFF6FF] border border-[#DBEAFE] p-6 rounded-2xl shadow-sm relative">
                <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">
                  Următoarea programare
                </h4>

                {nextAppt.patient_name !== `${data.first_name} ${data.last_name}` && (
                  <div className="absolute top-6 right-6 bg-orange-100 text-orange-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border border-orange-200 shadow-sm">
                    Pentru: {nextAppt.patient_name.split(" ")[0]}
                  </div>
                )}

                <p className="text-2xl font-bold text-blue-900 capitalize">
                  {new Date(nextAppt.start_time).toLocaleDateString("ro-RO", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>

                <span className="inline-block bg-blue-500/10 text-blue-600 px-3 py-1 rounded-md text-xs font-bold mt-2">
                  ora{" "}
                  {new Date(nextAppt.start_time).toLocaleTimeString("ro-RO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                <div className="mt-8 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm uppercase">
                      {nextAppt.doctor_name?.[0] || "D"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{nextAppt.doctor_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{nextAppt.specialty}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-white/50 px-2 py-1 rounded">
                    {nextAppt.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-[#EFF6FF] border border-[#DBEAFE] p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center min-h-[225px]">
                <div className="text-3xl mb-2 opacity-40">📅</div>
                <h4 className="text-sm font-bold text-blue-900 mb-1">Nicio programare activă</h4>
                <p className="text-xs text-blue-600/60 text-center max-w-xs">
                  Nu ai nicio consultație planificată pentru tine sau minorii tăi.
                </p>
              </div>
            )}

            {/* Consultații recente */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm font-bold text-slate-800">Consultații recente</h4>
                <Link
                  href="/dashboard/consultations"
                  className="text-[11px] font-bold text-[#108A75] hover:underline transition-all"
                >
                  vezi toate →
                </Link>
              </div>
              <div className="space-y-5">
                {recentHistory && recentHistory.length > 0 ? (
                  recentHistory.map((record: any) => {
                    let color = "bg-blue-400";
                    let status = "ARHIVAT";
                    let subtitle = record.subtitle || record.symptoms_list || "Evaluare inițială";

                    if (record.record_type === "CONSULTATIE") {
                      color = "bg-teal-500";
                      status = "FINALIZAT";
                      if (record.medication_list) subtitle = "Rețetă emisă";
                      if (record.referral_type) {
                        color = "bg-orange-400";
                        status = record.referral_type;
                        subtitle = "Trimis către specialist";
                      }
                    }

                    const dateObj = new Date(record.event_date || record.created_at || new Date());
                    const formattedDate = dateObj.toLocaleDateString("ro-RO", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                    const uniqueId = record.id || record.record_id || Math.random();

                    return (
                      <Link
                        href={`/dashboard/records/${uniqueId}`}
                        key={uniqueId}
                        className="block"
                      >
                        <HistoryRow
                          title={record.main_title || record.diagnosis || "Evaluare Medicală"}
                          sub={subtitle}
                          status={status}
                          date={formattedDate}
                          color={color}
                        />
                      </Link>
                    );
                  })
                ) : (
                  <div className="text-center p-4 text-[11px] text-slate-400 italic bg-slate-50 rounded-xl border border-slate-100">
                    Nu există consultații recente.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dreapta (Profil + Minori) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm font-bold text-slate-800">Profilul tău</h4>
                <Link
                  href="/dashboard/profile/"
                  className="text-[11px] font-bold text-[#108A75] hover:underline transition-all"
                >
                  vezi profil →
                </Link>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-[#108A75] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm">
                  {data?.first_name?.[0] || ""}
                  {data?.last_name?.[0] || ""}
                </div>
                <div>
                  <h5 className="font-bold text-slate-800 text-base leading-tight">
                    {data.last_name} {data.first_name}
                  </h5>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                    #PAC-{data?.id?.slice(0, 6) || "..."}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm font-bold text-slate-800">Pacienți minori</h4>
                <Link
                  href="/dashboard/minors"
                  className="text-[11px] font-bold text-[#108A75] hover:underline"
                >
                  administrează →
                </Link>
              </div>

              {minors && minors.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {minors.map((minor: any) => (
                    <div
                      key={minor.id}
                      className="bg-slate-50 p-4 rounded-xl flex items-center justify-between border border-slate-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm uppercase">
                          {minor.first_name?.[0]}
                          {minor.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {minor.first_name} {minor.last_name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {minor.age} ani &middot;{" "}
                            {minor.relationship ? minor.relationship.toLowerCase() : "N/A"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-orange-600 border border-orange-100 px-2 py-0.5 rounded-md uppercase bg-white">
                        Minor
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 mb-6 text-[11px] text-slate-400 italic bg-slate-50 rounded-xl border border-slate-100">
                  Nu ai niciun pacient minor înregistrat.
                </div>
              )}

              <div className="bg-[#ECFDF5] text-[#047857] p-3 rounded-lg text-[10px] font-bold border border-[#D1FAE5] text-center">
                Ești tutore legal înregistrat în sistem.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- POP-UP PENTRU ABONAMENT --- */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="font-bold text-lg text-slate-800">Cumpără Abonament</h2>
              <button 
                onClick={() => setShowSubModal(false)}
                className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Tip Abonament</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setSubPlan("Individual")}
                    className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${subPlan === "Individual" ? "border-teal-600 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                  >
                    Individual
                  </button>
                  <button 
                    onClick={() => setSubPlan("Family")}
                    className={`p-3 rounded-xl border-2 text-sm font-bold transition-all flex flex-col items-center justify-center ${subPlan === "Family" ? "border-teal-600 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                  >
                    Family
                    <span className="text-[9px] font-normal opacity-70 mt-0.5">Pt. tine & minori</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Perioadă Facturare</label>
                <select 
                  value={subCycle} 
                  onChange={(e) => setSubCycle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-teal-500"
                >
                  <option value="Lunar">Lunar (Plată lună de lună)</option>
                  <option value="Anual">Anual (Economisești 15%)</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowSubModal(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Anulează
              </button>
              <button 
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors disabled:opacity-50"
              >
                {isPurchasing ? "Se procesează..." : "Confirmă Plata"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- SUB-COMPONENTE ---

function StatCard({ icon, label, val, sub, valColor = "text-[#108A75]" }: any) {
  return (
    <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:border-[#108A75]/30 transition-all">
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
        <span className="opacity-50 text-base">{icon}</span> {label}
      </p>
      <p className={`text-2xl font-bold ${valColor}`}>{val}</p>
      <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-tighter uppercase">{sub}</p>
    </div>
  );
}

function ActionCard({ icon, title, desc, link }: any) {
  return (
    <Link
      href={link}
      className="bg-white border border-slate-200 p-7 rounded-2xl shadow-sm hover:border-[#108A75]/40 hover:shadow-md transition-all group h-48 flex flex-col justify-between"
    >
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:bg-[#108A75]/10 transition-colors">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-800 leading-tight">{title}</h4>
        <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">{desc}</p>
        <div className="mt-4 text-[10px] font-bold text-[#108A75] uppercase tracking-widest opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
          deschide →
        </div>
      </div>
    </Link>
  );
}

function HistoryRow({ title, sub, status, date, color }: any) {
  return (
    <div className="flex justify-between items-center group cursor-pointer hover:bg-slate-50/50 p-1 rounded-lg transition-all">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${color} shadow-sm group-hover:scale-125 transition-transform`} />
        <div>
          <p className="text-xs font-bold text-slate-800">{title}</p>
          <p className="text-[10px] text-slate-400 font-bold italic">{sub}</p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-[9px] font-bold text-slate-400 border border-slate-100 px-2 py-0.5 rounded uppercase group-hover:border-slate-200 transition-colors">
          {status}
        </span>
        <p className="text-[10px] text-slate-400 font-bold mt-1">{date}</p>
      </div>
    </div>
  );
}

function Badge({ text, color }: any) {
  return (
    <span className={`${color} px-2 py-1 rounded-md text-[9px] font-bold border border-current/10 shadow-sm`}>
      {text}
    </span>
  );
}