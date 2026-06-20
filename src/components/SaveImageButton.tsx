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

            // Convert canvas to PNG blob
            const imageBlob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob((blob) => resolve(blob), 'image/png');
            });

            if (!imageBlob) {
                alert('Erro ao gerar a imagem do relatório.');
                return;
            }

            const fileName = `Relatorio_Mocmaq_${reportId}.png`;
            const imageFile = new File([imageBlob], fileName, { type: 'image/png' });

            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            // ─── Mobile: Native Share Sheet (shares PNG directly so user can click "Save Image" to gallery) ───
            if (isMobile && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
                try {
                    await navigator.share({
                        files: [imageFile],
                        title: `Relatório Técnico Nº ${reportId}`,
                    });
                    return; // Opened native share sheet successfully (where they can choose "Save Image")
                } catch (shareErr) {
                    if (shareErr instanceof Error && shareErr.name === 'AbortError') {
                        return;
                    }
                    console.warn('Native share failed, falling back to blob URL:', shareErr);
                }
            }

            // ─── Desktop / Mobile Fallback: Download via safe Blob URL ───
            const blobUrl = URL.createObjectURL(imageBlob);

            if (isMobile) {
                // If sharing failed on mobile, open the blob URL in a new tab so they can hold-press and save it
                window.open(blobUrl, '_blank');
            } else {
                // Desktop: standard download using safe Blob URL
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            // Clean up the URL object to free memory after a short delay
            setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

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
