const pool = require('../DB/DBConnect');

async function searchCustomer(req, res) {
    const { name, email, registrationDate } = req.query;

    try {
        const connection = await pool.getConnection();
        let query = 'SELECT * FROM users WHERE 1=1';
        const params = [];

        if (name) {
            query += ' AND name = ?';
            params.push(name);
        }

        if (email) {
            query += ' AND email = ?';
            params.push(email);
        }

        if (registrationDate) {
            query += ' AND DATE(registrationDate) = ?';
            params.push(registrationDate);
        }

        const [rows] = await connection.query(query, params);
        connection.release();

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        res.json(rows);
    } catch (error) {

        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    searchCustomer
};