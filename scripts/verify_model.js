
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking MonthlyVehicleCost model...');
    // Attempt to access the model
    if (!prisma.monthlyVehicleCost) {
        throw new Error('prisma.monthlyVehicleCost is undefined!');
    }
    const count = await prisma.monthlyVehicleCost.count();
    console.log('MonthlyVehicleCost count:', count);
    console.log('Verification SUCCESS');
  } catch (error) {
    console.error('Verification FAILED:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
