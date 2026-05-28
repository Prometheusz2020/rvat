'use server';

import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function getUsers() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') return [];

    return prisma.user.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
}

export async function createUser(data: FormData) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return { message: 'Unauthorized' };
    }

    const name = data.get('name') as string;
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    const role = data.get('role') as 'ADMIN' | 'USER';

    if (!name || !email || !password) {
        return { message: 'Missing fields' };
    }

    try {
        const hashedPassword = await hash(password, 10);
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'USER'
            }
        });
        revalidatePath('/admin');
        return { message: 'Success' };
    } catch (e) {
        console.error(e);
        return { message: 'Failed to create user' };
    }
}

export async function deleteUser(id: number) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        return { message: 'Unauthorized' };
    }

    try {
        await prisma.user.delete({ where: { id } });
        revalidatePath('/admin');
        return { message: 'Success' };
    } catch (e) {
        return { message: 'Failed' };
    }
}
