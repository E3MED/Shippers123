# Shipping & Freight Forwarding Application

A complete full-stack web application for managing shipping and freight forwarding operations with support for Sea (FCL/LCL/Oversized) and Air freight.

## 🚀 Features

### Core Functionality
- **Multi-modal Shipping Support**: Sea Import/Export/Cross-trade, Air Import/Export, Custom Logistics
- **Freight Types**: FCL (Full Container Load), LCL (Less than Container Load), Oversized Cargo, Air Freight
- **Automated Reference Generation**: Smart reference numbers with format `[Type][Freight][Initials][Date][Counter]`
- **Role-Based Access Control**: Admin and User roles with region-based permissions
- **Pricing Management**: Add and update pricing with multi-currency support
- **PDF Export**: Professional shipment quotation PDF generation

### User Features
- Dashboard with statistics and filters
- Real-time shipment tracking
- Region-specific access (users see only their region's shipments)
- Comprehensive shipment form with validation
- PDF export for priced shipments

### Admin Features
- User management (create, edit, deactivate, delete)
- Region assignment
- Full access to all shipments across regions
- System overview and statistics

## 🛠️ Technology Stack

**Frontend:**
- React.js 18
- React Router v6
- Axios for API calls
- React DatePicker
- CSS3 (Custom styling inspired by Maersk)

**Backend:**
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- PDFKit for PDF generation
- Bcrypt for password hashing

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd shipping-freight-app
