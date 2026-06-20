'use client';

import React, { useState } from 'react';
import { FiDownload } from 'react-icons/fi';

interface SaveImageButtonProps {
    reportId: string;
}

export default function SaveImageButton({ reportId }: SaveImageButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleSave = async () => {
        setIsGenerating(true);

        try {
            // Dynamically import heavy libs (avoids SSR issues)
            const html2canvas = (await import('html2canvas-pro')).default;

            const element = document.getElementById('report-print-area');
            if (!element) {
                alert('Erro: área do relatório não encontrada.');
                return;
            }

            // Capture the report element at 2x resolution
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#fcf8b5',
                logging: false,
            });

            // Convert to PNG data URL
            const imgData = canvas.toDataURL('image/png');

            // Trigger browser download
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `Relatorio_Mocmaq_${reportId}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            console.error('Erro ao baixar imagem:', err);
            alert('Erro ao gerar a imagem para download.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={handleSave}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow transition font-medium disabled:opacity-70 disabled:cursor-not-allowed text-sm"
        >
            <FiDownload className="text-lg" />
            {isGenerating ? 'Gerando Imagem...' : 'Salvar como Imagem'}
        </button>
    );
}
