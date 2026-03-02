const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function findColumn() {
  const dbUrl = process.env.MYSQL_URL;
  if (!dbUrl) return;

  try {
    const pool = mysql.createPool(dbUrl);
    
    // Search for columns matching Y_SUSU or Y_GB
    const [columns] = await pool.query(`
      SELECT TABLE_NAME, COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE COLUMN_NAME LIKE '%Y_SUSU%' OR COLUMN_NAME LIKE '%Y_GB%'
      AND TABLE_SCHEMA = DATABASE()
    `);
    
    console.log('Found Columns:', JSON.stringify(columns, null, 2));
    await pool.end();
  } catch (error) {
    console.error(error);
  }
}

findColumn();
