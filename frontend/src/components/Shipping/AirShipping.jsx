import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../Common/Header';
import Autocomplete from '../Common/Autocomplete';
import api from '../../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AirShipping = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const shippingType = searchParams.get('type') || 'AI';

    const [loading, setLoading] = useState(false);
    const [airports, setAirports] = useState([]);
    const [commodities, setCommodities] = useState([]);
    const [countries, setCountries] = useState([]);
    const [specialMessage, setSpecialMessage] = useState('');

    const [formData, setFormData] = useState({
        originAirport: null,
        destinationAirport: null,
        serviceModeFrom: 'CY',
        serviceModeTo: 'CY',
        commodity: null,
        requiresTemperatureControl: false,
        isDangerous: false,
        length: '',
        width: '',
        height: '',
        grossWeight: '',
        effectiveDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        additionalServicesRequested: false,
        additionalServicesNotes: '',
        companyName: '',
        companyCountry: '',
        companyEmail: ''
    });

    useEffect(() => {
        loadMasterData();
    }, []);

    const loadMasterData = async () => {
        try {
            const [airportsRes, commoditiesRes, countriesRes] = await Promise.all([
                api.get('/master-data/airports'),
                api.get('/master-data/commodities'),
                api.get('/master-data/countries')
            ]);

            setAirports(airportsRes.data.airports.map(a => ({
                value: a.id,
                label: `${a.name} (${a.code}) - ${a.city}, ${a.country}`,
                data: a
            })));

            setCommodities(commoditiesRes.data.commodities.map(c => ({
                value: c.id,
                label: c.name,
                data: c
            })));

            setCountries(countriesRes.data.countries.map(c => ({
                value: c,
                label: c
            })));
        } catch (error) {
            console.error('Error loading master data:', error);
        }
    };

    const handleCommodityChange = (commodity) => {
        setFormData({ ...formData, commodity });
        
        if (commodity?.data?.requires_special_handling && commodity?.data?.special_message) {
            setSpecialMessage(commodity.data.special_message);
        } else {
            setSpecialMessage('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                shippingType,
                freightType: 'AIR',
                originAirportId: formData.originAirport?.value,
                destinationAirportId: formData.destinationAirport?.value,
                originLocation: formData.originAirport?.label,
                destinationLocation: formData.destinationAirport?.label,
                serviceModeFrom: formData.serviceModeFrom,
                serviceModeTo: formData.serviceModeTo,
                commodityId: formData.commodity?.value,
                requiresTemperatureControl: formData.requiresTemperatureControl,
                isDangerous: formData.isDangerous,
                length: parseFloat(formData.length),
                width: parseFloat(formData.width),
                height: parseFloat(formData.height),
                grossWeight: parseFloat(formData.grossWeight),
                effectiveDate: formData.effectiveDate.toISOString().split('T')[0],
                expiryDate: formData.expiryDate.toISOString().split('T')[0],
                additionalServicesRequested: formData.additionalServicesRequested,
                additionalServicesNotes: formData.additionalServicesNotes,
                companyName: formData.companyName,
                companyCountry: formData.companyCountry,
                companyEmail: formData.companyEmail
            };

            const response = await api.post('/shipments', payload);
            
            alert(`Shipment created successfully!\nReference: ${response.data.shipment.reference_number}`);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error creating shipment:', error);
            alert('Error creating shipment: ' + (error.response?.data?.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const getShippingTypeName = (code) => {
        const types = {
            'AI': 'Air Import',
            'AE': 'Air Export'
        };
        return types[code] || code;
    };

    return (
        <div>
            <Header />
            <div className="page-container">
                <div className="container">
                    <h1 className="page-title">{getShippingTypeName(shippingType)} - Online Quote</h1>

                    <form onSubmit={handleSubmit}>
                        <div className="card">
                            {/* Route Section */}
                            <h3 className="section-title">Route</h3>
                            <div className="grid grid-2">
                                <Autocomplete
                                    label="From (Airport)"
                                    placeholder="Enter airport"
                                    options={airports}
                                    value={formData.originAirport}
                                    onChange={(value) => setFormData({ ...formData, originAirport: value })}
                                    required
                                />
                                <Autocomplete
                                    label="To (Airport)"
                                    placeholder="Enter airport"
                                    options={airports}
                                    value={formData.destinationAirport}
                                    onChange={(value) => setFormData({ ...formData, destinationAirport: value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-2 mt-3">
                                <div className="form-group">
                                    <label className="form-label">Service Mode (From)</label>
                                    <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                                        <label>
                                            <input
                                                type="radio"
                                                name="serviceModeFrom"
                                                value="CY"
                                                checked={formData.serviceModeFrom === 'CY'}
                                                onChange={(e) => setFormData({ ...formData, serviceModeFrom: e.target.value })}
                                            />
                                            {' '}Container Yard (CY)
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="serviceModeFrom"
                                                value="SD"
                                                checked={formData.serviceModeFrom === 'SD'}
                                                onChange={(e) => setFormData({ ...formData, serviceModeFrom: e.target.value })}
                                            />
                                            {' '}Store Door (SD)
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Service Mode (To)</label>
                                    <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                                        <label>
                                            <input
                                                type="radio"
                                                name="serviceModeTo"
                                                value="CY"
                                                checked={formData.serviceModeTo === 'CY'}
                                                onChange={(e) => setFormData({ ...formData, serviceModeTo: e.target.value })}
                                            />
                                            {' '}Container Yard (CY)
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="serviceModeTo"
                                                value="SD"
                                                checked={formData.serviceModeTo === 'SD'}
                                                onChange={(e) => setFormData({ ...formData, serviceModeTo: e.target.value })}
                                            />
                                            {' '}Store Door (SD)
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Commodity Section */}
                            <h3 className="section-title mt-4">Commodity</h3>
                            <Autocomplete
                                label="Commodity Type"
                                placeholder="Select commodity"
                                options={commodities}
                                value={formData.commodity}
                                onChange={handleCommodityChange}
                                required
                            />

                            {specialMessage && (
                                <div className="alert alert-info mt-2">
                                    ℹ️ {specialMessage}
                                </div>
                            )}

                            <div className="grid grid-2 mt-3">
                                <div className="form-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            checked={formData.requiresTemperatureControl}
                                            onChange={(e) => setFormData({ ...formData, requiresTemperatureControl: e.target.checked })}
                                        />
                                        Requires temperature control
                                    </label>
                                </div>
                                <div className="form-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            className="form-checkbox"
                                            checked={formData.isDangerous}
                                            onChange={(e) => setFormData({ ...formData, isDangerous: e.target.checked })}
                                        />
                                        Considered dangerous
                                    </label>
                                </div>
                            </div>

                            {/* Dimensions */}
                            <h3 className="section-title mt-4">Cargo Dimensions</h3>
                            <div className="grid grid-2 mt-3">
                                <div className="form-group">
                                    <label className="form-label required">Length (m)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        step="0.01"
                                        value={formData.length}
                                        onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label required">Width (m)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        step="0.01"
                                        value={formData.width}
                                        onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label required">Height (m)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        step="0.01"
                                        value={formData.height}
                                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label required">Gross Weight (kg)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        step="0.01"
                                        value={formData.grossWeight}
                                        onChange={(e) => setFormData({ ...formData, grossWeight: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Dates */}
                            <h3 className="section-title mt-4">Dates</h3>
                            <div className="grid grid-2">
                                <div className="form-group">
                                    <label className="form-label required">Effective Date</label>
                                    <DatePicker
                                        selected={formData.effectiveDate}
                                        onChange={(date) => setFormData({ ...formData, effectiveDate: date })}
                                        className="form-input"
                                        dateFormat="dd MMM yyyy"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label required">Expiry Date</label>
                                    <DatePicker
                                        selected={formData.expiryDate}
                                        onChange={(date) => setFormData({ ...formData, expiryDate: date })}
                                        className="form-input"
                                        dateFormat="dd MMM yyyy"
                                        minDate={formData.effectiveDate}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Additional Services */}
                            <h3 className="section-title mt-4">Additional Services</h3>
                            <div className="form-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        className="form-checkbox"
                                        checked={formData.additionalServicesRequested}
                                        onChange={(e) => setFormData({ ...formData, additionalServicesRequested: e.target.checked })}
                                    />
                                    Request additional services
                                </label>
                            </div>
                            {formData.additionalServicesRequested && (
                                <div className="form-group">
                                    <label className="form-label">Service Details</label>
                                    <textarea
                                        className="form-textarea"
                                        placeholder="Describe additional services required..."
                                        value={formData.additionalServicesNotes}
                                        onChange={(e) => setFormData({ ...formData, additionalServicesNotes: e.target.value })}
                                    />
                                </div>
                            )}

                            {/* Company Details */}
                            <h3 className="section-title mt-4">Company Details</h3>
                            <div className="grid grid-2">
                                <div className="form-group">
                                    <label className="form-label required">Company Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        required
                                    />
                                </div>
                                <Autocomplete
                                    label="Country"
                                    placeholder="Select country"
                                    options={countries}
                                    value={formData.companyCountry ? { value: formData.companyCountry, label: formData.companyCountry } : null}
                                    onChange={(value) => setFormData({ ...formData, companyCountry: value?.label || '' })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label required">Company Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={formData.companyEmail}
                                    onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Submit Buttons */}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-large"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Entry'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-large"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AirShipping;
