const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function main() {
  const neon = new PrismaClient();
  const data = JSON.parse(fs.readFileSync('backup_final.json', 'utf8'));

  try {
    console.log('--- Starting Sequential Restoration to Neon ---');
    
    // Deleting existing records WITHOUT transaction to avoid timeout
    await neon.longDistanceHistory.deleteMany();
    await neon.longDistance.deleteMany();
    await neon.user.deleteMany();
    await neon.additionalCost.deleteMany();
    await neon.monthlyVehicleCost.deleteMany();
    console.log('Clearing existing records... Done.');

    // LongDistance
    for (const item of data.longDistance) {
      await neon.longDistance.create({ data: item });
    }
    console.log(`Restored LongDistance: ${data.longDistance.length}`);

    // History
    for (const item of data.longDistanceHistory) {
      await neon.longDistanceHistory.create({ data: item });
    }
    console.log(`Restored History: ${data.longDistanceHistory.length}`);

    // User
    for (const item of data.user) {
      await neon.user.create({ data: item });
    }
    console.log(`Restored User: ${data.user.length}`);

    // AdditionalCost
    for (const item of data.additionalCost) {
      await neon.additionalCost.create({ data: item });
    }
    console.log(`Restored AdditionalCost: ${data.additionalCost.length}`);

    // MonthlyCost
    for (const item of data.monthlyVehicleCost) {
      await neon.monthlyVehicleCost.create({ data: item });
    }
    console.log(`Restored MonthlyVehicleCost: ${data.monthlyVehicleCost.length}`);

    console.log('--- ALL DATA RESTORED SUCCESSFULLY ---');

  } catch (error) {
    console.error('--- RESTORATION FAILED ---');
    console.error(error.message);
  } finally {
    await neon.$disconnect();
  }
}

main();
