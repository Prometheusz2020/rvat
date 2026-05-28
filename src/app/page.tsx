import Link from 'next/link';
import { getDashboardStats, getRecentReports } from './actions';
import { auth, signOut } from '@/auth';
import { FiFileText, FiUsers, FiPlus, FiArrowRight, FiActivity, FiLogOut, FiSettings, FiCalendar } from 'react-icons/fi';

export default async function Dashboard() {
  const session = await auth();
  const { totalReports, monthReports } = await getDashboardStats();
  const recentReports = await getRecentReports();

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* Premium Glassmorphic Navbar */}
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-150 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3">
              <img src="/apple-icon.png" alt="Logo RVAT" className="w-8 h-8 rounded-lg object-contain shadow-md border border-slate-200" />
              <span className="text-xl font-black tracking-widest bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent uppercase">
                RVAT
              </span>
            </div>

            {/* Navigation links */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {session?.user?.role === 'ADMIN' && (
                <Link href="/admin" className="inline-flex items-center gap-1.5 hover:bg-slate-100/80 text-slate-600 hover:text-emerald-700 px-3 py-2 rounded-xl transition-all duration-200 text-sm font-semibold">
                  <FiSettings size={16} /> <span className="hidden md:inline">Admin</span>
                </Link>
              )}

              <Link href="/clients" className="inline-flex items-center gap-1.5 hover:bg-slate-100/80 text-slate-600 hover:text-emerald-700 px-3 py-2 rounded-xl transition-all duration-200 text-sm font-semibold">
                <FiUsers size={16} /> <span>Clientes</span>
              </Link>

              <Link href="/reports" className="inline-flex items-center gap-1.5 hover:bg-slate-100/80 text-slate-600 hover:text-emerald-700 px-3 py-2 rounded-xl transition-all duration-200 text-sm font-semibold">
                <FiFileText size={16} /> <span>Relatórios</span>
              </Link>

              <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block"></div>

              {/* User info & Logout */}
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs font-semibold text-slate-500">
                  Olá, <span className="text-slate-800 font-bold">{session?.user?.name?.split(' ')[0]}</span>
                </span>
                <form action={async () => {
                  'use server';
                  await signOut();
                }}>
                  <button type="submit" className="flex items-center hover:bg-red-50 text-slate-400 hover:text-red-600 p-2 rounded-xl transition-all duration-200" title="Sair da Conta">
                    <FiLogOut className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 overflow-hidden">
        {/* Modern SaaS background glow blobs */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-emerald-200/30 rounded-full filter blur-3xl -z-10 animate-pulse duration-10000" />
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-blue-200/20 rounded-full filter blur-3xl -z-10 animate-pulse duration-10000 delay-3000" />

        {/* Page Title Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Visão geral das suas atividades e relatórios técnicos cadastrados.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Reports this Month */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex items-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <div className="p-4 bg-emerald-50 rounded-2xl mr-4 border border-emerald-100">
              <FiActivity className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Relatórios (Este Mês)</p>
              <p className="text-3xl font-black text-slate-900 mt-0.5">{monthReports}</p>
            </div>
          </div>

          {/* Total Reports */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex items-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <div className="p-4 bg-blue-50 rounded-2xl mr-4 border border-blue-100">
              <FiFileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total de Relatórios</p>
              <p className="text-3xl font-black text-slate-900 mt-0.5">{totalReports}</p>
            </div>
          </div>

          {/* New Report Action Card */}
          <Link href="/reports/new" className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center text-white group cursor-pointer transform hover:-translate-y-1 border border-emerald-500/20">
            <FiPlus className="h-8 w-8 mr-2.5 group-hover:scale-110 transition-transform stroke-[2.5]" />
            <span className="text-lg font-extrabold tracking-wide">Novo Relatório</span>
          </Link>
        </div>

        {/* Recent Reports Section */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-150 overflow-hidden">
          <div className="px-6 py-4.5 border-b border-slate-150 flex justify-between items-center bg-slate-50/70">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FiFileText className="text-emerald-600" /> Relatórios Recentes
            </h2>
            <Link href="/reports" className="text-emerald-600 hover:text-emerald-800 text-sm font-bold flex items-center gap-1 hover:underline">
              Ver Todos <FiArrowRight />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentReports.length > 0 ? (
              recentReports.map((report: any) => (
                <div key={report.id} className="p-5 hover:bg-slate-50/50 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-400">#{report.id}</span>
                      <h3 className="font-bold text-slate-900 text-base">{report.client.name}</h3>
                    </div>
                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1 font-medium">
                        <FiCalendar className="text-slate-400" /> 
                        {new Date(report.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                      </span>
                      <span className="h-3 w-px bg-slate-200 hidden sm:inline" />
                      <span className="font-medium">Técnico: <span className="text-slate-700 font-bold">{report.technicianName}</span></span>
                    </div>
                  </div>
                  <div>
                    <Link href={`/reports/${report.id}`} className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-250 rounded-xl text-sm font-bold text-slate-750 hover:bg-slate-50 hover:text-emerald-700 hover:border-emerald-200 transition-all shadow-sm">
                      Detalhes
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-slate-400 font-medium">
                Nenhum relatório recente encontrado.
              </div>
            )}
          </div>
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 md:hidden">
            <Link href="/reports" className="block text-center text-emerald-600 font-bold text-sm">
              Ver Histórico Completo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
