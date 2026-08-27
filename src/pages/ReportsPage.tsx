// src/pages/ReportsPage.tsx
import React, { useState, useEffect } from "react"
import { reportService, type AnalyticsData } from "../services/reportService"
import { useRestaurant } from "../context/RestaurantContext"
import { useAuth } from "../context/AuthContext"
import { useLanguage } from "../context/LanguageContext"

type ReportPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "ANNUAL"

export const ReportsPage: React.FC = () => {
  const { settings } = useRestaurant()
  const { user } = useAuth()
  const { t, language } = useLanguage()

  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Modales
  const [isCloseRegisterOpen, setIsCloseRegisterOpen] = useState<boolean>(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false)
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>("WEEKLY")

  // Estado del Cierre de Caja
  const [initialCash, setInitialCash] = useState<number>(100.0)
  const [countedCash, setCountedCash] = useState<number>(0.0)
  const [cashNotes, setCashNotes] = useState<string>("")

  const loadReports = async () => {
    try {
      setLoading(true)
      const res = await reportService.getAnalytics()
      setData(res)
      setInitialCash(res.initialCash || 100.0)
      setCountedCash(res.todayTotal + (res.initialCash || 100.0))
    } catch (err) {
      console.error("Error cargando reportes:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-gray-500 font-semibold">
        {t("common.loading", "Cargando estadísticas financieras...")}
      </div>
    )
  }

  // Cálculos de Caja
  const expectedTotalInDrawer = initialCash + data.todayTotal
  const cashDifference = countedCash - expectedTotalInDrawer

  const handleConfirmCloseRegister = async () => {
    try {
      await reportService.closeRegister({
        initialCash,
        countedCash,
        notes: cashNotes,
      })
      setIsCloseRegisterOpen(false)
      await loadReports()
      alert(t("reports.confirmCloseBtn", "¡Caja del día cerrada exitosamente!"))
    } catch (err) {
      console.error("Error cerrando caja:", err)
      alert("Hubo un error al cerrar la caja.")
    }
  }

  const handleStartNewDay = async () => {
    if (
      window.confirm(
        "¿Deseas iniciar un nuevo día operativo? Las ventas del día volverán a 0.00 para el nuevo turno.",
      )
    ) {
      try {
        await reportService.openNewDay({ initialCash })
        setCashNotes("")
        await loadReports()
      } catch (err) {
        console.error("Error iniciando nuevo día:", err)
      }
    }
  }

  const maxDailySale = Math.max(...data.last7Days.map((d) => d.total), 1)

  const translateDay = (dayName: string) => {
    const daysMap: Record<string, Record<string, string>> = {
      ES: {
        MONDAY: "Lun",
        TUESDAY: "Mar",
        WEDNESDAY: "Mié",
        THURSDAY: "Jue",
        FRIDAY: "Vie",
        SATURDAY: "Sáb",
        SUNDAY: "Dom",
      },
      EN: {
        MONDAY: "Mon",
        TUESDAY: "Tue",
        WEDNESDAY: "Wed",
        THURSDAY: "Thu",
        FRIDAY: "Fri",
        SATURDAY: "Sat",
        SUNDAY: "Sun",
      },
      IT: {
        MONDAY: "Lun",
        TUESDAY: "Mar",
        WEDNESDAY: "Mer",
        THURSDAY: "Gio",
        FRIDAY: "Ven",
        SATURDAY: "Sab",
        SUNDAY: "Dom",
      },
    }
    const currentLang = language || "ES"
    return daysMap[currentLang]?.[dayName] || dayName
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-xs gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">
              {t("reports.title", "Panel de Ventas y Caja")}
            </h1>
            {data.isRegisterClosed ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-700 border border-rose-200">
                {t("reports.registerClosed", "🔒 Caja Cerrada")}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-200">
                {t("reports.shiftOpen", "● Turno Abierto")}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {t(
              "reports.subtitle",
              "Control de facturación en tiempo real, arqueo de caja y emisión de descargos oficiales.",
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={loadReports}
            className="px-3.5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
          >
            🔄 {t("reports.refresh", "Actualizar")}
          </button>

          {/* Botón Cierre / Nuevo Día */}
          {data.isRegisterClosed ? (
            <button
              type="button"
              onClick={handleStartNewDay}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              {t("reports.startNewDay")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setCountedCash(expectedTotalInDrawer)
                setIsCloseRegisterOpen(true)
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              {t("reports.closeRegister")}
            </button>
          )}

          {/* Botón Selector de Descargo */}
          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <span>
              {t("reports.officialReport", "Descargo Oficial Imprimible")}
            </span>
          </button>
        </div>
      </div>

      {/* TARJETAS DE VENTAS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {t("reports.todaySales", "Ventas de Hoy")}
          </span>
          <p className="text-3xl font-black text-gray-900 mt-2">
            {settings.currency} {data.todayTotal.toFixed(2)}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-2">
            {data.todayOrdersList.length}{" "}
            {t("reports.paidOrdersCount", "comandas pagadas")}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {t("reports.thisWeek", "Esta Semana")}
          </span>
          <p className="text-3xl font-black text-gray-900 mt-2">
            {settings.currency} {data.weekTotal.toFixed(2)}
          </p>
          <span className="text-[11px] text-blue-600 font-semibold mt-2">
            ● Lun - Dom
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {t("reports.thisMonth", "Este Mes")}
          </span>
          <p className="text-3xl font-black text-gray-900 mt-2">
            {settings.currency} {data.monthTotal.toFixed(2)}
          </p>
          <span className="text-[11px] text-purple-600 font-semibold mt-2">
            ● Mes en curso
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {t("reports.annualSales", "Venta Anual")}
          </span>
          <p className="text-3xl font-black text-gray-900 mt-2">
            {settings.currency} {data.yearTotal.toFixed(2)}
          </p>
          <span className="text-[11px] text-amber-600 font-semibold mt-2">
            ● Total año
          </span>
        </div>
      </div>

      {/* METRICAS SECUNDARIAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">
              {t("reports.totalAccounts", "Comandas Totales Atendidas")}
            </p>
            <h3 className="text-2xl font-black text-gray-800 mt-1">
              {data.totalPaidOrders}{" "}
              {t("reports.totalAccountsCount", "cuentas")}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl">
            🧾
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">
              {t("reports.avgTicket", "Ticket Promedio por Mesa")}
            </p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {settings.currency} {data.averageTicket.toFixed(2)}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
            💵
          </div>
        </div>
      </div>

      {/* GRÁFICA DE ÚLTIMOS 7 DÍAS Y TOP PLATOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            {t("reports.last7Days", "Ventas de los Últimos 7 Días")}
          </h2>
          <div className="pt-6 pb-2 grid grid-cols-7 gap-2 items-end h-56 border-b border-gray-100">
            {data.last7Days.map((day, idx) => {
              const heightPercent = Math.round((day.total / maxDailySale) * 100)
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-2 h-full justify-end group"
                >
                  <span className="text-[10px] font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.total > 0
                      ? `${settings.currency}${day.total.toFixed(0)}`
                      : ""}
                  </span>
                  <div
                    style={{ height: `${Math.max(heightPercent, 8)}%` }}
                    className={`w-full max-w-[38px] rounded-t-lg transition-all ${
                      day.total > 0
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-gray-100"
                    }`}
                  />
                  <span className="text-xs font-bold text-gray-500">
                    {translateDay(day.dayName)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
            {t("reports.topRotation", "Top 5 Platos con Mayor Rotación")}
          </h2>
          {data.topProducts.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center italic">
              {t("common.empty", "No hay suficientes registros de ventas aún.")}
            </p>
          ) : (
            <div className="space-y-3 pt-2">
              {data.topProducts.map((prod, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-gray-100 pb-2.5 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-black flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-gray-800">
                        {prod.name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {prod.quantity}{" "}
                        {t("reports.unitsSold", "unidades vendidas")}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-gray-700">
                    {settings.currency} {prod.totalRevenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: CIERRE DE CAJA DEL DÍA (ARQUEO / CIERRE Z) */}
      {isCloseRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 border border-gray-200">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {t(
                    "reports.closeRegisterTitle",
                    "Cierre de Caja del Día (Cierre Z)",
                  )}
                </h3>
                <p className="text-xs text-gray-500">
                  {t(
                    "reports.closeRegisterSubtitle",
                    "Conciliación de ingresos y conteo de efectivo físico",
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCloseRegisterOpen(false)}
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">
                  {t(
                    "reports.totalBilledToday",
                    "Total Ventas Facturadas Hoy:",
                  )}
                </span>
                <strong className="text-gray-900">
                  {settings.currency} {data.todayTotal.toFixed(2)}
                </strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-semibold">
                  {t("reports.initialCash", "Fondo Inicial de Caja:")}
                </span>
                <input
                  type="number"
                  step="0.1"
                  value={initialCash}
                  onChange={(e) => setInitialCash(Number(e.target.value))}
                  className="w-28 p-1.5 bg-white border border-gray-300 rounded-lg text-right font-bold"
                />
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm">
                <span>
                  {t(
                    "reports.theoreticalCash",
                    "Efectivo Total Teórico Esperado:",
                  )}
                </span>
                <span className="text-blue-600">
                  {settings.currency} {expectedTotalInDrawer.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                {t(
                  "reports.countedCash",
                  "Efectivo Físico Real Contado en Gaveta:",
                )}
              </label>
              <input
                type="number"
                step="0.1"
                value={countedCash}
                onChange={(e) => setCountedCash(Number(e.target.value))}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-base font-black text-gray-800 focus:ring-2 focus:ring-red-500 outline-none"
              />
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="font-semibold text-gray-500">
                  {t("reports.difference", "Diferencia (Sobrante/Faltante):")}
                </span>
                <strong
                  className={
                    cashDifference >= 0
                      ? "text-emerald-600"
                      : "text-rose-600 font-black"
                  }
                >
                  {cashDifference >= 0 ? "+" : ""} {settings.currency}{" "}
                  {cashDifference.toFixed(2)}
                </strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                {t(
                  "common.notes",
                  "Observaciones / Notas de Cierre (Opcional):",
                )}
              </label>
              <input
                type="text"
                placeholder={t(
                  "reports.notesPlaceholder",
                  "Ej. Cuadre exacto / Billetes guardados...",
                )}
                value={cashNotes}
                onChange={(e) => setCashNotes(e.target.value)}
                className="w-full p-2 text-xs border border-gray-300 rounded-xl outline-none"
              />
            </div>

            <div className="flex gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsCloseRegisterOpen(false)}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                {t("common.cancel", "Cancelar")}
              </button>
              <button
                type="button"
                onClick={handleConfirmCloseRegister}
                className="flex-1 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                {t("reports.confirmCloseBtn", "🔒 Confirmar Cierre de Caja")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DESCARGO OFICIAL MULTI-PERÍODO IMPRIMIBLE */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 w-full max-w-2xl rounded-2xl p-8 shadow-2xl space-y-6 border border-gray-200 max-h-[90vh] overflow-y-auto print:max-w-full print:shadow-none print:border-0 print:p-0">
            {/* Selector de Período */}
            <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl print:hidden">
              <button
                type="button"
                onClick={() => setSelectedPeriod("DAILY")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedPeriod === "DAILY"
                    ? "bg-white text-red-600 shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t("reports.daily", "☀️ Diario")}
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod("WEEKLY")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedPeriod === "WEEKLY"
                    ? "bg-white text-red-600 shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t("reports.weekly", "📅 Semanal")}
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod("MONTHLY")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedPeriod === "MONTHLY"
                    ? "bg-white text-red-600 shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t("reports.monthly", "🗓️ Mensual")}
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod("ANNUAL")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedPeriod === "ANNUAL"
                    ? "bg-white text-red-600 shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t("reports.annual", "📈 Anual")}
              </button>
            </div>

            {/* Cabecera del Documento */}
            <div className="text-center border-b pb-4 border-gray-200">
              <h2 className="text-xl font-black uppercase tracking-wider">
                {settings.name}
              </h2>
              <p className="text-xs text-gray-500">{settings.slogan}</p>
              <h3 className="text-sm font-bold text-red-600 mt-2 uppercase tracking-wide">
                {t(
                  "reports.docOfficial",
                  "DOCUMENTO OFICIAL DE DESCARGO DE VENTAS",
                )}{" "}
                ({selectedPeriod})
              </h3>
              <p className="text-[11px] text-gray-400">
                {t("reports.issueDate", "Fecha de Emisión:")}{" "}
                {new Date().toLocaleDateString()}{" "}
                {new Date().toLocaleTimeString()}
              </p>
            </div>

            {/* Resumen del Período */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase">
                  {t("reports.periodBilled", "Facturación del Período:")}
                </span>
                <p className="text-2xl font-black text-gray-900">
                  {settings.currency}{" "}
                  {selectedPeriod === "DAILY"
                    ? data.todayTotal.toFixed(2)
                    : selectedPeriod === "WEEKLY"
                      ? data.weekTotal.toFixed(2)
                      : selectedPeriod === "MONTHLY"
                        ? data.monthTotal.toFixed(2)
                        : data.yearTotal.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-500 uppercase">
                  {t("reports.issuer", "Responsable / Emisor:")}
                </span>
                <p className="text-sm font-bold text-gray-800 mt-1">
                  {user?.name || "Administrador"}
                </p>
              </div>
            </div>

            {/* Tabla Dinámica según el período */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                {selectedPeriod === "DAILY" &&
                  "Detalle de Comandas Facturadas en el Turno"}
                {selectedPeriod === "WEEKLY" && "Desglose Diario de la Semana"}
                {selectedPeriod === "MONTHLY" &&
                  "Desglose Semanal del Mes en Curso"}
                {selectedPeriod === "ANNUAL" && "Desglose Mensual del Año"}
              </h4>

              <table className="w-full text-xs text-left border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 text-gray-600 font-bold uppercase">
                  <tr>
                    <th className="p-2.5">Concepto / Período</th>
                    <th className="p-2.5 text-center">Detalle</th>
                    <th className="p-2.5 text-right">Monto Facturado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedPeriod === "DAILY" &&
                    (data.todayOrdersList.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="p-4 text-center text-gray-400 italic"
                        >
                          No hay comandas registradas en este turno
                        </td>
                      </tr>
                    ) : (
                      data.todayOrdersList.map((ord, i) => (
                        <tr key={i}>
                          <td className="p-2.5 font-semibold">
                            Mesa #{ord.tableNumber}
                          </td>
                          <td className="p-2.5 text-center text-gray-500">
                            Hora: {ord.time}
                          </td>
                          <td className="p-2.5 text-right font-bold">
                            {settings.currency} {ord.total.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ))}

                  {selectedPeriod === "WEEKLY" &&
                    data.last7Days.map((d, i) => (
                      <tr key={i}>
                        <td className="p-2.5 font-semibold">
                          {translateDay(d.dayName)} ({d.date})
                        </td>
                        <td className="p-2.5 text-center text-gray-500">
                          {d.orderCount} cuentas
                        </td>
                        <td className="p-2.5 text-right font-bold">
                          {settings.currency} {d.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}

                  {selectedPeriod === "MONTHLY" &&
                    data.monthWeeks.map((w, i) => (
                      <tr key={i}>
                        <td className="p-2.5 font-semibold">{w.label}</td>
                        <td className="p-2.5 text-center text-gray-500">
                          {w.orderCount} cuentas
                        </td>
                        <td className="p-2.5 text-right font-bold">
                          {settings.currency} {w.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}

                  {selectedPeriod === "ANNUAL" &&
                    data.yearMonths.map((m, i) => (
                      <tr key={i}>
                        <td className="p-2.5 font-semibold">{m.monthName}</td>
                        <td className="p-2.5 text-center text-gray-500">
                          {m.orderCount} cuentas
                        </td>
                        <td className="p-2.5 text-right font-bold">
                          {settings.currency} {m.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Firmas de Auditoría */}
            <div className="grid grid-cols-2 gap-8 pt-10 text-center">
              <div className="border-t border-gray-400 pt-2">
                <p className="text-xs font-bold text-gray-700">
                  {t("reports.cashierSign", "Responsable de Caja / POS")}
                </p>
                <p className="text-[10px] text-gray-400">
                  {t("reports.stamp", "Firma y Sello")}
                </p>
              </div>
              <div className="border-t border-gray-400 pt-2">
                <p className="text-xs font-bold text-gray-700">
                  {t("reports.auditorSign", "Administración General")}
                </p>
                <p className="text-[10px] text-gray-400">
                  Visto Bueno y Auditoría
                </p>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-2 pt-4 border-t border-gray-100 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-black transition-colors"
              >
                {t("reports.printPeriodReport", "🖨️ Imprimir Descargo")} (
                {selectedPeriod})
              </button>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl cursor-pointer hover:bg-gray-200 transition-colors"
              >
                {t("common.close", "Cerrar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsPage
