import Link from 'next/link';
import { getClients, deleteClient } from '@/app/actions';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiMail, FiPhone, FiMapPin, FiUser, FiUsers, FiArrowLeft, FiLogOut, FiSettings, FiFileText } from 'react-icons/fi';
import { auth, signOut } from '@/auth';

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const session = await auth();
    const { q } = await searchParams;
    const clients = await getClients(q);

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 selection:bg-emerald-500 selection:text-white">
            {/* Shared Premium Glassmorphic Navbar */}
            <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-150 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        {/* Brand Logo & Name */}
                        <Link href="/" className="flex items-center gap-3">
                            <img src="/apple-icon.png" alt="Logo RVAT" className="w-8 h-8 rounded-lg object-contain shadow-md border border-slate-200" />
                            <span className="text-xl font-black tracking-widest bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent uppercase">
                                RVAT
                            </span>
                        </Link>

                        {/* Navigation links */}
                        <div className="flex items-center gap-1.5 sm:gap-3">
                            {session?.user?.role === 'ADMIN' && (
                                <Link href="/admin" className="inline-flex items-center gap-1.5 hover:bg-slate-100/80 text-slate-600 hover:text-emerald-700 px-3 py-2 rounded-xl transition-all duration-200 text-sm font-semibold">
                                    <FiSettings size={16} /> <span className="hidden md:inline">Admin</span>
                                </Link>
                            )}

                            <Link href="/clients" className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl transition-all duration-200 text-sm font-bold">
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

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 overflow-hidden">
                {/* Background light-glow blobs */}
                <div className="absolute top-0 left-1/3 w-80 h-80 bg-emerald-200/20 rounded-full filter blur-3xl -z-10 animate-pulse duration-10000" />

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-5 border-b border-gray-200">
                    <div>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                            Clientes
                        </h1>
                        <p className="text-slate-500 text-sm mt-1.5 font-medium">Base de dados e cadastro de clientes da RVAT.</p>
                    </div>
                    <Link href="/clients/new" className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 text-center">
                        <FiPlus size={18} className="stroke-[3]" /> Novo Cliente
                    </Link>
                </div>

                {/* Search / Filter Card */}
                <div className="bg-white p-4.5 rounded-2xl shadow-sm border border-slate-150 mb-8">
                    <form className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                name="q"
                                defaultValue={q}
                                placeholder="Buscar cliente por Razão Social ou CNPJ..."
                                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-slate-900 text-sm font-medium bg-slate-50/50"
                            />
                        </div>
                        <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-xl transition duration-150 text-sm shadow-sm">
                            Filtrar
                        </button>
                    </form>
                </div>

                {/* Mobile View: Card List */}
                <div className="block lg:hidden space-y-4">
                    {clients.map(client => (
                        <div key={client.id} className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-3">
                            <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                                <div className="space-y-0.5">
                                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">{client.name}</h3>
                                    {client.cnpj && (
                                        <span className="inline-block text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-mono">
                                            CNPJ: {client.cnpj}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-slate-600">
                                {client.city && (
                                    <p className="flex items-center gap-2"><FiMapPin className="text-slate-400" /> {client.city}</p>
                                )}
                                {client.contact && (
                                    <p className="flex items-center gap-2"><FiUser className="text-slate-400" /> {client.contact}</p>
                                )}
                                {client.phone && (
                                    <p className="flex items-center gap-2"><FiPhone className="text-slate-400" /> {client.phone}</p>
                                )}
                                {client.email && (
                                    <p className="flex items-center gap-2 truncate"><FiMail className="text-slate-400" /> {client.email}</p>
                                )}
                            </div>
                            <div className="flex gap-2 pt-3 border-t border-slate-100">
                                <Link
                                    href={`/clients/${client.id}/edit`}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-emerald-700 hover:border-emerald-100 rounded-xl text-sm font-bold shadow-sm transition"
                                >
                                    <FiEdit2 size={14} /> Editar
                                </Link>
                                <form
                                    action={async () => {
                                        'use server';
                                        if (confirm('Tem certeza que deseja excluir este cliente?')) {
                                            await deleteClient(client.id);
                                        }
                                    }}
                                    className="flex-1"
                                >
                                    <button
                                        type="submit"
                                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50/50 hover:bg-red-50 text-red-600 hover:text-red-700 border border-transparent hover:border-red-100 rounded-xl text-sm font-bold transition"
                                    >
                                        <FiTrash2 size={14} /> Excluir
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                    {clients.length === 0 && (
                        <div className="bg-white p-10 text-center text-slate-450 border border-slate-150 rounded-2xl">
                            Nenhum cliente encontrado.
                        </div>
                    )}
                </div>

                {/* Desktop View: Table Grid */}
                <div className="hidden lg:block bg-white shadow-md rounded-2xl overflow-hidden border border-slate-150">
                    <table className="min-w-full divide-y divide-slate-150">
                        <thead className="bg-slate-50/70">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Razão Social / Nome</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">CNPJ</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cidade</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contato / E-mail</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {clients.map(client => (
                                <tr key={client.id} className="hover:bg-slate-50/30 transition-all duration-150">
                                    <td className="px-6 py-4.5">
                                        <p className="font-bold text-slate-900">{client.name}</p>
                                    </td>
                                    <td className="px-6 py-4.5">
                                        <p className="text-sm font-mono text-slate-500">{client.cnpj || '-'}</p>
                                    </td>
                                    <td className="px-6 py-4.5">
                                        <p className="text-sm text-slate-600 font-medium">{client.city || '-'}</p>
                                    </td>
                                    <td className="px-6 py-4.5">
                                        <div className="space-y-0.5">
                                            {client.contact && <p className="text-sm font-bold text-slate-700">{client.contact}</p>}
                                            {client.email && <p className="text-xs text-slate-500 flex items-center gap-1"><FiMail /> {client.email}</p>}
                                            {client.phone && <p className="text-xs text-slate-500 flex items-center gap-1"><FiPhone /> {client.phone}</p>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4.5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/clients/${client.id}/edit`}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-emerald-700 hover:border-emerald-100 transition shadow-sm"
                                                title="Editar Cliente"
                                            >
                                                <FiEdit2 size={12} /> Editar
                                            </Link>
                                            <form
                                                action={async () => {
                                                    'use server';
                                                    if (confirm('Tem certeza que deseja excluir este cliente?')) {
                                                        await deleteClient(client.id);
                                                    }
                                                }}
                                            >
                                                <button
                                                    type="submit"
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50/50 hover:bg-red-50 border border-transparent hover:border-red-150 rounded-lg text-xs font-bold text-red-650 hover:text-red-700 transition"
                                                    title="Excluir Cliente"
                                                >
                                                    <FiTrash2 size={12} /> Excluir
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {clients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-medium">Nenhum cliente cadastrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Back Link */}
                <div className="mt-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-800 hover:underline">
                        <FiArrowLeft /> Voltar para o Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
