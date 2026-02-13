const mysql = require('mysql2/promise');
const url = 'mysql://user_web:pass_web%40%23@221.143.21.135:3306/db_ndy?charset=utf8mb4';

async function main() {
  try {
    const conn = await mysql.createConnection(url);
    const [rows] = await conn.execute('SHOW TABLES');
    console.log(rows.map(r => Object.values(r)[0]));
    await conn.end();
  } catch (err) {
    console.error(err);
  }
}
main();
