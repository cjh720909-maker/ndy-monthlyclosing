
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const year = '2099';
  const data = {
    cost1T: 100,
    cost2_5T: 200,
    cost3_5T: 300,
    cost5T: 400,
    cost5TAxis: 500
  };

  try {
    console.log('Testing upsert...');
    await prisma.monthlyVehicleCost.upsert({
      where: { year },
      update: data,
      create: { year, ...data }
    });
    console.log('Upsert successful');

    const result = await prisma.monthlyVehicleCost.findUnique({ where: { year } });
    if (!result) throw new Error('Data not found after upsert');
    console.log('Found:', result);

    await prisma.monthlyVehicleCost.delete({ where: { year } });
    console.log('Cleanup successful');

  } catch (error) {
    console.error('Test FAILED:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
