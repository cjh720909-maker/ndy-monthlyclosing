const mysql = require('mysql2/promise');

async function main() {
    const MYSQL_URL = "mysql://user_web:pass_web%40%23@221.143.21.135:3306/db_ndy?charset=utf8mb4";
    const connection = await mysql.createConnection(MYSQL_URL);
    try {
        console.log("--- Counts ---");
        const [count1] = await connection.execute('SELECT COUNT(*) as cnt FROM t_employ');
        console.log("t_employ count:", count1[0].cnt);

        const [count2] = await connection.execute('SELECT COUNT(*) as cnt FROM t_j_employ');
        console.log("t_j_employ count:", count2[0].cnt);

        console.log("\n--- t_j_employ samples ---");
        const [rows] = await connection.execute('SELECT E_SABUN, E_PASS, E_NAME FROM t_j_employ LIMIT 5');
        console.log(JSON.stringify(rows));
    } finally {
        await connection.end();
    }
}

main().catch(console.error);
