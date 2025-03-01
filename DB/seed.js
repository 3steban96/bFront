const fs = require("fs").promises;
const mysql = require("mysql2/promise");

const seedDatabase = async () => {
    try {
        const pool = mysql.createPool({
            connectionLimit: 10, 
            host: 'shortline.proxy.rlwy.net',  
            port: 18255, 
            user: 'root',
            password: 'OeQonowxsPbMgVnyTSrUCOwFUmNwXnee', 
            database: 'railway',
            waitForConnections: true,
            queueLimit: 0
        });
        const connection = await pool.getConnection();
        console.log('✅ Conectado a la base de datos en Railway');

        // Leer archivos JSON
        const usersData = JSON.parse(await fs.readFile("./users.json", "utf-8"));
        const activitiesData = JSON.parse(await fs.readFile("./activities.json", "utf-8"));
        const activityCountsData = JSON.parse(await fs.readFile("./activity_counts.json", "utf-8"));
        const activityMonthsData = JSON.parse(await fs.readFile("./activity_months.json", "utf-8"));

        // Insertar datos en users si no existen
        for (const user of usersData) {
            await connection.query(
                `INSERT INTO users (name, email, phone) 
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone)`,
                [user.name, user.email, user.phone]
            );
        }
        console.log("✅ Datos de users insertados");

        // Insertar datos en activities
        for (const activity of activitiesData) {
            await connection.query(
                `INSERT INTO activities (user_id, action) 
                 VALUES (?, ?)`,
                [activity.user_id, activity.action]
            );
        }
        console.log("✅ Datos de activities insertados");

        // Insertar datos en activity_counts
        for (const count of activityCountsData) {
            await connection.query(
                `INSERT INTO activity_counts (user_id, action, count) 
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE count=VALUES(count)`,
                [count.user_id, count.action, count.count]
            );
        }
        console.log("✅ Datos de activity_counts insertados");

        // Insertar datos en activity_months
        for (const month of activityMonthsData) {
            await connection.query(
                `INSERT INTO activity_months (user_id, month, activityPercentage) 
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE activityPercentage=VALUES(activityPercentage)`,
                [month.user_id, month.month, month.activityPercentage]
            );
        }
        console.log("✅ Datos de activity_months insertados");

        connection.release();
    } catch (error) {
        console.error("❌ Error insertando datos:", error);
    }
};
module.exports={
    seedDatabase
}

