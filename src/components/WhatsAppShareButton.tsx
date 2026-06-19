'use client';

import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

interface WhatsAppShareButtonProps {
    reportId: number;
    reportDate: string;
    token: string;
}

export default function WhatsAppShareButton({
    reportId,
    reportDate,
    token,
}: WhatsAppShareButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleShare = async () => {
        setIsGenerating(true);

        try {
            // Dynamically import heavy libs (avoids SSR issues)
            const html2canvas = (await import('html2canvas-pro')).default;
            const jsPDF = (await import('jspdf')).default;

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

            // Build A4 PDF
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const imgData = canvas.toDataURL('image/jpeg', 0.95);

            let heightLeft = imgHeight;
            let position = 0;
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            while (heightLeft > 0) {
                position -= pageHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const pdfBlob = pdf.output('blob');
            const fileName = `Relatorio_Mocmaq_${reportId}.pdf`;
            const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

            const message = `Relatório de Visita e Assistência Técnica Nº ${reportId} (MOCMAQ) — ${reportDate}`;

            // ─── Mobile: Native Share Sheet (same as banks) ────────────────
            if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
                await navigator.share({
                    files: [pdfFile],
                    title: `Relatório Técnico Nº ${reportId}`,
                    text: message,
                });
                return;
            }

            // ─── Desktop fallback: share the secure public link ─────────────
            const publicUrl = `${window.location.origin}/public/reports/${reportId}?token=${token}`;
            const fullMessage = `${message}\n\nVisualize o relatório completo: ${publicUrl}`;
            const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullMessage)}`;
            window.open(whatsappUrl, '_blank');

        } catch (err: unknown) {
            // User cancelled the share dialog — don't show an error
            if (err instanceof Error && err.name === 'AbortError') return;
            console.error('Erro ao compartilhar relatório:', err);
            alert('Ocorreu um erro ao gerar o relatório. Tente novamente.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={handleShare}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded shadow hover:bg-[#20ba5a] transition font-medium disabled:opacity-70 disabled:cursor-not-allowed"
        >
            <FaWhatsapp className="text-lg" />
            {isGenerating ? 'Gerando PDF...' : 'Enviar por WhatsApp'}
        </button>
    );
}
