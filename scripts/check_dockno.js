const mysql = require('mysql2/promise');
const url = 'mysql://user_web:pass_web%40%23@221.143.21.135:3306/db_ndy?charset=utf8mb4';

async function main() {
  const conn = await mysql.createConnection(url);
  try {
    // Fetch unique dock numbers to understand the format (e.g., '01', '1', '20-1')
    const [rows] = await conn.execute('SELECT DISTINCT CA_DOCKNO FROM t_car WHERE CA_DOCKNO IS NOT NULL ORDER BY CA_DOCKNO');
    console.log('--- CA_DOCKNO Values ---');
    console.log(rows.map(r => r.CA_DOCKNO));
  } catch (err) {
    console.error(err);
  } finally {
    await conn.end();
  }
}
main();
