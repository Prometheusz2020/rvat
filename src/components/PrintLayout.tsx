"use client";

import React from 'react';
import { TechnicalReport } from '@/types/report';

interface PrintLayoutProps {
    data: TechnicalReport;
}

export const PrintLayout: React.FC<PrintLayoutProps> = ({ data }) => {
    return (
        <div className="print-container bg-[#fcf8b5] text-black font-sans p-6 max-w-[210mm] mx-auto text-xs border border-gray-300 print:border-none print:m-0 print:w-full print:max-w-none print:p-0">
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>

            {/* Header */}
            <div className="border-2 border-black mb-2">
                <div className="flex">
                    <div className="w-24 p-2 border-r-2 border-black flex items-center justify-center">
                        {/* Logo */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="MOCMAQ Logo" className="w-full h-auto object-contain" />
                    </div>
                    <div className="flex-1 p-2 text-center">
                        <h1 className="text-xl font-bold">MOCMAQ Mococa Máquinas e Equipamentos Ltda.</h1>
                        <p className="text-xs">Rua José Oleto, 660 - Distrito Industrial II - Mococa - SP - CEP: 13.739-070</p>
                        <p className="text-xs">Fone/Fax: 55 (19) 3665-6097 - vendas@mocmaq.com - www.mocmaq.com</p>
                    </div>
                </div>
                <div className="border-t-2 border-black p-1 flex justify-between items-center bg-[#f0d09c]">
                    <h2 className="font-bold text-lg w-full text-center">RELATÓRIO DE VISITA E ASSISTÊNCIA TÉCNICA</h2>
                    <div className="whitespace-nowrap font-bold px-2 text-red-600 text-base">
                        Nº <span className="text-black inline-block min-w-[50px] border-b border-black text-center">{data.reportNumber}</span>
                    </div>
                </div>
            </div>

            {/* Client Info */}
            <div className="border-2 border-black mb-2 text-xs">
                <div className="flex border-b border-black">
                    <div className="w-1/4 p-1 border-r border-black">CÓDIGO: {data.client.code}</div>
                    <div className="flex-1 p-1 border-r border-black">CLIENTE: {data.client.name}</div>
                    <div className="w-1/4 p-1">FONE: {data.client.phone}</div>
                </div>
                <div className="flex border-b border-black">
                    <div className="flex-1 p-1 border-r border-black">RUA / Nº / BAIRRO: {data.client.address}</div>
                    <div className="w-1/4 p-1">CIDADE: {data.client.city}</div>
                </div>
                <div className="flex">
                    <div className="flex-1 p-1 border-r border-black">NOME DO CONTATO: {data.client.contact}</div>
                    <div className="w-1/3 p-1">E-MAIL: {data.client.email}</div>
                </div>
            </div>

            {/* Transport & Expenses Grid */}
            <div className="flex border-2 border-black mb-2 text-xs">
                {/* Transport Column */}
                <div className="w-1/2 border-r-2 border-black">
                    <div className="bg-[#dcbfa3] font-bold text-center border-b border-black p-1">TIPO DE TRANSPORTE</div>
                    <div className="grid grid-cols-[1fr_auto]">
                        <div className="p-1 border-b border-r border-black">Data da Saída</div>
                        <div className="p-1 border-b border-black w-24">{data.transport.departureDate}</div>

                        <div className="p-1 border-b border-r border-black">Data da Chegada</div>
                        <div className="p-1 border-b border-black">{data.transport.arrivalDate}</div>

                        <div className="p-1 border-b border-r border-black">Km Saída</div>
                        <div className="p-1 border-b border-black">{data.transport.departureKm}</div>

                        <div className="p-1 border-b border-r border-black">Km Chegada</div>
                        <div className="p-1 border-b border-black">{data.transport.arrivalKm}</div>

                        <div className="p-1 border-b border-r border-black font-bold">Total Km</div>
                        <div className="p-1 border-b border-black font-bold">{data.transport.totalKm}</div>

                        <div className="p-1 border-b border-r border-black">Hora Saída</div>
                        <div className="p-1 border-b border-black">{data.transport.departureTime}</div>

                        <div className="p-1 border-b border-r border-black">Hora Chegada</div>
                        <div className="p-1 border-b border-black">{data.transport.arrivalTime}</div>

                        <div className="p-1 border-r border-black font-bold">Total Horas</div>
                        <div className="p-1 font-bold">{data.transport.totalHours}</div>
                    </div>
                </div>

                {/* Expenses Column */}
                <div className="w-1/2">
                    <div className="bg-[#dcbfa3] font-bold text-center border-b border-black p-1">DESPESAS</div>
                    <div className="grid grid-cols-[1fr_auto]">
                        <div className="p-1 border-b border-r border-black">Adiantamentos</div>
                        <div className="p-1 border-b border-black w-24">R$ {data.expenses.advances}</div>

                        <div className="p-1 border-b border-r border-black">Combustível</div>
                        <div className="p-1 border-b border-black">R$ {data.expenses.fuel}</div>

                        <div className="p-1 border-b border-r border-black">Hotel</div>
                        <div className="p-1 border-b border-black">R$ {data.expenses.hotel}</div>

                        <div className="p-1 border-b border-r border-black">Refeições</div>
                        <div className="p-1 border-b border-black">R$ {data.expenses.meals}</div>

                        <div className="p-1 border-b border-r border-black">Pedágio</div>
                        <div className="p-1 border-b border-black">R$ {data.expenses.tolls}</div>

                        <div className="p-1 border-b border-r border-black">Passagens</div>
                        <div className="p-1 border-b border-black">R$ {data.expenses.tickets}</div>

                        <div className="p-1 border-b border-r border-black">Outras</div>
                        <div className="p-1 border-b border-black">R$ {data.expenses.others}</div>

                        <div className="p-1 border-b border-r border-black">Diversos</div>
                        <div className="p-1 border-b border-black">R$ {data.expenses.sundry}</div>

                        <div className="p-1 border-r border-black font-bold bg-[#f0d09c]">TOTAL</div>
                        <div className="p-1 font-bold bg-[#f0d09c]">R$ {data.expenses.total}</div>
                    </div>
                </div>
            </div>

            {/* Service Hours Table */}
            <div className="border-2 border-black mb-2 text-xs">
                <div className="bg-[#dcbfa3] font-bold text-center border-b border-black p-1">SERVIÇOS / HORA — CLIENTE</div>
                <div className="grid grid-cols-8 text-center">
                    <div className="border-b border-r border-black p-1 font-bold">DIA</div>
                    <div className="border-b border-r border-black p-1 font-bold">ENT.</div>
                    <div className="border-b border-r border-black p-1 font-bold">SAÍ.</div>
                    <div className="border-b border-r border-black p-1 font-bold">TOT.</div>
                    <div className="border-b border-r border-black p-1 font-bold">DIA</div>
                    <div className="border-b border-r border-black p-1 font-bold">ENT.</div>
                    <div className="border-b border-r border-black p-1 font-bold">SAÍ.</div>
                    <div className="border-b border-black p-1 font-bold">TOT.</div>

                    {/* First 4 entries */}
                    {data.serviceHours.map((entry, i) => (
                        <React.Fragment key={i}>
                            <div className="border-r border-b border-black p-1 h-6">{entry.day}</div>
                            <div className="border-r border-b border-black p-1 h-6">{entry.in}</div>
                            <div className="border-r border-b border-black p-1 h-6">{entry.out}</div>
                            <div className={`${(i + 1) % 4 === 0 ? 'border-b' : 'border-r border-b'} border-black p-1 h-6`}>{entry.total}</div>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Description */}
            <div className="border-2 border-black mb-1 text-xs flex-1">
                <div className="bg-[#fcf8b5] p-1 border-b border-black font-bold">Descrição da Solicitação:</div>
                <div className="p-1 min-h-[60px] whitespace-pre-wrap leading-normal">{data.description}</div>
            </div>

            {/* Matters Treated */}
            <div className="border-2 border-black mb-1 text-xs flex-1">
                <div className="bg-[#fcf8b5] p-1 border-b border-black font-bold">Assuntos Tratados:</div>
                <div className="p-1 min-h-[100px] whitespace-pre-wrap leading-normal">{data.mattersTreated}</div>
            </div>

            {/* Client Observations */}
            <div className="border-2 border-black mb-1 text-xs flex-1">
                <div className="bg-[#fcf8b5] p-1 border-b border-black font-bold">Observações do Cliente:</div>
                <div className="p-1 min-h-[40px] whitespace-pre-wrap leading-normal">{data.clientObservations}</div>
            </div>

            {/* Footer Signatures */}
            <div className="border-2 border-black p-2 mt-4 text-xs">
                <div className="flex justify-between items-end mb-4">
                    <div className="w-1/3">
                        <div>Técnico: <span className="font-bold">{data.technicianName}</span></div>
                    </div>
                    <div className="w-1/3 text-right">
                        Data: <span className="underline decoration-1 underline-offset-4">{data.date}</span>
                    </div>
                </div>

                <div className="flex justify-between gap-4 mt-8 text-center font-bold">
                    <div className="flex-1 border-t border-black pt-1 flex flex-col items-center justify-end min-h-[40px] relative mt-12">
                        {data.clientSignature ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={data.clientSignature} alt="Assinatura do Cliente" className="h-16 object-contain absolute bottom-full left-1/2 -translate-x-1/2 mb-1" />
                        ) : null}
                        <span className="z-10">Ass. Cliente</span>
                    </div>
                    <div className="flex-1 border-t border-black pt-1 flex flex-col items-center justify-end min-h-[40px] mt-12">Ass. Resp. Viagem</div>
                    <div className="flex-1 border-t border-black pt-1 flex flex-col items-center justify-end min-h-[40px] mt-12">Ass. Supervisor</div>
                </div>

                <div className="text-[10px] mt-2 text-gray-600 text-center">
                    1ª VIA - CLIENTE — 2ª VIA - FINANCEIRO — 3ª VIA - TÉCNICO (FIXA)
                </div>
            </div>


        </div>
    );
};
