'use client';

import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

interface WhatsAppShareButtonProps {
    reportId: number;
    reportDate: string;
}

export default function WhatsAppShareButton({
    reportId,
    reportDate,
}: WhatsAppShareButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleShare = async () => {
        setIsGenerating(true);
        try {
            // Dynamically import html2canvas and jspdf to avoid any SSR issues
            const html2canvas = (await import('html2canvas-pro')).default;
            const jsPDF = (await import('jspdf')).default;

            const element = document.getElementById('report-print-area');
            if (!element) {
                alert('Erro: Área de impressão do relatório não encontrada.');
                setIsGenerating(false);
                return;
            }

            // Capture the element using html2canvas
            const canvas = await html2canvas(element, {
                scale: 2, // High resolution
                useCORS: true,
                backgroundColor: '#fcf8b5', // Match the yellow-beige style of the layout
                logging: false,
            });

            // Dimensions of A4 page
            const imgWidth = 210; // mm
            const pageHeight = 297; // mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            
            // Add image to PDF
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // Handle multi-page PDFs if the report overflows A4 height
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const pdfBlob = pdf.output('blob');
            const fileName = `Relatorio_Mocmaq_${reportId}.pdf`;
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

            // Prefilled message text
            const message = `Olá, segue o Relatório de Visita e Assistência Técnica Nº ${reportId} (MOCMAQ) referente ao atendimento de ${reportDate}.`;

            // 1. Try to use Native Sharing (highly effective on mobile devices)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: `Relatório Técnico Nº ${reportId}`,
                        text: message,
                    });
                    setIsGenerating(false);
                    return;
                } catch (shareError) {
                    console.warn('Native share failed, falling back to download + link:', shareError);
                }
            }

            // 2. Fallback: Download the PDF and open WhatsApp Web/App
            // Download PDF
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Open WhatsApp with text (without phone number, so user chooses contact inside WhatsApp)
            const infoText = `${message}\n\n(O arquivo PDF foi baixado em seu dispositivo. Por favor, anexe-o na conversa do WhatsApp).`;
            const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(infoText)}`;
            window.open(whatsappUrl, '_blank');

        } catch (error) {
            console.error('Error generating/sharing PDF:', error);
            alert('Ocorreu um erro ao gerar o PDF do relatório.');
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
