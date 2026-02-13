const mysql = require('mysql2/promise');
const iconv = require('iconv-lite');
const url = 'mysql://user_web:pass_web%40%23@221.143.21.135:3306/db_ndy?charset=utf8mb4';

async function main() {
  const conn = await mysql.createConnection(url);
  try {
    // 1. Fetch one target driver from t_car (Dock 01-40)
    // We look for a driver who likely has work.
    const [cars] = await conn.execute(`
      SELECT CAST(CA_NAME AS BINARY) as CA_NAME_BIN, CA_DOCKNO 
      FROM t_car 
      WHERE CA_DOCKNO IS NOT NULL AND CA_DOCKNO <> '' 
      LIMIT 10
    `);
    
    console.log('--- t_car Candidates ---');
    const carNames = [];
    for (const c of cars) {
        const name = iconv.decode(c.CA_NAME_BIN, 'euckr');
        const dock = c.CA_DOCKNO;
        // Check dock range logic
        const dockNum = parseInt(dock.split('-')[0], 10);
        if (dockNum >= 1 && dockNum <= 40) {
            console.log(`Dock: ${dock}, Name: ${name}`);
            carNames.push(name);
        }
    }

    if (carNames.length === 0) {
        console.log('No target drivers found in sample.');
        return;
    }

    // 2. Check t_out for these names
    console.log('--- t_out Check ---');
    const [outs] = await conn.execute(`
        SELECT O_DATE, CAST(CB_DRIVER AS BINARY) as DRIVER_BIN 
        FROM t_out 
        ORDER BY O_DATE DESC 
        LIMIT 50
    `);

    const outNames = new Set();
    outs.forEach(o => {
        const name = iconv.decode(o.DRIVER_BIN, 'euckr');
        outNames.add(name);
    });

    console.log('--- Matching Test ---');
    for (const carName of carNames) {
        // Test strict equality, trim, logic
        const found = outNames.has(carName);
        const foundTrim = outNames.has(carName.trim());
        console.log(`Checking '${carName}' (Len: ${carName.length}): Exact=${found}, Trimmed=${foundTrim}`);
        
        // Print first matching from t_out to compare bytes if failure
        // for (const outName of outNames) {
        //    if (outName.includes(carName) || carName.includes(outName)) {
        //        console.log(`   Potential match? '${outName}' (Len: ${outName.length})`);
        //    }
        // }
    }

  } catch (err) {
    console.error(err);
  } finally {
    await conn.end();
  }
}
main();
