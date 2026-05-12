import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../Common/Header';
import Autocomplete from '../Common/Autocomplete';
import api from '../../services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const SeaShipping = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const shippingType = searchParams.get('type') || 'SI';

    const [activeTab, setActiveTab] = useState('FCL');
    const [loading, setLoading] = useState(false);
    const [ports, setPorts] = useState([]);
    const [commodities, setCommodities] = useState([]);
    const [containerTypes, setContainerTypes] = useState([]);
    const [countries, setCountries] = useState([]);
    const [specialMessage, setSpecialMessage] = useState('');

    const [formData, setFormData] = useState({
        originPort: null,
        destinationPort: null,
        serviceModeFrom: 'CY',
        serviceModeTo: 'CY',
        commodity: null,
        requiresTemperatureControl: false,
        isDangerous: false,
        containerType: null,
        numberOfContainers: 1,
        weightPerContainer: '',
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
            const [portsRes, commoditiesRes, containerTypesRes, countriesRes] = await Promise.all([
                api.get('/master-data/ports'),
                api.get('/master-data/commodities'),
                api.get('/master-data/container-types'),
                api.get('/master-data/countries')
            ]);

            setPorts(portsRes.data.ports.map(p => ({
                value: p.id,
                label: `${p.name} (${p.code}) - ${p.city}, ${p.country}`,
                data: p
            })));

            setCommodities(commoditiesRes.data.commodities.map(c => ({
                value: c.id,
                label: c.name,
                data: c
            })));

            setContainerTypes(containerTypesRes.data.containerTypes.map(ct => ({
                value: ct.id,
                label: ct.name,
                data: ct
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
                freightType: activeTab,
                originPortId: formData.originPort?.value,
                destinationPortId: formData.destinationPort?.value,
                originLocation: formData.originPort?.label,
                destinationLocation: formData.destinationPort?.label,
                serviceModeFrom: formData.serviceModeFrom,
                serviceModeTo: formData.serviceModeTo,
                commodityId: formData.commodity?.value,
                requiresTemperatureControl: formData.requiresTemperatureControl,
                isDangerous: formData.isDangerous,
                containerTypeId: activeTab === 'FCL' ? formData.containerType?.value : null,
                numberOfContainers: activeTab === 'FCL' ? parseInt(formData.numberOfContainers) : null,
                weightPerContainer: activeTab === 'FCL' ? parseFloat(formData.weightPerContainer) : null,
                length: activeTab !== 'FCL' ? parseFloat(formData.length) : null,
                width: activeTab !== 'FCL' ? parseFloat(formData.width) : null,
                height: activeTab !== 'FCL' ? parseFloat(formData.height) : null,
                grossWeight: activeTab !== 'FCL' ? parseFloat(formData.grossWeight) : null,
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
            'SI': 'Sea Import',
            'SE': 'Sea Export',
            'SC': 'Sea Cross Trade'
        };
        return types[code] || code;
    };

    return (
        <div>
            <Header />
            <div className="page-container">
                <div className="container">
                    <h1 className="page-title">{getShippingTypeName(shippingType)} - Online Quote</h1>

                    {/* Tabs */}
                    <div className="tabs">
                        <button
                            className={`tab ${activeTab === 'FCL' ? 'active' : ''}`}
                            onClick={() => setActiveTab('FCL')}
                        >
                            📦 Standard Containers (FCL)
                        </button>
                        <button
                            className={`tab ${activeTab === 'OVERSIZED' ? 'active' : ''}`}
                            onClick={() => setActiveTab('OVERSIZED')}
                        >
                            📏 Oversized Cargo
                        </button>
                        <button
                            className={`tab ${activeTab === 'LCL' ? 'active' : ''}`}
                            onClick={() => setActiveTab('LCL')}
                        >
                            📊 Less-than-Container Load (LCL)
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="card">
                            {/* Route Section */}
                            <h3 className="section-title">Route</h3>
                            <div className="grid grid-2">
                                <Autocomplete
                                    label="From (City, Country/Region)"
                                    placeholder="Enter city or port"
                                    options={ports}
                                    value={formData.originPort}
                                    onChange={(value) => setFormData({ ...formData, originPort: value })}
                                    required
                                />
                                <Autocomplete
                                    label="To (City, Country/Region)"
                                    placeholder="Enter city or port"
                                    options={ports}
                                    value={formData.destinationPort}
                                    onChange={(value) => setFormData({ ...formData, destinationPort: value })}
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

                            {/* Container/Cargo Details */}
                            {activeTab === 'FCL' ? (
                                <>
                                    <h3 className="section-title mt-4">Containers</h3>
                                    <div className="alert alert-info">
                                        <strong>ℹ️ Please note:</strong> An additional surcharge is applicable if the weight of the cargo exceeds 14500 kg, subject to terminal approval
                                    </div>
                                    <div className="grid grid-3 mt-3">
                                        <Autocomplete
                                            label="Container Type and Size"
                                            placeholder="Type a container i.e. 20 DRY"
                                            options={containerTypes}
                                            value={formData.containerType}
                                            onChange={(value) => setFormData({ ...formData, containerType: value })}
                                            required
                                        />
                                        <div className="form-group">
                                            <label className="form-label required">Number of Containers</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                min="1"
                                                value={formData.numberOfContainers}
                                                onChange={(e) => setFormData({ ...formData, numberOfContainers: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label required">Weight per Container (kg)</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                step="0.01"
                                                placeholder="0"
                                                value={formData.weightPerContainer}
                                                onChange={(e) => setFormData({ ...formData, weightPerContainer: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="section-title mt-4">Dimensions</h3>
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
                                </>
                            )}

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

export default SeaShipping;
