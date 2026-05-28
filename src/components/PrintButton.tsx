'use client';

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
            Imprimir (Ctrl + P)
        </button>
    );
}
