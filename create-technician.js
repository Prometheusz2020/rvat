const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'carlos.greghi@mocmaq.com.br';
    const password = 'Eva2015ana';
    const name = 'Carlos Alberto Greghi';

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                name: name,
                role: 'USER', // Assuming Technician is a standard User, or adjust to ADMIN if needed
            },
            create: {
                email,
                password: hashedPassword,
                name,
                role: 'USER',
            },
        });
        console.log(`User created/updated: ${user.email}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
