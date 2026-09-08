import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() { console.log('Seed complete. Google OAuth creates users on first login.'); }
main().finally(() => prisma.$disconnect());
