"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DoctorLoginPage() {
  const router = useRouter();
  
  // Starea pentru credențialele de login ale medicului
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Stări pentru UI (identice cu cele de la pacienți)
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError(false);

    try {
      // URL-ul de login pentru medici configurat în Rust
      const res = await fetch("http://127.0.0.1:8085/api/auth/doctor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        // Prindem eroarea de credențiale (401 Unauthorized sau 500)
        throw new Error(data.message || "Email sau parolă incorectă.");
      }

      // SALVĂM DATELE DE SESIUNE ÎN BROWSER
      if (data.token) localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role); // Va fi "Doctor"
      localStorage.setItem("user_id", data.user_id);

      setMessage("Autentificare reușită! Se încarcă portalul medical...");
      setError(false);
      
      // Redirecționare rapidă către zona dedicată medicilor
      setTimeout(() => router.push("/doctor/dashboard"), 1500);

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
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">
          Portal Medical
        </h2>
        <p className="text-sm text-center text-gray-400 mb-6 font-medium">
          Autentificați-vă pentru a gestiona fișele de triaj
        </p>
        
        {/* Mesaje de Feedback */}
        {message && (
          <div className={`p-3 rounded-md mb-4 text-sm font-medium text-center ${
            error ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
          }`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4 text-black">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Profesional</label>
            <input 
              type="email" 
              name="email" 
              required 
              value={formData.email}
              onChange={handleChange} 
              placeholder="doctor@clinica.ro"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Parolă</label>
            <input 
              type="password" 
              name="password" 
              required 
              value={formData.password}
              onChange={handleChange} 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" 
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-2 rounded-md text-white font-semibold transition mt-6 ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isLoading ? "Se verifică datele..." : "Intră în cont"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Nu aveți încă un cont de medic?{" "}
          <Link href="/doctor/register" className="text-green-600 hover:text-green-800 hover:underline font-medium transition">
            Înregistrați-vă aici
          </Link>
        </div>
      </div>
    </div>
  );
}