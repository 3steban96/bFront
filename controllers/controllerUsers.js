const pool = require('../DB/DBConnect');
async function getUsers(req, res) {
    try {
        const query = `
            SELECT 
                u.id, u.name, u.email, u.phone,
                
                -- Obtener las actividades como JSON
                COALESCE(CONCAT('[', GROUP_CONCAT(DISTINCT 
                    JSON_OBJECT(
                        'id', a.id,
                        'action', a.action,
                        'timestamp', a.timestamp
                    )
                    ORDER BY a.timestamp SEPARATOR ','), ']'), '[]') AS activities,
                
                -- Obtener el conteo de actividades
                COALESCE(CONCAT('[', GROUP_CONCAT(DISTINCT 
                    JSON_OBJECT(
                        'action', ac.action,
                        'count', ac.count
                    )
                    ORDER BY ac.count SEPARATOR ','), ']'), '[]') AS activity_counts,

                -- Obtener las actividades por mes
                COALESCE(CONCAT('[', GROUP_CONCAT(DISTINCT 
                    JSON_OBJECT(
                        'month', am.month,
                        'activityPercentage', am.activityPercentage
                    )
                    ORDER BY am.month SEPARATOR ','), ']'), '[]') AS activityMonths

            FROM users u
            LEFT JOIN activities a ON u.id = a.user_id
            LEFT JOIN activity_counts ac ON u.id = ac.user_id
            LEFT JOIN activity_months am ON u.id = am.user_id
            GROUP BY u.id;
        `;

        const [rows] = await pool.query(query);
        const cleanedData = rows.map(row => {
            return {
                id: row.id,
                name: row.name,
                email: row.email,
                phone: row.phone,
                activities: JSON.parse(row.activities || '[]'),
                activity_counts: JSON.parse(row.activity_counts || '[]'),
                activityMonths: JSON.parse(row.activityMonths || '[]')
            };
        });
        res.json(cleanedData);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
}

async function addUser(req, res) {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        // Verificar si el usuario ya existe
        const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'El correo electrónico ya está registrado' });
        }

        // Insertar usuario si no existe
        const [result] = await pool.query('INSERT INTO users (name, email, phone) VALUES (?, ?, ?)', [name, email, phone]);

        res.status(201).json({ message: 'Usuario agregado exitosamente', userId: result.insertId });
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
}
async function  editUser(req,res) {
    const { id } = req.params;
    const idParser = parseInt(id, 10);
    const { name, email, phone } = req.body;
    if(!id){
        return res.status(400).json({ error: 'El ID del usuario es obligatorio' });
    }
    try {
        const query = `UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ${idParser}`;
        pool.query(query, [name, email, phone, id], (error, results) => {
            if (error) {
                console.error('Error al actualizar usuario:', error);
                return res.status(500).json({ error: 'Error al actualizar usuario' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.status(200).json({ message: 'Usuario actualizado exitosamente' });
        });

    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }    
}
async function deleteUser(req,res) {
    const { id } = req.params;
    const idParser = parseInt(id, 10);
    if(!id){
        return res.status(400).json({ error: 'El ID del usuario es obligatorio' });
    }
    try {
        const query = `DELETE FROM users WHERE id = ${idParser}`
        pool.query(query, [ id], (error, results) => {
            if (error) {
                console.error('Error al actualizar usuario:', error);
                return res.status(500).json({ error: 'Error al eliminar usuario' });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            res.status(200).json({ message: 'Usuario eliminado exitosamente' });
        });

    } catch (error) {
        
    }
}

module.exports = {
    getUsers,
    addUser,
    editUser,
    deleteUser
};
