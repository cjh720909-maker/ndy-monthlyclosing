const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  let createdId = null;
  try {
    console.log('--- TEST: New Vehicle Registration (Fix Verification) ---');
    // Simulate what the frontend sends for a new vehicle (id is undefined/null)
    const newVehicleData = {
        driverName: 'FixTest_Driver',
        vehicleNo: '88하 8888',
        tonnage: '11ton',
        region: 'FixRegion',
        currentAllowance: 2000000,
        note: 'Testing Fix'
    };

    // We can't call the server action directly here easily without mocking, 
    // but we can test the logic: creating without ID.
    
    // Simulate Action Logic:
    console.log('Simulating Action: ID is missing, so performing CREATE...');
    const vehicle = await prisma.longDistance.create({
        data: {
            driverName: newVehicleData.driverName,
            vehicleNo: newVehicleData.vehicleNo,
            tonnage: newVehicleData.tonnage,
            region: newVehicleData.region,
            currentAllowance: newVehicleData.currentAllowance,
            note: newVehicleData.note,
        }
    });
    createdId = vehicle.id;
    console.log('Created Vehicle ID:', createdId);
    
    const historyData = {
        vehicleId: vehicle.id,
        year: '2026',
        applyDate: new Date('2026-01-01'),
        amount: newVehicleData.currentAllowance,
        reason: 'Initial'
    };
    
    await prisma.longDistanceHistory.create({ data: historyData });
    console.log('Created History for 2026');

    // Verification
    const fetched = await prisma.longDistance.findUnique({
        where: { id: createdId },
        include: { history: true }
    });
    console.log('Fetched created record:', JSON.stringify(fetched, null, 2));

  } catch (e) {
    console.error(e);
  } finally {
    if (createdId) {
        await prisma.longDistance.delete({ where: { id: createdId } });
        console.log('Cleaned up test data');
    }
    await prisma.$disconnect();
  }
}

main();
