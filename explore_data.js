const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function exploreData() {
  const dbUrl = process.env.MYSQL_URL;
  if (!dbUrl) return;

  try {
    const pool = mysql.createPool(dbUrl);
    
    // 1. List Tables
    const [tables] = await pool.query('SHOW TABLES');
    console.log('Tables:', JSON.stringify(tables, null, 2));

    // 2. Distinct IK_GUBUN
    const [gubuns] = await pool.query('SELECT DISTINCT IK_GUBUN FROM t_il_kun');
    console.log('IK_GUBUN Values:', JSON.stringify(gubuns, null, 2));
    
    await pool.end();
  } catch (error) {
    console.error(error);
  }
}

exploreData();
