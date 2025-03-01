const mysql = require("mysql2/promise");

const pool = mysql.createPool({
    connectionLimit: 10, 
    host: 'localhost', 
    user: 'root',
    database: 'prueba',
    nestTables: false, 
});
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conectado a la base de datos en Railway');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone BIGINT NOT NULL
            )
        `);
        console.log('✅ Tabla "users" verificada/creada');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS activities (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                action ENUM('compra', 'ver promociones', 'ver anuncios') NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Tabla "activities" verificada/creada');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS activity_counts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                action ENUM('compra', 'ver promociones', 'ver anuncios') NOT NULL,
                count INT NOT NULL DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Tabla "activity_counts" verificada/creada');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS activity_months (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                month ENUM('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre') NOT NULL,
                activityPercentage INT NOT NULL DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Tabla "activity_months" verificada/creada');

        connection.release();
    } catch (err) {
        console.error('❌ Error de conexión o creación de tablas:', err);
    }
})();

module.exports = pool;
