'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { TechnicalReport } from '@/types/report';
import { redirect } from 'next/navigation';

// Get recent reports for dashboard with filters
export async function getReports(filters?: { clientName?: string; startDate?: string; endDate?: string }, limit = 50) {
    const where: any = {};

    if (filters?.clientName) {
        where.client = {
            name: { contains: filters.clientName, mode: 'insensitive' }
        };
    }

    if (filters?.startDate || filters?.endDate) {
        where.date = {};
        if (filters.startDate) where.date.gte = new Date(filters.startDate);
        if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    const reports = await prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { client: true },
        take: limit,
    });
    return reports;
}

// Get Dashboard Stats
export async function getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [totalReports, monthReports] = await Promise.all([
        prisma.report.count(),
        prisma.report.count({
            where: {
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        })
    ]);

    return { totalReports, monthReports };
}

// Get Recent Reports (Top 5)
export async function getRecentReports() {
    return await prisma.report.findMany({
        orderBy: { createdAt: 'desc' },
        include: { client: true },
        take: 5,
    });
}

// Get single report for viewing/editing
export async function getReport(id: number) {
    const report = await prisma.report.findUnique({
        where: { id },
        include: { client: true, serviceHours: true },
    });
    return report;
}

// Search Clients for Modal
export async function searchClients(query: string) {
    if (!query) return [];

    // Search by Name or CNPJ
    const clients = await prisma.client.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { cnpj: { contains: query } }
            ]
        },
        take: 10,
        orderBy: { name: 'asc' }
    });
    return clients;
}

// Create new report
export async function createReport(data: TechnicalReport) {
    // 1. Find or create client
    let clientId = undefined;

    // Logic: Prefer finding by existing client details (Name/CNPJ?)
    // If user selected from Modal, we might have the ID if we passed it?
    // But our TechnicalReport type currently doesn't store Client ID, just fields.
    // We should try to find by Name+CNPJ match or Name match.
    // For safety: If user typed manually, we might create duplicate if slightly different.
    // If user searched, we should ideally use that ID.
    // But let's stick to Name-based or Code-based finding if consistent.
    // User asked to REMOVE Code field.
    // So we rely on Name or CNPJ.
    // We'll try to find by Name + CNPJ.

    // Note: 'data.client.code' might be empty now if removed from UI.

    let existingClient = null;

    if (data.client.name) {
        existingClient = await prisma.client.findFirst({
            where: {
                name: { equals: data.client.name, mode: 'insensitive' },
                // If we add CNPJ to type:
            }
        });
    }

    // Wait, TechnicalReport Type needs update to include CNPJ?
    // User didn't ask to update type, but we should.
    // Assuming we add cnpj to data.client in type.

    // Using explicit create to handle new logic:
    if (existingClient) {
        clientId = existingClient.id;
        // Should we update the existing client contact/phone?
        // Yes, updating contact info is useful.
        await prisma.client.update({
            where: { id: clientId },
            data: {
                phone: data.client.phone,
                email: data.client.email, // Added email
                address: data.client.address,
                city: data.client.city,
                contact: data.client.contact,
                // code: no update code
                cnpj: data.client.cnpj, // Update CNPJ if changed
            }
        });
    } else {
        const newClient = await prisma.client.create({
            data: {
                code: data.client.code || 'AUTO', // or generate one
                name: data.client.name,
                cnpj: data.client.cnpj, // Added CNPJ
                phone: data.client.phone,
                email: data.client.email, // Added email
                address: data.client.address,
                city: data.client.city,
                contact: data.client.contact,
                // We need to support CNPJ if we add it to input.
            }
        });
        clientId = newClient.id;
    }

    // 2. Create Report
    const newReport = await prisma.report.create({
        data: {
            clientId,
            date: new Date(data.date || new Date()),

            departureDate: data.transport.departureDate ? new Date(data.transport.departureDate) : null,
            arrivalDate: data.transport.arrivalDate ? new Date(data.transport.arrivalDate) : null,
            departureKm: Number(data.transport.departureKm) || 0,
            arrivalKm: Number(data.transport.arrivalKm) || 0,
            totalKm: Number(data.transport.totalKm) || 0,
            departureTime: data.transport.departureTime,
            arrivalTime: data.transport.arrivalTime,
            totalHours: data.transport.totalHours,

            expensesAdvances: Number(data.expenses.advances) || 0,
            expensesFuel: Number(data.expenses.fuel) || 0,
            expensesHotel: Number(data.expenses.hotel) || 0,
            expensesMeals: Number(data.expenses.meals) || 0,
            expensesTolls: Number(data.expenses.tolls) || 0,
            expensesTickets: Number(data.expenses.tickets) || 0,
            expensesOthers: Number(data.expenses.others) || 0,
            expensesSundry: Number(data.expenses.sundry) || 0,
            expensesTotal: Number(data.expenses.total) || 0,

            description: data.description,
            mattersTreated: data.mattersTreated,
            clientObservations: data.clientObservations,
            technicianName: data.technicianName,
            clientSignature: data.clientSignature,

            serviceHours: {
                create: data.serviceHours.map(sh => ({
                    day: sh.day,
                    in: sh.in,
                    out: sh.out,
                    total: sh.total
                }))
            }
        }
    });

    revalidatePath('/');
    return newReport;
}

// Update existing report
export async function updateReport(id: number, data: TechnicalReport) {
    let clientId = undefined;

    // Find client by name (since we rely on name mainly now)
    if (data.client.name) {
        const existing = await prisma.client.findFirst({
            where: { name: { equals: data.client.name, mode: 'insensitive' } }
        });
        clientId = existing?.id;
    }

    if (!clientId) {
        const newClient = await prisma.client.create({
            data: {
                code: data.client.code || 'AUTO',
                name: data.client.name,
                cnpj: data.client.cnpj,
                phone: data.client.phone,
                email: data.client.email, // Added email
                address: data.client.address,
                city: data.client.city,
                contact: data.client.contact,
            }
        });
        clientId = newClient.id;
    } else {
        // Update client info
        await prisma.client.update({
            where: { id: clientId },
            data: {
                phone: data.client.phone,
                email: data.client.email, // Added email
                address: data.client.address,
                city: data.client.city,
                contact: data.client.contact,
                cnpj: data.client.cnpj,
            }
        });
    }

    await prisma.report.update({
        where: { id },
        data: {
            clientId,
            date: new Date(data.date),

            departureDate: data.transport.departureDate ? new Date(data.transport.departureDate) : null,
            arrivalDate: data.transport.arrivalDate ? new Date(data.transport.arrivalDate) : null,
            departureKm: Number(data.transport.departureKm) || 0,
            arrivalKm: Number(data.transport.arrivalKm) || 0,
            totalKm: Number(data.transport.totalKm) || 0,
            departureTime: data.transport.departureTime,
            arrivalTime: data.transport.arrivalTime,
            totalHours: data.transport.totalHours,

            expensesAdvances: Number(data.expenses.advances) || 0,
            expensesFuel: Number(data.expenses.fuel) || 0,
            expensesHotel: Number(data.expenses.hotel) || 0,
            expensesMeals: Number(data.expenses.meals) || 0,
            expensesTolls: Number(data.expenses.tolls) || 0,
            expensesTickets: Number(data.expenses.tickets) || 0,
            expensesOthers: Number(data.expenses.others) || 0,
            expensesSundry: Number(data.expenses.sundry) || 0,
            expensesTotal: Number(data.expenses.total) || 0,

            description: data.description,
            mattersTreated: data.mattersTreated,
            clientObservations: data.clientObservations,
            technicianName: data.technicianName,
            clientSignature: data.clientSignature,

            serviceHours: {
                deleteMany: {},
                create: data.serviceHours.map(sh => ({
                    day: sh.day,
                    in: sh.in,
                    out: sh.out,
                    total: sh.total
                }))
            }
        }
    });

    revalidatePath('/');
    revalidatePath(`/reports/${id}`);
}

// Delete report
export async function deleteReport(id: number) {
    await prisma.report.delete({
        where: { id }
    });
    revalidatePath('/');
    redirect('/');
}

// --- Client Management ---

// Fetch Company Data from BrasilAPI
export async function fetchCompanyData(cnpj: string) {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) return { error: 'CNPJ inválido (deve ter 14 dígitos)' };

    try {
        const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        if (!res.ok) {
            if (res.status === 404) return { error: 'CNPJ não encontrado na Receita Federal' };
            console.error(`BrasilAPI Error: ${res.status} ${res.statusText}`);
            return { error: `Erro ao consultar CNPJ (Status: ${res.status})` };
        }

        const data = await res.json();
        return {
            name: data.nome_fantasia || data.razao_social,
            phone: data.ddd_telefone_1,
            email: data.email || '', // Added email
            // Format format: Logradouro, Número - Bairro
            address: `${data.logradouro}, ${data.numero} ${data.complemento || ''} - ${data.bairro}`,
            city: `${data.municipio} - ${data.uf}`,
            cnpj: data.cnpj, // Returns usually cleaned
            error: null
        };
    } catch (e) {
        console.error(e);
        return { error: 'Erro de conexão com a API' };
    }
}

// Get all clients (or paginated)
export async function getClients(query?: string) {
    const where: any = {};
    if (query) {
        where.OR = [
            { name: { contains: query, mode: 'insensitive' } },
            { cnpj: { contains: query } }
        ];
    }
    return await prisma.client.findMany({
        where,
        orderBy: { name: 'asc' },
        take: 100
    });
}

// Save Client (Create or Update) - Strict Client Management
export async function saveClient(data: any) {
    // If ID is provided, update
    if (data.id) {
        await prisma.client.update({
            where: { id: data.id },
            data: {
                name: data.name,
                cnpj: data.cnpj,
                phone: data.phone,
                email: data.email, // Added email
                address: data.address,
                city: data.city,
                contact: data.contact,
            }
        });
    } else {
        // Create new
        await prisma.client.create({
            data: {
                code: 'CLI-' + Date.now().toString().slice(-6), // Auto code
                name: data.name,
                cnpj: data.cnpj,
                phone: data.phone,
                email: data.email, // Added email
                address: data.address,
                city: data.city,
                contact: data.contact,
            }
        });
    }
    revalidatePath('/clients');
    revalidatePath('/clients');
    return { success: true };
}

// Get single client
export async function getClient(id: number) {
    return await prisma.client.findUnique({ where: { id } });
}

// Delete client
export async function deleteClient(id: number) {
    try {
        await prisma.client.delete({ where: { id } });
        revalidatePath('/clients');
    } catch (e) {
        // Handle error (e.g. constraints)
        throw new Error('Não é possível excluir cliente com relatórios vinculados.');
    }
}
