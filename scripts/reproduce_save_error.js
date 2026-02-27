const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSave() {
  const year = '2024';
  const workingDays = '6';
  const data = {
    cost1T: 370,
    cost2T: 400,
    cost2_5T: 420,
    cost3T: 450,
    cost3_5T: 470,
    cost5T: 500,
    cost5TAxis: 550,
  };

  try {
    console.log('Attempting upsert with:', { year, workingDays });
    const result = await prisma.monthlyVehicleCost.upsert({
      where: { 
        year_workingDays: {
          year,
          workingDays
        }
      },
      update: data,
      create: {
        year,
        workingDays,
        ...data,
      },
    });
    console.log('Upsert SUCCESS:', result);
  } catch (error) {
    console.error('Upsert FAILED:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testSave();
