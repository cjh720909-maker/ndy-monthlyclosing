const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();

// 1. Setup Prisma Client for Neon
const neonPrisma = new PrismaClient();

// 2. Setup SQLite Connection
const db = new sqlite3.Database('./prisma/dev.db');

function queryAll(sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function main() {
  try {
    console.log('--- Checking SQLite Data ---');
    const longDistanceRows = await queryAll('SELECT * FROM NMC_LongDistance');
    console.log(`SQLite LongDistance: ${longDistanceRows.length} rows`);
    
    if (longDistanceRows.length === 0) {
      console.log('No data found in SQLite. Recovery from dev.db is not possible.');
      return;
    }

    const historyRows = await queryAll('SELECT * FROM NMC_LongDistanceHistory');
    const userRows = await queryAll('SELECT * FROM NMC_User');
    const addCostRows = await queryAll('SELECT * FROM NMC_AdditionalCost');
    const monthlyCostRows = await queryAll('SELECT * FROM NMC_MonthlyVehicleCost');

    console.log('--- Restoring to Neon ---');
    
    // Use transaction if possible, or sequential
    await neonPrisma.$transaction(async (tx) => {
      // Clear Neon first just in case
      await tx.longDistanceHistory.deleteMany();
      await tx.longDistance.deleteMany();
      await tx.user.deleteMany();
      await tx.additionalCost.deleteMany();
      await tx.monthlyVehicleCost.deleteMany();

      // Insert LongDistance
      for (const row of longDistanceRows) {
        const { id, ...rest } = row;
        await tx.longDistance.create({
          data: {
             ...rest,
             createdAt: new Date(row.created_at || Date.now()),
             updatedAt: new Date(row.updated_at || Date.now()),
             isActive: Boolean(row.is_active)
          }
        });
      }

      // Insert History
      for (const row of historyRows) {
        const { id, ...rest } = row;
        await tx.longDistanceHistory.create({
          data: {
             ...rest,
             applyDate: new Date(row.apply_date),
             createdAt: new Date(row.created_at || Date.now()),
          }
        });
      }

      // Insert Users
      for (const row of userRows) {
        const { id, ...rest } = row;
        await tx.user.create({ data: rest });
      }

      // Insert Additional Costs
      for (const row of addCostRows) {
        const { id, ...rest } = row;
        await tx.additionalCost.create({
          data: {
             ...rest,
             createdAt: new Date(row.created_at || Date.now())
          }
        });
      }

      // Insert Monthly Costs
      for (const row of monthlyCostRows) {
        const { id, ...rest } = row;
        await tx.monthlyVehicleCost.create({
          data: {
             ...rest,
             createdAt: new Date(row.created_at || Date.now()),
             updatedAt: new Date(row.updated_at || Date.now())
          }
        });
      }
    });

    console.log('--- RECOVERY SUCCESSFUL (44+ rows) ---');

  } catch (error) {
    console.error('--- RECOVERY FAILED ---');
    console.error(error);
  } finally {
    await neonPrisma.$disconnect();
    db.close();
  }
}

main();
