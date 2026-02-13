require('dotenv').config();
const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection(process.env.MYSQL_URL);
  
  try {
    console.log('Connected to database.');

    // 1. t_long_distance table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS t_long_distance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        driver_name VARCHAR(50) NOT NULL COMMENT '기사명',
        vehicle_no VARCHAR(20) NOT NULL COMMENT '차량번호',
        tonnage VARCHAR(10) COMMENT '톤수',
        region VARCHAR(50) COMMENT '운행 지역',
        current_allowance INT DEFAULT 0 COMMENT '현재 적용 수당 (참고용)',
        note TEXT COMMENT '비고',
        is_active BOOLEAN DEFAULT TRUE COMMENT '사용 여부',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    console.log('✅ t_long_distance table created or already exists.');

    // 2. t_long_distance_history table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS t_long_distance_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vehicle_id INT NOT NULL,
        year VARCHAR(4) NOT NULL COMMENT '적용 연도 (e.g. 2026)',
        apply_date DATE NOT NULL COMMENT '적용 시작일',
        amount INT NOT NULL COMMENT '수당 금액',
        reason VARCHAR(255) COMMENT '변경 사유',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES t_long_distance(id) ON DELETE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    console.log('✅ t_long_distance_history table created or already exists.');

  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await connection.end();
  }
}

main();
