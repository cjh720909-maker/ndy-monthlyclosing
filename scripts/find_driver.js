const mysql = require('mysql2/promise');
const iconv = require('iconv-lite');
const url = 'mysql://user_web:pass_web%40%23@221.143.21.135:3306/db_ndy?charset=utf8mb4';

async function main() {
  const conn = await mysql.createConnection(url);
  try {
    const targetName = '강호필';
    console.log(`Searching for ${targetName} in t_out...`);
    
    // We fetch all distinct drivers from t_out to see if he exists in ANY form
    const [rows] = await conn.execute(`
        SELECT DISTINCT CAST(CB_DRIVER AS BINARY) as DRIVER_BIN 
        FROM t_out 
        ORDER BY O_DATE DESC
        LIMIT 1000
    `);

    let found = false;
    for (const r of rows) {
        const name = iconv.decode(r.DRIVER_BIN, 'euckr');
        if (name.includes('강호필') || name.includes('강') && name.includes('호') && name.includes('필')) {
            console.log(`Found candidate: '${name}'`);
            found = true;
        }
    }
    
    if (!found) {
        console.log('Not found in recent 1000 dispatches.');
    }

  } catch (err) {
    console.error(err);
  } finally {
    await conn.end();
  }
}
main();
