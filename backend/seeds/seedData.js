const bcrypt = require('bcrypt');

const regions = [
    { name: 'Europe', code: 'EU' },
    { name: 'Asia Pacific', code: 'APAC' },
    { name: 'North America', code: 'NA' },
    { name: 'Middle East', code: 'ME' },
    { name: 'Africa', code: 'AF' },
    { name: 'Latin America', code: 'LATAM' }
];

const ports = [
    { name: 'Port of Rotterdam', code: 'NLRTM', city: 'Rotterdam', country: 'Netherlands', region: 'Europe' },
    { name: 'Port of Antwerp', code: 'BEANR', city: 'Antwerp', country: 'Belgium', region: 'Europe' },
    { name: 'Port of Hamburg', code: 'DEHAM', city: 'Hamburg', country: 'Germany', region: 'Europe' },
    { name: 'Port of Singapore', code: 'SGSIN', city: 'Singapore', country: 'Singapore', region: 'Asia Pacific' },
    { name: 'Port of Shanghai', code: 'CNSHA', city: 'Shanghai', country: 'China', region: 'Asia Pacific' },
    { name: 'Port of Hong Kong', code: 'HKHKG', city: 'Hong Kong', country: 'Hong Kong', region: 'Asia Pacific' },
    { name: 'Port of Shenzhen', code: 'CNSZX', city: 'Shenzhen', country: 'China', region: 'Asia Pacific' },
    { name: 'Port of Busan', code: 'KRPUS', city: 'Busan', country: 'South Korea', region: 'Asia Pacific' },
    { name: 'Port of Ningbo', code: 'CNNGB', city: 'Ningbo', country: 'China', region: 'Asia Pacific' },
    { name: 'Port of Los Angeles', code: 'USLAX', city: 'Los Angeles', country: 'United States', region: 'North America' },
    { name: 'Port of Long Beach', code: 'USLGB', city: 'Long Beach', country: 'United States', region: 'North America' },
    { name: 'Port of New York', code: 'USNYC', city: 'New York', country: 'United States', region: 'North America' },
    { name: 'Port of Savannah', code: 'USSAV', city: 'Savannah', country: 'United States', region: 'North America' },
    { name: 'Port of Dubai', code: 'AEDXB', city: 'Dubai', country: 'United Arab Emirates', region: 'Middle East' },
    { name: 'Port of Jebel Ali', code: 'AEJEA', city: 'Dubai', country: 'United Arab Emirates', region: 'Middle East' },
    { name: 'Port of Felixstowe', code: 'GBFXT', city: 'Felixstowe', country: 'United Kingdom', region: 'Europe' },
    { name: 'Port of Le Havre', code: 'FRLEH', city: 'Le Havre', country: 'France', region: 'Europe' },
    { name: 'Port of Barcelona', code: 'ESBCN', city: 'Barcelona', country: 'Spain', region: 'Europe' },
    { name: 'Port of Piraeus', code: 'GRPIR', city: 'Piraeus', country: 'Greece', region: 'Europe' },
    { name: 'Port of Genoa', code: 'ITGOA', city: 'Genoa', country: 'Italy', region: 'Europe' },
    { name: 'Port of Valencia', code: 'ESVLC', city: 'Valencia', country: 'Spain', region: 'Europe' },
    { name: 'Port of Santos', code: 'BRSSZ', city: 'Santos', country: 'Brazil', region: 'Latin America' },
    { name: 'Port of Manzanillo', code: 'MXZLO', city: 'Manzanillo', country: 'Mexico', region: 'Latin America' },
    { name: 'Port of Tokyo', code: 'JPTYO', city: 'Tokyo', country: 'Japan', region: 'Asia Pacific' },
    { name: 'Port of Yokohama', code: 'JPYOK', city: 'Yokohama', country: 'Japan', region: 'Asia Pacific' },
    { name: 'Port of Melbourne', code: 'AUMEL', city: 'Melbourne', country: 'Australia', region: 'Asia Pacific' },
    { name: 'Port of Sydney', code: 'AUSYD', city: 'Sydney', country: 'Australia', region: 'Asia Pacific' },
    { name: 'Port of Colombo', code: 'LKCMB', city: 'Colombo', country: 'Sri Lanka', region: 'Asia Pacific' },
    { name: 'Port of Mumbai', code: 'INBOM', city: 'Mumbai', country: 'India', region: 'Asia Pacific' },
    { name: 'Port of Chennai', code: 'INMAA', city: 'Chennai', country: 'India', region: 'Asia Pacific' }
];

const airports = [
    { name: 'Amsterdam Airport Schiphol', code: 'AMS', city: 'Amsterdam', country: 'Netherlands', region: 'Europe' },
    { name: 'Frankfurt Airport', code: 'FRA', city: 'Frankfurt', country: 'Germany', region: 'Europe' },
    { name: 'London Heathrow', code: 'LHR', city: 'London', country: 'United Kingdom', region: 'Europe' },
    { name: 'Paris Charles de Gaulle', code: 'CDG', city: 'Paris', country: 'France', region: 'Europe' },
    { name: 'Dubai International', code: 'DXB', city: 'Dubai', country: 'United Arab Emirates', region: 'Middle East' },
    { name: 'Hong Kong International', code: 'HKG', city: 'Hong Kong', country: 'Hong Kong', region: 'Asia Pacific' },
    { name: 'Singapore Changi', code: 'SIN', city: 'Singapore', country: 'Singapore', region: 'Asia Pacific' },
    { name: 'Tokyo Narita', code: 'NRT', city: 'Tokyo', country: 'Japan', region: 'Asia Pacific' },
    { name: 'Seoul Incheon', code: 'ICN', city: 'Seoul', country: 'South Korea', region: 'Asia Pacific' },
    { name: 'Shanghai Pudong', code: 'PVG', city: 'Shanghai', country: 'China', region: 'Asia Pacific' },
    { name: 'Beijing Capital', code: 'PEK', city: 'Beijing', country: 'China', region: 'Asia Pacific' },
    { name: 'Los Angeles International', code: 'LAX', city: 'Los Angeles', country: 'United States', region: 'North America' },
    { name: 'John F. Kennedy International', code: 'JFK', city: 'New York', country: 'United States', region: 'North America' },
    { name: 'Chicago O\'Hare', code: 'ORD', city: 'Chicago', country: 'United States', region: 'North America' },
    { name: 'Miami International', code: 'MIA', city: 'Miami', country: 'United States', region: 'North America' },
    { name: 'Toronto Pearson', code: 'YYZ', city: 'Toronto', country: 'Canada', region: 'North America' },
    { name: 'Mumbai Chhatrapati Shivaji', code: 'BOM', city: 'Mumbai', country: 'India', region: 'Asia Pacific' },
    { name: 'Bangkok Suvarnabhumi', code: 'BKK', city: 'Bangkok', country: 'Thailand', region: 'Asia Pacific' },
    { name: 'Kuala Lumpur International', code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia', region: 'Asia Pacific' },
    { name: 'Sydney Kingsford Smith', code: 'SYD', city: 'Sydney', country: 'Australia', region: 'Asia Pacific' }
];

const containerTypes = [
    { name: '20\' Dry Standard', code: '20DRY', size_feet: 20, type: 'Dry' },
    { name: '40\' Dry Standard', code: '40DRY', size_feet: 40, type: 'Dry' },
    { name: '40\' High Cube', code: '40HC', size_feet: 40, type: 'High Cube' },
    { name: '45\' High Cube', code: '45HC', size_feet: 45, type: 'High Cube' },
    { name: '20\' Reefer', code: '20RF', size_feet: 20, type: 'Reefer' },
    { name: '40\' Reefer', code: '40RF', size_feet: 40, type: 'Reefer' },
    { name: '40\' Reefer High Cube', code: '40RH', size_feet: 40, type: 'Reefer High Cube' },
    { name: '20\' Open Top', code: '20OT', size_feet: 20, type: 'Open Top' },
    { name: '40\' Open Top', code: '40OT', size_feet: 40, type: 'Open Top' },
    { name: '20\' Flat Rack', code: '20FR', size_feet: 20, type: 'Flat Rack' },
    { name: '40\' Flat Rack', code: '40FR', size_feet: 40, type: 'Flat Rack' },
    { name: '20\' Tank', code: '20TK', size_feet: 20, type: 'Tank' },
    { name: '40\' Platform', code: '40PL', size_feet: 40, type: 'Platform' },
    { name: '20\' Insulated', code: '20IN', size_feet: 20, type: 'Insulated' }
];

const commodities = [
    { name: 'General Cargo', code: 'GEN', requires_special_handling: false },
    { name: 'Electronics', code: 'ELEC', requires_special_handling: false },
    { name: 'Automotive', code: 'AUTO', requires_special_handling: false },
    { name: 'Food Products', code: 'FOOD', requires_special_handling: false },
    { 
        name: 'Pharmaceuticals', 
        code: 'PHARM', 
        requires_special_handling: true,
        special_message: 'For all pharmaceuticals please reach out to local sales office'
    },
    { name: 'Chemicals', code: 'CHEM', requires_special_handling: true },
    { name: 'Textiles', code: 'TEXT', requires_special_handling: false },
    { name: 'Machinery', code: 'MACH', requires_special_handling: false },
    { name: 'Dangerous Goods', code: 'DG', requires_special_handling: true },
    { name: 'Perishables', code: 'PERISH', requires_special_handling: true },
    { name: 'Electronics & Technology', code: 'TECH', requires_special_handling: false },
    { name: 'Furniture', code: 'FURN', requires_special_handling: false },
    { name: 'Construction Materials', code: 'CONST', requires_special_handling: false },
    { name: 'Others', code: 'OTHER', requires_special_handling: false }
];

async function seedDatabase(pool) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');

        // Clear existing data
        await client.query('TRUNCATE TABLE shipments, entry_counters, users, regions, ports, airports, container_types, commodities RESTART IDENTITY CASCADE');

        // Insert Regions
        console.log('Seeding regions...');
        for (const region of regions) {
            await client.query(
                'INSERT INTO regions (name, code) VALUES ($1, $2)',
                [region.name, region.code]
            );
        }

        // Insert Ports
        console.log('Seeding ports...');
        for (const port of ports) {
            await client.query(
                'INSERT INTO ports (name, code, city, country, region) VALUES ($1, $2, $3, $4, $5)',
                [port.name, port.code, port.city, port.country, port.region]
            );
        }

        // Insert Airports
        console.log('Seeding airports...');
        for (const airport of airports) {
            await client.query(
                'INSERT INTO airports (name, code, city, country, region) VALUES ($1, $2, $3, $4, $5)',
                [airport.name, airport.code, airport.city, airport.country, airport.region]
            );
        }

        // Insert Container Types
        console.log('Seeding container types...');
        for (const container of containerTypes) {
            await client.query(
                'INSERT INTO container_types (name, code, size_feet, type) VALUES ($1, $2, $3, $4)',
                [container.name, container.code, container.size_feet, container.type]
            );
        }

        // Insert Commodities
        console.log('Seeding commodities...');
        for (const commodity of commodities) {
            await client.query(
                'INSERT INTO commodities (name, code, requires_special_handling, special_message) VALUES ($1, $2, $3, $4)',
                [commodity.name, commodity.code, commodity.requires_special_handling, commodity.special_message || null]
            );
        }

        // Insert Users
        console.log('Seeding users...');
        const hashedAdminPassword = await bcrypt.hash('Admin', 10);
        const hashedRitaPassword = await bcrypt.hash('Rita', 10);

        // Get Europe region ID
        const europeRegion = await client.query('SELECT id FROM regions WHERE code = $1', ['EU']);
        const europeRegionId = europeRegion.rows[0].id;

        await client.query(
            `INSERT INTO users (full_name, username, password, email, role, initials) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            ['Admin User', 'Admin', hashedAdminPassword, 'admin@shipping.com', 'admin', 'AD']
        );

        await client.query(
            `INSERT INTO users (full_name, username, password, email, role, region_id, initials) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            ['Rita Khalifeh', 'Rita', hashedRitaPassword, 'rita@shipping.com', 'user', europeRegionId, 'RK']
        );

        await client.query('COMMIT');
        console.log('✅ Database seeded successfully!');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = { seedDatabase, regions, ports, airports, containerTypes, commodities };
