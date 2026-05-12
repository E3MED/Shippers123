const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const result = await pool.query(
            `SELECT u.*, r.name as region_name, r.code as region_code 
             FROM users u 
             LEFT JOIN regions r ON u.region_id = r.id 
             WHERE u.username = $1 AND u.is_active = true`,
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                email: user.email,
                role: user.role,
                initials: user.initials,
                region: user.region_id ? {
                    id: user.region_id,
                    name: user.region_name,
                    code: user.region_code
                } : null
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

const getMe = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.username, u.full_name, u.email, u.role, u.initials,
                    r.id as region_id, r.name as region_name, r.code as region_code
             FROM users u
             LEFT JOIN regions r ON u.region_id = r.id
             WHERE u.id = $1`,
            [req.user.id]
        );

        const user = result.rows[0];
        res.json({
            id: user.id,
            username: user.username,
            fullName: user.full_name,
            email: user.email,
            role: user.role,
            initials: user.initials,
            region: user.region_id ? {
                id: user.region_id,
                name: user.region_name,
                code: user.region_code
            } : null
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { login, getMe };
