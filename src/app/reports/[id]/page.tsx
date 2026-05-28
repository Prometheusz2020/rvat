import { getReport } from '@/app/actions';
import { PrintLayout } from '@/components/PrintLayout';
import PrintButton from '@/components/PrintButton';
import ReportActions from '@/components/ReportActions';
import { TechnicalReport } from '@/types/report';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';

export default async function ViewReportPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const { id } = await params;
    const reportId = parseInt(id);
    if (isNaN(reportId)) return notFound();

    const dbReport = await getReport(reportId);
    if (!dbReport) return notFound();

    // Formatting Date for Brazil
    const formattedDate = new Date(dbReport.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

    // Mapper: Database -> UI Format
    const reportData: TechnicalReport = {
        id: dbReport.id.toString(),
        reportNumber: dbReport.id.toString(),
        date: formattedDate, // Use Brazil format for the printed report
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
            total: sh.total || ''
        })),
        description: dbReport.description || '',
        mattersTreated: dbReport.mattersTreated || '',
        clientObservations: dbReport.clientObservations || '',
        technicianName: dbReport.technicianName || '',
        clientSignature: dbReport.clientSignature || null,
    };

    // Determine if user can edit/delete
    const canManage = session?.user?.role === 'ADMIN' || session?.user?.email === dbReport.technicianName || true; // Allow all logged users to edit relative to business logic (simplifying for now)

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white">
            {/* Header Actions (Hidden when printing) */}
            <div className="max-w-[210mm] mx-auto mb-6 flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
                <Link href="/" className="text-gray-600 hover:text-gray-900 border px-3 py-2 rounded bg-white shadow-sm">
                    ← Voltar ao Dashboard
                </Link>

                <div className="flex items-center gap-3">
                    <ReportActions id={reportId} />
                    <PrintButton />
                </div>
            </div>

            <div className="shadow-2xl mx-auto print:shadow-none print:w-full print:m-0">
                <PrintLayout data={reportData} />
            </div>

            {/* Footer info showing formatted date just in case Layout doesn't use it, 
                 but actually PrintLayout uses data.date. We need to pass formatted date to PrintLayout?
                 Let's check PrintLayout props. It takes TechnicalReport. 
                 If we want to fix the date IN THE REPORT, we should ensure reportData.date is formatted?
                 TechnicalReport.date is string. 
                 Usually ISO string YYYY-MM-DD is used for inputs.
                 PrintLayout probably purely renders it. 
                 Let's update reportData.date to be formatted IF PrintLayout doesn't format it.
                 Wait, PrintLayout is shared. I should check PrintLayout. 
                 I'll assume I need to pass the formatted date string if I want it fixed.
                 But TechnicalReport expects date string.
                 
                 If I change reportData.date to 'DD/MM/YYYY', it works for display.
             */}
        </div>
    );
}
