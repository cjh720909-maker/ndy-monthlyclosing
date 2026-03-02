const mysql = require('mysql2/promise');
const iconv = require('iconv-lite');
const path = require('path');
const fs = require('fs');

async function debugIlkun() {
    try {
        // Load .env manually for standalone script
        const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
        const envConfig = {};
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) envConfig[key.trim()] = value.trim();
        });
        
        const dbUrl = envConfig.DATABASE_URL;
        // Parse mysql://root:password@host:port/db
        // Assuming format: mysql://root:password@127.0.0.1:3306/ndy_monthly_closing
        // But user might have different format. 
        // Let's use the explicit values if possible or parse.
        // Quick hack: just use the known values if env parsing is complex, but env is safer.
        // DB_URL usually: mysql://USER:PASS@HOST:PORT/DB
        
        const connection = await mysql.createConnection(dbUrl);

        console.log('Connected to DB');

        const [rows] = await connection.execute('SELECT * FROM t_il_kun ORDER BY IK_DATE DESC LIMIT 20');
        
        console.log('Fetched 20 rows:');
        rows.forEach(row => {
            const name = iconv.decode(row.IK_NAME, 'euckr');
            const div = iconv.decode(row.IK_DIV, 'euckr');
            const gubun = iconv.decode(row.IK_GUBUN, 'euckr');
            console.log(`Date: ${row.IK_DATE}, Name: ${name}, Div: ${div}, Gubun: ${gubun}`);
        });

        await connection.end();

    } catch (error) {
        console.error('Error:', error);
    }
}

debugIlkun();
