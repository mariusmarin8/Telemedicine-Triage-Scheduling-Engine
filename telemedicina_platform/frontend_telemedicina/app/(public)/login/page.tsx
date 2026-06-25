"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; 

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:8085/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) 
        throw new Error("Email sau parolă incorecte");

      const data = await res.json();
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      
      router.push("/dashboard");
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Autentificare</h2>
        
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        
        <form onSubmit={handleLogin} className="space-y-4 text-black">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Parolă</label>
            <input type="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
            Login
          </button>
        </form>

      
        <div className="mt-6 text-center text-sm text-gray-600">
          Nu ai cont?{" "}
          <Link href="/register" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition">
            Înregistrează-te aici
          </Link>
        </div>

      </div>
    </div>
  );
}