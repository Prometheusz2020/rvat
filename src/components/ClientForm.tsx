'use client';
import React, { useState, useTransition } from 'react';
import { fetchCompanyData, saveClient } from '@/app/actions';
import { FiSearch, FiSave } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

export default function ClientForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        id: initialData?.id || undefined,
        name: initialData?.name || '',
        cnpj: initialData?.cnpj || '',
        phone: initialData?.phone || '',
        email: initialData?.email || '', // Added email field
        address: initialData?.address || '',
        city: initialData?.city || '',
        contact: initialData?.contact || '',
    });
    const [loading, setLoading] = useState(false);
    const [cnpjLoading, startCnpjTransition] = useTransition();

    const handleCnpjBlur = async () => {
        // Allow manual trigger if user prefers or just on blur if valid length
        if (formData.cnpj && formData.cnpj.replace(/\D/g, '').length === 14) {
            searchCnpj();
        }
    };

    const searchCnpj = () => {
        if (!formData.cnpj) return;
        startCnpjTransition(async () => {
            const data = await fetchCompanyData(formData.cnpj);
            if (data.error) {
                alert(data.error);
            } else {
                setFormData(prev => ({
                    ...prev,
                    name: data.name || prev.name,
                    phone: data.phone || prev.phone,
                    email: data.email || prev.email, // Added email mapping
                    address: data.address || prev.address,
                    city: data.city || prev.city,
                    cnpj: data.cnpj || prev.cnpj
                }));
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await saveClient(formData);
            router.push('/clients');
            router.refresh(); // Ensure list is updated
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar cliente');
            setLoading(false);
        }
    };

    const inputClass = "w-full border-gray-300 rounded-sm shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-500 border p-2";
    const labelClass = "block text-gray-900 font-semibold mb-1 text-sm";

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded border border-gray-100 space-y-4">
            <div className="flex gap-4 items-end">
                <div className="flex-1">
                    <label className={labelClass}>CNPJ</label>
                    <div className="flex gap-2">
                        <input
                            className={inputClass}
                            value={formData.cnpj}
                            onChange={e => setFormData({ ...formData, cnpj: e.target.value })}
                            placeholder="Apenas números..."
                            onBlur={handleCnpjBlur}
                        />
                        <button
                            type="button"
                            onClick={searchCnpj}
                            disabled={cnpjLoading}
                            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition flex items-center justify-center min-w-[100px]"
                        >
                            {cnpjLoading ? 'Buscando...' : <><FiSearch className="mr-2" /> Buscar</>}
                        </button>
                    </div>
                </div>
                <div className="flex-1">
                    <label className={labelClass}>Nome / Razão Social</label>
                    <input className={inputClass} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className={labelClass}>Telefone</label>
                    <input className={inputClass} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                    <label className={labelClass}>E-mail</label>
                    <input className={inputClass} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} type="email" placeholder="cliente@email.com" />
                </div>
                <div>
                    <label className={labelClass}>Cidade</label>
                    <input className={inputClass} value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                </div>
            </div>

            <div>
                <label className={labelClass}>Endereço</label>
                <input className={inputClass} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
            </div>

            <div>
                <label className={labelClass}>Contato (Nome)</label>
                <input className={inputClass} value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
            </div>

            <div className="pt-4 flex justify-end gap-2">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-600 text-white px-6 py-2 rounded shadow hover:bg-emerald-700 transition font-bold flex items-center"
                >
                    {loading ? 'Salvando...' : <><FiSave className="mr-2" /> Salvar Cliente</>}
                </button>
            </div>
        </form>
    );
}
