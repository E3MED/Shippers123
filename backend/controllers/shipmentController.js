const pool = require('../config/database');
const { generateReferenceNumber } = require('../utils/referenceGenerator');

const createShipment = async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        const {
            shippingType,
            freightType,
            originPortId,
            destinationPortId,
            originAirportId,
            destinationAirportId,
            originLocation,
            destinationLocation,
            serviceModeFrom,
            serviceModeTo,
            commodityId,
            requiresTemperatureControl,
            isDangerous,
            containerTypeId,
            numberOfContainers,
            weightPerContainer,
            length,
            width,
            height,
            grossWeight,
            effectiveDate,
            expiryDate,
            additionalServicesRequested,
            additionalServicesNotes,
            companyName,
            companyCountry,
            companyEmail
        } = req.body;

        // Generate reference number
        const referenceNumber = await generateReferenceNumber(
            shippingType,
            freightType,
            req.user.initials
        );

        // Determine region based on origin location
        let regionId = req.user.region_id;
        if (!regionId && req.user.role === 'admin') {
            // For admin, try to determine region from port/airport
            if (originPortId) {
                const portResult = await client.query('SELECT region FROM ports WHERE id = $1', [originPortId]);
                if (portResult.rows.length > 0) {
                    const regionResult = await client.query('SELECT id FROM regions WHERE name = $1', [portResult.rows[0].region]);
                    if (regionResult.rows.length > 0) {
                        regionId = regionResult.rows[0].id;
                    }
                }
            }
        }

        const result = await client.query(
            `INSERT INTO shipments (
                reference_number, shipping_type, freight_type,
                origin_port_id, destination_port_id, origin_airport_id, destination_airport_id,
                origin_location, destination_location, service_mode_from, service_mode_to,
                commodity_id, requires_temperature_control, is_dangerous,
                container_type_id, number_of_containers, weight_per_container,
                length_m, width_m, height_m, gross_weight_kg,
                effective_date, expiry_date,
                additional_services_requested, additional_services_notes,
                company_name, company_country, company_email,
                created_by, region_id, status
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
            ) RETURNING *`,
            [
                referenceNumber, shippingType, freightType,
                originPortId, destinationPortId, originAirportId, destinationAirportId,
                originLocation, destinationLocation, serviceModeFrom, serviceModeTo,
                commodityId, requiresTemperatureControl, isDangerous,
                containerTypeId, numberOfContainers, weightPerContainer,
                length, width, height, grossWeight,
                effectiveDate, expiryDate,
                additionalServicesRequested, additionalServicesNotes,
                companyName, companyCountry, companyEmail,
                req.user.id, regionId, 'pending'
            ]
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Shipment created successfully',
            shipment: result.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create shipment error:', error);
        res.status(500).json({ message: 'Error creating shipment', error: error.message });
    } finally {
        client.release();
    }
};

const getShipments = async (req, res) => {
    try {
        const { status, shippingType, freightType, startDate, endDate } = req.query;
        
        let query = `
            SELECT s.*, 
                   c.name as commodity_name,
                   ct.name as container_type_name,
                   u.full_name as created_by_name,
                   pu.full_name as priced_by_name,
                   r.name as region_name,
                   op.name as origin_port_name, op.code as origin_port_code,
                   dp.name as destination_port_name, dp.code as destination_port_code,
                   oa.name as origin_airport_name, oa.code as origin_airport_code,
                   da.name as destination_airport_name, da.code as destination_airport_code
            FROM shipments s
            LEFT JOIN commodities c ON s.commodity_id = c.id
            LEFT JOIN container_types ct ON s.container_type_id = ct.id
            LEFT JOIN users u ON s.created_by = u.id
            LEFT JOIN users pu ON s.priced_by = pu.id
            LEFT JOIN regions r ON s.region_id = r.id
            LEFT JOIN ports op ON s.origin_port_id = op.id
            LEFT JOIN ports dp ON s.destination_port_id = dp.id
            LEFT JOIN airports oa ON s.origin_airport_id = oa.id
            LEFT JOIN airports da ON s.destination_airport_id = da.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;

        // Region filter for non-admin users
        if (req.user.role !== 'admin' && req.user.region_id) {
            query += ` AND s.region_id = $${paramCount}`;
            params.push(req.user.region_id);
            paramCount++;
        }

        if (status) {
            query += ` AND s.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (shippingType) {
            query += ` AND s.shipping_type = $${paramCount}`;
            params.push(shippingType);
            paramCount++;
        }

        if (freightType) {
            query += ` AND s.freight_type = $${paramCount}`;
            params.push(freightType);
            paramCount++;
        }

        if (startDate) {
            query += ` AND s.created_at >= $${paramCount}`;
            params.push(startDate);
            paramCount++;
        }

        if (endDate) {
            query += ` AND s.created_at <= $${paramCount}`;
            params.push(endDate);
            paramCount++;
        }

        query += ' ORDER BY s.created_at DESC';

        const result = await pool.query(query, params);

        res.json({
            shipments: result.rows,
            total: result.rows.length
        });
    } catch (error) {
        console.error('Get shipments error:', error);
        res.status(500).json({ message: 'Error fetching shipments' });
    }
};

const getShipmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT s.*, 
                   c.name as commodity_name, c.code as commodity_code,
                   ct.name as container_type_name, ct.code as container_type_code,
                   u.full_name as created_by_name,
                   pu.full_name as priced_by_name,
                   r.name as region_name,
                   op.name as origin_port_name, op.code as origin_port_code, op.city as origin_port_city, op.country as origin_port_country,
                   dp.name as destination_port_name, dp.code as destination_port_code, dp.city as destination_port_city, dp.country as destination_port_country,
                   oa.name as origin_airport_name, oa.code as origin_airport_code, oa.city as origin_airport_city, oa.country as origin_airport_country,
                   da.name as destination_airport_name, da.code as destination_airport_code, da.city as destination_airport_city, da.country as destination_airport_country
            FROM shipments s
            LEFT JOIN commodities c ON s.commodity_id = c.id
            LEFT JOIN container_types ct ON s.container_type_id = ct.id
            LEFT JOIN users u ON s.created_by = u.id
            LEFT JOIN users pu ON s.priced_by = pu.id
            LEFT JOIN regions r ON s.region_id = r.id
            LEFT JOIN ports op ON s.origin_port_id = op.id
            LEFT JOIN ports dp ON s.destination_port_id = dp.id
            LEFT JOIN airports oa ON s.origin_airport_id = oa.id
            LEFT JOIN airports da ON s.destination_airport_id = da.id
            WHERE s.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        const shipment = result.rows[0];

        // Check if user has access to this shipment
        if (req.user.role !== 'admin' && shipment.region_id !== req.user.region_id) {
            return res.status(403).json({ message: 'Access denied to this shipment' });
        }

        res.json(shipment);
    } catch (error) {
        console.error('Get shipment error:', error);
        res.status(500).json({ message: 'Error fetching shipment' });
    }
};

const updateShipment = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Check access
        const checkResult = await pool.query('SELECT region_id FROM shipments WHERE id = $1', [id]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        if (req.user.role !== 'admin' && checkResult.rows[0].region_id !== req.user.region_id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const fields = [];
        const values = [];
        let paramCount = 1;

        Object.keys(updates).forEach(key => {
            fields.push(`${key} = $${paramCount}`);
            values.push(updates[key]);
            paramCount++;
        });

        values.push(id);

        const result = await pool.query(
            `UPDATE shipments SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        res.json({
            message: 'Shipment updated successfully',
            shipment: result.rows[0]
        });
    } catch (error) {
        console.error('Update shipment error:', error);
        res.status(500).json({ message: 'Error updating shipment' });
    }
};

const deleteShipment = async (req, res) => {
    try {
        const { id } = req.params;

        // Only admin can delete
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can delete shipments' });
        }

        await pool.query('DELETE FROM shipments WHERE id = $1', [id]);

        res.json({ message: 'Shipment deleted successfully' });
    } catch (error) {
        console.error('Delete shipment error:', error);
        res.status(500).json({ message: 'Error deleting shipment' });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        let regionFilter = '';
        const params = [];
        
        if (req.user.role !== 'admin' && req.user.region_id) {
            regionFilter = 'WHERE region_id = $1';
            params.push(req.user.region_id);
        }

        const totalResult = await pool.query(`SELECT COUNT(*) as count FROM shipments ${regionFilter}`, params);
        const pendingResult = await pool.query(`SELECT COUNT(*) as count FROM shipments ${regionFilter ? regionFilter + ' AND' : 'WHERE'} status = 'pending'`, params);
        const pricedResult = await pool.query(`SELECT COUNT(*) as count FROM shipments ${regionFilter ? regionFilter + ' AND' : 'WHERE'} status = 'priced'`, params);
        const approvedResult = await pool.query(`SELECT COUNT(*) as count FROM shipments ${regionFilter ? regionFilter + ' AND' : 'WHERE'} status = 'approved'`, params);

        res.json({
            total: parseInt(totalResult.rows[0].count),
            pending: parseInt(pendingResult.rows[0].count),
            priced: parseInt(pricedResult.rows[0].count),
            approved: parseInt(approvedResult.rows[0].count)
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Error fetching dashboard statistics' });
    }
};

module.exports = {
    createShipment,
    getShipments,
    getShipmentById,
    updateShipment,
    deleteShipment,
    getDashboardStats
};
