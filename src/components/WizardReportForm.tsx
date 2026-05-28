'use client';
import React, { useState, useEffect } from 'react';
import { TechnicalReport, initialReport } from '@/types/report';
import { createReport, updateReport, fetchCompanyData } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { FiSearch, FiPlus, FiTrash2, FiCalendar, FiClock, FiDollarSign, FiFileText, FiEdit3, FiCheck, FiUser, FiMapPin, FiActivity } from 'react-icons/fi';
import { SignaturePad } from './SignaturePad';
import ClientSearchModal from './ClientSearchModal';

interface WizardProps {
    initialTechnicianName?: string;
    initialData?: TechnicalReport;
    reportId?: number;
}

export default function WizardReportForm({ initialTechnicianName, initialData, reportId }: WizardProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [loadingCnpj, setLoadingCnpj] = useState(false);
    const [cnpjError, setCnpjError] = useState<string | null>(null);
    const [cnpjSuccess, setCnpjSuccess] = useState(false);

    const [report, setReport] = useState<TechnicalReport>(() => {
        if (initialData) {
            return initialData;
        }
        return {
            ...initialReport,
            technicianName: initialTechnicianName || initialReport.technicianName
        };
    });

    const isEditing = !!reportId;

    // Auto-calculation effect for Km and Expenses
    useEffect(() => {
        setReport((prev) => {
            const totalKm = (prev.transport.arrivalKm || 0) - (prev.transport.departureKm || 0);

            const expenses = prev.expenses;
            const totalExpenses =
                (Number(expenses.advances) || 0) +
                (Number(expenses.fuel) || 0) +
                (Number(expenses.hotel) || 0) +
                (Number(expenses.meals) || 0) +
                (Number(expenses.tolls) || 0) +
                (Number(expenses.tickets) || 0) +
                (Number(expenses.others) || 0) +
                (Number(expenses.sundry) || 0);

            if (prev.transport.totalKm === totalKm && prev.expenses.total === totalExpenses) {
                return prev;
            }

            return {
                ...prev,
                transport: { ...prev.transport, totalKm },
                expenses: { ...prev.expenses, total: totalExpenses },
            };
        });
    }, [
        report.transport.arrivalKm,
        report.transport.departureKm,
        report.expenses.advances,
        report.expenses.fuel,
        report.expenses.hotel,
        report.expenses.meals,
        report.expenses.tolls,
        report.expenses.tickets,
        report.expenses.others,
        report.expenses.sundry
    ]);

    const updateClient = (field: string, value: string) => {
        setReport(prev => ({ ...prev, client: { ...prev.client, [field]: value } }));
    };

    const formatCnpj = (value: string) => {
        const clean = value.replace(/\D/g, '').slice(0, 14);
        if (clean.length <= 2) return clean;
        if (clean.length <= 5) return `${clean.slice(0, 2)}.${clean.slice(2)}`;
        if (clean.length <= 8) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
        if (clean.length <= 12) return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8)}`;
        return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5, 8)}/${clean.slice(8, 12)}-${clean.slice(12)}`;
    };

    const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCnpj(e.target.value);
        updateClient('cnpj', formatted);
    };

    const formatPhone = (value: string) => {
        const clean = value.replace(/\D/g, '').slice(0, 11);
        if (clean.length <= 2) return clean;
        if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
        if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
        return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        updateClient('phone', formatted);
    };

    const handleCnpjLookup = async () => {
        if (!report.client.cnpj) {
            setCnpjError('Por favor, informe o CNPJ antes de consultar');
            return;
        }
        setLoadingCnpj(true);
        setCnpjError(null);
        setCnpjSuccess(false);
        try {
            const data = await fetchCompanyData(report.client.cnpj);
            if (data.error) {
                setCnpjError(data.error);
            } else {
                setReport(prev => ({
                    ...prev,
                    client: {
                        ...prev.client,
                        name: data.name || prev.client.name,
                        phone: data.phone ? formatPhone(data.phone) : prev.client.phone,
                        email: data.email || prev.client.email, // Added email lookup
                        address: data.address || prev.client.address,
                        city: data.city || prev.client.city,
                    }
                }));
                setCnpjSuccess(true);
                setTimeout(() => setCnpjSuccess(false), 4000);
            }
        } catch (e) {
            setCnpjError('Erro de conexão ao buscar dados do CNPJ');
        } finally {
            setLoadingCnpj(false);
        }
    };

    const handleClientSelect = (client: any) => {
        setReport(prev => ({
            ...prev,
            client: {
                ...prev.client,
                name: client.name,
                code: client.code || '',
                cnpj: client.cnpj ? formatCnpj(client.cnpj) : '',
                phone: client.phone ? formatPhone(client.phone) : '',
                email: client.email || '', // Added email mapping
                city: client.city || '',
                address: client.address || '',
                contact: client.contact || ''
            }
        }));
        setIsSearchOpen(false);
    };

    const updateTransport = (field: string, value: string | number) => {
        setReport(prev => ({ ...prev, transport: { ...prev.transport, [field]: value } }));
    };

    const updateExpense = (field: string, value: number) => {
        setReport(prev => ({ ...prev, expenses: { ...prev.expenses, [field]: value } }));
    };

    const calculateDuration = (inTime: string, outTime: string): string => {
        if (!inTime || !outTime) return '';
        const [inH, inM] = inTime.split(':').map(Number);
        const [outH, outM] = outTime.split(':').map(Number);
        if (isNaN(inH) || isNaN(inM) || isNaN(outH) || isNaN(outM)) return '';

        let diffMin = (outH * 60 + outM) - (inH * 60 + inM);
        if (diffMin < 0) {
            diffMin += 24 * 60; // Overnight
        }

        const h = Math.floor(diffMin / 60);
        const m = diffMin % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const updateServiceHour = (index: number, field: string, value: string) => {
        setReport(prev => {
            const newHours = [...prev.serviceHours];
            const updatedRow = { ...newHours[index], [field]: value };

            if (field === 'in' || field === 'out') {
                const calculated = calculateDuration(
                    field === 'in' ? value : (updatedRow.in || ''),
                    field === 'out' ? value : (updatedRow.out || '')
                );
                if (calculated) {
                    updatedRow.total = calculated;
                }
            }

            newHours[index] = updatedRow;
            return { ...prev, serviceHours: newHours };
        });
    };

    const addServiceHourRow = () => {
        setReport(prev => ({
            ...prev,
            serviceHours: [...prev.serviceHours, { day: '', in: '', out: '', total: '' }]
        }));
    };

    const removeServiceHourRow = (index: number) => {
        setReport(prev => {
            const newHours = prev.serviceHours.filter((_, i) => i !== index);
            return {
                ...prev,
                serviceHours: newHours.length > 0 ? newHours : [{ day: '', in: '', out: '', total: '' }]
            };
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Filter out empty service hours rows to clean database entries
            const cleanedReport = {
                ...report,
                serviceHours: report.serviceHours.filter(row => row.day || row.in || row.out)
            };

            if (isEditing && reportId) {
                await updateReport(reportId, cleanedReport);
                router.push(`/reports/${reportId}`);
                router.refresh();
            } else {
                const newReport = await createReport(cleanedReport);
                router.push(`/reports/${newReport.id}`);
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar relatório');
            setLoading(false);
        }
    };

    const inputClass = "w-full border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 placeholder-gray-400 border py-3 px-4 text-base transition-all bg-white";
    const labelClass = "block text-gray-800 font-semibold mb-2 text-sm flex items-center gap-1.5";

    const expenseLabels: Record<string, string> = {
        advances: 'Adiantamentos',
        fuel: 'Combustível',
        hotel: 'Hospedagem',
        meals: 'Refeições',
        tolls: 'Pedágios',
        tickets: 'Passagens',
        others: 'Outros',
        sundry: 'Diversos'
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl p-4 sm:p-8 my-2 sm:my-8 border border-gray-100 relative">
            <ClientSearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelect={handleClientSelect}
            />

            {/* Mobile Header Progress */}
            <div className="md:hidden mb-6 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Etapa {step} de 6</span>
                    <span className="text-sm font-extrabold text-gray-900">
                        {step === 1 && 'Identificação'}
                        {step === 2 && 'Transporte'}
                        {step === 3 && 'Horas de Serviço'}
                        {step === 4 && 'Despesas'}
                        {step === 5 && 'Relato Técnico'}
                        {step === 6 && 'Assinatura'}
                    </span>
                </div>
                <div className="w-full bg-gray-200/70 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-emerald-600 h-full transition-all duration-300 ease-out"
                        style={{ width: `${(step / 6) * 100}%` }}
                    />
                </div>
            </div>

            {/* Desktop Header Progress */}
            <div className="hidden md:flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
                {[1, 2, 3, 4, 5, 6].map(s => (
                    <React.Fragment key={s}>
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={() => step > s && setStep(s)}
                                disabled={step <= s}
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold transition-all duration-300 cursor-pointer disabled:cursor-default ${step === s ? 'bg-emerald-600 text-white shadow-lg ring-4 ring-emerald-100' : (step > s ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-400')}`}
                            >
                                {step > s ? <FiCheck className="stroke-[3]" /> : s}
                            </button>
                            <span className={`font-semibold text-sm ${step === s ? 'text-gray-900 font-bold' : (step > s ? 'text-emerald-700 font-medium' : 'text-gray-400')}`}>
                                {s === 1 && 'Identificação'}
                                {s === 2 && 'Transporte'}
                                {s === 3 && 'Horas'}
                                {s === 4 && 'Despesas'}
                                {s === 5 && 'Relato'}
                                {s === 6 && 'Assinatura'}
                            </span>
                        </div>
                        {s < 6 && (
                            <div className={`flex-1 h-0.5 mx-3 transition-colors duration-300 ${step > s ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Main Form Body with bottom padding for mobile sticky navigation */}
            <div className="min-h-[350px] pb-24 sm:pb-0">
                {/* STEP 1: IDENTIFICATION */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-gray-100 pb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FiUser className="text-emerald-600" /> Identificação da Visita
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Preencha a data e localize os dados do cliente.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}><FiCalendar className="text-gray-400" /> Data do Relatório</label>
                                <input type="date" className={inputClass} value={report.date} onChange={e => setReport({ ...report, date: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}><FiUser className="text-gray-400" /> Técnico Responsável</label>
                                <input
                                    className="w-full bg-gray-100 text-gray-500 rounded-lg border py-3 px-4 text-base font-medium cursor-not-allowed border-gray-200"
                                    value={report.technicianName}
                                    readOnly
                                    title="Preenchido automaticamente pelo login"
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50/70 p-4 sm:p-6 rounded-xl border border-gray-150/50 space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-200 pb-3">
                                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                                    <span className="w-1.5 h-5 bg-emerald-500 rounded-full"></span>
                                    Dados do Cliente
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsSearchOpen(true)}
                                    className="w-full sm:w-auto text-sm bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                                >
                                    <FiSearch /> Buscar no Banco de Dados
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1">
                                    <label className={labelClass}>CNPJ</label>
                                    <div className="flex gap-2">
                                        <input
                                            className={`${inputClass} flex-1`}
                                            value={report.client.cnpj}
                                            onChange={handleCnpjChange}
                                            placeholder="00.000.000/0000-00"
                                            inputMode="numeric"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCnpjLookup}
                                            disabled={loadingCnpj}
                                            className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-300 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition flex items-center justify-center shadow-sm"
                                        >
                                            {loadingCnpj ? '...' : 'Consultar'}
                                        </button>
                                    </div>
                                    {cnpjError && <p className="text-red-500 text-xs mt-1.5 font-medium">{cnpjError}</p>}
                                    {cnpjSuccess && <p className="text-emerald-600 text-xs mt-1.5 font-medium flex items-center gap-1"><FiCheck /> Dados importados!</p>}
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Razão Social / Nome</label>
                                    <input className={inputClass} value={report.client.name} onChange={e => updateClient('name', e.target.value)} placeholder="Nome da empresa ou cliente" />
                                </div>

                                <div className="md:col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2">
                                            <label className={labelClass}>Endereço Completo</label>
                                            <input className={inputClass} value={report.client.address} onChange={e => updateClient('address', e.target.value)} placeholder="Rua, número e bairro" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Cidade - UF</label>
                                            <input className={inputClass} value={report.client.city} onChange={e => updateClient('city', e.target.value)} placeholder="Cidade/UF" />
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className={labelClass}>Telefone</label>
                                            <input className={inputClass} value={report.client.phone} onChange={handlePhoneChange} placeholder="(00) 00000-0000" type="tel" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>E-mail de Contato</label>
                                            <input className={inputClass} value={report.client.email || ''} onChange={e => updateClient('email', e.target.value)} placeholder="Ex: cliente@email.com" type="email" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Nome do Contato</label>
                                            <input className={inputClass} value={report.client.contact} onChange={e => updateClient('contact', e.target.value)} placeholder="Com quem falou?" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2: TRANSPORT */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-gray-100 pb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FiActivity className="text-blue-500" /> Detalhes do Transporte
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Insira as datas, horários e quilometragens do trajeto.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Departure Card */}
                            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 space-y-4">
                                <h3 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Saída
                                </h3>
                                <div>
                                    <label className={labelClass}>Data de Saída</label>
                                    <input type="date" className={inputClass} value={report.transport.departureDate} onChange={e => updateTransport('departureDate', e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelClass}>Hora de Saída</label>
                                    <input type="time" className={inputClass} value={report.transport.departureTime} onChange={e => updateTransport('departureTime', e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelClass}>KM Inicial</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className={inputClass}
                                        value={report.transport.departureKm || ''}
                                        onChange={e => updateTransport('departureKm', parseFloat(e.target.value) || 0)}
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>

                            {/* Arrival Card */}
                            <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100 space-y-4">
                                <h3 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Chegada
                                </h3>
                                <div>
                                    <label className={labelClass}>Data de Chegada</label>
                                    <input type="date" className={inputClass} value={report.transport.arrivalDate} onChange={e => updateTransport('arrivalDate', e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelClass}>Hora de Chegada</label>
                                    <input type="time" className={inputClass} value={report.transport.arrivalTime} onChange={e => updateTransport('arrivalTime', e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelClass}>KM Final</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className={inputClass}
                                        value={report.transport.arrivalKm || ''}
                                        onChange={e => updateTransport('arrivalKm', parseFloat(e.target.value) || 0)}
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-blue-700 uppercase">Distância Total</p>
                                    <p className="text-2xl font-black text-blue-900">{report.transport.totalKm} <span className="text-sm font-medium">Km</span></p>
                                </div>
                                <FiActivity className="text-blue-400 h-8 w-8 opacity-80" />
                            </div>

                            <div>
                                <label className={labelClass}>Total de Horas de Viagem</label>
                                <input
                                    className={inputClass}
                                    placeholder="Ex: 04:30 ou 4h"
                                    value={report.transport.totalHours}
                                    onChange={e => updateTransport('totalHours', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: SERVICE HOURS (APONTAMENTO) */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <FiClock className="text-orange-500" /> Horas de Serviço
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">Lançamento de horas no cliente. A duração é calculada automaticamente ao digitar Entrada e Saída.</p>
                            </div>
                            <button
                                type="button"
                                onClick={addServiceHourRow}
                                className="inline-flex items-center justify-center gap-1.5 text-sm bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm transition active:scale-95"
                            >
                                <FiPlus className="stroke-[3]" /> Adicionar Dia
                            </button>
                        </div>

                        {/* Mobile View: Cards */}
                        <div className="block sm:hidden space-y-4">
                            {report.serviceHours.map((row, i) => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3.5 relative">
                                    <div className="flex justify-between items-center border-b pb-2">
                                        <span className="font-bold text-gray-800 text-sm">Apontamento #{i + 1}</span>
                                        {report.serviceHours.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeServiceHourRow(i)}
                                                className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 p-1"
                                            >
                                                <FiTrash2 /> Remover
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Dia / Mês</label>
                                            <input
                                                className={inputClass}
                                                placeholder="Ex: 28/05"
                                                value={row.day}
                                                onChange={e => updateServiceHour(i, 'day', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Entrada</label>
                                            <input
                                                type="time"
                                                className={inputClass}
                                                value={row.in}
                                                onChange={e => updateServiceHour(i, 'in', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Saída</label>
                                            <input
                                                type="time"
                                                className={inputClass}
                                                value={row.out}
                                                onChange={e => updateServiceHour(i, 'out', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Total de Horas (Calculado)</label>
                                            <input
                                                className={`${inputClass} bg-gray-50/80 font-bold border-dashed`}
                                                placeholder="Total calculado"
                                                value={row.total}
                                                onChange={e => updateServiceHour(i, 'total', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View: Table Grid */}
                        <div className="hidden sm:block overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dia / Mês</th>
                                        <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Horário Entrada</th>
                                        <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Horário Saída</th>
                                        <th scope="col" className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total Horas</th>
                                        <th scope="col" className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {report.serviceHours.map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 transition">
                                            <td className="px-4 py-2.5">
                                                <input className={inputClass} placeholder="Ex: 28/05" value={row.day} onChange={e => updateServiceHour(i, 'day', e.target.value)} />
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <input type="time" className={inputClass} value={row.in} onChange={e => updateServiceHour(i, 'in', e.target.value)} />
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <input type="time" className={inputClass} value={row.out} onChange={e => updateServiceHour(i, 'out', e.target.value)} />
                                            </td>
                                            <td className="px-4 py-2.5">
                                                <input className={`${inputClass} bg-gray-50 font-semibold border-dashed`} placeholder="00:00" value={row.total} onChange={e => updateServiceHour(i, 'total', e.target.value)} />
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                {report.serviceHours.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeServiceHourRow(i)}
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                                                        title="Remover linha"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* STEP 4: EXPENSES (PRESTAÇÃO DE CONTAS) */}
                {step === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-gray-100 pb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FiDollarSign className="text-emerald-600" /> Prestação de Contas (Despesas)
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Lançamento de despesas para reembolso. Deixe zero para itens não utilizados.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.keys(report.expenses).filter(k => k !== 'total').map((key) => (
                                <div key={key} className="bg-white p-4 rounded-xl border border-gray-150 flex flex-col justify-between hover:border-gray-300 transition-colors">
                                    <label className="block mb-1.5 capitalize text-sm font-semibold text-gray-700">
                                        {expenseLabels[key] || key}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">R$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className={`${inputClass} pl-10`}
                                            value={report.expenses[key as keyof typeof report.expenses] || ''}
                                            onChange={e => updateExpense(key, parseFloat(e.target.value) || 0)}
                                            inputMode="decimal"
                                            placeholder="0,00"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-5 bg-emerald-50 border border-emerald-100 text-emerald-950 font-bold text-xl text-center rounded-xl shadow-sm flex items-center justify-between mt-6">
                            <span className="text-sm font-extrabold uppercase tracking-wide text-emerald-700">Total das Despesas</span>
                            <span className="text-3xl font-black">R$ {report.expenses.total.toFixed(2)}</span>
                        </div>
                    </div>
                )}

                {/* STEP 5: TECHNICAL REPORT DETAILS (DESCRIPTION) */}
                {step === 5 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-gray-100 pb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FiFileText className="text-emerald-600" /> Relato Técnico da Visita
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Descreva o serviço executado, acordos, pendências e observações do cliente.</p>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className={labelClass}>Descrição da Solicitação / Serviço Executado</label>
                                <textarea
                                    className={`${inputClass} h-36 p-4 leading-relaxed resize-y`}
                                    value={report.description}
                                    onChange={e => setReport({ ...report, description: e.target.value })}
                                    placeholder="Ex: Executada a manutenção preventiva no alimentador, trocado o rolamento principal e ajustado o alinhamento da correia..."
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Assuntos Tratados / Pendências</label>
                                <textarea
                                    className={`${inputClass} h-36 p-4 leading-relaxed resize-y`}
                                    value={report.mattersTreated}
                                    onChange={e => setReport({ ...report, mattersTreated: e.target.value })}
                                    placeholder="Ficou algo pendente? Há prazos acertados? Quais tópicos foram alinhados com o cliente?"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Observações do Cliente</label>
                                <textarea
                                    className={`${inputClass} h-28 p-4 leading-relaxed resize-y`}
                                    value={report.clientObservations}
                                    onChange={e => setReport({ ...report, clientObservations: e.target.value })}
                                    placeholder="Anotações e considerações feitas pelo cliente no momento da entrega do serviço..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 6: SIGNATURE */}
                {step === 6 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="border-b border-gray-100 pb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FiEdit3 className="text-emerald-600" /> Assinatura do Cliente
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">Colha a assinatura digital do cliente na tela do celular para autenticação do relatório.</p>
                        </div>

                        <div className="bg-gray-50/50 p-4 sm:p-6 rounded-xl border border-gray-250 flex flex-col items-center justify-center max-w-lg mx-auto shadow-sm">
                            <SignaturePad
                                onSave={(signature) => setReport({ ...report, clientSignature: signature })}
                                onClear={() => setReport({ ...report, clientSignature: null })}
                                initialData={report.clientSignature}
                            />
                        </div>

                        <div className="text-center text-xs text-gray-500 max-w-md mx-auto leading-relaxed mt-4 bg-emerald-50/30 p-3 rounded-lg border border-emerald-50/50">
                            <p className="font-bold text-emerald-800 mb-1">Confirmação de Execução</p>
                            <p>Ao assinar no campo acima, o cliente declara que o técnico esteve presente no local e realizou os serviços acima descritos de forma satisfatória.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons (Sticky at bottom on Mobile, Relative on Desktop) */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] p-4 flex justify-between gap-3 sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:z-auto sm:bg-transparent sm:backdrop-blur-none sm:border-t-0 sm:shadow-none sm:p-0 sm:mt-10 sm:pt-6 sm:border-t sm:border-gray-100">
                {/* Back / Cancel Button */}
                {step === 1 ? (
                    <button
                        type="button"
                        onClick={() => router.push('/')}
                        className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl font-bold text-gray-600 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition duration-200 text-center"
                    >
                        Cancelar
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        disabled={loading}
                        className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition duration-200 text-center disabled:opacity-50"
                    >
                        Voltar
                    </button>
                )}

                {/* Forward / Save Button */}
                {step < 6 ? (
                    <button
                        type="button"
                        onClick={() => setStep(step + 1)}
                        className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transition duration-200 text-center"
                    >
                        Avançar
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-10 py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-center"
                    >
                        {loading ? 'Salvando...' : isEditing ? 'Atualizar Relatório' : 'Salvar Relatório'}
                    </button>
                )}
            </div>
        </div>
    );
}
