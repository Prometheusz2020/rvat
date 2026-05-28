'use client';
import { useState, useTransition } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { searchClients } from '@/app/actions';

interface Client {
    id: number;
    name: string;
    cnpj?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    city?: string | null;
    contact?: string | null;
    code?: string | null;
}

interface ClientSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (client: Client) => void;
}

export default function ClientSearchModal({ isOpen, onClose, onSelect }: ClientSearchModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Client[]>([]);
    const [isPending, startTransition] = useTransition();

    if (!isOpen) return null;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const data = await searchClients(query);
            setResults(data);
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-900 text-lg">Buscar Cliente</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FiX size={24} />
                    </button>
                </div>

                <div className="p-4">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 border-gray-300 rounded-sm shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 p-2 border"
                            placeholder="Nome ou CNPJ..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="bg-emerald-600 text-white px-4 py-2 rounded-sm hover:bg-emerald-700 transition flex items-center"
                            disabled={isPending}
                        >
                            {isPending ? '...' : <FiSearch />}
                        </button>
                    </form>

                    <div className="mt-4 max-h-60 overflow-y-auto">
                        {results.length === 0 && query && !isPending && (
                            <p className="text-gray-500 text-center py-4">Nenhum cliente encontrado.</p>
                        )}

                        <ul className="divide-y divide-gray-100">
                            {results.map(client => (
                                <li key={client.id}>
                                    <button
                                        onClick={() => onSelect(client)}
                                        className="w-full text-left p-3 hover:bg-gray-50 transition flex flex-col group"
                                    >
                                        <span className="font-bold text-gray-900 group-hover:text-emerald-700">{client.name}</span>
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>{client.city || 'Sem cidade'}</span>
                                            <span>CNPJ: {client.cnpj || '-'}</span>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
