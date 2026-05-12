const pool = require('../config/database');
const { generateShipmentPDF } = require('../utils/pdfGenerator');

const updatePrice = async (req, res) => {
    try {
        const { id } = req.params;
        const { price, currency = 'USD' } = req.body;

        if (!price || price <= 0) {
            return res.status(400).json({ message: 'Valid price is required' });
        }

        // Check access
        const checkResult = await pool.query('SELECT region_id FROM shipments WHERE id = $1', [id]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        if (req.user.role !== 'admin' && checkResult.rows[0].region_id !== req.user.region_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const result = await pool.query(
            `UPDATE shipments 
             SET price = $1, currency = $2, priced_by = $3, priced_at = CURRENT_TIMESTAMP, status = 'priced'
             WHERE id = $4
             RETURNING *`,
            [price, currency, req.user.id, id]
        );

        res.json({
            message: 'Price updated successfully',
            shipment: result.rows[0]
        });
    } catch (error) {
        console.error('Update price error:', error);
        res.status(500).json({ message: 'Error updating price' });
    }
};

const exportPDF = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT s.*, 
                   c.name as commodity_name,
                   ct.name as container_type_name,
                   r.name as region_name
            FROM shipments s
            LEFT JOIN commodities c ON s.commodity_id = c.id
            LEFT JOIN container_types ct ON s.container_type_id = ct.id
            LEFT JOIN regions r ON s.region_id = r.id
            WHERE s.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        const shipment = result.rows[0];

        // Check access
        if (req.user.role !== 'admin' && shipment.region_id !== req.user.region_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const pdfBuffer = await generateShipmentPDF(shipment);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=shipment-${shipment.reference_number}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Export PDF error:', error);
        res.status(500).json({ message: 'Error generating PDF' });
    }
};

module.exports = { updatePrice, exportPDF };
