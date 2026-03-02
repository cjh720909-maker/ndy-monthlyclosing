const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function inspectSchema() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL.replace('mysql://', 'mysql://root:pw@')); // Adjust based on env format
  // Actually, let's use the layout from src/lib/db.ts
  // DATABASE_URL in .env is likely used by Prisma (SQLite) or maybe MySQL?
  // ndy-monthlyclosing uses sqlite for prisma but mysql for legacy?
  // src/lib/db.ts uses MYSQL_URL.
  
  const pool = mysql.createPool(process.env.MYSQL_URL);
  
  try {
    const [rows] = await pool.query('DESCRIBE t_il_kun');
    console.log(rows);
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

inspectSchema();
