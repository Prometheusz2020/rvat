import ClientForm from '@/components/ClientForm';

export default function NewClientPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Cadastrar Novo Cliente</h1>
                <ClientForm />
            </div>
        </div>
    );
}
