// src/pages/LoginPage.tsx
import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useRestaurant } from "../context/RestaurantContext"
import axios from "axios"

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { settings } = useRestaurant()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email,
          password,
        },
      )

      const data = response.data
      const token = data.token || data.accessToken
      const rawRole =
        data.role?.name ||
        data.role ||
        (data.roles && data.roles[0]) ||
        "SUPER_ADMIN"

      // Construir perfil del usuario recibido del backend
      const userData = {
        id: String(data.id || data.userId || "1"),
        name: data.name || data.username || email.split("@")[0],
        email: data.email || email,
        role: String(rawRole).toUpperCase(),
        permissions: data.permissions || [],
      }

      login(token, userData)
      navigate("/tables")
    } catch (err: any) {
      console.error("Error al iniciar sesión:", err)
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Credenciales inválidas o servidor no disponible.",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0b0e] via-[#111319] to-[#251307] flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Destellos ambientales de luz naranja */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-120px] right-[-80px] w-[500px] h-[400px] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Tarjeta Blanca */}
      <div className="bg-white text-gray-900 border border-gray-200/90 p-8 sm:p-10 rounded-3xl max-w-md w-full shadow-2xl space-y-6 relative z-10">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/25 border border-orange-400/30">
            {settings.logoInitial}
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{settings.name}</h2>
          <p className="text-xs text-gray-500 font-medium">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-center animate-in fade-in">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wider">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@restaurante.com"
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1 tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50 active:scale-98 mt-2"
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100 text-xs text-gray-500 font-medium">
          ¿No tienes una cuenta?{" "}
          <Link
            to="/register"
            className="text-orange-600 font-bold hover:underline"
          >
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage;