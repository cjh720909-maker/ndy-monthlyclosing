const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Try loading .env from current dir
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function inspectSchema() {
  const dbUrl = process.env.MYSQL_URL;
  if (!dbUrl) {
    console.error('MYSQL_URL not found in .env');
    return;
  }
  
  console.log('Connecting to database...');
  try {
    const pool = mysql.createPool(dbUrl);
    const [rows] = await pool.query('DESCRIBE t_il_kun');
    console.log(JSON.stringify(rows, null, 2));
    await pool.end();
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

inspectSchema();
