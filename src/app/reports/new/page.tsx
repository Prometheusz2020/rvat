import WizardReportForm from '@/components/WizardReportForm';
import { auth } from '@/auth';

export default async function NewReportPage() {
    const session = await auth();
    const technicianName = session?.user?.name || '';

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Novo Relatório</h1>
                <p className="text-gray-600 mb-8">Preencha as informações passo a passo.</p>
                <WizardReportForm initialTechnicianName={technicianName} />
            </div>
        </div>
    );
}
