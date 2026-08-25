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
    <div className="min-h-screen bg-[#0d0f12] flex items-center justify-center p-4">
      <div className="bg-[#181b22] border border-gray-800 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-red-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-red-600/30">
            {settings.logoInitial}
          </div>
          <h2 className="text-2xl font-black text-white">{settings.name}</h2>
          <p className="text-xs text-gray-400">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800 text-red-400 text-xs font-bold rounded-xl text-center">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@restaurante.com"
              className="w-full bg-[#101216] border border-gray-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#101216] border border-gray-700 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-800 text-xs text-gray-400">
          ¿No tienes una cuenta?{" "}
          <Link
            to="/register"
            className="text-red-400 font-bold hover:underline"
          >
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
