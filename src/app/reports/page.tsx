import Link from 'next/link';
import { getReports } from '@/app/actions';
import { auth, signOut } from '@/auth';
import { FiSearch, FiCalendar, FiLogOut, FiSettings, FiPlus } from 'react-icons/fi';

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ q?: string; start?: string; end?: string; month?: string }> }) {
    const session = await auth();
    const searchParamsObj = await searchParams; // Await once
    const { q, start, end, month } = searchParamsObj;

    let queryStart = start;
    let queryEnd = end;

    // Monthly Filter Logic: If month is set and ranges are empty (or user prefers month), calculate range.
    // Note: Specific start/end inputs should override month if provided manually alongside.
    // But usually users use one or the other.
    if (month && !start && !end) {
        const [yearStr, monthStr] = month.split('-');
        const year = parseInt(yearStr);
        const m = parseInt(monthStr);

        // First day: YYYY-MM-01
        queryStart = `${year}-${m.toString().padStart(2, '0')}-01`;

        // Last day: 
        const lastDay = new Date(year, m, 0).getDate();
        queryEnd = `${year}-${m.toString().padStart(2, '0')}-${lastDay}`;
    }

    const reports = await getReports({
        clientName: q,
        startDate: queryStart,
        endDate: queryEnd
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-emerald-700 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Link href="/" className="text-xl md:text-2xl font-extrabold tracking-widest text-white uppercase" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>RVAT</Link>
                        </div>
                        <div className="flex items-center space-x-2 md:space-x-4">
                            {session?.user?.role === 'ADMIN' && (
                                <Link href="/admin" className="hidden md:flex items-center hover:bg-emerald-600 px-3 py-2 rounded transition text-sm font-medium">
                                    <FiSettings className="mr-2" /> Admin
                                </Link>
                            )}

                            <Link href="/clients" className="flex items-center hover:bg-emerald-600 px-2 md:px-3 py-2 rounded transition text-sm font-medium">
                                <FiSearch className="mr-0 md:mr-2" /> <span className="hidden md:inline">Clientes</span>
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

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Histórico de Relatórios</h1>
                        <p className="text-gray-600 text-sm">Visualize e filtre todos os relatórios emitidos</p>
                    </div>

                    <Link href="/reports/new" className="bg-emerald-600 text-white px-6 py-3 rounded shadow hover:bg-emerald-700 transition flex items-center justify-center font-semibold">
                        <FiPlus className="mr-2" /> Novo Relatório
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded shadow-sm border border-gray-100 mb-6">
                    <form className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Search - Full width on both mobile and desktop (Row 1) */}
                        <div className="md:col-span-12 relative">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                name="q"
                                defaultValue={q}
                                placeholder="Pesquisar por Cliente..."
                                className="w-full pl-10 pr-4 py-2 border rounded-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900 placeholder-gray-500"
                            />
                        </div>

                        {/* Row 2: Month, Range, Button */}

                        {/* Month Filter - 3 cols on desktop */}
                        <div className="md:col-span-3 relative">
                            <span className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500 font-medium">Mês de Ref.</span>
                            <input
                                name="month"
                                type="month"
                                defaultValue={searchParamsObj.month}
                                className="w-full px-4 py-1.5 border rounded-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900 text-sm h-9"
                            />
                        </div>

                        {/* Range Date Filter - 7 cols on desktop */}
                        <div className="md:col-span-7 flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500 font-medium">De</span>
                                <input
                                    name="start"
                                    type="date"
                                    defaultValue={start}
                                    className="w-full px-2 py-1.5 border rounded-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900 text-sm h-9"
                                />
                            </div>
                            <div className="relative flex-1">
                                <span className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500 font-medium">Até</span>
                                <input
                                    name="end"
                                    type="date"
                                    defaultValue={end}
                                    className="w-full px-2 py-1.5 border rounded-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900 text-sm h-9"
                                />
                            </div>
                        </div>

                        {/* Submit Button - 2 cols on desktop, Full width on mobile */}
                        <div className="md:col-span-2">
                            <button type="submit" className="w-full h-12 md:h-9 bg-gray-800 text-white px-4 rounded-sm hover:bg-gray-900 transition font-medium flex items-center justify-center text-sm">
                                <FiSearch className="mr-2 md:hidden" /> Filtrar
                            </button>
                        </div>
                    </form>
                </div>

                {/* Responsive Layout */}

                {/* Mobile View (Cards) */}
                <div className="md:hidden space-y-4">
                    {reports.map((report: any) => (
                        <div key={report.id} className="bg-white p-4 rounded shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="text-xs font-bold text-gray-500">#{report.id}</span>
                                    <h3 className="font-bold text-gray-900">{report.client.name}</h3>
                                </div>
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                    Concluído
                                </span>
                            </div>
                            <div className="text-sm text-gray-600 mb-3 space-y-1">
                                <div className="flex items-center"><FiCalendar className="mr-2" /> {new Date(report.date).toLocaleDateString('pt-BR')}</div>
                                <div>Técnico: {report.technicianName}</div>
                            </div>
                            <Link href={`/reports/${report.id}`} className="block w-full text-center bg-emerald-50 text-emerald-700 py-2 rounded font-medium hover:bg-emerald-100 transition">
                                Ver Detalhes
                            </Link>
                        </div>
                    ))}
                    {reports.length === 0 && (
                        <div className="text-center py-8 text-gray-500 bg-white rounded border border-gray-100">
                            <FiSearch className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p>Nenhum relatório encontrado.</p>
                        </div>
                    )}
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden md:block bg-white shadow-sm rounded overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* ... keep existing table content ... */}
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nº</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Técnico</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reports.map((report: any) => (
                                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">#{report.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{new Date(report.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{report.client.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{report.technicianName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Concluído
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={`/reports/${report.id}`} className="text-emerald-600 hover:text-emerald-900 font-semibold hover:underline">Ver Detalhes</Link>
                                    </td>
                                </tr>
                            ))}
                            {reports.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <FiSearch className="h-12 w-12 text-gray-300 mb-4" />
                                            <p className="text-lg font-medium">Nenhum relatório encontrado</p>
                                            <p className="text-sm">Tente ajustar os filtros ou crie um novo relatório.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
