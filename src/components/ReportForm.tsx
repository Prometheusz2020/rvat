'use client';
import React, { useState, useEffect } from 'react';
import { TechnicalReport, initialReport } from '@/types/report';
import { PrintLayout } from './PrintLayout';

export default function ReportForm() {
    const [report, setReport] = useState<TechnicalReport>(initialReport);
    const [showPreview, setShowPreview] = useState(false);

    // Auto-calculation effect
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

            // Avoid infinite loop if nothing changed
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

    const updateTransport = (field: string, value: string | number) => {
        setReport(prev => ({ ...prev, transport: { ...prev.transport, [field]: value } }));
    };

    const updateExpense = (field: string, value: number) => {
        setReport(prev => ({ ...prev, expenses: { ...prev.expenses, [field]: value } }));
    };

    const updateServiceHour = (index: number, field: string, value: string) => {
        const newServiceHours = [...report.serviceHours];
        newServiceHours[index] = { ...newServiceHours[index], [field]: value };
        setReport(prev => ({ ...prev, serviceHours: newServiceHours }));
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
            {/* Input Form - Hidden when printing */}
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 mb-8 print:hidden">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Gerador de Relatório de Visita</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Header Info */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded text-sm">
                        <div>
                            <label className="block text-gray-700 font-bold mb-1">Nº Relatório</label>
                            <input type="text" className="w-full border p-2 rounded" value={report.reportNumber} onChange={e => setReport({ ...report, reportNumber: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-bold mb-1">Data</label>
                            <input type="date" className="w-full border p-2 rounded" value={report.date} onChange={e => setReport({ ...report, date: e.target.value })} />
                        </div>
                    </div>

                    {/* Client Details */}
                    <div className="md:col-span-2 border rounded p-4">
                        <h3 className="font-bold text-gray-700 mb-2">Dados do Cliente</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div><label className="block mb-1">Código</label><input className="w-full border p-1 rounded" value={report.client.code} onChange={e => updateClient('code', e.target.value)} /></div>
                            <div className="md:col-span-2"><label className="block mb-1">Cliente</label><input className="w-full border p-1 rounded" value={report.client.name} onChange={e => updateClient('name', e.target.value)} /></div>
                            <div><label className="block mb-1">Telefone</label><input className="w-full border p-1 rounded" value={report.client.phone} onChange={e => updateClient('phone', e.target.value)} /></div>
                            <div><label className="block mb-1">Cidade</label><input className="w-full border p-1 rounded" value={report.client.city} onChange={e => updateClient('city', e.target.value)} /></div>
                            <div><label className="block mb-1">Contato</label><input className="w-full border p-1 rounded" value={report.client.contact} onChange={e => updateClient('contact', e.target.value)} /></div>
                            <div className="md:col-span-3"><label className="block mb-1">Endereço</label><input className="w-full border p-1 rounded" value={report.client.address} onChange={e => updateClient('address', e.target.value)} /></div>
                        </div>
                    </div>

                    {/* Transport */}
                    <div className="border rounded p-4">
                        <h3 className="font-bold text-gray-700 mb-2">Transporte</h3>
                        <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="block mb-1">Saída (Data)</label><input type="date" className="w-full border p-1" value={report.transport.departureDate} onChange={e => updateTransport('departureDate', e.target.value)} /></div>
                                <div><label className="block mb-1">Chegada (Data)</label><input type="date" className="w-full border p-1" value={report.transport.arrivalDate} onChange={e => updateTransport('arrivalDate', e.target.value)} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="block mb-1">Km Saída</label><input type="number" className="w-full border p-1" value={report.transport.departureKm} onChange={e => updateTransport('departureKm', parseFloat(e.target.value))} /></div>
                                <div><label className="block mb-1">Km Chegada</label><input type="number" className="w-full border p-1" value={report.transport.arrivalKm} onChange={e => updateTransport('arrivalKm', parseFloat(e.target.value))} /></div>
                            </div>
                            <div><label className="block mb-1">Total Km (Auto)</label><input disabled className="w-full border p-1 bg-gray-100" value={report.transport.totalKm} /></div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="block mb-1">Hora Saída</label><input type="time" className="w-full border p-1" value={report.transport.departureTime} onChange={e => updateTransport('departureTime', e.target.value)} /></div>
                                <div><label className="block mb-1">Hora Chegada</label><input type="time" className="w-full border p-1" value={report.transport.arrivalTime} onChange={e => updateTransport('arrivalTime', e.target.value)} /></div>
                            </div>
                            <div><label className="block mb-1">Total Horas</label><input className="w-full border p-1" value={report.transport.totalHours} onChange={e => updateTransport('totalHours', e.target.value)} /></div>
                        </div>
                    </div>

                    {/* Expenses */}
                    <div className="border rounded p-4">
                        <h3 className="font-bold text-gray-700 mb-2">Despesas (R$)</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            {Object.keys(report.expenses).filter(k => k !== 'total').map((key) => (
                                <div key={key}>
                                    <label className="block mb-1 capitalize">{key === 'tolls' ? 'Pedágios' : key}</label>
                                    <input type="number" step="0.01" className="w-full border p-1 rounded"
                                        value={report.expenses[key as keyof typeof report.expenses]}
                                        onChange={e => updateExpense(key, parseFloat(e.target.value))} />
                                </div>
                            ))}
                            <div className="col-span-2 mt-2">
                                <label className="font-bold">Total Despesas</label>
                                <input disabled className="w-full border p-1 bg-gray-100 font-bold" value={`R$ ${report.expenses.total.toFixed(2)}`} />
                            </div>
                        </div>
                    </div>

                    {/* Service Hours */}
                    <div className="md:col-span-2 border rounded p-4">
                        <h3 className="font-bold text-gray-700 mb-2">Serviços / Hora</h3>
                        <div className="grid grid-cols-4 gap-2 mb-1 font-bold text-xs text-center bg-gray-100 p-1">
                            <div>Dia</div><div>Entrada</div><div>Saída</div><div>Total</div>
                        </div>
                        {report.serviceHours.map((row, i) => (
                            <div key={i} className="grid grid-cols-4 gap-2 mb-2 text-sm">
                                <input className="border p-1" placeholder="Dia" value={row.day} onChange={e => updateServiceHour(i, 'day', e.target.value)} />
                                <input type="time" className="border p-1" value={row.in} onChange={e => updateServiceHour(i, 'in', e.target.value)} />
                                <input type="time" className="border p-1" value={row.out} onChange={e => updateServiceHour(i, 'out', e.target.value)} />
                                <input className="border p-1" placeholder="Total" value={row.total} onChange={e => updateServiceHour(i, 'total', e.target.value)} />
                            </div>
                        ))}
                    </div>

                    {/* Text Areas */}
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <label className="font-bold block mb-1">Descrição da Solicitação</label>
                            <textarea className="w-full border p-2 rounded h-20" value={report.description} onChange={e => setReport({ ...report, description: e.target.value })} />
                        </div>
                        <div>
                            <label className="font-bold block mb-1">Assuntos Tratados</label>
                            <textarea className="w-full border p-2 rounded h-32" value={report.mattersTreated} onChange={e => setReport({ ...report, mattersTreated: e.target.value })} />
                        </div>
                        <div>
                            <label className="font-bold block mb-1">Observações do Cliente</label>
                            <textarea className="w-full border p-2 rounded h-20" value={report.clientObservations} onChange={e => setReport({ ...report, clientObservations: e.target.value })} />
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-bold mb-1">Técnico</label>
                            <input className="w-full border p-2 rounded" value={report.technicianName} onChange={e => setReport({ ...report, technicianName: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-4 border-t pt-4">
                    <button onClick={() => setShowPreview(!showPreview)} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                        {showPreview ? 'Esconder Preview' : 'Ver Preview / Imprimir'}
                    </button>
                    <button onClick={() => setReport(initialReport)} className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
                        Limpar
                    </button>
                </div>
            </div>

            {/* Preview / Print Section */}
            {(showPreview || true) && (
                <div className={`shadow-2xl mx-auto print:shadow-none print:w-full ${showPreview ? 'block' : 'hidden print:block'}`}>
                    <PrintLayout data={report} />
                </div>
            )}
        </div>
    );
}
