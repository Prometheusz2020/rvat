import ClientForm from '@/components/ClientForm';
import { getClient } from '@/app/actions';
import { notFound } from 'next/navigation';

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const client = await getClient(parseInt(id));

    if (!client) return notFound();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Cliente</h1>
                <ClientForm initialData={client} />
            </div>
        </div>
    );
}
