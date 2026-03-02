const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function checkData() {
  const dbUrl = process.env.MYSQL_URL;
  if (!dbUrl) return;

  try {
    const pool = mysql.createPool(dbUrl);
    
    // 1. Check non-zero IK_KUM
    const [moneyRows] = await pool.query('SELECT * FROM t_il_kun WHERE IK_KUM > 0 LIMIT 5');
    console.log('Money Rows:', JSON.stringify(moneyRows, null, 2));

    // 2. Check Absence records
    const [absentRows] = await pool.query("SELECT * FROM t_il_kun WHERE IK_GUBUN LIKE '%결근%' LIMIT 5");
    console.log('Absent Rows:', JSON.stringify(absentRows, null, 2));
    
    await pool.end();
  } catch (error) {
    console.error(error);
  }
}

checkData();
