const mysql = require('mysql2/promise');
const iconv = require('iconv-lite');

async function debugIlkun() {
    try {
        // Hardcoded for debugging based on the error output I saw
        // Input was: "mysql://user_web:pass_web%40%23@221.143.21.135:3306/db_ndy?charset"
        // It seems the env var has quotes? Or the URL parser didn't like the % in the user/pass part?
        // Let's decode the component manually or use the object format.
        
        const host = '221.143.21.135';
        const user = 'user_web';
        const password = decodeURIComponent('pass_web%40%23'); // decodes to pass_web@#
        const database = 'db_ndy';
        const port = 3306;

        console.log(`Connecting to ${host} as ${user}...`);

        const connection = await mysql.createConnection({
            host,
            user,
            password,
            database,
            port
        });

        console.log('Connected to DB');

        // Fetch without filter to see what's there
        const [rows] = await connection.execute('SELECT IK_DATE, CAST(IK_NAME AS BINARY) as IK_NAME, CAST(IK_DIV AS BINARY) as IK_DIV, CAST(IK_GUBUN AS BINARY) as IK_GUBUN FROM t_il_kun ORDER BY IK_DATE DESC LIMIT 20');
        
        console.log('Fetched 20 rows:');
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
