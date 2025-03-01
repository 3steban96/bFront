const pool = require('../DB/DBConnect');

async function registerActivities(req, res) {
    const { id } = req.params; // ID del usuario
    const activities = req.body; // Array de actividades enviadas

    if (!id || !Array.isArray(activities) || activities.length === 0) {
        return res.status(400).json({ error: 'ID del usuario y actividades son obligatorios y deben ser un array' });
    }

    try {
        for (const activity of activities) {
            const { action, month, activityPercentageMonth } = activity;

            if (!action || !month || activityPercentageMonth === undefined) {
                return res.status(400).json({ error: 'Cada actividad debe incluir action, month y activityPercentageMonth' });
            }

            const activityPercentage = parseInt(activityPercentageMonth, 10) || 0;

            // Insertar en la tabla activities
            const insertActivityQuery = `INSERT INTO activities (user_id, action, timestamp) VALUES (?, ?, NOW());`;
            await pool.query(insertActivityQuery, [id, action]);

            // Insertar o actualizar en la tabla activity_counts
            const updateActivityCountQuery = `
                INSERT INTO activity_counts (user_id, action, count, updated_at)
                VALUES (?, ?, 1, NOW())
                ON DUPLICATE KEY UPDATE count = count + 1, updated_at = NOW();
            `;
            await pool.query(updateActivityCountQuery, [id, action]);

            // Insertar o actualizar en activity_months
            const updateActivityMonthQuery = `
                INSERT INTO activity_months (user_id, month, activityPercentage)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE activityPercentage = (activityPercentage + VALUES(activityPercentage)) / 2;
            `;
            await pool.query(updateActivityMonthQuery, [id, month, activityPercentage]);
        }

        res.status(201).json({ message: 'Actividades registradas exitosamente', user_id: id, activities });
    } catch (error) {
        console.error('Error al registrar actividad:', error);
        res.status(500).json({ error: 'Error al registrar actividad' });
    }
}



module.exports = { registerActivities };

