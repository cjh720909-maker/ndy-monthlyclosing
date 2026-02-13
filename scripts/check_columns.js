const mysql = require('mysql2/promise');
const url = 'mysql://user_web:pass_web%40%23@221.143.21.135:3306/db_ndy?charset=utf8mb4';

async function main() {
  const conn = await mysql.createConnection(url);
  const tables = ['t_car', 't_j_drvhist', 't_out', 't_sc_tran'];
  for (const t of tables) {
    try {
      const [rows] = await conn.execute(`DESCRIBE ${t}`);
      console.log(`--- ${t} ---`);
      console.log(rows.map(r => r.Field).join(', '));
    } catch (e) { console.log(`Error describing ${t}: ${e.message}`); }
  }
  await conn.end();
}
main();
