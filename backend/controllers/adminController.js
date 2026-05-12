const pool = require('../config/database');
const bcrypt = require('bcrypt');

const createUser = async (req, res) => {
    try {
        const { fullName, username, password, email, role, regionId, initials } = req.body;

        if (!fullName || !username || !password) {
            return res.status(400).json({ message: 'Full name, username, and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (full_name, username, password, email, role, region_id, initials)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, full_name, username, email, role, region_id, initials`,
            [fullName, username, hashedPassword, email, role || 'user', regionId, initials]
        );

        res.status(201).json({
            message: 'User created successfully',
            user: result.rows[0]
        });
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ message: 'Username already exists' });
        }
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
};

const getUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.full_name, u.username, u.email, u.role, u.initials, u.is_active,
                    r.id as region_id, r.name as region_name, r.code as region_code
             FROM users u
             LEFT JOIN regions r ON u.region_id = r.id
             ORDER BY u.created_at DESC`
        );

        res.json({ users: result.rows });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, role, regionId, isActive } = req.body;

        const result = await pool.query(
            `UPDATE users 
             SET full_name = COALESCE($1, full_name),
                 email = COALESCE($2, email),
                 role = COALESCE($3, role),
                 region_id = $4,
                 is_active = COALESCE($5, is_active)
             WHERE id = $6
             RETURNING id, full_name, username, email, role, region_id, is_active`,
            [fullName, email, role, regionId, isActive, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User updated successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting self
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        await pool.query('DELETE FROM users WHERE id = $1', [id]);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
};

module.exports = {
    createUser,
    getUsers,
    updateUser,
    deleteUser
};
