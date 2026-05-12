-- Create Database
CREATE DATABASE shipping_freight_db;

\c shipping_freight_db;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Regions Table
CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    region_id INTEGER REFERENCES regions(id),
    initials VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ports Table
CREATE TABLE ports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    region VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Airports Table
CREATE TABLE airports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    city VARCHAR(100),
    country VARCHAR(100),
    region VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Container Types Table
CREATE TABLE container_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    size_feet INTEGER,
    type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Commodities Table
CREATE TABLE commodities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    requires_special_handling BOOLEAN DEFAULT false,
    special_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shipments Table
CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    shipping_type VARCHAR(10) NOT NULL CHECK (shipping_type IN ('SI', 'SE', 'SC', 'AI', 'AE', 'CL')),
    freight_type VARCHAR(20) NOT NULL CHECK (freight_type IN ('FCL', 'LCL', 'OVERSIZED', 'AIR')),
    
    -- Route Information
    origin_port_id INTEGER REFERENCES ports(id),
    destination_port_id INTEGER REFERENCES ports(id),
    origin_airport_id INTEGER REFERENCES airports(id),
    destination_airport_id INTEGER REFERENCES airports(id),
    origin_location VARCHAR(255),
    destination_location VARCHAR(255),
    service_mode_from VARCHAR(10) CHECK (service_mode_from IN ('CY', 'SD')),
    service_mode_to VARCHAR(10) CHECK (service_mode_to IN ('CY', 'SD')),
    
    -- Commodity Information
    commodity_id INTEGER REFERENCES commodities(id),
    requires_temperature_control BOOLEAN DEFAULT false,
    is_dangerous BOOLEAN DEFAULT false,
    
    -- Container Information (for FCL)
    container_type_id INTEGER REFERENCES container_types(id),
    number_of_containers INTEGER,
    weight_per_container DECIMAL(10, 2),
    
    -- Dimensions (for LCL and Air)
    length_m DECIMAL(10, 2),
    width_m DECIMAL(10, 2),
    height_m DECIMAL(10, 2),
    gross_weight_kg DECIMAL(10, 2),
    
    -- Dates
    effective_date DATE,
    expiry_date DATE,
    
    -- Additional Services
    additional_services_requested BOOLEAN DEFAULT false,
    additional_services_notes TEXT,
    
    -- Company Details
    company_name VARCHAR(255) NOT NULL,
    company_country VARCHAR(100),
    company_email VARCHAR(255),
    
    -- Pricing
    price DECIMAL(12, 2),
    currency VARCHAR(10) DEFAULT 'USD',
    priced_by INTEGER REFERENCES users(id),
    priced_at TIMESTAMP,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'priced', 'approved', 'rejected')),
    
    -- Metadata
    created_by INTEGER REFERENCES users(id) NOT NULL,
    region_id INTEGER REFERENCES regions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Entry Counter Table (for reference number generation)
CREATE TABLE entry_counters (
    id SERIAL PRIMARY KEY,
    counter_date DATE UNIQUE NOT NULL,
    counter_value INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_shipments_reference ON shipments(reference_number);
CREATE INDEX idx_shipments_created_by ON shipments(created_by);
CREATE INDEX idx_shipments_region ON shipments(region_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_shipping_type ON shipments(shipping_type);
CREATE INDEX idx_ports_code ON ports(code);
CREATE INDEX idx_airports_code ON airports(code);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
