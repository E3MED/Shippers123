const pool = require('../config/database');

/**
 * Generate reference number in format: [ShippingType][FreightType][UserInitials][YY][M][DD][EntryNumberOfDay]
 * Example: SIFCLRK265121
 */
async function generateReferenceNumber(shippingType, freightType, userInitials) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        const now = new Date();
        const year = now.getFullYear().toString().slice(-2); // Last 2 digits
        const month = now.getMonth() + 1; // 1-12
        const day = now.getDate();
        const todayDate = now.toISOString().split('T')[0];

        // Get or create counter for today
        let counterResult = await client.query(
            'SELECT counter_value FROM entry_counters WHERE counter_date = $1',
            [todayDate]
        );

        let counterValue;
        if (counterResult.rows.length === 0) {
            // Create new counter for today
            counterValue = 1;
            await client.query(
                'INSERT INTO entry_counters (counter_date, counter_value) VALUES ($1, $2)',
                [todayDate, counterValue]
            );
        } else {
            // Increment existing counter
            counterValue = counterResult.rows[0].counter_value + 1;
            await client.query(
                'UPDATE entry_counters SET counter_value = $1 WHERE counter_date = $2',
                [counterValue, todayDate]
            );
        }

        await client.query('COMMIT');

        // Build reference number
        const reference = `${shippingType}${freightType}${userInitials}${year}${month}${day}${counterValue}`;
        
        return reference;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

module.exports = { generateReferenceNumber };
