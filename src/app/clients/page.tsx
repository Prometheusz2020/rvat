import Link from 'next/link';
import { getClients } from '@/app/actions';
import { FiPlus, FiSearch } from 'react-icons/fi';

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams;
    const clients = await getClients(q);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar reuse? Ideally simple page for now */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Clientes</h1>
                        <p className="text-gray-600">Base de clientes cadastrados</p>
                    </div>
                    <Link href="/clients/new" className="bg-emerald-600 text-white px-4 py-2 rounded shadow hover:bg-emerald-700 flex items-center">
                        <FiPlus className="mr-2" /> Novo Cliente
                    </Link>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded shadow-sm border border-gray-100 mb-6">
                    <form className="flex gap-2">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-3 top-3 text-gray-400" />
                            <input
                                name="q"
                                defaultValue={q}
                                placeholder="Buscar por Nome ou CNPJ..."
                                className="w-full pl-10 pr-4 py-2 border rounded-sm focus:ring-emerald-500 focus:border-emerald-500 outline-none text-gray-900"
                            />
                        </div>
                        <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-sm hover:bg-gray-900">
                            Filtrar
                        </button>
                    </form>
                </div>

                <div className="bg-white shadow-sm rounded overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nome</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">CNPJ</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cidade</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contato</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {clients.map(client => (
                                <tr key={client.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{client.name}</td>
                                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">{client.cnpj || '-'}</td>
                                    <td className="px-6 py-4 text-gray-600">{client.city}</td>
                                    <td className="px-6 py-4 text-gray-600">{client.contact}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/clients/${client.id}/edit`} className="text-blue-600 hover:underline text-sm font-semibold">Editar</Link>
                                    </td>
                                </tr>
                            ))}
                            {clients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhum cliente encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8">
                    <Link href="/" className="text-emerald-600 hover:underline">← Voltar para Dashboard</Link>
                </div>
            </div>
        </div>
    );
}
