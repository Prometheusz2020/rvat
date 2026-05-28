import { getUsers, createUser, deleteUser } from '@/lib/actions-admin';
import Link from 'next/link';
import { FiTrash2, FiUserPlus, FiArrowLeft } from 'react-icons/fi';

export default async function AdminPage() {
    const users = await getUsers();

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Gerenciar Técnicos</h1>
                    <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                        <FiArrowLeft className="mr-2" /> Voltar ao Dashboard
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* List Users */}
                    <div className="md:col-span-2 bg-white shadow rounded overflow-hidden border border-gray-100">
                        <div className="px-6 py-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-700">Técnicos Cadastrados</h2>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {users.map((user) => (
                                <li key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <span className={`mr-4 px-2 py-1 text-xs rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {user.role}
                                        </span>
                                        {user.email !== 'admin@rvat.com' && (
                                            <form action={async () => {
                                                'use server';
                                                await deleteUser(user.id);
                                            }}>
                                                <button className="text-red-500 hover:text-red-700 p-2">
                                                    <FiTrash2 />
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Add User Form */}
                    <div className="bg-white shadow rounded h-fit border border-gray-100">
                        <div className="px-6 py-4 border-b bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <FiUserPlus className="mr-2" /> Novo Técnico
                            </h2>
                        </div>
                        <div className="p-6">
                            <form action={async (formData) => {
                                'use server';
                                await createUser(formData);
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Nome</label>
                                    <input name="name" type="text" required className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Email</label>
                                    <input name="email" type="email" required className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Senha</label>
                                    <input name="password" type="password" required className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900">Função</label>
                                    <select name="role" className="mt-1 block w-full rounded-sm border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 text-gray-900">
                                        <option value="USER">Técnico (Padrão)</option>
                                        <option value="ADMIN">Administrador (Dono)</option>
                                    </select>
                                </div>
                                <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-sm shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none transition">
                                    Cadastrar
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
