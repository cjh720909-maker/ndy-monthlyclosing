const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function peekData() {
  const dbUrl = process.env.MYSQL_URL;
  if (!dbUrl) return;

  try {
    const pool = mysql.createPool(dbUrl);
    // Select a few recent rows
    const [rows] = await pool.query('SELECT * FROM t_il_kun ORDER BY IK_DATE DESC LIMIT 10');
    console.log(JSON.stringify(rows, null, 2));
    await pool.end();
  } catch (error) {
    console.error(error);
  }
}

peekData();
