const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.longDistance.count();
    console.log(`Total LongDistance records: ${count}`);
    
    const all = await prisma.longDistance.findMany({
        include: { history: true }
    });
    console.log(JSON.stringify(all, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
