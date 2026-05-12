const PDFDocument = require('pdfkit');
const moment = require('moment');

async function generateShipmentPDF(shipmentData) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const chunks = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Header
            doc.fontSize(20).fillColor('#003366').text('FREIGHT QUOTE', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(10).fillColor('#666666').text('Shipping & Freight Forwarding', { align: 'center' });
            
            // Line separator
            doc.moveTo(50, doc.y + 10).lineTo(545, doc.y + 10).strokeColor('#003366').stroke();
            doc.moveDown(2);

            // Reference Number (prominent)
            doc.fontSize(12).fillColor('#000000').text('Reference Number:', 50, doc.y);
            doc.fontSize(14).fillColor('#003366').text(shipmentData.reference_number, 200, doc.y - 14, { bold: true });
            doc.moveDown(1.5);

            // Company Information
            doc.fontSize(14).fillColor('#003366').text('Company Information', 50, doc.y);
            doc.moveDown(0.5);
            doc.fontSize(10).fillColor('#000000');
            doc.text(`Company Name: ${shipmentData.company_name}`, 50);
            doc.text(`Country: ${shipmentData.company_country}`, 50);
            doc.text(`Email: ${shipmentData.company_email}`, 50);
            doc.moveDown(1);

            // Shipment Details
            doc.fontSize(14).fillColor('#003366').text('Shipment Details', 50, doc.y);
            doc.moveDown(0.5);
            doc.fontSize(10).fillColor('#000000');
            doc.text(`Shipping Type: ${getShippingTypeName(shipmentData.shipping_type)}`, 50);
            doc.text(`Freight Type: ${shipmentData.freight_type}`, 50);
            doc.text(`Status: ${shipmentData.status.toUpperCase()}`, 50);
            doc.moveDown(1);

            // Route Information
            doc.fontSize(14).fillColor('#003366').text('Route Information', 50, doc.y);
            doc.moveDown(0.5);
            doc.fontSize(10).fillColor('#000000');
            doc.text(`From: ${shipmentData.origin_location}`, 50);
            doc.text(`To: ${shipmentData.destination_location}`, 50);
            doc.text(`Service Mode: ${shipmentData.service_mode_from} to ${shipmentData.service_mode_to}`, 50);
            doc.moveDown(1);

            // Commodity
            doc.fontSize(14).fillColor('#003366').text('Commodity', 50, doc.y);
            doc.moveDown(0.5);
            doc.fontSize(10).fillColor('#000000');
            doc.text(`Type: ${shipmentData.commodity_name}`, 50);
            if (shipmentData.requires_temperature_control) {
                doc.text('⚠ Requires Temperature Control', 50);
            }
            if (shipmentData.is_dangerous) {
                doc.text('⚠ Dangerous Goods', 50);
            }
            doc.moveDown(1);

            // Container/Dimensions
            doc.fontSize(14).fillColor('#003366').text('Cargo Details', 50, doc.y);
            doc.moveDown(0.5);
            doc.fontSize(10).fillColor('#000000');
            
            if (shipmentData.freight_type === 'FCL' && shipmentData.container_type_name) {
                doc.text(`Container Type: ${shipmentData.container_type_name}`, 50);
                doc.text(`Number of Containers: ${shipmentData.number_of_containers}`, 50);
                doc.text(`Weight per Container: ${shipmentData.weight_per_container} kg`, 50);
            } else if (shipmentData.freight_type === 'LCL' || shipmentData.freight_type === 'AIR') {
                doc.text(`Dimensions: ${shipmentData.length_m} × ${shipmentData.width_m} × ${shipmentData.height_m} m`, 50);
                doc.text(`Gross Weight: ${shipmentData.gross_weight_kg} kg`, 50);
            }
            doc.moveDown(1);

            // Dates
            doc.fontSize(14).fillColor('#003366').text('Validity Period', 50, doc.y);
            doc.moveDown(0.5);
            doc.fontSize(10).fillColor('#000000');
            doc.text(`Effective Date: ${moment(shipmentData.effective_date).format('DD MMM YYYY')}`, 50);
            doc.text(`Expiry Date: ${moment(shipmentData.expiry_date).format('DD MMM YYYY')}`, 50);
            doc.moveDown(2);

            // PRICING SECTION (highlighted)
            if (shipmentData.price) {
                doc.rect(50, doc.y, 495, 60).fillAndStroke('#f0f8ff', '#003366');
                doc.fillColor('#000000').fontSize(12).text('TOTAL PRICE', 60, doc.y - 50);
                doc.fontSize(20).fillColor('#003366').text(
                    `${shipmentData.currency} ${parseFloat(shipmentData.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                    60,
                    doc.y - 20
                );
                doc.moveDown(3);
            }

            // Footer
            doc.fontSize(8).fillColor('#666666');
            doc.text('This quote is subject to terms and conditions.', 50, 750, { align: 'center' });
            doc.text(`Generated on: ${moment().format('DD MMM YYYY HH:mm')}`, 50, 765, { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

function getShippingTypeName(code) {
    const types = {
        'SI': 'Sea Import',
        'SE': 'Sea Export',
        'SC': 'Sea Cross Trade',
        'AI': 'Air Import',
        'AE': 'Air Export',
        'CL': 'Custom Logistics'
    };
    return types[code] || code;
}

module.exports = { generateShipmentPDF };
