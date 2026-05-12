import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Common/Header';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { format } from 'date-fns';

const PricingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [priceData, setPriceData] = useState({
        price: '',
        currency: 'USD'
    });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        loadShipment();
    }, [id]);

    const loadShipment = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/shipments/${id}`);
            setShipment(response.data);
            if (response.data.price) {
                setPriceData({
                    price: response.data.price,
                    currency: response.data.currency || 'USD'
                });
            }
        } catch (error) {
            console.error('Error loading shipment:', error);
            alert('Error loading shipment details');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePrice = async (e) => {
        e.preventDefault();
        setUpdating(true);

        try {
            await api.put(`/pricing/${id}/price`, priceData);
            alert('Price updated successfully!');
            loadShipment();
        } catch (error) {
            console.error('Error updating price:', error);
            alert('Error updating price: ' + (error.response?.data?.message || 'Unknown error'));
        } finally {
            setUpdating(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            const response = await api.get(`/pricing/${id}/pdf`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `shipment-${shipment.reference_number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Error exporting PDF');
        }
    };

    if (loading) {
        return (
            <div>
                <Header />
                <div className="page-container">
                    <div className="container">
                        <div className="spinner"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!shipment) {
        return null;
    }

    const getShippingTypeLabel = (type) => {
        const types = {
            'SI': 'Sea Import',
            'SE': 'Sea Export',
            'SC': 'Sea Cross Trade',
            'AI': 'Air Import',
            'AE': 'Air Export',
            'CL': 'Custom Logistics'
        };
        return types[type] || type;
    };

    return (
        <div>
            <Header />
            <div className="page-container">
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h1 className="page-title" style={{ marginBottom: 0 }}>
                            Shipment Details
                        </h1>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {shipment.price && (
                                <button
                                    onClick={handleExportPDF}
                                    className="btn btn-primary"
                                >
                                    📄 Export PDF
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="btn btn-secondary"
                            >
                                ← Back
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-2" style={{ gap: '2rem' }}>
                        {/* Shipment Details */}
                        <div className="card">
                            <h3 className="section-title">Reference Information</h3>
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '1.5rem', color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '1rem' }}>
                                    {shipment.reference_number}
                                </div>
                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                    <div>
                                        <strong>Status:</strong>{' '}
                                        <span className={`badge badge-${shipment.status}`}>
                                            {shipment.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <strong>Shipping Type:</strong> {getShippingTypeLabel(shipment.shipping_type)}
                                    </div>
                                    <div>
                                        <strong>Freight Type:</strong> {shipment.freight_type}
                                    </div>
                                    <div>
                                        <strong>Created:</strong> {format(new Date(shipment.created_at), 'dd MMM yyyy HH:mm')}
                                    </div>
                                    <div>
                                        <strong>Created By:</strong> {shipment.created_by_name}
                                    </div>
                                    {shipment.region_name && (
                                        <div>
                                            <strong>Region:</strong> {shipment.region_name}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h3 className="section-title mt-4">Route Information</h3>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                <div>
                                    <strong>From:</strong><br />
                                    {shipment.origin_location}
                                </div>
                                <div>
                                    <strong>To:</strong><br />
                                    {shipment.destination_location}
                                </div>
                                <div>
                                    <strong>Service Mode:</strong> {shipment.service_mode_from} → {shipment.service_mode_to}
                                </div>
                            </div>

                            <h3 className="section-title mt-4">Commodity Details</h3>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                <div>
                                    <strong>Commodity:</strong> {shipment.commodity_name}
                                </div>
                                {shipment.requires_temperature_control && (
                                    <div style={{ color: 'var(--warning)' }}>
                                        ⚠️ Requires Temperature Control
                                    </div>
                                )}
                                {shipment.is_dangerous && (
                                    <div style={{ color: 'var(--danger)' }}>
                                        ⚠️ Dangerous Goods
                                    </div>
                                )}
                            </div>

                            <h3 className="section-title mt-4">Cargo Details</h3>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                {shipment.freight_type === 'FCL' && shipment.container_type_name ? (
                                    <>
                                        <div>
                                            <strong>Container Type:</strong> {shipment.container_type_name}
                                        </div>
                                        <div>
                                            <strong>Number of Containers:</strong> {shipment.number_of_containers}
                                        </div>
                                        <div>
                                            <strong>Weight per Container:</strong> {shipment.weight_per_container} kg
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <strong>Dimensions:</strong> {shipment.length_m} × {shipment.width_m} × {shipment.height_m} m
                                        </div>
                                        <div>
                                            <strong>Gross Weight:</strong> {shipment.gross_weight_kg} kg
                                        </div>
                                        <div>
                                            <strong>Volume:</strong> {(shipment.length_m * shipment.width_m * shipment.height_m).toFixed(2)} m³
                                        </div>
                                    </>
                                )}
                            </div>

                            <h3 className="section-title mt-4">Validity Period</h3>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                <div>
                                    <strong>Effective Date:</strong> {format(new Date(shipment.effective_date), 'dd MMM yyyy')}
                                </div>
                                <div>
                                    <strong>Expiry Date:</strong> {format(new Date(shipment.expiry_date), 'dd MMM yyyy')}
                                </div>
                            </div>

                            {shipment.additional_services_requested && (
                                <>
                                    <h3 className="section-title mt-4">Additional Services</h3>
                                    <div>
                                        {shipment.additional_services_notes || 'Requested'}
                                    </div>
                                </>
                            )}

                            <h3 className="section-title mt-4">Company Information</h3>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                <div>
                                    <strong>Company Name:</strong> {shipment.company_name}
                                </div>
                                <div>
                                    <strong>Country:</strong> {shipment.company_country}
                                </div>
                                <div>
                                    <strong>Email:</strong> {shipment.company_email}
                                </div>
                            </div>
                        </div>

                        {/* Pricing Section */}
                        <div>
                            <div className="card" style={{ 
                                borderTop: '4px solid var(--primary-color)',
                                position: 'sticky',
                                top: '100px'
                            }}>
                                <h3 className="section-title">Pricing Information</h3>

                                {shipment.price ? (
                                    <div>
                                        <div style={{
                                            backgroundColor: 'var(--secondary-color)',
                                            padding: '1.5rem',
                                            borderRadius: '8px',
                                            marginBottom: '1.5rem'
                                        }}>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                                Total Price
                                            </div>
                                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                                {shipment.currency} {parseFloat(shipment.price).toLocaleString('en-US', { 
                                                    minimumFractionDigits: 2, 
                                                    maximumFractionDigits: 2 
                                                })}
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            <div><strong>Priced By:</strong> {shipment.priced_by_name}</div>
                                            <div><strong>Priced At:</strong> {format(new Date(shipment.priced_at), 'dd MMM yyyy HH:mm')}</div>
                                        </div>

                                        <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                                            ✅ This shipment has been priced
                                        </div>
                                    </div>
                                ) : (
                                    <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
                                        ⚠️ This shipment is pending pricing
                                    </div>
                                )}

                                <form onSubmit={handleUpdatePrice}>
                                    <div className="form-group">
                                        <label className="form-label required">Price</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            step="0.01"
                                            min="0"
                                            value={priceData.price}
                                            onChange={(e) => setPriceData({ ...priceData, price: e.target.value })}
                                            required
                                            placeholder="Enter price"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label required">Currency</label>
                                        <select
                                            className="form-select"
                                            value={priceData.currency}
                                            onChange={(e) => setPriceData({ ...priceData, currency: e.target.value })}
                                            required
                                        >
                                            <option value="USD">USD - US Dollar</option>
                                            <option value="EUR">EUR - Euro</option>
                                            <option value="GBP">GBP - British Pound</option>
                                            <option value="AED">AED - UAE Dirham</option>
                                            <option value="CNY">CNY - Chinese Yuan</option>
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-block"
                                        disabled={updating}
                                    >
                                        {updating ? 'Updating...' : (shipment.price ? 'Update Price' : 'Add Price')}
                                    </button>
                                </form>

                                {shipment.price && (
                                    <button
                                        onClick={handleExportPDF}
                                        className="btn btn-secondary btn-block mt-2"
                                    >
                                        📄 Export to PDF
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
