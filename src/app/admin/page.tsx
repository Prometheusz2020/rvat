import { getUsers, createUser, deleteUser } from '@/lib/actions-admin';
import Link from 'next/link';
import { FiTrash2, FiUserPlus, FiArrowLeft, FiUser, FiMail, FiShield, FiCalendar } from 'react-icons/fi';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
    // 1. Double check permission at Server Component level (highly secure)
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        redirect('/');
    }

    const users = await getUsers();

    const inputClass = "mt-1.5 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-400 border py-2.5 px-3.5 text-sm transition-all bg-white";
    const labelClass = "block text-sm font-semibold text-gray-700 flex items-center gap-1.5";

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-gray-200">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <span className="w-2.5 h-8 bg-emerald-600 rounded-full"></span>
                            Painel de Controle
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Gerencie os técnicos com acesso ao sistema de relatórios.</p>
                    </div>
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-700 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm transition active:scale-95">
                        <FiArrowLeft /> Voltar ao Dashboard
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* List Users */}
                    <div className="lg:col-span-2 bg-white shadow-md rounded-2xl overflow-hidden border border-gray-150">
                        <div className="px-6 py-4.5 border-b border-gray-150 bg-gray-50/70 flex justify-between items-center">
                            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                <FiUser className="text-emerald-600" /> Técnicos Cadastrados
                            </h2>
                            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full">
                                {users.length} usuários
                            </span>
                        </div>
                        
                        <div className="divide-y divide-gray-150">
                            {users.map((user) => (
                                <div key={user.id} className="px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 transition">
                                    <div className="space-y-1 pr-4">
                                        <p className="text-base font-bold text-gray-900">{user.name}</p>
                                        <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                            <FiMail className="text-gray-400" /> {user.email}
                                        </p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <FiCalendar /> Cadastrado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                            {user.role}
                                        </span>
                                        {user.email !== 'admin@rvat.com' && (
                                            <form action={async () => {
                                                'use server';
                                                await deleteUser(user.id);
                                            }}>
                                                <button 
                                                    type="submit" 
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2.5 rounded-xl transition duration-150"
                                                    title="Excluir Técnico"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Add User Form */}
                    <div className="bg-white shadow-md rounded-2xl border border-gray-150 h-fit">
                        <div className="px-6 py-4.5 border-b border-gray-150 bg-gray-50/70">
                            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                <FiUserPlus className="text-emerald-600" /> Adicionar Técnico
                            </h2>
                        </div>
                        <div className="p-6">
                            <form action={async (formData) => {
                                'use server';
                                await createUser(formData);
                            }} className="space-y-4">
                                <div>
                                    <label className={labelClass}><FiUser className="text-gray-400" /> Nome Completo</label>
                                    <input name="name" type="text" required placeholder="Ex: João Silva" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}><FiMail className="text-gray-400" /> Endereço de E-mail</label>
                                    <input name="email" type="email" required placeholder="joao@empresa.com" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}><FiShield className="text-gray-400" /> Senha de Acesso</label>
                                    <input name="password" type="password" required placeholder="Mínimo 6 caracteres" className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}><FiShield className="text-gray-400" /> Nível de Acesso (Função)</label>
                                    <select name="role" className={inputClass}>
                                        <option value="USER">Técnico (Padrão)</option>
                                        <option value="ADMIN">Administrador</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition focus:outline-none mt-2">
                                    Cadastrar Técnico
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
