const { PrismaClient } = require('@prisma/client');

async function main() {
  const neon = new PrismaClient();
  try {
    console.log('Neon Current Counts:');
    console.log('- LongDistance:', await neon.longDistance.count());
    console.log('- History:', await neon.longDistanceHistory.count());
    console.log('- User:', await neon.user.count());
    console.log('- AddCost:', await neon.additionalCost.count());
    console.log('- MonthlyCost:', await neon.monthlyVehicleCost.count());
  } catch (e) {
    console.error('Check failed:', e.message);
  } finally {
    await neon.$disconnect();
  }
}

main();
