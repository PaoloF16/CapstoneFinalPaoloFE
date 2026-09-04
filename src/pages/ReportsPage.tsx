import React, { useState, useEffect } from 'react';
import { reportService, type AnalyticsData } from '../services/reportService';
import { useRestaurant } from '../context/RestaurantContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  RefreshIcon,
  EndOfDayIcon,
  PrintableReportIcon,
} from '../components/common/Icons';

type ReportPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ANNUAL';

export const ReportsPage: React.FC = () => {
  const { settings } = useRestaurant();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [isCloseRegisterOpen, setIsCloseRegisterOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('WEEKLY');

  const [initialCash, setInitialCash] = useState<number>(100.0);
  const [countedCash, setCountedCash] = useState<number>(0.0);
  const [cashNotes, setCashNotes] = useState<string>('');

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await reportService.getAnalytics();
      setData(res);
      setInitialCash(res.initialCash || 100.0);
      setCountedCash(res.todayTotal + (res.initialCash || 100.0));
    } catch (err) {
      console.error('Error cargando reportes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0f14] text-orange-400 font-bold text-sm select-none">
        {t('common.loading', 'Cargando estadísticas financieras...')}
      </div>
    );
  }

  const expectedTotalInDrawer = initialCash + data.todayTotal;
  const cashDifference = countedCash - expectedTotalInDrawer;

  const handleConfirmCloseRegister = async () => {
    try {
      await reportService.closeRegister({
        initialCash,
        countedCash,
        notes: cashNotes,
      });
      setIsCloseRegisterOpen(false);
      await loadReports();
      alert('¡Caja cerrada exitosamente!');
    } catch (err) {
      console.error('Error cerrando caja:', err);
    }
  };

  const handleStartNewDay = async () => {
    if (window.confirm('¿Deseas iniciar un nuevo día operativo? Las ventas del turno volverán a 0.00.')) {
      try {
        await reportService.openNewDay({ initialCash });
        setCashNotes('');
        await loadReports();
      } catch (err) {
        console.error('Error iniciando nuevo día:', err);
      }
    }
  };

  const maxDailySale = Math.max(...data.last7Days.map((d) => d.total), 1);

  const translateDay = (dayName: string) => {
    const daysMap: Record<string, Record<string, string>> = {
      ES: { MONDAY: 'Lun', TUESDAY: 'Mar', WEDNESDAY: 'Mié', THURSDAY: 'Jue', FRIDAY: 'Vie', SATURDAY: 'Sáb', SUNDAY: 'Dom' },
      EN: { MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed', THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat', SUNDAY: 'Sun' },
      IT: { MONDAY: 'Lun', TUESDAY: 'Mar', WEDNESDAY: 'Mer', THURSDAY: 'Gio', FRIDAY: 'Ven', SATURDAY: 'Sab', SUNDAY: 'Dom' },
    };
    const currentLang = language || 'ES';
    return daysMap[currentLang]?.[dayName] || dayName;
  };

  return (
    <div className="min-h-screen bg-[#0d0f14] p-6 max-w-7xl mx-auto space-y-6 select-none relative">
      {/* Glow ambiental */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER (BLANCO) */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white text-gray-900 p-6 rounded-3xl border border-gray-200/80 shadow-md gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-gray-900">
              {t('reports.title', 'Panel de Ventas y Caja')}
            </h1>
            {data.isRegisterClosed ? (
              <span className="px-2.5 py-0.5 rounded-xl text-[10px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200">
                {t('reports.registerClosed', 'Caja Cerrada')}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-xl text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                {t('reports.shiftOpen', '● Turno Abierto')}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {t('reports.subtitle', 'Control de facturación en tiempo real, arqueo de caja y emisión de descargos oficiales.')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={loadReports}
            className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-2xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <RefreshIcon className="w-3.5 h-3.5 text-gray-500" />
            <span>{t('reports.refresh', 'Actualizar')}</span>
          </button>

          {data.isRegisterClosed ? (
            <button
              type="button"
              onClick={handleStartNewDay}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-emerald-600/20 cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <RefreshIcon className="w-3.5 h-3.5" />
              <span>{t('reports.startNewDay', 'Empezar Nuevo Día')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setCountedCash(expectedTotalInDrawer);
                setIsCloseRegisterOpen(true);
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-2xl shadow-md cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <EndOfDayIcon className="w-4 h-4 text-orange-400" />
              <span>{t('reports.closeRegister', 'Cerrar Caja del Día')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-2xl shadow-md shadow-orange-500/20 cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <PrintableReportIcon className="w-4 h-4" />
            <span>{t('reports.officialReport', 'Descargo Oficial Imprimible')}</span>
          </button>
        </div>
      </div>

      {/* TARJETAS DE VENTAS PRINCIPALES (BLANCAS) */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-md flex flex-col justify-between">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
            {t('reports.todaySales', 'Ventas de Hoy')}
          </span>
          <p className="text-3xl font-black text-orange-600 mt-2">
            {settings.currency} {data.todayTotal.toFixed(2)}
          </p>
          <span className="text-xs text-emerald-600 font-bold mt-2">
            {data.todayOrdersList.length} {t('reports.paidOrdersCount', 'comandas pagadas')}
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-md flex flex-col justify-between">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
            {t('reports.thisWeek', 'Esta Semana')}
          </span>
          <p className="text-3xl font-black text-gray-900 mt-2">
            {settings.currency} {data.weekTotal.toFixed(2)}
          </p>
          <span className="text-xs text-blue-600 font-semibold mt-2">● Lun - Dom</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-md flex flex-col justify-between">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
            {t('reports.thisMonth', 'Este Mes')}
          </span>
          <p className="text-3xl font-black text-gray-900 mt-2">
            {settings.currency} {data.monthTotal.toFixed(2)}
          </p>
          <span className="text-xs text-purple-600 font-semibold mt-2">● Mes en curso</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-md flex flex-col justify-between">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
            {t('reports.annualSales', 'Venta Anual')}
          </span>
          <p className="text-3xl font-black text-gray-900 mt-2">
            {settings.currency} {data.yearTotal.toFixed(2)}
          </p>
          <span className="text-xs text-amber-600 font-semibold mt-2">● Total año</span>
        </div>
      </div>

      {/* MÉTRICAS SECUNDARIAS (BLANCAS) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-md flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">
              {t('reports.totalAccounts', 'Comandas Totales Atendidas')}
            </p>
            <h3 className="text-2xl font-black text-gray-800 mt-1">
              {data.totalPaidOrders} {t('reports.totalAccountsCount', 'cuentas')}
            </h3>
          </div>
          
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-md flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">{t('reports.avgTicket', 'Ticket Promedio por Mesa')}</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {settings.currency} {data.averageTicket.toFixed(2)}
            </h3>
          </div>
        </div>
      </div>

      {/* GRÁFICA Y TOP PLATOS (BLANCAS) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-md space-y-4">
          <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider">
            {t('reports.last7Days', 'Ventas de los Últimos 7 Días')}
          </h2>
          <div className="pt-6 pb-2 grid grid-cols-7 gap-2 items-end h-56 border-b border-gray-100">
            {data.last7Days.map((day, idx) => {
              const heightPercent = Math.round((day.total / maxDailySale) * 100);
              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.total > 0 ? `${settings.currency}${day.total.toFixed(0)}` : ''}
                  </span>
                  <div
                    style={{ height: `${Math.max(heightPercent, 8)}%` }}
                    className={`w-full max-w-[42px] rounded-t-xl transition-all ${
                      day.total > 0 ? 'bg-gradient-to-t from-orange-500 to-amber-500 hover:brightness-105' : 'bg-gray-100'
                    }`}
                  />
                  <span className="text-xs font-bold text-gray-500">{translateDay(day.dayName)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-md space-y-4">
          <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider">
            {t('reports.topRotation', 'Top 5 Platos con Mayor Rotación')}
          </h2>
          {data.topProducts.length === 0 ? (
            <p className="text-xs text-gray-400 py-8 text-center italic">{t('common.empty', 'No hay suficientes registros de ventas aún.')}</p>
          ) : (
            <div className="space-y-3 pt-2">
              {data.topProducts.map((prod, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-gray-100 pb-2.5 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-xl bg-orange-100 text-orange-600 text-xs font-black flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-gray-800">{prod.name}</p>
                      <p className="text-[10px] text-gray-400">
                        {prod.quantity} {t('reports.unitsSold', 'unidades vendidas')}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-gray-900">
                    {settings.currency} {prod.totalRevenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL CIERRE DE CAJA (OFF-WHITE SUAVE) */}
      {isCloseRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#f8f9fc] text-gray-900 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4 border border-gray-200">
            <div className="flex justify-between items-center border-b border-gray-200/80 pb-3">
              <div>
                <h3 className="text-lg font-black text-gray-900">
                  {t('reports.closeRegisterTitle', 'Cierre de Caja del Día (Cierre Z)')}
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  {t('reports.closeRegisterSubtitle', 'Conciliación de ingresos y conteo de efectivo físico')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCloseRegisterOpen(false)}
                className="w-8 h-8 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 bg-white p-4 rounded-2xl border border-gray-200/80 text-xs shadow-xs">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">{t('reports.totalBilledToday', 'Total Ventas Facturadas Hoy:')}</span>
                <strong className="text-orange-600 text-sm font-black">{settings.currency} {data.todayTotal.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">{t('reports.initialCash', 'Fondo Inicial de Caja:')}</span>
                <input
                  type="number"
                  step="0.1"
                  value={initialCash}
                  onChange={(e) => setInitialCash(Number(e.target.value))}
                  className="w-28 p-2 bg-gray-50 border border-gray-300 rounded-xl text-right font-bold text-gray-900 outline-none focus:border-orange-500"
                />
              </div>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-black text-sm">
                <span className="text-gray-700">{t('reports.theoreticalCash', 'Efectivo Total Teórico Esperado:')}</span>
                <span className="text-blue-600">{settings.currency} {expectedTotalInDrawer.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase">
                {t('reports.countedCash', 'Efectivo Físico Real Contado en Gaveta:')}
              </label>
              <input
                type="number"
                step="0.1"
                value={countedCash}
                onChange={(e) => setCountedCash(Number(e.target.value))}
                className="w-full p-3 bg-white border border-gray-300 rounded-2xl text-lg font-black text-gray-900 outline-none focus:border-orange-500 shadow-xs"
              />
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="font-semibold text-gray-500">{t('reports.difference', 'Diferencia (Sobrante/Faltante):')}</span>
                <strong className={cashDifference >= 0 ? 'text-emerald-600' : 'text-rose-600 font-black'}>
                  {cashDifference >= 0 ? '+' : ''} {settings.currency} {cashDifference.toFixed(2)}
                </strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                {t('common.notes', 'Observaciones / Notas de Cierre (Opcional):')}
              </label>
              <input
                type="text"
                placeholder={t('reports.notesPlaceholder', 'Ej. Cuadre exacto / Billetes guardados...')}
                value={cashNotes}
                onChange={(e) => setCashNotes(e.target.value)}
                className="w-full p-2.5 text-xs bg-white border border-gray-300 rounded-xl outline-none focus:border-orange-500 text-gray-900"
              />
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsCloseRegisterOpen(false)}
                className="flex-1 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                {t('common.cancel', 'Cancelar')}
              </button>
              <button
                type="button"
                onClick={handleConfirmCloseRegister}
                className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-orange-500/20"
              >
                {t('reports.confirmCloseBtn', 'Confirmar Cierre de Caja')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DESCARGO IMPRIMIBLE (OFF-WHITE SUAVE) */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#f8f9fc] text-gray-900 w-full max-w-2xl rounded-3xl p-8 shadow-2xl space-y-6 border border-gray-200 max-h-[90vh] overflow-y-auto print:max-w-full print:shadow-none print:border-0 print:p-0 print:bg-white print:text-black">
            {/* Selector de Período */}
            <div className="flex gap-1.5 p-1 bg-white rounded-2xl border border-gray-200 print:hidden shadow-xs">
              <button
                type="button"
                onClick={() => setSelectedPeriod('DAILY')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedPeriod === 'DAILY' ? 'bg-orange-500 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {t('reports.daily', 'Diario')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod('WEEKLY')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedPeriod === 'WEEKLY' ? 'bg-orange-500 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {t('reports.weekly', 'Semanal')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod('MONTHLY')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedPeriod === 'MONTHLY' ? 'bg-orange-500 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {t('reports.monthly', 'Mensual')}
              </button>
              <button
                type="button"
                onClick={() => setSelectedPeriod('ANNUAL')}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  selectedPeriod === 'ANNUAL' ? 'bg-orange-500 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {t('reports.annual', 'Anual')}
              </button>
            </div>

            {/* Cabecera Documento */}
            <div className="text-center border-b border-gray-200 pb-4">
              <h2 className="text-xl font-black uppercase text-gray-900 tracking-wider">{settings.name}</h2>
              <p className="text-xs text-gray-500">{settings.slogan}</p>
              <h3 className="text-sm font-black text-orange-600 mt-2 uppercase tracking-wide">
                {t('reports.docOfficial', 'DOCUMENTO OFICIAL DE DESCARGO DE VENTAS')} ({selectedPeriod})
              </h3>
              <p className="text-[11px] text-gray-400">
                {t('reports.issueDate', 'Fecha de Emisión:')} {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </p>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-2 gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase">{t('reports.periodBilled', 'Facturación del Período:')}</span>
                <p className="text-2xl font-black text-gray-900">
                  {settings.currency}{' '}
                  {selectedPeriod === 'DAILY'
                    ? data.todayTotal.toFixed(2)
                    : selectedPeriod === 'WEEKLY'
                    ? data.weekTotal.toFixed(2)
                    : selectedPeriod === 'MONTHLY'
                    ? data.monthTotal.toFixed(2)
                    : data.yearTotal.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase">{t('reports.issuer', 'Responsable / Emisor:')}</span>
                <p className="text-sm font-bold text-gray-800 mt-1">{user?.name || 'Administrador'}</p>
              </div>
            </div>

            {/* Tabla Detalle */}
            <div>
              <table className="w-full text-xs text-left border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase border-b border-gray-200">
                  <tr>
                    <th className="p-3">Concepto / Período</th>
                    <th className="p-3 text-center">Detalle</th>
                    <th className="p-3 text-right">Monto Facturado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedPeriod === 'DAILY' &&
                    (data.todayOrdersList.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-gray-400 italic">No hay comandas registradas en este turno</td>
                      </tr>
                    ) : (
                      data.todayOrdersList.map((ord, i) => (
                        <tr key={i}>
                          <td className="p-3 font-semibold text-gray-800">Mesa #{ord.tableNumber}</td>
                          <td className="p-3 text-center text-gray-500">Hora: {ord.time}</td>
                          <td className="p-3 text-right font-black text-orange-600">{settings.currency} {ord.total.toFixed(2)}</td>
                        </tr>
                      ))
                    ))}

                  {selectedPeriod === 'WEEKLY' &&
                    data.last7Days.map((d, i) => (
                      <tr key={i}>
                        <td className="p-3 font-semibold text-gray-800">{translateDay(d.dayName)} ({d.date})</td>
                        <td className="p-3 text-center text-gray-500">{d.orderCount} cuentas</td>
                        <td className="p-3 text-right font-black text-orange-600">{settings.currency} {d.total.toFixed(2)}</td>
                      </tr>
                    ))}

                  {selectedPeriod === 'MONTHLY' &&
                    data.monthWeeks.map((w, i) => (
                      <tr key={i}>
                        <td className="p-3 font-semibold text-gray-800">{w.label}</td>
                        <td className="p-3 text-center text-gray-500">{w.orderCount} cuentas</td>
                        <td className="p-3 text-right font-black text-orange-600">{settings.currency} {w.total.toFixed(2)}</td>
                      </tr>
                    ))}

                  {selectedPeriod === 'ANNUAL' &&
                    data.yearMonths.map((m, i) => (
                      <tr key={i}>
                        <td className="p-3 font-semibold text-gray-800">{m.monthName}</td>
                        <td className="p-3 text-center text-gray-500">{m.orderCount} cuentas</td>
                        <td className="p-3 text-right font-black text-orange-600">{settings.currency} {m.total.toFixed(2)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Firmas */}
            <div className="grid grid-cols-2 gap-8 pt-10 text-center">
              <div className="border-t border-gray-300 pt-2">
                <p className="text-xs font-bold text-gray-700">{t('reports.cashierSign', 'Responsable de Caja / POS')}</p>
                <p className="text-[10px] text-gray-400">{t('reports.stamp', 'Firma y Sello')}</p>
              </div>
              <div className="border-t border-gray-300 pt-2">
                <p className="text-xs font-bold text-gray-700">{t('reports.auditorSign', 'Administración General')}</p>
                <p className="text-[10px] text-gray-400">Visto Bueno y Auditoría</p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-4 border-t border-gray-200 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md shadow-orange-500/20"
              >
                {t('reports.printPeriodReport', 'Imprimir Descargo')} ({selectedPeriod})
              </button>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer hover:bg-gray-50"
              >
                {t('common.close', 'Cerrar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;