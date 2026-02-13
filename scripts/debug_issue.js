const mysql = require('mysql2/promise');
const iconv = require('iconv-lite');
const url = 'mysql://user_web:pass_web%40%23@221.143.21.135:3306/db_ndy?charset=utf8mb4'; 
// Note: Keeping url as is to see what raw bytes we get.

async function main() {
  const conn = await mysql.createConnection(url);
  try {
    // 1. Encoding Debug
    // Fetch generic driver name
    const [rows] = await conn.execute(`SELECT CAST(CA_NAME AS BINARY) as bin_name FROM t_car LIMIT 1`);
    const bin = rows[0].bin_name;
    console.log('--- Raw Bytes ---');
    console.log(bin);
    console.log('--- Decoded (EUC-KR) ---');
    console.log(iconv.decode(bin, 'euckr'));
    console.log('--- Decoded (UTF-8) ---');
    console.log(iconv.decode(bin, 'utf8'));

    // 2. Logic Debug (t_il_car)
    const [ilRows] = await conn.execute('DESCRIBE t_il_car');
    console.log('--- t_il_car Columns ---');
    console.log(ilRows.map(r => r.Field).join(', '));
    
    // Check data in t_il_car
    const [ilData] = await conn.execute('SELECT * FROM t_il_car ORDER BY IC_DATE DESC LIMIT 5');
    console.log('--- t_il_car Data ---');
    console.log(ilData);

  } catch (err) {
    console.error(err);
  } finally {
    await conn.end();
  }
}
main();
