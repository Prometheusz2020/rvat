import Link from 'next/link';
import { getDashboardStats, getRecentReports } from './actions';
import { auth, signOut } from '@/auth';
import { FiFileText, FiUsers, FiPlus, FiArrowRight, FiActivity, FiLogOut, FiSettings, FiSearch, FiCalendar } from 'react-icons/fi';

export default async function Dashboard() {
  const session = await auth();
  const { totalReports, monthReports } = await getDashboardStats();
  const recentReports = await getRecentReports();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-emerald-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-xl md:text-2xl font-extrabold tracking-widest text-white uppercase" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>RVAT</span>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              {session?.user?.role === 'ADMIN' && (
                <Link href="/admin" className="hidden md:flex items-center hover:bg-emerald-600 px-3 py-2 rounded transition text-sm font-medium">
                  <FiSettings className="mr-2" /> Admin
                </Link>
              )}

              <Link href="/clients" className="flex items-center hover:bg-emerald-600 px-2 md:px-3 py-2 rounded transition text-sm font-medium">
                <FiUsers className="mr-0 md:mr-2" /> <span className="hidden md:inline">Clientes</span>
              </Link>

              <Link href="/reports" className="flex items-center hover:bg-emerald-600 px-2 md:px-3 py-2 rounded transition text-sm font-medium">
                <FiFileText className="mr-0 md:mr-2" /> <span className="hidden md:inline">Relatórios</span>
              </Link>

              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-100 opacity-90 truncate max-w-[100px] md:max-w-none">Olá, {session?.user?.name?.split(' ')[0]}</span>
                <form action={async () => {
                  'use server';
                  await signOut();
                }}>
                  <button className="flex items-center hover:bg-emerald-600 px-2 py-2 rounded text-emerald-100 hover:text-white transition">
                    <FiLogOut className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral das suas atividades e relatórios.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Reports this Month */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
            <div className="p-3 bg-emerald-100 rounded-full mr-4">
              <FiActivity className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Relatórios (Este Mês)</p>
              <p className="text-2xl font-bold text-gray-900">{monthReports}</p>
            </div>
          </div>

          {/* Total Reports */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <FiFileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Relatórios</p>
              <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
            </div>
          </div>

          {/* New Report Action Card */}
          <Link href="/reports/new" className="bg-emerald-600 p-6 rounded-lg shadow hover:bg-emerald-700 transition flex items-center justify-center text-white group cursor-pointer">
            <FiPlus className="h-8 w-8 mr-3 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold">Novo Relatório</span>
          </Link>
        </div>

        {/* Recent Reports Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Relatórios Recentes</h2>
            <Link href="/reports" className="text-emerald-600 hover:text-emerald-800 text-sm font-medium flex items-center hover:underline">
              Ver Todos <FiArrowRight className="ml-1" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {recentReports.length > 0 ? (
              recentReports.map((report: any) => (
                <div key={report.id} className="p-4 hover:bg-gray-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="text-xs font-bold text-gray-400 mr-2">#{report.id}</span>
                      <h3 className="font-semibold text-gray-900">{report.client.name}</h3>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-4">
                      <span className="flex items-center"><FiCalendar className="mr-1 h-3 w-3" /> {new Date(report.date).toLocaleDateString('pt-BR')}</span>
                      <span>Técnico: {report.technicianName}</span>
                    </div>
                  </div>
                  <div>
                    <Link href={`/reports/${report.id}`} className="inline-flex items-center px-3 py-1 bg-white border border-gray-200 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                      Detalhes
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                Nenhum relatório recente encontrado.
              </div>
            )}
          </div>
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 md:hidden">
            <Link href="/reports" className="block text-center text-emerald-600 font-medium text-sm">
              Ver Histórico Completo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
