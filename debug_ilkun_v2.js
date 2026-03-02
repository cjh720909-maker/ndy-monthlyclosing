const mysql = require('mysql2/promise');
const iconv = require('iconv-lite');
const path = require('path');
const fs = require('fs');

async function debugIlkun() {
    try {
        // Load .env content
        const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
        const envConfig = {};
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) envConfig[key.trim()] = value.trim();
        });
        
        // Use MYSQL_URL or similar if found, otherwise parse or fallback
        const dbUrl = envConfig.MYSQL_URL || 'mysql://root:ndy1234@127.0.0.1:3306/ndy_monthly_closing';
        
        console.log('Connecting to:', dbUrl);

        const connection = await mysql.createConnection(dbUrl);

        console.log('Connected to DB');

        // Fetch without filter to see what's there
        const [rows] = await connection.execute('SELECT IK_DATE, CAST(IK_NAME AS BINARY) as IK_NAME, CAST(IK_DIV AS BINARY) as IK_DIV, CAST(IK_GUBUN AS BINARY) as IK_GUBUN FROM t_il_kun ORDER BY IK_DATE DESC LIMIT 50');
        
        console.log('Fetched 50 rows:');
        rows.forEach(row => {
            const name = iconv.decode(row.IK_NAME, 'euckr');
            const div = iconv.decode(row.IK_DIV, 'euckr');
            const gubun = iconv.decode(row.IK_GUBUN, 'euckr');
            console.log(`Date: ${row.IK_DATE}, Name: ${name}, Div: [${div}], Gubun: ${gubun}`);
        });

        await connection.end();

    } catch (error) {
        console.error('Error:', error);
    }
}

debugIlkun();
