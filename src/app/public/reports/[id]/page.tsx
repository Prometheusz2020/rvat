import { getPublicReport } from '@/app/actions';
import { PrintLayout } from '@/components/PrintLayout';
import PrintButton from '@/components/PrintButton';
import { TechnicalReport } from '@/types/report';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function PublicReportPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ token?: string }>;
}) {
    const { id } = await params;
    const { token } = await searchParams;
    const reportId = parseInt(id);

    if (isNaN(reportId) || !token) return notFound();

    const dbReport = await getPublicReport(reportId, token);
    if (!dbReport) return notFound();

    // Formatting Date for Brazil
    const formattedDate = new Date(dbReport.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

    // Mapper: Database -> UI Format
    const reportData: TechnicalReport = {
        id: dbReport.id.toString(),
        reportNumber: dbReport.id.toString(),
        date: formattedDate,
        client: {
            name: dbReport.client.name,
            code: dbReport.client.code || '',
            cnpj: dbReport.client.cnpj || '',
            phone: dbReport.client.phone || '',
            email: dbReport.client.email || '',
            address: dbReport.client.address || '',
            city: dbReport.client.city || '',
            contact: dbReport.client.contact || '',
        },
        transport: {
            departureDate: dbReport.departureDate ? new Date(dbReport.departureDate).toISOString().split('T')[0] : '',
            arrivalDate: dbReport.arrivalDate ? new Date(dbReport.arrivalDate).toISOString().split('T')[0] : '',
            departureKm: dbReport.departureKm || 0,
            arrivalKm: dbReport.arrivalKm || 0,
            totalKm: dbReport.totalKm || 0,
            departureTime: dbReport.departureTime || '',
            arrivalTime: dbReport.arrivalTime || '',
            totalHours: dbReport.totalHours || '',
        },
        expenses: {
            advances: dbReport.expensesAdvances || 0,
            fuel: dbReport.expensesFuel || 0,
            hotel: dbReport.expensesHotel || 0,
            meals: dbReport.expensesMeals || 0,
            tolls: dbReport.expensesTolls || 0,
            tickets: dbReport.expensesTickets || 0,
            others: dbReport.expensesOthers || 0,
            sundry: dbReport.expensesSundry || 0,
            total: dbReport.expensesTotal || 0,
        },
        serviceHours: dbReport.serviceHours.map(sh => ({
            day: sh.day || '',
            in: sh.in || '',
            out: sh.out || '',
            total: sh.total || '',
        })),
        description: dbReport.description || '',
        mattersTreated: dbReport.mattersTreated || '',
        clientObservations: dbReport.clientObservations || '',
        technicianName: dbReport.technicianName || '',
        clientSignature: dbReport.clientSignature || null,
    };

    return (
        <div className="min-h-screen bg-gray-100 py-6 print:p-0 print:bg-white flex flex-col items-center">
            {/* Header Actions (Hidden when printing) */}
            <div className="w-full max-w-[210mm] mx-auto mb-4 flex flex-col sm:flex-row justify-between items-center gap-3 print:hidden px-4">
                <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-500">Relatório Técnico MOCMAQ</p>
                    <p className="font-semibold text-gray-800">Nº {reportData.reportNumber} — {formattedDate}</p>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3">
                    <Link
                        href="https://mocmaq.com"
                        target="_blank"
                        className="text-gray-600 hover:text-gray-900 border px-3 py-2 rounded bg-white shadow-sm text-sm"
                    >
                        mocmaq.com
                    </Link>
                    <PrintButton />
                </div>
            </div>

            {/* A4 Document */}
            <div className="w-full flex justify-center print:block">
                <div className="print:w-full print:m-0">
                    <PrintLayout data={reportData} />
                </div>
            </div>

            {/* Disclaimer */}
            <p className="mt-6 mb-3 text-xs text-gray-400 print:hidden text-center px-4">
                Este relatório foi compartilhado via link seguro pela MOCMAQ Mococa Máquinas e Equipamentos Ltda.
            </p>
        </div>
    );
}
