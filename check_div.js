const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function checkDiv() {
  const dbUrl = process.env.MYSQL_URL;
  if (!dbUrl) return;

  try {
    const pool = mysql.createPool(dbUrl);
    const [rows] = await pool.query('SELECT DISTINCT IK_DIV FROM t_il_kun');
    console.log('IK_DIV Values:', JSON.stringify(rows, null, 2));
    await pool.end();
  } catch (error) {
    console.error(error);
  }
}

checkDiv();
