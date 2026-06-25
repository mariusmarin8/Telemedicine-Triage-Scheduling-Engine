"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface MedicalRecord {
  id: string;
  patient_name: string | null;
  patient_cnp: string | null;
  age: number | null;
  gender: string | null;
  consultation_date: string | null;
  symptoms_list: string | null;
  answers: Record<string, string> | null;
  diagnosis: string | null;
  diagnosis_category?: string | null;
  complexity: number | null;
  doctor_needed: boolean | null;
  recommendations: any | null;
}

const C = {
  pageBg:      '#F5F5F4',
  cardBg:      '#FFFFFF',
  surfaceBg:   '#F5F5F4',
  border:      '#E5E5E4',
  borderMed:   '#D4D4D3',
  textPrimary: '#1A1A1A',
  textSecond:  '#737373',
  textMuted:   '#A3A3A2',
  amber:       '#B45309',
  amberLight:  '#FFFBEB',
  amberBorder: '#FDE68A',
  red:         '#DC2626',
  font:        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 500,
  letterSpacing: '0.08em',
  color: C.textMuted,
  margin: '0 0 10px',
  textTransform: 'uppercase',
};

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: C.surfaceBg, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '12px 14px' }}>
      <p style={{ fontSize: '11px', color: C.textMuted, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: '14px', fontWeight: 600, color: C.textPrimary, margin: 0 }}>{value}</p>
    </div>
  );
}

function MedicalRecordContent() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [error, setError] = useState('');
  const [btnHover, setBtnHover] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085';

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/triage/record/${id}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (!res.ok) throw new Error('Fișa medicală nu a fost găsită.');
        const data = await res.json();
        setRecord(data);
      } catch (err: any) {
        setError(err.message);
      }
    };
    if (id) fetchRecord();
  }, [id, API_URL]);

  const renderTreatments = (recs: any) => {
    if (!recs) return (
      <p style={{ color: C.textSecond, fontSize: '14px', fontStyle: 'italic', margin: 0 }}>
        Nu există prescripții înregistrate.
      </p>
    );

    let parsed = recs;
    if (typeof recs === 'string') {
      try { parsed = JSON.parse(recs); } catch { parsed = [recs]; }
    }

    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {parsed.map((item: any, idx: number) => (
            <div key={idx} style={{ background: C.surfaceBg, border: `1px solid ${C.border}`, borderRadius: '10px', padding: '14px 16px' }}>
              <p style={{ fontWeight: 600, fontSize: '14px', margin: '0 0 6px', color: C.textPrimary }}>
                {item.name || item.nume || 'Medicament'}
              </p>
              {Object.entries(item).map(([k, v]) => {
                if (k === 'name' || k === 'nume') return null;
                return (
                  <p key={k} style={{ fontSize: '13px', color: C.textSecond, margin: '2px 0' }}>
                    <span style={{ textTransform: 'capitalize' }}>{k}:</span> {String(v)}
                  </p>
                );
              })}
            </div>
          ))}
        </div>
      );
    }

    if (Array.isArray(parsed)) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {parsed.map((item: string, idx: number) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: C.surfaceBg, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '10px 14px' }}>
              <span style={{ fontSize: '16px' }}>💊</span>
              <span style={{ fontSize: '14px', color: C.textPrimary }}>{item}</span>
            </div>
          ))}
        </div>
      );
    }

    return <p style={{ fontSize: '14px', color: C.textPrimary, margin: 0 }}>{String(parsed)}</p>;
  };

  if (error) return (
    <div style={{ minHeight: '100vh', background: C.pageBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.font }}>
      <p style={{ color: C.red, fontSize: '15px' }}>{error}</p>
    </div>
  );

  if (!record) return (
    <div style={{ minHeight: '100vh', background: C.pageBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: C.font }}>
      <p style={{ color: C.textSecond, fontSize: '14px' }}>Se încarcă datele...</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.pageBg, padding: '48px 16px', fontFamily: C.font }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* Header */}
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={labelStyle}>Sistem de triaj</p>
            <h1 style={{ fontSize: '24px', fontWeight: 600, color: C.textPrimary, margin: 0, letterSpacing: '-0.3px' }}>
              Raport de evaluare
            </h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'inline-block', background: C.surfaceBg, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '4px 10px', fontSize: '12px', color: C.textSecond, marginBottom: '4px', fontFamily: 'monospace' }}>
              #{record.id.slice(0, 8).toUpperCase()}
            </div>
            <p style={{ fontSize: '13px', color: C.textMuted, margin: 0 }}>
              {new Date().toLocaleDateString('ro-RO')}
            </p>
          </div>
        </div>

        {/* Profil pacient */}
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '24px 28px' }}>
          <p style={labelStyle}>Profil pacient</p>
          <p style={{ fontSize: '22px', fontWeight: 600, color: C.textPrimary, margin: '0 0 16px', letterSpacing: '-0.3px' }}>
            {record.patient_name || 'Nespecificat'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <MetricCard label="CNP" value={record.patient_cnp || '—'} />
            <MetricCard label="Vârstă" value={record.age ? `${record.age} ani` : '—'} />
            <MetricCard label="Sex" value={record.gender || '—'} />
          </div>
        </div>

        {/* Simptome & Răspunsuri */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '24px 28px' }}>
            <p style={labelStyle}>Acuze principale</p>
            <p style={{ fontSize: '14px', color: C.textPrimary, lineHeight: 1.7, margin: 0 }}>
              {record.symptoms_list || 'Nespecificat'}
            </p>
          </div>

          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '24px 28px' }}>
            <p style={labelStyle}>Răspunsuri formular</p>
            {record.answers ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {Object.entries(record.answers).map(([q, a]) => (
                  <div key={q} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', padding: '7px 0', borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '13px', color: C.textSecond, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: C.textPrimary, flexShrink: 0 }}>{a}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: C.textMuted, margin: 0 }}>Niciun răspuns.</p>
            )}
          </div>
        </div>

        {/* Diagnostic & Tratament */}
        <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '24px 28px' }}>
          <p style={labelStyle}>Diagnostic identificat</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 20px' }}>
            <p style={{ fontSize: '22px', fontWeight: 600, color: C.textPrimary, margin: 0, letterSpacing: '-0.3px' }}>
              {record.diagnosis || 'Fără diagnostic precis'}
            </p>
            {record.diagnosis_category && (
              <span style={{ padding: '6px 10px', background: C.surfaceBg, color: C.textSecond, borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                {record.diagnosis_category}
              </span>
            )}
          </div>

          {record.doctor_needed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: C.amberLight, border: `1px solid ${C.amberBorder}`, borderRadius: '8px', padding: '10px 14px', marginBottom: '20px' }}>
              <span style={{ fontSize: '14px' }}>⚠️</span>
              <span style={{ fontSize: '13px', color: C.amber, fontWeight: 600 }}>Consult de specialitate necesar</span>
            </div>
          )}

          <p style={labelStyle}>{record.doctor_needed ? 'Recomandări' : 'Plan de tratament'}</p>
          {renderTreatments(record.recommendations)}
        </div>

        {/* Buton */}
        <div style={{ paddingTop: '4px', paddingBottom: '48px' }}>
          <button
            onClick={() => router.push('/dashboard')}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            style={{
              width: '100%',
              padding: '14px',
              background: btnHover ? C.surfaceBg : C.cardBg,
              border: `1px solid ${btnHover ? C.borderMed : C.border}`,
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 500,
              color: C.textPrimary,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: C.font,
            }}
          >
            ← Înapoi la dashboard
          </button>
        </div>

      </div>
    </div>
  );
}

export default function MedicalRecordPage() {
  return (
    <Suspense>
      <MedicalRecordContent />
    </Suspense>
  );
}