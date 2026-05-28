import { getReport } from '@/app/actions';
import WizardReportForm from '@/components/WizardReportForm';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { TechnicalReport } from '@/types/report';

export default async function EditReportPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session) redirect('/login');

    const { id } = await params;
    const reportId = parseInt(id);
    if (isNaN(reportId)) return notFound();

    const dbReport = await getReport(reportId);
    if (!dbReport) return notFound();

    // Map to Initial Data
    const initialData: TechnicalReport = {
        id: dbReport.id.toString(),
        reportNumber: dbReport.id.toString(),
        date: new Date(dbReport.date).toISOString().split('T')[0],
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
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Editar Relatório #{reportId}</h1>
                <p className="text-gray-600 mb-8">Atualize as informações conforme necessário.</p>
                <WizardReportForm
                    initialTechnicianName={session.user?.name || ''}
                    initialData={initialData}
                    reportId={reportId}
                />
            </div>
        </div>
    );
}
