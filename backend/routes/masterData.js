const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { auth } = require('../middleware/auth');

// Get all ports
router.get('/ports', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ports ORDER BY name');
        res.json({ ports: result.rows });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching ports' });
    }
});

// Get all airports
router.get('/airports', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM airports ORDER BY name');
        res.json({ airports: result.rows });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching airports' });
    }
});

// Get all container types
router.get('/container-types', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM container_types ORDER BY name');
        res.json({ containerTypes: result.rows });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching container types' });
    }
});

// Get all commodities
router.get('/commodities', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM commodities ORDER BY name');
        res.json({ commodities: result.rows });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching commodities' });
    }
});

// Get all regions
router.get('/regions', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM regions ORDER BY name');
        res.json({ regions: result.rows });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching regions' });
    }
});

// Get all countries (extracted from ports and airports)
router.get('/countries', auth, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DISTINCT country FROM (
                SELECT country FROM ports
                UNION
                SELECT country FROM airports
            ) AS countries
            ORDER BY country
        `);
        res.json({ countries: result.rows.map(r => r.country) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching countries' });
    }
});

module.exports = router;
