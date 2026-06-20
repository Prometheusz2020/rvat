'use client';

import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

interface WhatsAppShareButtonProps {
    reportId: number;
    reportDate: string;
    token: string;
    clientPhone?: string;
}

export default function WhatsAppShareButton({
    reportId,
    reportDate,
    token,
    clientPhone,
}: WhatsAppShareButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleShare = async () => {
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

            const message = `Relatório de Visita e Assistência Técnica Nº ${reportId} (MOCMAQ) — ${reportDate}`;

            // ─── Mobile: Native Share Sheet (shares PNG directly) ────────────
            if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
                await navigator.share({
                    files: [imageFile],
                    title: `Relatório Técnico Nº ${reportId}`,
                    text: message,
                });
                return;
            }

            // ─── Desktop fallback: Clipboard + WhatsApp URL ─────────────
            let clipboardSuccess = false;
            try {
                if (navigator.clipboard && window.ClipboardItem) {
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            [imageBlob.type]: imageBlob
                        })
                    ]);
                    clipboardSuccess = true;
                }
            } catch (clipboardErr) {
                console.error('Falha ao copiar imagem para área de transferência:', clipboardErr);
            }

            const cleanPhone = clientPhone ? clientPhone.replace(/\D/g, '') : '';
            let formattedPhone = '';
            if (cleanPhone) {
                formattedPhone = cleanPhone.length === 10 || cleanPhone.length === 11 ? `55${cleanPhone}` : cleanPhone;
            }

            const publicUrl = `${window.location.origin}/public/reports/${reportId}?token=${token}`;
            const fullMessage = `${message}\n\nVisualize o relatório online completo: ${publicUrl}`;

            const whatsappUrl = formattedPhone 
                ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(fullMessage)}`
                : `https://api.whatsapp.com/send?text=${encodeURIComponent(fullMessage)}`;

            if (clipboardSuccess) {
                alert('Imagem do relatório copiada para a área de transferência!\n\nAbrindo o WhatsApp... Quando a conversa abrir, aperte Ctrl+V para enviar a imagem do relatório diretamente.');
            } else {
                alert('Não foi possível copiar a imagem automaticamente. Abrindo o WhatsApp com o link do relatório.');
            }

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
            {isGenerating ? 'Gerando Imagem...' : 'Enviar por WhatsApp'}
        </button>
    );
}
