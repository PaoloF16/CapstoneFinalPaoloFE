// src/pages/KitchenDisplayPage.tsx
import React, { useState, useEffect, useRef } from "react"
import {
  getKitchenOrders,
  updateOrderStatus,
} from "../services/restaurantService"
import type { Order, OrderStatus } from "../types/restaurant"
import { useRestaurant } from "../context/RestaurantContext"

// Generador de pitido sonoro para nuevas comandas en cocina
const playKitchenAlertSound = () => {
  try {
    const ctx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(880, ctx.currentTime) // Nota A5
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3)

    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.35)
  } catch (e) {
    console.log("Audio no interactuado aún")
  }
}

export const KitchenDisplayPage: React.FC = () => {
  const { settings } = useRestaurant()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)
  const [filterStatus, setFilterStatus] = useState<
    "ALL" | "PENDING" | "IN_PREPARATION"
  >("ALL")

  const previousOrdersCount = useRef<number>(0)

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Polling a la API cada 5 segundos
  const fetchOrders = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true)
      const data = await getKitchenOrders()
      const kitchenList = Array.isArray(data) ? data : []

      // Sonido de alerta si hay comandas nuevas
      if (
        !isInitial &&
        soundEnabled &&
        kitchenList.length > previousOrdersCount.current
      ) {
        playKitchenAlertSound()
      }

      previousOrdersCount.current = kitchenList.length
      setOrders(kitchenList)
    } catch (error) {
      console.error("Error en polling de cocina:", error)
    } finally {
      if (isInitial) setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(true)
    const interval = setInterval(() => {
      fetchOrders(false)
    }, 5000) // Polling cada 5000ms

    return () => clearInterval(interval)
  }, [soundEnabled])

  // Cambiar estado
  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus,
  ) => {
    // 1. Quitar de la vista de inmediato para evitar clics repetidos
    if (newStatus === "READY" || newStatus === "DELIVERED") {
      setOrders((prev) => prev.filter((o) => o.id !== orderId))
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      )
    }

    // 2. Persistir en la base de datos
    try {
      await updateOrderStatus(orderId, newStatus)
    } catch (err) {
      console.error("Error al actualizar comanda en cocina:", err)
    }
  }

  // Calcular minutos transcurridos
  const getElapsedMinutes = (dateString?: string) => {
    if (!dateString) return 0
    const diffMs = currentTime.getTime() - new Date(dateString).getTime()
    return Math.max(0, Math.floor(diffMs / 60000))
  }

  // Filtrado de tarjetas
  const filteredOrders = orders.filter((o) => {
    if (filterStatus === "ALL") return true
    return o.status === filterStatus
  })

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] text-gray-100 flex flex-col font-sans select-none overflow-hidden">
      {/* --- HEADER KDS --- */}
      <header className="bg-[#161920] border-b border-gray-800 px-6 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-pulse shadow-md shadow-emerald-500/50" />
            <h1 className="text-xl font-black tracking-wider text-white flex items-center gap-2">
              <span>👨‍🍳 KDS</span>
              <span className="text-red-500 text-xs font-black uppercase bg-red-950/60 px-2 py-0.5 rounded border border-red-800/50">
                {settings.name}
              </span>
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-[#0d0f12] p-1 rounded-xl border border-gray-800 text-xs">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterStatus === "ALL"
                  ? "bg-red-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Todos ({orders.length})
            </button>
            <button
              onClick={() => setFilterStatus("PENDING")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterStatus === "PENDING"
                  ? "bg-amber-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Pendientes ({orders.filter((o) => o.status === "PENDING").length})
            </button>
            <button
              onClick={() => setFilterStatus("IN_PREPARATION")}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterStatus === "IN_PREPARATION"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              En Marcha (
              {orders.filter((o) => o.status === "IN_PREPARATION").length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 ${
              soundEnabled
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400"
                : "bg-gray-800 border-gray-700 text-gray-500"
            }`}
          >
            <span>{soundEnabled ? "🔔 Alarma ON" : "🔕 Silencio"}</span>
          </button>

          <button
            onClick={toggleFullScreen}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold border border-gray-700"
            title="Pantalla Completa"
          >
            ⛶
          </button>

          <div className="text-right pl-3 border-l border-gray-800">
            <span className="text-xs text-gray-400 font-mono block">
              Hora Salón
            </span>
            <span className="text-lg font-black text-white font-mono leading-none">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </header>

      {/* --- CONTENEDOR DE TARJETAS / TICKETS --- */}
      <main className="flex-1 p-6 overflow-x-auto overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center text-gray-500 font-bold text-lg">
            Conectando con comandas de cocina...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center text-3xl mb-4">
              🍳
            </div>
            <h2 className="text-xl font-bold text-gray-300">¡Cocina al día!</h2>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              No hay comandas pendientes en este momento. Las nuevas órdenes
              ingresarán automáticamente.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 items-start">
            {filteredOrders.map((order) => {
              const elapsed = getElapsedMinutes(order.createdAt)
              const isUrgent = elapsed >= 20
              const isWarning = elapsed >= 10 && elapsed < 20
              const isPending = order.status === "PENDING"

              return (
                <div
                  key={order.id}
                  className={`bg-[#181b22] border-2 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all ${
                    isUrgent
                      ? "border-red-600 shadow-red-950/50"
                      : isWarning
                        ? "border-amber-500 shadow-amber-950/30"
                        : "border-gray-800 hover:border-gray-700"
                  }`}
                >
                  {/* Header de la Tarjeta */}
                  <div
                    className={`p-4 flex justify-between items-center ${
                      isUrgent
                        ? "bg-red-950/80 border-b border-red-800/60"
                        : isWarning
                          ? "bg-amber-950/60 border-b border-amber-800/60"
                          : "bg-[#1e222b] border-b border-gray-800"
                    }`}
                  >
                    <div>
                      <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">
                        Mesa Asignada
                      </span>
                      <h3 className="text-2xl font-black text-white">
                        #{order.table?.tableNumber || "?"}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-mono font-black px-2.5 py-1 rounded-lg inline-block ${
                          isUrgent
                            ? "bg-red-600 text-white animate-pulse"
                            : isWarning
                              ? "bg-amber-500 text-black"
                              : "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        ⏱️ {elapsed} min
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-1 uppercase font-bold">
                        {isPending ? "🔴 Pendiente" : "🔵 En Marcha"}
                      </span>
                    </div>
                  </div>

                  {/* Lista de Platos a Preparar */}
                  <div className="p-4 space-y-3 divide-y divide-gray-800/80 max-h-80 overflow-y-auto">
                    {order.items?.map((item) => (
                      <div
                        key={item.id || item.product?.id}
                        className="pt-2 first:pt-0 flex items-start gap-3"
                      >
                        <span className="bg-red-600 text-white font-black text-base px-2 py-0.5 rounded-lg shrink-0 mt-0.5">
                          {item.quantity}x
                        </span>
                        <div className="flex-1">
                          <p className="text-base font-bold text-gray-100 leading-tight">
                            {item.product?.name}
                          </p>
                          {item.product?.isGlutenFree && (
                            <span className="text-[10px] bg-amber-950 text-amber-300 font-extrabold px-1.5 py-0.2 rounded mt-1 inline-block">
                              ⚠️ SIN GLUTEN
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Botones de Acción Gigantes para Cocineros */}
                  <div className="p-3 bg-[#13151b] border-t border-gray-800 flex flex-col gap-2">
                    {isPending ? (
                      <button
                        onClick={() =>
                          handleStatusChange(order.id, "IN_PREPARATION")
                        }
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black text-sm rounded-xl uppercase tracking-wider transition-transform active:scale-95 cursor-pointer shadow-lg shadow-blue-600/30"
                      >
                        👨‍🍳 Empezar a Cocinar
                      </button>
                    ) : null}

                    <button
                      onClick={() => handleStatusChange(order.id, "READY")}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-base rounded-xl uppercase tracking-wider transition-transform active:scale-95 cursor-pointer shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                    >
                      <span>✓</span>
                      <span>MARCAR COMO LISTO</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
