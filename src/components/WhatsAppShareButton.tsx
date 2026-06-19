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
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = () => {
        setIsSharing(true);
        try {
            // Generate the secure public URL for this report
            const publicUrl = `${window.location.origin}/public/reports/${reportId}?token=${token}`;

            // Prefilled message text with the public link
            const message = `Olá! Segue o Relatório de Visita e Assistência Técnica Nº ${reportId} (MOCMAQ) referente ao atendimento de ${reportDate}.\n\nVocê pode visualizar o relatório completo pelo link abaixo:\n${publicUrl}`;

            // Open WhatsApp with the message (user selects the contact inside WhatsApp)
            const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded shadow hover:bg-[#20ba5a] transition font-medium disabled:opacity-70 disabled:cursor-not-allowed"
        >
            <FaWhatsapp className="text-lg" />
            Enviar por WhatsApp
        </button>
    );
}
