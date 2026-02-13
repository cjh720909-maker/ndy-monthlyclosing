const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  let createdId = null;
  try {
    console.log('--- 1. Create Vehicle (2026) ---');
    const vehicle = await prisma.longDistance.create({
      data: {
        driverName: 'TestDriver_Compact',
        vehicleNo: '99가 9999',
        tonnage: '5ton',
        region: 'TestRegion',
        currentAllowance: 1000000,
        note: 'Test Note',
        history: {
            create: {
                year: '2026',
                applyDate: new Date('2026-01-01'),
                amount: 1000000,
                reason: 'Initial'
            }
        }
      },
      include: { history: true }
    });
    createdId = vehicle.id;
    console.log('Created ID:', createdId);

    console.log('\n--- 2. Update Amount for same year (2026) ---');
    const history = await prisma.longDistanceHistory.findFirst({
        where: { vehicleId: vehicle.id, year: '2026' }
    });
    
    if (history) {
        await prisma.longDistanceHistory.update({
            where: { id: history.id },
            data: { amount: 1200000, reason: 'Updated' }
        });
        console.log('Updated 2026 amount to 1,200,000');
    }

    console.log('\n--- 3. Fetch (Simulate getVehicles logic) ---');
    const fetched = await prisma.longDistance.findUnique({
        where: { id: vehicle.id },
        include: { history: true }
    });
    
    const yearHistory = fetched.history.find(h => h.year === '2026');
    console.log('Final Amount for 2026:', yearHistory ? yearHistory.amount : 'N/A');

  } catch (e) {
    console.error(e);
  } finally {
    if (createdId) {
        await prisma.longDistance.delete({ where: { id: createdId } });
        console.log('\n--- Cleaned up ---');
    }
    await prisma.$disconnect();
  }
}

main();
