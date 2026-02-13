const mysql = require('mysql2/promise');
const url = 'mysql://user_web:pass_web%40%23@221.143.21.135:3306/db_ndy?charset=utf8mb4';

async function main() {
  const conn = await mysql.createConnection(url);
  try {
    const [cols] = await conn.execute('DESCRIBE t_balju');
    console.log('--- t_balju Columns ---');
    console.log(cols.map(c => c.Field).join(', '));
    
    // Check if CB_DRIVER exists or similar
    // Also check date column (B_DATE? O_DATE?)
  } catch (err) {
    console.error(err);
  } finally {
    await conn.end();
  }
}
main();
