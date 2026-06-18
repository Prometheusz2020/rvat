'use client';

import { deleteReport } from '@/app/actions';
import Link from 'next/link';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { useTransition } from 'react';

export default function ReportActions({ id }: { id: number }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = async () => {
        const confirmed = window.confirm('Tem certeza que deseja EXCLUIR este relatório? Esta ação não pode ser desfeita.');
        if (confirmed) {
            startTransition(async () => {
                await deleteReport(id);
            });
        }
    };

    return (
        <div className="flex flex-wrap gap-2 print:hidden">
            <Link
                href={`/reports/${id}/edit`}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow-sm font-medium"
            >
                <FiEdit className="mr-2" /> Editar
            </Link>

            <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition shadow-sm font-medium disabled:opacity-50"
            >
                <FiTrash2 className="mr-2" />
                {isPending ? 'Excluindo...' : 'Excluir'}
            </button>
        </div>
    );
}
