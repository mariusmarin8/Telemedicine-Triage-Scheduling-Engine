"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Question {
  id: string;
  text: string;
  type: 'single_choice' | 'boolean' | 'text';
  options?: string[];
}

interface TriageFormResponse {
  is_emergency: boolean | null;
  emergency_message: string | null;
  template_slug: string | null;
  form_structure: {
    title: string;
    description: string;
    questions: Question[];
  } | null;
}

interface TriageDecisionResponse {
  primary_diagnosis: string;
  complexity_level: number;
  requires_doctor: boolean;
  recommended_treatments: any | null;
  message: string;
  diagnosis_category?: string;
  record_id?: string;
}

interface Symptom {
  id: string;
  name: string;
}

// Culori concrete — fără dependență de Tailwind sau variabile externe
const C = {
  pageBg:       '#F5F5F4',
  cardBg:       '#FFFFFF',
  surfaceBg:    '#F5F5F4',
  border:       '#E5E5E4',
  borderMed:    '#D4D4D3',
  textPrimary:  '#1A1A1A',
  textSecond:   '#737373',
  textMuted:    '#A3A3A2',
  teal:         '#0D9488',
  tealDark:     '#0B7A6E',
  tealLight:    '#F0FDFA',
  tealBorder:   '#CCFBF1',
  tealText:     '#0F766E',
  amber:        '#B45309',
  amberLight:   '#FFFBEB',
  amberBorder:  '#FDE68A',
  blue:         '#2563EB',
  blueDark:     '#1D4ED8',
  blueLight:    '#EFF6FF',
  red:          '#DC2626',
  redDark:      '#B91C1C',
  redLight:     '#FEF2F2',
  redBorder:    '#FECACA',
  dark:         '#111111',
  darkHover:    '#222222',
  gray100:      '#F3F4F6',
  gray200:      '#E5E7EB',
  font:         '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.08em',
  color: C.textMuted,
  margin: '0 0 10px',
  textTransform: 'uppercase',
  display: 'block',
};

function TriageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPatientId = searchParams.get('patient_id');

  const [step, setStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSymptoms, setIsLoadingSymptoms] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [symptomsList, setSymptomsList] = useState<Symptom[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [formResponse, setFormResponse] = useState<TriageFormResponse | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [decision, setDecision] = useState<TriageDecisionResponse | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085';

  const getPatientId = () => {
    if (urlPatientId && urlPatientId !== '') return urlPatientId;

    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('patient_id');
      if (storedId) return storedId;

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            window.atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join('')
          );

          const decodedToken = JSON.parse(jsonPayload);

          if (decodedToken.patient_id) return decodedToken.patient_id;
          if (decodedToken.user_id) return decodedToken.user_id;
          if (decodedToken.sub) return decodedToken.sub;

        } catch (error) {
          console.error("Eroare la decodarea token-ului JWT:", error);
        }
      }
    }

    return '99999999-9999-9999-9999-999999999999';
  };

  useEffect(() => {
    const fetchSymptoms = async () => {
      setIsLoadingSymptoms(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const response = await fetch(`${API_URL}/api/triage/symptoms`, {
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (!response.ok) throw new Error(`Eroare HTTP: ${response.status}`);
        setSymptomsList(await response.json());
      } catch (err: any) {
        setErrorMsg('Sistemul nu a putut încărca lista de simptome. Verificați conexiunea la server.');
      } finally {
        setIsLoadingSymptoms(false);
      }
    };
    fetchSymptoms();
  }, [API_URL]);

  const filteredSymptoms = useMemo(() =>
    symptomsList.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery, symptomsList]
  );

  const toggleSymptom = (symptom: Symptom) => {
    const isSelected = !!selectedSymptoms.find(s => s.id === symptom.id);
    if (isSelected) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== symptom.id));
    } else if (selectedSymptoms.length < 3) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleGenerateForm = async () => {
    if (selectedSymptoms.length === 0) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_URL}/api/triage/patient/${getPatientId()}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ symptom_ids: selectedSymptoms.map(s => s.id) }),
      });
      if (!response.ok) throw new Error(await response.text() || 'Eroare la generarea formularului.');
      const data: TriageFormResponse = await response.json();
      setFormResponse(data);
      setAnswers({});
      if (data.is_emergency) setStep(4);
      else if (data.form_structure) setStep(2);
      else setErrorMsg('Nu s-a putut identifica un protocol medical pentru aceste simptome.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Eroare de comunicare cu serverul.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitForm = async () => {
    const questions = formResponse?.form_structure?.questions ?? [];
    const unanswered = questions.filter(q => !answers[q.id] || answers[q.id].trim() === '');
    if (unanswered.length > 0) {
      setErrorMsg(`Vă rugăm să răspundeți la toate întrebările (${unanswered.length} rămase).`);
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${API_URL}/api/triage/patient/${getPatientId()}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ template_slug: formResponse?.template_slug, answers }),
      });
      if (!response.ok) throw new Error('Evaluarea a eșuat pe server.');
      setDecision(await response.json());
      setStep(3);
    } catch (err: any) {
      setErrorMsg('Nu s-a putut finaliza evaluarea. Reîncercați.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: C.pageBg, padding: '32px 16px', fontFamily: C.font }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: C.textPrimary, margin: '0 0 6px', letterSpacing: '-0.3px' }}>
            Consultație nouă
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: urlPatientId ? C.blue : C.teal }} />
            <p style={{ fontSize: '13px', color: C.textSecond, margin: 0 }}>
              {urlPatientId ? 'Evaluare profil minor' : 'Evaluare profil titular cont'}
            </p>
          </div>
        </div>

        {/* Eroare */}
        {errorMsg && (
          <div style={{ marginBottom: '20px', padding: '12px 16px', background: C.redLight, border: `1px solid ${C.redBorder}`, borderRadius: '10px', fontSize: '13px', color: C.red, fontWeight: 500 }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* PAS 1: SELECȚIE SIMPTOME */}
        {step === 1 && (
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '28px' }}>
            
            <div style={{ marginBottom: '20px' }}>
              <span style={labelStyle}>Ce simptome resimțiți?</span>
              <input
                type="text"
                placeholder="Ex: Febră, Tuse, Dureri de cap..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: C.surfaceBg,
                  border: `1px solid ${C.border}`,
                  borderRadius: '10px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: C.textPrimary,
                  outline: 'none',
                  fontFamily: C.font,
                }}
                onFocus={e => e.currentTarget.style.borderColor = C.teal}
                onBlur={e => e.currentTarget.style.borderColor = C.border}
              />
            </div>

            {/* Simptome selectate */}
            {selectedSymptoms.length > 0 && (
              <div style={{ marginBottom: '20px', padding: '14px 16px', background: C.tealLight, border: `1px solid ${C.tealBorder}`, borderRadius: '10px' }}>
                <p style={{ fontSize: '11px', fontWeight: 600, color: C.tealText, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Simptome selectate ({selectedSymptoms.length}/3)
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedSymptoms.map(s => (
                    <button
                      key={s.id}
                      onClick={() => toggleSymptom(s)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: C.teal, color: '#fff',
                        border: 'none', borderRadius: '8px',
                        padding: '7px 12px', fontSize: '13px', fontWeight: 500,
                        cursor: 'pointer', fontFamily: C.font,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = C.red}
                      onMouseLeave={e => e.currentTarget.style.background = C.teal}
                    >
                      {s.name} <span style={{ fontSize: '11px' }}>✕</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Listă simptome */}
            <div style={{ marginBottom: '24px' }}>
              {isLoadingSymptoms ? (
                <p style={{ fontSize: '13px', color: C.textMuted, textAlign: 'center', padding: '20px 0' }}>Se încarcă simptomele...</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                  {filteredSymptoms.map(s => {
                    const isSelected = !!selectedSymptoms.find(sel => sel.id === s.id);
                    const isDisabled = !isSelected && selectedSymptoms.length >= 3;
                    return (
                      <button
                        key={s.id}
                        disabled={isDisabled}
                        onClick={() => toggleSymptom(s)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 500,
                          border: `1px solid ${isSelected ? C.teal : C.border}`,
                          background: isSelected ? C.teal : C.cardBg,
                          color: isSelected ? '#fff' : C.textPrimary,
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          opacity: isDisabled ? 0.4 : 1,
                          transition: 'all 0.15s',
                          fontFamily: C.font,
                        }}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleGenerateForm}
                disabled={selectedSymptoms.length === 0 || isLoading}
                style={{
                  padding: '13px 28px',
                  background: selectedSymptoms.length === 0 || isLoading ? C.borderMed : C.teal,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: selectedSymptoms.length === 0 || isLoading ? 'not-allowed' : 'pointer',
                  fontFamily: C.font,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (selectedSymptoms.length > 0 && !isLoading) e.currentTarget.style.background = C.tealDark; }}
                onMouseLeave={e => { if (selectedSymptoms.length > 0 && !isLoading) e.currentTarget.style.background = C.teal; }}
              >
                {isLoading ? 'Se procesează...' : 'Continuă evaluarea →'}
              </button>
            </div>
          </div>
        )}

        {/* PAS 2: FORMULAR DINAMIC */}
        {step === 2 && formResponse?.form_structure && (
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '28px' }}>
            <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: `1px solid ${C.border}` }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: C.textPrimary, margin: '0 0 6px' }}>
                {formResponse.form_structure.title}
              </h2>
              <p style={{ fontSize: '14px', color: C.textSecond, margin: 0, lineHeight: 1.6 }}>
                {formResponse.form_structure.description}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {formResponse.form_structure.questions.map((q, idx) => (
                <div key={q.id}>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: C.textPrimary, display: 'block', marginBottom: '12px' }}>
                    {idx + 1}. {q.text}
                  </label>

                  {q.type === 'single_choice' && q.options && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {q.options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleAnswerChange(q.id, opt)}
                          style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            border: `1px solid ${answers[q.id] === opt ? C.teal : C.border}`,
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: 500,
                            background: answers[q.id] === opt ? C.teal : C.cardBg,
                            color: answers[q.id] === opt ? '#fff' : C.textPrimary,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            fontFamily: C.font,
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === 'boolean' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['Da', 'Nu'].map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleAnswerChange(q.id, opt)}
                          style={{
                            flex: 1,
                            padding: '12px',
                            border: `1px solid ${answers[q.id] === opt ? C.teal : C.border}`,
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: 600,
                            background: answers[q.id] === opt ? C.teal : C.cardBg,
                            color: answers[q.id] === opt ? '#fff' : C.textPrimary,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            fontFamily: C.font,
                          }}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === 'text' && (
                    <textarea
                      rows={3}
                      placeholder="Scrie răspunsul aici..."
                      onChange={e => handleAnswerChange(q.id, e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: C.surfaceBg,
                        border: `1px solid ${C.border}`,
                        borderRadius: '10px',
                        padding: '12px 16px',
                        fontSize: '14px',
                        color: C.textPrimary,
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: C.font,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px', paddingTop: '20px', borderTop: `1px solid ${C.border}` }}>
              <button
                onClick={() => setStep(1)}
                style={{ fontSize: '14px', fontWeight: 500, color: C.textSecond, background: 'none', border: 'none', cursor: 'pointer', fontFamily: C.font, padding: '10px 0' }}
                onMouseEnter={e => e.currentTarget.style.color = C.textPrimary}
                onMouseLeave={e => e.currentTarget.style.color = C.textSecond}
              >
                ← Întoarce-te
              </button>
              <button
                onClick={handleSubmitForm}
                disabled={isLoading}
                style={{
                  padding: '13px 28px',
                  background: isLoading ? C.borderMed : C.dark,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: C.font,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = C.darkHover; }}
                onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background = C.dark; }}
              >
                {isLoading ? 'Se evaluează...' : 'Trimite răspunsurile'}
              </button>
            </div>
          </div>
        )}

        {/* PAS 3: REZULTAT FINAL */}
        {step === 3 && decision && (
          <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '36px 28px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: C.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px' }}>
              ✓
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 600, color: C.textPrimary, margin: '0 0 8px' }}>Evaluare finalizată</h2>
            <p style={{ fontSize: '14px', color: C.textSecond, margin: '0 0 24px', lineHeight: 1.6 }}>{decision.message}</p>

            {/* Mesaj alertă/informare: Programare Realizată */}
            {decision.requires_doctor && (
              <div style={{ background: C.blueLight, border: `1px solid ${C.blue}`, borderRadius: '12px', padding: '14px 18px', textAlign: 'left', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>📅</span>
                <p style={{ margin: 0, fontSize: '13px', color: C.blueDark, fontWeight: 600 }}>
                  Cazul necesită atenția unui medic. O programare în coada de așteptare a fost realizată automat în sistem.
                </p>
              </div>
            )}

            <div style={{ background: C.surfaceBg, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '20px', textAlign: 'left', marginBottom: '20px' }}>
              <span style={labelStyle}>Diagnostic prealabil</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '20px', fontWeight: 600, color: C.textPrimary, margin: '0' }}>{decision.primary_diagnosis}</p>
                {decision.diagnosis_category && (
                  <span style={{ padding: '6px 10px', background: C.gray100, color: C.textSecond, borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>
                    {decision.diagnosis_category}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                <span style={{ padding: '4px 10px', background: C.border, color: C.textSecond, borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                  Complexitate: {decision.complexity_level}/10
                </span>
                {decision.requires_doctor && (
                  <span style={{ padding: '4px 10px', background: C.amberLight, color: C.amber, border: `1px solid ${C.amberBorder}`, borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                    Consult medical necesar
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {decision.record_id && (
                <button
                  onClick={() => router.push(`/dashboard/records/${decision.record_id}`)}
                  style={{ width: '100%', padding: '14px', background: C.teal, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: C.font, transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.tealDark}
                  onMouseLeave={e => e.currentTarget.style.background = C.teal}
                >
                  📄 Vizualizează fișa medicală
                </button>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => router.push('/dashboard')}
                  style={{ flex: 1, padding: '13px', background: C.surfaceBg, color: C.textPrimary, border: `1px solid ${C.border}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: C.font, transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.gray200}
                  onMouseLeave={e => e.currentTarget.style.background = C.surfaceBg}
                >
                  Înapoi la dashboard
                </button>

                {!decision.requires_doctor && (
                  <button
                    onClick={() => router.push('/dashboard/prescriptions')}
                    style={{ flex: 1, padding: '13px', background: C.dark, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: C.font, transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = C.darkHover}
                    onMouseLeave={e => e.currentTarget.style.background = C.dark}
                  >
                    Vezi tratamente
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PAS 4: URGENȚĂ CRITICĂ */}
        {step === 4 && (
          <div style={{ background: C.redLight, border: `2px solid ${C.redBorder}`, borderRadius: '14px', padding: '40px 28px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '24px', fontWeight: 700, color: C.red }}>
              !
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: C.red, margin: '0 0 12px', letterSpacing: '-0.2px' }}>Urgență medicală</h2>
            <p style={{ fontSize: '15px', color: C.redDark, margin: '0 0 32px', lineHeight: 1.7, maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
              {formResponse?.emergency_message || 'Sistemul a detectat simptome severe. Vă rugăm să apelați imediat numărul de urgență 112.'}
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              style={{ padding: '14px 40px', background: C.red, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: C.font, transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = C.redDark}
              onMouseLeave={e => e.currentTarget.style.background = C.red}
            >
              Am înțeles
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function TriagePage() {
  return (
    <Suspense fallback = {
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F5F5F4', fontFamily: '-apple-system, sans-serif' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #0D9488', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '16px' }} />
        <p style={{ fontSize: '12px', color: '#A3A3A2', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Încărcare...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <TriageContent />
    </Suspense>
  );
}