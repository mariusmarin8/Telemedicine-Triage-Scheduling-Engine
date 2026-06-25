"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SPECIALTIES = [
  "Medicină Generală", "Cardiologie", "Gastroenterologie", "Neurologie",
  "Pneumologie", "ORL", "Urologie", "Ortopedie", "Oftalmologie",
  "Dermatologie", "Alergologie", "Psihiatrie", "Ginecologie", "Pediatrie"
];

export default function DoctorRegisterPage() {
  const router = useRouter();
  
  // Starea pentru datele formularului de medic
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "", // mapat exact cu câmpul din structura Rust `RegisterDoctorRequest`
    license_number: "",
    specialty: "Medicină Generală",
  });

  // Stări pentru UI (identice cu cele de la pacienți)
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError(false);

    try {
      // URL-ul configurat în Rust pentru înregistrare medici
      const res = await fetch("http://127.0.0.1:8085/api/auth/doctor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        // Prindem mesajele specifice din PL/pgSQL (ex: "Acest cod de parafă există deja în sistem.")
        throw new Error(data.message || "Eroare la înregistrarea medicului.");
      }

      setMessage("Cont de medic creat cu succes! Te redirecționăm către Login...");
      setError(false);
      
      // Redirecționare sincronizată la 2 secunde
      setTimeout(() => router.push("/doctor/login"), 2000);

    } catch (err: any) {
      setError(true);
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-10 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Înregistrare Medic
        </h2>
        
        {/* Mesaje de Feedback */}
        {message && (
          <div className={`p-3 rounded-md mb-4 text-sm font-medium text-center ${
            error ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
          }`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4 text-black">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nume</label>
              <input 
                type="text" 
                name="last_name" 
                required 
                onChange={handleChange} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Prenume</label>
              <input 
                type="text" 
                name="first_name" 
                required 
                onChange={handleChange} 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cod Parafă (Licență)</label>
            <input 
              type="text" 
              name="license_number" 
              required 
              onChange={handleChange} 
              placeholder="Ex: PAR12345"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Profesional</label>
            <input 
              type="email" 
              name="email" 
              required 
              onChange={handleChange} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Parolă</label>
            <input 
              type="password" 
              name="password" 
              required 
              onChange={handleChange} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Telefon Contact</label>
            <input 
              type="tel" 
              name="phone" 
              required
              onChange={handleChange} 
              placeholder="Ex: 0722..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Specialitate Medicală</label>
            <select 
              name="specialty" 
              value={formData.specialty}
              onChange={handleChange} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white font-medium"
            >
              {SPECIALTIES.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-2 rounded-md text-white font-semibold transition mt-4 ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isLoading ? "Se procesează..." : "Creează Cont Medic"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Sunteți deja înregistrat?{" "}
          <Link href="/doctor/login" className="text-green-600 hover:text-green-800 hover:underline font-medium transition">
            Loghează-te în Portalul Medical
          </Link>
        </div>
      </div>
    </div>
  );
}