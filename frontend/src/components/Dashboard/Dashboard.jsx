import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Common/Header';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { format } from 'date-fns';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({ total: 0, pending: 0, priced: 0, approved: 0 });
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        shippingType: '',
        freightType: ''
    });

    useEffect(() => {
        loadDashboardData();
    }, [filters]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, shipmentsRes] = await Promise.all([
                api.get('/shipments/stats'),
                api.get('/shipments', { params: filters })
            ]);

            setStats(statsRes.data);
            setShipments(shipmentsRes.data.shipments);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            'pending': 'badge-pending',
            'priced': 'badge-priced',
            'approved': 'badge-approved',
            'rejected': 'badge-rejected'
        };
        return `badge ${classes[status] || ''}`;
    };

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
                        <h1 className="page-title" style={{ marginBottom: 0 }}>Dashboard</h1>
                        <button
                            onClick={() => navigate('/')}
                            className="btn btn-primary"
                        >
                            + New Shipment
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-4 mb-4">
                        <div className="card" style={{ borderTop: '4px solid var(--primary-color)' }}>
                            <h3 style={{ fontSize: '2rem', color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                                {stats.total}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Total Shipments</p>
                        </div>
                        <div className="card" style={{ borderTop: '4px solid #ffc107' }}>
                            <h3 style={{ fontSize: '2rem', color: '#ffc107', marginBottom: '0.5rem' }}>
                                {stats.pending}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Pending Pricing</p>
                        </div>
                        <div className="card" style={{ borderTop: '4px solid #17a2b8' }}>
                            <h3 style={{ fontSize: '2rem', color: '#17a2b8', marginBottom: '0.5rem' }}>
                                {stats.priced}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Priced</p>
                        </div>
                        <div className="card" style={{ borderTop: '4px solid var(--success)' }}>
                            <h3 style={{ fontSize: '2rem', color: 'var(--success)', marginBottom: '0.5rem' }}>
                                {stats.approved}
                            </h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Approved</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="card mb-4">
                        <h3 className="section-title">Filters</h3>
                        <div className="grid grid-3">
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-select"
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="priced">Priced</option>
                                    <option value="approved">Approved</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Shipping Type</label>
                                <select
                                    className="form-select"
                                    value={filters.shippingType}
                                    onChange={(e) => setFilters({ ...filters, shippingType: e.target.value })}
                                >
                                    <option value="">All Types</option>
                                    <option value="SI">Sea Import</option>
                                    <option value="SE">Sea Export</option>
                                    <option value="SC">Sea Cross Trade</option>
                                    <option value="AI">Air Import</option>
                                    <option value="AE">Air Export</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Freight Type</label>
                                <select
                                    className="form-select"
                                    value={filters.freightType}
                                    onChange={(e) => setFilters({ ...filters, freightType: e.target.value })}
                                >
                                    <option value="">All Freight Types</option>
                                    <option value="FCL">FCL</option>
                                    <option value="LCL">LCL</option>
                                    <option value="OVERSIZED">Oversized</option>
                                    <option value="AIR">Air</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Shipments Table */}
                    <div className="card">
                        <h3 className="section-title">Shipments</h3>
                        {loading ? (
                            <div className="spinner"></div>
                        ) : shipments.length === 0 ? (
                            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                No shipments found
                            </p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Reference</th>
                                            <th>Type</th>
                                            <th>Freight</th>
                                            <th>Route</th>
                                            <th>Company</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Price</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shipments.map((shipment) => (
                                            <tr key={shipment.id}>
                                                <td>
                                                    <strong>{shipment.reference_number}</strong>
                                                </td>
                                                <td>{getShippingTypeLabel(shipment.shipping_type)}</td>
                                                <td>{shipment.freight_type}</td>
                                                <td style={{ fontSize: '0.875rem' }}>
                                                    {shipment.origin_location?.substring(0, 30)}...<br />
                                                    → {shipment.destination_location?.substring(0, 30)}...
                                                </td>
                                                <td>{shipment.company_name}</td>
                                                <td>{format(new Date(shipment.created_at), 'dd MMM yyyy')}</td>
                                                <td>
                                                    <span className={getStatusBadgeClass(shipment.status)}>
                                                        {shipment.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>
                                                    {shipment.price ? (
                                                        <strong>{shipment.currency} {parseFloat(shipment.price).toLocaleString()}</strong>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-secondary)' }}>-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => navigate(`/pricing/${shipment.id}`)}
                                                        className="btn btn-secondary"
                                                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
